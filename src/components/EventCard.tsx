import React from 'react';
import { motion } from 'framer-motion';

const EventCard = ({ 
  event, 
  status = 'UPCOMING', 
  onClick,
  onManageClick,
  isHovered = false 
}) => {
  const getStatusColor = () => {
    switch(status) {
      case 'COMPLETED':
        return {
          badge: 'bg-emerald-100 text-emerald-700',
          dot: 'bg-emerald-600',
          gradient: 'from-emerald-50 to-teal-50',
          border: 'border-emerald-200'
        };
      case 'LIVE':
        return {
          badge: 'bg-red-100 text-red-700',
          dot: 'bg-red-600 animate-pulse',
          gradient: 'from-red-50 to-orange-50',
          border: 'border-red-200'
        };
      default: // UPCOMING
        return {
          badge: 'bg-blue-100 text-blue-700',
          dot: 'bg-blue-600',
          gradient: 'from-blue-50 to-indigo-50',
          border: 'border-blue-200'
        };
    }
  };

  const colors = getStatusColor();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', damping: 20 }}
      onClick={onClick}
      className="group relative overflow-hidden"
    >
      <div 
        className={`
          relative h-full rounded-2xl border-2 transition-all duration-300
          backdrop-blur-sm cursor-pointer
          bg-gradient-to-br ${colors.gradient} ${colors.border}
          hover:shadow-lg hover:border-indigo-300
        `}
      >
        {/* Animated accent bar on top */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
          animate={status === 'LIVE' ? { 
            x: ['-100%', '100%'],
            opacity: [0, 1, 0]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Floating accent blob */}
        <motion.div
          className="absolute -top-8 -right-8 w-32 h-32 bg-white opacity-0 rounded-full blur-3xl group-hover:opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Main Content */}
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Header Section */}
          <div className="mb-6">
            {/* Status Badge with Animation */}
            <motion.div 
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4
                ${colors.badge}
              `}
              animate={status === 'LIVE' ? { 
                scale: [1, 1.08, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
              {status}
            </motion.div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">{event.name}</h3>
            <p className="text-xs text-slate-600">Hackathon Event</p>
          </div>

          {/* Stats Section */}
          <div className="space-y-4 mb-6 flex-grow">
            {/* Participants */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-slate-600 font-medium mb-1">Participants</p>
                <motion.p 
                  className="text-2xl font-bold text-slate-900"
                  key={event.participants}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                >
                  {event.participants}
                </motion.p>
              </div>
              {/* Quick stat badge */}
              <div className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                {Math.round((event.participants / 500) * 100)}%
              </div>
            </div>

            {/* Deadline */}
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-600 font-medium mb-1">Deadline</p>
              <motion.p 
                className="text-sm font-semibold text-slate-700"
                whileHover={{ x: 4 }}
              >
                {event.deadline}
              </motion.p>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onManageClick?.();
            }}
            whileHover={{ scale: 1.02, backgroundColor: 'rgb(67, 56, 202)' }}
            whileTap={{ scale: 0.96 }}
            className={`
              w-full py-3 px-4 rounded-xl font-semibold text-white
              transition-all duration-200 flex items-center justify-center gap-2
              ${status === 'COMPLETED' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg' 
                : status === 'LIVE'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-lg'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:shadow-lg'}
            `}
          >
            <span>Manage Event</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>

          {/* Corner decorative element */}
          <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;