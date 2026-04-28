import { useTheme } from "@/context/ThemeContext";

const GlobalBackground = () => {
  const { isDayMode } = useTheme();
  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500" 
      style={{ background: isDayMode ? "#ffffff" : "#000000" }}
    />
  );
};

export default GlobalBackground;
