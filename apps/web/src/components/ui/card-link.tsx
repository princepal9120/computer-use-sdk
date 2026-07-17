import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";

export function CardLink({
  href,
  title,
  description,
  external = false,
}: {
  href: string;
  title: string;
  description: string;
  external?: boolean;
}) {
  const inner = (
    <div className="group flex h-full flex-col rounded-xl border border-edge bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-fg/20">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-medium text-fg">{title}</h3>
        <ArrowUpRight
          size={16}
          className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return <Link href={href}>{inner}</Link>;
}