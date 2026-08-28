import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { loadDomain } from "../../core/src/domain/load-domain.mjs";
import { validateDomain } from "../../core/src/domain/validate-domain.mjs";
import { renderCoreConcept } from "../../core/src/renderer/render.mjs";

const root = process.cwd();
const exec = promisify(execFile);

test("Basis resources expose claim mapping, further learning, media and output states", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const resources = domain.conceptResources.find((item) => item.concept_id === "basis");
  assert.ok(resources);
  assert.equal(resources.further_learning.length, 3);
  assert.deepEqual(resources.claims.map((claim) => claim.id), ["basis-definition", "basis-linear-independence", "basis-span", "basis-coordinates"]);
  assert.ok(resources.claims.every((claim) => claim.evidence_ids?.length));
  assert.ok(resources.representations.some((item) => item.type === "diagram"));
  assert.ok(resources.representations.some((item) => item.visual_id === "visual-basis-linear-combination"));
  assert.equal(resources.visual_plan.preferred_representation.type, "mixed");
  assert.equal(resources.video_plan.status, "scripted");
  assert.equal(resources.outputs.pdf, "ready");
  assert.equal((await validateDomain(domain)).valid, true);
});

test("Basis learner page renders citations, inline figures and optional resource links", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const concept = domain.coreConcepts.find((item) => item.id === "basis");
  const experience = domain.learningExperiences.find((item) => item.concept_id === "basis");
  const html = renderCoreConcept({ concept, experience, resources: domain.conceptResources[0], conceptsById: new Map(domain.coreConcepts.map((item) => [item.id, item])), sourceById: new Map(domain.dataset.sources.map((item) => [item.id, item])), visualsById: new Map(domain.dataset.visuals.map((record) => [record.value.id, record.value])) });
  assert.match(html, /class="citation"/);
  assert.equal((html.match(/class="learner-figure"/g) ?? []).length, 4);
  assert.match(html, /id="learner-further"/);
  assert.match(html, /id="learner-references"/);
  assert.match(html, /pdf\/basis\.pdf/);
  assert.doesNotMatch(html, /learner_state_before|generated_from|internal_block_dependencies/);
});

test("resource validation catches a broken source reference", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const broken = structuredClone(domain);
  broken.conceptResources[0].claims[0].source_refs[0].source_id = "missing-source";
  const validation = await validateDomain(broken);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((issue) => issue.includes("unknown source 'missing-source'")));
});

test("resource validation catches invalid media type and missing visual", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const broken = structuredClone(domain);
  broken.conceptResources[0].representations[0].type = "animation";
  broken.conceptResources[0].representations[1].visual_id = "missing-visual";
  const validation = await validateDomain(broken);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((issue) => issue.includes("must be one of text, diagram")));
  assert.ok(validation.issues.some((issue) => issue.includes("unknown visual 'missing-visual'")));
});

test("Basis concept PDF is generated from the learner content adapter", { timeout: 120000 }, async () => {
  await exec(process.execPath, ["scripts/build-pdf-concept.mjs", "linear-algebra", "basis"], { cwd: root });
  await access(`${root}/dist/domains/linear-algebra/pdf/basis.pdf`);
});
