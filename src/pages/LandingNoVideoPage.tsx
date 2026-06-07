import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Mic2,
  Play,
  Star,
  Target,
  Trophy,
  UserRound,
  Volume2,
} from "lucide-react";

import logoUrl from "@/assets/logo.png";
import pipiHeroUrl from "@/assets/pipi-hero.png";

const navItems = [
  { label: "首頁", href: "#home" },
  { label: "功能", href: "#features" },
  { label: "課程", href: "#courses" },
  { label: "定價", href: "#pricing" },
  { label: "關於我們", href: "#about" },
];

const features = [
  {
    icon: Mic2,
    title: "AI 發音分析",
    description: "即時分析發音準確度，提供清晰、個人化的改善建議。",
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: BookOpen,
    title: "互動課程",
    description: "以日常生活、學校、工作同旅遊情境練習實用廣東話。",
    color: "from-emerald-400 to-green-600",
  },
  {
    icon: MessageCircle,
    title: "智能對話練習",
    description: "與 AI 對話練習聽講能力，逐步建立開口信心。",
    color: "from-violet-500 to-indigo-600",
  },
  {
    icon: Target,
    title: "個人學習追蹤",
    description: "追蹤進度、設定目標，讓每一次練習都有方向。",
    color: "from-amber-400 to-orange-500",
  },
];

const stats = [
  { icon: UserRound, value: "50,000+", label: "滿意學員" },
  { icon: Star, value: "4.9/5", label: "用戶評分" },
  { icon: BookOpen, value: "300+", label: "互動課程" },
  { icon: Trophy, value: "95%", label: "學員進步率" },
];

const courseTopics = ["日常會話", "校園溝通", "工作應對", "旅遊情境", "聲調練習", "聽力理解"];

export default function LandingNoVideoPage() {
  const navigate = useNavigate();

  const goToSignIn = () => navigate("/auth");

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4fbff] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/92 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
          <a href="#home" className="flex items-center gap-3" aria-label="Speakable HK home">
            <img src={logoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
            <div className="leading-tight">
              <p className="text-2xl font-black tracking-tight text-blue-600">
                Speakable <span className="text-amber-500">HK</span>
              </p>
              <p className="text-xs font-semibold text-slate-400">Your Voice, Your Future</p>
            </div>
          </a>

          <nav className="hidden items-center gap-9 text-base font-bold text-slate-600 lg:flex" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative py-2 transition hover:text-blue-600 first:text-blue-600"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={goToSignIn}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 text-base font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
          >
            登入
          </button>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-100">
        <div className="absolute right-0 top-10 hidden h-[38rem] w-[34rem] rounded-l-full bg-sky-200/45 blur-3xl lg:block" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 hidden h-80 w-[34rem] bg-gradient-to-t from-sky-300/45 to-transparent lg:block" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2 text-base font-black text-blue-600">
              <Star className="h-5 w-5 fill-amber-300 text-amber-300" />
              AI 粵語學習平台
            </span>

            <h1 className="mt-8 text-5xl font-black leading-tight text-slate-950 sm:text-6xl lg:text-7xl">
              掌握流利粵語，
              <span className="block text-blue-600">從「聲」開始！</span>
            </h1>

            <p className="mt-7 max-w-xl text-xl font-medium leading-relaxed text-slate-600">
              結合 AI 科技與互動學習，讓你自信開口，輕鬆融入香港生活與文化。
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={goToSignIn}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 text-lg font-black text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                登入
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#features"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 text-lg font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
              >
                <Play className="h-5 w-5 text-blue-500" />
                了解功能
              </a>
            </div>
          </div>

          <div className="relative min-h-[34rem]">
            <div className="absolute left-4 top-5 hidden rounded-[2rem] bg-white/78 px-7 py-4 text-xl font-black text-blue-600 shadow-xl shadow-sky-200/70 backdrop-blur md:block">
              練習中...
            </div>

            <img
              src={pipiHeroUrl}
              alt="Speakable HK mascot wearing headphones"
              className="absolute left-1/2 top-2 z-10 h-auto w-[22rem] -translate-x-1/2 drop-shadow-2xl sm:w-[28rem] lg:left-[38%] lg:w-[31rem]"
            />

            <div className="absolute bottom-2 right-0 w-full max-w-md rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-2xl shadow-sky-200/70 backdrop-blur sm:right-6">
              <div className="flex items-center gap-3 text-base font-black text-slate-700">
                <Volume2 className="h-5 w-5 text-blue-500" />
                練習發音
              </div>
              <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-2xl font-black text-slate-900">
                  我想飲杯<span className="text-blue-600">奶茶</span>。
                </p>
                <p className="mt-2 text-base font-semibold text-slate-500">ngo5 soeng2 jam2 bui1 naai5 caa4</p>
                <div className="mt-5 flex h-12 items-center gap-1">
                  {Array.from({ length: 34 }).map((_, index) => (
                    <span
                      key={index}
                      className="w-1.5 rounded-full bg-blue-500"
                      style={{ height: `${14 + ((index * 7) % 28)}px`, opacity: index > 23 ? 0.2 : 1 }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full border-8 border-emerald-400 text-2xl font-black text-slate-800">
                    92
                  </div>
                  <div>
                    <p className="text-lg font-black text-emerald-600">發音很標準！</p>
                    <p className="text-sm font-semibold text-slate-500">繼續保持，您真棒！</p>
                  </div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-5 py-12 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, description, color }) => (
            <article key={title} className="rounded-2xl border border-slate-100 bg-white p-7 shadow-lg shadow-sky-100/70">
              <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                <Icon className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-900">{title}</h2>
              <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">{description}</p>
              <a href="#courses" className="mt-5 inline-flex items-center gap-2 font-black text-blue-600">
                了解更多
                <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f5fbff] px-5 py-8 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-sky-100/70 md:grid-cols-4 md:p-8">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center justify-center gap-5 border-slate-200 py-4 md:border-r md:last:border-r-0">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-500">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-blue-600">{value}</p>
                <p className="text-base font-semibold text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="bg-white px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-base font-black text-blue-600">課程內容</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              覆蓋生活、學校與工作場景
            </h2>
            <p className="mt-5 text-lg font-medium leading-relaxed text-slate-600">
              每個主題都配合聽、講、讀和即時回饋，讓學員用自然節奏累積粵語能力。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {courseTopics.map((topic) => (
              <div key={topic} className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-sky-50/70 p-5">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                <span className="text-lg font-black text-slate-800">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-gradient-to-br from-blue-600 to-cyan-600 px-5 py-20 text-white md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-base font-black text-blue-100">定價</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">登入後查看適合你的學習方案</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-relaxed text-blue-50">
            Speakable HK 支援學生、家庭、治療師及機構使用。登入後可按身份進入相應入口。
          </p>
          <button
            type="button"
            onClick={goToSignIn}
            className="mt-9 inline-flex min-h-14 items-center justify-center rounded-2xl bg-white px-9 text-lg font-black text-blue-600 shadow-xl shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
          >
            前往登入
          </button>
        </div>
      </section>

      <section id="about" className="bg-white px-5 py-16 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-950">Speakable HK</h2>
            <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-600">
              為香港粵語學習與言語訓練而設，將 AI 發音分析、互動課程和進度追蹤放在同一個清晰易用的平台。
            </p>
          </div>
          <button
            type="button"
            onClick={goToSignIn}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-7 text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            登入 Speakable HK
          </button>
        </div>
      </section>
    </main>
  );
}
