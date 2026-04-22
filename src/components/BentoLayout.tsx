/**
 * BentoLayout.tsx
 * 
 * 7-Card Bento Grid with Strict Asymmetric Layout
 * 
 * Layout Pattern (STRICT):
 * ┌─────────────────┬───────┐
 * │ Card A (2 cols) │Card B │ Row 1
 * ├───────┬───────┬─────────┤
 * │ Card C│ Card D│ Card E  │ Row 2
 * ├─────────────────┬───────┤
 * │ Card F (2 cols) │Card G │ Row 3
 * └─────────────────┴───────┘
 */

import { useState } from 'react';

interface BentoItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

const BENTO_ITEMS: BentoItem[] = [
  {
    id: 'startup-dev',
    title: 'Startup Dev',
    description: 'Fast-track development with pre-built templates and components',
    icon: '🚀',
    color: 'from-violet-600 to-purple-600',
    gradient: 'from-violet-500/20 to-purple-600/10',
  },
  {
    id: 'product-strategy',
    title: 'Product Strategy',
    description: 'Align your vision with market demands using AI insights',
    icon: '🎯',
    color: 'from-blue-600 to-cyan-600',
    gradient: 'from-blue-500/20 to-cyan-600/10',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Real-time dashboards and deep insights into user behavior',
    icon: '📊',
    color: 'from-emerald-600 to-teal-600',
    gradient: 'from-emerald-500/20 to-teal-600/10',
  },
  {
    id: 'team',
    title: 'Team',
    description: 'Collaborate seamlessly with your distributed team',
    icon: '👥',
    color: 'from-orange-600 to-red-600',
    gradient: 'from-orange-500/20 to-red-600/10',
  },
  {
    id: 'ai-insights',
    title: 'AI Insights',
    description: 'Machine learning models that learn from your data',
    icon: '🧠',
    color: 'from-pink-600 to-rose-600',
    gradient: 'from-pink-500/20 to-rose-600/10',
  },
  {
    id: 'brand',
    title: 'Brand',
    description: 'Build brand authority with integrated marketing tools',
    icon: '✨',
    color: 'from-indigo-600 to-blue-600',
    gradient: 'from-indigo-500/20 to-blue-600/10',
  },
  {
    id: 'beta-status',
    title: 'Beta Status',
    description: 'Early access to cutting-edge features and improvements',
    icon: '⚡',
    color: 'from-yellow-600 to-amber-600',
    gradient: 'from-yellow-500/20 to-amber-600/10',
  },
];

interface CardProps {
  item: BentoItem;
  index: number;
}

function BentoCard({ item, index }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${item.gradient} backdrop-blur-md transition-all duration-300 ${
        isHovered ? 'translate-y-[-5px]' : 'translate-y-0'
      } ${isHovered ? 'shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'shadow-lg'} w-full h-full flex flex-col items-start justify-between p-6 md:p-8 cursor-default`}
      style={{
        animation: `fadeInUp 0.6s ease-out ${0.1 * index}s both`,
      }}
    >
      {/* Background Glow Effect */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        style={{
          background: `radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Linear Gradient Border Effect */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none">
        <div
          className={`absolute inset-0 rounded-3xl transition-all duration-300 ${
            isHovered ? 'border-2 border-white/30' : 'border border-white/5'
          }`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-2 flex-1">
        <div className="text-4xl md:text-5xl">{item.icon}</div>
        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
          {item.title}
        </h3>
      </div>

      {/* Description */}
      <p className="relative z-10 text-sm md:text-base text-white/70 group-hover:text-white/85 transition-colors duration-300 leading-relaxed">
        {item.description}
      </p>

      {/* Hover Arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300">
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </div>
    </div>
  );
}

export default function BentoLayout() {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden py-16 md:py-24 px-4 md:px-8">
      {/* Background Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Ambient Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full filter blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-cyan-600/5 rounded-full filter blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-6xl mx-auto mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Powerful Features,{' '}
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Infinite Possibilities
          </span>
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Everything you need to build, scale, and succeed with our comprehensive
          suite of tools and features.
        </p>
      </div>

      {/* Bento Grid - STRICT 3 COLUMN LAYOUT */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-6 auto-rows-[280px]">
          {/* ROW 1: Startup Dev (COLS 1-2) + Product Strategy (COL 3) */}
          <div className="col-span-2">
            <BentoCard item={BENTO_ITEMS[0]} index={0} />
          </div>
          <div className="col-span-1">
            <BentoCard item={BENTO_ITEMS[1]} index={1} />
          </div>

          {/* ROW 2: Analytics (COL 1) + Team (COL 2) + AI Insights (COL 3) */}
          <div className="col-span-1">
            <BentoCard item={BENTO_ITEMS[2]} index={2} />
          </div>
          <div className="col-span-1">
            <BentoCard item={BENTO_ITEMS[3]} index={3} />
          </div>
          <div className="col-span-1">
            <BentoCard item={BENTO_ITEMS[4]} index={4} />
          </div>

          {/* ROW 3: Brand (COLS 1-2) + Beta Status (COL 3) */}
          <div className="col-span-2">
            <BentoCard item={BENTO_ITEMS[5]} index={5} />
          </div>
          <div className="col-span-1">
            <BentoCard item={BENTO_ITEMS[6]} index={6} />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 mt-20 text-center">
        <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/50 transform hover:scale-105 transition-all duration-300">
          Explore All Features
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
