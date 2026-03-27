import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ExplorerOnboardingContextValue = {
  nickname: string;
  setNickname: (v: string) => void;
  voice1Url: string | null;
  setVoice1Url: (v: string | null) => void;
};

const ExplorerOnboardingContext = createContext<ExplorerOnboardingContextValue | null>(null);

export function ExplorerOnboardingProvider({ children }: { children: ReactNode }) {
  const [nickname, setNickname] = useState("");
  const [voice1Url, setVoice1UrlState] = useState<string | null>(null);

  const setVoice1Url = useCallback((next: string | null) => {
    setVoice1UrlState((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return next;
    });
  }, []);

  const voice1Ref = useRef(voice1Url);
  voice1Ref.current = voice1Url;

  useEffect(() => {
    return () => {
      if (voice1Ref.current) URL.revokeObjectURL(voice1Ref.current);
    };
  }, []);

  const value: ExplorerOnboardingContextValue = {
    nickname,
    setNickname,
    voice1Url,
    setVoice1Url,
  };

  return (
    <ExplorerOnboardingContext.Provider value={value}>{children}</ExplorerOnboardingContext.Provider>
  );
}

export function useExplorerOnboarding() {
  const ctx = useContext(ExplorerOnboardingContext);
  if (!ctx) {
    throw new Error("useExplorerOnboarding must be used within ExplorerOnboardingProvider");
  }
  return ctx;
}
