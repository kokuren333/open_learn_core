import test from "node:test";
import assert from "node:assert/strict";
import { loadDomain } from "../../core/src/domain/load-domain.mjs";
import { validateDomain } from "../../core/src/domain/validate-domain.mjs";
import { renderCoreConcept } from "../../core/src/renderer/render.mjs";
import { renderRichText } from "../../core/src/renderer/rich-text.mjs";

const root = process.cwd();

test("Basis is backed by a first-class Gold Learning Experience", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const validation = await validateDomain(domain);
  assert.equal(validation.valid, true, validation.issues.join("\n"));
  const experience = domain.learningExperiences.find((item) => item.concept_id === "basis");
  assert.equal(experience?.editorial_status, "gold");
  assert.equal(experience.sequence.length, 21);
  assert.equal(experience.learner_sections.length, 6);
  assert.equal(new Set(experience.learner_sections.flatMap((section) => section.block_ids)).size, 21);
  assert.equal(experience.lesson_content.length, 21);
  assert.ok(experience.lesson_content.every((lesson) => lesson.body.length >= 80));
  assert.ok(experience.sequence.every((block, index) => block.internal_block_dependencies.every((dependency) => dependency === experience.sequence[index - 1]?.id)));
  assert.ok(experience.sequence.every((block) => !block.external_prerequisite_concept_ids.includes("basis")));
  for (const type of ["hook", "concrete_problem", "learner_prediction", "formalization", "worked_example", "misconception_challenge", "independent_practice", "representation", "transfer", "synthesis"]) assert.ok(experience.sequence.some((block) => block.type === type), type);
  assert.equal(experience.sequence.filter((block) => block.type === "worked_example").length, 3);
  assert.ok(!JSON.stringify(experience).toLowerCase().includes("determinant"));
  assert.equal(experience.sequence.find((block) => block.id === "basis-worked-coordinates").representation, "平面ベクトル・非標準座標");
  assert.ok(experience.sequence.filter((block) => block.type === "worked_example").every((block) => block.worked_example.reasoning_steps.length >= 3));
  assert.ok(experience.sequence.filter((block) => block.type === "misconception_challenge").every((block) => Object.values(block.misconception_challenge).every((value) => typeof value === "string" && value.length > 0)));
  const assessed = new Set(experience.assessments.flatMap((item) => item.tests_learning_outcome_ids));
  for (const outcome of domain.coreConcepts.find((concept) => concept.id === "basis").learning_contract.learning_outcome_ids) assert.ok(assessed.has(outcome), outcome);
});

test("Basis renderer separates learner content from author metadata", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const concept = domain.coreConcepts.find((item) => item.id === "basis");
  const experience = domain.learningExperiences.find((item) => item.concept_id === "basis");
  const html = renderCoreConcept({ concept, experience, conceptsById: new Map(domain.coreConcepts.map((item) => [item.id, item])) });
  assert.equal((html.match(/class="learner-block"/g) ?? []).length, 21);
  assert.equal((html.match(/class="learner-section"/g) ?? []).length, 6);
  assert.match(html, /LEARNING PATH/);
  assert.doesNotMatch(html, /少し考えてみる/);
  assert.match(html, /考えてみよう/);
  assert.match(html, /ヒント：/);
  assert.match(html, /解法と理由を見る/);
  assert.match(html, /class="desktop-toc"/);
  assert.match(html, /class="mobile-toc"/);
  assert.match(html, /class="katex/);
  assert.doesNotMatch(html, /設計上のねらい|learner_state_before|internal dependencies|generated_from/);
  assert.doesNotMatch(html, /data-learning-block-type/);
  assert.doesNotMatch(html, /式で確認/);
  assert.match(html, /よくある勘違いを見る/);
  assert.match(html, /CHECK YOUR UNDERSTANDING/);
});

test("learner rich text renders math and lightweight callouts", () => {
  const html = renderRichText("係数 $a,b$ を使う。\n\n:::note\nここだけ覚えよう。\n:::");
  assert.match(html, /class="katex/);
  assert.match(html, /rich-callout-note/);
  assert.match(html, /ここだけ覚えよう/);
});
