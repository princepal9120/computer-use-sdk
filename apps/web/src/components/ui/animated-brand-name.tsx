"use client";

import { cn } from "@/lib/cn";
import { FlipWord } from "@/components/ui/flip-word";

/**
 * Product wordmark: Computer / Browser Use SDK, flips every 2s.
 */
export function AnimatedBrandName({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-[0.3em] text-[15px] font-semibold tracking-tight",
        className
      )}
      aria-label="Computer Use SDK / Browser Use SDK"
    >
      <FlipWord words={["Computer", "Browser"]} intervalMs={2000} />
      <span aria-hidden="true">Use SDK</span>
    </span>
  );
}
