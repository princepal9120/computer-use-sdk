"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Cycles through words every `intervalMs` with a vertical slide + fade.
 * Always cycles (even with reduced motion — swaps instantly when reduced).
 */
export function FlipWord({
  words,
  intervalMs = 2000,
  className,
  reserve = "longest",
}: {
  words: readonly [string, string, ...string[]];
  intervalMs?: number;
  className?: string;
  /** Word used to reserve layout width. Default: longest word. */
  reserve?: "longest" | string;
}) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, words.length]);

  const reserveWord =
    reserve === "longest"
      ? words.reduce((a, b) => (a.length >= b.length ? a : b))
      : reserve;

  return (
    <span
      className={cn(
        "relative inline-grid overflow-hidden align-baseline",
        className
      )}
      style={{ gridTemplateAreas: "'stack'" }}
    >
      <span className="invisible col-start-1 row-start-1 select-none whitespace-nowrap" aria-hidden>
        {reserveWord}
      </span>
      {words.map((word, i) => {
        const active = i === index;
        return (
          <span
            key={word}
            className={cn(
              "col-start-1 row-start-1 whitespace-nowrap",
              "transition-[opacity,transform,filter] ease-[cubic-bezier(0.22,1,0.36,1)]",
              reduceMotion ? "duration-0" : "duration-300",
              active
                ? "translate-y-0 opacity-100 blur-0"
                : "pointer-events-none translate-y-[0.55em] opacity-0 blur-[2px]"
            )}
            style={{ gridArea: "stack" }}
            aria-hidden={!active}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
