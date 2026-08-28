import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDataset, validateDataset } from "../src/validation/index.mjs";
import { renderConcept, renderCurriculum, renderGraph, renderIndex } from "../src/web/render.mjs";

const root = process.cwd();
const site = path.join(root, "site");
const dataset = await loadDataset(root);
const validation = await validateDataset(dataset);
if (!validation.valid) {
  console.error("Cannot build invalid dataset:\n" + validation.issues.map((issue) => `- ${issue}`).join("\n"));
  process.exit(1);
}

await rm(site, { recursive: true, force: true });
await mkdir(path.join(site, "concepts"), { recursive: true });
const concepts = dataset.concepts.map((record) => record.value);
const conceptsById = validation.conceptsById;
const sourceById = validation.sourceById;
const evidenceById = validation.evidenceById;
const curricula = dataset.curricula;
await writeFile(path.join(site, "index.html"), renderIndex({ concepts, conceptsById, curricula }), "utf8");
await writeFile(path.join(site, "graph.html"), renderGraph({ concepts, conceptsById, curricula }), "utf8");
for (const concept of concepts) await writeFile(path.join(site, "concepts", `${concept.id}.html`), renderConcept({ concept, conceptsById, sourceById, evidenceById }), "utf8");
if (curricula[0]?.value) await writeFile(path.join(site, "curriculum.html"), renderCurriculum({ curriculum: curricula[0].value, conceptsById, sourceById, evidenceById, decisions: dataset.curriculumDecisions.map((record) => record.value) }), "utf8");
await writeFile(path.join(site, "styles.css"), await readFile(path.join(root, "src", "web", "styles.css"), "utf8"), "utf8");
await writeFile(path.join(site, ".nojekyll"), "", "utf8");
console.log(`Built ${concepts.length + 3} HTML pages in ${path.relative(root, site)}/`);
