import test from "node:test";
import assert from "node:assert/strict";
import { loadDomain } from "../../core/src/domain/load-domain.mjs";
import { validateDomain } from "../../core/src/domain/validate-domain.mjs";
import { renderCoreConcept } from "../../core/src/renderer/render.mjs";

const root = process.cwd();

test("Basis is backed by a first-class Gold Learning Experience", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const validation = await validateDomain(domain);
  assert.equal(validation.valid, true, validation.issues.join("\n"));
  const experience = domain.learningExperiences.find((item) => item.concept_id === "basis");
  assert.equal(experience?.editorial_status, "gold");
  assert.equal(experience.sequence.length, 21);
  for (const type of ["hook", "concrete_problem", "learner_prediction", "formalization", "worked_example", "misconception_challenge", "independent_practice", "representation", "transfer", "synthesis"]) assert.ok(experience.sequence.some((block) => block.type === type), type);
  assert.equal(experience.sequence.filter((block) => block.type === "worked_example").length, 3);
  assert.ok(experience.sequence.filter((block) => block.type === "worked_example").every((block) => block.worked_example.reasoning_steps.length >= 3));
  assert.ok(experience.sequence.filter((block) => block.type === "misconception_challenge").every((block) => Object.values(block.misconception_challenge).every((value) => typeof value === "string" && value.length > 0)));
  const assessed = new Set(experience.assessments.flatMap((item) => item.tests_learning_outcome_ids));
  for (const outcome of domain.coreConcepts.find((concept) => concept.id === "basis").learning_contract.learning_outcome_ids) assert.ok(assessed.has(outcome), outcome);
});

test("Basis renderer exposes interaction type and block metadata", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const concept = domain.coreConcepts.find((item) => item.id === "basis");
  const experience = domain.learningExperiences.find((item) => item.concept_id === "basis");
  const html = renderCoreConcept({ concept, experience, conceptsById: new Map(domain.coreConcepts.map((item) => [item.id, item])) });
  assert.equal((html.match(/class="learning-block /g) ?? []).length, 21);
  assert.match(html, /data-learning-block-type="worked_example"/);
  assert.match(html, /推論ステップ/);
  assert.match(html, /誤解をほどく/);
  assert.match(html, /このブロックの設計情報/);
  assert.match(html, /ASSESSMENT \/ 8 ITEMS/);
});
