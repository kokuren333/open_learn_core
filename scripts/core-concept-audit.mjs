import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDomain } from "../core/src/domain/load-domain.mjs";

const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
const domain = await loadDomain(root, domainId);
const concepts = domain.coreConcepts ?? [];
const issues = [];
const warnings = [];
const requiredPatterns = new Set(["concrete_object", "structural_definition", "abstraction", "procedure", "transformation_process", "invariant_quantity", "relationship_theorem", "representation", "optimization_approximation"]);
if (concepts.length !== 30) issues.push(`public Core Concept inventory must contain exactly 30 items (found ${concepts.length})`);
if (new Set(concepts.map((concept) => concept.id)).size !== concepts.length) issues.push("Core Concept IDs must be unique");
for (const concept of concepts) {
  if (!requiredPatterns.has(concept.pedagogical_plan?.pattern)) issues.push(`${concept.id}: unknown cognitive pattern`);
  if (concept.pedagogical_plan?.pattern !== concept.cognitive_types?.[0]) issues.push(`${concept.id}: pedagogical pattern does not match primary cognitive type`);
  if ((concept.pedagogical_plan?.stages?.length ?? 0) < 5) issues.push(`${concept.id}: cognitive pattern has fewer than five stages`);
  const elements = concept.learning_contract?.required_learning_elements;
  for (const key of ["motivating_problem", "intuition", "formalization", "positive_examples", "contrasting_nonexamples", "worked_examples", "learner_predictions", "misconceptions", "synthesis"]) if (!Number.isInteger(elements?.[key]) || elements[key] < 1) issues.push(`${concept.id}: semantic learning element '${key}' is missing`);
  if (!elements?.practice || Object.values(elements.practice).some((value) => !Number.isInteger(value) || value < 1)) issues.push(`${concept.id}: practice contract is incomplete`);
  if ((concept.central_mental_model?.length ?? 0) < 30) issues.push(`${concept.id}: central mental model is too short`);
  if ((concept.representations?.length ?? 0) < 2) issues.push(`${concept.id}: representation coverage is too narrow`);
  if ((concept.misconceptions?.length ?? 0) < 3) issues.push(`${concept.id}: misconception coverage is too narrow`);
}
const models = concepts.map((concept) => concept.central_mental_model).map((value) => value?.replace(/\s+/g, "").toLowerCase()).filter(Boolean);
if (new Set(models).size !== models.length) issues.push("AI slop audit: duplicate central mental models detected");
const basis = concepts.find((concept) => concept.id === "basis");
if (basis?.editorial_status !== "gold") issues.push("Basis must be the first Gold Concept");
let basisContent = null;
try {
  basisContent = JSON.parse(await readFile(path.join(domain.root, "data", "core-content", "core-content.json"), "utf8")).concepts?.find((item) => item.core_concept === "basis");
} catch { issues.push("Basis Gold content file is missing or invalid"); }
const sectionKinds = new Set((basisContent?.sections ?? []).map((section) => section.kind));
for (const kind of ["motivation", "intuition", "definition", "contrast", "worked-example", "representation", "nonexample", "misconception", "checkpoint", "procedure", "transfer", "application", "practice", "synthesis"]) if (!sectionKinds.has(kind)) issues.push(`Basis Gold is missing required section kind '${kind}'`);
if ((basisContent?.sections?.length ?? 0) < 15) issues.push("Basis Gold must contain at least 15 connected learning sections");
const report = { schema_version: "2.4", domain: domainId, review_type: "automated_semantic_review", independent_review: false, status: issues.length ? "fail" : "pass", summary: { core_concepts: concepts.length, gold: concepts.filter((concept) => concept.editorial_status === "gold").length, scaffold: concepts.filter((concept) => concept.editorial_status === "scaffold").length, basis_sections: basisContent?.sections?.length ?? 0, legacy_concepts: domain.dataset.concepts?.length ?? 0 }, audits: { exact_30: concepts.length === 30, cognitive_pattern: issues.filter((issue) => issue.includes("pattern")).length === 0, semantic_coverage: issues.filter((issue) => issue.includes("learning element") || issue.includes("practice contract") || issue.includes("Basis Gold")).length === 0, ai_slop: issues.filter((issue) => issue.includes("AI slop") || issue.includes("mental models")).length === 0, migration_traceability: concepts.every((concept) => concept.source_concept_ids?.length >= 1) }, issues, warnings };
const outDir = path.join(domain.root, "working", "core-concepts", "audit");
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "core-concept.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(JSON.stringify(report, null, 2));
if (issues.length) process.exitCode = 1;
