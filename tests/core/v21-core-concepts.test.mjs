import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadDomain } from "../../core/src/domain/load-domain.mjs";
import { validateDomain } from "../../core/src/domain/validate-domain.mjs";
import { renderIndex } from "../../core/src/renderer/render.mjs";

const root = process.cwd();

test("v2.2 exposes exactly 30 learner-facing Core Concepts while retaining legacy sources", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const validation = await validateDomain(domain);
  assert.equal(validation.valid, true, validation.issues.join("\n"));
  assert.equal(domain.coreConcepts.length, 30);
  assert.equal(domain.manifest.core_concepts.length, 30);
  assert.equal(domain.dataset.concepts.length, 57);
  const html = renderIndex({ concepts: domain.dataset.concepts.map((record) => record.value), coreConcepts: domain.coreConcepts, conceptsById: new Map(domain.coreConcepts.map((concept) => [concept.id, concept])), curricula: [], domainTitle: domain.manifest.title });
  assert.equal((html.match(/class="concept-card"/g) ?? []).length, 30);
  assert.match(html, /CORE CONCEPTS \/ V2\.2\.0/);
  assert.doesNotMatch(html, /connected concepts/);
});

test("29 and 31 Core Concept inventories are rejected", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  for (const count of [29, 31]) {
    const coreConcepts = count === 29 ? domain.coreConcepts.slice(0, 29) : [...domain.coreConcepts, { ...domain.coreConcepts[0], id: "extra-core-concept" }];
    const altered = { ...domain, coreConcepts, manifest: { ...domain.manifest, core_concepts: coreConcepts.map((concept) => concept.id) } };
    const result = await validateDomain(altered);
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue) => issue.includes("exactly 30 Core Concepts")));
  }
});

test("Basis Gold page has an inspectable connected learning flow", async () => {
  const content = JSON.parse(await readFile("domains/linear-algebra/data/core-content/core-content.json", "utf8"));
  const basis = content.concepts.find((concept) => concept.core_concept === "basis");
  assert.equal(basis.editorial_status, "gold");
  assert.ok(basis.sections.length >= 15);
  for (const kind of ["motivation", "definition", "contrast", "worked-example", "practice", "synthesis"]) assert.ok(basis.sections.some((section) => section.kind === kind), kind);
});
