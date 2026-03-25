import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

type Phase = 'animating' | 'fading' | 'done';

interface Props {
    onReveal: () => void;
}

/* ── Status messages that cycle during load ── */
const STATUS_MESSAGES = [
    'INITIALIZING',
    'LOADING MODULES',
    'CALIBRATING SYSTEMS',
    'GETTING READY',
    'WELCOME TO OREHACK',
];

/* ── Words that orbit the logo ── */
const ORBITAL_WORDS = [
    'INNOVATE', 'CREATE', 'BUILD', 'HACK',
    'DESIGN', 'CODE', 'LAUNCH', 'DEPLOY',
];

export function LoadingScreen({ onReveal }: Props) {
    const [phase, setPhase] = useState<Phase>('animating');
    const [statusIdx, setStatusIdx] = useState(0);
    const [glitchActive, setGlitchActive] = useState(false);

    /* Generate random scanline positions once */
    const scanlines = useMemo(() =>
        Array.from({ length: 6 }, (_, i) => ({
            id: i,
            delay: Math.random() * 2,
            duration: 1.5 + Math.random() * 1.5,
        })), []);

    useEffect(() => {
        /* Cycle through status messages */
        const msgInterval = setInterval(() => {
            setStatusIdx(prev => {
                if (prev < STATUS_MESSAGES.length - 1) return prev + 1;
                clearInterval(msgInterval);
                return prev;
            });
        }, 800);

        /* Glitch effect every 600ms */
        const glitchInterval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 150);
        }, 600);

        /* Website Reveal at 4s */
        const tReveal = setTimeout(() => {
            onReveal();
            setPhase('fading');
        }, 4000);

        /* Remove from DOM after fade-out */
        const tDone = setTimeout(() => setPhase('done'), 5000);

        /* Burst particles at 3s */
        const tBurst = setTimeout(() => {
            const container = document.querySelector('.cl-burst-particles');
            if (container) {
                for (let i = 0; i < 24; i++) {
                    const p = document.createElement('div');
                    p.className = `cl-burst-particle cl-burst-${i}`;
                    container.appendChild(p);
                }
            }
        }, 3000);

        return () => {
            clearInterval(msgInterval);
            clearInterval(glitchInterval);
            clearTimeout(tReveal);
            clearTimeout(tDone);
            clearTimeout(tBurst);
        };
    }, [onReveal]);

    if (typeof document === 'undefined' || phase === 'done') return null;

    const currentStatus = STATUS_MESSAGES[statusIdx];

    return createPortal(
        <div className={`cinematic-loader-root cinematic-loader-${phase}`} aria-hidden="true" id="premium-loader">
            {/* Background gradients */}
            <div className="cl-bg-glow cl-bg-glow-1" />
            <div className="cl-bg-glow cl-bg-glow-2" />

            {/* Scan line sweep */}
            <div className="cl-scanline-container">
                {scanlines.map(s => (
                    <div
                        key={s.id}
                        className="cl-scanline"
                        style={{
                            animationDelay: `${s.delay}s`,
                            animationDuration: `${s.duration}s`,
                        }}
                    />
                ))}
            </div>

            {/* Center ambient glow */}
            <div className="cl-center-glow" />

            {/* Burst particles */}
            <div className="cl-burst-particles" />

            {/* ── Pulsing energy rings ── */}
            <div className="cl-energy-rings">
                <div className="cl-energy-ring cl-energy-ring-1" />
                <div className="cl-energy-ring cl-energy-ring-2" />
                <div className="cl-energy-ring cl-energy-ring-3" />
            </div>

            {/* ── Orbiting words ring ── */}
            <div className="cl-word-orbit">
                <svg viewBox="0 0 400 400" className="cl-word-orbit-svg">
                    <defs>
                        <path
                            id="wordCircle"
                            d="M 200,200 m -160,0 a 160,160 0 1,1 320,0 a 160,160 0 1,1 -320,0"
                            fill="none"
                        />
                    </defs>
                    <g className="cl-word-orbit-spin">
                        {ORBITAL_WORDS.map((word, i) => {
                            const offset = `${(i / ORBITAL_WORDS.length) * 100}%`;
                            return (
                                <text key={word} className="cl-orbit-word" dy="-8">
                                    <textPath
                                        href="#wordCircle"
                                        startOffset={offset}
                                        textAnchor="middle"
                                    >
                                        {word}
                                    </textPath>
                                </text>
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* Main logo */}
            <div className="cl-container">
                <svg className="cl-constellation-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" />
                <img src="/oregent-logo.png" alt="Oregent Logo" className="cl-logo-image-main" />
            </div>

            {/* ── Status text with glitch effect ── */}
            <div className={`cl-status-block ${glitchActive ? 'cl-glitch' : ''}`}>
                <div className="cl-status-label">
                    <span className="cl-status-bracket">[</span>
                    <span className="cl-status-dot" />
                    <span className="cl-status-text" key={statusIdx}>
                        {currentStatus}
                    </span>
                    <span className="cl-status-cursor">_</span>
                    <span className="cl-status-bracket">]</span>
                </div>
                <div className="cl-substatus">
                    {statusIdx < STATUS_MESSAGES.length - 1
                        ? `STEP ${statusIdx + 1} OF ${STATUS_MESSAGES.length}`
                        : 'READY'}
                </div>
            </div>

            {/* Progress bar */}
            <div className="cl-progress-bar-container">
                <div className="cl-progress-bar-fill" />
            </div>
        </div>,
        document.body
    );
}
