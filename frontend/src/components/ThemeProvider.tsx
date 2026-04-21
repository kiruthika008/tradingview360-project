"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "dark" | "light";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // On mount: read from localStorage, fallback to system preference
  useEffect(() => {
    const stored = localStorage.getItem("qti-theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      setThemeState(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(prefersDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("qti-theme", theme);
  }, [theme, mounted]);

  function setTheme(t: Theme) { setThemeState(t); }
  function toggle() { setThemeState(prev => prev === "dark" ? "light" : "dark"); }

  // Prevent flash: render nothing until theme is resolved
  if (!mounted) return <div style={{ visibility: "hidden" }}>{children}</div>;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
