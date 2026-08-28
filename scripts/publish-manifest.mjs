import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
const dist = path.join(root, "dist", "domains", domainId);
const manifestPath = path.join(dist, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
let sourceCommit = process.env.SOURCE_COMMIT ?? "working-tree";
try { sourceCommit = (await exec("git", ["rev-parse", "HEAD"], { cwd: root })).stdout.trim(); } catch {}
const files = [];
async function walk(dir) { for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) { const file = path.join(dir, entry.name); if (entry.isDirectory()) await walk(file); else if (entry.name !== "publication-manifest.json") { const data = await readFile(file); files.push({ path: path.relative(dist, file).replaceAll("\\", "/"), sha256: createHash("sha256").update(data).digest("hex"), bytes: data.byteLength }); } } }
await walk(dist);
const publication = { course_id: manifest.course_id ?? "linear-algebra-foundations-to-applications", version: manifest.courseVersion ?? "2.0.0", source_commit: sourceCommit, build_timestamp: new Date().toISOString(), web: { path: `dist/domains/${domainId}` }, pdf: { path: "pdf/linear-algebra.pdf", optional: true }, videos: { index: "video/build-index.json" }, checksums: Object.fromEntries(files.map((file) => [file.path, file.sha256])), files, license: manifest.license ?? { code: "MIT", content: "CC BY-SA 4.0" }, asset_base_url: process.env.ASSET_BASE_URL ?? "" };
await writeFile(path.join(dist, "publication-manifest.json"), JSON.stringify(publication, null, 2) + "\n", "utf8");
console.log(`Publication manifest written for ${domainId} at source ${sourceCommit}.`);
