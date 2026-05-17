import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
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
  { id: "pirate",   name: "海盜帽",  cost: 100, emoji: "🏴‍☠️" },
  { id: "crown",    name: "皇冠",    cost: 200, emoji: "👑" },
  { id: "scarf",    name: "紅圍巾",  cost: 150, emoji: "🧣" },
  { id: "glasses",  name: "墨鏡",    cost: 75,  emoji: "🕶️" },
  { id: "cape",     name: "英雄披風", cost: 300, emoji: "🦸" },
  { id: "tophat",   name: "禮帽",    cost: 250, emoji: "🎩" },
];

const decorations: ShopItem[] = [
  { id: "plant",     name: "盆栽",    cost: 50,  emoji: "🪴" },
  { id: "lamp",      name: "檯燈",    cost: 100, emoji: "💡" },
  { id: "bookshelf", name: "書架",    cost: 200, emoji: "📚" },
  { id: "rug",       name: "地毯",    cost: 125, emoji: "🟫" },
  { id: "poster",    name: "香港海報", cost: 175, emoji: "🖼️" },
  { id: "trophy",    name: "金獎盃",  cost: 500, emoji: "🏆" },
];

const accessories: ShopItem[] = [
  { id: "bunny",    name: "兔耳朵",  cost: 600,  emoji: "🐰" },
  { id: "headband", name: "頭帶",    cost: 1200, emoji: "🎀" },
];

const foods: FoodItem[] = [
  { id: "apple",  name: "蘋果",  cost: 25, emoji: "🍎",  restore: 15 },
  { id: "rice",   name: "米飯",  cost: 40, emoji: "🍚",  restore: 22 },
  { id: "banana", name: "香蕉",  cost: 35, emoji: "🍌",  restore: 20 },
  { id: "fish",   name: "魚塊",  cost: 55, emoji: "🐟",  restore: 30 },
  { id: "corn",   name: "粟米",  cost: 30, emoji: "🌽",  restore: 18 },
  { id: "bento",  name: "便當",  cost: 80, emoji: "🍱",  restore: 45 },
];

const STORAGE_KEY = "pipi-shop-owned";
const SPENT_KEY   = "pipi-spent-points";
const HUNGER_KEY  = "pipi-hunger";

function getEarnedXp(): number {
  try {
    const p = JSON.parse(sessionStorage.getItem("lesson_progress") || "{}");
    return Object.values(p).reduce((s: number, v: any) => s + (v.xp_earned || 0), 0) as number;
  } catch { return 0; }
}

function loadSpent(): number {
  try { return parseInt(localStorage.getItem(SPENT_KEY) || "0", 10) || 0; }
  catch { return 0; }
}

function loadHunger(): number {
  try {
    const raw = localStorage.getItem(HUNGER_KEY);
    if (raw === null) return HUNGER_MAX;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return HUNGER_MAX;
    return Math.min(HUNGER_MAX, Math.max(0, n));
  } catch { return HUNGER_MAX; }
}

type TabId = "outfits" | "decorations" | "accessories" | "food";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "outfits",      label: "裝飾", emoji: "👗" },
  { id: "decorations",  label: "家居", emoji: "🏠" },
  { id: "accessories",  label: "配件", emoji: "🎮" },
  { id: "food",         label: "食物", emoji: "🍽️" },
];

