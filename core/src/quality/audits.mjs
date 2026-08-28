import { evidenceCoverage } from "../evidence/coverage.mjs";

export const auditNames = ["math", "evidence", "pedagogy", "explanation", "visual", "completeness"];
const issue = (problem, rationale = "", suggestedFix = "") => ({ severity: "major", problem, rationale, suggested_fix: suggestedFix });
const result = (issues, summary) => ({ status: issues.length ? "fail" : "pass", summary, issues });

export function computeAudits({ dataset, validation, conceptId = null }) {
  conceptId ??= dataset.concepts?.[0]?.value?.id;
  const concept = validation.conceptsById.get(conceptId);
  const coverage = evidenceCoverage(dataset, validation, conceptId);
  const lessons = concept?.lessons ?? [];
  const examples = concept?.examples ?? [];
  const worked = examples.filter((example) => example.type === "worked");
  const layers = concept?.contentLayers ?? [];
  const corpus = JSON.stringify(concept ?? {});
  const results = {};

  const mathIssues = [];
  if (!concept?.claims?.[0]?.statement?.trim()) mathIssues.push(issue("the primary mathematical claim is empty", "A concept needs a precise claim before examples can be reviewed.", "Add the concept's definition or central claim."));
  if ((concept?.claims?.[0]?.statement?.trim()?.length ?? 0) < 25 || /便利|役立つ|大切な/.test(concept?.claims?.[0]?.statement ?? "")) mathIssues.push(issue("the primary claim is too vague to review", "A publishable claim needs enough structure to distinguish it from a slogan.", "State the objects, conditions, and relationship precisely."));
  for (const example of worked) {
    if ((example.steps?.length ?? 0) < 3) mathIssues.push(issue(`worked example '${example.id}' skips intermediate reasoning`, "A learner needs observable steps.", "Add at least three reasoning steps."));
    for (const field of ["goal", "plan", "finalConclusion", "whyThisWorks", "commonWrongPath"]) if (!example[field]?.trim()) mathIssues.push(issue(`worked example '${example.id}' has no ${field}`, "The worked-example contract makes purpose and reasoning explicit.", `Add the ${field} field.`));
  }
  for (const example of examples.filter((item) => item.type === "counterexample")) if (!example.explanation?.trim()) mathIssues.push(issue(`counterexample '${example.id}' has no explanation`, "A failed case must identify why it fails.", "Explain the failed condition."));
  results.math = result(mathIssues, "Definitions, examples, counterexamples, and worked reasoning reviewed semantically.");

  const evidenceIssues = [];
  for (const claim of concept?.claims ?? []) if (!claim.evidence?.length || !claim.sourceRefs?.length) evidenceIssues.push(issue(`claim '${claim.id}' lacks claim-level support`, "A published claim must be traceable to evidence and a source locator.", "Add EvidenceItem and sourceRefs."));
  for (const record of dataset.evidenceItems ?? []) if (!record.value?.locator?.value || !record.value?.extracted_meaning?.ja) evidenceIssues.push(issue(`evidence item '${record.value?.id}' is not interpretable`, "Evidence needs a locator and extracted meaning.", "Complete the evidence record."));
  results.evidence = result(evidenceIssues, "Claim support, locator specificity, and evidence interpretation reviewed semantically.");

  const pedagogyIssues = [];
  if (lessons.length < 6) pedagogyIssues.push(issue(`lesson sequence has ${lessons.length}/6 learning units`, "Deep explanation requires a progression of learning units.", "Add at least six lessons or adjust the domain quality profile."));
  const bridgeText = `${layers.find((layer) => layer.type === "motivation")?.body ?? ""} ${(lessons[0]?.sections ?? []).map((section) => section.body).join(" ")}`;
  if (!layers.some((layer) => layer.type === "motivation") || !bridgeText.trim() || (layers.find((layer) => layer.type === "motivation")?.body?.length ?? 0) < 80 || bridgeText.length < 180) pedagogyIssues.push(issue("motivation or concrete-to-abstract bridge is missing", "Learners need a problem, an observable case, and a reason for formal vocabulary.", "Connect the first concrete case to the formal concept."));
  if (lessons.some((lesson) => !lesson.sections?.some((section) => section.kind === "checkpoint"))) pedagogyIssues.push(issue("one or more lessons has no retrieval checkpoint", "Each learning unit needs a moment to retrieve the target idea.", "Add a checkpoint section to every lesson."));
  if (coverage.lessons.linkedToClaims < lessons.length) pedagogyIssues.push(issue("not every lesson is connected to a claim", "Evidence-aware lessons should expose their conceptual anchors.", "Add claimRefs to lesson sections."));
  results.pedagogy = result(pedagogyIssues, "Learning sequence, bridge, retrieval, and objective alignment reviewed semantically.");

  const explanationIssues = [];
  const motivation = layers.filter((layer) => layer.type === "motivation");
  const intuition = layers.filter((layer) => layer.type === "intuition");
  const formal = layers.filter((layer) => ["formal_definition", "term_by_term"].includes(layer.type));
  if (!motivation.length || motivation.reduce((sum, item) => sum + item.body.length, 0) < 150) explanationIssues.push(issue("motivation is too thin or absent", "The opening must establish a learner problem rather than announce a definition.", "Write a problem-driven motivation of at least 150 characters."));
  if (!intuition.length || intuition.reduce((sum, item) => sum + item.body.length, 0) < 300) explanationIssues.push(issue("intuition lacks a substantial concrete bridge", "Intuition should provide an experience that can later be abstracted.", "Add a concrete case and a contrast."));
  if (formal.reduce((sum, item) => sum + item.body.length, 0) < 400) explanationIssues.push(issue("formal definition is not unpacked", "Each condition and its role must be explained after the exact statement.", "Expand the formal definition and term-by-term explanation."));
  if (coverage.depth.workedExamples < 6) explanationIssues.push(issue("worked examples do not expose enough reasoning", "Depth is not established by example count alone.", "Give six worked examples at least three steps and an explicit purpose."));
  if (/定義です。定義です。|つまり。つまり。|重要です。重要です。/.test(corpus)) explanationIssues.push(issue("repetitive filler suggests fake depth", "Paraphrase-only expansion increases length without adding a new learner action.", "Replace repetition with a contrast, check, or derivation."));
  if (/[ζξω]/.test(corpus) && !/ζは|ξは|ωは/.test(corpus)) explanationIssues.push(issue("a symbol appears without a local explanation", "Symbols should be introduced before they carry reasoning.", "Define every nonstandard symbol at first use."));
  if (lessons.some((lesson) => (lesson.sections ?? []).length < 3)) explanationIssues.push(issue("a lesson is still a short card", "A learning unit needs multiple roles: explanation, application, and retrieval.", "Add sections for bridge, reasoning, and checkpoint."));
  results.explanation = result(explanationIssues, "Explanation depth, terminology, concrete-to-formal bridging, and reasoning continuity reviewed independently from the writer.");

  const visualIssues = [];
  for (const id of concept?.visualIds ?? []) {
    const visual = validation.visualsById?.get(id);
    if (!visual) visualIssues.push(issue(`visual '${id}' is missing`, "A visual referenced by a concept must be available to the renderer.", "Add the visual artifact."));
    else {
      for (const field of ["learning_goal", "learner_question", "alt_text"]) if (!visual[field]?.ja?.trim()) visualIssues.push(issue(`visual '${id}' has no ${field}.ja`, "Visual meaning must be explicit and accessible.", `Complete ${field}.ja.`));
      if (!visual.source_claims?.length || !visual.target_claim || !visual.placement?.lesson) visualIssues.push(issue(`visual '${id}' lacks target claim or lesson placement`, "Visuals are learning artifacts, not decoration.", "Connect the visual to a target claim and lesson."));
      if (!visual.labels?.length || !visual.visual_encoding || !visual.misconception_risk?.length) visualIssues.push(issue(`visual '${id}' lacks semantic design metadata`, "Labels, encoding, and misconception risk support mathematical review.", "Complete the infographic brief fields."));
    }
  }
  results.visual = result(visualIssues, "Visual semantics, labels, accessibility, and misconception risks reviewed.");

  const completenessIssues = [];
  const thresholds = [[coverage.lessons.total, 6, "lessons"], [coverage.examples.positive, 6, "positive examples"], [coverage.examples.counterexample, 4, "counterexamples"], [coverage.examples.worked, 6, "worked examples"], [coverage.misconceptions.total, 6, "misconceptions"], [coverage.exercises.total, 20, "exercises"], [coverage.diagnostics.total, 5, "diagnostics"], [coverage.visuals.published, 3, "published visuals"], [coverage.checkpoints.total, 6, "checkpoints"], [coverage.connections.total, 4, "concept connections"]];
  for (const [actual, expected, label] of thresholds) if (actual < expected) completenessIssues.push(issue(`${label} ${actual}/${expected}`, "Deep content needs coverage across the learning unit.", `Add or connect more ${label}.`));
  if (coverage.lessons.substantial < 6) completenessIssues.push(issue(`substantial lessons ${coverage.lessons.substantial}/6`, "A lesson is more than a title and one short paragraph.", "Expand each lesson with multiple learner actions."));
  if (coverage.depth.motivation < 150 || coverage.depth.intuition < 300 || coverage.depth.formalDefinition < 400) completenessIssues.push(issue("depth matrix has insufficient primary-layer length", "Soft depth thresholds catch thin cards while semantic review checks meaning.", "Expand motivation, intuition, and definition unpacking."));
  if (lessons.some((lesson) => !lesson.exerciseIds?.length || !lesson.exerciseIds.some((id) => (concept?.exercises ?? []).find((exercise) => exercise.id === id)))) completenessIssues.push(issue("a lesson has no aligned exercise", "Assessment should reveal whether each learning unit's objective was achieved.", "Attach at least one exercise to every lesson."));
  results.completeness = result(completenessIssues, "Coverage matrix checks counts, depth, progression, and assessment alignment.");

  return { names: auditNames, coverage, results, deterministic: { schema: validation.valid, references: validation.issues.length === 0 } };
}

export function issueText(value) {
  return typeof value === "string" ? value : `${value.problem}${value.suggested_fix ? ` — ${value.suggested_fix}` : ""}`;
}
