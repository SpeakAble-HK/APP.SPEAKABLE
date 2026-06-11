import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { pickChallenges, SPEECH_THERAPY_TASKS, type Challenge, type TaskDef } from "@/data/speechTherapyTasks";
import { speakCantonese, hasCantoneseVoice, ensureVoices } from "@/shared/lib/cantoneseTts";

export interface SpeechGameState {
  task: TaskDef;
  challenges: Challenge[];
  phase: "start" | "playing" | "result";
  currentIndex: number;
  score: number;
  streak: number;
  stars: number;
  totalChallenges: number;
  earnedBadge: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  currentChallenge: Challenge;
  elapsedMs: number;
  /** Per-challenge correctness, in order, for reporting to analytics. */
  answerLog: { word: string; correct: boolean }[];
  /** True when the device lacks a real zh-HK voice (UI can warn the child/parent). */
  audioUnavailable: boolean;
  startGame: () => void;
  handleAnswer: (index: number) => void;
  speakText: (text: string) => void;
  replayAudio: () => void;
}

export function useSpeechTherapyGame(taskId: string, difficulty = 0.7): SpeechGameState {
  const challengeCount = difficulty < 0.6 ? 5 : difficulty < 1 ? 8 : 10;
  const task = SPEECH_THERAPY_TASKS[taskId];
  const challenges = useMemo(() => pickChallenges(taskId, challengeCount), [taskId, challengeCount]);

  const [phase, setPhase] = useState<"start" | "playing" | "result">("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const [answerLog, setAnswerLog] = useState<{ word: string; correct: boolean }[]>([]);
  const startTime = useRef(0);

  useEffect(() => {
    ensureVoices().then(() => setAudioUnavailable(!hasCantoneseVoice()));
  }, []);

  const currentChallenge = challenges[currentIndex] ?? challenges[0];
  const totalChallenges = challenges.length;
  const earnedBadge = streak >= 5;

  const speakText = useCallback((text: string) => {
    speakCantonese(text, { rate: 0.9, onerror: () => setAudioUnavailable(true) });
  }, []);

  const replayAudio = useCallback(() => {
    if (currentChallenge) speakText(currentChallenge.audioText);
  }, [currentChallenge, speakText]);

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return;
    const correct = index === currentChallenge.correctIndex;
    setSelectedAnswer(index);
    setIsCorrect(correct);
    setAnswerLog((log) => [...log, { word: currentChallenge.word, correct }]);
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  }, [currentChallenge, selectedAnswer]);

  useEffect(() => {
    if (phase !== "result") return;
    setElapsedMs(Date.now() - startTime.current);
  }, [phase]);

  useEffect(() => {
    if (selectedAnswer === null) return;
    const t = setTimeout(() => {
      if (currentIndex < challenges.length - 1) {
        setCurrentIndex(i => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setPhase("result");
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [selectedAnswer, currentIndex, challenges.length]);

  useEffect(() => {
    if (phase === "playing" && currentChallenge) {
      const t = setTimeout(() => speakText(currentChallenge.audioText), 400);
      return () => clearTimeout(t);
    }
  }, [phase, currentIndex, currentChallenge, speakText]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAnswerLog([]);
    startTime.current = Date.now();
  }, []);

  return {
    task, challenges, phase, currentIndex, score, streak,
    stars: score, totalChallenges, earnedBadge,
    selectedAnswer, isCorrect, currentChallenge,
    elapsedMs, answerLog, audioUnavailable,
    startGame, handleAnswer, speakText, replayAudio,
  };
}
