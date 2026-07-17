import { unsupported } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import {
  isComputerActionType,
  loadOptionalPeer,
  requireEnv,
} from "../../internal/provider-utils";
import { cuaCapabilities } from "../capabilities";

export interface CuaOptions {
  /** CUA / TryCua API key. Defaults to CUA_API_KEY. */
  apiKey?: string;
  name?: string;
  osType?: "macos" | "windows" | "linux";
  display?: Partial<Display>;
}

export { cuaCapabilities };

type CuaButton = "left" | "middle" | "right";

/**
 * Minimal local view of `@trycua/computer`'s `BaseComputerInterface`
 * (not exported from the package). Signatures mirror v0.1.6.
 */
type CuaInterface = {
  waitForReady: (timeout?: number) => Promise<void>;
  screenshot: () => Promise<Buffer>;
  leftClick: (x?: number, y?: number) => Promise<void>;
  rightClick: (x?: number, y?: number) => Promise<void>;
  doubleClick: (x?: number, y?: number) => Promise<void>;
  moveCursor: (x: number, y: number) => Promise<void>;
  typeText: (text: string) => Promise<void>;
  pressKey: (key: string) => Promise<void>;
  hotkey: (...keys: string[]) => Promise<void>;
  scrollUp: (clicks?: number) => Promise<void>;
  scrollDown: (clicks?: number) => Promise<void>;
  drag: (
    path: Array<[number, number]>,
    button?: CuaButton,
    duration?: number,
  ) => Promise<void>;
  // runCommand returns a [stdout, stderr] tuple in v0.1.6.
  runCommand?: (command: string) => Promise<[string, string]>;
  disconnect: () => void;
  forceClose: () => void;
};

/** Local view of `CloudComputer` (exported as `Computer`) in v0.1.6. */
type CuaComputer = {
  run: () => Promise<void>;
  stop: () => Promise<void>;
  disconnect: () => Promise<void>;
  readonly interface: CuaInterface;
};

/**
 * CUA (trycua) cloud desktop computer-use.
 * Peer: `@trycua/computer`. Env: `CUA_API_KEY`.
 */
export function cua(options: CuaOptions = {}): ComputerProvider<CuaInterface> {
  return {
    id: "cua",
    capabilities: cuaCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const apiKey = requireEnv(
        "CUA_API_KEY",
        options.apiKey ?? process.env.CUA_API_KEY ?? process.env.TRYCUA_API_KEY,
        "cua",
      );

      const mod = await loadOptionalPeer(
        "@trycua/computer",
        () => import("@trycua/computer"),
        "cua",
      );
      const Computer = (mod as unknown as {
        Computer: new (cfg: {
          name: string;
          osType: string;
          apiKey: string;
        }) => CuaComputer;
      }).Computer;

      const osTypeMap = { macos: "macos", windows: "windows", linux: "linux" } as const;
      const computer = new Computer({
        name: options.name ?? `computer-use-sdk-${crypto.randomUUID().slice(0, 8)}`,
        osType: osTypeMap[options.osType ?? "linux"],
        apiKey,
      });

      // v0.1.6: run() resolves to void; the control interface is a getter.
      await computer.run();
      const iface = computer.interface;
      await iface.waitForReady(120);

      const runtime: ComputerRuntime<CuaInterface> = {
        id: options.name ?? `cua-${crypto.randomUUID().slice(0, 8)}`,
        raw: iface,
        capabilities: cuaCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          if (isComputerActionType(action.type)) {
            return runComputer(iface, action);
          }
          switch (action.type) {
            case "bash": {
              if (!iface.runCommand) return unsupported("cua", "bash");
              const [stdout, stderr] = await iface.runCommand(action.command);
              const text = `${stdout ?? ""}${stderr ? `\n[stderr]\n${stderr}` : ""}`;
              return { type: "text", text: text.trim() || "(no output)" };
            }
            default:
              return unsupported("cua", action.type);
          }
        },
        async screenshot() {
          const buf = await iface.screenshot();
          return Buffer.from(buf).toString("base64");
        },
        async stop() {
          try {
            iface.disconnect();
          } catch {
            try {
              iface.forceClose();
            } catch {
              // best-effort teardown
            }
          }
          await computer.disconnect().catch(() => undefined);
        },
      };
      return runtime;
    },
  };
}

async function runComputer(iface: CuaInterface, action: ToolAction): Promise<ToolResult> {
  switch (action.type) {
    case "screenshot": {
      const buf = await iface.screenshot();
      return {
        type: "image",
        data: Buffer.from(buf).toString("base64"),
        mediaType: "image/png",
      };
    }
    case "mouse_move":
      await iface.moveCursor(action.coordinate[0], action.coordinate[1]);
      return {
        type: "text",
        text: `Moved mouse to (${action.coordinate[0]}, ${action.coordinate[1]})`,
      };
    case "left_click":
      await iface.leftClick(action.coordinate?.[0], action.coordinate?.[1]);
      return { type: "text", text: "Left click" };
    case "right_click":
      await iface.rightClick(action.coordinate?.[0], action.coordinate?.[1]);
      return { type: "text", text: "Right click" };
    case "double_click":
      await iface.doubleClick(action.coordinate?.[0], action.coordinate?.[1]);
      return { type: "text", text: "Double click" };
    case "mouse_scroll":
      if (action.scrollDirection === "up") {
        await iface.scrollUp(action.scrollAmount ?? 1);
      } else {
        await iface.scrollDown(action.scrollAmount ?? 1);
      }
      return { type: "text", text: `Scrolled ${action.scrollDirection}` };
    case "left_click_drag": {
      const start = action.startCoordinate ?? action.coordinate;
      const end = action.coordinate;
      // v0.1.6: drag(path, button?, duration?) — build a 2-point path.
      await iface.drag(
        [
          [start[0], start[1]],
          [end[0], end[1]],
        ],
        "left",
      );
      return { type: "text", text: "Drag" };
    }
    case "key":
      await iface.pressKey(action.text);
      return { type: "text", text: `Pressed key: ${action.text}` };
    case "middle_click":
    case "triple_click":
      return unsupported("cua", action.type);
    default:
      return unsupported("cua", (action as { type: string }).type);
  }
}
