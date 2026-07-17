"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/ui/code-block";
import { Monogram } from "@/components/ui/monogram";
import { demoProviders } from "@/lib/providers";
import { cn } from "@/lib/cn";

function codeFor(p: (typeof demoProviders)[number]) {
  return `import { createSession } from "@prince/computer-use-sdk";
import { ${p.factory} } from "${p.importFrom}";

await using session = await createSession({ provider: ${p.config} });
${p.run}`;
}

export function CodeDemo() {
  const [active, setActive] = useState(demoProviders[0].id);
  const p = demoProviders.find((x) => x.id === active)!;

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {demoProviders.map((pr) => (
          <button
            key={pr.id}
            type="button"
            onClick={() => setActive(pr.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active === pr.id
                ? "border-accent-500/40 bg-accent-500/10 text-fg"
                : "border-edge text-muted hover:border-fg/20 hover:text-fg"
            )}
          >
            <Monogram letters={pr.monogram} className="h-4 w-4 text-current" />
            {pr.name}
          </button>
        ))}
      </div>
      <CodeBlock code={codeFor(p)} lang="tsx" title={`${p.factory}.ts`} />
    </div>
  );
}