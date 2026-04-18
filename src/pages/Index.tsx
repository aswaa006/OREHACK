import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import AboutOregent from "@/components/AboutOregent";
import TeamOregent from "@/components/TeamOregent";
import Contact from "@/components/Contact";

import GlobalBackground from "@/components/GlobalBackground";
import TargetCursor from "@/components/TargetCursor";

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

      <HowItWorks />
      <AboutOregent />
      <TeamOregent />
      <Contact />
    </div>
  );
};

export default Index;
