import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/shared/components/MaterialIcon";
import { PiPiWidget } from "@/enhancement/student-portal/components/PiPiWidget";
import { useCurrency } from "@/shared/hooks/useCurrency";

type QuestId = "animals" | "food" | "family";
type GameView = "quests" | "game" | "complete";

interface CardData {
  id: string;
  content: string;
  type: "character" | "picture";
  pairId: string;
}

const QUESTS: Record<QuestId, { icon: string; label: string; gradient: string; pairs: { character: string; picture: string }[] }> = {
  animals: {
    icon: "pets",
    label: "動物",
    gradient: "from-emerald-400/90 via-teal-500/85 to-cyan-700/90",
    pairs: [
      { character: "狗", picture: "🐕" },
      { character: "貓", picture: "🐈" },
      { character: "魚", picture: "🐟" },
      { character: "鳥", picture: "🐦" },
      { character: "兔", picture: "🐇" },
      { character: "馬", picture: "🐴" },
    ],
  },
  food: {
    icon: "restaurant",
    label: "食物",
    gradient: "from-orange-400/95 via-amber-500/90 to-orange-700/95",
    pairs: [
      { character: "飯", picture: "🍚" },
      { character: "麵", picture: "🍜" },
      { character: "蘋果", picture: "🍎" },
      { character: "蛋", picture: "🥚" },
      { character: "茶", picture: "🍵" },
      { character: "餅", picture: "🍪" },
    ],
  },
  family: {
    icon: "family_restroom",
    label: "家庭",
    gradient: "from-cyan-400/90 via-sky-500/95 to-primary/90",
    pairs: [
      { character: "爸爸", picture: "👨" },
      { character: "媽媽", picture: "👩" },
      { character: "哥哥", picture: "🧑" },
      { character: "姐姐", picture: "👧" },
      { character: "弟弟", picture: "👦" },
      { character: "妹妹", picture: "👶" },
    ],
  },
};

