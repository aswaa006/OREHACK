import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const GlobalBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#030305] pointer-events-none">
      {/* Outer Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      {/* Floating Aurora Blobs */}
      <motion.div
        animate={{
          transform: [
            "translate(0%, 0%) scale(1)",
            "translate(10%, 10%) scale(1.1)",
            "translate(-5%, -5%) scale(0.9)",
            "translate(0%, 0%) scale(1)",
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[130px]"
      />
      <motion.div
        animate={{
          transform: [
            "translate(0%, 0%) scale(1)",
            "translate(-10%, 15%) scale(1.2)",
            "translate(15%, -10%) scale(0.8)",
            "translate(0%, 0%) scale(1)",
          ],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#3B82F6]/5 blur-[150px]"
      />
      <motion.div
        animate={{
          transform: [
            "translate(0%, 0%) scale(1)",
            "translate(20%, -20%) scale(1.3)",
            "translate(-15%, 15%) scale(0.9)",
            "translate(0%, 0%) scale(1)",
          ],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-[#10B981]/5 blur-[120px]"
      />

      {/* Cyber Noise Grain for Premium Texture */}
      <div 
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Dynamic Mouse Spotlight - Reacts to cursor movement */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(123, 63, 228, 0.05), transparent 40%)`
        }}
      />
    </div>
  );
};

export default GlobalBackground;
