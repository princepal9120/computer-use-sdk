import type { ReactNode } from "react";
import { Info, Warning } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: "note" | "warning";
  title?: string;
  children: ReactNode;
}) {
  const isWarn = type === "warning";
  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-xl border p-4",
        isWarn
          ? "border-amber-500/30 bg-amber-500/[0.06]"
          : "border-accent-500/30 bg-accent-500/[0.06]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 shrink-0",
          isWarn ? "text-amber-500" : "text-accent-500"
        )}
      >
        {isWarn ? (
          <Warning size={18} weight="duotone" />
        ) : (
          <Info size={18} weight="duotone" />
        )}
      </span>
      <div className="min-w-0 text-sm leading-relaxed">
        {title && <p className="font-medium text-fg">{title}</p>}
        <div className={cn(title && "mt-1", "text-muted")}>{children}</div>
      </div>
    </div>
  );
}