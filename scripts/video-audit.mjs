import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { readVideoSource } from "../core/src/video/io.mjs";
import { auditVideoSource } from "../core/src/video/audit.mjs";

const root = process.cwd();
const domainId = process.argv[2];
const unitId = process.argv[3];
if (!domainId || !unitId) throw new Error("Usage: npm run video:audit -- <domain> <unit>");
const domain = await loadDomain(root, domainId);
const base = path.join(domain.root, "video", "units", unitId);
const sourcePath = path.join(base, "video.yaml");
const slidesPath = path.join(base, "slides.md");
await access(sourcePath); await access(slidesPath);
const result = auditVideoSource({ source: await readVideoSource(sourcePath), slidesMarkdown: await readFile(slidesPath, "utf8") });
console.log(JSON.stringify(result, null, 2));
if (result.status === "fail") process.exit(1);
