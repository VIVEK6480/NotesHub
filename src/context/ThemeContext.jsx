import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/*
  Put this file at:  src/context/ThemeContext.jsx

  Wrap your app ONCE (main.jsx or App.jsx):

    <ThemeProvider>
      <App />
    </ThemeProvider>
*/

const STORAGE_KEY = "noteshub-theme";

const ThemeContext = createContext(null);

const readInitialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light") return true;
    if (saved === "dark") return false;
  } catch {
    /* storage blocked, fall through */
  }
  return false; // default: dark
};

export function ThemeProvider({ children }) {
  const [light, setLight] = useState(readInitialTheme);

  /* apply to <html> so every page and component can react */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", light ? "light" : "dark");
    root.classList.toggle("light", light);
    root.style.colorScheme = light ? "light" : "dark";

    try {
      localStorage.setItem(STORAGE_KEY, light ? "light" : "dark");
    } catch {
      /* ignore */
    }
  }, [light]);

  /* keep multiple tabs in sync */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) setLight(e.newValue === "light");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = useCallback(() => setLight((v) => !v), []);

  const value = useMemo(
    () => ({ light, theme: light ? "light" : "dark", toggleTheme, setLight }),
    [light, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>. Wrap your app with it in main.jsx.");
  }
  return ctx;
}