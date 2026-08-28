import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "core", "skills");
const target = path.join(root, ".agents", "skills");
await mkdir(target, { recursive: true });
await cp(path.join(source, "OPENLEARN-SHARED-CONTRACT.md"), path.join(target, "OPENLEARN-SHARED-CONTRACT.md"), { force: true });
for (const entry of await (await import("node:fs/promises")).readdir(source, { withFileTypes: true })) {
  if (entry.isDirectory()) await cp(path.join(source, entry.name), path.join(target, entry.name), { recursive: true, force: true });
}
console.log("Synced .agents/skills from core/skills.");
