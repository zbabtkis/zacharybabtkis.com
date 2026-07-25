'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Terminal that "executes" when scrolled into view: lines appear one at a
 * time, then the cursor blinks at rest. Respects prefers-reduced-motion by
 * rendering everything immediately.
 */
export function TerminalCard({
  title = 'zsh — harness',
  lines,
}: {
  title?: string;
  lines: React.ReactNode[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        const reducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
          setVisibleCount(lines.length);
        } else {
          setStarted(true);
        }
        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [lines.length]);

  useEffect(() => {
    if (!started || visibleCount >= lines.length) return;

    const delay = visibleCount === 0 ? 350 : 550;
    const timer = setTimeout(() => {
      setVisibleCount((count) => count + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [started, visibleCount, lines.length]);

  return (
    <div className="terminal" aria-hidden="true" ref={rootRef}>
      <div className="terminal-chrome">
        <span className="traffic">
          <i />
          <i />
          <i />
        </span>
        <span className="terminal-title">{title}</span>
      </div>
      <pre className="terminal-body">
        {lines.slice(0, visibleCount).map((line, i) => (
          <div key={i} className="terminal-line terminal-line-in">
            {line}
          </div>
        ))}
        <div className="terminal-line">
          <span className="cursor" />
        </div>
      </pre>
    </div>
  );
}

export function ToolCallCard() {
  return (
    <TerminalCard
      title="agent session"
      lines={[
        <>
          <span className="dim">user:</span> &ldquo;book me something for
          Tuesday&rdquo;
        </>,
        <>
          <span className="accent">⏺ tools/call</span> get_availability
        </>,
        <>
          {'  '}
          <span className="dim">→ 200 · 38ms · OAuth scope: read</span>
        </>,
        <>
          <span className="accent">⏺ tools/call</span> create_booking
        </>,
        <>
          {'  '}
          <span className="dim">→ held for human confirmation ✓</span>
        </>,
        <>
          <span className="ok">✓ your product, doing the work</span>
        </>,
      ]}
    />
  );
}
