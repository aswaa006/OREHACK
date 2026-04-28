import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  isDayMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDayMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDayMode, setIsDayMode] = useState(false);

  useEffect(() => {
    if (isDayMode) {
      document.documentElement.classList.add("day-mode");
    } else {
      document.documentElement.classList.remove("day-mode");
    }
  }, [isDayMode]);

  const toggleTheme = () => setIsDayMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDayMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
