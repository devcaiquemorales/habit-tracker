"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The greeting follows the user's progress, so its text and line count change.
 * Cross-fades the words and eases the height so the cards below never jump.
 */
export function AnimatedGreeting({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(text);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // Stable wrapper: the heading itself is replaced whenever the text changes.
  const measureRef = useRef<HTMLDivElement>(null);

  if (text !== current) {
    setOutgoing(current);
    setCurrent(text);
  }

  useEffect(() => {
    const box = boxRef.current;
    const measured = measureRef.current;
    if (!box || !measured) return;
    const sync = () => {
      box.style.height = `${measured.offsetHeight}px`;
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(measured);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative transition-[height] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
    >
      {outgoing !== null ? (
        <p
          key={outgoing}
          aria-hidden
          onAnimationEnd={() => setOutgoing(null)}
          className={`${className} absolute inset-x-0 top-0 duration-200 animate-out fill-mode-forwards fade-out-0 motion-reduce:hidden`}
        >
          {outgoing}
        </p>
      ) : null}
      <div ref={measureRef}>
        <h1
          key={current}
          className={`${className} ${
            outgoing !== null
              ? "duration-300 animate-in fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none"
              : ""
          }`}
        >
          {current}
        </h1>
      </div>
    </div>
  );
}
