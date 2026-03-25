import { useState } from "react";
import { Link } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { PiPiWidget } from "@/components/PiPiWidget";

const CATEGORIES = ["全部", "塞音", "擦音", "鼻音", "近音"] as const;

interface Sound {
  ipa: string;
  label: string;
  category: typeof CATEGORIES[number];
  example: string;
  description: string;
}

const SOUNDS: Sound[] = [
  { ipa: "/b/", label: "b", category: "塞音", example: "爸爸 (baa1 baa1)", description: "濁雙唇塞音。將雙唇緊閉，然後帶聲釋放。" },
  { ipa: "/p/", label: "p", category: "塞音", example: "怕 (paa3)", description: "清雙唇塞音。與 /b/ 相似，但帶送氣。" },
  { ipa: "/m/", label: "m", category: "鼻音", example: "媽媽 (maa1 maa1)", description: "雙唇鼻音。閉合雙唇，讓氣流從鼻腔排出。" },
  { ipa: "/f/", label: "f", category: "擦音", example: "花 (faa1)", description: "清唇齒擦音。上齒接觸下唇。" },
  { ipa: "/d/", label: "d", category: "塞音", example: "大 (daai6)", description: "清不送氣齒齦塞音。" },
  { ipa: "/t/", label: "t", category: "塞音", example: "他 (taa1)", description: "清送氣齒齦塞音。" },
  { ipa: "/n/", label: "n", category: "鼻音", example: "你 (nei5)", description: "齒齦鼻音。舌尖抵住上齒後方齒齦。" },
  { ipa: "/l/", label: "l", category: "近音", example: "來 (loi4)", description: "齒齦邊近音。舌尖抬起，氣流從兩側通過。" },
  { ipa: "/g/", label: "g", category: "塞音", example: "哥 (go1)", description: "清不送氣軟顎塞音。" },
  { ipa: "/k/", label: "k", category: "塞音", example: "卡 (kaa1)", description: "清送氣軟顎塞音。" },
  { ipa: "/ŋ/", label: "ng", category: "鼻音", example: "我 (ngo5)", description: "軟顎鼻音。舌根抵住軟顎。" },
  { ipa: "/h/", label: "h", category: "擦音", example: "好 (hou2)", description: "清聲門擦音。喉嚨打開，氣流通過。" },
  { ipa: "/s/", label: "s", category: "擦音", example: "三 (saam1)", description: "清齒齦擦音。舌尖接近齒齦。" },
  { ipa: "/j/", label: "j", category: "近音", example: "人 (jan4)", description: "硬顎近音。舌體向硬顎抬起。" },
  { ipa: "/w/", label: "w", category: "近音", example: "話 (waa6)", description: "唇軟顎近音。雙唇圓攏。" },
];

const PIPI_TIPS = [
  "點擊任何語音查看詳情！",
  "每天練習困難的語音。",
  "將語音加入你的練習清單！",
];

export default function IPAPage() {
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>("全部");
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [search, setSearch] = useState("");

  const filteredSounds = SOUNDS.filter((s) => {
    const matchCat = activeCategory === "全部" || s.category === activeCategory;
    const matchSearch = !search || s.ipa.toLowerCase().includes(search.toLowerCase()) || s.label.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-full bg-surface text-on-surface">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="font-headline text-2xl font-bold text-primary mb-1">IPA 語音瀏覽器</h1>
        <p className="text-on-surface-variant text-sm mb-6">
          探索粵語輔音，附帶例子及發音指南。
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: sound grid (lg:col-span-7) */}
          <div className="lg:col-span-7">
            {/* Search */}
            <div className="relative mb-4">
              <MaterialIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜尋語音⋯"
                className="w-full pl-10 pr-4 h-11 rounded-xl border border-outline-variant/40 bg-surface-container-lowest/80 font-body text-sm text-on-surface focus:border-primary focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full font-headline font-bold text-sm transition-all active:scale-95 ${
                    activeCategory === cat
                      ? "bg-primary text-on-primary shadow-md"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sound grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredSounds.map((s) => (
                <button
                  key={s.ipa}
                  onClick={() => setSelectedSound(s)}
                  className={`glass-card rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95 border ${
                    selectedSound?.ipa === s.ipa
                      ? "border-primary shadow-lg ring-2 ring-primary/20"
                      : "border-white/40 shadow-card"
                  }`}
                >
                  <span className="font-headline text-xl font-bold text-primary block">{s.ipa}</span>
                  <span className="text-xs text-on-surface-variant">{s.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: detail panel (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-xl p-6 shadow-card border border-white/40 sticky top-20">
              {selectedSound ? (
                <>
                  <div className="text-center mb-5">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center mb-3 shadow-xl shadow-primary/25">
                      <span className="font-headline text-3xl font-extrabold text-on-primary">{selectedSound.ipa}</span>
                    </div>
                    <h2 className="font-headline text-xl font-bold text-on-surface">{selectedSound.category}</h2>
                  </div>

                  {/* Play button */}
                  <button className="w-full flex items-center justify-center gap-2 bg-primary-container/40 text-primary rounded-xl py-3 font-bold mb-4 hover:bg-primary-container/60 transition-colors active:scale-95">
                    <MaterialIcon icon="volume_up" filled /> 播放語音
                  </button>

                  {/* Description */}
                  <div className="bg-surface-container-low/60 rounded-xl p-4 mb-4">
                    <h3 className="font-headline text-sm font-bold text-on-surface mb-1">發音方法</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{selectedSound.description}</p>
                  </div>

                  {/* Example */}
                  <div className="bg-surface-container-low/60 rounded-xl p-4 mb-4">
                    <h3 className="font-headline text-sm font-bold text-on-surface mb-1">例子</h3>
                    <p className="text-lg font-bold text-on-surface">{selectedSound.example}</p>
                  </div>

                  {/* PiPi tip */}
                  <div className="bg-secondary-container/30 rounded-xl p-3 flex items-start gap-2">
                    <MaterialIcon icon="smart_toy" filled className="text-secondary text-lg shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-on-secondary-container">皮皮小貼士</p>
                      <p className="text-xs text-on-secondary-container/80">
                        連續練習此語音五次效果最好！
                      </p>
                    </div>
                  </div>

                  <button className="mt-4 w-full bg-primary text-on-primary rounded-xl py-3 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                    加入練習
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <MaterialIcon icon="touch_app" className="text-5xl text-outline-variant mb-3" />
                  <p className="text-on-surface-variant">選擇一個語音查看詳情</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/learning/library"
            className="glass-card rounded-xl p-5 flex items-center gap-4 shadow-card hover:scale-[1.02] transition-transform"
          >
            <MaterialIcon icon="library_books" filled className="text-2xl text-primary" />
            <div>
              <p className="font-headline font-bold text-on-surface">IPA 資料庫</p>
              <p className="text-xs text-on-surface-variant">附語音範例的完整參考</p>
            </div>
          </Link>
          <Link
            to="/ipa-transcription"
            className="glass-card rounded-xl p-5 flex items-center gap-4 shadow-card hover:scale-[1.02] transition-transform"
          >
            <MaterialIcon icon="translate" filled className="text-2xl text-tertiary" />
            <div>
              <p className="font-headline font-bold text-on-surface">IPA 轉寫</p>
              <p className="text-xs text-on-surface-variant">將粵語文字轉換為 IPA</p>
            </div>
          </Link>
        </div>
      </div>

      <PiPiWidget tips={PIPI_TIPS} />
    </div>
  );
}
