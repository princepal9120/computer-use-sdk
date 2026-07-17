import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

export function buttonVariants(opts?: { variant?: Variant; size?: Size }) {
  const { variant = "primary", size = "md" } = opts ?? {};
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 disabled:pointer-events-none disabled:opacity-50";
  const variants: Record<Variant, string> = {
    primary: "bg-fg text-bg hover:opacity-90",
    accent: "bg-accent-500 text-white hover:bg-accent-400",
    outline: "border border-edge text-fg hover:bg-bg",
    ghost: "text-fg hover:bg-bg",
  };
  const sizes: Record<Size, string> = {
    sm: "h-9 px-3.5 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };
  return cn(base, variants[variant], sizes[size]);
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}