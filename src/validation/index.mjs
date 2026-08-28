import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { validateJsonSchema } from "./schema.mjs";

async function readJson(filePath) {
  try {
    return { value: JSON.parse(await readFile(filePath, "utf8")), issues: [] };
  } catch (error) {
    return { value: null, issues: [`${filePath}: invalid JSON (${error.message})`] };
  }
}

async function readJsonDirectory(directory) {
  const entries = (await readdir(directory, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith(".json")).sort((a, b) => a.name.localeCompare(b.name));
  const records = [];
  const issues = [];
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    const result = await readJson(filePath);
    issues.push(...result.issues);
    if (result.value !== null) records.push({ file: filePath, value: result.value });
  }
  return { records, issues };
}

export async function loadDataset(root = process.cwd()) {
  const [concepts, curricula, evidenceItems, evidenceReviews, curriculumDecisions, visuals, sources] = await Promise.all([
    readJsonDirectory(path.join(root, "data", "concepts")),
    readJsonDirectory(path.join(root, "data", "curricula")),
    readJsonDirectory(path.join(root, "data", "evidence", "items")),
    readJsonDirectory(path.join(root, "data", "evidence", "reviews")),
    readJsonDirectory(path.join(root, "data", "curriculum-decisions")),
    readJsonDirectory(path.join(root, "data", "visuals")),
    readJson(path.join(root, "data", "sources", "sources.json"))
  ]);
  return {
    root,
    concepts: concepts.records,
    curricula: curricula.records,
    evidenceItems: evidenceItems.records,
    evidenceReviews: evidenceReviews.records,
    curriculumDecisions: curriculumDecisions.records,
    visuals: visuals.records,
    sources: sources.value ?? [],
    issues: [...concepts.issues, ...curricula.issues, ...evidenceItems.issues, ...evidenceReviews.issues, ...curriculumDecisions.issues, ...visuals.issues, ...sources.issues]
  };
}

async function loadSchemas(root) {
  const names = ["concept", "curriculum", "source", "evidence-item", "evidence-review", "curriculum-decision", "visual-artifact", "build-report"];
  const entries = await Promise.all(names.map(async (name) => [name, await readJson(path.join(root, "schemas", `${name}.schema.json`))]));
  const files = Object.fromEntries(entries.map(([name, result]) => [`${name}.schema.json`, result.value]));
  return { ...Object.fromEntries(entries.map(([name, result]) => [name, result.value])), files };
}

function duplicateIds(records, label) {
  const seen = new Map();
  const issues = [];
  for (const record of records) {
    const id = record.value?.id;
    if (!id) continue;
    if (seen.has(id)) issues.push(`${label}: duplicate id '${id}' in ${seen.get(id)} and ${record.file}`);
    else seen.set(id, record.file);
  }
  return issues;
}

function detectCycles(conceptsById) {
  const issues = [];
  const visiting = new Set();
  const visited = new Set();
  const stack = [];
  function visit(id) {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      issues.push(`prerequisite cycle: ${[...stack.slice(start), id].join(" -> ")}`);
      return;
    }
    if (visited.has(id) || !conceptsById.has(id)) return;
    visiting.add(id);
    stack.push(id);
    for (const prerequisite of conceptsById.get(id).prerequisites ?? []) visit(prerequisite);
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of conceptsById.keys()) visit(id);
  return issues;
}

