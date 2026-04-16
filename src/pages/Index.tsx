import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ActiveHackathons from "@/components/ActiveHackathons";
import HowItWorks from "@/components/HowItWorks";
import AboutOregent from "@/components/AboutOregent";
import TeamOregent from "@/components/TeamOregent";
import Contact from "@/components/Contact";

import GlobalBackground from "@/components/GlobalBackground";

const Index = () => {
  return (
    <div className="min-h-screen text-foreground relative z-0">
      <GlobalBackground />
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
        </div>

        {/* This wrapper scrolls UP and overlays the hero */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            background: "hsl(222 47% 5%)",
          }}
        >
          {/* Rounded top edge overlay */}
          <div
            style={{
              position: "sticky",
              top: 0,
              height: "2rem",
              marginBottom: "-2rem",
              zIndex: 10,
              background: "hsl(222 47% 5%)",
              borderTopLeftRadius: "2rem",
              borderTopRightRadius: "2rem",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
              pointerEvents: "none",
            }}
          />
          <ActiveHackathons />
          <HowItWorks />
          <AboutOregent />
          <TeamOregent />
          <Contact />
        </div>
      </div>
    </div>
  );
};

export default Index;
