import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Phone, Globe, X, AlertTriangle, Heart, BookOpen, HelpCircle, Users, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { providers, districts, SpeechTherapyProvider } from "@/data/speechTherapyProviders";
import mascot from "@/assets/mascot.png";

type RegionKey = 'all' | 'hk-island' | 'kowloon' | 'new-territories';

const SpeechTherapyInfoPage = () => {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [showInfo, setShowInfo] = useState(false);

  const t = (en: string, tw: string, cn: string) => isEn ? en : isTW ? tw : cn;

  const getName = (p: SpeechTherapyProvider) => isEn ? p.nameEn : isTW ? p.nameTW : p.nameCN;
  const getAddress = (p: SpeechTherapyProvider) => isEn ? p.addressEn : isTW ? p.addressTW : p.addressCN;
  const getType = (p: SpeechTherapyProvider) => isEn ? p.typeEn : isTW ? p.typeTW : p.typeCN;
  const getDistrict = (p: SpeechTherapyProvider) => isEn ? p.districtEn : isTW ? p.districtTW : p.districtCN;
  const getServices = (p: SpeechTherapyProvider) => isEn ? p.servicesEn : isTW ? p.servicesTW : p.servicesCN;

  const regionOptions: { key: RegionKey; label: string }[] = [
    { key: 'all', label: t('All Regions', '全部地區', '全部地区') },
    { key: 'hk-island', label: t('HK Island', '香港島', '香港岛') },
    { key: 'kowloon', label: t('Kowloon', '九龍', '九龙') },
    { key: 'new-territories', label: t('New Territories', '新界', '新界') },
  ];

  const districtOptions = useMemo(() => {
    if (selectedRegion === 'all') return [];
    return districts[selectedRegion].districts.map(d => ({
      value: isEn ? d.en : isTW ? d.tw : d.cn,
      label: isEn ? d.en : isTW ? d.tw : d.cn,
    }));
  }, [selectedRegion, isEn, isTW]);

  const filtered = useMemo(() => {
    return providers.filter(p => {
      if (selectedRegion !== 'all' && p.region !== selectedRegion) return false;
      if (selectedDistrict !== 'all') {
        const pDist = getDistrict(p);
        if (pDist !== selectedDistrict) return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        const searchable = [
          p.nameEn, p.nameTW, p.nameCN,
          p.addressEn, p.addressTW, p.addressCN,
          p.typeEn, p.typeTW, p.typeCN,
          p.districtEn, p.districtTW, p.districtCN,
          ...p.servicesEn, ...p.servicesTW, ...p.servicesCN,
        ].join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [query, selectedRegion, selectedDistrict, isEn, isTW]);

  const getTypeColor = (type: string) => {
    if (type.includes('University') || type.includes('大學') || type.includes('大学')) return 'bg-primary/10 text-primary border-primary/20';
    if (type.includes('Public') || type.includes('公立')) return 'bg-success/10 text-success border-success/20';
    if (type.includes('Community') || type.includes('社區') || type.includes('社区')) return 'bg-accent/10 text-accent border-accent/20';
    return 'bg-muted text-foreground border-border';
  };

  const infoSections = [
    {
      icon: HelpCircle,
      title: t("What is Speech Therapy?", "什麼是言語治療？", "什么是言语治疗？"),
      content: t(
        "Speech therapy helps people improve their ability to communicate. A speech therapist works with individuals who have difficulties with speech sounds, language, voice, fluency, or swallowing.",
        "言語治療幫助人們改善溝通能力。言語治療師與有語音、語言、聲音、流暢度或吞嚥困難的人一起工作。",
        "言语治疗帮助人们改善沟通能力。言语治疗师与有语音、语言、声音、流畅度或吞咽困难的人一起工作。",
      ),
    },
    {
      icon: Users,
      title: t("Common Speech Difficulties", "常見語言障礙", "常见语言障碍"),
      content: t(
        "Common issues include articulation disorders, phonological disorders, apraxia of speech, stuttering, and voice disorders. In Cantonese speakers, tone production and nasal sound distinctions are frequent areas of focus.",
        "常見問題包括構音障礙、音韻障礙、言語失用症、口吃和聲音障礙。在廣東話使用者中，聲調產生和鼻音區分是常見的重點領域。",
        "常见问题包括构音障碍、音韵障碍、言语失用症、口吃和声音障碍。在广东话使用者中，声调产生和鼻音区分是常见的重点领域。",
      ),
    },
    {
      icon: BookOpen,
      title: t("How Speech Therapy Works", "言語治療如何運作", "言语治疗如何运作"),
      content: t(
        "Treatment begins with an assessment to identify specific difficulties. The therapist then creates a tailored plan with exercises. Sessions may include practising sounds, strengthening mouth muscles, and using technology-assisted tools.",
        "治療從評估開始，以識別特定困難。治療師制定量身定做的計劃。療程可能包括練習聲音、加強口腔肌肉及使用科技輔助工具。",
        "治疗从评估开始，以识别特定困难。治疗师制定量身定做的计划。疗程可能包括练习声音、加强口腔肌肉及使用科技辅助工具。",
      ),
    },
  ];

  return (
    <div className="min-h-full bg-background">
      {/* Search Header */}
      <section className="px-4 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <img src={mascot} alt="" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-lg font-extrabold text-foreground">
                {t("Find Speech Therapy", "尋找言語治療", "寻找言语治疗")}
              </h1>
              <p className="text-[11px] text-muted-foreground">
                {t("Search providers in Hong Kong", "搜尋香港的言語治療服務", "搜索香港的言语治疗服务")}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t("Search by name, district, or service...", "搜尋名稱、地區或服務...", "搜索名称、地区或服务...")}
              className="w-full h-12 pl-10 pr-10 rounded-2xl border-2 border-border bg-card text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-3">
        <div className="max-w-2xl mx-auto">
          {/* Region pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {regionOptions.map(r => (
              <button
                key={r.key}
                onClick={() => { setSelectedRegion(r.key); setSelectedDistrict('all'); }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                  selectedRegion === r.key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border hover:border-primary/30'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* District pills */}
          {districtOptions.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mt-2 scrollbar-none">
              <button
                onClick={() => setSelectedDistrict('all')}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border-2 transition-all ${
                  selectedDistrict === 'all'
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-card text-foreground border-border hover:border-accent/30'
                }`}
              >
                {t('All Districts', '全部', '全部')}
              </button>
              {districtOptions.map(d => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDistrict(d.value)}
                  className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border-2 transition-all ${
                    selectedDistrict === d.value
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-card text-foreground border-border hover:border-accent/30'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] text-muted-foreground font-bold mb-3">
            {filtered.length} {t('providers found', '個結果', '个结果')}
          </p>

          {filtered.length === 0 ? (
            <div className="bg-card border-2 border-border rounded-2xl p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-bold text-foreground mb-1">
                {t("No providers found", "找不到服務提供者", "找不到服务提供者")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("Try a different search or filter.", "嘗試不同的搜尋或篩選。", "尝试不同的搜索或筛选。")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(p => (
                <div key={p.id} className="bg-card border-2 border-border rounded-2xl p-4 hover:border-primary/20 transition-colors">
                  {/* Name & Type */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-foreground leading-tight">{getName(p)}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTypeColor(getType(p))}`}>
                        {getType(p)}
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 mb-2 ml-12">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{getAddress(p)}</p>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-4 ml-12 mb-2">
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline">
                        <Phone className="h-3 w-3" />
                        {p.phone}
                      </a>
                    )}
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline">
                        <Globe className="h-3 w-3" />
                        {t("Website", "網站", "网站")}
                      </a>
                    )}
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1.5 ml-12">
                    {getServices(p).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-3 flex gap-3">
            <AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t(
                "This list is for reference only. SpeakAble HK does not endorse or guarantee any provider. Please verify details directly.",
                "此列表僅供參考。SpeakAble HK 不為任何服務提供者背書或保證。請直接向服務提供者查詢詳情。",
                "此列表仅供参考。SpeakAble HK 不为任何服务提供者背书或保证。请直接向服务提供者查询详情。",
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Info Toggle */}
      <section className="px-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-full flex items-center justify-between bg-card border-2 border-border rounded-2xl p-4 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-extrabold text-foreground">
                {t("Learn About Speech Therapy", "了解言語治療", "了解言语治疗")}
              </span>
            </div>
            {showInfo ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {showInfo && (
            <div className="space-y-3 mt-3">
              {infoSections.map((section, i) => (
                <div key={i} className="bg-card border-2 border-border rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <section.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <h3 className="text-sm font-extrabold text-foreground">{section.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed ml-12">{section.content}</p>
                </div>
              ))}

              {/* Footer CTA */}
              <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 text-center">
                <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground mb-3">
                  {t("Want to practise your pronunciation?", "想練習你的發音嗎？", "想练习你的发音吗？")}
                </p>
                <Link to="/speech-quest">
                  <Button className="game-btn gap-2 font-extrabold text-sm" style={{ boxShadow: "0 4px 0 hsl(var(--primary-dark))" }}>
                    {t("Start Speech Quest", "開始語音冒險", "开始语音冒险")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SpeechTherapyInfoPage;
