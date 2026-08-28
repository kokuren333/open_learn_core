import { readFile } from "node:fs/promises";

function scalar(value) {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^[-+]?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^['"]|['"]$/g, "");
}

export function parseManifest(source) {
  try { return JSON.parse(source); } catch { /* YAML fallback */ }
  const root = {};
  const stack = [{ indent: -1, value: root }];
  const lines = source.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith("#"));
  for (const [lineIndex, line] of lines.entries()) {
    const indent = line.match(/^\s*/)[0].length;
    const content = line.trim();
    while (stack.length > 1 && indent <= stack.at(-1).indent) stack.pop();
    const parent = stack.at(-1).value;
    if (content.startsWith("- ")) {
      if (!Array.isArray(parent)) throw new Error("manifest list indentation is invalid");
      parent.push(scalar(content.slice(2)));
      continue;
    }
    const match = content.match(/^([^:]+):(?:\s+(.*))?$/);
    if (!match) throw new Error(`unsupported manifest line: ${content}`);
    const key = match[1].trim();
    const raw = match[2];
    if (raw !== undefined && raw !== "") parent[key] = scalar(raw);
    else {
      const next = lines[lineIndex + 1]?.trim();
      parent[key] = next?.startsWith("-") ? [] : {};
      stack.push({ indent, value: parent[key] });
    }
  }
  return root;
}

export async function readManifest(filePath) {
  return parseManifest(await readFile(filePath, "utf8"));
}
