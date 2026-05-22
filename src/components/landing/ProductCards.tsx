import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";

export function ProductCards() {
  const navigate = useNavigate();
  const { t3 } = useLanguage();

  const PRODUCTS = [
    {
      icon: "record_voice_over",
      cardBg: "bg-sunshine-soft",
      iconBg: "bg-sunshine",
      title: t3("Cantonese pronunciation play", "粵語發音練習", "粤语发音练习"),
      description: t3(
        "Game-based Cantonese practice with friendly real-time voice feedback — easy and fun at home.",
        "互動式粵語發音遊戲，配合即時親切回饋，喺屋企輕鬆練習。",
        "互动式粤语发音游戏，配合即时亲切反馈，在家轻松练习。"
      ),
      path: "/explorer/onboarding",
    },
    {
      icon: "groups",
      cardBg: "bg-sky-soft",
      iconBg: "bg-sky-bright",
      title: t3("Teacher portal", "老師專區", "老师专区"),
      description: t3(
        "A helper dashboard for teachers and support staff: assign practice, track progress, personalise lessons.",
        "為老師及支援人員提供的小幫手面板：派發練習、追蹤進度、個人化課程。",
        "为老师及支援人员提供的小帮手面板：派发练习、追踪进度、个人化课程。"
      ),
      path: "/role-select",
    },
    {
      icon: "family_restroom",
      cardBg: "bg-mint-soft",
      iconBg: "bg-mint",
      title: t3("Family resources centre", "家庭資源中心", "家庭资源中心"),
      description: t3(
        "Speech milestones, helpful checklists, and a city-wide helper finder for parents and carers.",
        "言語發展里程碑、實用清單，以及全港協助搜尋，幫助家長及照顧者。",
        "言语发展里程碑、实用清单，以及全港协助搜索，帮助家长及照顾者。"
      ),
      path: "/ngo",
    },
  ];

  return (
    <section className="bg-cream py-16 sm:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-ink mb-3">
            {t3("Pick your playground", "揀你嘅小天地", "选你的小天地")}
          </h2>
          <p className="text-slate text-base sm:text-lg">
            {t3(
              "Three friendly spaces — one for each kind of helper.",
              "三個親切空間，畀唔同嘅小幫手。",
              "三个亲切空间，给不同的小帮手。"
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => (
            <button
              key={p.title}
              onClick={() => navigate(p.path)}
              className={`group ${p.cardBg} rounded-3xl p-7 shadow-soft hover:shadow-playful border-2 border-white text-left transition-all hover:scale-105 hover:-translate-y-1 active:scale-95`}
            >
              <div
                className={`w-16 h-16 ${p.iconBg} rounded-full flex items-center justify-center mb-5 shadow-soft group-hover:scale-110 transition-transform`}
              >
                <MaterialIcon icon={p.icon} filled className="text-white text-3xl" />
              </div>
              <h3 className="font-headline font-extrabold text-ink text-xl mb-2">
                {p.title}
              </h3>
              <p className="text-slate text-sm leading-relaxed">{p.description}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-ink font-extrabold text-sm bg-white/80 px-4 py-2 rounded-full">
                {t3("Let's go", "去玩", "去玩")}
                <MaterialIcon icon="arrow_forward" className="text-base" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
