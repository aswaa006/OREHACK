import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhatWeDo from "@/components/WhatWeDo";
import HowItWorks from "@/components/HowItWorks";
import QuoteSection from "@/components/QuoteSection";
import AboutOregent from "@/components/AboutOregent";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";

import GlobalBackground from "@/components/GlobalBackground";
import TargetCursor from "@/components/TargetCursor";

import LogoLoop from "@/components/LogoLoop";
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiFramer, SiVite, SiSupabase, SiGithub } from "react-icons/si";

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

const Index = () => {
  return (
    <div className="min-h-screen text-foreground relative z-0" style={{ background: "#000000" }}>
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

      <WhatWeDo />
      <QuoteSection />
      
      <div style={{ padding: '48px 0', opacity: 0.8 }}>
        <LogoLoop 
          logos={techLogos} 
          speed={50} 
          logoHeight={48} 
          gap={120} 
          fadeOut={true} 
          fadeOutColor="#000000"
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

export default Index;
