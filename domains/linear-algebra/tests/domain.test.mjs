import test from "node:test";
import assert from "node:assert/strict";
import { loadDomain } from "../../../core/src/domain/load-domain.mjs";
import { validateDomain } from "../../../core/src/domain/validate-domain.mjs";

const repoRoot = process.cwd();

test("linear algebra domain manifest and content load through the core loader", async () => {
  const domain = await loadDomain(repoRoot, "linear-algebra");
  const result = await validateDomain(domain);
  assert.equal(result.valid, true, result.issues.join("\n"));
  assert.equal(domain.manifest.id, "linear-algebra");
  assert.equal(domain.dataset.concepts.length, 12);
  assert.ok(domain.dataset.visuals.length >= 3);
});

test("flagship concept stays inside the domain package", async () => {
  const domain = await loadDomain(repoRoot, "linear-algebra");
  assert.ok(domain.dataset.concepts.some((record) => record.value.id === "basis"));
  assert.equal(domain.manifest.quality_gate_concepts[0], "basis");
});
