import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDomain } from "../core/src/domain/load-domain.mjs";

const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
const domain = await loadDomain(root, domainId);
const experiences = domain.learningExperiences ?? [];
const coreById = new Map((domain.coreConcepts ?? []).map((concept) => [concept.id, concept]));
const issues = [];
const warnings = [];
const reports = [];

const hasText = (value) => typeof value === "string" && value.trim().length > 0;
const countQuestionLike = (blocks) => blocks.filter((block) => hasText(block.question) || ["learner_prediction", "guided_exploration", "guided_practice", "independent_practice", "transfer"].includes(block.type)).length;

for (const experience of experiences) {
  const blocks = experience.sequence ?? [];
  const counts = {
    concrete_scenarios: blocks.filter((block) => ["hook", "concrete_problem"].includes(block.type)).length,
    worked_examples: blocks.filter((block) => block.type === "worked_example").length,
    counterexamples: blocks.filter((block) => ["failure_case", "contrast", "misconception_challenge"].includes(block.type)).length,
    guided_questions: countQuestionLike(blocks),
    independent_questions: blocks.filter((block) => block.type === "independent_practice").length,
    misconception_challenges: blocks.filter((block) => block.type === "misconception_challenge").length,
    representation_switches: blocks.filter((block) => block.type === "representation" || hasText(block.representation)).length,
    transfer_tasks: blocks.filter((block) => block.type === "transfer").length
  };
  const budget = experience.instructional_budget;
  const localIssues = [];
  for (const [key, actual] of Object.entries(counts)) {
    const minimum = budget?.[`minimum_${key}`] ?? 0;
    if (actual < minimum) localIssues.push(`${key}: ${actual} < required ${minimum}`);
  }
  if (blocks.length < 5) localIssues.push("sequence must contain at least five learning blocks");
  if (!["hook", "concrete_problem", "learner_prediction"].includes(blocks[0]?.type) || !blocks.slice(0, 3).some((block) => block.type === "learner_prediction")) localIssues.push("the experience must begin with a need/problem and learner prediction before formalization");
  if (!blocks.some((block) => ["hook", "concrete_problem", "learner_prediction", "guided_exploration", "guided_practice", "independent_practice", "misconception_challenge", "transfer"].includes(block.type))) localIssues.push("no visible learner activity was found");
  const blockIds = new Set();
  for (const block of blocks) {
    if (blockIds.has(block.id)) localIssues.push(`duplicate learning block id '${block.id}'`);
    blockIds.add(block.id);
    if (!hasText(block.activity)) localIssues.push(`${block.id}: activity is empty`);
    if (!hasText(block.learner_state_before) || !hasText(block.learner_state_after)) localIssues.push(`${block.id}: learner state transition is incomplete`);
    if (block.type === "worked_example") {
      const worked = block.worked_example;
      if (!worked || worked.reasoning_steps?.length < 3 || !hasText(worked.interpretation) || !hasText(worked.generalizable_takeaway)) localIssues.push(`${block.id}: worked example must expose at least three reasoning steps, interpretation, and a generalizable takeaway`);
    }
    if (block.type === "misconception_challenge") {
      const challenge = block.misconception_challenge;
      for (const field of ["prompt", "expected_wrong_path", "correction", "explanation", "transfer_check"]) if (!hasText(challenge?.[field])) localIssues.push(`${block.id}: misconception challenge is missing '${field}'`);
    }
  }
  const outcomeIds = new Set(coreById.get(experience.concept_id)?.learning_contract?.learning_outcome_ids ?? []);
  const assessed = new Set(experience.assessments?.flatMap((assessment) => assessment.tests_learning_outcome_ids ?? []) ?? []);
  for (const outcomeId of outcomeIds) if (!assessed.has(outcomeId)) localIssues.push(`learning outcome '${outcomeId}' has no assessment item`);
  const report = { id: experience.id, concept_id: experience.concept_id, editorial_status: experience.editorial_status, block_count: blocks.length, assessment_count: experience.assessments?.length ?? 0, counts, status: localIssues.length ? "fail" : "pass", issues: localIssues };
  reports.push(report);
  if (experience.editorial_status === "gold") issues.push(...localIssues.map((issue) => `${experience.id}: ${issue}`));
  else if (localIssues.length) warnings.push(...localIssues.map((issue) => `${experience.id}: ${issue}`));
}

const goldConcepts = (domain.coreConcepts ?? []).filter((concept) => concept.editorial_status === "gold");
for (const concept of goldConcepts) if (!experiences.some((experience) => experience.concept_id === concept.id && experience.editorial_status === "gold")) issues.push(`Gold Core Concept '${concept.id}' has no Gold Learning Experience`);
for (const concept of domain.coreConcepts ?? []) if (!experiences.some((experience) => experience.concept_id === concept.id)) warnings.push(`scaffold concept '${concept.id}' has no Learning Experience yet`);

const report = { schema_version: "2.2", domain: domainId, review_type: "automated_learning_experience_audit", independent_review: false, status: issues.length ? "fail" : "pass", summary: { experiences: experiences.length, gold_experiences: experiences.filter((experience) => experience.editorial_status === "gold").length, scaffold_concepts_without_experience: warnings.filter((warning) => warning.startsWith("scaffold concept")).length }, experiences: reports, issues, warnings };
const outDir = path.join(domain.root, "working", "core-concepts", "audit");
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "learning-experience.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(JSON.stringify(report, null, 2));
if (issues.length) process.exitCode = 1;
