import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
const dist = path.join(root, "dist", "domains", domainId);
const issues = [];
const checks = [];
async function required(relative) { try { await access(path.join(dist, relative)); checks.push(`present:${relative}`); } catch { issues.push(`missing publication file: ${relative}`); } }
for (const file of ["index.html", "course.html", "manifest.json", "build-report.json", "audit/course.json", "video/build-index.json"]) await required(file);
const manifest = JSON.parse(await readFile(path.join(dist, "manifest.json"), "utf8").catch(() => "{}"));
if (!manifest.courseVersion || !manifest.source_commit) issues.push("publication manifest is missing courseVersion or source_commit");
if (!manifest.license) issues.push("publication manifest is missing license metadata");
if (manifest.asset_base_url?.includes("localhost")) issues.push("publication manifest contains a localhost asset URL");
const htmlFiles = [];
async function walk(dir) { for (const entry of await readdir(dir, { withFileTypes: true })) { const file = path.join(dir, entry.name); if (entry.isDirectory()) await walk(file); else if (entry.name.endsWith(".html")) htmlFiles.push(file); } }
try { await walk(dist); } catch {}
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (html.includes("C:\\Users\\") || html.includes("/Users/") || html.includes("127.0.0.1")) issues.push(`build-machine or localhost path in ${path.relative(root, file)}`);
  for (const match of html.matchAll(/href="([^#"]+\.html)"/g)) {
    const href = match[1]; if (/^(https?:|mailto:)/.test(href)) continue;
    const target = path.resolve(path.dirname(file), href);
    try { await access(target); } catch { issues.push(`broken local link in ${path.relative(root, file)}: ${href}`); }
  }
}
const result = { status: issues.length ? "fail" : "pass", domain: domainId, files_checked: htmlFiles.length, checks, issues };
console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exit(1);
