// ============================================================================
// PREMIUM ADMIN DASHBOARD COMPONENTS
// Ultra-Pro-Max Level UI/UX for Hackathon Platform
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import './AdminDashboard.css';

// ============================================================================
// 1. ENHANCED EVENT CARD COMPONENT
// ============================================================================
export const PremiumEventCard = ({ 
  event, 
  onEnterPanel, 
  statusGlow 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [particlePos, setParticlePos] = useState([]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setParticlePos({ x, y });
  };

  const statusConfig = {
    COMPLETED: { 
      color: '#39ff14', 
      label: 'Completed', 
      icon: '✓' 
    },
    UPCOMING: { 
      color: '#00d9ff', 
      label: 'Upcoming', 
      icon: '⏱' 
    },
    LIVE: { 
      color: '#ff006e', 
      label: 'Live', 
      icon: '●' 
    },
  };

  const status = statusConfig[event.status] || statusConfig.UPCOMING;

  return (
    <div
      className={`premium-event-card ${event.status.toLowerCase()} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        '--accent-color': status.color,
        '--particle-x': `${particlePos.x}%`,
        '--particle-y': `${particlePos.y}%`,
      }}
    >
      {/* Glassmorphic background */}
      <div className="card-glass-bg" />
      
      {/* Animated gradient overlay */}
      <div className="card-gradient-overlay" />
      
      {/* Glow effect */}
      <div className="card-glow" />
      
      {/* Content */}
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{event.name}</h3>
          <div className="status-badge" style={{ '--badge-color': status.color }}>
            <span className="badge-pulse" />
            <span className="badge-icon">{status.icon}</span>
            <span className="badge-text">{status.label}</span>
          </div>
        </div>

        <div className="card-stats">
          <div className="stat-item">
            <span className="stat-label">Participants</span>
            <span className="stat-value">{event.participants}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">Deadline</span>
            <span className="stat-value deadline">{event.deadline}</span>
          </div>
        </div>

        <button 
          className="premium-button button-primary"
          onClick={() => onEnterPanel(event.id)}
        >
          <span className="button-text">Enter Control Panel</span>
          <span className="button-arrow">→</span>
          <div className="button-ripple" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 2. STAGE SELECTION CARD (Advanced)
// ============================================================================
export const PremiumStageCard = ({ 
  stage, 
  onEnter, 
  index 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [borderPosition, setBorderPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setBorderPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const stageColors = {
    1: { 
      primary: '#00d9ff', 
      secondary: '#0099cc',
      glow: 'rgba(0, 217, 255, 0.3)'
    },
    2: { 
      primary: '#39ff14', 
      secondary: '#22aa00',
      glow: 'rgba(57, 255, 20, 0.3)'
    },
    3: { 
      primary: '#ff006e', 
      secondary: '#cc0055',
      glow: 'rgba(255, 0, 110, 0.3)'
    },
    4: { 
      primary: '#ffa500', 
      secondary: '#cc8400',
      glow: 'rgba(255, 165, 0, 0.3)'
    },
  };

  const color = stageColors[stage.number];

  return (
    <div
      className={`premium-stage-card ${stage.status.toLowerCase()} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        '--stage-color': color.primary,
        '--stage-secondary': color.secondary,
        '--stage-glow': color.glow,
        '--border-x': `${borderPosition.x}px`,
        '--border-y': `${borderPosition.y}px`,
        '--delay': `${index * 100}ms`,
      }}
    >
      {/* Stage number background */}
      <div className="stage-number-bg">{stage.number}</div>

      {/* Glass background */}
      <div className="stage-glass-bg" />

      {/* Animated border effect */}
      <div className="stage-border-animate" />

      {/* Content */}
      <div className="stage-content">
        <div className="stage-icon" dangerouslySetInnerHTML={{ __html: stage.icon }} />
        
        <div className="stage-text">
          <div className="stage-label">STAGE {stage.number}</div>
          <h3 className="stage-title">{stage.name}</h3>
          <p className="stage-description">{stage.description}</p>
        </div>

        <button 
          className="premium-button button-stage"
          onClick={() => onEnter(stage.number)}
        >
          <span>Enter Stage</span>
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 3. PREMIUM TOGGLE SWITCH
// ============================================================================
export const PremiumToggle = ({ 
  enabled, 
  onChange, 
  label,
  icon 
}) => {
  return (
    <div className="premium-toggle-wrapper">
      {label && <span className="toggle-label">{label}</span>}
      <button
        className={`premium-toggle ${enabled ? 'enabled' : 'disabled'}`}
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
      >
        <div className="toggle-track">
          <div className="toggle-thumb">
            <span className="toggle-icon">
              {enabled ? '✓' : '✕'}
            </span>
          </div>
          <div className="toggle-glow" />
        </div>
      </button>
    </div>
  );
};

// ============================================================================
// 4. ANIMATED TIMER DISPLAY
// ============================================================================
export const AnimatedTimer = ({ isLive, startTime }) => {
  const [displayTime, setDisplayTime] = useState(startTime);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setDisplayTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className={`animated-timer ${isLive ? 'live' : ''}`}>
      <div className="timer-outer-ring">
        <div className="timer-pulse-ring" />
        <div className="timer-display">
          <div className="timer-label">
            {isLive ? 'EVENT IS LIVE' : 'COUNTDOWN'}
          </div>
          <div className="timer-value">{displayTime}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. ANIMATED STATUS INDICATOR
// ============================================================================
export const AnimatedStatusIndicator = ({ 
  status, 
  message,
  isTransitioning 
}) => {
  const statusConfig = {
    'live': { color: '#39ff14', label: 'Live', icon: '●' },
    'upcoming': { color: '#00d9ff', label: 'Upcoming', icon: '⏱' },
    'completed': { color: '#a0aec0', label: 'Completed', icon: '✓' },
    'pending': { color: '#ffa500', label: 'Pending', icon: '○' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className={`status-indicator ${status} ${isTransitioning ? 'transitioning' : ''}`}>
      <div className="indicator-dot" style={{ '--indicator-color': config.color }}>
        <div className="indicator-pulse" />
        <span className="indicator-icon">{config.icon}</span>
      </div>
      <div className="indicator-text">
        <span className="indicator-label">{config.label}</span>
        {message && <span className="indicator-message">{message}</span>}
      </div>
    </div>
  );
};

// ============================================================================
// 6. PREMIUM BUTTON COMPONENT
// ============================================================================
export const PremiumButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (isLoading || disabled) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height);
    const radius = size / 2;

    const newRipple = {
      x: x - radius,
      y: y - radius,
      size,
      id: Date.now(),
    };

    setRipples([...ripples, newRipple]);
    setTimeout(() => {
      setRipples(r => r.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      className={`premium-button button-${variant} button-${size} ${isLoading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading && <div className="button-spinner" />}
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-text">{children}</span>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="button-ripple-effect"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
          }}
        />
      ))}
    </button>
  );
};

// ============================================================================
// 7. PAGE TRANSITION WRAPPER
// ============================================================================
export const PageTransition = ({ children, className = '' }) => {
  return (
    <div className={`page-transition-wrapper ${className}`}>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// 8. ANIMATED PROGRESS BAR
// ============================================================================
export const AnimatedProgressBar = ({ 
  percentage, 
  label,
  showValue = true,
  animated = true 
}) => {
  return (
    <div className="animated-progress-wrapper">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-bar-container">
        <div 
          className={`progress-bar-fill ${animated ? 'animated' : ''}`}
          style={{ 
            '--progress': `${percentage}%`,
            width: `${percentage}%`
          }}
        >
          <div className="progress-shimmer" />
        </div>
      </div>
      {showValue && <span className="progress-value">{percentage}%</span>}
    </div>
  );
};

// ============================================================================
// 9. FORM INPUT WITH VALIDATION
// ============================================================================
export const PremiumInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  type = 'text',
  icon,
  error = null,
  maxLength = null 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`premium-input-wrapper ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          className="premium-input"
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          maxLength={maxLength}
        />
        {maxLength && (
          <span className="input-counter">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

// ============================================================================
// 10. MODAL WITH ANIMATIONS
// ============================================================================
export const PremiumModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`premium-modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div 
        className={`premium-modal modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};