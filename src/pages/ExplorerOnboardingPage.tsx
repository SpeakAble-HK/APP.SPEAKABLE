import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BrandHeader } from "@/components/BrandHeader";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { value: "learner", icon: "explore", label: "語音冒險家" },
  { value: "therapist", icon: "medical_services", label: "言語治療師" },
  { value: "public", icon: "groups", label: "一般市民" },
] as const;

export default function ExplorerOnboardingPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !role) {
      toast.error("請填寫所有必填欄位。");
      return;
    }
    localStorage.setItem(
      "speakable_user",
      JSON.stringify({ nickname: nickname.trim(), role })
    );

    if (role === "learner") navigate("/adventure-start");
    else if (role === "therapist") navigate("/st-dashboard");
    else navigate("/ngo");
  };

  return (
    <div className="font-body text-on-surface min-h-screen relative overflow-x-hidden bg-background">
      {/* Gradient background + blobs */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#c8e8f2] via-surface to-[#a8d4e8]" aria-hidden="true" />
      <div className="fixed -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-[100px] -z-10" aria-hidden="true" />
      <div className="fixed top-1/4 -right-16 h-[22rem] w-[22rem] rounded-full bg-secondary-container/40 blur-[90px] -z-10" aria-hidden="true" />
      <div className="fixed bottom-20 left-1/4 h-[18rem] w-[18rem] rounded-full bg-tertiary-container/35 blur-[80px] -z-10" aria-hidden="true" />
      <div className="fixed bottom-0 right-1/3 h-64 w-64 rounded-full bg-primary-fixed/30 blur-[70px] -z-10" aria-hidden="true" />
      <div className="fixed top-40 left-1/3 h-40 w-56 rounded-[60%] bg-white/40 blur-3xl -z-10 rotate-12" aria-hidden="true" />

      <BrandHeader />

      <div className="relative z-10 mx-auto max-w-lg px-4 pt-20 pb-32 sm:pt-24">
        <header className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <p className="font-headline text-xl font-bold text-on-surface sm:text-2xl">開始你的語言旅程</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-xl border border-white/60 p-6 shadow-xl shadow-primary/10 sm:p-8"
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="nickname" className="font-label mb-1.5 block text-sm font-semibold text-on-surface">
                暱稱
              </label>
              <input
                type="text"
                id="nickname"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest/80 px-4 py-3 font-body text-on-surface shadow-sm focus:border-primary focus:ring-primary focus:outline-none"
                placeholder="你希望怎樣稱呼"
              />
            </div>
            <fieldset>
              <legend className="font-label mb-3 block text-sm font-semibold text-on-surface">
                我是⋯
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {ROLE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="group relative cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={role === opt.value}
                      onChange={() => setRole(opt.value)}
                      className="peer sr-only"
                      required
                    />
                    <span className="flex h-full flex-col items-center gap-2 rounded-lg border-2 border-outline-variant bg-surface-container-low/80 p-4 text-center transition peer-checked:border-primary peer-checked:bg-primary-container/50 peer-checked:shadow-md peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                      <MaterialIcon icon={opt.icon} className="text-primary" />
                      <span className="font-label text-sm font-bold text-on-surface">{opt.label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <button
            type="submit"
            className="font-label mt-8 w-full rounded-lg bg-primary py-4 text-base font-bold text-on-primary shadow-lg shadow-primary/30 transition hover:bg-primary-dim focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98]"
          >
            開始旅程
          </button>
        </form>
      </div>

      {/* Wave SVG footer */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-0 overflow-hidden leading-none text-primary/20" aria-hidden="true">
        <svg className="relative block w-full h-[120px] sm:h-[160px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,74.7C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          <path fill="currentColor" fillOpacity="0.45" d="M0,90L60,85.3C120,81,240,71,360,74.7C480,79,600,95,720,90.7C840,85,960,59,1080,53.3C1200,47,1320,61,1380,68L1440,75L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" />
        </svg>
      </div>
    </div>
  );
}
