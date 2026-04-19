'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type PartnerTheme = "classic" | "rose" | "ocean" | "sunset" | "dark";

interface ThemeContextType {
  theme: PartnerTheme;
  setTheme: (theme: PartnerTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "classic",
  setTheme: () => {},
});

export const usePartnerTheme = () => useContext(ThemeContext);

export const themeOptions: { id: PartnerTheme; label: string; colors: [string, string] }[] = [
  { id: "classic", label: "Shero Classic", colors: ["#0d9488", "#10b981"] },
  { id: "rose", label: "Rose Garden", colors: ["#e11d48", "#f43f5e"] },
  { id: "ocean", label: "Ocean Blue", colors: ["#2563eb", "#6366f1"] },
  { id: "sunset", label: "Sunset Gold", colors: ["#d97706", "#f59e0b"] },
  { id: "dark", label: "Dark Mode", colors: ["#1e293b", "#0d9488"] },
];

export const PartnerThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<PartnerTheme>(() => {
    return (localStorage.getItem("partner-theme") as PartnerTheme) || "classic";
  });

  const setTheme = (t: PartnerTheme) => {
    localStorage.setItem("partner-theme", t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
