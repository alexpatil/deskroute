"use client";

import { THEME_STORAGE_KEY, ThemeName } from "@/lib/theme-config";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(name: ThemeName) {
  document.documentElement.classList.toggle("dark", name === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initial paint is handled by the blocking script in layout.tsx; here we
  // simply sync React state to whatever class is already on <html>.
  const [theme, setThemeState] = useState<ThemeName>("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");
  }, []);

  const setTheme = (next: ThemeName) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
