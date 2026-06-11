import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroVideo from "@/assets/hero_video.mp4";
import heroStyles from "./HeroLanding.module.css";
import { useAuth } from "@/shared/hooks/useAuth";
import { toast } from "sonner";

type Stage = "video" | "portal" | "login" | "student-transition";
type Role = "professional" | "student" | "parent";
type StudentTransitionMode = "real" | "mock";
const DEV_PROFILE_KEY = "speakable-user-profile-v1";
const STUDENT_TRANSITION_VIDEO = "/assets/student-login-transition.mp4";

const THERAPIST_LABEL = "治療師";
const STUDENT_LABEL = "學生";
const PARENT_LABEL = "家長";

export default function SignInFlowPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [stage, setStage] = useState<Stage>("video");
  const [showCurve, setShowCurve] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [studentTransitionMode, setStudentTransitionMode] = useState<StudentTransitionMode>("real");

  const roleName = useMemo(() => {
    if (selectedRole === "professional") return THERAPIST_LABEL;
    if (selectedRole === "student") return STUDENT_LABEL;
    if (selectedRole === "parent") return PARENT_LABEL;
    return "";
  }, [selectedRole]);

  const onVideoEnd = () => {
    setStage("portal");
    window.setTimeout(() => setShowCurve(true), 500);
  };

  const onRoleSelect = (role: Role) => {
    localStorage.setItem("speakable_role", role);
    setSelectedRole(role);
    setStage("login");
  };

  const showStudentTransition = (mode: StudentTransitionMode) => {
    setStudentTransitionMode(mode);
    setStage("student-transition");
  };

  const finishStudentTransition = () => {
    const onboardingDone = localStorage.getItem("speakable-onboarding-complete");
    if (onboardingDone) {
      if (studentTransitionMode === "mock") {
        navigate("/dashboard", { state: { skipIntro: true, skipMissionPopup: true } });
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/onboarding");
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedRole) {
      toast.error("請先選擇身份");
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || "登入失敗，請檢查帳號密碼");
      return;
    }

    toast.success("登入成功");
    if (selectedRole === "professional") {
      navigate("/therapist-portal");
      return;
    }
    if (selectedRole === "parent") {
      navigate("/parent-dashboard");
      return;
    }

    localStorage.removeItem("speakable-mission-popup-shown");
    showStudentTransition("real");
  };

  const onDevMockLogin = (role: Role) => {
    localStorage.setItem("speakable_role", role);

    const getMockId = () => {
      if (role === "professional") return "mock-therapist-001";
      if (role === "parent") return "mock-parent-001";
      return "mock-student-001";
    };
    const getDisplayName = () => {
      if (role === "professional") return "開發治療師";
      if (role === "parent") return "開發家長";
      return "開發學生";
    };
    const getFirstName = () => {
      if (role === "professional") return "治療師";
      if (role === "parent") return "家長";
      return "學生";
    };
    const getUsername = () => {
      if (role === "professional") return "dev_therapist";
      if (role === "parent") return "dev_parent";
      return "dev_student";
    };

    const mockUserId = getMockId();
    const mockProfile = {
      user_id: mockUserId,
      display_name: getDisplayName(),
      first_name: getFirstName(),
      last_name: "測試",
      username: getUsername(),
      preferred_language: "zh-HK",
      consent_given: true,
    };

    const roleLabel = role === "professional" ? "治療師" : role === "parent" ? "家長" : "學生";
    localStorage.setItem(DEV_PROFILE_KEY, JSON.stringify(mockProfile));
    toast.success(`已使用開發模式登入${roleLabel}帳戶`);

    if (role === "professional") {
      navigate("/therapist-portal");
      return;
    }
    if (role === "parent") {
      navigate("/parent-dashboard");
      return;
    }

    localStorage.setItem("speakable-mission-popup-shown", "1");
    const onboardingDone = localStorage.getItem("speakable-onboarding-complete");
    if (onboardingDone) {
      navigate("/dashboard", { state: { skipIntro: true, skipMissionPopup: true } });
    } else {
      navigate("/onboarding");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {stage === "video" && (
        <section className="relative flex min-h-screen items-center justify-center bg-black p-4">
          <video
            className={heroStyles["hero-video"]}
            src={heroVideo}
            autoPlay
            muted
            playsInline
            onEnded={onVideoEnd}
            onError={onVideoEnd}
          />
        </section>
      )}

      {stage === "portal" && (
        <section className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-slate-900 via-slate-950 to-cyan-950 px-6 text-center">
          <h1 className="animate-[float-in_1s_ease-out] text-5xl font-black tracking-tight text-cyan-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] md:text-7xl">
            SpeakAble HK
          </h1>

          {showCurve && (
            <div className="animate-[float-in_1s_ease-out]">
              <svg width="320" height="86" viewBox="0 0 320 86" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M10 72 Q160 8 310 72" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
          )}

          <div className="mt-4 flex w-full max-w-xl flex-col gap-4 md:flex-row">
            <button
              type="button"
              className="flex-1 rounded-2xl border border-cyan-200/70 bg-cyan-500/20 px-6 py-5 text-xl font-bold text-cyan-50 transition hover:bg-cyan-500/30"
              onClick={() => onRoleSelect("professional")}
            >
              進入{THERAPIST_LABEL}入口
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl border border-emerald-200/70 bg-emerald-500/20 px-6 py-5 text-xl font-bold text-emerald-50 transition hover:bg-emerald-500/30"
              onClick={() => onRoleSelect("student")}
            >
              進入{STUDENT_LABEL}入口
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl border border-amber-200/70 bg-amber-500/20 px-6 py-5 text-xl font-bold text-amber-50 transition hover:bg-amber-500/30"
              onClick={() => onRoleSelect("parent")}
            >
              進入{PARENT_LABEL}入口
            </button>
          </div>
        </section>
      )}

      {stage === "login" && (
        <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-10">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-md rounded-3xl border border-white/35 bg-slate-900/85 p-8 shadow-2xl backdrop-blur"
          >
            <p className="mb-2 text-sm font-semibold text-cyan-50">身份：{roleName}</p>
            <h2 className="mb-6 text-3xl font-black text-slate-50">帳號登入</h2>

            <label className="mb-2 block text-sm font-semibold text-slate-50" htmlFor="email">
              電郵
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mb-4 w-full rounded-xl border border-slate-400/60 bg-slate-950 px-4 py-3 text-slate-50 outline-none ring-cyan-300 placeholder:text-slate-300 focus:ring-2"
              placeholder="you@example.com"
            />

            <label className="mb-2 block text-sm font-semibold text-slate-50" htmlFor="password">
              密碼
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mb-6 w-full rounded-xl border border-slate-400/60 bg-slate-950 px-4 py-3 text-slate-50 outline-none ring-cyan-300 placeholder:text-slate-300 focus:ring-2"
              placeholder="請輸入密碼"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-base font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-85"
            >
              {isLoading ? "登入中..." : "登入"}
            </button>

            <button
              type="button"
              onClick={() => setStage("portal")}
              className="mt-3 w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              返回身份選擇
            </button>

            {import.meta.env.DEV && (
              <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-100/20 p-4">
                <p className="mb-3 text-xs font-bold tracking-wide text-amber-50">開發快速登入（DEV ONLY）</p>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => onDevMockLogin("professional")}
                    className="w-full rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-200"
                  >
                    Mock 登入治療師 Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => onDevMockLogin("student")}
                    className="w-full rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-emerald-200"
                  >
                    Mock 登入學生 Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => onDevMockLogin("parent")}
                    className="w-full rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-200"
                  >
                    Mock 登入家長 Portal
                  </button>
                </div>
              </div>
            )}
          </form>
        </section>
      )}

      {stage === "student-transition" && (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
          <video
            className="h-screen w-screen object-cover"
            src={STUDENT_TRANSITION_VIDEO}
            autoPlay
            muted
            playsInline
            onEnded={finishStudentTransition}
            onError={finishStudentTransition}
          />
          <button
            type="button"
            onClick={finishStudentTransition}
            className="absolute right-4 top-4 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-white"
          >
            Skip
          </button>
        </section>
      )}
    </main>
  );
}
