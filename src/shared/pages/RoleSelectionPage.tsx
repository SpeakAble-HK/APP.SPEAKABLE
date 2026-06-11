import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Globe,
  Check,
  ArrowLeft,
  Users,
  Briefcase,
  Heart,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import logoUrl from "@/assets/logo.png";
import pipiUrl from "@/assets/pipi-hero.png";
import styles from "./RoleSelectionPage.module.css";

type LangCode = "zh-HK" | "zh-CN" | "en";

const LANGUAGES: Array<{ code: LangCode; label: string }> = [
  { code: "zh-HK", label: "繁體中文" },
  { code: "zh-CN", label: "簡體中文" },
  { code: "en", label: "English" },
];

type TrackTheme = "enhancement" | "improvement";

interface TrackTokens {
  gradient: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  iconBg: string;
  iconText: string;
  btnBg: string;
  btnText: string;
}

const TRACK_TOKENS: Record<TrackTheme, TrackTokens> = {
  enhancement: {
    gradient: "from-emerald-400 via-teal-400 to-cyan-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    cardBg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    cardBorder: "border-emerald-200",
    cardHover: "hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-200/50",
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    iconText: "text-white",
    btnBg: "bg-gradient-to-r from-emerald-500 to-teal-500",
    btnText: "text-white",
  },
  improvement: {
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
    cardBg: "bg-gradient-to-br from-violet-50 to-indigo-50",
    cardBorder: "border-violet-200",
    cardHover: "hover:border-violet-400 hover:shadow-lg hover:shadow-violet-200/50",
    iconBg: "bg-gradient-to-br from-violet-500 to-indigo-600",
    iconText: "text-white",
    btnBg: "bg-gradient-to-r from-violet-500 to-indigo-600",
    btnText: "text-white",
  },
};

interface PortalCardProps {
  theme: TrackTheme;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  btnLabel: string;
  onClick: () => void;
}

function PortalCard({ theme, Icon, title, description, btnLabel, onClick }: PortalCardProps) {
  const tk = TRACK_TOKENS[theme];
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex flex-col items-center rounded-2xl border-2 p-8 text-center cursor-pointer",
        "transition-all duration-300 hover:-translate-y-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        tk.cardBg,
        tk.cardBorder,
        tk.cardHover,
        styles["role-card-btn"]
      ].join(" ")}
      aria-label={title}
    >
      {/* Icon circle */}
      <div
        className={`mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${tk.iconBg} shadow-lg`}
        aria-hidden="true"
      >
        <Icon className={`h-9 w-9 ${tk.iconText}`} />
      </div>

      {/* Text */}
      <h3 className="mb-3 font-display text-2xl font-bold text-ink">{title}</h3>
      <p className="mb-6 min-h-[3.5rem] text-base leading-relaxed text-slate">
        {description}
      </p>
      <span
        className={[
          "w-full min-h-[48px] rounded-full px-6 py-3 text-base font-bold",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          tk.btnBg,
          tk.btnText,
          "shadow-md hover:shadow-lg",
          styles["role-card-label"]
        ].join(" ")}
      >
        {btnLabel}
      </span>
    </button>
  );
}

