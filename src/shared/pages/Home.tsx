import { useEffect, useRef, useState } from "react";
import heroStyles from "./HeroLanding.module.css";
import heroVideo from "@/assets/hero_video.mp4";
import homeSectionStyles from "./HomeSection.module.css";
import type { ComponentType, MouseEvent, SVGProps } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Coins,
  BarChart3,
  ShieldCheck,
  ClipboardList,
  LineChart,
  Workflow,
  Globe,
  Check,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import logoUrl from "@/assets/logo.png";
import pipiHeroUrl from "@/assets/pipi-hero.png";
import pipiFamiliesUrl from "@/assets/pipi-home.png";

// TODO(speakable): replace with the live Google Form URL once finalised
const SCHOOL_DEMO_URL = "#";
// TODO(speakable): replace with the live pilot application Google Form URL
const PILOT_APPLY_URL = "#";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type LangCode = "zh-HK" | "zh-CN" | "en";

const LANGUAGES: Array<{ code: LangCode; label: string }> = [
  { code: "zh-HK", label: "繁體中文" },
  { code: "zh-CN", label: "簡體中文" },
  { code: "en",    label: "English" },
];

const NAV_IDS = ["schools", "professionals", "families", "pilot"] as const;

const PARTNERS = ["School A", "NGO B", "Org C", "Supporter D"];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

/* ─── Decorative elements ─────────────────────────────────────── */

/** Faint sound-wave lines for the hero background */
function HeroWavePattern() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 right-0 h-56 w-full"
      viewBox="0 0 1440 224"
      preserveAspectRatio="none"
    >
      <path
        d="M0,112 C240,80 480,144 720,112 S1200,80 1440,112"
        stroke="#4FB4E8"
        strokeWidth="1.5"
        fill="none"
        opacity="0.08"
      />
      <path
        d="M0,130 C240,98 480,162 720,130 S1200,98 1440,130"
        stroke="#4FB4E8"
        strokeWidth="1"
        fill="none"
        opacity="0.055"
      />
      <path
        d="M0,148 C240,116 480,180 720,148 S1200,116 1440,148"
        stroke="#4FB4E8"
        strokeWidth="0.75"
        fill="none"
        opacity="0.035"
      />
      <path
        d="M0,112 C240,80 480,144 720,112 S1200,80 1440,112 L1440,224 L0,224 Z"
        fill="#4FB4E8"
        opacity="0.025"
      />
    </svg>
  );
}

/** Coral squiggle for the schools section corner */
function CoralAccent() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute bottom-6 right-6 h-28 w-28"
      viewBox="0 0 112 112"
    >
      <path
        d="M8,56 Q28,36 48,56 T88,56 T108,56"
        stroke="#FF8A5C"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.18"
      />
      <path
        d="M16,72 Q36,52 56,72 T96,72"
        stroke="#FF8A5C"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.11"
      />
    </svg>
  );
}

/** Sunshine wave for the families section */
function SunshineWave() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0 h-48 w-48 opacity-[0.07]"
      viewBox="0 0 192 192"
    >
      <path d="M0,80 Q48,52 96,80 T192,80" stroke="#FFCB4D" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M0,104 Q48,76 96,104 T192,104" stroke="#FFCB4D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M0,128 Q48,100 96,128 T192,128" stroke="#FFCB4D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ─── Home ────────────────────────────────────────────────────── */

