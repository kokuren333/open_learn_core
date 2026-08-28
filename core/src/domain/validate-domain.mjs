import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { validateJsonSchema } from "../validation/schema.mjs";
import { loadDomain } from "./load-domain.mjs";
import { parseManifest } from "./manifest.mjs";
import { readPublication, readVideoSource } from "../video/io.mjs";
import { auditVideoSource } from "../video/audit.mjs";

export async function validateDomain(domain, { schema } = {}) {
  const manifestSchema = schema ?? JSON.parse(await readFile(path.join(domain.dataset.schemasRoot, "domain-manifest.schema.json"), "utf8"));
  const schemaNames = ["concept", "core-concept", "learning-block", "learning-experience", "lesson-content", "assessment", "course", "module", "learning-unit", "module-exercise-set", "cumulative-review", "video-source", "video-publication", "tts-config"];
  const schemas = Object.fromEntries(await Promise.all(schemaNames.map(async (name) => [`${name}.schema.json`, JSON.parse(await readFile(path.join(domain.dataset.schemasRoot, `${name}.schema.json`), "utf8"))])));
  const issues = [...validateJsonSchema(domain.manifest, manifestSchema, { schemas, path: `${domain.root}/domain.yaml` })];
  const coreConcepts = domain.coreConcepts ?? [];
  const coreIds = new Set(coreConcepts.map((concept) => concept.id));
  if (coreConcepts.length !== 30) issues.push(`Domain '${domain.manifest.id}' must contain exactly 30 Core Concepts (found ${coreConcepts.length})`);
  if (domain.manifest.core_concepts?.length !== 30) issues.push(`Domain '${domain.manifest.id}' manifest must declare exactly 30 Core Concepts`);
  if (domain.manifest.core_concepts && JSON.stringify([...domain.manifest.core_concepts].sort()) !== JSON.stringify([...coreIds].sort())) issues.push("domain manifest core_concepts must match the loaded Core Concept IDs");
  for (const core of coreConcepts) issues.push(...validateJsonSchema(core, schemas["core-concept.schema.json"], { schemas, path: `${domain.manifest.core_concepts_file}:${core.id}` }));
  for (const core of coreConcepts) {
    for (const prerequisite of core.prerequisites ?? []) if (!coreIds.has(prerequisite)) issues.push(`Core Concept '${core.id}' references missing Core Concept prerequisite '${prerequisite}'`);
    for (const relation of core.external_relations ?? []) if (!["requires", "extends", "applied_in", "analogous_to", "special_case_of", "generalized_by"].includes(relation.relation)) issues.push(`Core Concept '${core.id}' has invalid external relation '${relation.relation}'`);
    const sourceConceptIds = new Set((domain.dataset.concepts ?? []).map((record) => record.value.id));
    for (const sourceId of core.source_concept_ids ?? []) if (!sourceConceptIds.has(sourceId)) issues.push(`Core Concept '${core.id}' references missing source Concept '${sourceId}'`);
  }
  const learningExperiences = domain.learningExperiences ?? [];
  const experienceIds = new Set();
  for (const experience of learningExperiences) {
    issues.push(...validateJsonSchema(experience, schemas["learning-experience.schema.json"], { schemas, path: `${domain.manifest.learning_experiences_file ?? "learning-experiences"}:${experience.id}` }));
    if (experienceIds.has(experience.id)) issues.push(`Learning Experience IDs must be unique: '${experience.id}'`);
    experienceIds.add(experience.id);
    if (!coreIds.has(experience.concept_id)) issues.push(`Learning Experience '${experience.id}' references missing Core Concept '${experience.concept_id}'`);
    const target = coreConcepts.find((core) => core.id === experience.concept_id);
    const outcomeIds = new Set(target?.learning_contract?.learning_outcome_ids ?? []);
    for (const block of experience.sequence ?? []) {
      for (const outcomeId of block.learning_outcome_ids ?? []) if (!outcomeIds.has(outcomeId)) issues.push(`Learning Block '${block.id}' references outcome '${outcomeId}' not declared by Core Concept '${experience.concept_id}'`);
      for (const prerequisite of block.external_prerequisite_concept_ids ?? []) {
        if (!coreIds.has(prerequisite)) issues.push(`Learning Block '${block.id}' references missing external prerequisite Core Concept '${prerequisite}'`);
        if (prerequisite === experience.concept_id) issues.push(`Learning Block '${block.id}' cannot require its own Core Concept '${prerequisite}'`);
      }
    }
    const blockIndex = new Map((experience.sequence ?? []).map((block, index) => [block.id, index]));
    for (const [index, block] of (experience.sequence ?? []).entries()) for (const dependency of block.internal_block_dependencies ?? []) {
      if (!blockIndex.has(dependency)) issues.push(`Learning Block '${block.id}' references missing internal block dependency '${dependency}'`);
      else if (blockIndex.get(dependency) >= index) issues.push(`Learning Block '${block.id}' has a forward/self internal dependency '${dependency}'`);
    }
    for (const assessment of experience.assessments ?? []) {
      for (const outcomeId of assessment.tests_learning_outcome_ids ?? []) if (!outcomeIds.has(outcomeId)) issues.push(`Assessment '${assessment.id}' references outcome '${outcomeId}' not declared by Core Concept '${experience.concept_id}'`);
    }
    const contentIds = new Set();
    for (const content of experience.lesson_content ?? []) {
      issues.push(...validateJsonSchema(content, schemas["lesson-content.schema.json"], { schemas, path: `${domain.manifest.learning_experiences_file ?? "learning-experiences"}:${experience.id}.lesson_content:${content.block_id}` }));
      if (contentIds.has(content.block_id)) issues.push(`Lesson content IDs must be unique: '${content.block_id}'`);
      contentIds.add(content.block_id);
    }
    for (const block of experience.sequence ?? []) if (!contentIds.has(block.id)) issues.push(`Learning Block '${block.id}' has no lesson_content`);
    for (const contentId of contentIds) if (!(experience.sequence ?? []).some((block) => block.id === contentId)) issues.push(`Lesson content '${contentId}' references a missing Learning Block`);
  }
  for (const core of coreConcepts) {
    const experience = learningExperiences.find((item) => item.concept_id === core.id);
    if (core.editorial_status === "gold" && (!experience || experience.editorial_status !== "gold")) issues.push(`Gold Core Concept '${core.id}' must have a Gold Learning Experience`);
  }
  if (domain.manifest.id !== path.basename(domain.root)) issues.push("domain manifest id must match directory name");
  const datasetValidation = await (await import("../validation/index.mjs")).validateDataset(domain.dataset);
  issues.push(...datasetValidation.issues);
  const validateRecords = (records, schemaName) => {
    for (const record of records ?? []) issues.push(...validateJsonSchema(record.value, schemas[`${schemaName}.schema.json`], { schemas, path: record.file }));
  };
  validateRecords(domain.courseData?.courses, "course");
  validateRecords(domain.courseData?.modules, "module");
  validateRecords(domain.courseData?.units, "learning-unit");
  validateRecords(domain.courseData?.moduleExercises, "module-exercise-set");
  validateRecords(domain.courseData?.cumulativeReviews, "cumulative-review");
  const courseRecords = domain.courseData?.courses ?? [];
  const moduleRecords = domain.courseData?.modules ?? [];
  const unitRecords = domain.courseData?.units ?? [];
  const courseIds = new Set(courseRecords.map((record) => record.value.id));
  const moduleIds = new Set(moduleRecords.map((record) => record.value.id));
  const unitIds = new Set(unitRecords.map((record) => record.value.id));
  if (courseIds.size !== courseRecords.length) issues.push("course IDs must be unique");
  if (moduleIds.size !== moduleRecords.length) issues.push("module IDs must be unique");
  if (unitIds.size !== unitRecords.length) issues.push("Learning Unit IDs must be unique");
  for (const course of domain.courseData?.courses ?? []) {
    for (const moduleId of course.value.modules ?? []) if (!moduleIds.has(moduleId)) issues.push(`course '${course.value.id}' references missing module '${moduleId}'`);
    for (const unitId of course.value.units ?? []) if (!unitIds.has(unitId)) issues.push(`course '${course.value.id}' references missing unit '${unitId}'`);
  }
  for (const module of domain.courseData?.modules ?? []) {
    if (!courseIds.has(module.value.course)) issues.push(`module '${module.value.id}' references missing course '${module.value.course}'`);
    for (const unitId of module.value.units ?? []) if (!unitIds.has(unitId)) issues.push(`module '${module.value.id}' references missing unit '${unitId}'`);
  }
  const moduleExerciseIds = new Set((domain.courseData?.moduleExercises ?? []).flatMap((record) => record.value.exercises.map((exercise) => exercise.id)));
  for (const module of domain.courseData?.modules ?? []) for (const exerciseId of module.value.exercise_ids ?? []) if (!moduleExerciseIds.has(exerciseId)) issues.push(`module '${module.value.id}' references missing module exercise '${exerciseId}'`);
  for (const set of domain.courseData?.moduleExercises ?? []) if (!moduleIds.has(set.value.module)) issues.push(`module exercise set '${set.value.id}' references missing module '${set.value.module}'`);
  for (const review of domain.courseData?.cumulativeReviews ?? []) {
    for (const moduleId of review.value.module_ids) if (!moduleIds.has(moduleId)) issues.push(`cumulative review '${review.value.id}' references missing module '${moduleId}'`);
    for (const exerciseId of review.value.exercise_ids) if (!moduleExerciseIds.has(exerciseId)) issues.push(`cumulative review '${review.value.id}' references missing module exercise '${exerciseId}'`);
  }
  for (const unit of domain.courseData?.units ?? []) if (!moduleIds.has(unit.value.module)) issues.push(`unit '${unit.value.id}' references missing module '${unit.value.module}'`);
  const conceptIds = new Set((domain.dataset.concepts ?? []).map((record) => record.value.id));
  for (const unit of domain.courseData?.units ?? []) {
    for (const conceptId of [...(unit.value.concepts?.primary ?? []), ...(unit.value.concepts?.supporting ?? [])]) if (!conceptIds.has(conceptId)) issues.push(`unit '${unit.value.id}' references missing Concept '${conceptId}'`);
    for (const prerequisite of unit.value.prerequisites ?? []) if (!unitIds.has(prerequisite) && !conceptIds.has(prerequisite) && prerequisite !== "secondary-school algebra fluency" && prerequisite !== "simultaneous equations at a basic level") issues.push(`unit '${unit.value.id}' references missing prerequisite '${prerequisite}'`);
    for (const exercise of unit.value.exercises ?? []) {
      const solution = exercise.solution;
      for (const field of ["what_is_asked", "strategy", "conclusion", "common_wrong_path"]) if (!solution?.[field]?.trim()) issues.push(`unit '${unit.value.id}' exercise '${exercise.id}' has incomplete solution field '${field}'`);
      if (!solution?.steps?.length || !solution?.why?.length) issues.push(`unit '${unit.value.id}' exercise '${exercise.id}' lacks reasoning steps or justification`);
    }
  }
  for (const course of courseRecords) if (course.value.domain !== domain.manifest.id) issues.push(`course '${course.value.id}' points to domain '${course.value.domain}' instead of '${domain.manifest.id}'`);
  for (const id of domain.manifest.entry_curriculum ?? []) if (!datasetValidation.curriculaById.has(id)) issues.push(`manifest entry curriculum '${id}' is missing`);
  for (const id of domain.manifest.entry_concepts ?? []) if (!datasetValidation.conceptsById.has(id)) issues.push(`manifest entry concept '${id}' is missing`);
  for (const visualRecord of domain.dataset.visuals ?? []) {
    const outputPath = visualRecord.value?.output_path;
    if (!outputPath) continue;
    const assetPath = path.resolve(domain.assetRoot, outputPath);
    if (!assetPath.startsWith(`${domain.assetRoot}${path.sep}`)) issues.push(`visual '${visualRecord.value.id}' asset path escapes asset root`);
    else try { await access(assetPath); } catch { issues.push(`visual '${visualRecord.value.id}' asset is missing: ${outputPath}`); }
  }
  try {
    const ttsPath = path.join(domain.root, "config", "tts.yaml");
    const ttsConfig = parseManifest(await readFile(ttsPath, "utf8"));
    issues.push(...validateJsonSchema(ttsConfig, schemas["tts-config.schema.json"], { schemas, path: ttsPath }));
  } catch (error) { if (error.code !== "ENOENT") issues.push(`TTS config could not be loaded: ${error.message}`); }
  try {
    const videoRoot = path.join(domain.root, "video", "units");
    const videoUnits = (await readdir(videoRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
    const videoSchema = JSON.parse(await readFile(path.join(domain.dataset.schemasRoot, "video-source.schema.json"), "utf8"));
    for (const entry of videoUnits) {
      const unitId = entry.name;
      const sourcePath = path.join(videoRoot, unitId, "video.yaml");
      const slidesPath = path.join(videoRoot, unitId, "slides.md");
      try {
        const source = await readVideoSource(sourcePath);
        issues.push(...validateJsonSchema(source, videoSchema, { schemas, path: sourcePath }));
        const slidesMarkdown = await readFile(slidesPath, "utf8");
        issues.push(...auditVideoSource({ source, slidesMarkdown }).issues.map((item) => `video/${unitId}: ${item.problem}`));
        if (!unitIds.has(source.unit)) issues.push(`video '${unitId}' references missing Learning Unit '${source.unit}'`);
        const publicationPath = path.join(videoRoot, unitId, "youtube.yaml");
        try {
          const publication = await readPublication(publicationPath);
          issues.push(...validateJsonSchema(publication, schemas["video-publication.schema.json"], { schemas, path: publicationPath }));
        } catch (error) { if (error.code !== "ENOENT") issues.push(`YouTube metadata '${unitId}' could not be loaded: ${error.message}`); }
      } catch (error) { issues.push(`video '${unitId}' could not be loaded: ${error.message}`); }
    }
  } catch (error) { if (error.code !== "ENOENT") issues.push(`video discovery failed: ${error.message}`); }
  return { valid: issues.length === 0, issues, datasetValidation };
}

export async function loadAndValidateDomain(repoRoot, domainId) {
  const domain = await loadDomain(repoRoot, domainId);
  return { domain, validation: await validateDomain(domain) };
}
