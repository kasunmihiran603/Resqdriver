import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("vamp-theme") || "system";
  });

  const [accentColor, setAccentColorState] = useState(() => {
    return localStorage.getItem("vamp-accent") || "blue";
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("vamp-theme", newTheme);
  };

  const setAccentColor = (newAccent) => {
    setAccentColorState(newAccent);
    localStorage.setItem("vamp-accent", newAccent);
  };

  // Sync theme changes with DOM
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Theme application logic
    const applyTheme = (t) => {
      root.classList.remove("light", "dark");
      
      if (t === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(t);
      }
    };

    applyTheme(theme);

    // Watch for system color scheme change if set to system
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleMediaChange = (e) => {
        root.classList.remove("light", "dark");
        root.classList.add(e.matches ? "dark" : "light");
      };
      
      mediaQuery.addEventListener("change", handleMediaChange);
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    }
  }, [theme]);

  // Sync accent color with DOM
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all accents
    const accents = ["accent-blue", "accent-green", "accent-indigo", "accent-rose"];
    accents.forEach((cls) => root.classList.remove(cls));
    
    // Add current accent
    root.classList.add(`accent-${accentColor}`);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