import { useNavigate } from "react-router-dom";
export default function Home() {
  const { t } = useTranslation();
  // Hero video/fade state
  const [videoDone, setVideoDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    document.title = "SpeakAble HK · Daily Cantonese speech practice";
    const overlayTimer = window.setTimeout(() => setOverlayVisible(true), 500);
    if (videoDone) {
      setTimeout(() => setFadeOut(true), 300); // slight delay for smoothness
    }
    return () => window.clearTimeout(overlayTimer);
  }, [videoDone]);

  const handleVideoEnd = () => {
    setVideoDone(true);
  };

  const handleSignIn = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-white font-body text-ink">
      {/* Hero video banner section */}
      <div className={heroStyles["hero-bg"]}>
        <div className={heroStyles["hero-stage"]}>
          <video
            ref={videoRef}
            className={heroStyles["hero-video"] + (fadeOut ? " " + heroStyles["fade-out"] : "")}
            src={heroVideo}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            onError={handleVideoEnd}
          />
          <div className={heroStyles["hero-fg"] + (overlayVisible ? " " + heroStyles["visible"] : "")}
            aria-live="polite"
          >
            <div className={heroStyles["hero-overlay-card"]}>
              <div className={heroStyles["hero-title"]}>SpeakAble Hong Kong</div>
              <p className={heroStyles["hero-subtitle"]}>透過導向式冒險、聲音複製同互動任務，循序漸進練好廣東話發音。</p>
              <button className={heroStyles["hero-signin-btn"]} onClick={handleSignIn}>
                登入
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main dashboard content after hero */}
      {videoDone && fadeOut && (
        <>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
          >
            {t("a11y.skipToContent")}
          </a>
          <SiteHeader />
          <main id="main">
            <Hero />
            <TrustBar />
            <SchoolsSection />
            <ProfessionalsSection />
            <FamiliesSection />
            <PilotSection />
          </main>
          <SiteFooter />
        </>
      )}
    </div>
  );
}

/* ─── Navigation ──────────────────────────────────────────────── */

