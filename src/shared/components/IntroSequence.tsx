import React, { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo.png";
import heroVideo from "@/assets/hero_video.mp4";

interface IntroSequenceProps {
  onFinish: () => void;
}

// Utility for 4:3 aspect ratio fullscreen
const videoContainerStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "#f8fafc",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const videoStyle: React.CSSProperties = {
  width: "80vw",
  height: "60vw", // 4:3 ratio
  maxWidth: "90vh",
  maxHeight: "67.5vh", // 4:3 ratio
  objectFit: "cover",
  background: "#000",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

const logoStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc",
  zIndex: 9999,
  pointerEvents: "none",
};

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onFinish }) => {
  const [step, setStep] = useState<"video" | "logo" | "mission" | "done">("video");
  const [showLogo, setShowLogo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (step === "video") {
      const fallbackTimer = window.setTimeout(() => setStep("logo"), 12000);
      return () => window.clearTimeout(fallbackTimer);
    }

    if (step === "logo") {
      const delay = window.setTimeout(() => {
        setShowLogo(true);
        window.setTimeout(() => setStep("mission"), 1800); // logo visible for 1.8s
      }, 400); // delay before fade-in
      return () => window.clearTimeout(delay);
    }

    if (step === "mission") {
      const autoAdvance = window.setTimeout(() => setStep("done"), 2500);
      return () => window.clearTimeout(autoAdvance);
    }

    if (step === "done") {
      const finishTimer = window.setTimeout(onFinish, 250);
      return () => window.clearTimeout(finishTimer);
    }
  }, [step, onFinish]);

  return (
    <>
      {step === "video" && (
        <div style={videoContainerStyle}>
          <video
            ref={videoRef}
            src={heroVideo}
            style={videoStyle}
            autoPlay
            playsInline
            muted
            onEnded={() => setStep("logo")}
            onError={() => setStep("logo")}
          />
        </div>
      )}
      {step === "logo" && (
        <div style={logoStyle}>
          <span
            style={{
              display: "block",
              fontFamily: 'Pacifico, cursive',
              fontSize: 56,
              color: "#0099cc",
              textShadow: "0 4px 24px #b8e8f5, 0 1px 0 #fff",
              transform: showLogo ? "translateY(0) scale(1)" : "translateY(40px) scale(0.92)",
              opacity: showLogo ? 1 : 0,
              transition: "opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)",
              borderRadius: 24,
              background: "rgba(255,255,255,0.85)",
              padding: "32px 48px 24px 48px",
              borderBottomLeftRadius: 80,
              borderBottomRightRadius: 80,
              boxShadow: "0 8px 32px rgba(0,180,216,0.10)",
              letterSpacing: 2,
              fontWeight: 700,
              filter: showLogo ? "drop-shadow(0 2px 12px #4fb4e8)" : "none",
            }}
          >
            SpeakAble HK
          </span>
        </div>
      )}
      {step === "mission" && (
        <div style={logoStyle}>
          <div
            style={{
              width: "min(560px, calc(100vw - 32px))",
              borderRadius: 22,
              border: "1px solid rgba(2,132,199,0.22)",
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 20px 50px rgba(15,23,42,0.16)",
              padding: "20px 22px",
              pointerEvents: "auto",
            }}
          >
            <div style={{ fontSize: 14, color: "#0369a1", fontWeight: 700, marginBottom: 8 }}>新任務開放</div>
            <div style={{ fontSize: 24, color: "#0f172a", fontWeight: 800, marginBottom: 10 }}>寶藏地圖冒險</div>
            <div style={{ color: "#334155", lineHeight: 1.5, marginBottom: 16 }}>
              跟住發光路線完成廣東話發音挑戰，逐個檢查點解鎖，收集獎勵同裝飾。
            </div>
            <button
              type="button"
              onClick={() => setStep("done")}
              style={{
                borderRadius: 12,
                background: "linear-gradient(180deg, #0284c7 0%, #0369a1 100%)",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              開始任務
            </button>
          </div>
        </div>
      )}
    </>
  );
};
