import { MaterialIcon } from "@/components/MaterialIcon";
import questImg from "@/assets/feature-quest.png";
import speakImg from "@/assets/feature-speak.png";
import aiImg from "@/assets/feature-ai.png";
import roomImg from "@/assets/pipi-room.png";

function IllustrationFrame({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
      <div
        className={`absolute inset-0 ${accent} rounded-[2.5rem] blur-[60px] opacity-30`}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function QuestIllustration() {
  return (
    <IllustrationFrame accent="bg-secondary-container">
      <div className="relative">
        <img
          src={questImg}
          alt="學習者完成趣味語音任務"
          className="w-64 sm:w-72 h-auto object-contain drop-shadow-xl animate-float"
        />
        <div className="absolute -top-3 -right-3 w-14 h-14 bg-tertiary-container rounded-2xl flex items-center justify-center shadow-lg animate-pop-in">
          <MaterialIcon icon="emoji_events" filled className="text-tertiary text-2xl" />
        </div>
        <div className="absolute -bottom-2 -left-4 w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center shadow-lg animate-pop-in" style={{ animationDelay: "0.15s" }}>
          <MaterialIcon icon="music_note" filled className="text-secondary text-xl" />
        </div>
      </div>
    </IllustrationFrame>
  );
}

export function VoiceCloneIllustration() {
  return (
    <IllustrationFrame accent="bg-primary-container">
      <div className="relative">
        <img
          src={speakImg}
          alt="聲音複製糾正學習示意圖"
          className="w-64 sm:w-72 h-auto object-contain drop-shadow-xl animate-float"
          style={{ animationDelay: "-1.5s" }}
        />
        {/* Golden speaker badge */}
        <div className="absolute -top-4 -left-2 px-3 py-1.5 bg-tertiary-container rounded-full flex items-center gap-1.5 shadow-lg">
          <MaterialIcon icon="record_voice_over" filled className="text-tertiary text-lg" />
          <span className="font-headline font-bold text-xs text-on-tertiary-container">黃金發音員</span>
        </div>
        {/* Waveform bars */}
        <div className="absolute -bottom-3 right-0 flex items-end gap-[3px] h-10" aria-hidden="true">
          {[40, 70, 55, 85, 45, 75, 50].map((h, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-primary to-primary-container animate-spec-bar"
              style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      </div>
    </IllustrationFrame>
  );
}

export function AdaptivePathIllustration() {
  return (
    <IllustrationFrame accent="bg-tertiary-container">
      <div className="relative">
        <img
          src={aiImg}
          alt="自適應學習路徑示意圖"
          className="w-64 sm:w-72 h-auto object-contain drop-shadow-xl animate-float"
          style={{ animationDelay: "-3s" }}
        />
        {/* Data-driven badge */}
        <div className="absolute -top-3 right-0 w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center shadow-lg animate-pop-in">
          <MaterialIcon icon="trending_up" filled className="text-primary text-2xl" />
        </div>
        {/* Progress dots */}
        <div className="absolute -bottom-2 left-4 flex items-center gap-2" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`rounded-full ${
                n <= 3
                  ? "w-3.5 h-3.5 bg-primary shadow-sm"
                  : "w-3.5 h-3.5 bg-surface-variant"
              }`}
            />
          ))}
          <div className="w-8 h-1.5 bg-primary/30 rounded-full" />
        </div>
      </div>
    </IllustrationFrame>
  );
}

export function AccessibilityIllustration() {
  return (
    <IllustrationFrame accent="bg-secondary-container">
      <div className="relative">
        <img
          src={roomImg}
          alt="長者及特殊學習需要用家居家練習"
          className="w-64 sm:w-72 h-auto object-contain drop-shadow-xl animate-float"
          style={{ animationDelay: "-4.5s" }}
        />
        {/* Accessibility badge */}
        <div className="absolute -top-3 -right-2 w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center shadow-lg animate-pop-in">
          <MaterialIcon icon="accessibility_new" filled className="text-primary text-2xl" />
        </div>
        {/* Phone frame hint */}
        <div className="absolute -bottom-4 -left-3 bg-white rounded-2xl shadow-xl p-2 flex items-center gap-2 border border-surface-variant/40">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MaterialIcon icon="touch_app" filled className="text-primary" />
          </div>
          <span className="text-xs font-bold text-on-surface pr-2">44px+</span>
        </div>
      </div>
    </IllustrationFrame>
  );
}
