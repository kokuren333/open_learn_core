import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDataset, validateDataset } from "../src/validation/index.mjs";
import { renderConcept, renderCurriculum, renderGraph, renderIndex } from "../src/web/render.mjs";
import { runAudits } from "./run-audits.mjs";
import { evaluatePublishGate } from "../src/quality/publish-gate.mjs";

const root = process.cwd();
const site = path.join(root, "site");
const dist = path.join(root, "dist");
const dataset = await loadDataset(root);
const validation = await validateDataset(dataset);
if (!validation.valid) {
  console.error("Cannot build invalid dataset:\n" + validation.issues.map((issue) => `- ${issue}`).join("\n"));
  process.exit(1);
}
await runAudits(root, "basis", dataset, validation);
const gate = await evaluatePublishGate({ dataset, validation, conceptId: "basis" });
if (!gate.allowed) {
  await rm(dist, { recursive: true, force: true });
  console.error("Publish gate blocked:", gate.issues.join("; "));
  process.exit(1);
}

await rm(site, { recursive: true, force: true });
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(site, "concepts"), { recursive: true });
const concepts = dataset.concepts.map((record) => record.value);
const conceptsById = validation.conceptsById;
const sourceById = validation.sourceById;
const evidenceById = validation.evidenceById;
const visualsById = validation.visualsById;
const curricula = dataset.curricula;
await writeFile(path.join(site, "index.html"), renderIndex({ concepts, conceptsById, curricula }), "utf8");
await writeFile(path.join(site, "graph.html"), renderGraph({ concepts, conceptsById, curricula }), "utf8");
for (const concept of concepts) await writeFile(path.join(site, "concepts", `${concept.id}.html`), renderConcept({ concept, conceptsById, sourceById, evidenceById, visualsById }), "utf8");
if (curricula[0]?.value) await writeFile(path.join(site, "curriculum.html"), renderCurriculum({ curriculum: curricula[0].value, conceptsById, sourceById, evidenceById, decisions: dataset.curriculumDecisions.map((record) => record.value) }), "utf8");
await writeFile(path.join(site, "styles.css"), await readFile(path.join(root, "src", "web", "styles.css"), "utf8"), "utf8");
await writeFile(path.join(site, ".nojekyll"), "", "utf8");
await cp(site, dist, { recursive: true });
const report = { concept: "basis", version: "1.8", status: gate.status, semanticAudits: Object.fromEntries(["math", "evidence", "pedagogy", "explanation", "visual", "completeness"].map((name) => [name, gate.computedAudits[name].status])), content: { lessons: gate.coverage.lessons.total, workedExamples: gate.coverage.examples.worked, counterexamples: gate.coverage.examples.counterexample, exercises: gate.coverage.exercises.total, diagnostics: gate.coverage.diagnostics.total, visuals: gate.coverage.visuals.published }, audits: Object.fromEntries(Object.entries(gate.gates).map(([name, pass]) => [name, pass ? "pass" : "fail"])), counts: { claims: gate.coverage.claims.total, evidenceItems: dataset.evidenceItems.length, examples: gate.coverage.examples.total, exercises: gate.coverage.exercises.total, diagnostics: gate.coverage.diagnostics.total, misconceptions: gate.coverage.misconceptions.total, visuals: gate.coverage.visuals.total } };
await writeFile(path.join(dist, "build-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
await writeFile(path.join(root, "_working", "basis", "build-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(`Built ${concepts.length + 3} HTML pages in ${path.relative(root, site)}/ and published to ${path.relative(root, dist)}/`);
