import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type TextSize = "normal" | "large" | "extra-large";
export type ContrastMode = "default" | "high-contrast";

interface AccessibilityContextType {
  textSize: TextSize;
  contrastMode: ContrastMode;
  cycleTextSize: () => void;
  toggleContrast: () => void;
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

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-size-large", "text-size-xl", "high-contrast");
    if (TEXT_SIZE_CLASSES[textSize]) root.classList.add(TEXT_SIZE_CLASSES[textSize]);
    if (contrastMode === "high-contrast") root.classList.add("high-contrast");
    localStorage.setItem("a11y_text_size", textSize);
    localStorage.setItem("a11y_contrast", contrastMode);
  }, [textSize, contrastMode]);

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

  return (
    <AccessibilityContext.Provider value={{ textSize, contrastMode, cycleTextSize, toggleContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return context;
}
