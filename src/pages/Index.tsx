import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ActiveHackathons from "@/components/ActiveHackathons";
import HowItWorks from "@/components/HowItWorks";
import AboutOregent from "@/components/AboutOregent";
import TeamOregent from "@/components/TeamOregent";
import Contact from "@/components/Contact";

import GlobalBackground from "@/components/GlobalBackground";
import TargetCursor from "@/components/TargetCursor";

const Index = () => {
  return (
    <div className="min-h-screen text-foreground relative z-0">
      <GlobalBackground />
      <TargetCursor
        targetSelector=".cursor-target"
        spinDuration={2}
        hideDefaultCursor={false}
        hoverDuration={0.2}
        parallaxOn={true}
      />
      <Navbar />

      {/* Hero stays pinned behind while the next section scrolls over it */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <HeroSection />
          {/* Continuation blur — softly blurs the bottom of the hero just before overlap */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40px",
              zIndex: 10,
              pointerEvents: "none",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              maskImage: "linear-gradient(to top, black, transparent)",
              WebkitMaskImage: "linear-gradient(to top, black, transparent)",
            }}
          />
        </div>

        {/* This wrapper scrolls UP and overlays the hero */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            borderTopLeftRadius: "2.5rem",
            borderTopRightRadius: "2.5rem",
          }}
        >
          <ActiveHackathons />
          {/* Remaining sections revert to dark background */}
          <div style={{ background: "hsl(222 47% 5%)", position: "relative" }}>
            <HowItWorks />
            <AboutOregent />
            <TeamOregent />
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
