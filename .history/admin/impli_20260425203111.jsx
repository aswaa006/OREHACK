// ============================================================================
// IMPLEMENTATION GUIDE - How to Use Premium Components
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  PremiumEventCard,
  PremiumStageCard,
  PremiumToggle,
  AnimatedTimer,
  AnimatedStatusIndicator,
  PremiumButton,
  PremiumInput,
  AnimatedProgressBar,
  PageTransition,
  PremiumModal,
} from './PremiumComponents';

// ============================================================================
// EXAMPLE 1: DASHBOARD HOME PAGE (Replace your current dashboard)
// ============================================================================
export const AdminDashboardHome = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      name: 'Origin 2K26',
      status: 'COMPLETED',
      participants: 413,
      deadline: '10th April 10:00 am',
    },
    {
      id: 2,
      name: 'BuildCore v3',
      status: 'UPCOMING',
      participants: 0,
      deadline: '3rd May 11:15 am',
    },
    {
      id: 3,
      name: 'DevStrike \'24',
      status: 'COMPLETED',
      participants: 256,
      deadline: 'Ended',
    },
    {
      id: 4,
      name: 'CodeBlitz 1.0',
      status: 'UPCOMING',
      participants: 190,
      deadline: '9th May 4:40 pm',
    },
    {
      id: 5,
      name: 'SIMATS Open Challenge',
      status: 'LIVE',
      participants: 275,
      deadline: '17th May 8:20 pm',
    },
    {
      id: 6,
      name: 'HackFest 2026',
      status: 'UPCOMING',
      participants: 142,
      deadline: '26th May 2:55 pm',
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEnterPanel = (eventId) => {
    const event = events.find(e => e.id === eventId);
    setSelectedEvent(event);
    // Navigate to event control panel
    console.log('Entering control panel for:', event.name);
  };

  return (
    <PageTransition>
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Select a hackathon to manage its details and submissions.</p>
        </div>
        <button className="logout-button">Logout</button>
      </div>

      <section className="managed-events-section">
        <div className="section-header">
          <h2>Managed Events</h2>
          <p>Events displayed on the main landing page.</p>
        </div>

        <div className="events-grid">
          {events.map((event) => (
            <PremiumEventCard
              key={event.id}
              event={event}
              onEnterPanel={handleEnterPanel}
            />
          ))}
        </div>
      </section>

      <section className="add-event-section">
        <h3>ADD NEXT EVENT</h3>
        <form className="add-event-form">
          <PremiumInput
            label="Event Name"
            placeholder="e.g., CodeBlitz 2.0"
            icon="✍"
          />
          
          <div className="form-row">
            <select className="premium-select">
              <option>Upcoming</option>
              <option>Live</option>
              <option>Completed</option>
            </select>
            
            <PremiumInput
              label="Participants"
              placeholder="0"
              type="number"
              icon="👥"
            />
          </div>

          <PremiumInput
            label="Deadline"
            placeholder="e.g., 10th May"
            icon="📅"
          />

          <div className="form-actions">
            <PremiumButton variant="primary" icon="✨">
              + Add Event
            </PremiumButton>
          </div>
        </form>
      </section>
    </PageTransition>
  );
};

// ============================================================================
// EXAMPLE 2: STAGE SELECTION PAGE
// ============================================================================
export const StageSelectionPage = ({ eventId }) => {
  const stages = [
    {
      number: 1,
      name: 'Pre-Event Setup',
      description: 'Timer & Configuration',
      status: 'ACTIVE',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>`,
    },
    {
      number: 2,
      name: 'Live Monitoring',
      description: 'Flow Control & Release',
      status: 'ACTIVE',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>`,
    },
    {
      number: 3,
      name: 'Submission Control',
      description: 'Submission Desk Access',
      status: 'ACTIVE',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 11H7.82a2 2 0 0 0-1.82 1.18L3 15h18l-2.19-2.82A2 2 0 0 0 15.16 11H13"></path>
        <path d="M9 5h6v6H9z"></path>
      </svg>`,
    },
    {
      number: 4,
      name: 'Reports & Data',
      description: 'Engine Output & Team Records',
      status: 'ACTIVE',
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="5" r="1"></circle>
        <path d="M12 17V9"></path>
        <path d="M4.22 4.22a7 7 0 0 0 9.9 9.9"></path>
        <path d="M19.78 19.78a7 7 0 0 0-9.9-9.9"></path>
      </svg>`,
    },
  ];

  const [activeStage, setActiveStage] = useState(null);

  return (
    <PageTransition>
      <div className="stage-header">
        <div className="header-nav">
          <a href="/dashboard">← Back to Dashboard</a>
          <span className="breadcrumb-divider">/</span>
          <span>Select Stage</span>
        </div>
        <h1>Select a Stage</h1>
        <p>Choose the operational stage to manage for this hackathon.</p>
      </div>

      <div className="stages-grid">
        {stages.map((stage, index) => (
          <PremiumStageCard
            key={stage.number}
            stage={stage}
            onEnter={() => setActiveStage(stage.number)}
            index={index}
          />
        ))}
      </div>

      <div className="stages-footer">
        <p>Stages 1 – 4 are operational. Select a stage to manage.</p>
      </div>
    </PageTransition>
  );
};

