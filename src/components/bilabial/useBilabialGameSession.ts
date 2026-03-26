import { useCallback, useRef, useState } from "react";
import { useCurrency } from "@/hooks/useCurrency";

export const BILABIAL_TARGET_COUNT = 5;

export type CorrectResult = { newScore: number; coinReward: number };

/** Game loop: goal → action → reward → progress → repeat → end. No API changes. */
export function useBilabialGameSession() {
  const { addCoins } = useCurrency();
  const comboRef = useRef(0);
  const scoreRef = useRef(0);

  const [introDone, setIntroDone] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [lastRewardCoins, setLastRewardCoins] = useState(0);
  const [pipCelebrate, setPipCelebrate] = useState(false);

  const startSession = useCallback(() => {
    setIntroDone(true);
    scoreRef.current = 0;
    comboRef.current = 0;
    setScore(0);
    setCombo(0);
    setSessionCoins(0);
    setLastRewardCoins(0);
  }, []);

  const registerCorrect = useCallback((): CorrectResult => {
    comboRef.current += 1;
    const nc = comboRef.current;
    const coinReward = nc >= 3 ? 20 : nc === 2 ? 15 : 10;
    addCoins(coinReward);
    setSessionCoins((sc) => sc + coinReward);
    setLastRewardCoins(coinReward);
    setCombo(nc);
    setPipCelebrate(true);
    window.setTimeout(() => setPipCelebrate(false), 1600);

    scoreRef.current += 1;
    setScore(scoreRef.current);

    return { newScore: scoreRef.current, coinReward };
  }, [addCoins]);

  const registerWrong = useCallback(() => {
    comboRef.current = 0;
    setCombo(0);
  }, []);

  const resetProgress = useCallback(() => {
    setIntroDone(false);
    scoreRef.current = 0;
    comboRef.current = 0;
    setScore(0);
    setCombo(0);
    setSessionCoins(0);
    setLastRewardCoins(0);
  }, []);

  return {
    targetCount: BILABIAL_TARGET_COUNT,
    introDone,
    startSession,
    score,
    combo,
    sessionCoins,
    lastRewardCoins,
    pipCelebrate,
    registerCorrect,
    registerWrong,
    resetProgress,
  };
}
