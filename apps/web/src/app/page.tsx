const providers = [
  {
    name: "Local",
    blurb: "Playwright Chromium on the host. Shell + text editor included.",
  },
  {
    name: "Browserbase",
    blurb: "Hosted browsers over CDP. Scale remote sessions.",
  },
  {
    name: "Browser Use",
    blurb: "Agent tasks + stealth browsers. Goal in, result out.",
  },
  {
    name: "CUA",
    blurb: "Full desktop sandboxes for computer-use agents.",
  },
  {
    name: "Firecrawl",
    blurb: "Scrape, crawl, map, search — web data without a live UI.",
  },
];

export default function HomePage() {
  return (
    <main>
      <div className="badge">@opencoredev/computer-use-sdk · MIT</div>
      <h1>One API for computer-use providers</h1>
      <p className="lead">
        Same TypeScript session surface for Local, Browserbase, Browser Use, CUA,
        and Firecrawl. Plug providers in and out with one import.
      </p>

      <div className="row">
        <a
          className="btn btn-primary"
          href="https://github.com/opencoredev/computer-use-sdk"
        >
          GitHub
        </a>
        <a
          className="btn btn-ghost"
          href="https://www.npmjs.com/package/@opencoredev/computer-use-sdk"
        >
          npm package
        </a>
      </div>

      <h2>Providers</h2>
      <div className="grid">
        {providers.map((p) => (
          <div className="card" key={p.name}>
            <h3>{p.name}</h3>
            <p>{p.blurb}</p>
          </div>
        ))}
      </div>

      <h2>Quickstart</h2>
      <pre>{`import { createSession } from "@opencoredev/computer-use-sdk";
import { local } from "@opencoredev/computer-use-sdk/local";
// import { browserbase } from "@opencoredev/computer-use-sdk/browserbase";
// import { browserUse } from "@opencoredev/computer-use-sdk/browser-use";
// import { cua } from "@opencoredev/computer-use-sdk/cua";
// import { firecrawl } from "@opencoredev/computer-use-sdk/firecrawl";

await using session = await createSession({ provider: local() });
await session.run({ type: "goto", url: "https://example.com" });
const png = await session.screenshot();`}</pre>

      <footer>
        Built like{" "}
        <a href="https://github.com/opencoredev/sandbox-sdk">sandbox-sdk</a> and{" "}
        <a href="https://github.com/opencoredev/email-sdk">email-sdk</a>.
      </footer>
    </main>
  );
}
