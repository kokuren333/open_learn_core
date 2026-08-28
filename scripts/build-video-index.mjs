import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { readVideoSource } from "../core/src/video/io.mjs";
import { auditVideoSource } from "../core/src/video/audit.mjs";

const root = process.cwd();
const domain = await loadDomain(root, process.argv[2] ?? "linear-algebra");
const sourceRoot = path.join(domain.root, "video", "units");
const output = path.join(root, "dist", "domains", domain.id, "video");
const sourcesOutput = path.join(output, "sources");
const manifestsOutput = path.join(output, "manifests");
await mkdir(sourcesOutput, { recursive: true });
await mkdir(manifestsOutput, { recursive: true });
const units = [];
try {
  for (const entry of (await readdir(sourceRoot, { withFileTypes: true })).filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const base = path.join(sourceRoot, entry.name);
    const source = await readVideoSource(path.join(base, "video.yaml"));
    const audit = auditVideoSource({ source, slidesMarkdown: await readFile(path.join(base, "slides.md"), "utf8") });
    if (audit.status === "fail") throw new Error(`${entry.name}: ${audit.issues.map((item) => item.problem).join("; ")}`);
    const destination = path.join(sourcesOutput, entry.name);
    await mkdir(destination, { recursive: true });
    for (const file of ["video.yaml", "slides.md", "youtube.yaml"]) try { await cp(path.join(base, file), path.join(destination, file)); } catch (error) { if (error.code !== "ENOENT") throw error; }
    const manifest = { unit: source.unit, source: `sources/${entry.name}`, audit: "pass", slide_count: source.slides.length, publication: "youtube.yaml" };
    await writeFile(path.join(manifestsOutput, `${entry.name}.json`), JSON.stringify(manifest, null, 2) + "\n", "utf8");
    units.push(manifest);
  }
} catch (error) { if (error.code !== "ENOENT") throw error; }
const index = { version: "2.2.0", domain: domain.id, generated_by: "open-learn-core", units };
await writeFile(path.join(output, "build-index.json"), JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(`Video source index written: ${units.length} source package(s).`);
