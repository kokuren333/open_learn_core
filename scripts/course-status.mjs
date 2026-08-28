import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDomain } from "../core/src/domain/load-domain.mjs";

const root = process.cwd();
const domain = await loadDomain(root, process.argv[2] ?? "linear-algebra");
const units = domain.courseData.units.map((record) => record.value).sort((a, b) => a.module.localeCompare(b.module) || a.order - b.order);
const lines = ["# Course Content Status", "", "The Course is intentionally staged: the initial vector-space slice is authored first, while the full foundations-to-applications map remains experimental.", "", "| Unit | Module | HTML | PDF | Video Source | YouTube | Status |", "|---|---|---|---|---|---|---|"];
for (const unit of units) {
  const video = path.join(domain.root, "video", "units", unit.id, "video.yaml");
  let hasVideo = false; try { await readFile(video); hasVideo = true; } catch {}
  lines.push(`| ${unit.id} | ${unit.module} | ${unit.formats.html.status} | ${unit.formats.pdf.status} | ${hasVideo ? "scripted" : "—"} | not_planned | ${unit.status} |`);
}
lines.push("", "## Course Gate", "", "Required modules and the full inventory are present. Format publication remains incomplete until Unit and Module PDF outputs are built and the Course Auditor passes with authored coverage.", "");
await mkdir(path.join(domain.root, "docs"), { recursive: true });
await writeFile(path.join(domain.root, "docs", "content-status.md"), lines.join("\n"));
console.log(`Updated ${path.relative(root, path.join(domain.root, "docs", "content-status.md"))}`);
