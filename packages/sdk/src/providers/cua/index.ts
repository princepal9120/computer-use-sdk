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

type CuaInterface = {
  waitForReady: (timeout?: number) => Promise<void>;
  screenshot: () => Promise<Buffer>;
  leftClick: (x?: number, y?: number) => Promise<void>;
  rightClick?: (x?: number, y?: number) => Promise<void>;
  doubleClick?: (x?: number, y?: number) => Promise<void>;
  moveCursor: (x: number, y: number) => Promise<void>;
  typeText: (text: string) => Promise<void>;
  key?: (key: string) => Promise<void>;
  pressKey?: (key: string) => Promise<void>;
  scrollUp?: (clicks?: number) => Promise<void>;
  scrollDown?: (clicks?: number) => Promise<void>;
  drag?: (start: [number, number], end: [number, number]) => Promise<void>;
  runCommand?: (cmd: string) => Promise<{ stdout?: string; stderr?: string; output?: string }>;
  close?: () => Promise<void>;
  forceClose?: () => Promise<void>;
};

type CuaComputer = {
  run: () => Promise<CuaInterface>;
  disconnect: () => Promise<void>;
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

      const iface = await computer.run();
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
              const result = await iface.runCommand(action.command);
              const text =
                result.output
                ?? `${result.stdout ?? ""}${result.stderr ? `\n[stderr]\n${result.stderr}` : ""}`;
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
          await iface.close?.().catch(() => iface.forceClose?.());
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
      if (!iface.rightClick) return unsupported("cua", "right_click");
      await iface.rightClick(action.coordinate?.[0], action.coordinate?.[1]);
      return { type: "text", text: "Right click" };
    case "double_click":
      if (!iface.doubleClick) {
        await iface.leftClick(action.coordinate?.[0], action.coordinate?.[1]);
        await iface.leftClick(action.coordinate?.[0], action.coordinate?.[1]);
      } else {
        await iface.doubleClick(action.coordinate?.[0], action.coordinate?.[1]);
      }
      return { type: "text", text: "Double click" };
    case "mouse_scroll":
      if (action.scrollDirection === "up") {
        await iface.scrollUp?.(action.scrollAmount ?? 1);
      } else {
        await iface.scrollDown?.(action.scrollAmount ?? 1);
      }
      return { type: "text", text: `Scrolled ${action.scrollDirection}` };
    case "left_click_drag":
      if (!iface.drag) return unsupported("cua", "left_click_drag");
      await iface.drag(
        action.startCoordinate ?? action.coordinate,
        action.coordinate,
      );
      return { type: "text", text: "Drag" };
    case "key": {
      const press = iface.key ?? iface.pressKey;
      if (!press) {
        await iface.typeText(action.text);
      } else {
        await press.call(iface, action.text);
      }
      return { type: "text", text: `Pressed key: ${action.text}` };
    }
    case "middle_click":
    case "triple_click":
      return unsupported("cua", action.type);
    default:
      return unsupported("cua", (action as { type: string }).type);
  }
}
