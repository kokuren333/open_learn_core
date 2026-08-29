import test from "node:test";
import assert from "node:assert/strict";
import { loadDomain } from "../../../core/src/domain/load-domain.mjs";
import { validateDomain } from "../../../core/src/domain/validate-domain.mjs";

const repoRoot = process.cwd();

test("statistics keeps an exact-30 scaffold until complete media assets exist", async () => {
  const domain = await loadDomain(repoRoot, "statistics");
  const result = await validateDomain(domain);
  assert.equal(result.valid, true, result.issues.join("\n"));
  assert.equal(domain.coreConcepts.length, 30);
  assert.equal(new Set(domain.coreConcepts.map((concept) => concept.id)).size, 30);
  assert.equal(domain.coreConcepts.filter((concept) => concept.editorial_status === "gold").length, 0);
  assert.equal(domain.coreConcepts.filter((concept) => concept.editorial_status === "scaffold").length, 30);
  assert.equal(domain.learningExperiences.length, 0);
  assert.equal(domain.dataset.curricula[0].value.sequence.length, 30);
});
