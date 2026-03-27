import { useState, useEffect, useCallback } from "react";
import { Star, Check, Drumstick } from "lucide-react";
import pipiHome from "@/assets/pipi-home.png";
import { toast } from "sonner";

interface ShopItem {
  id: string;
  name: string;
  cost: number;
  emoji: string;
}

interface FoodItem extends ShopItem {
  restore: number;
}

const HUNGER_MAX = 100;

const outfits: ShopItem[] = [
  { id: "pirate", name: "海盜帽", cost: 100, emoji: "🏴‍☠️" },
  { id: "crown", name: "皇冠", cost: 200, emoji: "👑" },
  { id: "scarf", name: "紅圍巾", cost: 150, emoji: "🧣" },
  { id: "glasses", name: "墨鏡", cost: 75, emoji: "🕶️" },
  { id: "cape", name: "英雄披風", cost: 300, emoji: "🦸" },
  { id: "tophat", name: "禮帽", cost: 250, emoji: "🎩" },
];

const decorations: ShopItem[] = [
  { id: "plant", name: "盆栽", cost: 50, emoji: "🪴" },
  { id: "lamp", name: "檯燈", cost: 100, emoji: "💡" },
  { id: "bookshelf", name: "書架", cost: 200, emoji: "📚" },
  { id: "rug", name: "地毯", cost: 125, emoji: "🟫" },
  { id: "poster", name: "香港海報", cost: 175, emoji: "🖼️" },
  { id: "trophy", name: "金獎盃", cost: 500, emoji: "🏆" },
];

const accessories: ShopItem[] = [
  { id: "bunny", name: "兔耳朵", cost: 600, emoji: "🐰" },
  { id: "headband", name: "頭帶", cost: 1200, emoji: "🎀" },
];

const foods: FoodItem[] = [
  { id: "apple", name: "蘋果", cost: 25, emoji: "🍎", restore: 15 },
  { id: "rice", name: "米飯", cost: 40, emoji: "🍚", restore: 22 },
  { id: "banana", name: "香蕉", cost: 35, emoji: "🍌", restore: 20 },
  { id: "fish", name: "魚塊", cost: 55, emoji: "🐟", restore: 30 },
  { id: "corn", name: "粟米", cost: 30, emoji: "🌽", restore: 18 },
  { id: "bento", name: "便當", cost: 80, emoji: "🍱", restore: 45 },
];

const STORAGE_KEY = "pipi-shop-owned";
const SPENT_KEY = "pipi-spent-points";
const HUNGER_KEY = "pipi-hunger";

function getEarnedXp(): number {
  try {
    const p = JSON.parse(sessionStorage.getItem("lesson_progress") || "{}");
    return Object.values(p).reduce((s: number, v: any) => s + (v.xp_earned || 0), 0) as number;
  } catch {
    return 0;
  }
}

