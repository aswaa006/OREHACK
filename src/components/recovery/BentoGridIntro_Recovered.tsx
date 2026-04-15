/**
 * BentoGridIntro.tsx
 * 
 * Modern Bento Grid Intro Animation
 * 
 * Features:
 * ✅ Container zoom-out effect (1.1/1.2 → 1.0) + fade-in
 * ✅ Staggered card pop-in with spring physics
 * ✅ Dark theme with radial gradient glow
 * ✅ Responsive grid layout (4 columns on desktop)
 * ✅ Mouse-following glow effect
 * ✅ Smooth transitions with Framer Motion
 */

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CARD DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BENTO_CARDS = [
  {
    id: 1,
    title: 'AI-Powered Insights',
    description: 'Advanced machine learning models that learn from your data patterns.',
    icon: '🧠',
    color: 'from-purple-600/20',
    accentColor: 'purple',
    size: 'regular',
  },
  {
    id: 2,
    title: 'Real-Time Analytics',
    description: 'Live dashboards with instant data visualization and metrics.',
    icon: '📊',
    color: 'from-blue-600/20',
    accentColor: 'blue',
    size: 'regular',
  },
  {
    id: 3,
    title: 'Seamless Integration',
    description: 'Connect with your favorite tools and platforms effortlessly.',
    icon: '🔗',
    color: 'from-cyan-600/20',
    accentColor: 'cyan',
    size: 'regular',
  },
  {
    id: 4,
    title: 'Enterprise Scale',
    description: 'Built for teams of any size, from startups to enterprises.',
    icon: '🏢',
    color: 'from-indigo-600/20',
    accentColor: 'indigo',
    size: 'large',
    span: 2,
  },
  {
    id: 5,
    title: 'Security First',
    description: 'Bank-grade encryption and compliance with global standards.',
    icon: '🔐',
    color: 'from-green-600/20',
    accentColor: 'green',
    size: 'regular',
  },
  {
    id: 6,
    title: 'Custom Workflows',
    description: 'Design automation rules tailored to your unique business needs.',
    icon: '⚙️',
    color: 'from-orange-600/20',
    accentColor: 'orange',
    size: 'regular',
  },
  {
    id: 7,
    title: 'Global Reach',
    description: 'Deploy across regions with automatic load balancing.',
    icon: '🌍',
    color: 'from-pink-600/20',
    accentColor: 'pink',
    size: 'regular',
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTAINER VARIANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const containerVariants = {
  hidden: {
    scale: 1.15,
    opacity: 0,
    filter: 'blur(12px)',
  },
  visible: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1], // cubic-bezier easing for smooth zoom
    },
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CARD VARIANTS (Staggered spring pop-in)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const cardVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      delay: 0.15 + index * 0.08, // Stagger delay starts after container zoom
    },
  }),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INDIVIDUAL CARD COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface BentoCardProps {
  card: (typeof BENTO_CARDS)[0];
  index: number;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const BentoCard = ({ card, index, onMouseMove }: BentoCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${card.color} to-transparent backdrop-blur-sm transition-all duration-300 hover:border-white/20 cursor-default ${
        card.span ? `col-span-${card.span}` : ''
      }`}
      style={{ minHeight: card.size === 'large' ? '280px' : '200px' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
    >
      {/* ─── Radial Gradient Glow (follows mouse) ─── */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(124, 58, 237, 0.15) 0%, transparent 50%)`,
        }}
      />

      {/* ─── Static Center Glow ─── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* ─── Content Container ─── */}
      <div className="relative z-10 flex h-full flex-col justify-between gap-4 p-6">
        {/* Icon & Title */}
        <div className="flex flex-col gap-3">
          <motion.div
            className="text-3xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + index * 0.08 + 0.2 }}
          >
            {card.icon}
          </motion.div>
          <h3 className="text-base font-semibold tracking-tight text-white/95">
            {card.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-white/60 group-hover:text-white/70 transition-colors duration-300">
          {card.description}
        </p>

        {/* Corner Accent */}
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute top-0 right-0 w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
          <div className="absolute top-0 right-0 h-px w-10 bg-gradient-to-l from-white/40 to-transparent" />
        </div>
      </div>

      {/* ─── Hover Border Glow ─── */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/10 transition-colors duration-300" />
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function BentoGridIntro() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#020203] via-slate-900 to-[#020203]">
      {/* ─── Background Grid Pattern ─── */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* ─── Ambient Glow ─── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full filter blur-3xl" />
      </div>

      {/* ─── Main Container ─── */}
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center px-4 py-20"
      >
        {/* ─── Header Section ─── */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="mb-4 text-4xl md:text-5xl font-bold tracking-tight text-white">
            Modern Platform{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Built for Scale
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Experience the power of next-generation infrastructure with our
            feature-rich platform designed to grow with your ambitions.
          </p>
        </motion.div>

        {/* ─── Bento Grid ─── */}
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 auto-rows-[200px] lg:auto-rows-[240px]">
            {BENTO_CARDS.map((card, index) => (
              <div
                key={card.id}
                className={card.span ? `md:col-span-2` : ''}
              >
                <BentoCard card={card} index={index} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── CTA Section ─── */}
      <motion.div
        className="relative z-10 mt-20 flex flex-col items-center justify-center gap-6 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <button className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:scale-105">
          Get Started
          <span className="transform transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
        <p className="text-center text-sm text-white/50">
          Free for 14 days. No credit card required.
        </p>
      </motion.div>
    </div>
  );
}
