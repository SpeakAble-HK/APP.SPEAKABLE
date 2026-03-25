import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import mascot from "@/assets/pipi-mascot.png";

const NGO_DIRECTORY = [
  { name: "HKIST", full: "Hong Kong Institute of Speech Therapists", url: "https://www.hkist.org.hk", icon: "medical_services" },
  { name: "DHCAS", full: "Child Assessment Service", url: "https://www.dhcas.gov.hk", icon: "health_and_safety" },
  { name: "Heep Hong", full: "Heep Hong Society", url: "https://www.heephong.org", icon: "diversity_3" },
  { name: "Caritas", full: "Caritas Community Services", url: "https://www.caritassws.org.hk", icon: "volunteer_activism" },
];

const RED_FLAGS = [
  "12 個月仍未牙牙學語",
  "18 個月仍未說出第一個字",
  "24 個月仍不能組合兩個字詞",
  "陌生人無法理解其說話（3 歲以上）",
  "口吃或說話困難",
];

const PIPI_TIPS = [
  { title: "每天交談", desc: "透過描述日常生活自然地建立詞彙。" },
  { title: "一起閱讀", desc: "親子共讀能提升理解和表達能力。" },
  { title: "先聆聽", desc: "給孩子時間回應——避免替他們說完句子。" },
];

export default function ResourcesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-surface text-on-surface font-body">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dim text-on-primary py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-headline text-4xl sm:text-5xl font-extrabold mb-4">
              言語資源中心
            </h1>
            <p className="text-on-primary/80 text-lg mb-6 max-w-lg">
              為家長、照顧者及社區提供的免費資源。了解言語發展、尋找專業協助及探索活動。
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={() => navigate("/red-flags")}
                className="bg-error text-on-error font-bold px-6 py-3 rounded-xl shadow-lg shadow-error/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <MaterialIcon icon="warning" className="mr-2" />
                警示清單
              </button>
              <button
                onClick={() => navigate("/ipa")}
                className="bg-white/20 backdrop-blur-md text-white font-bold px-6 py-3 rounded-xl border border-white/30 hover:bg-white/30 active:scale-95 transition-all"
              >
                <MaterialIcon icon="record_voice_over" className="mr-2" />
                試用 IPA 瀏覽器
              </button>
            </div>
          </div>
          <img
            src={mascot}
            alt=""
            role="presentation"
            className="w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-2xl animate-pipi-bob"
          />
        </div>
        <div className="absolute -bottom-8 left-0 right-0 h-16 bg-surface rounded-t-[3rem]" />
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* PiPi Tips */}
        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <MaterialIcon icon="tips_and_updates" filled className="text-tertiary" />
            皮皮給家長的小貼士
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PIPI_TIPS.map((tip) => (
              <div key={tip.title} className="glass-card rounded-xl p-5 shadow-card border border-white/40">
                <h3 className="font-headline font-bold text-on-surface mb-1">{tip.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Milestones */}
        <section className="bg-tertiary-container/20 rounded-2xl p-6">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <MaterialIcon icon="timeline" filled className="text-tertiary" />
            言語發展里程碑
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { age: "12 個月", milestone: "第一個字（媽媽、爸爸），能理解「不」" },
              { age: "18 個月", milestone: "10-20 個字，會指向物品，能跟從簡單指令" },
              { age: "24 個月", milestone: "50 個以上字詞，雙字詞組，陌生人能理解 50%" },
            ].map((m) => (
              <div key={m.age} className="bg-white/60 rounded-xl p-4 shadow-sm">
                <span className="font-headline font-extrabold text-tertiary text-lg">{m.age}</span>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{m.milestone}</p>
              </div>
            ))}
          </div>
        </section>

        {/* NGO Directory */}
        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <MaterialIcon icon="apartment" filled className="text-primary" />
            NGO 及專業機構目錄
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {NGO_DIRECTORY.map((ngo) => (
              <a
                key={ngo.name}
                href={ngo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-xl p-5 shadow-card border border-white/40 hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary-container/40 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <MaterialIcon icon={ngo.icon} filled className="text-primary group-hover:text-on-primary" />
                </div>
                <h3 className="font-headline font-bold text-on-surface mb-1">{ngo.name}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{ngo.full}</p>
                <div className="mt-2 flex items-center gap-1 text-primary text-xs font-medium">
                  瀏覽 <MaterialIcon icon="open_in_new" className="text-sm" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Red Flags Preview */}
        <section className="bg-error/5 rounded-2xl p-6 border border-error/10">
          <h2 className="font-headline text-xl font-bold text-error mb-4 flex items-center gap-2">
            <MaterialIcon icon="flag" filled className="text-error" />
            警示信號 — 何時尋求協助
          </h2>
          <div className="space-y-2 mb-4">
            {RED_FLAGS.slice(0, 3).map((flag) => (
              <div key={flag} className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                <MaterialIcon icon="warning" className="text-error text-lg shrink-0" />
                <span className="text-sm text-on-surface">{flag}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/red-flags")}
            className="text-error font-bold text-sm hover:text-error-dim transition-colors flex items-center gap-1"
          >
            查看完整清單 <MaterialIcon icon="arrow_forward" className="text-lg" />
          </button>
        </section>

        {/* IPA Demo Strip */}
        <section className="bg-inverse-surface rounded-2xl p-6 text-inverse-on-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline text-xl font-bold">IPA 語音瀏覽器</h2>
              <p className="text-sm opacity-70">探索粵語輔音</p>
            </div>
            <button
              onClick={() => navigate("/ipa")}
              className="bg-inverse-primary text-on-primary-fixed px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform"
            >
              開啟瀏覽器
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {["/b/", "/p/", "/m/", "/f/", "/d/", "/t/", "/n/", "/l/"].map((s) => (
              <div key={s} className="shrink-0 w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="font-headline font-bold text-inverse-primary">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-outline-variant/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <img src={mascot} alt="" className="h-6 w-6 object-contain" />
            <span className="font-bold">SpeakAble HK</span>
          </div>
          <p>© 2026 SpeakAble HK · 輔助言語訓練工具（非醫療用途）</p>
        </footer>
      </div>
    </div>
  );
}
