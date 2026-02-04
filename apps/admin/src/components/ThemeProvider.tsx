"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeVariant = "default" | "vt-blue" | "vt-graphite";

interface ThemeContextType {
  theme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "vt-admin-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVariant>("default");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as ThemeVariant | null;
    if (stored && ["default", "vt-blue", "vt-graphite"].includes(stored)) {
      setThemeState(stored);
    }
    setMounted(true);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("theme-vt-blue", "theme-vt-graphite", "dark");
    
    // Apply new theme
    if (theme === "vt-blue") {
      root.classList.add("theme-vt-blue");
    } else if (theme === "vt-graphite") {
      root.classList.add("theme-vt-graphite");
    }
    // "default" uses base :root styles
  }, [theme, mounted]);

  const setTheme = (newTheme: ThemeVariant) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
