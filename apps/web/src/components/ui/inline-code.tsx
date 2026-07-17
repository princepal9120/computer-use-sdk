import { cn } from "@/lib/cn";

export function InlineCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        "rounded-md border border-edge bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-fg",
        className
      )}
    >
      {children}
    </code>
  );
}