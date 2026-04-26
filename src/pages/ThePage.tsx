import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";

const ThePage = () => {
  const { isDayMode } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDayMode ? "#ffffff" : "#000000",
        transition: "background 0.4s ease",
      }}
    >
      <Navbar />
      {/* Content will be added later */}
    </div>
  );
};

export default ThePage;
