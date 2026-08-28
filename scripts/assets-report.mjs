import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { loadDomain } from "../core/src/domain/load-domain.mjs";

const root = process.cwd();
const domain = await loadDomain(root, process.argv[2]);
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(fullPath);
    else files.push({ path: fullPath, size: (await stat(fullPath)).size });
  }
}
await walk(domain.assetRoot);
const groups = new Map();
for (const file of files) {
  const ext = path.extname(file.path).toLowerCase() || "[none]";
  const current = groups.get(ext) ?? { files: 0, bytes: 0 };
  current.files += 1; current.bytes += file.size; groups.set(ext, current);
}
console.log(`Assets: ${domain.id}`);
for (const [ext, value] of groups) console.log(`${ext.padEnd(7)} ${String(value.files).padStart(4)} files ${String(value.bytes).padStart(10)} bytes`);
console.log(`total             ${files.reduce((sum, file) => sum + file.size, 0)} bytes`);
for (const file of files.filter((item) => item.size > 2 * 1024 * 1024)) console.warn(`warning: ${path.relative(domain.assetRoot, file.path)} is larger than 2 MB`);
