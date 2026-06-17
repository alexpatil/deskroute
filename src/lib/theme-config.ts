// lib/theme-config.ts
// Theme system is now shadcn-standard light/dark, toggled via the `.dark`
// class on <html>. Color values live as CSS variables in globals.css.
export type ThemeName = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
