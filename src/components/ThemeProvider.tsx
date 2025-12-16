// components/ThemeProvider.tsx
"use client";

import { ThemeColors, ThemeName, themes } from "@/lib/theme-config";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as ThemeName;
    if (saved && themes[saved]) {
      setThemeState(saved);
    }
  }, []);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(themes[newTheme]);
  };

  useEffect(() => {
    if (mounted) {
      applyTheme(themes[theme]);
    }
  }, [theme, mounted]);

  const applyTheme = (colors: ThemeColors) => {
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  };

  if (!mounted) {
    return null;
  }

  return <ThemeContext.Provider value={{ theme, colors: themes[theme], setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
