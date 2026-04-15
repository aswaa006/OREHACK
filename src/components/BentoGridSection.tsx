import React from 'react';
import { motion } from 'framer-motion';

const BentoGridSection = () => {
  const cards = [
    {
      id: 1,
      title: 'Startup Development',
      description: 'We build scalable, high-performing products — clean code, clear vision.',
      icon: '💻',
      span: 'col-span-1 row-span-1',
      order: 1,
    },
    {
      id: 2,
      title: 'Product Strategy',
      description: 'Turning ambitious ideas into intuitive products. Obsess over UX, data, and impact.',
      icon: '🎯',
      span: 'col-span-1 row-span-1',
      order: 2,
    },
    {
      id: 3,
      title: 'Analytics & Growth',
      description: 'Dashboards built for conversions and engagement. Real data, real decisions.',
      icon: '📈',
      span: 'col-span-1 row-span-1',
      order: 3,
    },
    {
      id: 4,
      title: 'Our Team',
      description: 'Former engineers and designers from Google, Stripe, and Notion — united by great software.',
      icon: '👥',
      span: 'col-span-1 row-span-2',
      order: 4,
      isWide: false,
    },
    {
      id: 5,
      title: 'Everything in One Place',
      description: 'Build faster, ship smarter, scale effortlessly.',
      icon: '🚀',
      span: 'col-span-2 row-span-2',
      order: 5,
      isHero: true,
    },
    {
      id: 6,
      title: 'AI-Powered Insights',
      description: 'Intelligent analysis that surfaces what matters before you even ask.',
      icon: '⚡',
      span: 'col-span-1 row-span-1',
      order: 6,
    },
    {
      id: 7,
      title: 'Brand & Design',
      description: 'Craft a unique, cohesive identity with all-in-one creative platform.',
      icon: '🎨',
      span: 'col-span-1 row-span-1',
      order: 7,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const Card = ({ card, index }: { card: typeof cards[0]; index: number }) => (
    <motion.div
      variants={cardVariants}
      className={`${card.span} group relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:z-20 cursor-pointer`}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.95) 100%)',
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 1.01 }}
    >
      {/* Glow effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      {/* Radial glow inside card */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

      {/* Border glow on hover */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-purple-500/50 transition-all duration-500 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {card.isHero ? (
          // Hero card centered content
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-5xl mb-4"
              >
                {card.icon}
              </motion.div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent mb-4">
                {card.title}
              </h2>
              <p className="text-lg text-white/60 max-w-xs mx-auto">{card.description}</p>
            </div>
          </div>
        ) : (
          // Regular card content
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{card.icon}</div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
            <p className="text-sm text-white/60 flex-grow">{card.description}</p>
            <motion.a
              href="#"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-4 inline-flex items-center gap-2 transition-colors"
              whileHover={{ x: 4 }}
            >
              Learn More →
            </motion.a>
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />

      {/* Animated background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Grid section */}
      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            A complete platform for modern teams to build, ship, and scale faster than ever.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -200px 0px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
        >
          {cards.map((card, idx) => (
            <Card key={card.id} card={card} index={idx} />
          ))}
        </motion.div>

        {/* Ticker - scrolling text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-white/10"
        >
          <div className="relative overflow-hidden py-6">
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="flex gap-8 whitespace-nowrap"
            >
              {[
                '✨ Built for Scale',
                '🚀 Ship Faster',
                '📊 Real-time Analytics',
                '🎯 AI-Powered',
                '💡 Premium UX',
                '✨ Built for Scale',
                '🚀 Ship Faster',
                '📊 Real-time Analytics',
                '🎯 AI-Powered',
                '💡 Premium UX',
              ].map((text, i) => (
                <div key={i} className="text-white/60 font-medium text-sm">
                  {text}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BentoGridSection;
