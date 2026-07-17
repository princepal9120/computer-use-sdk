"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export function CopyButton({
  value,
  className,
  label,
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label ?? "Copy to clipboard"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200",
        className
      )}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {label && <span>{label}</span>}
    </button>
  );
}