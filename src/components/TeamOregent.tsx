import { useEffect, useRef, useState } from "react";

const MEMBERS = [
  {
    name: "Ishwarya P",
    role: "Frontend Engineer",
    avatar: "/photos/ishwarya p.jpeg",
    initials: "I",
    gradient: "from-indigo-500 to-blue-600",
    linkedin: "https://www.linkedin.com/in/ishwariya-p-36a80a389?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    github: "https://github.com/ishu0210",
  },
  {
    name: "Suvedhan G",
    role: "Frontend Engineer",
    avatar: "/photos/suvedhan .jpeg",
    initials: "S",
    gradient: "from-fuchsia-500 to-pink-600",
    linkedin: "https://www.linkedin.com/in/suvedhan-g-284290389?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    github: "https://github.com/suvedhang",
  },
  {
    name: "Sri Sayee K",
    role: "Backend & AI Engineer",
    avatar: "/photos/srisayyyeeee.jpeg",
    initials: "S",
    gradient: "from-emerald-500 to-teal-600",
    linkedin: "https://www.linkedin.com/in/sri-sayee-kathiravan-85aba632a/",
    github: "https://github.com/ksrisayee12",
  },
  {
    name: "Sasvanthu G",
    role: "DevOps & Data Engineer",
    avatar: "/photos/sasvanthu.jpeg",
    initials: "S",
    gradient: "from-orange-500 to-rose-600",
    linkedin: "https://www.linkedin.com/in/sasvanthu-g/",
    github: "https://github.com/sasvanthu",
  },
  {
    name: "Aswath S",
    role: "Product Analyst",
    avatar: "/photos/aswath photo.jpeg",
    initials: "A",
    gradient: "from-violet-500 to-purple-700",
    linkedin: "https://www.linkedin.com/in/aswath-s-a37475336/",
    github: "https://github.com/aswaa006/",
  },
  {
    name: "Harsh Limkar N",
    role: "Frontend Architect",
    avatar: "/photos/Harsh photo.jpeg",
    initials: "HL",
    gradient: "from-blue-500 to-cyan-600",
    linkedin: "https://www.linkedin.com/in/harsh-limkar/",
    github: "https://github.com/harshlimkar",
  },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

.team-section {
  position: relative;
  background: #000;
  padding: 100px 24px 120px;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.team-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

/* Ambient glows */
.team-section::after {
  content: '';
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 500px;
  background: radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%);
  pointer-events: none;
}

.team-wrap {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.team-header {
  text-align: center;
  margin-bottom: 72px;
}

.team-eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(167, 139, 250, 0.8);
  margin: 0 0 14px;
}

.team-title {
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.08;
}

.team-title span {
  background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.team-subtitle {
  margin-top: 16px;
  color: rgba(255,255,255,0.38);
  font-size: 1rem;
  font-weight: 400;
}

/* Grid */
.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .team-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .team-grid { grid-template-columns: 1fr; }
}

/* Premium Glassmorphism Card Style */
.team-card {
  position: relative;
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 350px;
  cursor: default;
  transition: all 0.4s cubic-bezier(.22,.68,0,1);
  backdrop-filter: blur(16px);
  will-change: transform;
  opacity: 0;
  transform: translateY(28px);
}

.team-card.team-card--visible {
  opacity: 1;
  transform: translateY(0);
}

.team-card:hover {
  transform: translateY(-8px);
  background: rgba(255,255,255,0.05);
  border-color: rgba(167,139,250,0.3);
  box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(167,139,250,0.1);
}

/* Photo - Large Circle */
.team-avatar-ring {
  position: relative;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, rgba(167,139,250,0.8), rgba(96,165,250,0.8), rgba(244,114,182,0.8));
  margin-bottom: 0px;
  flex-shrink: 0;
  box-shadow: 0 12px 48px rgba(0,0,0,0.4);
}

.team-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #0a0a0b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-photo-initials {
  font-size: 3.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Footer Strip: GitHub | Info | LinkedIn */
.team-footer-strip {
  margin-top: auto;
  width: 100%;
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
}

.team-footer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.team-footer-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
}

.team-footer-role {
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

/* Social Buttons */
.team-social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.4);
  transition: all 0.25s ease;
}

.team-social-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
  transform: scale(1.08);
}

.btn-github:hover { border-color: rgba(255,255,255,0.25); }
.btn-linkedin:hover { border-color: rgba(10,102,194,0.5); color: #60a5fa; }
`;

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.73.084-.73 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );
}

function TeamCard({ member, delay }: { member: typeof MEMBERS[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`team-card${visible ? " team-card--visible" : ""}`}
    >
      {/* Top Section: Large Circular Avatar */}
      <div className="team-avatar-ring">
        <div className="team-avatar-inner">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={`${member.name} profile`}
              className="team-avatar-img"
            />
          ) : (
            <span className="team-photo-initials">{member.initials}</span>
          )}
        </div>
      </div>

      {/* Footer Strip: GitHub | Info | LinkedIn */}
      <div className="team-footer-strip">
        <a
          href={member.github}
          className="team-social-btn btn-github"
          aria-label={`${member.name}'s GitHub profile`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon />
        </a>

        <div className="team-footer-info">
          <p className="team-footer-name">{member.name}</p>
          <p className="team-footer-role">{member.role}</p>
        </div>

        <a
          href={member.linkedin}
          className="team-social-btn btn-linkedin"
          aria-label={`${member.name}'s LinkedIn profile`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedInIcon />
        </a>
      </div>
    </div>
  );
}

export default function TeamOregent() {
  return (
    <section className="team-section" id="team" aria-labelledby="team-heading">
      <style>{CSS}</style>
      <div className="team-wrap">
        {/* Header */}
        <header className="team-header">
          <p className="team-eyebrow">The People Behind It</p>
          <h2 className="team-title" id="team-heading">
            Team <span>OREGENT</span>
          </h2>
          
        </header>

        {/* Grid */}
        <div className="team-grid" role="list">
          {MEMBERS.map((member, i) => (
            <div role="listitem" key={member.name}>
              <TeamCard member={member} delay={i * 80} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
