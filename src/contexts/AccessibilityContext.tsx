import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type TextSize = "normal" | "large" | "extra-large";
export type ContrastMode = "default" | "high-contrast";
export type ThemeMode = "dark" | "light";

interface AccessibilityContextType {
  textSize: TextSize;
  contrastMode: ContrastMode;
  animationsEnabled: boolean;
  theme: ThemeMode;
  focusMode: boolean;
  setTextSize: (size: TextSize) => void;
  setContrastMode: (mode: ContrastMode) => void;
  cycleTextSize: () => void;
  toggleContrast: () => void;
  toggleAnimations: () => void;
  toggleTheme: () => void;
  toggleFocusMode: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const TEXT_SIZE_CLASSES: Record<TextSize, string> = {
  normal: "",
  large: "text-size-large",
  "extra-large": "text-size-xl",
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem("a11y_text_size") as TextSize) || "normal";
  });
  const [contrastMode, setContrastMode] = useState<ContrastMode>(() => {
    return (localStorage.getItem("a11y_contrast") as ContrastMode) || "default";
  });
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem("a11y_animations");
    return stored !== "false";
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("a11y_theme") as ThemeMode) || "light";
  });
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    return localStorage.getItem("a11y_focus_mode") === "true";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-size-large", "text-size-xl", "dark");
    if (TEXT_SIZE_CLASSES[textSize]) root.classList.add(TEXT_SIZE_CLASSES[textSize]);
    if (theme === "dark") root.classList.add("dark");
    localStorage.setItem("a11y_text_size", textSize);
    localStorage.setItem("a11y_theme", theme);
  }, [textSize, theme]);

  const cycleTextSize = () => {
    setTextSize(prev => {
      if (prev === "normal") return "large";
      if (prev === "large") return "extra-large";
      return "normal";
    });
  };

  const toggleContrast = () => {
    setContrastMode(prev => prev === "default" ? "high-contrast" : "default");
  };

  const toggleAnimations = () => {
    setAnimationsEnabled(prev => !prev);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const toggleFocusMode = () => {
    setFocusMode(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider value={{ textSize, contrastMode, animationsEnabled, theme, focusMode, setTextSize, setContrastMode, cycleTextSize, toggleContrast, toggleAnimations, toggleTheme, toggleFocusMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return context;
}
