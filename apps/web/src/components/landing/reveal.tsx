"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = React.HTMLAttributes<HTMLDivElement> & {
  delay?: number;
  y?: number;
};

// "idle" renders fully visible, so the server-rendered / no-JS / crawler view
// always ships the content (never gated behind an IntersectionObserver). On the
// client, only content that is still below the fold is hidden and then revealed
// on scroll — the entrance enhances an already-visible default rather than
// gating visibility on it.
type RevealState = "idle" | "hidden" | "shown";

export function Reveal({ children, delay = 0, y = 20, className, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setState("shown");
      return;
    }

    // Already in (or near) view at load: show immediately, no entrance flash.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
      setState("shown");
      return;
    }

    setState("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = state === "hidden";
  const animate = state !== "idle";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: hidden ? 0 : 1,
        transform: hidden ? `translateY(${y}px)` : "none",
        transition: animate
          ? `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
          : undefined,
        willChange: hidden ? "opacity, transform" : undefined,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
