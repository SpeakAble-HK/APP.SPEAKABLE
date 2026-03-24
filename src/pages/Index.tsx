import { useNavigate } from "react-router-dom";
import { ArrowRight, Mic, Brain, Map, Sparkles, Volume2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroMascot from "@/assets/pipi-mascot.png";
import logoImg from "@/assets/logo.png";
import featureSpeak from "@/assets/feature-speak.png";
import featureAI from "@/assets/feature-ai.png";
import featureQuest from "@/assets/feature-quest.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(220,20%,8%)] text-[hsl(0,0%,95%)] flex flex-col overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[hsl(220,20%,8%/0.85)] border-b border-[hsl(220,14%,18%)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="SpeakAble HK" className="h-9 w-9 object-contain" />
            <span className="text-lg font-extrabold tracking-tight">SpeakAble HK</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/role-select")}
            className="rounded-full border-[hsl(174,62%,47%/0.5)] text-[hsl(174,62%,60%)] hover:bg-[hsl(174,62%,47%/0.1)] hover:text-[hsl(174,62%,70%)] bg-transparent"
          >
            開始使用
          </Button>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative flex flex-col items-center pt-20 pb-28 px-4">
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-[hsl(174,62%,47%/0.12)] blur-[100px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-60 h-60 rounded-full bg-[hsl(38,95%,60%/0.08)] blur-[80px] pointer-events-none" />

        <img
          src={heroMascot}
          alt="SpeakAble 吉祥物"
          className="h-40 w-40 sm:h-52 sm:w-52 object-contain mascot-bounce mb-8 drop-shadow-[0_20px_40px_hsl(174,62%,47%/0.3)]"
          width={512}
          height={512}
        />

        <h1 className="text-5xl sm:text-7xl font-extrabold text-center leading-tight mb-4">
          <span className="bg-gradient-to-r from-[hsl(174,62%,55%)] via-[hsl(174,50%,70%)] to-[hsl(38,95%,65%)] bg-clip-text text-transparent">
            用你嘅聲音學習
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-[hsl(220,10%,60%)] text-center mb-4 max-w-lg">
          個人化言語訓練 · 人工智能驅動 · 遊戲化學習
        </p>
        <p className="text-sm text-[hsl(220,10%,45%)] text-center mb-10 max-w-md">
          專為粵語設計嘅語音訓練平台，結合聲音克隆技術同互動遊戲，令學習更加有趣
        </p>

        <Button
          onClick={() => navigate("/role-select")}
          className="h-16 px-14 text-xl font-extrabold rounded-2xl bg-gradient-to-r from-[hsl(174,62%,47%)] to-[hsl(174,55%,55%)] hover:from-[hsl(174,62%,52%)] hover:to-[hsl(174,55%,60%)] text-[hsl(0,0%,100%)] gap-3 shadow-[0_6px_0_hsl(174,62%,35%),0_20px_40px_hsl(174,62%,47%/0.25)] hover:shadow-[0_4px_0_hsl(174,62%,35%),0_20px_40px_hsl(174,62%,47%/0.35)] active:shadow-[0_2px_0_hsl(174,62%,35%)] active:translate-y-[2px] transition-all duration-150"
        >
          免費開始
          <ArrowRight className="h-6 w-6" />
        </Button>

        <p className="mt-4 text-xs text-[hsl(220,10%,40%)]">
          無需登入 · 即刻體驗
        </p>
      </section>

      {/* ─── Scrolling banner ─── */}
      <div className="relative overflow-hidden border-y border-[hsl(220,14%,16%)] bg-[hsl(220,18%,10%)] py-4">
        <div className="flex animate-[scroll_20s_linear_infinite] gap-10 whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-10 items-center text-sm text-[hsl(220,10%,45%)] font-semibold">
              <span className="flex items-center gap-2"><Mic className="h-4 w-4 text-[hsl(174,62%,55%)]" /> 語音識別</span>
              <span>·</span>
              <span className="flex items-center gap-2"><Brain className="h-4 w-4 text-[hsl(38,95%,60%)]" /> 人工智能反饋</span>
              <span>·</span>
              <span className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-[hsl(174,62%,55%)]" /> 聲音克隆</span>
              <span>·</span>
              <span className="flex items-center gap-2"><Map className="h-4 w-4 text-[hsl(38,95%,60%)]" /> 冒險模式</span>
              <span>·</span>
              <span className="flex items-center gap-2"><Star className="h-4 w-4 text-[hsl(174,62%,55%)]" /> 粵語專屬</span>
              <span>·</span>
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[hsl(38,95%,60%)]" /> 遊戲化</span>
              <span className="pr-10">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Feature Showcase ─── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4">
          核心功能
        </h2>
        <p className="text-[hsl(220,10%,50%)] text-center mb-16 max-w-md mx-auto">
          為每位學習者量身打造嘅語音訓練體驗
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative rounded-3xl border-2 border-[hsl(220,14%,18%)] bg-[hsl(220,18%,11%)] p-8 hover:border-[hsl(174,62%,47%/0.4)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(174,62%,47%/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src={featureSpeak} alt="語音訓練" className="h-32 w-32 object-contain mx-auto mb-6 drop-shadow-lg" loading="lazy" width={512} height={512} />
            <h3 className="text-xl font-bold mb-2 text-center">🎙️ 語音訓練</h3>
            <p className="text-sm text-[hsl(220,10%,50%)] text-center leading-relaxed">
              錄低你嘅聲音，人工智能即時分析發音準確度，提供個人化建議
            </p>
          </div>

          <div className="group relative rounded-3xl border-2 border-[hsl(220,14%,18%)] bg-[hsl(220,18%,11%)] p-8 hover:border-[hsl(38,95%,60%/0.4)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(38,95%,60%/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src={featureAI} alt="人工智能反饋" className="h-32 w-32 object-contain mx-auto mb-6 drop-shadow-lg" loading="lazy" width={512} height={512} />
            <h3 className="text-xl font-bold mb-2 text-center">🤖 人工智能分析</h3>
            <p className="text-sm text-[hsl(220,10%,50%)] text-center leading-relaxed">
              智能語音辨識結合粵語拼音分析，即時回饋發音表現
            </p>
          </div>

          <div className="group relative rounded-3xl border-2 border-[hsl(220,14%,18%)] bg-[hsl(220,18%,11%)] p-8 hover:border-[hsl(174,62%,47%/0.4)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(174,62%,47%/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src={featureQuest} alt="冒險模式" className="h-32 w-32 object-contain mx-auto mb-6 drop-shadow-lg" loading="lazy" width={512} height={512} />
            <h3 className="text-xl font-bold mb-2 text-center">🏝️ 冒險模式</h3>
            <p className="text-sm text-[hsl(220,10%,50%)] text-center leading-relaxed">
              以遊戲化方式探索語音小島，完成任務解鎖新關卡
            </p>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="border-y border-[hsl(220,14%,16%)] bg-[hsl(220,18%,10%)]">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-16">
            三步開始
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", icon: "🎯", title: "選擇角色", desc: "語音探險家、言語治療師、或公眾人士" },
              { step: "02", icon: "🎤", title: "錄製聲音", desc: "用你嘅聲音建立個人語音模型" },
              { step: "03", icon: "🚀", title: "開始訓練", desc: "透過互動遊戲同人工智能反饋提升發音" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="text-xs font-bold text-[hsl(174,62%,55%)] tracking-widest mb-3 block">
                  第 {item.step} 步
                </span>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-[hsl(220,10%,50%)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative py-28 px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(174,62%,47%/0.08)] to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-6">
            準備好開始
            <span className="bg-gradient-to-r from-[hsl(174,62%,55%)] to-[hsl(38,95%,65%)] bg-clip-text text-transparent">
              語音冒險
            </span>
            了嗎？
          </h2>
          <p className="text-[hsl(220,10%,50%)] mb-10 text-lg">
            免費體驗，無需註冊
          </p>
          <Button
            onClick={() => navigate("/role-select")}
            className="h-14 px-12 text-lg font-extrabold rounded-2xl bg-gradient-to-r from-[hsl(38,95%,55%)] to-[hsl(38,85%,60%)] hover:from-[hsl(38,95%,60%)] hover:to-[hsl(38,85%,65%)] text-[hsl(220,20%,12%)] gap-3 shadow-[0_5px_0_hsl(38,70%,40%),0_16px_32px_hsl(38,95%,55%/0.25)] hover:shadow-[0_3px_0_hsl(38,70%,40%)] active:shadow-[0_1px_0_hsl(38,70%,40%)] active:translate-y-[2px] transition-all duration-150"
          >
            立即體驗
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[hsl(220,14%,16%)] bg-[hsl(220,20%,8%)]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={heroMascot} alt="" className="h-6 w-6 object-contain" />
            <span className="text-sm font-bold text-[hsl(220,10%,45%)]">SpeakAble HK</span>
          </div>
          <p className="text-xs text-[hsl(220,10%,35%)]">
            © 2026 SpeakAble HK · 輔助語音訓練工具（非醫療用途）
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