const PIPI_TIPS = [
  "將文字與圖片配對！",
  "慢慢來，不用急！",
  "好記性有助語言學習！",
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function SemanticIslandPage() {
  const navigate = useNavigate();
  const { coins, addCoins, addXP } = useCurrency();
  const [view, setView] = useState<GameView>("quests");
  const [activeQuest, setActiveQuest] = useState<QuestId | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (view !== "game") return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [view, startTime]);

  const startQuest = useCallback((questId: QuestId) => {
    const q = QUESTS[questId];
    const allCards: CardData[] = [];
    q.pairs.forEach((p, i) => {
      allCards.push({ id: `char-${i}`, content: p.character, type: "character", pairId: `p${i}` });
      allCards.push({ id: `pic-${i}`, content: p.picture, type: "picture", pairId: `p${i}` });
    });
    setCards(shuffleArray(allCards));
    setFlippedIds([]);
    setMatchedPairIds(new Set());
    setMoves(0);
    setStartTime(Date.now());
    setElapsed(0);
    setActiveQuest(questId);
    setView("game");
  }, []);

  const handleCardClick = useCallback((card: CardData) => {
    if (matchedPairIds.has(card.pairId) || flippedIds.includes(card.id) || flippedIds.length >= 2) return;

    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped.map((fid) => cards.find((c) => c.id === fid)!);
      if (first.pairId === second.pairId && first.type !== second.type) {
        setTimeout(() => {
          setMatchedPairIds((prev) => {
            const next = new Set(prev);
            next.add(first.pairId);
            if (next.size === cards.length / 2) {
              addCoins(10);
              addXP(25);
              setView("complete");
            }
            return next;
          });
          setFlippedIds([]);
        }, 600);
      } else {
        setTimeout(() => setFlippedIds([]), 800);
      }
    }
  }, [flippedIds, matchedPairIds, cards, addCoins, addXP]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Quest picker
  if (view === "quests") {
    return (
      <div className="min-h-full bg-surface font-body text-on-surface pb-28">
        <div className="fixed w-72 h-72 rounded-full bg-primary-container/35 -top-20 -left-16 blur-[80px] pointer-events-none -z-10" aria-hidden="true" />
        <div className="fixed w-96 h-96 rounded-full bg-sky-300/30 top-1/4 -right-24 blur-[80px] pointer-events-none -z-10" aria-hidden="true" />

        <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
          <div className="text-center mb-2">
            <h1 className="font-headline text-2xl font-bold text-primary tracking-tight">語義任務</h1>
            <p className="text-on-surface-variant text-sm mt-1">配對意思——文字與圖片！</p>
          </div>

          {(Object.entries(QUESTS) as [QuestId, typeof QUESTS[QuestId]][]).map(([id, q]) => (
            <button
              key={id}
              onClick={() => startQuest(id)}
              className="w-full text-left glass-card rounded-xl p-4 shadow-lg active:scale-[0.98] transition-transform border border-white/50 overflow-hidden relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${q.gradient} opacity-95 group-hover:opacity-100 transition-opacity`} />
              <div className="relative flex items-center gap-4 text-white">
                <MaterialIcon icon={q.icon} filled className="text-5xl shrink-0" />
                <div>
                  <p className="font-headline font-bold text-lg">{q.label}</p>
                  <p className="text-sm text-white/90">配對圖片與名稱</p>
                </div>
                <MaterialIcon icon="chevron_right" className="ml-auto text-2xl opacity-80" />
              </div>
            </button>
          ))}
        </div>
        <PiPiWidget tips={PIPI_TIPS} />
      </div>
    );
  }

  // Game view
  if (view === "game" && activeQuest) {
    return (
      <div className="min-h-full bg-surface font-body text-on-surface pb-28">
        <div className="fixed w-72 h-72 rounded-full bg-primary-container/35 -top-20 -left-16 blur-[80px] pointer-events-none -z-10" aria-hidden="true" />

        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setView("quests")} className="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors">
              <MaterialIcon icon="arrow_back" className="text-lg" /> 返回
            </button>
            <h2 className="font-headline font-bold text-primary text-sm">{QUESTS[activeQuest].label}</h2>
          </div>

          {/* Stats bar */}
          <div className="flex justify-around mb-5 glass-card rounded-xl p-3 border border-white/40">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">時間</p>
              <p className="font-headline font-bold text-on-surface">{formatTime(elapsed)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">步數</p>
              <p className="font-headline font-bold text-on-surface">{moves}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">配對</p>
              <p className="font-headline font-bold text-on-surface">{matchedPairIds.size}/{cards.length / 2}</p>
            </div>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {cards.map((card) => {
              const isFlipped = flippedIds.includes(card.id);
              const isMatched = matchedPairIds.has(card.pairId);
              const showFace = isFlipped || isMatched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  disabled={isMatched}
                  className={`aspect-square rounded-xl transition-all duration-200 active:scale-95 ${isMatched ? "is-matched-glow" : ""}`}
                  style={{ perspective: "1000px" }}
                >
                  <div className={`flip-inner w-full h-full ${showFace ? "flipped" : ""}`}>
                    {/* Back face (hidden) */}
                    <div className="flip-face absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shadow-lg border border-white/20">
                      <MaterialIcon icon="waves" filled className="text-3xl text-white/85" />
                    </div>
                    {/* Front face (content) */}
                    <div className={`flip-face flip-face--back absolute inset-0 rounded-xl flex items-center justify-center shadow-lg border border-white/30 ${
                      card.type === "character"
                        ? "bg-white text-on-surface"
                        : "bg-gradient-to-br from-amber-100 to-amber-200 text-on-surface"
                    }`}>
                      <span className={card.type === "character" ? "font-headline text-2xl font-bold" : "text-4xl"}>
                        {card.content}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <PiPiWidget tips={PIPI_TIPS} />
      </div>
    );
  }

  // Completion view
  return (
    <div className="min-h-full bg-surface font-body text-on-surface flex items-center justify-center px-4 pb-28">
      <div className="max-w-sm w-full text-center glass-card rounded-2xl p-8 shadow-2xl border border-white/40 z-[60]">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center mb-4 shadow-xl">
          <MaterialIcon icon="emoji_events" filled className="text-white text-4xl" />
        </div>
        <h2 className="font-headline text-2xl font-bold text-primary mb-2">任務完成！</h2>
        <p className="text-on-surface-variant mb-6">
          用了 {moves} 步，耗時 {formatTime(elapsed)}
        </p>
        <div className="flex justify-center gap-4 mb-6">
          <div className="bg-tertiary-container/40 rounded-xl px-4 py-2 text-center">
            <MaterialIcon icon="paid" filled className="text-tertiary text-lg" />
            <p className="font-headline font-bold text-on-tertiary-container text-lg">+10</p>
          </div>
          <div className="bg-primary-container/40 rounded-xl px-4 py-2 text-center">
            <MaterialIcon icon="star" filled className="text-primary text-lg" />
            <p className="font-headline font-bold text-on-primary-container text-lg">+25 XP</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setView("quests")}
            className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            返回任務
          </button>
          <button
            onClick={() => navigate("/explorer")}
            className="w-full bg-surface-container text-on-surface font-bold py-3 rounded-xl active:scale-95 transition-transform"
          >
            返回地圖
          </button>
        </div>
      </div>
    </div>
  );
}
