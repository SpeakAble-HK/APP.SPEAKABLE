import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import TreasureMap from "@/components/TreasureMap";
import { IntroSequence } from "@/components/IntroSequence";
import PirateTreasureMapPreview from "@/components/PirateTreasureMapPreview";
import { shouldShowMissionPopup, setMissionPopupShown } from "@/lib/missionPopupSession";

export default function TreasureMapPage() {
  const location = useLocation();
  const routeState = location.state as { skipIntro?: boolean; skipMissionPopup?: boolean } | null;
  const [showIntro, setShowIntro] = useState(() => !routeState?.skipIntro);
  const [showPopup, setShowPopup] = useState(() => !routeState?.skipMissionPopup && shouldShowMissionPopup());

  const closePopup = () => {
    setMissionPopupShown();
    setShowPopup(false);
  };

  return (
    <div className="relative">
      {showIntro && <IntroSequence onFinish={() => setShowIntro(false)} />}
      <div style={{ padding: 32 }}>
        {showPopup && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              background: "rgba(2, 6, 23, 0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                width: "min(680px, 100%)",
                maxHeight: "90vh",
                overflow: "auto",
                borderRadius: 20,
                background: "#ffffff",
                padding: 22,
                boxShadow: "0 24px 70px rgba(15, 23, 42, 0.28)",
              }}
            >
              <PirateTreasureMapPreview />
              <div style={{ fontSize: 14, color: "#0369a1", fontWeight: 800, marginBottom: 8 }}>
                皮皮旅程開放
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, color: "#0f172a" }}>
                皮皮旅程
              </h2>
              <p style={{ color: "#334155", marginBottom: 16, lineHeight: 1.7 }}>
                皮皮小幫手會先幫你準備好，再帶你進入 3D 旅程地圖。跟住發光路線完成廣東話發音挑戰，逐個收集歷險印記。
              </p>
              <div
                style={{
                  borderRadius: 14,
                  border: "1px solid #bae6fd",
                  background: "linear-gradient(135deg, #ecfeff 0%, #fff7ed 100%)",
                  padding: 14,
                  marginBottom: 16,
                  color: "#334155",
                  lineHeight: 1.7,
                }}
              >
                點擊目前發光嘅歷險印記開始任務；答啱題目就會去下一站。
              </div>
              <button
                type="button"
                onClick={closePopup}
                style={{
                  borderRadius: 12,
                  background: "#0284c7",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                進入皮皮旅程
              </button>
            </div>
          </div>
        )}

        <TreasureMap />
      </div>
    </div>
  );
}
