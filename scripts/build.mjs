import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadAllDomains, loadDomain } from "../core/src/domain/load-domain.mjs";
import { validateDomain } from "../core/src/domain/validate-domain.mjs";
import { renderConcept, renderCurriculum, renderGraph, renderIndex } from "../core/src/renderer/render.mjs";
import { runAudits } from "./run-audits.mjs";
import { evaluatePublishGate } from "../core/src/quality/publish-gate.mjs";

const root = process.cwd();
const requested = process.argv[2];
const domains = requested && requested !== "all" ? [await loadDomain(root, requested)] : await loadAllDomains(root);
const dist = path.join(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const portalEntries = [];
for (const domain of domains) {
  const domainCheck = await validateDomain(domain);
  if (!domainCheck.valid) {
    console.error(`Cannot build domain '${domain.id}':\n${domainCheck.issues.map((issue) => `- ${issue}`).join("\n")}`);
    process.exit(1);
  }
  const validation = domainCheck.datasetValidation;
  const dataset = domain.dataset;
  const conceptId = process.argv[3] ?? domain.manifest.quality_gate_concepts?.[0] ?? domain.manifest.entry_concepts?.[0] ?? dataset.concepts[0]?.value?.id;
  await runAudits(root, conceptId, dataset, validation, domain.root);
  const auditDir = path.join(domain.root, "working", conceptId, "audit");
  const gate = await evaluatePublishGate({ dataset, validation, conceptId, auditDir });
  if (!gate.allowed) {
    console.error(`Publish gate blocked for '${domain.id}': ${gate.issues.join("; ")}`);
    process.exit(1);
  }
  const publishPath = domain.manifest.publish.path || domain.id;
  const output = path.join(dist, "domains", publishPath);
  await mkdir(path.join(output, "concepts"), { recursive: true });
  const concepts = dataset.concepts.map((record) => record.value);
  const conceptsById = validation.conceptsById;
  const sourceById = validation.sourceById;
  const evidenceById = validation.evidenceById;
  const visualsById = validation.visualsById;
  await writeFile(path.join(output, "index.html"), renderIndex({ concepts, conceptsById, curricula: dataset.curricula, domainTitle: domain.manifest.title }), "utf8");
  await writeFile(path.join(output, "graph.html"), renderGraph({ concepts, conceptsById, curricula: dataset.curricula }), "utf8");
  for (const concept of concepts) await writeFile(path.join(output, "concepts", `${concept.id}.html`), renderConcept({ concept, conceptsById, sourceById, evidenceById, visualsById }), "utf8");
  if (dataset.curricula[0]?.value) await writeFile(path.join(output, "curriculum.html"), renderCurriculum({ curriculum: dataset.curricula[0].value, conceptsById, sourceById, evidenceById, decisions: dataset.curriculumDecisions.map((record) => record.value) }), "utf8");
  await writeFile(path.join(output, "styles.css"), await readFile(path.join(root, "core", "src", "renderer", "styles.css"), "utf8"), "utf8");
  await writeFile(path.join(output, ".nojekyll"), "", "utf8");
  await mkdir(path.join(output, "assets"), { recursive: true });
  await cp(domain.assetRoot, path.join(output, "assets"), { recursive: true, force: true });
  const manifest = { ...domain.manifest, url: `/domains/${publishPath}/`, curricula: dataset.curricula.map((record) => ({ id: record.value.id, title: record.value.title })), conceptCount: concepts.length };
  await writeFile(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  const report = { concept: conceptId, domain: domain.id, version: "1.8", status: gate.status, semanticAudits: Object.fromEntries(Object.entries(gate.computedAudits).map(([name, result]) => [name, result.status])), content: { concepts: concepts.length, lessons: gate.coverage.lessons.total, workedExamples: gate.coverage.examples.worked, counterexamples: gate.coverage.examples.counterexample, exercises: gate.coverage.exercises.total, diagnostics: gate.coverage.diagnostics.total, visuals: gate.coverage.visuals.published }, audits: Object.fromEntries(Object.entries(gate.gates).map(([name, pass]) => [name, pass ? "pass" : "fail"])), counts: { claims: gate.coverage.claims.total, evidenceItems: dataset.evidenceItems.length, examples: gate.coverage.examples.total, exercises: gate.coverage.exercises.total, diagnostics: gate.coverage.diagnostics.total, misconceptions: gate.coverage.misconceptions.total, visuals: gate.coverage.visuals.total } };
  await writeFile(path.join(output, "build-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  await writeFile(path.join(domain.root, "working", conceptId, "build-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  portalEntries.push({ id: domain.id, title: domain.manifest.title, description: domain.manifest.description, url: `/domains/${publishPath}/`, curricula: manifest.curricula, conceptCount: concepts.length, status: domain.manifest.status });
}

const esc = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const cards = portalEntries.map((entry) => `<article><p class="eyebrow">${esc(entry.id)}</p><h2><a href="${esc(entry.url)}">${esc(entry.title?.ja ?? entry.id)}</a></h2><p>${esc(entry.description?.ja ?? "")}</p><span>${entry.conceptCount} concepts · ${esc(entry.status)}</span></article>`).join("");
await writeFile(path.join(dist, "index.html"), `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Open Learn Core</title><style>body{font-family:system-ui,sans-serif;max-width:960px;margin:0 auto;padding:5rem 1.5rem;background:#f7f8f3;color:#18231f}h1{font-size:clamp(2.5rem,7vw,5rem)}main{display:grid;gap:1rem}article{padding:1.5rem;border:1px solid #dfe5dd;border-radius:1rem;background:#fff}a{color:#1e5b45}span,.eyebrow{color:#68736d;font-size:.85rem}</style></head><body><header><p class="eyebrow">OPEN LEARN CORE / DOMAIN PORTAL</p><h1>学びを、Domainから。</h1><p>共通Core上で公開されている教材Domain一覧です。</p></header><main>${cards}</main></body></html>`, "utf8");
await writeFile(path.join(dist, "domain-index.json"), JSON.stringify({ version: "1.0", generated_by: "open-learn-core", domains: portalEntries }, null, 2) + "\n", "utf8");
console.log(`Built ${portalEntries.length} domain(s) into ${path.relative(root, dist)}/`);
