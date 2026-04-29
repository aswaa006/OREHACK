import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StageSelector = ({ 
  stages = [], 
  activeStage, 
  onSelectStage,
  onBackClick 
}) => {
  const [hoveredStage, setHoveredStage] = useState(null);

  const stageIcons = {
    'Pre-Event Setup': '⚙️',
    'Live Monitoring': '📊',
    'Submission Control': '📝',
    'Reports & Data': '📈'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {/* Header Section */}
      <div className="mb-12">
        <motion.button
          onClick={onBackClick}
          whileHover={{ x: -4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all mb-8"
        >
          ← Back to Dashboard
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Select a Stage</h1>
          <p className="text-lg text-slate-600">
            Choose the operational stage to manage for this hackathon.
          </p>
        </motion.div>
      </div>

      {/* Stages Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <AnimatePresence mode="wait">
          {stages.map((stage, index) => {
            const isActive = activeStage === stage.id;
            const isHovered = hoveredStage === stage.id;

            return (
              <motion.button
                key={stage.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  delay: index * 0.1,
                  type: 'spring',
                  damping: 20
                }}
                onMouseEnter={() => setHoveredStage(stage.id)}
                onMouseLeave={() => setHoveredStage(null)}
                onClick={() => onSelectStage(stage.id)}
                className={`
                  relative p-8 rounded-2xl text-left transition-all duration-300
                  overflow-hidden group cursor-pointer
                  ${isActive
                    ? 'bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-2xl border-2 border-indigo-400'
                    : 'bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-900'}
                `}
              >
                {/* Animated background gradient for active state */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 opacity-0"
                    animate={{ opacity: [0, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}

                {/* Background blob effect on hover */}
                <motion.div
                  className={`
                    absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0
                    ${isActive ? 'bg-white/10' : 'bg-indigo-100'}
                  `}
                  animate={{
                    scale: isHovered ? 1.2 : 1,
                    opacity: isHovered ? 0.15 : 0
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* Stage Number Indicator */}
                <motion.div
                  className={`
                    absolute top-4 right-4 w-16 h-16 rounded-2xl font-bold text-3xl
                    flex items-center justify-center font-black
                    transition-all duration-300
                    ${isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
                  `}
                  animate={isActive ? {
                    scale: [1, 1.15, 1],
                    rotate: [0, 5, 0, -5, 0]
                  } : {}}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                    times: [0, 0.25, 0.5, 0.75, 1]
                  }}
                >
                  {index + 1}
                </motion.div>

                {/* Content Container */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    className="text-4xl mb-4"
                    animate={isHovered ? {
                      scale: 1.2,
                      rotate: 10
                    } : {
                      scale: 1,
                      rotate: 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {stageIcons[stage.title] || '→'}
                  </motion.div>

                  {/* Title */}
                  <h3 className="font-bold text-2xl mb-2 leading-tight">
                    {stage.title}
                  </h3>

                  {/* Subtitle */}
                  <p className={`text-sm mb-4 ${
                    isActive ? 'text-indigo-100' : 'text-slate-600'
                  }`}>
                    {stage.subtitle}
                  </p>

                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-6 ${
                    isActive ? 'text-indigo-100/90' : 'text-slate-600'
                  }`}>
                    {stage.description}
                  </p>

                  {/* Status and Meta Info */}
                  <div className="flex items-center justify-between pt-4 border-t" 
                       style={{
                         borderTopColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgb(226,232,240)'
                       }}>
                    
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">
                      <motion.div
                        className={`w-3 h-3 rounded-full ${
                          stage.status === 'ACTIVE' ? 'bg-emerald-400' :
                          stage.status === 'COMPLETED' ? 'bg-emerald-500' :
                          isActive ? 'bg-white/60' : 'bg-slate-400'
                        }`}
                        animate={stage.status === 'ACTIVE' ? {
                          scale: [1, 1.3, 1],
                          opacity: [1, 0.7, 1]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${
                        isActive ? 'text-indigo-100' : 'text-slate-600'
                      }`}>
                        {stage.status}
                      </span>
                    </div>

                    {/* Arrow indicator */}
                    <motion.div
                      animate={isActive ? { x: [0, 6, 0] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`text-lg ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    >
                      →
                    </motion.div>
                  </div>
                </div>

                {/* Shine effect on hover */}
                {isHovered && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl"
      >
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">💡 Tip:</span> All 4 stages are operational. Select a stage to manage its specific settings and controls.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default StageSelector;