// ============================================================================
// EXAMPLE 3: STAGE 1 - PRE-EVENT SETUP
// ============================================================================
export const PreEventSetup = () => {
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [eventStartTime, setEventStartTime] = useState('15-04-2026 07:56 PM');
  const [isLive, setIsLive] = useState(true);
  const [progress, setProgress] = useState(75);

  return (
    <PageTransition className="stage-page">
      <div className="stage-header">
        <a href="#" className="back-button">← Back to Stages</a>
        <h1>Pre-Event Setup</h1>
        <p>Configure the event start time and control the public countdown timer.</p>
      </div>

      {/* Live Status Indicator */}
      <AnimatedStatusIndicator
        status={isLive ? 'live' : 'pending'}
        message={isLive ? `Started at 15 Apr 2026, 07:56:00 pm` : 'Waiting to go live'}
        isTransitioning={false}
      />

      <div className="stage-content-grid">
        {/* Timer Display */}
        <div className="timer-section">
          <h3>LIVE COUNTDOWN</h3>
          <AnimatedTimer isLive={isLive} startTime="07:56:00" />
          <div className="timer-info">
            <span className="label">SCHEDULED START</span>
            <span className="value">15 Apr 2026, 07:56:00 pm</span>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <h3>SET EVENT START TIME</h3>
          
          <PremiumInput
            label="Start Date & Time"
            type="datetime-local"
            value={eventStartTime}
            placeholder="Select date and time"
            icon="📅"
          />

          <div className="button-group">
            <PremiumButton variant="primary" size="lg">
              Apply Start Time
            </PremiumButton>
            <PremiumButton size="sm">+1h</PremiumButton>
            <PremiumButton size="sm">+30m</PremiumButton>
          </div>

          {/* Timer Control Toggle */}
          <div className="timer-control">
            <h4>TIMER CONTROL</h4>
            <p>Timer is ON — public landing page shows the countdown and locks login until start time.</p>
            
            <PremiumToggle
              enabled={timerEnabled}
              onChange={setTimerEnabled}
              label="Disable Timer (Go Live Immediately)"
              icon="⏱"
            />
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="setup-progress">
        <AnimatedProgressBar
          percentage={progress}
          label="Setup Completion"
          showValue={true}
          animated={true}
        />
      </div>
    </PageTransition>
  );
};

// ============================================================================
// EXAMPLE 4: STAGE 2 - LIVE MONITORING
// ============================================================================
export const LiveMonitoring = () => {
  const [rulesEnabled, setRulesEnabled] = useState(false);
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const pageControls = [
    { name: 'Login', status: 'enabled' },
    { name: 'Rules', status: rulesEnabled ? 'active' : 'disabled' },
    { name: 'Waiting Room', status: waitingRoomEnabled ? 'active' : 'disabled' },
    { name: 'Stage 2 (Release)', status: 'pending' },
  ];

  return (
    <PageTransition className="stage-page">
      <div className="stage-header">
        <a href="#" className="back-button">← Back to Stages</a>
        <h1>Live Monitoring</h1>
        <p>Control the participant flow — toggle the Rules page, Waiting Room, and release the problem statements.</p>
      </div>

      {/* Page Control Flow */}
      <div className="page-control-flow">
        {pageControls.map((control, index) => (
          <React.Fragment key={control.name}>
            <div className={`flow-item ${control.status}`}>
              {control.name}
            </div>
            {index < pageControls.length - 1 && <div className="flow-arrow">→</div>}
          </React.Fragment>
        ))}
      </div>

      <div className="stage-controls-grid">
        {/* Rules & Regulations */}
        <div className="control-card">
          <h4>Rules & Regulations Page</h4>
          <p>Participants must read and agree to all rules before entering the waiting room. Disable to skip this step entirely.</p>
          
          <PremiumToggle
            enabled={rulesEnabled}
            onChange={setRulesEnabled}
            label="Rules Required"
          />
        </div>

        {/* Waiting Room */}
        <div className="control-card">
          <h4>Waiting Room Page</h4>
          <p>Participants land on the waiting room and stay there until the problem statements are released via the Start button below. Disable to skip directly to Stage 2.</p>
          
          <PremiumToggle
            enabled={waitingRoomEnabled}
            onChange={setWaitingRoomEnabled}
            label="Waiting Room Active"
          />
        </div>

        {/* Problem Statement Release */}
        <div className="release-card">
          <h4>⏸ Waiting for Start Signal</h4>
          <p>Click START to release the problem statements. All participants currently in the waiting room will be instantly redirected.</p>
          
          <PremiumButton
            variant="success"
            size="lg"
            onClick={() => setShowModal(true)}
            icon="▶"
          >
            Start — Release Problem Statements
          </PremiumButton>
        </div>
      </div>

      {/* Confirmation Modal */}
      <PremiumModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Release Problem Statements?"
        size="md"
      >
        <p>This will release all problem statements to {275} participants in the waiting room.</p>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <PremiumButton variant="primary" onClick={() => setShowModal(false)}>
            Confirm Release
          </PremiumButton>
          <PremiumButton onClick={() => setShowModal(false)}>
            Cancel
          </PremiumButton>
        </div>
      </PremiumModal>
    </PageTransition>
  );
};