export default function PiPiPage() {
  const [activeTab, setActiveTab] = useState<TabId>("outfits");
  const [ownedItems, setOwnedItems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch { return new Set<string>(); }
  });
  const [spent, setSpent]   = useState(loadSpent);
  const [hunger, setHunger] = useState(loadHunger);

  const earned = getEarnedXp();
  const points = Math.max(0, earned - spent);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ownedItems])); }, [ownedItems]);
  useEffect(() => { localStorage.setItem(SPENT_KEY,   String(spent)); },                 [spent]);
  useEffect(() => { localStorage.setItem(HUNGER_KEY,  String(hunger)); },                [hunger]);

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
      if (hunger >= HUNGER_MAX) { toast.info("皮皮已經很飽了！"); return; }
      const next  = Math.min(HUNGER_MAX, hunger + item.restore);
      const delta = next - hunger;
      if (delta <= 0) return;
      setSpent((s) => s + item.cost);
      setHunger(next);
      toast.success(
        item.restore > delta
          ? `皮皮吃了 ${item.name}！飽食度 +${delta}（已達上限）`
          : `皮皮吃了 ${item.name}！飽食度 +${delta}`
      );
    },
    [points, hunger]
  );

  const items =
    activeTab === "outfits"      ? outfits
    : activeTab === "accessories" ? accessories
    : activeTab === "food"        ? foods
    : decorations;

  return (
    <div className="min-h-full bg-cloud">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="font-display text-h3 font-medium text-ink flex items-center gap-2">
            🦜 皮皮
          </h1>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* XP badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#FFF6E0] border border-[#FFE9B5] px-3 py-1.5 rounded-pill">
              <span className="text-sunshine text-[15px]">⭐</span>
              <span className="text-small font-medium text-ink tabular-nums">{points} XP</span>
            </div>
            {/* Hunger badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#FFE8E0] border border-[#FFD4C5] px-3 py-1.5 rounded-pill">
              <span className="text-coral text-[15px]">🍗</span>
              <span className="text-small font-medium text-ink tabular-nums">{hunger}/{HUNGER_MAX}</span>
            </div>
          </div>
        </div>

        {/* ── Hunger bar ──────────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-small text-slate">飽食度</span>
            <span className="text-small font-medium text-ink tabular-nums">{hunger}/{HUNGER_MAX}</span>
          </div>
          <div className="h-3 w-full rounded-pill bg-mist overflow-hidden">
            <div
              className="h-full rounded-pill bg-gradient-to-r from-coral to-sunshine transition-all duration-300 ease-out"
              style={{ width: `${(hunger / HUNGER_MAX) * 100}%` }}
              role="progressbar"
              aria-valuenow={hunger}
              aria-valuemin={0}
              aria-valuemax={HUNGER_MAX}
            />
          </div>
        </div>

        {/* ── Character display ───────────────────────────────── */}
        <div className="bg-white rounded-lg border-[0.5px] border-mist p-6 flex items-center justify-center">
          <img
            src={pipiHome}
            alt="皮皮"
            className="h-52 w-full max-w-sm object-contain"
            loading="lazy"
            width={1024}
            height={1024}
          />
        </div>

        {/* ── Category tabs ────────────────────────────────────── */}
        <div className="flex bg-white rounded-lg border-[0.5px] border-mist p-1 gap-0.5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[4.5rem] py-2.5 rounded-md text-xs sm:text-small font-medium transition-all whitespace-nowrap px-1 ${
                activeTab === tab.id
                  ? "bg-sky-400 text-white shadow-sm"
                  : "text-slate hover:text-ink"
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Item grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {activeTab === "food"
            ? foods.map((item) => {
                const full      = hunger >= HUNGER_MAX;
                const canAfford = points >= item.cost;
                const wouldWaste = hunger + item.restore > HUNGER_MAX;
                const disabled  = full || !canAfford;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => !disabled && handleBuyFood(item)}
                    disabled={disabled}
                    className={`bg-white rounded-md p-3 border text-center transition-all focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:outline-none ${
                      full
                        ? "border-mist opacity-60"
                        : canAfford
                          ? "border-mist hover:border-sky-400 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md"
                          : "border-mist opacity-50"
                    }`}
                  >
                    <span className="text-3xl block mb-1">{item.emoji}</span>
                    <p className="text-[11px] font-medium text-ink mb-1">{item.name}</p>
                    <p className="text-[10px] text-slate mb-1">+{item.restore} 飽食</p>
                    {wouldWaste && !full && canAfford && (
                      <p className="text-[9px] text-warning font-medium mb-0.5">部分溢出</p>
                    )}
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-ink bg-[#FFF6E0] px-2 py-0.5 rounded-pill">
                      ⭐ {item.cost}
                    </span>
                  </button>
                );
              })
            : items.map((item) => {
                const owned     = ownedItems.has(item.id);
                const canAfford = points >= item.cost;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => !owned && canAfford && handleBuy(item)}
                    disabled={owned || !canAfford}
                    className={`bg-white rounded-md p-3 border text-center transition-all focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:outline-none ${
                      owned
                        ? "border-mint/50 bg-[#E8F7F3]"
                        : canAfford
                          ? "border-mist hover:border-sky-400 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md"
                          : "border-mist opacity-50"
                    }`}
                  >
                    <span className="text-3xl block mb-1">{item.emoji}</span>
                    <p className="text-[11px] font-medium text-ink mb-1">{item.name}</p>
                    {owned ? (
                      <span className="text-[10px] font-medium text-mint flex items-center justify-center gap-0.5">
                        <Check className="h-3 w-3" /> 已擁有
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-ink bg-[#FFF6E0] px-2 py-0.5 rounded-pill">
                        ⭐ {item.cost}
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
