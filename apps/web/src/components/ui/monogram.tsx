import { cn } from "@/lib/cn";

export function Monogram({
  letters,
  className,
  title,
}: {
  letters: string;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-7 w-7", className)}
      role="img"
      {...(title ? { "aria-label": title } : { "aria-hidden": "true" })}
    >
      <rect width="40" height="40" rx="10" fill="currentColor" />
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontWeight="600"
        fontSize="15"
        fill="#ffffff"
      >
        {letters}
      </text>
    </svg>
  );
}