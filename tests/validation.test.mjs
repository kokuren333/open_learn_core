import test from "node:test";
import assert from "node:assert/strict";
import { loadDataset, validateConcept, validateDataset } from "../src/validation/index.mjs";

const projectRoot = process.cwd();

test("valid dataset passes schema and reference validation", async () => {
  const result = await validateDataset(await loadDataset(projectRoot));
  assert.equal(result.valid, true, result.issues.join("\n"));
  assert.equal(result.conceptsById.size, 12);
});

test("invalid concept fails schema validation", async () => {
  const issues = await validateConcept({ id: "Bad ID" }, projectRoot);
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