export async function validateDataset(dataset, { schemas = null } = {}) {
  const loadedSchemas = schemas ?? await loadSchemas(dataset.root);
  const issues = [...(dataset.issues ?? [])];
  const conceptRecords = dataset.concepts ?? [];
  const curriculumRecords = dataset.curricula ?? [];
  const evidenceItemRecords = dataset.evidenceItems ?? [];
  const evidenceReviewRecords = dataset.evidenceReviews ?? [];
  const curriculumDecisionRecords = dataset.curriculumDecisions ?? [];
  const visualRecords = dataset.visuals ?? [];
  const conceptsById = new Map();
  const sourcesById = new Map((Array.isArray(dataset.sources) ? dataset.sources : []).filter((source) => source?.id).map((source) => [source.id, source]));
  const evidenceById = new Map();
  const curriculaById = new Map();
  const visualsById = new Map();

  issues.push(...duplicateIds(conceptRecords, "concept"));
  issues.push(...duplicateIds(curriculumRecords, "curriculum"));
  issues.push(...duplicateIds(evidenceItemRecords, "evidence item"));
  issues.push(...duplicateIds(evidenceReviewRecords, "evidence review"));
  issues.push(...duplicateIds(curriculumDecisionRecords, "curriculum decision"));
  issues.push(...duplicateIds(visualRecords, "visual artifact"));
  for (const record of conceptRecords) {
    const concept = record.value;
    issues.push(...validateJsonSchema(concept, loadedSchemas.concept, { schemas: loadedSchemas.files, path: record.file }));
    if (concept?.id && path.basename(record.file, ".json") !== concept.id) issues.push(`${record.file}: filename must match concept id '${concept.id}'`);
    if (concept?.id && !conceptsById.has(concept.id)) conceptsById.set(concept.id, concept);
  }

  const conceptIds = new Set(conceptsById.keys());
  for (const concept of conceptsById.values()) {
    const lessonIds = (concept.lessons ?? []).map((lesson) => lesson.id);
    const claimIds = (concept.claims ?? []).map((claim) => claim.id);
    const exerciseIds = (concept.exercises ?? []).map((exercise) => exercise.id);
    if (new Set(lessonIds).size !== lessonIds.length) issues.push(`concept '${concept.id}': duplicate lesson id`);
    if (new Set(claimIds).size !== claimIds.length) issues.push(`concept '${concept.id}': duplicate claim id`);
    if (new Set(exerciseIds).size !== exerciseIds.length) issues.push(`concept '${concept.id}': duplicate exercise id`);
    for (const lesson of concept.lessons ?? []) {
      for (const exerciseId of lesson.exerciseIds ?? []) if (!exerciseIds.includes(exerciseId)) issues.push(`concept '${concept.id}', lesson '${lesson.id}': unknown exercise reference '${exerciseId}'`);
      for (const section of lesson.sections ?? []) for (const claimId of section.claimRefs ?? []) if (!claimIds.includes(claimId)) issues.push(`concept '${concept.id}', section '${section.id}': unknown claim reference '${claimId}'`);
    }
    for (const exercise of concept.exercises ?? []) if (exercise.lessonId && !lessonIds.includes(exercise.lessonId)) issues.push(`concept '${concept.id}', exercise '${exercise.id}': unknown lesson reference '${exercise.lessonId}'`);
    for (const claim of concept.claims ?? []) for (const sourceRef of claim.sourceRefs ?? []) if (!sourcesById.has(sourceRef.source)) issues.push(`concept '${concept.id}', claim '${claim.id}': unknown source reference '${sourceRef.source}'`);
    for (const reference of [...(concept.prerequisites ?? []), ...(concept.related ?? [])]) {
      if (!conceptIds.has(reference)) issues.push(`concept '${concept.id}': unknown concept reference '${reference}'`);
    }
    for (const source of concept.sources ?? []) {
      if (!sourcesById.has(source)) issues.push(`concept '${concept.id}': unknown source reference '${source}'`);
    }
    if ((concept.prerequisites ?? []).includes(concept.id)) issues.push(`concept '${concept.id}': cannot prerequisite itself`);
  }
  issues.push(...detectCycles(conceptsById));

  for (const record of curriculumRecords) {
    const curriculum = record.value;
    if (curriculum?.id && !curriculaById.has(curriculum.id)) curriculaById.set(curriculum.id, curriculum);
    issues.push(...validateJsonSchema(curriculum, loadedSchemas.curriculum, { schemas: loadedSchemas.files, path: record.file }));
    for (const conceptId of curriculum?.sequence ?? []) {
      if (!conceptIds.has(conceptId)) issues.push(`curriculum '${curriculum.id}': unknown concept reference '${conceptId}'`);
    }
  }
  if (!Array.isArray(dataset.sources)) issues.push("data/sources/sources.json: must contain an array");
  const sourceIds = (dataset.sources ?? []).map((source) => source?.id).filter(Boolean);
  if (new Set(sourceIds).size !== sourceIds.length) issues.push("sources: duplicate id");
  for (const source of dataset.sources ?? []) {
    issues.push(...validateJsonSchema(source, loadedSchemas.source, { schemas: loadedSchemas.files, path: "data/sources/sources.json" }));
    for (const field of ["id", "title", "url", "license"]) if (typeof source?.[field] !== "string" || !source[field].trim()) issues.push(`source: '${field}' is required`);
  }

  const allClaims = new Map();
  for (const concept of conceptsById.values()) for (const claim of concept.claims ?? []) {
    if (claim?.id && !allClaims.has(claim.id)) allClaims.set(claim.id, { concept, claim });
  }
  for (const record of evidenceItemRecords) {
    const item = record.value;
    issues.push(...validateJsonSchema(item, loadedSchemas["evidence-item"], { schemas: loadedSchemas.files, path: record.file }));
    if (item?.id && !evidenceById.has(item.id)) evidenceById.set(item.id, item);
    if (item?.source && !sourcesById.has(item.source)) issues.push(`evidence item '${item.id}': unknown source reference '${item.source}'`);
    for (const claimId of item?.supports ?? []) if (!allClaims.has(claimId)) issues.push(`evidence item '${item?.id}': unknown claim reference '${claimId}'`);
  }
  for (const concept of conceptsById.values()) {
    for (const claim of concept.claims ?? []) for (const evidenceId of claim.evidence ?? []) if (!evidenceById.has(evidenceId)) issues.push(`concept '${concept.id}', claim '${claim.id}': unknown evidence reference '${evidenceId}'`);
    for (const edge of concept.prerequisiteEdges ?? []) {
      if (!conceptIds.has(edge.concept)) issues.push(`concept '${concept.id}': prerequisite edge references unknown concept '${edge.concept}'`);
      for (const evidenceId of edge.evidence ?? []) if (!evidenceById.has(evidenceId)) issues.push(`concept '${concept.id}': prerequisite edge for '${edge.concept}' has unknown evidence reference '${evidenceId}'`);
    }
    for (const exercise of concept.exercises ?? []) {
      for (const claimId of exercise.testsClaims ?? []) if (!allClaims.has(claimId)) issues.push(`concept '${concept.id}', exercise '${exercise.id}': unknown claim reference '${claimId}'`);
      for (const conceptId of exercise.requiresConcepts ?? []) if (!conceptIds.has(conceptId)) issues.push(`concept '${concept.id}', exercise '${exercise.id}': unknown required concept '${conceptId}'`);
    }
    for (const layer of concept.contentLayers ?? []) for (const claimId of layer.claimRefs ?? []) if (!allClaims.has(claimId)) issues.push(`concept '${concept.id}', content layer '${layer.id}': unknown claim reference '${claimId}'`);
    for (const visualId of concept.visualIds ?? []) if (!visualRecords.some((record) => record.value?.id === visualId)) issues.push(`concept '${concept.id}': unknown visual reference '${visualId}'`);
  }
  for (const record of evidenceReviewRecords) {
    const review = record.value;
    issues.push(...validateJsonSchema(review, loadedSchemas["evidence-review"], { schemas: loadedSchemas.files, path: record.file }));
    const target = review?.target;
    if (target?.type === "concept" && !conceptIds.has(target.id)) issues.push(`evidence review '${review.id}': unknown concept target '${target.id}'`);
    if (target?.type === "curriculum" && !curriculaById.has(target.id)) issues.push(`evidence review '${review.id}': unknown curriculum target '${target.id}'`);
    if (target?.type === "curriculum_decision" && !curriculumDecisionRecords.some((item) => item.value?.id === target.id)) issues.push(`evidence review '${review.id}': unknown curriculum decision target '${target.id}'`);
    for (const included of review?.included_sources ?? []) if (!sourcesById.has(included.source)) issues.push(`evidence review '${review.id}': unknown included source '${included.source}'`);
  }
  for (const record of curriculumDecisionRecords) {
    const decision = record.value;
    issues.push(...validateJsonSchema(decision, loadedSchemas["curriculum-decision"], { schemas: loadedSchemas.files, path: record.file }));
    if (decision?.scope?.curriculum && !curriculaById.has(decision.scope.curriculum)) issues.push(`curriculum decision '${decision.id}': unknown curriculum '${decision.scope.curriculum}'`);
    for (const evidenceId of decision?.evidence ?? []) if (!evidenceById.has(evidenceId)) issues.push(`curriculum decision '${decision.id}': unknown evidence reference '${evidenceId}'`);
  }
  for (const record of visualRecords) {
    const visual = record.value;
    issues.push(...validateJsonSchema(visual, loadedSchemas["visual-artifact"], { schemas: loadedSchemas.files, path: record.file }));
    if (visual?.id && !visualsById.has(visual.id)) visualsById.set(visual.id, visual);
    if (visual?.concept && !conceptIds.has(visual.concept)) issues.push(`visual artifact '${visual.id}': unknown concept '${visual.concept}'`);
    for (const claimId of visual?.source_claims ?? []) if (!allClaims.has(claimId)) issues.push(`visual artifact '${visual.id}': unknown claim reference '${claimId}'`);
    if (visual?.placement?.lesson && !conceptsById.get(visual.concept)?.lessons?.some((lesson) => lesson.id === visual.placement.lesson)) issues.push(`visual artifact '${visual.id}': unknown lesson '${visual.placement.lesson}'`);
    if (visual?.status === "published" && !visual?.alt_text?.ja) issues.push(`visual artifact '${visual.id}': published visual requires alt text`);
  }
  return { valid: issues.length === 0, issues, conceptsById, sourceById: sourcesById, evidenceById, curriculaById, visualsById };
}

export async function validateConcept(concept, root = process.cwd()) {
  const schemas = await loadSchemas(root);
  return validateJsonSchema(concept, schemas.concept, { schemas: schemas.files });
}

export function formatIssues(issues) {
  return issues.map((issue) => `- ${issue}`).join("\n");
}
