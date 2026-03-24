import { useState, useEffect, useCallback } from "react";
import { Star, Check, Lock, ShoppingBag } from "lucide-react";
import pipiRoom from "@/assets/pipi-room.png";
import { toast } from "sonner";

interface ShopItem {
  id: string;
  name: string;
  cost: number;
  emoji: string;
}

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
  { id: "banana", name: "香蕉", cost: 600, emoji: "🍌" },
  { id: "bunny", name: "兔耳朵", cost: 600, emoji: "🐰" },
  { id: "headband", name: "頭帶", cost: 1200, emoji: "🎀" },
];

const STORAGE_KEY = "pipi-shop-owned";

export default function PiPiPage() {
  const [activeTab, setActiveTab] = useState<"outfits" | "decorations" | "accessories">("outfits");
  const [ownedItems, setOwnedItems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch { return new Set<string>(); }
  });

  const getXp = () => {
    try {
      const p = JSON.parse(sessionStorage.getItem("lesson_progress") || "{}");
      return Object.values(p).reduce((s: number, v: any) => s + (v.xp_earned || 0), 0) as number;
    } catch { return 0; }
  };

  const [points, setPoints] = useState(getXp);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ownedItems]));
  }, [ownedItems]);

  const handleBuy = useCallback((item: ShopItem) => {
    if (points < item.cost || ownedItems.has(item.id)) return;
    setPoints(prev => prev - item.cost);
    setOwnedItems(prev => new Set([...prev, item.id]));
    toast.success(`🎉 已解鎖 ${item.name}！`);
  }, [points, ownedItems]);

  const items = activeTab === "outfits" ? outfits : activeTab === "accessories" ? accessories : decorations;
  const tabs = [
    { id: "outfits" as const, label: "裝飾", emoji: "👗" },
    { id: "decorations" as const, label: "家居", emoji: "🏠" },
    { id: "accessories" as const, label: "配件", emoji: "🎮" },
  ];

  return (
    <div className="min-h-full bg-[hsl(200,30%,96%)]">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-[hsl(200,15%,20%)] flex items-center gap-2">
            🦜 皮皮
          </h1>
          <div className="flex items-center gap-1.5 bg-[hsl(45,95%,55%)] px-3 py-1.5 rounded-full shadow-sm">
            <Star className="h-4 w-4 text-white" />
            <span className="text-sm font-extrabold text-white">{points}</span>
          </div>
        </div>

        {/* Character Display */}
        <div className="bg-white rounded-3xl p-6 flex items-center justify-center shadow-sm border border-[hsl(200,20%,90%)]">
          <img src={pipiRoom} alt="皮皮" className="h-48 w-48 object-contain" loading="lazy" width={1024} height={1024} />
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-[hsl(200,20%,90%)]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === t.id
                  ? "bg-[hsl(152,60%,45%)] text-white shadow-sm"
                  : "text-[hsl(200,10%,50%)]"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => {
            const owned = ownedItems.has(item.id);
            const canAfford = points >= item.cost;
            return (
              <button
                key={item.id}
                onClick={() => !owned && canAfford && handleBuy(item)}
                disabled={owned || !canAfford}
                className={`bg-white rounded-2xl p-3 border-2 text-center transition-all ${
                  owned
                    ? "border-[hsl(152,50%,70%)] bg-[hsl(152,50%,97%)]"
                    : canAfford
                    ? "border-[hsl(200,20%,88%)] hover:border-[hsl(45,90%,55%)] hover:-translate-y-0.5 active:translate-y-0"
                    : "border-[hsl(200,20%,90%)] opacity-50"
                }`}
              >
                <span className="text-3xl block mb-1">{item.emoji}</span>
                <p className="text-[11px] font-bold text-[hsl(200,15%,25%)] mb-1">{item.name}</p>
                {owned ? (
                  <span className="text-[10px] font-bold text-[hsl(152,50%,40%)] flex items-center justify-center gap-0.5">
                    <Check className="h-3 w-3" /> 已擁有
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[hsl(45,70%,35%)] bg-[hsl(45,90%,90%)] px-2 py-0.5 rounded-full">
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
