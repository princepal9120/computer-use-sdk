const sdkRows = [
  { name: "TryCUA", browser: true, desktop: true, api: true },
  { name: "OpenAI Computer Use", browser: true, desktop: true, api: true },
  { name: "Anthropic Computer Use", browser: true, desktop: true, api: true },
  { name: "Browserbase", browser: true, desktop: false, api: true },
  { name: "Steel.dev", browser: true, desktop: false, api: true },
  { name: "Hyperbrowser", browser: true, desktop: false, api: true },
];

const ossRows = [
  { name: "Browser Use", oss: "✅", browser: true, desktop: "❌", vision: "✅" },
  { name: "Skyvern", oss: "✅", browser: true, desktop: "❌", vision: "✅" },
  { name: "OpenHands", oss: "✅", browser: true, desktop: "Partial", vision: "✅" },
  { name: "Stagehand", oss: "✅", browser: true, desktop: "❌", vision: "AI-assisted" },
  { name: "Steel Browser SDK", oss: "Partial", browser: true, desktop: "❌", vision: "AI" },
  { name: "AgentQL", oss: "Partial", browser: true, desktop: "❌", vision: "DOM AI" },
  { name: "Midscene.js", oss: "✅", browser: true, desktop: "❌", vision: "✅" },
  { name: "Nanobrowser", oss: "✅", browser: true, desktop: "❌", vision: "✅" },
  { name: "Playwright MCP", oss: "✅", browser: true, desktop: "❌", vision: "❌" },
];

function Cell({ ok }: { ok: boolean | string }) {
  if (ok === true || ok === "✅") return <span className="yes">✅</span>;
  if (ok === false || ok === "❌") return <span className="no">❌</span>;
  return <span className="partial">{String(ok)}</span>;
}

export default function HomePage() {
  return (
    <main>
      <div className="badge">@opencoredev/computer-use-sdk · 16 providers · MIT</div>
      <h1>One API for every computer-use stack</h1>
      <p className="lead">
        Local, cloud browsers, desktop sandboxes, vision agents, and scrape —
        same <code>createSession</code> / <code>session.run</code>. Plug providers in and out.
      </p>

      <div className="row">
        <a
          className="btn btn-primary"
          href="https://github.com/princepal9120/computer-use-sdk"
        >
          GitHub
        </a>
        <a
          className="btn btn-ghost"
          href="https://www.npmjs.com/package/@opencoredev/computer-use-sdk"
        >
          npm
        </a>
      </div>

      <h2>SDK matrix</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SDK</th>
              <th>Browser</th>
              <th>Desktop</th>
              <th>API</th>
            </tr>
          </thead>
          <tbody>
            {sdkRows.map((r) => (
              <tr key={r.name}>
                <td>
                  <strong>{r.name}</strong>
                </td>
                <td>
                  <Cell ok={r.browser} />
                </td>
                <td>
                  <Cell ok={r.desktop} />
                </td>
                <td>
                  <Cell ok={r.api} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>OSS / agent projects</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>OSS</th>
              <th>Browser</th>
              <th>Desktop</th>
              <th>Vision</th>
            </tr>
          </thead>
          <tbody>
            {ossRows.map((r) => (
              <tr key={r.name}>
                <td>
                  <strong>{r.name}</strong>
                </td>
                <td>
                  <Cell ok={r.oss} />
                </td>
                <td>
                  <Cell ok={r.browser} />
                </td>
                <td>
                  <Cell ok={r.desktop} />
                </td>
                <td>
                  <Cell ok={r.vision} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Quickstart</h2>
      <pre>{`import { createSession } from "@opencoredev/computer-use-sdk";
import { openai } from "@opencoredev/computer-use-sdk/openai";
// or: anthropic | browserbase | steel | hyperbrowser | browserUse
//     | skyvern | stagehand | midscene | agentql | cua | local …

await using session = await createSession({ provider: openai() });
await session.run({ type: "agent", task: "Open example.com and list links" });`}</pre>

      <footer>
        Modeled on{" "}
        <a href="https://github.com/opencoredev/sandbox-sdk">sandbox-sdk</a> /{" "}
        <a href="https://github.com/opencoredev/email-sdk">email-sdk</a>.
      </footer>
    </main>
  );
}
