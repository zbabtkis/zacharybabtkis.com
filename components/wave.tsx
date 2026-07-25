'use client';

import { useEffect, useRef, useState } from 'react';

const PERIOD = 30;
const WIDTH = 240;

function wavePath(): string {
  let d = 'M0 6';
  for (let x = 0; x < WIDTH; x += PERIOD) {
    d += ` Q${x + 7.5} 0 ${x + 15} 6 Q${x + 22.5} 12 ${x + PERIOD} 6`;
  }
  return d;
}

const PATH = wavePath();

/**
 * The amber wave divider, drawn stroke-first when it scrolls into view.
 * Reduced motion (and no-JS via CSS default) shows it fully drawn.
 */
export function Wave() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setDrawn(true);
        observer.disconnect();
      },
      { threshold: 0.9 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="wave" aria-hidden="true" ref={rootRef}>
      <svg
        width="100%"
        height="12"
        viewBox={`0 0 ${WIDTH} 12`}
        preserveAspectRatio="none"
      >
        <path
          className={`wave-path${drawn ? ' drawn' : ''}`}
          d={PATH}
          pathLength={1}
          fill="none"
          stroke="var(--amber)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
