import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import HowItWorks from "@/components/HowItWorks";
import QuoteSection from "@/components/QuoteSection";
import AboutOregent from "@/components/AboutOregent";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";

import GlobalBackground from "@/components/GlobalBackground";
import TargetCursor from "@/components/TargetCursor";

import LogoLoop from "@/components/LogoLoop";
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiFramer, SiVite, SiSupabase, SiGithub } from "react-icons/si";
import { useTheme } from "@/context/ThemeContext";

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiFramer />, title: "Framer Motion", href: "https://www.framer.com/motion/" },
  { node: <SiVite />, title: "Vite", href: "https://vitejs.dev" },
  { node: <SiSupabase />, title: "Supabase", href: "https://supabase.com" },
  { node: <SiGithub />, title: "GitHub", href: "https://github.com" },
];

const IndexContent = () => {
  const { isDayMode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      className="min-h-screen text-foreground relative z-0"
      style={{
        background: isDayMode ? "#ffffff" : "#000000",
        transition: "background 0.5s ease",
      }}
    >
      <GlobalBackground />
      <TargetCursor
        targetSelector=".cursor-target"
        spinDuration={2}
        hideDefaultCursor={false}
        hoverDuration={0.2}
        parallaxOn={true}
      />
      <Navbar />

      <HeroSection />

      <ProductsSection />

      <QuoteSection />

      <div style={{ 
        padding: isMobile ? '24px 0' : '36px 0', 
        opacity: 0.8,
        color: isDayMode ? "#000000" : "#ffffff",
        transition: "color 0.4s ease",
        overflow: "hidden",
        width: "100%",
        maxWidth: "100vw",
      }}>
        <LogoLoop
          logos={techLogos}
          speed={isMobile ? 35 : 45}
          logoHeight={isMobile ? 28 : 34}
          gap={isMobile ? 64 : 88}
          fadeOut={true}
          fadeOutColor={isDayMode ? "#ffffff" : "#000000"}
          scaleOnHover={true}
        />
      </div>

      <HowItWorks />
      <AboutOregent />
      <FAQ />
      <Contact />
    </div>
  );
};

const Index = () => {
  return <IndexContent />;
};

export default Index;
