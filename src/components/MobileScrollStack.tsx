import React, { useRef, useEffect } from 'react';

interface MobileScrollStackProps {
  children: React.ReactNode;
  pinTop?: number;
  stackGap?: number;
  stepDistance?: number;
}

export const MobileScrollStackItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <div
      className={`mobile-stack-card will-change-transform ${className}`.trim()}
      style={{
        transformOrigin: 'top center',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export const MobileScrollStack: React.FC<MobileScrollStackProps> = ({
  children,
  pinTop = 75,
  stackGap = 14,
  stepDistance = 300
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>('.mobile-stack-card'));
    if (!cards.length) return;

    let cachedOffsets: number[] = [];

    const measureOffsets = () => {
      // Clear inline transforms to measure true document flow positions
      cards.forEach((c) => {
        c.style.transform = '';
        c.style.marginBottom = '';
      });

      cards.forEach((c, i) => {
        c.style.zIndex = `${10 + i}`;
        if (i < cards.length - 1) {
          const cardH = c.getBoundingClientRect().height || 420;
          // Calibrate margin so the scroll distance per card is stepDistance (faster thumb swipe)
          const targetMargin = Math.min(16, stepDistance - cardH);
          c.style.marginBottom = `${targetMargin}px`;
        } else {
          c.style.marginBottom = '20px';
        }
      });

      const getDocTop = (el: HTMLElement) => {
        let t = 0;
        let curr: HTMLElement | null = el;
        while (curr) {
          t += curr.offsetTop;
          curr = curr.offsetParent as HTMLElement | null;
        }
        return t;
      };

      cachedOffsets = cards.map(c => getDocTop(c));
    };

    measureOffsets();

    const t1 = setTimeout(measureOffsets, 150);
    const t2 = setTimeout(measureOffsets, 600);

    let ticking = false;

    const updateTransforms = () => {
      const scrollY = window.scrollY;
      const lastIdx = cards.length - 1;
      const lastCardTop = cachedOffsets[lastIdx] || 0;
      const pinEnd = lastCardTop - (pinTop + lastIdx * stackGap);

      cards.forEach((card, i) => {
        const cardTop = cachedOffsets[i] || 0;
        const targetPinTop = pinTop + i * stackGap;
        const pinStart = cardTop - targetPinTop;

        let translateY = 0;
        if (i < lastIdx) {
          if (scrollY >= pinStart && scrollY <= pinEnd) {
            translateY = scrollY - cardTop + targetPinTop;
          } else if (scrollY > pinEnd) {
            translateY = pinEnd - cardTop + targetPinTop;
          }
        } else {
          translateY = 0;
        }

        let scale = 1;
        if (i < lastIdx && scrollY >= pinStart) {
          const nextCardTop = cachedOffsets[i + 1] || 0;
          const nextPinStart = nextCardTop - (pinTop + (i + 1) * stackGap);
          const range = Math.max(1, nextPinStart - pinStart);
          const progress = Math.min(1, Math.max(0, (scrollY - pinStart) / range));
          scale = 1 - progress * 0.035 * (lastIdx - i);
        }

        if (translateY > 0) {
          card.style.transform = `translate3d(0, ${Math.round(translateY * 10) / 10}px, 0) scale(${Math.round(scale * 1000) / 1000})`;
        } else {
          card.style.transform = 'none';
        }
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateTransforms);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        measureOffsets();
        updateTransforms();
      }
    };
    window.addEventListener('resize', onResize);

    updateTransforms();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [pinTop, stackGap, stepDistance]);

  return (
    <div ref={containerRef} className="mobile-scroll-stack-wrapper relative w-full pb-10">
      {children}
      <div className="mobile-stack-end w-full h-1" />
    </div>
  );
};
