import React from 'react';
import { motion } from 'framer-motion';

const DashboardHeader = ({ 
  title = 'Admin Dashboard',
  subtitle = 'Select a hackathon to manage its details and submissions.',
  stats = [],
  onLogout
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="relative overflow-hidden rounded-3xl mb-12 p-8 md:p-12"
      style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 25%, #0f172a 50%, #111827 75%, #1f2937 100%)'
      }}
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full opacity-5 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header Text */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.p
            className="text-indigo-300 text-sm font-bold uppercase tracking-widest mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            OREGENT ADMIN
          </motion.p>

          <motion.h1
            className="text-5xl md:text-6xl font-black text-white mb-3 leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="text-indigo-200 text-lg max-w-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <motion.div
                  className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:border-indigo-300/50 transition-colors"
                  whileHover={{
                    boxShadow: '0 0 30px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  {/* Animated background for hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 rounded-xl opacity-0 group-hover:opacity-10"
                    animate={{
                      backgroundImage: [
                        'linear-gradient(to bottom right, rgba(79, 70, 229, 0), rgba(126, 34, 206, 0))',
                        'linear-gradient(to bottom right, rgba(79, 70, 229, 0.1), rgba(126, 34, 206, 0.05))',
                        'linear-gradient(to bottom right, rgba(79, 70, 229, 0), rgba(126, 34, 206, 0))'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <motion.p
                      className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                    >
                      {stat.label}
                    </motion.p>

                    <motion.div
                      className="flex items-baseline gap-2"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + idx * 0.1, type: 'spring' }}
                    >
                      <motion.p
                        className="text-3xl md:text-4xl font-black text-white"
                        animate={{
                          color: ['#ffffff', '#a5f3fc', '#ffffff']
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: idx * 0.3
                        }}
                      >
                        {stat.value}
                      </motion.p>

                      {stat.change && (
                        <motion.span
                          className={`text-xs font-bold ${
                            stat.change > 0 ? 'text-emerald-300' : 'text-red-300'
                          }`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + idx * 0.1 }}
                        >
                          {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                        </motion.span>
                      )}
                    </motion.div>

                    {stat.description && (
                      <motion.p
                        className="text-slate-400 text-xs mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 + idx * 0.1 }}
                      >
                        {stat.description}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Top Right Logout Button */}
      <motion.button
        onClick={onLogout}
        className="absolute top-8 right-8 px-4 py-2 text-sm font-semibold text-indigo-300 border border-indigo-400/50 rounded-lg hover:bg-indigo-500/10 hover:border-indigo-400 transition-all"
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 20px rgba(79, 70, 229, 0.3)'
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Logout
      </motion.button>

      {/* Floating accent elements */}
      <motion.div
        className="absolute top-20 left-12 w-2 h-2 bg-indigo-400 rounded-full opacity-60"
        animate={{
          y: [0, 20, 0],
          x: [0, 10, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-24 right-20 w-2 h-2 bg-purple-400 rounded-full opacity-60"
        animate={{
          y: [0, -20, 0],
          x: [0, -10, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>
  );
};

export default DashboardHeader;