function loadSpent(): number {
  try {
    return parseInt(localStorage.getItem(SPENT_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function loadHunger(): number {
  try {
    const raw = localStorage.getItem(HUNGER_KEY);
    if (raw === null) return HUNGER_MAX;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return HUNGER_MAX;
    return Math.min(HUNGER_MAX, Math.max(0, n));
  } catch {
    return HUNGER_MAX;
  }
}

export default function PiPiPage() {
  const [activeTab, setActiveTab] = useState<
    "outfits" | "decorations" | "accessories" | "food"
  >("outfits");
  const [ownedItems, setOwnedItems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [spent, setSpent] = useState(loadSpent);
  const [hunger, setHunger] = useState(loadHunger);

  const earned = getEarnedXp();
  const points = Math.max(0, earned - spent);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ownedItems]));
  }, [ownedItems]);

  useEffect(() => {
    localStorage.setItem(SPENT_KEY, String(spent));
  }, [spent]);

  useEffect(() => {
    localStorage.setItem(HUNGER_KEY, String(hunger));
  }, [hunger]);

  const handleBuy = useCallback(
    (item: ShopItem) => {
      if (points < item.cost || ownedItems.has(item.id)) return;
      setSpent((s) => s + item.cost);
      setOwnedItems((prev) => new Set([...prev, item.id]));
      toast.success(`🎉 已解鎖 ${item.name}！`);
    },
    [points, ownedItems]
  );

  const handleBuyFood = useCallback(
    (item: FoodItem) => {
      if (points < item.cost) return;
      if (hunger >= HUNGER_MAX) {
        toast.info("皮皮已經很飽了！");
        return;
      }
      const next = Math.min(HUNGER_MAX, hunger + item.restore);
      const delta = next - hunger;
      if (delta <= 0) return;
      setSpent((s) => s + item.cost);
      setHunger(next);
      const wasted = item.restore > delta;
      toast.success(
        wasted
          ? `皮皮吃了 ${item.name}！飽食度 +${delta}（已達上限）`
          : `皮皮吃了 ${item.name}！飽食度 +${delta}`
      );
    },
    [points, hunger]
  );

  const items =
    activeTab === "outfits"
      ? outfits
      : activeTab === "accessories"
        ? accessories
        : activeTab === "food"
          ? foods
          : decorations;

  const tabs = [
    { id: "outfits" as const, label: "裝飾", emoji: "👗" },
    { id: "decorations" as const, label: "家居", emoji: "🏠" },
    { id: "accessories" as const, label: "配件", emoji: "🎮" },
    { id: "food" as const, label: "食物", emoji: "🍽️" },
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            🦜 皮皮
          </h1>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-1.5 bg-accent px-3 py-1.5 rounded-full shadow-sm">
              <Star className="h-4 w-4 text-accent-foreground shrink-0" />
              <span className="text-sm font-extrabold text-accent-foreground tabular-nums">{points}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full shadow-sm border border-border">
              <Drumstick className="h-4 w-4 text-secondary-foreground shrink-0" />
              <span className="text-sm font-extrabold text-secondary-foreground tabular-nums">
                {hunger}/{HUNGER_MAX}
              </span>
            </div>
          </div>
        </div>

        {/* Hunger bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>飽食度</span>
            <span className="tabular-nums">
              {hunger}/{HUNGER_MAX}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden border border-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 ease-out"
              style={{ width: `${(hunger / HUNGER_MAX) * 100}%` }}
              role="progressbar"
              aria-valuenow={hunger}
              aria-valuemin={0}
              aria-valuemax={HUNGER_MAX}
            />
          </div>
        </div>

        {/* Character Display */}
        <div className="bg-card rounded-3xl p-6 flex items-center justify-center shadow-sm border border-border">
          <img
            src={pipiHome}
            alt="皮皮"
            className="h-52 w-full max-w-sm object-contain"
            loading="lazy"
            width={1024}
            height={1024}
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-card rounded-xl p-1 shadow-sm border border-border gap-0.5 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 min-w-[4.5rem] py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap px-1 ${
                activeTab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-3 gap-3">
          {activeTab === "food"
            ? foods.map((item) => {
                const full = hunger >= HUNGER_MAX;
                const canAfford = points >= item.cost;
                const wouldWaste = hunger + item.restore > HUNGER_MAX;
                const disabled = full || !canAfford;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => !disabled && handleBuyFood(item)}
                    disabled={disabled}
                    className={`bg-card rounded-2xl p-3 border-2 text-center transition-all ${
                      full
                        ? "border-border opacity-60"
                        : canAfford
                          ? "border-border hover:border-accent hover:-translate-y-0.5 active:translate-y-0"
                          : "border-border opacity-50"
                    }`}
                  >
                    <span className="text-3xl block mb-1">{item.emoji}</span>
                    <p className="text-[11px] font-bold text-foreground mb-1">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground mb-1">+{item.restore} 飽食</p>
                    {wouldWaste && !full && canAfford && (
                      <p className="text-[9px] text-amber-600 font-semibold mb-0.5">部分溢出</p>
                    )}
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      <Star className="h-2.5 w-2.5" /> {item.cost}
                    </span>
                  </button>
                );
              })
            : items.map((item) => {
                const owned = ownedItems.has(item.id);
                const canAfford = points >= item.cost;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => !owned && canAfford && handleBuy(item)}
                    disabled={owned || !canAfford}
                    className={`bg-card rounded-2xl p-3 border-2 text-center transition-all ${
                      owned
                        ? "border-success/50 bg-success/5"
                        : canAfford
                          ? "border-border hover:border-accent hover:-translate-y-0.5 active:translate-y-0"
                          : "border-border opacity-50"
                    }`}
                  >
                    <span className="text-3xl block mb-1">{item.emoji}</span>
                    <p className="text-[11px] font-bold text-foreground mb-1">{item.name}</p>
                    {owned ? (
                      <span className="text-[10px] font-bold text-success flex items-center justify-center gap-0.5">
                        <Check className="h-3 w-3" /> 已擁有
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        <Star className="h-2.5 w-2.5" /> {item.cost}
                      </span>
                    )}
                  </button>
                );
              })}
        </div>
      </div>
    </div>
  );
}
