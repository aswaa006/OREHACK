import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import ActiveHackathons from "@/components/ActiveHackathons";
import HowItWorks from "@/components/HowItWorks";
import AboutOregent from "@/components/AboutOregent";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen text-foreground">
      {/* ── World background system (fixed, behind all content) ── */}
      <BackgroundAnimation />

      {/* ── Page sections — above animation layers ── */}
      <div className="relative z-[10]">
        <Navbar />
        <HeroSection />
        <ActiveHackathons />
        <HowItWorks />
        <AboutOregent />
        <Contact />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
