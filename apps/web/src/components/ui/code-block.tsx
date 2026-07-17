"use client";

import { Highlight, type PrismTheme } from "prism-react-renderer";
import { cn } from "@/lib/cn";
import { CopyButton } from "@/components/ui/copy-button";

const theme: PrismTheme = {
  plain: { color: "#c9d1d9", backgroundColor: "#0d1117" },
  styles: [
    { types: ["comment", "prolog", "cdata"], style: { color: "#8b949e", fontStyle: "italic" } },
    { types: ["punctuation"], style: { color: "#8b949e" } },
    {
      types: ["keyword", "selector", "tag", "constant", "symbol", "boolean", "operator", "deleted"],
      style: { color: "#ff7b72" },
    },
    { types: ["number"], style: { color: "#79c0ff" } },
    { types: ["string", "char", "attr-value", "inserted"], style: { color: "#a5d6ff" } },
    { types: ["function", "method"], style: { color: "#d2a8ff" } },
    { types: ["class-name", "maybe-class-name", "title", "namespace"], style: { color: "#ffa657" } },
    { types: ["attr-name", "property", "variable"], style: { color: "#79c0ff" } },
    { types: ["tag"], style: { color: "#7ee787" } },
  ],
};

export function CodeBlock({
  code,
  lang = "tsx",
  title,
  showLineNumbers = true,
  flush = false,
  className,
}: {
  code: string;
  lang?: string;
  title?: string;
  showLineNumbers?: boolean;
  /** Drop the outer border, rounding, and shadow so it can nest inside another card. */
  flush?: boolean;
  className?: string;
}) {
  const trimmed = code.trim();

  return (
    <div
      className={cn(
        "overflow-hidden bg-[#0d1117]",
        flush
          ? ""
          : "rounded-2xl border border-edge shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          {title && (
            <span className="ml-1 font-mono text-xs text-zinc-400">{title}</span>
          )}
        </div>
        <CopyButton value={trimmed} />
      </div>
      <Highlight theme={theme} code={trimmed} language={lang}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="overflow-x-auto whitespace-pre px-4 py-4 font-mono text-[13px] leading-[1.7]"
            style={{ ...style, background: "transparent" }}
          >
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line });
              return (
                <div
                  key={i}
                  {...lineProps}
                  className={cn(lineProps.className, "block whitespace-pre")}
                >
                  {showLineNumbers && (
                    <span className="mr-4 inline-block w-6 select-none text-right font-mono text-[12px] text-zinc-600">
                      {i + 1}
                    </span>
                  )}
                  {line.map((token, k) => (
                    <span key={k} {...getTokenProps({ token })} />
                  ))}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}