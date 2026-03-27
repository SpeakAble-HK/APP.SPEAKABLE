import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { station2Phonemes, type LessonLevel, type Station2Phoneme } from "@/data/bilabialLessons";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import type { BilabialPhonemeKey } from "@/components/bilabial/bilabialTypes";
import { MatchingGame, type MatchingOption } from "@/components/bilabial/MatchingGame";
import { RecordingModule } from "@/components/bilabial/RecordingModule";
import { AIFeedbackModule } from "@/components/bilabial/AIFeedbackModule";
import { speakWithClonedVoice } from "@/components/bilabial/clonedVoiceTTS";
import {
  computeAccuracyFromResult,
  matchingWrongMessage,
  phonemeLabelToKey,
} from "@/components/bilabial/bilabialUtils";
import { BilabialGameHUD } from "@/components/bilabial/BilabialGameHUD";
import { BILABIAL_TARGET_COUNT, useBilabialGameSession } from "@/components/bilabial/useBilabialGameSession";
import { SPEECH_PASS_ACCURACY_THRESHOLD } from "@/lib/speechExerciseRules";
import pipi from "@/assets/pipi-parrot-only.png";

interface BilabialStation2Props {
  onComplete: () => void;
  onBack: () => void;
}

type MetaPhase = "select-phoneme" | "select-level" | "run";
type ItemPhase = "perception" | "perception_wrong" | "production" | "ai_eval" | "prod_feedback";

interface WrappedOpt {
  id: string;
  word: string;
  image: string;
  ownerKey: BilabialPhonemeKey;
}

function buildOptions(sp: Station2Phoneme, level: LessonLevel, itemIdx: number): WrappedOpt[] {
  const correctItem = level.items[itemIdx];
  const correctKey = phonemeLabelToKey(sp.phoneme);
  const correct: WrappedOpt = {
    id: `ok-${correctItem.word}-${itemIdx}`,
    word: correctItem.word,
    image: correctItem.image || "❓",
    ownerKey: correctKey,
  };

  const pool: WrappedOpt[] = station2Phonemes.flatMap((p) =>
    p.levels.flatMap((l) =>
      l.items.map((it) => ({
        id: `${p.phoneme}-${it.word}-${Math.random()}`,
        word: it.word,
        image: it.image || "❓",
        ownerKey: phonemeLabelToKey(p.phoneme),
      }))
    )
  ).filter((o) => o.word !== correctItem.word);

  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
  return [correct, ...shuffled].sort(() => Math.random() - 0.5);
}