function SiteHeader() {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToId(id);
  };

  const navKeys: Record<typeof NAV_IDS[number], string> = {
    schools:       "nav.forSchools",
    professionals: "nav.forProfessionals",
    families:      "nav.forFamilies",
    pilot:         "nav.pilot",
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];
  const changeLanguage = (code: LangCode) => { i18n.changeLanguage(code); setMenuOpen(false); };

  return (
    <header className="sticky top-0 z-40 border-b-[0.5px] border-mist bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      {/* ── Main bar ── */}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <a
          href="#hero"
          onClick={handleNavClick("hero")}
          className="inline-flex min-h-tap items-center gap-2"
          aria-label="SpeakAble HK · home"
        >
          <img src={logoUrl} alt="" className="h-8 w-8 rounded-md" />
          <span className="font-display text-[18px] font-medium text-ink">SpeakAble HK</span>
        </a>

        {/* Desktop nav links */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={handleNavClick(id)}
                  className="inline-flex min-h-tap items-center text-small text-slate transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-none"
                >
                  {t(navKeys[id])}
                </a>
              </li>
            ))}
            {/* Aura links */}
            <li>
              <Link
                to="/aura-story"
                className="inline-flex min-h-tap items-center text-small font-semibold text-purple-600 hover:text-purple-800 focus-visible:text-purple-800 focus-visible:outline-none border border-purple-100 rounded px-3 py-1 ml-2 bg-purple-50/60"
                style={{ transition: 'background 0.2s, color 0.2s' }}
              >
                Aura Story
              </Link>
            </li>
            <li>
              <Link
                to="/aura-journey"
                className="inline-flex min-h-tap items-center text-small font-semibold text-sky-600 hover:text-sky-800 focus-visible:text-sky-800 focus-visible:outline-none border border-sky-100 rounded px-3 py-1 ml-2 bg-sky-50/60"
                style={{ transition: 'background 0.2s, color 0.2s' }}
              >
                Aura Journey
              </Link>
            </li>
          </ul>
        </nav>

        {/* Desktop CTAs + language selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-md text-slate transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
              aria-label={t("nav.changeLang", { lang: currentLang.label })}
            >
              <Globe className="size-5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-md">
              {LANGUAGES.map(({ code, label }) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => changeLanguage(code)}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 text-small"
                  lang={code}
                >
                  <span className="w-4 shrink-0">
                    {i18n.language === code && (
                      <Check className="size-3.5 text-sky-600" aria-hidden="true" />
                    )}
                  </span>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/role-select"
            className="hidden min-h-tap items-center px-2 text-small text-slate hover:text-ink sm:inline-flex"
          >
            {t("nav.login")}
          </Link>

          <Button asChild className="hidden sm:inline-flex">
            <a href={SCHOOL_DEMO_URL} target="_blank" rel="noreferrer">
              {t("nav.bookDemo")}
            </a>
          </Button>

          {/* Hamburger — mobile only */}
          {(() => {
            const ariaLabel = menuOpen ? "Close menu" : "Open menu";
            return (
              <button
                type="button"
                className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-md text-slate transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 md:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen ? 'true' : 'false'}
                aria-controls="mobile-nav"
                aria-label={ariaLabel}
              >
                {menuOpen
                  ? <X className="size-5" aria-hidden="true" />
                  : <Menu className="size-5" aria-hidden="true" />}
              </button>
            );
          })()}
        </div>
      </div>

      {/* ── Mobile nav panel ── */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="border-t-[0.5px] border-mist bg-white/95 backdrop-blur md:hidden"
        >
          <ul className="mx-auto max-w-6xl divide-y divide-mist px-6">
            {NAV_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={handleNavClick(id)}
                  className="flex min-h-tap items-center py-1 text-body text-slate transition-colors hover:text-ink"
                >
                  {t(navKeys[id])}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile CTAs */}
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 pb-5 pt-4">
            <Button asChild className="w-full">
              <a href={SCHOOL_DEMO_URL} target="_blank" rel="noreferrer">
                {t("nav.bookDemo")}
              </a>
            </Button>
            <Link
              to="/role-select"
              onClick={() => setMenuOpen(false)}
              className="inline-flex min-h-tap items-center justify-center rounded-pill border-[0.5px] border-mist px-6 text-small text-slate hover:text-ink"
            >
              {t("nav.login")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────── */

function Hero() {
  const { t } = useTranslation();

  return (
    <section id="hero" className="relative overflow-hidden scroll-mt-20 bg-cloud">
      <HeroWavePattern />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-6 py-20 md:grid-cols-[60%_40%] md:py-28">
        {/* Left: all content, left-aligned */}
        <div>
          <span className="inline-flex items-center rounded-pill bg-sky-100 px-3 py-1 text-small font-medium text-sky-800">
            {t("hero.badge")}
          </span>

          <h1 className="mt-6 font-display text-[42px] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-[52px] md:text-[56px]">
            {t("hero.title")}
          </h1>

          <p className="mt-5 max-w-[34rem] text-[17px] leading-[1.7] text-slate">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={SCHOOL_DEMO_URL} target="_blank" rel="noreferrer">
                {t("hero.ctaDemo")}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href="#families"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("families");
                }}
              >
                {t("hero.ctaFamilies")}
              </a>
            </Button>
          </div>

          <p className="mt-5 text-small text-slate">{t("hero.pilotNote")}</p>
        </div>

        {/* Right: PiPi, larger, slightly overlapping edge */}
        <div className="relative flex items-center justify-center md:-mr-6 md:justify-end">
          <div
            aria-hidden="true"
            className="absolute h-[280px] w-[280px] rounded-full bg-sunshine/20 blur-3xl"
          />
          <img
            src={pipiHeroUrl}
            alt={t("hero.pipiAlt")}
            className="relative z-10 h-auto w-[180px] motion-safe:animate-pipi-bob sm:w-[220px] md:w-[300px]"
          />
        </div>
      </div>
    </section>
  );
}

/* ─── Trust bar ───────────────────────────────────────────────── */

