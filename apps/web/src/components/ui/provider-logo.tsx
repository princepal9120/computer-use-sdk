import { cn } from "@/lib/cn";
import { Monogram } from "@/components/ui/monogram";

export function ProviderLogo({
  slug,
  monogram,
  title,
  className,
}: {
  slug?: string;
  monogram?: string;
  title: string;
  className?: string;
}) {
  if (slug) {
    return (
      <span
        className={cn("inline-flex shrink-0 items-center justify-center", className)}
        title={title}
      >
        <img
          src={`https://cdn.simpleicons.org/${slug}/000000`}
          alt={title}
          className="h-full w-full object-contain dark:hidden"
          loading="lazy"
        />
        <img
          src={`https://cdn.simpleicons.org/${slug}/ffffff`}
          alt={title}
          className="hidden h-full w-full object-contain dark:block"
          loading="lazy"
        />
      </span>
    );
  }
  return (
    <Monogram
      letters={monogram ?? title.slice(0, 2).toUpperCase()}
      className={cn("text-muted", className)}
    />
  );
}