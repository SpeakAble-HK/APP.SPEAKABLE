import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TreasureMap from "@/components/TreasureMap";
import { IntroSequence } from "@/components/IntroSequence";
import PirateTreasureMapPreview from "@/components/PirateTreasureMapPreview";
import { shouldShowMissionPopup, setMissionPopupShown } from "@/lib/missionPopupSession";

export default function TreasureMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
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
      <div className="p-4 sm:p-6 lg:p-8">
        {showPopup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4"
          >
            <div
              className="w-full max-w-[680px] max-h-[90vh] overflow-auto rounded-2xl bg-white p-5 sm:p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
            >
              <PirateTreasureMapPreview />
              <div className="text-sm text-sky-600 font-extrabold mb-2">
                皮皮旅程開放
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-slate-900">
                皮皮旅程
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                皮皮小幫手會先幫你準備好，再帶你進入 3D 旅程地圖。跟住發光路線完成廣東話發音挑戰，逐個收集歷險印記。
              </p>
              <div
                className="rounded-xl border border-sky-200 bg-gradient-to-br from-cyan-50 to-orange-50 p-3 sm:p-4 mb-4 text-slate-600 leading-relaxed"
              >
                點擊目前發光嘅歷險印記開始任務；答啱題目就會去下一站。
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={closePopup}
                  className="rounded-xl bg-sky-600 text-white border-none px-4 py-2.5 font-bold cursor-pointer hover:bg-sky-700 transition-colors"
                >
                  進入皮皮旅程
                </button>
                <button
                  type="button"
                  onClick={() => { closePopup(); navigate("/pirate-treasure-map"); }}
                  className="rounded-xl bg-violet-600 text-white border-none px-4 py-2.5 font-bold cursor-pointer hover:bg-violet-700 transition-colors"
                >
                  🗺️ 3D 藏寶圖
                </button>
              </div>
            </div>
          </div>
        )}

        <TreasureMap />
      </div>
    </div>
  );
}