function TrustBar() {
  const { t } = useTranslation();

  return (
    <section aria-label={t("trust.label")} className="border-t border-sky-200 bg-sky-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 md:flex-row md:items-center md:gap-10">
        <span className="shrink-0 text-small font-medium tracking-wide text-sky-700">
          {t("trust.label")}
        </span>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {PARTNERS.map((name) => (
            <li key={name} className="font-display text-[15px] font-medium text-sky-900 opacity-40">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── Stacked horizontal feature card ────────────────────────── */

type StackedCardProps = {
  Icon: IconType;
  title: string;
  body: string;
  iconBg: string;
  iconColor: string;
  cardClass: string;
};

function StackedFeatureCard({ Icon, title, body, iconBg, iconColor, cardClass }: StackedCardProps) {
  return (
    <div
      className={`flex items-start gap-4 rounded-lg p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardClass}`}
    >
      <div
        className={`mt-0.5 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-pill ${iconBg} ${iconColor}`}
      >
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-display text-[18px] font-medium text-ink">{title}</h3>
        <p className="mt-1 text-small leading-relaxed text-slate">{body}</p>
      </div>
    </div>
  );
}

/* ─── Schools section ─────────────────────────────────────────── */

function SchoolsSection() {
  const { t } = useTranslation();

  const features: Array<{ Icon: IconType; titleKey: string; bodyKey: string }> = [
    { Icon: Coins,       titleKey: "schools.costTitle",     bodyKey: "schools.costDesc" },
    { Icon: BarChart3,   titleKey: "schools.trackingTitle", bodyKey: "schools.trackingDesc" },
    { Icon: ShieldCheck, titleKey: "schools.privateTitle",  bodyKey: "schools.privateDesc" },
  ];

  return (
    <section id="schools" className="relative overflow-hidden scroll-mt-20 bg-white">
      <CoralAccent />
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-start gap-12 md:grid-cols-2 md:gap-20">
          {/* Left: heading + body */}
          <div className="md:pt-2">
            <p className="text-small font-medium tracking-[0.08em] text-sky-600">
              {t("schools.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-[30px] font-medium leading-tight text-ink sm:text-[36px]">
              {t("schools.title")}
            </h2>
            <p className="mt-4 text-[17px] leading-[1.7] text-slate">
              {t("schools.subtitle")}
            </p>
          </div>

          {/* Right: stacked cards */}
          <div className="flex flex-col gap-3">
            {features.map(({ Icon, titleKey, bodyKey }) => (
              <StackedFeatureCard
                key={titleKey}
                Icon={Icon}
                title={t(titleKey)}
                body={t(bodyKey)}
                iconBg="bg-sky-100"
                iconColor="text-sky-600"
                cardClass="bg-sky-50"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Professionals section ───────────────────────────────────── */

function ProfessionalsSection() {
  const { t } = useTranslation();

  const features: Array<{ Icon: IconType; titleKey: string; bodyKey: string }> = [
    { Icon: ClipboardList, titleKey: "professionals.assignTitle",  bodyKey: "professionals.assignDesc" },
    { Icon: LineChart,     titleKey: "professionals.reportsTitle", bodyKey: "professionals.reportsDesc" },
    { Icon: Workflow,      titleKey: "professionals.flowTitle",    bodyKey: "professionals.flowDesc" },
  ];

  return (
    <section
      id="professionals"
      className="relative overflow-hidden scroll-mt-20 bg-gradient-to-br from-cloud to-[#E8F7F3]"
    >
      {/* Organic blob top-left */}
      <div
        aria-hidden="true"
        className={homeSectionStyles["organic-blob"]}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-start gap-12 md:grid-cols-2 md:gap-20">
          {/* Left: stacked cards (reversed vs schools) */}
          <div className="flex flex-col gap-3 md:order-1">
            {features.map(({ Icon, titleKey, bodyKey }) => (
              <StackedFeatureCard
                key={titleKey}
                Icon={Icon}
                title={t(titleKey)}
                body={t(bodyKey)}
                iconBg="bg-mint/40"
                iconColor="text-ink"
                cardClass="border-[0.5px] border-mint/40 bg-white"
              />
            ))}
          </div>

          {/* Right: heading + body */}
          <div className="md:order-2 md:pt-2">
            <p className="text-small font-medium tracking-[0.08em] text-sky-600">
              {t("professionals.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-[30px] font-medium leading-tight text-ink sm:text-[36px]">
              {t("professionals.title")}
            </h2>
            <p className="mt-4 text-[17px] leading-[1.7] text-slate">
              {t("professionals.subtitle")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Families section ────────────────────────────────────────── */

function FamiliesSection() {
  const { t } = useTranslation();

  return (
    <section id="families" className="relative overflow-hidden scroll-mt-20 bg-[#FFF6E0]">
      <SunshineWave />

      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-10 md:grid-cols-[280px_1fr] md:gap-16">
          {/* PiPi: left, larger */}
          <div className="relative flex justify-center md:justify-start">
            <div
              aria-hidden="true"
              className="absolute inset-4 rounded-full bg-sunshine/25 blur-3xl"
            />
            <img
              src={pipiFamiliesUrl}
              alt={t("families.pipiAlt")}
              className="relative z-10 h-auto w-[200px] motion-safe:animate-pipi-bob md:w-[260px]"
            />
          </div>

          {/* Content: right, left-aligned */}
          <div>
            <p className="text-small font-medium tracking-[0.08em] text-[#8B6914]">
              {t("families.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-[30px] font-medium leading-tight text-ink sm:text-[36px]">
              {t("families.title")}
            </h2>
            <p className="mt-4 max-w-xl text-[17px] leading-[1.7] text-slate">
              {t("families.subtitle")}
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="bg-coral text-white transition-all hover:scale-[1.02] hover:bg-coral/90 hover:shadow-[0_4px_20px_rgba(255,138,92,0.35)] active:scale-100"
              >
                <a href="#families">{t("families.cta")}</a>
              </Button>
            </div>
            <p className="mt-4 text-small text-slate">{t("families.note")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pilot CTA ───────────────────────────────────────────────── */

function PilotSection() {
  const { t } = useTranslation();

  return (
    <section id="pilot" className="relative overflow-hidden scroll-mt-20 bg-ink text-white">
      {/* Diagonal gradient vignette from bottom-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-900 opacity-30 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-[30px] font-medium leading-tight text-white sm:text-[36px]">
          {t("footer.title")}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-[1.7] text-white/75">
          {t("footer.subtitle")}
        </p>
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="bg-sunshine text-ink transition-all hover:scale-[1.02] hover:bg-sunshine/90 hover:shadow-[0_0_28px_rgba(255,203,77,0.5)] active:scale-100"
          >
            <a href={PILOT_APPLY_URL} target="_blank" rel="noreferrer">
              {t("footer.cta")}
            </a>
          </Button>
        </div>
        <p className="mt-5 flex items-center justify-center gap-2 text-small text-white/80">
          <img src={pipiHeroUrl} alt="" className="h-5 w-5 object-contain opacity-80" />
          {t("footer.note")}
        </p>
      </div>
    </section>
  );
}

/* ─── Site footer ─────────────────────────────────────────────── */

function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-sunshine/25 bg-ink">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-10 text-small text-white/75 md:grid-cols-3 md:items-center">
        {/* Left: brand mark */}
        <div className="flex items-center gap-2.5">
          <img src={logoUrl} alt="" className="h-6 w-6 rounded-md" />
          <span className="font-display font-medium text-white">SpeakAble HK</span>
        </div>

        {/* Center: legal links */}
        <nav aria-label="Footer" className="flex items-center gap-6 md:justify-center">
          <Link to="/privacy" className="transition-colors hover:text-white">
            {t("footer.privacy")}
          </Link>
          <Link to="/terms" className="transition-colors hover:text-white">
            {t("footer.terms")}
          </Link>
        </nav>

        {/* Right: contact */}
        <div className="md:text-right">
          <a
            href={`mailto:${t("footer.contact")}`}
            className="transition-colors hover:text-white"
          >
            {t("footer.contact")}
          </a>
        </div>
      </div>
    </footer>
  );
}
