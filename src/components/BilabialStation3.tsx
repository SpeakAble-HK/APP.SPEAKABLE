import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { station3Items, type Station3Item } from "@/data/bilabialLessons";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import type { BilabialPhonemeKey } from "@/components/bilabial/bilabialTypes";
import { PHONEME_OPTIONS } from "@/components/bilabial/bilabialTypes";
import { DragDropGame } from "@/components/bilabial/DragDropGame";
import { RecordingModule } from "@/components/bilabial/RecordingModule";
import { speakWithClonedVoice } from "@/components/bilabial/clonedVoiceTTS";
import { computeAccuracyFromResult } from "@/components/bilabial/bilabialUtils";
import { AIFeedbackModule } from "@/components/bilabial/AIFeedbackModule";
import { BilabialGameHUD } from "@/components/bilabial/BilabialGameHUD";
import { BILABIAL_TARGET_COUNT, useBilabialGameSession } from "@/components/bilabial/useBilabialGameSession";
import { SPEECH_PASS_ACCURACY_THRESHOLD } from "@/lib/speechExerciseRules";
import pipi from "@/assets/pipi-parrot-only.png";

interface BilabialStation3Props {
  onComplete: () => void;
  onBack: () => void;
}

type Phase =
  | "idle"
  | "listen"
  | "classify"
  | "class_wrong"
  | "production"
  | "ai_eval"
  | "feedback";

function shellHintText(correct: BilabialPhonemeKey): string {
  if (correct === "p") return "試著強力噴氣";
  if (correct === "b") return "試著輕輕彈開，不要噴氣";
  return "試著用鼻子發聲";
}

