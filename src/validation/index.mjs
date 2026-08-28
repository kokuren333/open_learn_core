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
  const [concepts, curricula, sources] = await Promise.all([
    readJsonDirectory(path.join(root, "data", "concepts")),
    readJsonDirectory(path.join(root, "data", "curricula")),
    readJson(path.join(root, "data", "sources", "sources.json"))
  ]);
  return {
    root,
    concepts: concepts.records,
    curricula: curricula.records,
    sources: sources.value ?? [],
    issues: [...concepts.issues, ...curricula.issues, ...sources.issues]
  };
}

async function loadSchemas(root) {
  const [concept, curriculum] = await Promise.all([
    readJson(path.join(root, "schemas", "concept.schema.json")),
    readJson(path.join(root, "schemas", "curriculum.schema.json"))
  ]);
  return { concept: concept.value, curriculum: curriculum.value, files: { "concept.schema.json": concept.value, "curriculum.schema.json": curriculum.value } };
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
  const conceptsById = new Map();
  const sourcesById = new Map((Array.isArray(dataset.sources) ? dataset.sources : []).filter((source) => source?.id).map((source) => [source.id, source]));

  issues.push(...duplicateIds(conceptRecords, "concept"));
  issues.push(...duplicateIds(curriculumRecords, "curriculum"));
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
    issues.push(...validateJsonSchema(curriculum, loadedSchemas.curriculum, { schemas: loadedSchemas.files, path: record.file }));
    for (const conceptId of curriculum?.sequence ?? []) {
      if (!conceptIds.has(conceptId)) issues.push(`curriculum '${curriculum.id}': unknown concept reference '${conceptId}'`);
    }
  }
  if (!Array.isArray(dataset.sources)) issues.push("data/sources/sources.json: must contain an array");
  const sourceIds = (dataset.sources ?? []).map((source) => source?.id).filter(Boolean);
  if (new Set(sourceIds).size !== sourceIds.length) issues.push("sources: duplicate id");
  for (const source of dataset.sources ?? []) {
    for (const field of ["id", "title", "url", "license"]) if (typeof source?.[field] !== "string" || !source[field].trim()) issues.push(`source: '${field}' is required`);
  }
  return { valid: issues.length === 0, issues, conceptsById, sourceById: sourcesById };
}

export async function validateConcept(concept, root = process.cwd()) {
  const schemas = await loadSchemas(root);
  return validateJsonSchema(concept, schemas.concept, { schemas: schemas.files });
}

export function formatIssues(issues) {
  return issues.map((issue) => `- ${issue}`).join("\n");
}
