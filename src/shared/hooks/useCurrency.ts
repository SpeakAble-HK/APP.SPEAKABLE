import { useState, useEffect, useCallback } from "react";
import { computeLessonXpReward, type LessonXpParams } from "@/shared/lib/xpRewardEngine";

export type Currency = "USD" | "HKD" | "RMB" | "GBP";

const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  HKD: 7.8,
  RMB: 7.2,
  GBP: 0.79,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  HKD: "HK$",
  RMB: "¥",
  GBP: "£",
};

function detectCurrencyFromTimezone(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.startsWith("Asia/Hong_Kong")) return "HKD";
    if (tz.startsWith("Asia/Shanghai") || tz.startsWith("Asia/Chongqing") || tz.startsWith("Asia/Beijing")) return "RMB";
    if (tz.startsWith("Europe/London")) return "GBP";
  } catch {}
  return "USD";
}

function readGameCurrency(): { coins: number; xp: number } {
  try {
    const raw = localStorage.getItem("speakable_game_currency");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { coins: 0, xp: 0 };
}

function saveGameCurrency(coins: number, xp: number) {
  localStorage.setItem("speakable_game_currency", JSON.stringify({ coins, xp }));
}

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [detected, setDetected] = useState(false);

  const initial = readGameCurrency();
  const [coins, setCoins] = useState(initial.coins);
  const [xp, setXP] = useState(initial.xp);

  useEffect(() => {
    if (detected) return;
    setCurrency(detectCurrencyFromTimezone());
    setDetected(true);
  }, [detected]);

  const addCoins = useCallback((amount: number) => {
    setCoins((prev) => {
      const next = prev + amount;
      saveGameCurrency(next, xp);
      return next;
    });
  }, [xp]);

  const addXP = useCallback((amount: number) => {
    setXP((prev) => {
      const next = prev + amount;
      saveGameCurrency(coins, next);
      return next;
    });
  }, [coins]);

  /** Applies bonus/penalty rules then credits XP (quest / lesson completion). */
  const awardLessonXp = useCallback(
    (params: LessonXpParams) => {
      const amount = computeLessonXpReward(params);
      if (amount <= 0) return 0;
      setXP((prev) => {
        const next = prev + amount;
        saveGameCurrency(coins, next);
        return next;
      });
      return amount;
    },
    [coins]
  );

  const convert = (usdAmount: number): string => {
    const rate = EXCHANGE_RATES[currency];
    const converted = Math.round(usdAmount * rate);
    return `${CURRENCY_SYMBOLS[currency]}${converted.toLocaleString()}`;
  };

  const formatFixed = (amount: number, cur: Currency): string => {
    return `${CURRENCY_SYMBOLS[cur]}${amount.toLocaleString()}`;
  };

  return {
    currency, setCurrency, convert, formatFixed,
    symbol: CURRENCY_SYMBOLS[currency],
    coins, xp, addCoins, addXP, awardLessonXp,
  };
}