/** Animated background */
function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-300/20 to-teal-400/20 blur-3xl animate-[float_12s_ease-in-out_infinite]" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-violet-300/20 to-indigo-400/20 blur-3xl animate-[float_16s_ease-in-out_infinite_2s]" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-cyan-300/20 to-blue-400/20 blur-3xl animate-[float_14s_ease-in-out_infinite_4s]" />
    </div>
  );
}

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const currentLang =
    LANGUAGES.find((l) => l.code === (i18n.language as LangCode)) ?? LANGUAGES[0];

  const handleStudentEnter = () => {
    localStorage.setItem("speakable_role", "student");
    navigate("/auth");
  };

  const handleParentEnter = () => {
    localStorage.setItem("speakable_role", "parent");
    navigate("/auth");
  };

  const handleTherapistEnter = () => {
    localStorage.setItem("speakable_role", "professional");
    navigate("/therapist-portal");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 font-body text-ink antialiased">
      <AnimatedBackground />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="relative z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white transition-all hover:-translate-x-0.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="返回上一頁"
        >
          <ArrowLeft className="h-4 w-4 text-ink" aria-hidden="true" />
        </button>

        {/* Logo */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate("/"); }}
          className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-2 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
          aria-label="SpeakAble HK · 首頁"
        >
          <img src={logoUrl} alt="" className="h-8 w-8 rounded-md" />
          <span className="font-display text-[18px] font-bold text-ink">
            SpeakAble HK
          </span>
        </a>

        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-slate transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label={t("nav.changeLang", { lang: currentLang.label })}
          >
            <Globe className="h-5 w-5" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-md">
            {LANGUAGES.map(({ code, label }) => (
              <DropdownMenuItem
                key={code}
                onClick={() => i18n.changeLanguage(code)}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm"
                lang={code}
              >
                <span className="w-4 shrink-0">
                  {i18n.language === code && (
                    <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  )}
                </span>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ─ Main ─────────────────────────────────────────────────────── */}
      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-2xl px-6 pb-8 pt-12 text-center">
          <img
            src={pipiUrl}
            alt="PiPi 皮皮"
            className="mx-auto mb-6 block h-32 w-32 object-contain drop-shadow-lg animate-[float_3s_ease-in-out_infinite]"
          />
          <h1 className="mb-3 font-display text-4xl font-black tracking-tight text-ink">
            {t("roleSelect.title", "選擇你的入口")}
          </h1>
          <p className="text-lg leading-relaxed text-slate">
            {t("roleSelect.subtitle", "SpeakAble HK 分為 Enhancement 同 Improvement 兩大版本")}
          </p>
        </section>

        {/* Enhancement Track */}
        <section className="mx-auto max-w-6xl px-6 pb-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Speakable Enhancement</h2>
              <p className="text-sm text-slate">P1-P3 · 學生 + 家長體驗優化</p>
            </div>
            <span className="ml-auto rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              Active Development
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <PortalCard
              theme="enhancement"
              Icon={Users as ComponentType<SVGProps<SVGSVGElement>>}
              title={t("roleSelect.student.title", "學生入口")}
              description={t("roleSelect.student.desc", "每日練習廣東話發音、互動故事、AI 聲線克隆")}
              btnLabel={t("roleSelect.enter", "進入")}
              onClick={handleStudentEnter}
            />
            <PortalCard
              theme="enhancement"
              Icon={Heart as ComponentType<SVGProps<SVGSVGElement>>}
              title={t("roleSelect.parent.title", "家長入口")}
              description={t("roleSelect.parent.desc", "睇小朋友練習報告、AI 洞察建議、帳單管理")}
              btnLabel={t("roleSelect.enter", "進入")}
              onClick={handleParentEnter}
            />
          </div>
        </section>

        {/* Improvement Track */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Speakable Improvement</h2>
              <p className="text-sm text-slate">治療師工具 + NEPA 後台</p>
            </div>
            <span className="ml-auto rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
              Production Ready
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-1">
            <PortalCard
              theme="improvement"
              Icon={Briefcase as ComponentType<SVGProps<SVGSVGElement>>}
              title={t("roleSelect.professional.title", "治療師入口")}
              description={t("roleSelect.professional.desc", "管理學生進度、聲線校準、指派練習、NEPA 分析、自訂遊戲")}
              btnLabel={t("roleSelect.enter", "進入")}
              onClick={handleTherapistEnter}
            />
          </div>
        </section>

        {/* Footer info */}
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur">
            <h3 className="mb-3 font-display text-lg font-bold text-ink">版本說明</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-bold text-emerald-700"> Enhancement (P1-P3)</p>
                <ul className="space-y-1 text-sm text-slate">
                  <li>• P1: 學生 Portal — 練習、遊戲、進度追蹤</li>
                  <li>• P2: 家長 Portal — 報告、AI 洞察</li>
                  <li>• P3: Aura Journey + Syali Studio — 互動故事</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-violet-700">🔧 Improvement</p>
                <ul className="space-y-1 text-sm text-slate">
                  <li>• 治療師 Portal — 學生管理、校準、聲線克隆</li>
                  <li>• NEPA Portal — 神經網絡分析、疲勞檢測</li>
                  <li>• Game Builder — 自訂迷你遊戲</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
