import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ActiveHackathons from "@/components/ActiveHackathons";
import HowItWorks from "@/components/HowItWorks";
import AboutOregent from "@/components/AboutOregent";
import TeamOregent from "@/components/TeamOregent";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import GlobalBackground from "@/components/GlobalBackground";

const Index = () => {
  return (
    <div className="min-h-screen text-foreground relative z-0">
      <GlobalBackground />
      <Navbar />
      <HeroSection />
      <ActiveHackathons />
      <HowItWorks />
      <AboutOregent />
      <TeamOregent />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
