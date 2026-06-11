import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type TextSize = "normal" | "large" | "extra-large";
export type ThemeMode = "dark" | "light";

interface AccessibilityContextType {
  textSize: TextSize;
  theme: ThemeMode;
  setTextSize: (size: TextSize) => void;
  toggleTheme: () => void;
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
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("a11y_theme") as ThemeMode) || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-size-large", "text-size-xl", "dark");
    if (TEXT_SIZE_CLASSES[textSize]) root.classList.add(TEXT_SIZE_CLASSES[textSize]);
    if (theme === "dark") root.classList.add("dark");
    localStorage.setItem("a11y_text_size", textSize);
    localStorage.setItem("a11y_theme", theme);
  }, [textSize, theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <AccessibilityContext.Provider value={{ textSize, theme, setTextSize, toggleTheme }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return context;
}
