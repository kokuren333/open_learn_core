import test from "node:test";
import assert from "node:assert/strict";
import { loadDomain } from "../../core/src/domain/load-domain.mjs";
import { validateConcept, validateDataset } from "../../core/src/validation/index.mjs";
import { evidenceCoverage } from "../../core/src/evidence/coverage.mjs";

const projectRoot = process.cwd();
const loadDataset = async () => (await loadDomain(projectRoot, "linear-algebra")).dataset;

test("valid dataset passes schema and reference validation", async () => {
  const result = await validateDataset(await loadDataset());
  assert.equal(result.valid, true, result.issues.join("\n"));
  assert.ok(result.conceptsById.size >= 12);
  assert.ok([...result.conceptsById.values()].every((concept) => concept.lessons.length > 0 && concept.claims.length > 0));
  assert.equal(result.evidenceById.size, 7);
  assert.equal(evidenceCoverage(await loadDataset(), result, "basis").claims.withEvidence, 6);
});

test("invalid concept fails schema validation", async () => {
  const issues = await validateConcept({ id: "Bad ID" }, `${projectRoot}/core`);
  assert.ok(issues.some((issue) => issue.includes("is required")));
  assert.ok(issues.some((issue) => issue.includes("does not match")));
});

test("broken prerequisite is detected", async () => {
  const dataset = await loadDataset(projectRoot);
  dataset.concepts[0].value.prerequisites = ["does-not-exist"];
  const result = await validateDataset(dataset);
  assert.ok(result.issues.some((issue) => issue.includes("unknown concept reference 'does-not-exist'")));
});

test("prerequisite cycle is detected", async () => {
  const dataset = await loadDataset(projectRoot);
  const vector = dataset.concepts.find((record) => record.value.id === "vector");
  const scalar = dataset.concepts.find((record) => record.value.id === "scalar");
  scalar.value.prerequisites = ["vector"];
  vector.value.prerequisites = ["scalar"];
  const result = await validateDataset(dataset);
  assert.ok(result.issues.some((issue) => issue.includes("prerequisite cycle:") && issue.includes("scalar") && issue.includes("vector")));
});

test("curriculum references are validated", async () => {
  const dataset = await loadDataset(projectRoot);
  dataset.curricula[0].value.sequence.push("unknown-concept");
  const result = await validateDataset(dataset);
  assert.ok(result.issues.some((issue) => issue.includes("curriculum 'linear-algebra-basic': unknown concept reference 'unknown-concept'")));
});

test("lesson exercise references are validated", async () => {
  const dataset = await loadDataset(projectRoot);
  const basis = dataset.concepts.find((record) => record.value.id === "basis");
  basis.value.lessons[0].exerciseIds.push("missing-exercise");
  const result = await validateDataset(dataset);
  assert.ok(result.issues.some((issue) => issue.includes("unknown exercise reference 'missing-exercise'")));
});

test("claim-level source references are validated", async () => {
  const dataset = await loadDataset(projectRoot);
  const basis = dataset.concepts.find((record) => record.value.id === "basis");
  basis.value.claims[0].sourceRefs[0].source = "missing-source";
  const result = await validateDataset(dataset);
  assert.ok(result.issues.some((issue) => issue.includes("claim 'basis-claim-01': unknown source reference 'missing-source'")));
});

test("evidence item source and claim references are validated", async () => {
  const dataset = await loadDataset(projectRoot);
  dataset.evidenceItems[0].value.source = "missing-source";
  dataset.evidenceItems[0].value.supports = ["missing-claim"];
  const result = await validateDataset(dataset);
  assert.ok(result.issues.some((issue) => issue.includes("unknown source reference 'missing-source'")));
  assert.ok(result.issues.some((issue) => issue.includes("unknown claim reference 'missing-claim'")));
});

test("claim evidence references and claim types are validated", async () => {
  const dataset = await loadDataset(projectRoot);
  const basis = dataset.concepts.find((record) => record.value.id === "basis");
  basis.value.claims[0].evidence = ["missing-evidence"];
  basis.value.claims[0].claimType = "not-a-claim-type";
  const result = await validateDataset(dataset);
  assert.ok(result.issues.some((issue) => issue.includes("unknown evidence reference 'missing-evidence'")));
  assert.ok(result.issues.some((issue) => issue.includes("must be one of definition")));
});

test("prerequisite edges validate relation, concept, and evidence", async () => {
  const dataset = await loadDataset(projectRoot);
  const basis = dataset.concepts.find((record) => record.value.id === "basis");
  basis.value.prerequisiteEdges[0].relation = "optional";
  basis.value.prerequisiteEdges[0].concept = "missing-concept";
  basis.value.prerequisiteEdges[0].evidence = ["missing-evidence"];
  const result = await validateDataset(dataset);
  assert.ok(result.issues.some((issue) => issue.includes("must be one of required")));
  assert.ok(result.issues.some((issue) => issue.includes("unknown concept 'missing-concept'")));
  assert.ok(result.issues.some((issue) => issue.includes("unknown evidence reference 'missing-evidence'")));
});

test("curriculum decisions and evidence reviews validate targets", async () => {
  const dataset = await loadDataset(projectRoot);
  dataset.curriculumDecisions[0].value.scope.curriculum = "missing-curriculum";
  dataset.curriculumDecisions[0].value.evidence = ["missing-evidence"];
  dataset.evidenceReviews[0].value.included_sources[0].source = "missing-source";
  const result = await validateDataset(dataset);
  assert.ok(result.issues.some((issue) => issue.includes("unknown curriculum 'missing-curriculum'")));
  assert.ok(result.issues.some((issue) => issue.includes("unknown evidence reference 'missing-evidence'")));
  assert.ok(result.issues.some((issue) => issue.includes("unknown included source 'missing-source'")));
});

test("basis evidence coverage reaches the v1.6 threshold", async () => {
  const dataset = await loadDataset(projectRoot);
  const result = await validateDataset(dataset);
  const coverage = evidenceCoverage(dataset, result, "basis");
  assert.equal(coverage.claims.withEvidence, coverage.claims.total);
  assert.equal(coverage.prerequisiteEdges.withEvidence, coverage.prerequisiteEdges.total);
  assert.equal(coverage.curriculumDecisions.withEvidence, coverage.curriculumDecisions.total);
  assert.ok(coverage.lessons.linkedToClaims / coverage.lessons.total >= 0.8);
});
