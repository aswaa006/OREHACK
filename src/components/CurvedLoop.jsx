import './CurvedLoop.css';

const MARQUEE_TEXT =
  'Power fair and efficient hackathon evaluations ✦ Build a culture of innovation across institutions ✦ Enable colleges to run high-impact hackathons ✦ Drive students from learning to real execution ✦ ';

// Repeat enough times to fill any screen with no gaps
const REPEAT = 4;

const CurvedLoop = ({
  marqueeText = MARQUEE_TEXT,
  speed = 2,
  className = '',
  direction = 'left',
}) => {
  // animation duration — lower speed = faster (matches original API roughly)
  const duration = Math.max(10, 80 / speed);
  const animName = direction === 'right' ? 'marquee-right' : 'marquee-left';

  // Helper to render text with colored stars
  const renderTextWithPurpleStars = (text) => {
    const parts = text.split('✦');
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && (
          <span style={{ color: '#7c3aed', margin: '0 0.8em' }}>✦</span>
        )}
      </span>
    ));
  };

  return (
    <div className="curved-loop-jacket">
      <div
        className="curved-loop-track"
        style={{
          animationName: animName,
          animationDuration: `${duration}s`,
        }}
      >
        {Array(REPEAT).fill(marqueeText).map((t, i) => (
          <span key={i} className={`curved-loop-item ${className}`}>
            {renderTextWithPurpleStars(t)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CurvedLoop;
