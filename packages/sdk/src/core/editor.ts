import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface EditorResult {
  output: string;
  fileText?: string;
}

/** Sandbox-safe str-replace text editor (mirrors Anthropic text_editor_20250124). */
export async function runEditorAction(
  action:
    | { type: "view"; path: string; viewRange?: [number, number] }
    | { type: "create"; path: string; fileText: string }
    | {
        type: "str_replace";
        path: string;
        oldStr: string;
        newStr: string;
        replaceAll?: boolean;
      }
    | { type: "insert"; path: string; insertLine: number; insertText: string },
  resolve: (p: string) => string,
): Promise<EditorResult> {
  const path = resolve(action.path);
  switch (action.type) {
    case "view": {
      const text = await readFile(path, "utf8");
      const lines = text.split("\n");
      const [start, end] = action.viewRange ?? [1, lines.length];
      const slice = lines
        .slice(start - 1, end)
        .map((l, i) => `${start + i}\t${l}`)
        .join("\n");
      return { output: slice, fileText: text };
    }
    case "create": {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, action.fileText, "utf8");
      return { output: `Created ${action.path}`, fileText: action.fileText };
    }
    case "str_replace": {
      const text = await readFile(path, "utf8");
      const count = text.split(action.oldStr).length - 1;
      if (count === 0) throw new Error(`old_str not found in ${action.path}`);
      if (!action.replaceAll && count > 1) {
        throw new Error(`old_str is not unique in ${action.path} (${count} matches)`);
      }
      const next = action.replaceAll
        ? text.split(action.oldStr).join(action.newStr)
        : text.replace(action.oldStr, action.newStr);
      await writeFile(path, next, "utf8");
      return {
        output: `Replaced ${count} occurrence(s) in ${action.path}`,
        fileText: next,
      };
    }
    case "insert": {
      const text = await readFile(path, "utf8");
      const lines = text.split("\n");
      if (action.insertLine < 0 || action.insertLine > lines.length) {
        throw new Error(
          `insert_line ${action.insertLine} out of range (0..${lines.length})`,
        );
      }
      lines.splice(action.insertLine, 0, action.insertText);
      const next = lines.join("\n");
      await writeFile(path, next, "utf8");
      return {
        output: `Inserted at line ${action.insertLine} in ${action.path}`,
        fileText: next,
      };
    }
  }
}