export function BilabialStation3({ onComplete, onBack }: BilabialStation3Props) {
  const { processRecording, isProcessing } = usePronunciationAPI();
  const game = useBilabialGameSession();

  const item: Station3Item = useMemo(() => {
    const pool = [...station3Items];
    return pool[Math.floor(Math.random() * pool.length)]!;
  }, []);

  const [phase, setPhase] = useState<Phase>("idle");
  const [listenDone, setListenDone] = useState(false);
  const [wrongHint, setWrongHint] = useState("");
  const [gold, setGold] = useState<Record<BilabialPhonemeKey, boolean>>({
    b: false,
    p: false,
    m: false,
  });

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [cloneUrl, setCloneUrl] = useState<string | null>(null);
  const [acc, setAcc] = useState(0);
  const [prodOk, setProdOk] = useState(false);
  const [rewardLine, setRewardLine] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const [reachTarget, setReachTarget] = useState(false);
  const [gameEnd, setGameEnd] = useState(false);

  const bump = () => setTimerKey((k) => k + 1);

  const playCue = async () => {
    await speakWithClonedVoice(item.displayPrompt);
    setListenDone(true);
  };

  const startFlow = () => {
    setPhase("listen");
    setListenDone(false);
    bump();
    void playCue();
  };

  const onDropShell = (key: BilabialPhonemeKey) => {
    if (phase !== "classify") return;
    if (key === item.shell) {
      setPhase("production");
      setAudioBlob(null);
      setUserAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      bump();
      return;
    }
    game.registerWrong();
    setWrongHint(shellHintText(item.shell));
    setPhase("class_wrong");
  };

  const retryClassify = () => {
    setPhase("classify");
    bump();
  };

  const runEval = async () => {
    if (!audioBlob) return;
    setCloneUrl(null);
    setUserAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhase("ai_eval");
    const result = await processRecording(audioBlob, item.word);
    if (!result) {
      setPhase("production");
      return;
    }
    const score = computeAccuracyFromResult(result.intended, result.spoken);
    setAcc(score);
    const ok = score >= SPEECH_PASS_ACCURACY_THRESHOLD;
    setProdOk(ok);
    setRewardLine("");
    setFeedbackMsg(ok ? "貝殼變金色！" : "請留意聲母與嘴形。");

    if (ok) {
      setGold((g) => ({ ...g, [item.shell]: true }));
      const { newScore, coinReward } = game.registerCorrect();
      setReachTarget(newScore >= BILABIAL_TARGET_COUNT);
      setRewardLine(`+${coinReward} 金幣　+1 ⭐（${newScore}/${BILABIAL_TARGET_COUNT}）`);
      setCloneUrl(null);
    } else {
      game.registerWrong();
      if (result.clone?.audio_base64) {
        const ct = result.clone.content_type || "audio/wav";
        setCloneUrl(`data:${ct};base64,${result.clone.audio_base64}`);
      }
      setUserAudioUrl(URL.createObjectURL(audioBlob));
    }
    setPhase("feedback");
  };

  const repeatRoundFromListen = () => {
    setPhase("listen");
    setListenDone(false);
    setAudioBlob(null);
    setUserAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCloneUrl(null);
    bump();
    void playCue();
  };

  const afterSuccessPrimary = () => {
    if (reachTarget) {
      setGameEnd(true);
      setReachTarget(false);
      return;
    }
    repeatRoundFromListen();
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
    <div className="min-h-full bg-background pb-40">
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

        {game.introDone && (
          <>
            <BilabialGameHUD
              score={game.score}
              target={game.targetCount}
              sessionCoins={game.sessionCoins}
              pipCelebrate={game.pipCelebrate}
            />

            <div className="mb-4 text-center">
              <p className="text-xs font-bold text-primary">雙唇海灘 · 第三站</p>
              <h1 className="font-headline text-xl font-extrabold text-foreground">貝殼分類大賽</h1>
            </div>

            <div className="mb-2 flex flex-wrap justify-center gap-2">
              {PHONEME_OPTIONS.map((o) => (
                <span
                  key={o.key}
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                    gold[o.key] ? "bg-amber-200 text-amber-900" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {o.symbol} {gold[o.key] ? "✓" : ""}
                </span>
              ))}
            </div>

            {phase === "idle" && (
              <div className="rounded-3xl border-2 border-primary/20 bg-card p-6 text-center">
                <p className="mb-4 text-sm font-bold text-foreground">同一題練到 {BILABIAL_TARGET_COUNT} 次正確</p>
                <button
                  type="button"
                  onClick={startFlow}
                  className="min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline font-extrabold text-primary-foreground"
                >
                  開始此輪
                </button>
              </div>
            )}

            {phase === "listen" && (
              <div className="space-y-4 rounded-3xl border-2 border-secondary/30 bg-card p-6 text-center">
                <p className="text-sm font-bold">聽清楚系統讀音</p>
                {!listenDone && <p className="animate-pulse text-primary">播放中⋯</p>}
                <button
                  type="button"
                  onClick={() => void playCue()}
                  className="min-h-[52px] w-full rounded-2xl border-2 border-primary py-3 font-bold text-primary"
                >
                  再聽一次
                </button>
                <button
                  type="button"
                  disabled={!listenDone}
                  onClick={() => {
                    setPhase("classify");
                    bump();
                  }}
                  className="min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline font-extrabold text-primary-foreground disabled:opacity-40"
                >
                  聽完後分類
                </button>
              </div>
            )}

            {phase === "classify" && (
              <DragDropGame
                floatingImage={item.image}
                floatingLabel={item.word}
                onDropOnShell={onDropShell}
                goldShells={gold}
              />
            )}

            {phase === "class_wrong" && (
              <div className="space-y-4 rounded-3xl border-2 border-amber-500/40 bg-amber-500/10 p-6 text-center">
                <p className="text-sm font-medium">{wrongHint}</p>
                <button
                  type="button"
                  onClick={retryClassify}
                  className="min-h-[52px] w-full rounded-2xl bg-primary py-3 font-headline font-extrabold text-primary-foreground"
                >
                  再試分類
                </button>
              </div>
            )}

            {phase === "production" && (
              <div className="space-y-4 rounded-3xl border-2 border-primary/30 bg-card p-6">
                <div className="flex items-start gap-2">
                  <img src={pipi} alt="" className="h-14 w-14 object-contain" />
                  <p className="font-headline text-lg font-extrabold text-primary">換你讀一次</p>
                </div>
                <p className="text-center text-3xl font-extrabold text-foreground">{item.word}</p>
                <RecordingModule
                  key={`s3-${timerKey}`}
                  onRecorded={(blob) => setAudioBlob(blob)}
                  onClear={() => {
                    setAudioBlob(null);
                    setUserAudioUrl((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return null;
                    });
                  }}
                />
                <button
                  type="button"
                  disabled={!audioBlob || isProcessing}
                  onClick={() => void runEval()}
                  className="min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline font-extrabold text-primary-foreground disabled:opacity-40"
                >
                  交給 AI 評分
                </button>
              </div>
            )}

            {phase === "ai_eval" && (
              <div className="flex flex-col items-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 font-bold">評估中⋯</p>
              </div>
            )}

            {phase === "feedback" && (
              <AIFeedbackModule
                variant={prodOk ? "success" : "retry"}
                title={prodOk ? "讀得很好！" : "再試"}
                message={feedbackMsg}
                accuracy={prodOk ? undefined : acc}
                animation={prodOk ? "clap" : "none"}
                rewardLine={prodOk ? rewardLine : undefined}
                compareCloneUrl={prodOk ? undefined : cloneUrl}
                compareUserUrl={prodOk ? undefined : userAudioUrl}
                primaryLabel={prodOk ? (reachTarget ? "查看成績" : "再來一次") : "再讀一次"}
                onPrimary={
                  prodOk
                    ? afterSuccessPrimary
                    : () => {
                        setCloneUrl(null);
                        setUserAudioUrl((u) => {
                          if (u) URL.revokeObjectURL(u);
                          return null;
                        });
                        setPhase("production");
                        setAudioBlob(null);
                        bump();
                      }
                }
                secondaryLabel={prodOk ? undefined : "從頭再聽"}
                onSecondary={prodOk ? undefined : repeatRoundFromListen}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
