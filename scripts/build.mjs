import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { loadAllDomains, loadDomain } from "../core/src/domain/load-domain.mjs";
import { validateDomain } from "../core/src/domain/validate-domain.mjs";
import { renderConcept, renderCoreConcept, renderCurriculum, renderGraph, renderIndex } from "../core/src/renderer/render.mjs";
import { renderCourse, renderModule, renderReview, renderUnit } from "../core/src/renderer/course-render.mjs";
import { auditCourse } from "../core/src/course/audit.mjs";
import { runAudits } from "./run-audits.mjs";
import { evaluatePublishGate } from "../core/src/quality/publish-gate.mjs";

const root = process.cwd();
const exec = promisify(execFile);
const requested = process.argv[2];
async function currentSourceCommit() {
  if (process.env.SOURCE_COMMIT) return process.env.SOURCE_COMMIT;
  try { return (await exec("git", ["rev-parse", "HEAD"], { cwd: root })).stdout.trim(); } catch { return "working-tree"; }
}
const sourceCommit = await currentSourceCommit();
async function readVideoPublication(domainRoot, unitId) {
  try { return JSON.parse(await readFile(path.join(domainRoot, "video", "units", unitId, "youtube.yaml"), "utf8")); } catch { return null; }
}
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
  const coreConcepts = domain.coreConcepts ?? [];
  const conceptsById = validation.conceptsById;
  const coreConceptsById = new Map(coreConcepts.map((concept) => [concept.id, concept]));
  const sourceById = validation.sourceById;
  const evidenceById = validation.evidenceById;
  const visualsById = validation.visualsById;
  const courseData = domain.courseData;
  const learningExperienceByConcept = new Map((domain.learningExperiences ?? []).map((experience) => [experience.concept_id, experience]));
  const coreCurriculum = dataset.curricula[0]?.value ? { ...dataset.curricula[0].value, sequence: coreConcepts.map((concept) => concept.id), title: { ja: "線形代数 Core Concept 30", en: "Linear Algebra Core Concepts 30" }, description: "学習者向けに30件へ圧縮した線形代数の中心概念マップ。" } : null;
  await writeFile(path.join(output, "index.html"), renderIndex({ concepts, coreConcepts, conceptsById: coreConceptsById, curricula: coreCurriculum ? [{ value: coreCurriculum }] : [], domainTitle: domain.manifest.title, course: dataset.courses?.[0]?.value, courseUnits: courseData.units.map((record) => record.value) }), "utf8");
  await writeFile(path.join(output, "graph.html"), renderGraph({ concepts: coreConcepts, conceptsById: coreConceptsById, curricula: coreCurriculum ? [{ value: coreCurriculum }] : [] }), "utf8");
  const resourcesByConcept = new Map((domain.conceptResources ?? []).map((resources) => [resources.concept_id, resources]));
  for (const concept of coreConcepts) await writeFile(path.join(output, "concepts", `${concept.id}.html`), renderCoreConcept({ concept, conceptsById: coreConceptsById, experience: learningExperienceByConcept.get(concept.id), resources: resourcesByConcept.get(concept.id), sourceById, visualsById }), "utf8");
  if (coreCurriculum) await writeFile(path.join(output, "curriculum.html"), renderCurriculum({ curriculum: coreCurriculum, conceptsById: coreConceptsById, sourceById, evidenceById, decisions: dataset.curriculumDecisions.map((record) => record.value) }), "utf8");
  const rendererCss = await readFile(path.join(root, "core", "src", "renderer", "styles.css"), "utf8");
  const katexCss = await readFile(path.join(root, "node_modules", "katex", "dist", "katex.min.css"), "utf8");
  await writeFile(path.join(output, "styles.css"), `${rendererCss.trimEnd()}\n${katexCss.trim()}\n`, "utf8");
  await cp(path.join(root, "node_modules", "katex", "dist", "fonts"), path.join(output, "fonts"), { recursive: true, force: true });
  const course = dataset.courses?.[0]?.value;
  if (course) {
    const modules = courseData.modules.map((record) => record.value).sort((a, b) => a.order - b.order);
    const units = courseData.units.map((record) => record.value);
    await mkdir(path.join(output, "modules"), { recursive: true });
    await mkdir(path.join(output, "units"), { recursive: true });
    await mkdir(path.join(output, "reviews"), { recursive: true });
    await mkdir(path.join(output, "exercises"), { recursive: true });
    const videoUnitIds = await (async () => { try { return (await readdir(path.join(domain.root, "video", "units"), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort(); } catch { return []; } })();
    const courseAudit = auditCourse({ course, modules, units, videoUnitIds, moduleExerciseSets: courseData.moduleExercises.map((record) => record.value), cumulativeReviews: courseData.cumulativeReviews.map((record) => record.value), notationAvailable: true });
    if (courseAudit.status === "fail") {
      console.error(`Course completeness gate blocked '${domain.id}':\n${courseAudit.issues.map((item) => `- ${item.problem}`).join("\n")}`);
      process.exit(1);
    }
    await mkdir(path.join(output, "audit"), { recursive: true });
    await writeFile(path.join(output, "audit", "course.json"), JSON.stringify(courseAudit, null, 2) + "\n", "utf8");
    await writeFile(path.join(output, "course.html"), renderCourse({ course, modules, units }), "utf8");
    for (const module of modules) {
      const moduleUnits = module.units.map((id) => units.find((unit) => unit.id === id)).filter(Boolean);
      const exerciseSets = (courseData.moduleExercises ?? []).map((record) => record.value).filter((set) => set.module === module.id);
      await writeFile(path.join(output, "modules", `${module.id}.html`), renderModule({ module, course, units: moduleUnits, exerciseSets }), "utf8");
      await writeFile(path.join(output, "exercises", `${module.id}.html`), renderModule({ module, course, units: moduleUnits, exerciseSets }), "utf8");
    }
    for (const unit of units) {
      const module = modules.find((item) => item.id === unit.module);
      const relatedIds = [...new Set([...(unit.concepts?.primary ?? []), ...(unit.concepts?.supporting ?? [])])];
      const publicCoreIdBySourceId = new Map(coreConcepts.flatMap((concept) => (concept.source_concept_ids ?? []).map((sourceId) => [sourceId, concept.id])));
      const relatedConcepts = relatedIds.map((id) => coreConceptsById.get(id) ?? coreConceptsById.get(publicCoreIdBySourceId.get(id))).filter(Boolean);
      const publication = await readVideoPublication(domain.root, unit.id);
      await writeFile(path.join(output, "units", `${unit.id}.html`), renderUnit({ unit, module, course, units, relatedConcepts, video: publication?.status === "published" ? publication : null }), "utf8");
    }
    for (const review of courseData.cumulativeReviews.map((record) => record.value)) await writeFile(path.join(output, "reviews", `${review.id}.html`), renderReview({ review, exerciseSets: courseData.moduleExercises.map((record) => record.value) }), "utf8");
    await exec(process.execPath, [path.join(root, "scripts", "build-video-index.mjs"), domain.id], { cwd: root });
  }
  await writeFile(path.join(output, ".nojekyll"), "", "utf8");
  await mkdir(path.join(output, "assets"), { recursive: true });
  await cp(domain.assetRoot, path.join(output, "assets"), { recursive: true, force: true });
  for (const resources of domain.conceptResources ?? []) {
    if (!(resources.representations ?? []).some((item) => item.type === "pdf")) continue;
    try { await exec(process.execPath, [path.join(root, "scripts", "build-pdf-concept.mjs"), domain.id, resources.concept_id], { cwd: root }); }
    catch (error) { console.warn(`Concept PDF generation skipped for '${resources.concept_id}': ${error.message}`); }
  }
  for (const resources of domain.conceptResources ?? []) {
    if (!resources.video_plan?.unit_id) continue;
    try { await exec(process.execPath, [path.join(root, "scripts", "video-prepare.mjs"), domain.id, resources.video_plan.unit_id], { cwd: root }); }
    catch (error) { console.warn(`Video preparation skipped for '${resources.concept_id}': ${error.message}`); }
  }
  const manifest = { ...domain.manifest, url: `/domains/${publishPath}/`, course_id: course?.id, curricula: coreCurriculum ? [{ id: coreCurriculum.id, title: coreCurriculum.title }] : dataset.curricula.map((record) => ({ id: record.value.id, title: record.value.title })), conceptCount: coreConcepts.length || concepts.length, legacyConceptCount: concepts.length, coreConcepts: coreConcepts.map((concept) => concept.id), learningExperiences: [...learningExperienceByConcept.values()].map((experience) => ({ id: experience.id, concept_id: experience.concept_id, status: experience.editorial_status, block_count: experience.sequence.length, assessment_count: experience.assessments.length })), conceptResources: (domain.conceptResources ?? []).map((resources) => ({ concept_id: resources.concept_id, outputs: resources.outputs, representation_ids: resources.representations.map((item) => item.id) })), courseVersion: course?.version ?? "2.2.0", source_commit: sourceCommit, license: course?.license ?? { code: "MIT", content: "CC BY-SA 4.0" }, asset_base_url: process.env.ASSET_BASE_URL ?? "" };
  await writeFile(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  const report = { release_version: "2.5.0", concept: conceptId, domain: domain.id, version: "2.5.0", status: gate.status, course_status: course?.status ?? "unknown", semanticAudits: Object.fromEntries(Object.entries(gate.computedAudits).map(([name, result]) => [name, result.status])), content: { concepts: coreConcepts.length || concepts.length, legacyConcepts: concepts.length, learningExperiences: learningExperienceByConcept.size, lessonContentBlocks: [...learningExperienceByConcept.values()].reduce((sum, experience) => sum + experience.lesson_content.length, 0), modules: course?.modules?.length ?? 0, units: course?.units?.length ?? 0, lessons: gate.coverage.lessons.total, workedExamples: gate.coverage.examples.worked, counterexamples: gate.coverage.examples.counterexample, exercises: course?.units?.length ? courseData.units.reduce((sum, record) => sum + record.value.exercises.length, 0) : gate.coverage.exercises.total, solutions: course?.units?.length ? courseData.units.reduce((sum, record) => sum + record.value.exercises.filter((exercise) => exercise.solution).length, 0) : 0, cumulativeReviews: courseData?.cumulativeReviews?.length ?? 0, diagnostics: gate.coverage.diagnostics.total, visuals: gate.coverage.visuals.published }, audits: Object.fromEntries(Object.entries(gate.gates).map(([name, pass]) => [name, pass ? "pass" : "fail"])), counts: { claims: gate.coverage.claims.total, evidenceItems: dataset.evidenceItems.length, examples: gate.coverage.examples.total, exercises: gate.coverage.exercises.total, diagnostics: gate.coverage.diagnostics.total, misconceptions: gate.coverage.misconceptions.total, visuals: gate.coverage.visuals.total } };
  await writeFile(path.join(output, "build-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  await writeFile(path.join(domain.root, "working", conceptId, "build-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  portalEntries.push({ id: domain.id, title: domain.manifest.title, description: domain.manifest.description, url: `/domains/${publishPath}/`, curricula: manifest.curricula, conceptCount: concepts.length, status: domain.manifest.status });
}

const esc = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const cards = portalEntries.map((entry) => `<article><p class="eyebrow">${esc(entry.id)}</p><h2><a href="${esc(entry.url)}">${esc(entry.title?.ja ?? entry.id)}</a></h2><p>${esc(entry.description?.ja ?? "")}</p><span>${entry.conceptCount} concepts · ${esc(entry.status)}</span></article>`).join("");
await writeFile(path.join(dist, "index.html"), `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Open Learn Core</title><style>body{font-family:system-ui,sans-serif;max-width:960px;margin:0 auto;padding:5rem 1.5rem;background:#f7f8f3;color:#18231f}h1{font-size:clamp(2.5rem,7vw,5rem)}main{display:grid;gap:1rem}article{padding:1.5rem;border:1px solid #dfe5dd;border-radius:1rem;background:#fff}a{color:#1e5b45}span,.eyebrow{color:#68736d;font-size:.85rem}</style></head><body><header><p class="eyebrow">OPEN LEARN CORE / DOMAIN PORTAL</p><h1>学びを、Domainから。</h1><p>共通Core上で公開されている教材Domain一覧です。</p></header><main>${cards}</main></body></html>`, "utf8");
await writeFile(path.join(dist, "domain-index.json"), JSON.stringify({ version: "1.0", generated_by: "open-learn-core", domains: portalEntries }, null, 2) + "\n", "utf8");
console.log(`Built ${portalEntries.length} domain(s) into ${path.relative(root, dist)}/`);
