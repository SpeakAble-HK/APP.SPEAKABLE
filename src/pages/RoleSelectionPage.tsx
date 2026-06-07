import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Globe,
  Check,
  ArrowLeft,
  Users,
  Briefcase,
  Info,
} from "lucide-react";
import type { ComponentType, SVGProps, KeyboardEvent } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoUrl from "@/assets/logo.png";
import pipiUrl from "@/assets/pipi-hero.png";
import styles from "./RoleSelectionPage.module.css";

type LangCode = "zh-HK" | "zh-CN" | "en";

const LANGUAGES: Array<{ code: LangCode; label: string }> = [
  { code: "zh-HK", label: "繁體中文" },
  { code: "zh-CN", label: "簡體中文" },
  { code: "en", label: "English" },
];

type RoleTheme = "sky" | "sunshine" | "mint";

interface ThemeTokens {
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  iconText: string;
  btnCls: string;
}

const THEME_TOKENS: Record<RoleTheme, ThemeTokens> = {
  sky: {
    cardBg: "bg-sky-50",
    cardBorder: "border-sky-100 hover:border-sky-400",
    iconBg: "bg-sky-400",
    iconText: "text-white",
    btnCls: "bg-sky-400 text-white hover:bg-sky-600",
  },
  sunshine: {
    cardBg: "bg-[#FFF6E0]",
    cardBorder: "border-[#FFE9B5] hover:border-sunshine",
    iconBg: "bg-sunshine",
    iconText: "text-ink",
    btnCls: "bg-sunshine text-ink hover:opacity-90",
  },
  mint: {
    cardBg: "bg-[#E8F7F3]",
    cardBorder: "border-[#C5EDE0] hover:border-mint",
    iconBg: "bg-mint",
    iconText: "text-white",
    btnCls: "bg-mint text-white hover:opacity-90",
  },
};

interface RoleCardProps {
  theme: RoleTheme;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  btnLabel: string;
  onClick: () => void;
}

function RoleCard({ theme, Icon, title, description, btnLabel, onClick }: RoleCardProps) {
  const tk = THEME_TOKENS[theme];
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex flex-col items-center rounded-lg border p-8 text-center cursor-pointer",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600",
        tk.cardBg,
        tk.cardBorder,
        styles["role-card-btn"]
      ].join(" ")}
      aria-label={title}
    >
      {/* Icon circle */}
      <div
        className={`mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${tk.iconBg}`}
        aria-hidden="true"
      >
        <Icon className={`h-9 w-9 ${tk.iconText}`} />
      </div>

      {/* Text */}
      <h3 className="mb-3 font-display text-h3 font-medium text-ink">{title}</h3>
      <p className="mb-6 min-h-[3.5rem] text-small leading-relaxed text-slate">
        {description}
      </p>
      <span
        className={[
          "w-full min-h-tap rounded-pill px-6 py-3 text-small font-medium",
          "transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600",
          tk.btnCls,
          styles["role-card-label"]
        ].join(" ")}
      >
        {btnLabel}
      </span>
    </button>
  );
}

/** Faint sound-wave SVG for the page background */
function WaveBackground() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 h-[420px] w-full"
      viewBox="0 0 1440 420"
      preserveAspectRatio="none"
    >
      <path
        d="M0,210 C360,155 720,265 1080,210 S1440,155 1440,210"
        stroke="#4FB4E8"
        strokeWidth="2"
        fill="none"
        opacity="0.07"
      />
      <path
        d="M0,245 C360,190 720,300 1080,245 S1440,190 1440,245"
        stroke="#4FB4E8"
        strokeWidth="1.5"
        fill="none"
        opacity="0.045"
      />
      <path
        d="M0,280 C360,225 720,335 1080,280 S1440,225 1440,280"
        stroke="#4FB4E8"
        strokeWidth="1"
        fill="none"
        opacity="0.028"
      />
    </svg>
  );
}

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const currentLang =
    LANGUAGES.find((l) => l.code === (i18n.language as LangCode)) ?? LANGUAGES[0];

  const handleRoleSelect = (role: "student" | "professional") => {
    localStorage.setItem("speakable_role", role);
    if (role === "student") navigate("/auth");
    else navigate("/st-dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cloud font-body text-ink antialiased">
      <WaveBackground />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="relative z-10 flex h-16 items-center justify-between border-b-[0.5px] border-mist bg-white/80 px-6 backdrop-blur">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex min-h-tap min-w-tap items-center justify-center rounded-full border-[0.5px] border-mist bg-white transition-all hover:-translate-x-0.5 hover:bg-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          aria-label="返回上一頁"
        >
          <ArrowLeft className="h-4 w-4 text-ink" aria-hidden="true" />
        </button>

        {/* Logo — absolutely centered so it doesn't shift with side buttons */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate("/"); }}
          className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-2 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-sm"
          aria-label="SpeakAble HK · 首頁"
        >
          <img src={logoUrl} alt="" className="h-8 w-8 rounded-md" />
          <span className="font-display text-[18px] font-medium text-ink">
            SpeakAble HK
          </span>
        </a>

        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-md text-slate transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            aria-label={t("nav.changeLang", { lang: currentLang.label })}
          >
            <Globe className="h-5 w-5" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-md">
            {LANGUAGES.map(({ code, label }) => (
              <DropdownMenuItem
                key={code}
                onClick={() => i18n.changeLanguage(code)}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 text-small"
                lang={code}
              >
                <span className="w-4 shrink-0">
                  {i18n.language === code && (
                    <Check className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
                  )}
                </span>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-xl px-6 pb-10 pt-12 text-center">
          <img
            src={pipiUrl}
            alt="PiPi 皮皮"
            className={["mx-auto mb-6 block h-44 w-44 animate-pipi-bob object-contain drop-shadow-md", styles["pipi-hero-img"]].join(" ")}
          />
          <h1 className="mb-3 font-display text-[36px] font-medium leading-tight tracking-tight text-ink">
            {t("roleSelect.title")}
          </h1>
          <p className="text-body leading-relaxed text-slate">
            {t("roleSelect.subtitle")}
          </p>
        </section>

        {/* Role cards */}
        <section
          className="mx-auto grid max-w-5xl gap-6 px-6 pb-20 md:grid-cols-3"
          aria-label={t("roleSelect.title")}
        >
          <RoleCard
            theme="sky"
            Icon={Users as ComponentType<SVGProps<SVGSVGElement>>}
            title={t("roleSelect.student.title")}
            description={t("roleSelect.student.desc")}
            btnLabel={t("roleSelect.selectRole")}
            onClick={() => handleRoleSelect("student")}
          />
          <RoleCard
            theme="sunshine"
            Icon={Briefcase as ComponentType<SVGProps<SVGSVGElement>>}
            title={t("roleSelect.professional.title")}
            description={t("roleSelect.professional.desc")}
            btnLabel={t("roleSelect.selectRole")}
            onClick={() => handleRoleSelect("professional")}
          />
          <RoleCard
            theme="mint"
            Icon={Info as ComponentType<SVGProps<SVGSVGElement>>}
            title={t("roleSelect.public.title")}
            description={t("roleSelect.public.desc")}
            btnLabel={t("roleSelect.public.button")}
            onClick={() => { localStorage.setItem("speakable_role", "public"); navigate("/ngo"); }}
          />
        </section>
      </main>
    </div>
  );
}