export function BilabialStation2({ onComplete, onBack }: BilabialStation2Props) {
  const { processRecording, isProcessing } = usePronunciationAPI();
  const game = useBilabialGameSession();

  const [meta, setMeta] = useState<MetaPhase>("select-phoneme");
  const [sp, setSp] = useState<Station2Phoneme | null>(null);
  const [level, setLevel] = useState<LessonLevel | null>(null);
  const [itemIdx, setItemIdx] = useState(0);

  const [itemPhase, setItemPhase] = useState<ItemPhase>("perception");
  const [wrapped, setWrapped] = useState<WrappedOpt[]>([]);
  const [listenDone, setListenDone] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [wrongMsg, setWrongMsg] = useState("");

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [prodAcc, setProdAcc] = useState(0);
  const [prodOk, setProdOk] = useState(false);
  const [prodHint, setProdHint] = useState("");
  const [rewardLine, setRewardLine] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const [reachTarget, setReachTarget] = useState(false);
  const [gameEnd, setGameEnd] = useState(false);
  const [failClone, setFailClone] = useState<string | null>(null);
  const [failUser, setFailUser] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const targetWord = sp && level ? level.items[itemIdx]?.word ?? "" : "";

  const matchingOptions: MatchingOption[] = useMemo(
    () => wrapped.map((w) => ({ id: w.id, image: w.image, word: w.word })),
    [wrapped]
  );

  const expectedKey = sp ? phonemeLabelToKey(sp.phoneme) : null;

  const bump = () => setTimerKey((k) => k + 1);

  const startLevel = (phoneme: Station2Phoneme, lv: LessonLevel) => {
    setSp(phoneme);
    setLevel(lv);
    setItemIdx(0);
    setMeta("run");
    loadItem(phoneme, lv, 0);
    bump();
  };

  const loadItem = (phoneme: Station2Phoneme, lv: LessonLevel, idx: number) => {
    setWrapped(buildOptions(phoneme, lv, idx));
    setItemPhase("perception");
    setListenDone(false);
    setWrongId(null);
    setWrongMsg("");
    setAudioBlob(null);
    bump();
  };

  const playTarget = async () => {
    if (!targetWord) return;
    await speakWithClonedVoice(targetWord);
    setListenDone(true);
  };

  const onPick = (id: string) => {
    if (!expectedKey || !sp) return;
    const choice = wrapped.find((w) => w.id === id);
    if (!choice) return;
    if (choice.word === targetWord) {
      setItemPhase("production");
      setAudioBlob(null);
      bump();
      return;
    }
    game.registerWrong();
    setWrongId(id);
    const sameFamily = choice.ownerKey === expectedKey;
    setWrongMsg(
      sameFamily ? "選錯圖片，請再聽一次。" : matchingWrongMessage(expectedKey, choice.ownerKey)
    );
    setItemPhase("perception_wrong");
  };

  const retryPerception = () => {
    setListenDone(false);
    setWrongId(null);
    setItemPhase("perception");
    bump();
  };

  const runProdEval = async () => {
    if (!audioBlob || !targetWord || !sp || !level) return;
    setFailClone(null);
    setFailUser((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
    setItemPhase("ai_eval");
    const result = await processRecording(audioBlob, targetWord);
    if (!result) {
      setItemPhase("production");
      return;
    }
    const acc = computeAccuracyFromResult(result.intended, result.spoken);
    setProdAcc(acc);
    const ok = acc >= SPEECH_PASS_ACCURACY_THRESHOLD;
    setProdOk(ok);
    setRewardLine("");
    if (ok) {
      const { newScore, coinReward } = game.registerCorrect();
      setReachTarget(newScore >= BILABIAL_TARGET_COUNT);
      setProdHint("讀得很好！");
      setRewardLine(`+${coinReward} 金幣　+1 ⭐（${newScore}/${BILABIAL_TARGET_COUNT}）`);
    } else {
      game.registerWrong();
      setProdHint("請留意聲母。");
      if (result.clone?.audio_base64) {
        const ct = result.clone.content_type || "audio/wav";
        setFailClone(`data:${ct};base64,${result.clone.audio_base64}`);
      }
      setFailUser(URL.createObjectURL(audioBlob));
    }
    setItemPhase("prod_feedback");
  };

  const repeatSameTask = () => {
    if (!sp || !level) return;
    loadItem(sp, level, itemIdx);
  };

  const afterProdSuccess = () => {
    if (reachTarget) {
      setGameEnd(true);
      setReachTarget(false);
      return;
    }
    repeatSameTask();
  };

  if (gameEnd) {
    return (
      <div className="min-h-full bg-background pb-28">
        <div className="mx-auto max-w-lg px-4 py-10 text-center">
          <p className="font-headline text-2xl font-extrabold text-foreground">完成！</p>
          <p className="mt-4 text-4xl" aria-hidden>
            ⭐⭐⭐⭐⭐
          </p>
          <p className="mt-2 text-sm font-bold text-muted-foreground">
            {BILABIAL_TARGET_COUNT} / {BILABIAL_TARGET_COUNT}
          </p>
          <p className="mt-4 text-lg font-extrabold text-amber-700">🪙 本次獲得 {game.sessionCoins} 金幣</p>
          <button
            type="button"
            onClick={() => {
              game.resetProgress();
              onComplete();
            }}
            className="mt-10 min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline font-extrabold text-primary-foreground"
          >
            繼續
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background pb-28">
      <div className="mx-auto max-w-lg px-4 py-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <MaterialIcon icon="arrow_back" className="text-lg" /> 返回
        </button>

        {!game.introDone && (
          <div className="mb-4 space-y-4 rounded-3xl border-2 border-primary/30 bg-card p-6 text-center">
            <p className="text-sm font-bold text-foreground">今日任務：完成 {BILABIAL_TARGET_COUNT} 次正確發音</p>
            <p className="font-headline text-lg font-extrabold text-primary">
              0 / {BILABIAL_TARGET_COUNT} ⭐
            </p>
            <button
              type="button"
              onClick={game.startSession}
              className="min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline font-extrabold text-primary-foreground"
            >
              開始
            </button>
          </div>
        )}

        {game.introDone && meta !== "run" && (
          <BilabialGameHUD
            score={game.score}
            target={game.targetCount}
            sessionCoins={game.sessionCoins}
            pipCelebrate={game.pipCelebrate}
          />
        )}

        {game.introDone && (
          <>
            <div className="mb-4 text-center">
              <p className="text-xs font-bold text-primary">雙唇海灘 · 第二站</p>
              <h1 className="font-headline text-xl font-extrabold text-foreground">單字配對大進擊</h1>
            </div>

            {meta === "select-phoneme" && (
              <div className="space-y-3">
                <p className="text-center text-sm font-bold">選擇聲母</p>
                {station2Phonemes.map((p) => (
                  <button
                    key={p.phoneme}
                    type="button"
                    onClick={() => {
                      setSp(p);
                      setMeta("select-level");
                    }}
                    className="flex min-h-[56px] w-full items-center justify-between rounded-2xl border-2 border-border bg-card px-4 py-3 font-headline font-extrabold"
                  >
                    {p.phoneme} {p.label}
                    <MaterialIcon icon="chevron_right" />
                  </button>
                ))}
              </div>
            )}

            {meta === "select-level" && sp && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setMeta("select-phoneme")}
                  className="text-sm font-bold text-primary"
                >
                  ← 重新選擇聲母
                </button>
                <p className="text-center text-sm font-bold">選擇級別</p>
                {sp.levels.map((lv) => (
                  <button
                    key={lv.level}
                    type="button"
                    onClick={() => startLevel(sp, lv)}
                    className="w-full min-h-[56px] rounded-2xl border-2 border-primary/30 bg-primary/5 px-4 py-3 text-left font-headline font-extrabold"
                  >
                    {lv.levelLabel} · 同一題練 {BILABIAL_TARGET_COUNT} 次
                  </button>
                ))}
              </div>
            )}

            {meta === "run" && sp && level && (
              <div className="space-y-4">
                <BilabialGameHUD
                  score={game.score}
                  target={game.targetCount}
                  sessionCoins={game.sessionCoins}
                  pipCelebrate={game.pipCelebrate}
                />
                <div className="flex items-start gap-2 rounded-2xl border border-primary/20 bg-card p-3">
                  <img src={pipi} alt="" className="h-12 w-12 shrink-0 object-contain" />
                  <p className="text-sm font-bold text-foreground">{level.prompt}</p>
                </div>
                <p className="text-center text-xs font-bold text-muted-foreground">
                  題目 {itemIdx + 1} · {level.levelLabel}
                </p>

                {itemPhase === "perception" && (
                  <>
                    <MatchingGame
                      options={matchingOptions}
                      targetWord={targetWord}
                      onPlaySound={() => void playTarget()}
                      onSelectImage={onPick}
                      canSelect
                      listenDone={listenDone}
                      wrongId={wrongId}
                    />
                    {!listenDone && (
                      <p className="text-center text-xs font-bold text-amber-700">先按「播放」</p>
                    )}
                  </>
                )}

                {itemPhase === "perception_wrong" && (
                  <div className="space-y-4 rounded-3xl border-2 border-amber-500/40 bg-amber-500/10 p-5">
                    <p className="text-center text-sm font-medium">{wrongMsg}</p>
                    <button
                      type="button"
                      onClick={retryPerception}
                      className="min-h-[52px] w-full rounded-2xl bg-primary py-3 font-headline font-extrabold text-primary-foreground"
                    >
                      再聽一次
                    </button>
                  </div>
                )}

                {itemPhase === "production" && (
                  <div className="space-y-4 rounded-3xl border-2 border-secondary/30 bg-card p-5">
                    <p className="text-center font-headline text-lg font-extrabold text-primary">換你讀一次</p>
                    <p className="text-center text-2xl font-extrabold text-foreground">{targetWord}</p>
                    <RecordingModule
                      key={`${itemIdx}-p-${timerKey}`}
                      onRecorded={(b) => setAudioBlob(b)}
                      onClear={() => setAudioBlob(null)}
                    />
                    <button
                      type="button"
                      disabled={!audioBlob || isProcessing}
                      onClick={() => void runProdEval()}
                      className="min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline font-extrabold text-primary-foreground disabled:opacity-40"
                    >
                      交給 AI 評分
                    </button>
                  </div>
                )}

                {itemPhase === "ai_eval" && (
                  <div className="flex flex-col items-center py-16">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="mt-4 font-bold">評估中⋯</p>
                  </div>
                )}

                {itemPhase === "prod_feedback" && (
                  <AIFeedbackModule
                    variant={prodOk ? "success" : "retry"}
                    title={prodOk ? "讀得很好！" : "再試"}
                    message={prodHint}
                    accuracy={prodOk ? undefined : prodAcc}
                    rewardLine={prodOk ? rewardLine : undefined}
                    compareCloneUrl={prodOk ? undefined : failClone}
                    compareUserUrl={prodOk ? undefined : failUser}
                    animation={prodOk ? "clap" : "none"}
                    primaryLabel={prodOk ? (reachTarget ? "查看成績" : "再來一次") : "再錄音"}
                    onPrimary={
                      prodOk
                        ? afterProdSuccess
                        : () => {
                            setFailClone(null);
                            setFailUser((u) => {
                              if (u) URL.revokeObjectURL(u);
                              return null;
                            });
                            setItemPhase("production");
                            setAudioBlob(null);
                            bump();
                          }
                    }
                    secondaryLabel={prodOk ? undefined : "重新聽音選圖"}
                    onSecondary={prodOk ? undefined : repeatSameTask}
                  />
                )}
              </div>
            )}

            {meta === "select-level" && sp && (
              <button
                type="button"
                onClick={() => {
                  setSp(null);
                  setMeta("select-phoneme");
                }}
                className="mt-6 w-full text-sm font-bold text-primary"
              >
                ← 重新選擇聲母
              </button>
            )}

            {(meta === "select-phoneme" || meta === "select-level") && (
              <button
                type="button"
                onClick={() => {
                  game.resetProgress();
                  onComplete();
                }}
                className="mt-8 w-full min-h-[48px] rounded-xl border-2 border-border py-3 text-sm font-bold"
              >
                完成離開
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
