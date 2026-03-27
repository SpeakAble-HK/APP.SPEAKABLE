import { useCallback, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import type { BilabialFlowPhase, BilabialPhonemeKey } from "@/components/bilabial/bilabialTypes";
import { PHONEME_OPTIONS } from "@/components/bilabial/bilabialTypes";
import { RecordingModule } from "@/components/bilabial/RecordingModule";
import {
  AIFeedbackModule,
  type FeedbackAnimation,
} from "@/components/bilabial/AIFeedbackModule";
import { speakWithClonedVoice } from "@/components/bilabial/clonedVoiceTTS";
import {
  computeAccuracyFromResult,
  firstSpokenInitial,
  getPracticeWordForPhoneme,
  isolationCorrectionMessage,
  normalizeInitialForTarget,
} from "@/components/bilabial/bilabialUtils";
import { BilabialGameHUD } from "@/components/bilabial/BilabialGameHUD";
import { BILABIAL_TARGET_COUNT, useBilabialGameSession } from "@/components/bilabial/useBilabialGameSession";
import pipi from "@/assets/pipi-parrot-only.png";

interface BilabialStation1Props {
  onComplete: () => void;
  onBack: () => void;
}

const TEACHING: Record<
  BilabialPhonemeKey,
  { line: string; hint: string; emoji: string }
> = {
  b: { line: "雙唇閉緊 → 輕輕彈開", hint: "聯想槍聲", emoji: "🔫" },
  p: { line: "雙唇閉緊 → 強力噴氣", hint: "吹泡泡", emoji: "🫧" },
  m: { line: "雙唇閉合 → 鼻震動", hint: "mmm 鼻震", emoji: "🤢" },
};

function phaseLabel(phase: BilabialFlowPhase): string {
  const map: Record<BilabialFlowPhase, string> = {
    idle: "準備",
    instruction: "視覺教學",
    demo: "聲音示範",
    user_action: "請你發音",
    AI_evaluation: "AI 評估",
    feedback: "回饋",
    next: "下一步",
  };
  return map[phase];
}

export function BilabialStation1({ onComplete, onBack }: BilabialStation1Props) {
  const { processRecording, isProcessing } = usePronunciationAPI();
  const game = useBilabialGameSession();
  const [phase, setPhase] = useState<BilabialFlowPhase>("idle");
  const [selected, setSelected] = useState<BilabialPhonemeKey | null>(null);
  const [demoDone, setDemoDone] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);
  const [reachTarget, setReachTarget] = useState(false);

  const [accuracy, setAccuracy] = useState(0);
  const [success, setSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [phonemeHint, setPhonemeHint] = useState("");
  const [anim, setAnim] = useState<FeedbackAnimation>("none");
  const [rewardLine, setRewardLine] = useState("");
  const [failCloneUrl, setFailCloneUrl] = useState<string | null>(null);
  const [failUserUrl, setFailUserUrl] = useState<string | null>(null);

  const runDemo = useCallback(async () => {
    if (!selected) return;
    setDemoDone(false);
    await speakCantonese("請聽示範發音");
    await speakCantonese(getPracticeWordForPhoneme(selected));
    setDemoDone(true);
  }, [selected]);

  const bumpTimer = () => setTimerKey((k) => k + 1);

  const startInstruction = () => {
    setPhase("instruction");
    setSelected(null);
    setDemoDone(false);
    setAudioBlob(null);
    bumpTimer();
  };

  const goDemo = async () => {
    if (!selected) return;
    setPhase("demo");
    bumpTimer();
    await runDemo();
  };

  const goRecord = () => {
    if (!demoDone) return;
    setPhase("user_action");
    setAudioBlob(null);
    bumpTimer();
  };

  const runEval = async () => {
    if (!audioBlob || !selected) return;
    setFailCloneUrl(null);
    setFailUserUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });

    setPhase("AI_evaluation");
    const word = getPracticeWordForPhoneme(selected);
    const result = await processRecording(audioBlob, word);
    if (!result) {
      setPhase("user_action");
      return;
    }
    const acc = computeAccuracyFromResult(result.intended, result.spoken);
    const si = firstSpokenInitial(result.spoken);
    setPhonemeHint(si ? `聲母：${si}` : "");
    const initialOk = normalizeInitialForTarget(si, selected);
    const ok = initialOk && acc >= 70;
    setAccuracy(acc);
    setSuccess(ok);
    setRewardLine("");

    if (ok) {
      const { newScore, coinReward } = game.registerCorrect();
      setReachTarget(newScore >= BILABIAL_TARGET_COUNT);
      setFeedbackMsg("做得很好！");
      setAnim(selected === "b" ? "gun" : selected === "p" ? "bubble" : "stink");
      setRewardLine(`+${coinReward} 金幣　+1 ⭐（${newScore}/${BILABIAL_TARGET_COUNT}）`);
    } else {
      game.registerWrong();
      setAnim("none");
      setFeedbackMsg(isolationCorrectionMessage(selected, si));
      if (result.clone?.audio_base64) {
        const ct = result.clone.content_type || "audio/wav";
        setFailCloneUrl(`data:${ct};base64,${result.clone.audio_base64}`);
      }
      setFailUserUrl(URL.createObjectURL(audioBlob));
    }
    setPhase("feedback");
  };

  const afterSuccessPrimary = () => {
    if (reachTarget) {
      setGameEnd(true);
      setReachTarget(false);
      return;
    }
    setPhase("demo");
    setAudioBlob(null);
    setDemoDone(false);
    bumpTimer();
    void runDemo();
  };

  const retryFailPrimary = () => {
    setFailCloneUrl(null);
    setFailUserUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
    setPhase("user_action");
    setAudioBlob(null);
    bumpTimer();
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
            {BILABIAL_TARGET_COUNT} / {BILABIAL_TARGET_COUNT} 次正確
          </p>
          <p className="mt-4 text-lg font-extrabold text-amber-700">🪙 本次獲得 {game.sessionCoins} 金幣</p>
          <button
            type="button"
            onClick={() => {
              game.resetProgress();
              onComplete();
            }}
            className="mt-10 min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline text-base font-extrabold text-primary-foreground"
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
              className="min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline text-base font-extrabold text-primary-foreground"
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

            <div className="mb-2 text-center">
              <p className="font-headline text-xs font-bold text-primary">雙唇海灘 · 第一站</p>
              <h1 className="font-headline text-xl font-extrabold text-foreground">噴氣實驗室</h1>
              <p className="mt-1 text-xs font-bold text-muted-foreground">步驟：{phaseLabel(phase)}</p>
            </div>

            <div className="mb-4 flex items-start gap-3">
              <img src={pipi} alt="" className="h-14 w-14 shrink-0 object-contain" width={256} height={256} />
              <div className="rounded-2xl rounded-bl-sm border-2 border-primary/20 bg-card px-3 py-2 text-sm font-bold text-foreground">
                教學 → 聽示範 → 錄音 → 評分
              </div>
            </div>

            {phase === "idle" && (
              <div className="space-y-4 rounded-3xl border-2 border-primary/20 bg-card p-6 text-center">
                <button
                  type="button"
                  onClick={startInstruction}
                  className="min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline text-base font-extrabold text-primary-foreground shadow-lg active:scale-[0.98]"
                >
                  開始此輪
                </button>
              </div>
            )}

            {phase === "instruction" && (
              <div className="space-y-4">
                <p className="text-center text-sm font-bold text-foreground">選擇一個音</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {PHONEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelected(opt.key)}
                      className={`min-h-[56px] rounded-2xl border-2 px-3 py-3 text-center font-headline text-sm font-extrabold transition-all ${
                        selected === opt.key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground"
                      }`}
                    >
                      <span className="block text-lg">{opt.symbol}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {selected && (
                  <div className="rounded-3xl border-2 border-secondary/30 bg-secondary/5 p-5 text-center">
                    <p className="mb-2 text-5xl" aria-hidden>
                      {TEACHING[selected].emoji}
                    </p>
                    <p className="font-headline text-lg font-extrabold text-foreground">{TEACHING[selected].line}</p>
                    <p className="mt-2 text-sm font-bold text-primary">提示：{TEACHING[selected].hint}</p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!selected}
                  onClick={() => void goDemo()}
                  className="min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline text-base font-extrabold text-primary-foreground shadow-lg disabled:opacity-40"
                >
                  下一步：聽示範
                </button>
              </div>
            )}

            {phase === "demo" && selected && (
              <div className="space-y-4 rounded-3xl border-2 border-primary/20 bg-card p-6 text-center">
                <p className="text-sm font-bold text-foreground">聲音示範（粵語）</p>
                {!demoDone && <p className="animate-pulse text-primary">播放中⋯</p>}
                <button
                  type="button"
                  disabled={!demoDone}
                  onClick={goRecord}
                  className="min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline text-base font-extrabold text-primary-foreground shadow-lg disabled:opacity-40"
                >
                  聽完示範，開始錄音
                </button>
                <button
                  type="button"
                  onClick={() => void runDemo()}
                  className="text-sm font-bold text-primary underline"
                >
                  再聽一次示範
                </button>
              </div>
            )}

            {phase === "user_action" && selected && (
              <div className="space-y-4 rounded-3xl border-2 border-destructive/20 bg-card p-6">
                <p className="text-center font-headline text-lg font-extrabold text-foreground">
                  請讀：{getPracticeWordForPhoneme(selected)}
                </p>
                <RecordingModule
                  key={`${selected}-rec-${timerKey}`}
                  prompt="長按錄音，讀出上面詞語"
                  onRecorded={(blob) => setAudioBlob(blob)}
                  onClear={() => setAudioBlob(null)}
                />
                <button
                  type="button"
                  disabled={!audioBlob || isProcessing}
                  onClick={() => void runEval()}
                  className="min-h-[56px] w-full rounded-2xl bg-primary py-4 font-headline text-base font-extrabold text-primary-foreground shadow-lg disabled:opacity-40"
                >
                  交給 AI 評分
                </button>
              </div>
            )}

            {phase === "AI_evaluation" && (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="font-bold text-foreground">分析中⋯</p>
              </div>
            )}

            {phase === "feedback" && selected && (
              <AIFeedbackModule
                variant={success ? "success" : "retry"}
                title={success ? "通過！" : "再試"}
                message={feedbackMsg}
                accuracy={success ? undefined : accuracy}
                phonemeHint={success ? undefined : phonemeHint || undefined}
                phonemeKey={selected}
                animation={anim}
                rewardLine={success ? rewardLine : undefined}
                compareCloneUrl={success ? undefined : failCloneUrl}
                compareUserUrl={success ? undefined : failUserUrl}
                primaryLabel={success ? (reachTarget ? "查看成績" : "繼續") : "再試錄音"}
                onPrimary={success ? afterSuccessPrimary : retryFailPrimary}
                secondaryLabel={success ? undefined : "聽示範"}
                onSecondary={success ? undefined : () => { setPhase("demo"); setDemoDone(false); void runDemo(); }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
