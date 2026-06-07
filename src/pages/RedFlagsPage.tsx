import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";

interface Milestone {
  age: string;
  title: string;
  items: string[];
  color: string;
  iconColor: string;
}

const MILESTONES: Milestone[] = [
  {
    age: "12 個月",
    title: "第一年",
    color: "border-green-300 bg-green-50/50",
    iconColor: "text-green-600",
    items: [
      "聽到名字時有反應",
      "會發出輔音聲（巴巴、大大）",
      "能理解「不」",
      "會揮手「拜拜」或使用其他手勢",
      "聽到物品名稱時會看向該物品",
    ],
  },
  {
    age: "18 個月",
    title: "一歲半",
    color: "border-amber-300 bg-amber-50/50",
    iconColor: "text-amber-600",
    items: [
      "能說 10-20 個字",
      "會指向想要的東西或感興趣的事物",
      "能跟從簡單的一步指令",
      "聽到名稱時能辨認熟悉的物品",
      "能模仿簡單的字詞和動作",
    ],
  },
  {
    age: "24 個月",
    title: "第二年",
    color: "border-red-300 bg-red-50/50",
    iconColor: "text-red-600",
    items: [
      "能使用 50 個以上的字詞",
      "能組合兩個字詞（如「多啲奶」）",
      "陌生人能理解約 50% 的說話",
      "被問到時能指出身體部位",
      "能跟從兩步指令",
    ],
  },
];

export default function RedFlagsPage() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalItems = MILESTONES.reduce((sum, m) => sum + m.items.length, 0);
  const checkedCount = checked.size;
  const allChecked = checkedCount === totalItems;
  const hasUnchecked = checkedCount < totalItems && checkedCount > 0;

  return (
    <div className="min-h-full bg-surface text-on-surface font-body pb-28">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#fef2f2] via-surface to-background" aria-hidden="true" />

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-error/10 flex items-center justify-center mb-4">
            <MaterialIcon icon="flag" filled className="text-error text-3xl" />
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">警示清單</h1>
          <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
            勾選你的孩子已達到的里程碑。未勾選的項目可能需要諮詢言語治療師。
          </p>
        </div>

        {/* Progress */}
        <div className="glass-card rounded-xl p-4 mb-6 shadow-card border border-white/40">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider">進度</span>
            <span className="font-label text-xs font-semibold text-primary">{checkedCount}/{totalItems}</span>
          </div>
          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${(checkedCount / totalItems) * 100}%` }}
            />
          </div>
        </div>

        {/* Milestone cards */}
        <div className="space-y-6">
          {MILESTONES.map((milestone) => (
            <div
              key={milestone.age}
              className={`rounded-xl border-2 p-5 ${milestone.color} shadow-sm`}
            >
              <div className="flex items-center gap-3 mb-4">
                <MaterialIcon icon="cake" filled className={`text-2xl ${milestone.iconColor}`} />
                <div>
                  <span className={`font-headline font-extrabold text-lg ${milestone.iconColor}`}>
                    {milestone.age}
                  </span>
                  <p className="text-xs text-on-surface-variant">{milestone.title}</p>
                </div>
              </div>

              <div className="space-y-2">
                {milestone.items.map((item) => {
                  const key = `${milestone.age}-${item}`;
                  const isChecked = checked.has(key);
                  return (
                    <label
                      key={key}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? "bg-white/60" : "hover:bg-white/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(key)}
                        className="mt-0.5 h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary shrink-0"
                      />
                      <span className={`text-sm ${isChecked ? "text-on-surface line-through opacity-85" : "text-on-surface"}`}>
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center space-y-4">
          {hasUnchecked && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4">
              <MaterialIcon icon="info" className="text-error text-lg mb-1" />
              <p className="text-sm text-error font-medium">
                部分里程碑尚未達到。建議諮詢言語治療師進行專業評估。
              </p>
            </div>
          )}

          <button
            onClick={() => window.open("https://www.hkist.org.hk", "_blank")}
            className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <MaterialIcon icon="search" /> 尋找言語治療師（NGO）
          </button>

          <button
            onClick={() => navigate(-1)}
            className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            返回資源
          </button>
        </div>
      </div>
    </div>
  );
}
