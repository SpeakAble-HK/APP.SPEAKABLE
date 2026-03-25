import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BrandHeader } from "@/components/BrandHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { providers, districts, SpeechTherapyProvider } from "@/data/speechTherapyProviders";
import mascot from "@/assets/pipi-mascot.png";

type RegionKey = "all" | "hk-island" | "kowloon" | "new-territories";

const SpeechTherapyInfoPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [showInfo, setShowInfo] = useState(false);

  const t = (en: string, tw: string, cn: string) =>
    isEn ? en : isTW ? tw : cn;

  const getName = (p: SpeechTherapyProvider) =>
    isEn ? p.nameEn : isTW ? p.nameTW : p.nameCN;
  const getAddress = (p: SpeechTherapyProvider) =>
    isEn ? p.addressEn : isTW ? p.addressTW : p.addressCN;
  const getType = (p: SpeechTherapyProvider) =>
    isEn ? p.typeEn : isTW ? p.typeTW : p.typeCN;
  const getDistrict = (p: SpeechTherapyProvider) =>
    isEn ? p.districtEn : isTW ? p.districtTW : p.districtCN;
  const getServices = (p: SpeechTherapyProvider) =>
    isEn ? p.servicesEn : isTW ? p.servicesTW : p.servicesCN;

  const regionOptions: { key: RegionKey; label: string }[] = [
    { key: "all", label: t("All Regions", "全部地區", "全部地区") },
    { key: "hk-island", label: t("HK Island", "香港島", "香港岛") },
    { key: "kowloon", label: t("Kowloon", "九龍", "九龙") },
    {
      key: "new-territories",
      label: t("New Territories", "新界", "新界"),
    },
  ];

  const districtOptions = useMemo(() => {
    if (selectedRegion === "all") return [];
    return districts[selectedRegion].districts.map((d) => ({
      value: isEn ? d.en : isTW ? d.tw : d.cn,
      label: isEn ? d.en : isTW ? d.tw : d.cn,
    }));
  }, [selectedRegion, isEn, isTW]);

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (selectedRegion !== "all" && p.region !== selectedRegion) return false;
      if (selectedDistrict !== "all") {
        if (getDistrict(p) !== selectedDistrict) return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        const searchable = [
          p.nameEn, p.nameTW, p.nameCN,
          p.addressEn, p.addressTW, p.addressCN,
          p.typeEn, p.typeTW, p.typeCN,
          p.districtEn, p.districtTW, p.districtCN,
          ...p.servicesEn, ...p.servicesTW, ...p.servicesCN,
        ].join(" ").toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [query, selectedRegion, selectedDistrict, isEn, isTW]);

  const getTypeColor = (type: string) => {
    if (type.includes("University") || type.includes("大學") || type.includes("大学"))
      return "bg-primary-container/50 text-primary border-primary/20";
    if (type.includes("Public") || type.includes("公立"))
      return "bg-green-100 text-green-700 border-green-200";
    if (type.includes("Community") || type.includes("社區") || type.includes("社区"))
      return "bg-tertiary-container/50 text-tertiary border-tertiary/20";
    return "bg-surface-container text-on-surface-variant border-outline-variant/30";
  };

  const INFO_SECTIONS = [
    {
      icon: "help_outline",
      title: t("What is Speech Therapy?", "什麼是言語治療？", "什么是言语治疗？"),
      content: t(
        "Speech therapy helps people improve their ability to communicate. A speech therapist works with individuals who have difficulties with speech sounds, language, voice, fluency, or swallowing.",
        "言語治療幫助人們改善溝通能力。言語治療師與有語音、語言、聲音、流暢度或吞嚥困難的人一起工作。",
        "言语治疗帮助人们改善沟通能力。言语治疗师与有语音、语言、声音、流畅度或吞咽困难的人一起工作。"
      ),
    },
    {
      icon: "groups",
      title: t("Common Speech Difficulties", "常見語言障礙", "常见语言障碍"),
      content: t(
        "Common issues include articulation disorders, phonological disorders, apraxia of speech, stuttering, and voice disorders. In Cantonese speakers, tone production and nasal sound distinctions are frequent areas of focus.",
        "常見問題包括構音障礙、音韻障礙、言語失用症、口吃和聲音障礙。在廣東話使用者中，聲調產生和鼻音區分是常見的重點領域。",
        "常见问题包括构音障碍、音韵障碍、言语失用症、口吃和声音障碍。在广东话使用者中，声调产生和鼻音区分是常见的重点领域。"
      ),
    },
    {
      icon: "menu_book",
      title: t("How Speech Therapy Works", "言語治療如何運作", "言语治疗如何运作"),
      content: t(
        "Treatment begins with an assessment to identify specific difficulties. The therapist then creates a tailored plan with exercises. Sessions may include practising sounds, strengthening mouth muscles, and using technology-assisted tools.",
        "治療從評估開始，以識別特定困難。治療師制定量身定做的計劃。療程可能包括練習聲音、加強口腔肌肉及使用科技輔助工具。",
        "治疗从评估开始，以识别特定困难。治疗师制定量身定做的计划。疗程可能包括练习声音、加强口腔肌肉及使用科技辅助工具。"
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      <BrandHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dim text-on-primary pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold mb-4">
              搜尋言語治療服務
            </h1>
            <p className="text-on-primary/80 text-base sm:text-lg leading-relaxed max-w-lg">
              香港擁有多元化的言語治療服務，涵蓋公營醫院、大學診所、社區中心及私人機構。在這裡搜尋適合你的服務，按地區、名稱或服務類型篩選。
            </p>
          </div>
          <img
            src={mascot}
            alt=""
            role="presentation"
            className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-2xl animate-pipi-bob"
          />
        </div>
        <div className="absolute -bottom-8 left-0 right-0 h-16 bg-surface rounded-t-[3rem]" />
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search bar */}
        <div className="relative">
          <MaterialIcon
            icon="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              "Search by name, district, or service...",
              "搜尋名稱、地區或服務...",
              "搜索名称、地区或服务..."
            )}
            className="w-full h-14 pl-12 pr-12 rounded-2xl border-2 border-outline-variant bg-white text-base font-medium text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
            >
              <MaterialIcon icon="close" className="text-on-surface-variant text-lg" />
            </button>
          )}
        </div>

        {/* Region filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {regionOptions.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setSelectedRegion(r.key);
                setSelectedDistrict("all");
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                selectedRegion === r.key
                  ? "bg-primary text-on-primary shadow-md"
                  : "bg-white text-on-surface border border-outline-variant hover:border-primary/40"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* District pills */}
        {districtOptions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedDistrict("all")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedDistrict === "all"
                  ? "bg-tertiary text-on-tertiary"
                  : "bg-white text-on-surface-variant border border-outline-variant hover:border-tertiary/40"
              }`}
            >
              {t("All Districts", "全部", "全部")}
            </button>
            {districtOptions.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDistrict(d.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedDistrict === d.value
                    ? "bg-tertiary text-on-tertiary"
                    : "bg-white text-on-surface-variant border border-outline-variant hover:border-tertiary/40"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}

        {/* Result count */}
        <p className="text-sm text-on-surface-variant font-medium">
          {filtered.length} {t("providers found", "個結果", "个结果")}
        </p>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center shadow-card">
            <MaterialIcon icon="search_off" className="text-on-surface-variant text-5xl mb-3" />
            <p className="font-headline font-bold text-on-surface mb-1">
              {t("No providers found", "找不到服務提供者", "找不到服务提供者")}
            </p>
            <p className="text-sm text-on-surface-variant">
              {t(
                "Try a different search or filter.",
                "嘗試不同的搜尋或篩選。",
                "尝试不同的搜索或筛选。"
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="glass-card rounded-2xl p-5 shadow-card border border-white/40 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/40 flex items-center justify-center shrink-0 mt-0.5">
                    <MaterialIcon icon="apartment" filled className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline text-sm font-bold text-on-surface leading-tight">
                      {getName(p)}
                    </p>
                    <span
                      className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTypeColor(
                        getType(p)
                      )}`}
                    >
                      {getType(p)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 mb-2 ml-[52px]">
                  <MaterialIcon icon="location_on" className="text-on-surface-variant text-base shrink-0 mt-0.5" />
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {getAddress(p)}
                  </p>
                </div>

                <div className="flex items-center gap-4 ml-[52px] mb-2">
                  {p.phone && (
                    <a
                      href={`tel:${p.phone}`}
                      className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                    >
                      <MaterialIcon icon="call" className="text-sm" />
                      {p.phone}
                    </a>
                  )}
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                    >
                      <MaterialIcon icon="language" className="text-sm" />
                      {t("Website", "網站", "网站")}
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 ml-[52px]">
                  {getServices(p).map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold text-on-surface-variant"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-tertiary-container/20 border border-tertiary/10 rounded-2xl p-4 flex gap-3">
          <MaterialIcon icon="info" className="text-tertiary text-xl shrink-0 mt-0.5" />
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t(
              "This list is for reference only. SpeakAble HK does not endorse or guarantee any provider. Please verify details directly.",
              "此列表僅供參考。SpeakAble HK 不為任何服務提供者背書或保證。請直接向服務提供者查詢詳情。",
              "此列表仅供参考。SpeakAble HK 不为任何服务提供者背书或保证。请直接向服务提供者查询详情。"
            )}
          </p>
        </div>

        {/* Learn about speech therapy toggle */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-full flex items-center justify-between glass-card rounded-2xl p-5 shadow-card border border-white/40 hover:shadow-card-hover transition-shadow"
        >
          <div className="flex items-center gap-3">
            <MaterialIcon icon="school" filled className="text-primary text-xl" />
            <span className="font-headline text-sm font-bold text-on-surface">
              {t("Learn About Speech Therapy", "了解言語治療", "了解言语治疗")}
            </span>
          </div>
          <MaterialIcon
            icon={showInfo ? "expand_less" : "expand_more"}
            className="text-on-surface-variant"
          />
        </button>

        {showInfo && (
          <div className="space-y-3">
            {INFO_SECTIONS.map((section, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-5 shadow-sm border border-white/40"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-container/40 flex items-center justify-center shrink-0">
                    <MaterialIcon icon={section.icon} className="text-primary" />
                  </div>
                  <h3 className="font-headline text-sm font-bold text-on-surface">
                    {section.title}
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed ml-12">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-outline-variant/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant pb-8">
          <div className="flex items-center gap-2">
            <img src={mascot} alt="" className="h-6 w-6 object-contain" />
            <span className="font-bold">SpeakAble HK</span>
          </div>
          <p>© 2026 SpeakAble HK · 輔助言語訓練工具（非醫療用途）</p>
        </footer>
      </div>
    </div>
  );
};

export default SpeechTherapyInfoPage;