// ============================================================================
// EXAMPLE 5: STAGE 3 - SUBMISSION CONTROL
// ============================================================================
export const SubmissionControl = () => {
  const [submissionOpen, setSubmissionOpen] = useState(true);

  return (
    <PageTransition className="stage-page">
      <div className="stage-header">
        <a href="#" className="back-button">← Back to Stages</a>
        <h1>Submission Control</h1>
        <p>Control whether participants can access the submission desk from the problem statements overview page.</p>
      </div>

      <div className="submission-status-card">
        {submissionOpen ? (
          <>
            <div className="status-icon">🟢</div>
            <h3>Submission Desk is OPEN</h3>
            <p>Participants on the Problem Statements Overview page can now see and click the "Go to Submission Desk" button. They will be directed to submit their GitHub repository link.</p>
            
            <div className="status-flow">
              <span className="flow-step">Overview Page</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step active">Submission Page</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step">Team Submit</span>
            </div>

            <PremiumButton
              variant="danger"
              size="lg"
              onClick={() => setSubmissionOpen(false)}
            >
              Lock Submission Desk
            </PremiumButton>
          </>
        ) : (
          <>
            <div className="status-icon">🔒</div>
            <h3>Submission Desk is LOCKED</h3>
            <p>The submission button is hidden on the Problem Statements Overview page. Participants can view problem statements but cannot navigate to the submission desk yet.</p>
            
            <PremiumButton
              variant="success"
              size="lg"
              onClick={() => setSubmissionOpen(true)}
            >
              Open Submission Desk
            </PremiumButton>
          </>
        )}
      </div>
    </PageTransition>
  );
};

// ============================================================================
// STYLING GUIDE
// ============================================================================
const exampleStyles = `
/* Grid layouts for responsive design */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--sp-lg);
  padding: var(--sp-lg);
}

.stages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--sp-lg);
  padding: var(--sp-lg);
}

/* Section styling */
.managed-events-section,
.add-event-section {
  margin: var(--sp-2xl) 0;
  padding: var(--sp-2xl);
  border-radius: var(--radius-lg);
  background: rgba(0, 217, 255, 0.02);
  border: 1px solid var(--border-color);
}

/* Header styling */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-2xl);
  padding: var(--sp-2xl);
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.05), rgba(57, 255, 20, 0.02));
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.stage-header {
  margin-bottom: var(--sp-2xl);
}

.stage-header h1 {
  margin: var(--sp-lg) 0 var(--sp-sm);
  animation: slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Form styling */
.add-event-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  max-width: 600px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md);
}

.premium-select {
  padding: var(--sp-md) var(--sp-lg);
  background: rgba(26, 31, 58, 0.5);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-body);
  cursor: pointer;
  transition: all var(--transition-base);
}

.premium-select:hover,
.premium-select:focus {
  border-color: var(--accent-cyan);
  box-shadow: var(--shadow-glow-cyan);
}

/* Control cards */
.control-card,
.release-card,
.submission-status-card {
  padding: var(--sp-lg);
  background: rgba(0, 217, 255, 0.03);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.control-card:hover,
.release-card:hover {
  border-color: var(--accent-cyan);
  box-shadow: var(--shadow-glow-cyan);
}

/* Page control flow */
.page-control-flow {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  margin-bottom: var(--sp-2xl);
  overflow-x: auto;
  padding: var(--sp-md);
  background: rgba(0, 217, 255, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.flow-item {
  padding: var(--sp-sm) var(--sp-md);
  background: rgba(26, 31, 58, 0.8);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-weight: 600;
  white-space: nowrap;
  transition: all var(--transition-base);
}

.flow-item.active {
  border-color: var(--accent-green);
  box-shadow: var(--shadow-glow-green);
}

.flow-arrow {
  color: var(--text-secondary);
  font-weight: bold;
}

/* Stage controls grid */
.stage-controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--sp-lg);
  margin: var(--sp-2xl) 0;
}

/* Status indicator card */
.submission-status-card {
  padding: var(--sp-2xl);
  text-align: center;
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.05), rgba(57, 255, 20, 0.05));
  border: 2px solid var(--border-color);
  animation: slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.status-icon {
  font-size: 48px;
  margin-bottom: var(--sp-lg);
  animation: bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.status-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-md);
  margin: var(--sp-xl) 0;
  flex-wrap: wrap;
}

.flow-step {
  padding: var(--sp-sm) var(--sp-md);
  background: rgba(0, 217, 255, 0.1);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 12px;
}

.flow-step.active {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-green));
  border-color: var(--accent-cyan);
  color: var(--bg-primary);
}
`;

export default { exampleStyles };