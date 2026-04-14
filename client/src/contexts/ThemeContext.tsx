import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

// Detect OS theme preference
function getOSThemePreference(): Theme {
  if (typeof window === "undefined") return "light";
  
  // Check if user has a stored preference
  const stored = localStorage.getItem("theme");
  if (stored) return (stored as Theme);
  
  // Check OS preference using prefers-color-scheme media query
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  
  return "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      return getOSThemePreference();
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Add transition class to enable smooth animations
    root.classList.add("theme-transitioning");
    
    // Apply theme change
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Remove transition class after animation completes
    const timer = setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 300);

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
    
    return () => clearTimeout(timer);
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
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
