import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BrandHeader } from "@/components/BrandHeader";
import mascot from "@/assets/pipi-mascot.png";

const ROLES = [
  {
    id: "adventurist",
    icon: "child_care",
    title: "語音冒險家",
    desc: "踏上趣味任務，掌握新發音，發現溝通的奧妙。",
    bg: "bg-primary-container",
    hoverBg: "group-hover:bg-primary",
    textColor: "text-primary",
    iconColor: "text-on-primary-container group-hover:text-on-primary",
    pillBg: "bg-primary/10 group-hover:bg-primary group-hover:text-white",
    path: "/explorer/onboarding",
  },
  {
    id: "therapist",
    icon: "medical_services",
    title: "言語治療師",
    desc: "引導你的冒險家、追蹤里程碑，輕鬆管理治療課節。",
    bg: "bg-tertiary-container",
    hoverBg: "group-hover:bg-tertiary-fixed-dim",
    textColor: "text-tertiary",
    iconColor: "text-on-tertiary-container",
    pillBg: "bg-tertiary/10 group-hover:bg-tertiary group-hover:text-white",
    path: "/st-dashboard",
  },
  {
    id: "public",
    icon: "public",
    title: "一般市民",
    desc: "探索群島，了解語言健康，支持社區。",
    bg: "bg-secondary-container",
    hoverBg: "group-hover:bg-secondary",
    textColor: "text-secondary",
    iconColor: "text-on-secondary-container group-hover:text-on-secondary",
    pillBg: "bg-secondary/10 group-hover:bg-secondary group-hover:text-white",
    path: "/ngo",
  },
] as const;

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col relative overflow-hidden">
      {/* Ocean gradient bg */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #e0f6ff 0%, #f3f7fb 100%)" }} />
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-container/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-tertiary-container/10 rounded-full blur-[120px]" />
        {/* Sparkle dots */}
        <div className="absolute w-1 h-1 rounded-full bg-white opacity-60 blur-[1px] top-[15%] left-[20%]" />
        <div className="absolute w-2 h-2 rounded-full bg-white opacity-60 blur-[1px] top-[45%] left-[80%]" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-60 blur-[1px] top-[70%] left-[15%]" />
        <div className="absolute w-1 h-1 rounded-full bg-white opacity-60 blur-[1px] top-[25%] left-[60%]" />
      </div>

      <BrandHeader />

      {/* Main content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 pt-20 pb-32">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-primary mb-4">
            歡迎來到群島
          </h1>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed">
            選擇你的路線，開始穿越光輝群島的旅程。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="glass-card group flex flex-col items-center p-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(0,180,216,0.05)] text-center border-2 border-transparent hover:border-primary-container/50"
            >
              <div className={`w-24 h-24 ${role.bg} rounded-full flex items-center justify-center mb-6 shadow-inner ${role.hoverBg} transition-colors`}>
                <MaterialIcon icon={role.icon} className={`text-4xl ${role.iconColor} transition-colors`} />
              </div>
              <h3 className={`font-headline text-2xl font-bold ${role.textColor} mb-3`}>
                {role.title}
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                {role.desc}
              </p>
              <div className={`mt-auto px-6 py-2 ${role.pillBg} rounded-full font-bold text-xs uppercase tracking-widest transition-all`}>
                選擇角色
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* PiPi mascot at bottom */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center items-end pointer-events-none z-20">
        <div className="relative group pointer-events-auto">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            嗨！我是皮皮！選擇你喜歡的角色吧！
          </div>
          <img
            alt="PiPi Mascot"
            src={mascot}
            className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl translate-y-4 animate-pipi-bob"
          />
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary-container/30 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-full opacity-20 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-auto">
          <path d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,149.3C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#40cef3" fillOpacity="1" />
        </svg>
      </div>
    </div>
  );
}
