import { useState } from "react";
import { ShoppingBag, Lock, Check, Shirt, Home as HomeIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShopItem {
  id: string;
  nameEn: string;
  nameTW: string;
  nameCN: string;
  cost: number;
  unlocked: boolean;
  emoji: string;
}

const parrotOutfits: ShopItem[] = [
  { id: "pirate", nameEn: "Pirate Hat", nameTW: "海盜帽", nameCN: "海盗帽", cost: 100, unlocked: true, emoji: "🏴‍☠️" },
  { id: "crown", nameEn: "Royal Crown", nameTW: "皇冠", nameCN: "皇冠", cost: 200, unlocked: false, emoji: "👑" },
  { id: "scarf", nameEn: "Red Scarf", nameTW: "紅圍巾", nameCN: "红围巾", cost: 150, unlocked: false, emoji: "🧣" },
  { id: "glasses", nameEn: "Cool Shades", nameTW: "墨鏡", nameCN: "墨镜", cost: 75, unlocked: true, emoji: "🕶️" },
  { id: "cape", nameEn: "Hero Cape", nameTW: "英雄披風", nameCN: "英雄披风", cost: 300, unlocked: false, emoji: "🦸" },
  { id: "tophat", nameEn: "Top Hat", nameTW: "禮帽", nameCN: "礼帽", cost: 250, unlocked: false, emoji: "🎩" },
];

const homeDecorations: ShopItem[] = [
  { id: "plant", nameEn: "Potted Plant", nameTW: "盆栽", nameCN: "盆栽", cost: 50, unlocked: true, emoji: "🪴" },
  { id: "lamp", nameEn: "Desk Lamp", nameTW: "檯燈", nameCN: "台灯", cost: 100, unlocked: false, emoji: "💡" },
  { id: "bookshelf", nameEn: "Bookshelf", nameTW: "書架", nameCN: "书架", cost: 200, unlocked: false, emoji: "📚" },
  { id: "rug", nameEn: "Cozy Rug", nameTW: "地毯", nameCN: "地毯", cost: 125, unlocked: false, emoji: "🟫" },
  { id: "poster", nameEn: "HK Poster", nameTW: "香港海報", nameCN: "香港海报", cost: 175, unlocked: true, emoji: "🖼️" },
  { id: "trophy", nameEn: "Gold Trophy", nameTW: "金獎盃", nameCN: "金奖杯", cost: 500, unlocked: false, emoji: "🏆" },
];

interface RewardsShopProps {
  totalPoints: number;
}

export function RewardsShop({ totalPoints }: RewardsShopProps) {
  const { language } = useLanguage();
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';
  const [activeTab, setActiveTab] = useState<'outfits' | 'decorations'>('outfits');

  const items = activeTab === 'outfits' ? parrotOutfits : homeDecorations;

  const getName = (item: ShopItem) => isEn ? item.nameEn : isTW ? item.nameTW : item.nameCN;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          {isEn ? 'Rewards Shop' : isTW ? '獎勵商店' : '奖励商店'}
        </h2>
        <Badge variant="secondary" className="ml-auto">
          {totalPoints} {isEn ? 'pts available' : isTW ? '分可用' : '分可用'}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'outfits' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('outfits')}
          className="gap-1.5"
        >
          <Shirt className="h-3.5 w-3.5" />
          {isEn ? 'Parrot Outfits' : isTW ? '鸚鵡服裝' : '鹦鹉服装'}
        </Button>
        <Button
          variant={activeTab === 'decorations' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('decorations')}
          className="gap-1.5"
        >
          <HomeIcon className="h-3.5 w-3.5" />
          {isEn ? 'Home Decorations' : isTW ? '家居裝飾' : '家居装饰'}
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const canAfford = totalPoints >= item.cost;
          return (
            <Card
              key={item.id}
              className={`transition-all duration-200 ${
                item.unlocked
                  ? 'border-green-500/30 bg-green-500/5'
                  : canAfford
                    ? 'hover:border-primary/50 hover:-translate-y-0.5 cursor-pointer'
                    : 'opacity-60'
              }`}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="text-sm font-medium text-foreground mb-1">{getName(item)}</p>
                <div className="flex items-center justify-center gap-1 text-xs mb-2">
                  {item.unlocked ? (
                    <span className="text-green-600 flex items-center gap-0.5">
                      <Check className="h-3 w-3" />
                      {isEn ? 'Owned' : isTW ? '已擁有' : '已拥有'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-0.5">
                      <Lock className="h-3 w-3" />
                      {item.cost} {isEn ? 'pts' : '分'}
                    </span>
                  )}
                </div>
                {!item.unlocked && (
                  <Button size="sm" variant="outline" className="w-full text-xs h-7" disabled={!canAfford}>
                    {canAfford
                      ? (isEn ? 'Buy' : isTW ? '購買' : '购买')
                      : (isEn ? 'Not enough' : isTW ? '點數不足' : '点数不足')}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
