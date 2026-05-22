import { MaterialIcon } from "@/components/MaterialIcon";
import mascot from "@/assets/pipi-mascot.png";

function Frame({
  children,
  bg = "bg-sky-soft",
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <div
      className={`relative w-full max-w-[320px] aspect-square ${bg} rounded-[2.5rem] flex items-center justify-center overflow-hidden`}
    >
      {/* Soft cloud accents */}
      <div className="absolute -top-6 -left-6 w-24 h-16 bg-white/70 rounded-full blur-xl" aria-hidden="true" />
      <div className="absolute -bottom-8 -right-6 w-28 h-20 bg-white/60 rounded-full blur-xl" aria-hidden="true" />
      <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}

function PiPi({ delay = "0s" }: { delay?: string }) {
  return (
    <img
      src={mascot}
      alt=""
      role="presentation"
      className="w-44 sm:w-52 h-auto object-contain animate-pipi-bob"
      style={{ animationDelay: delay, filter: "drop-shadow(0 16px 24px rgba(26,37,65,0.18))" }}
    />
  );
}

export function QuestIllustration() {
  return (
    <Frame bg="bg-sunshine-soft">
      <div className="relative">
        <PiPi />
        <div className="absolute -top-3 -right-3 w-14 h-14 bg-sunshine rounded-full flex items-center justify-center shadow-soft animate-pop-in">
          <MaterialIcon icon="emoji_events" filled className="text-white text-2xl" />
        </div>
        <div
          className="absolute -bottom-2 -left-4 w-12 h-12 bg-coral rounded-full flex items-center justify-center shadow-soft animate-pop-in"
          style={{ animationDelay: "0.15s" }}
        >
          <MaterialIcon icon="music_note" filled className="text-white text-xl" />
        </div>
        <div
          className="absolute top-6 -left-6 w-9 h-9 bg-mint rounded-full flex items-center justify-center shadow-sm animate-pop-in"
          style={{ animationDelay: "0.3s" }}
        >
          <MaterialIcon icon="star" filled className="text-white text-base" />
        </div>
      </div>
    </Frame>
  );
}

export function VoiceCloneIllustration() {
  return (
    <Frame bg="bg-sky-soft">
      <div className="relative">
        <PiPi delay="-1s" />
        <div className="absolute -top-4 -left-2 px-3 py-1.5 bg-white rounded-full flex items-center gap-1.5 shadow-soft border-2 border-sunshine/40">
          <MaterialIcon icon="record_voice_over" filled className="text-coral text-lg" />
          <span className="font-headline font-extrabold text-xs text-ink">
            黃金發音員
          </span>
        </div>
        <div className="absolute -bottom-3 right-0 flex items-end gap-[3px] h-10" aria-hidden="true">
          {[40, 70, 55, 85, 45, 75, 50].map((h, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-coral to-sunshine"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function AdaptivePathIllustration() {
  return (
    <Frame bg="bg-mint-soft">
      <div className="relative">
        <PiPi delay="-2s" />
        <div className="absolute -top-3 right-0 w-14 h-14 bg-mint rounded-full flex items-center justify-center shadow-soft animate-pop-in">
          <MaterialIcon icon="trending_up" filled className="text-white text-2xl" />
        </div>
        <div className="absolute -bottom-2 left-4 flex items-center gap-2" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`rounded-full ${
                n <= 3 ? "w-3.5 h-3.5 bg-mint shadow-sm" : "w-3.5 h-3.5 bg-white"
              }`}
            />
          ))}
          <div className="w-8 h-1.5 bg-mint/40 rounded-full" />
        </div>
      </div>
    </Frame>
  );
}

export function AccessibilityIllustration() {
  return (
    <Frame bg="bg-cream-deep">
      <div className="relative">
        <PiPi delay="-3s" />
        <div className="absolute -top-3 -right-2 w-14 h-14 bg-sky-bright rounded-full flex items-center justify-center shadow-soft animate-pop-in">
          <MaterialIcon icon="accessibility_new" filled className="text-white text-2xl" />
        </div>
        <div className="absolute -bottom-4 -left-3 bg-white rounded-2xl shadow-soft p-2 flex items-center gap-2 border-2 border-sunshine/30">
          <div className="w-10 h-10 rounded-full bg-sunshine/30 flex items-center justify-center">
            <MaterialIcon icon="touch_app" filled className="text-coral" />
          </div>
          <span className="text-xs font-extrabold text-ink pr-2">44px+</span>
        </div>
      </div>
    </Frame>
  );
}
