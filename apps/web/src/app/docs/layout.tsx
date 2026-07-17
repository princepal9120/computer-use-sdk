import { DocsSidebar } from "@/components/docs/sidebar";
import { OnThisPage } from "@/components/docs/on-this-page";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)_220px] xl:gap-12">
        <DocsSidebar />
        <main id="docs-content" className="min-w-0 py-10 lg:py-12">
          {children}
        </main>
        <aside className="hidden xl:block">
          <OnThisPage />
        </aside>
      </div>
    </div>
  );
}