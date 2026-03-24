import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Phase = 'animating' | 'fading' | 'done';

interface Props {
    onReveal: () => void;
}

export function LoadingScreen({ onReveal }: Props) {
    const [phase, setPhase] = useState<Phase>('animating');
    const [status, setStatus] = useState('Initializing…');

    useEffect(() => {
        // Update status messages at different times
        const t1 = setTimeout(() => setStatus('Finalizing…'), 1500);
        const t2 = setTimeout(() => setStatus('Welcome'), 3000);

        // Phase 5: Website Reveal (4s - 4.5s) begins
        const t3 = setTimeout(() => {
            onReveal();
            setPhase('fading');
        }, 4000);

        // Remove from DOM safely after completion
        const t4 = setTimeout(() => setPhase('done'), 5000);

        // Add burst particles dynamically at 3s for visual effect
        const t5 = setTimeout(() => {
            const container = document.querySelector('.cl-burst-particles');
            if (container) {
                for (let i = 0; i < 24; i++) {
                    const particle = document.createElement('div');
                    particle.className = `cl-burst-particle cl-burst-${i}`;
                    container.appendChild(particle);
                }
            }
        }, 3000);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
    }, [onReveal]);

    if (typeof document === 'undefined' || phase === 'done') return null;

    return createPortal(
        <div className={`cinematic-loader-root cinematic-loader-${phase}`} aria-hidden="true" id="premium-loader">
            {/* Animated background gradients */}
            <div className="cl-bg-glow cl-bg-glow-1" />
            <div className="cl-bg-glow cl-bg-glow-2" />
            
            {/* Center ambient glow */}
            <div className="cl-center-glow" />

            {/* Burst particle container */}
            <div className="cl-burst-particles" />

            {/* Main logo container */}
            <div className="cl-container">
                {/* Clean logo animation without constellation nodes */}
                <svg className="cl-constellation-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                </svg>

                {/* Actual Logo - centered and prominently displayed */}
                <img 
                    src="/oregent-logo.png" 
                    alt="Oregent Logo"
                    className="cl-logo-image-main"
                />
            </div>

            {/* Status text indicator */}
            <div className="cl-status">
                <span className={`cl-status-text ${status === 'Welcome' ? 'cl-welcome-fade' : ''}`}>{status}</span>
            </div>

            {/* Progress bar - synced with animation timeline */}
            <div className="cl-progress-bar-container">
                <div className="cl-progress-bar-fill" />
            </div>
        </div>,
        document.body
    );
}
