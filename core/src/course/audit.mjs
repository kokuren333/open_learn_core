const issue = (problem, suggestedFix = "") => ({ severity: "major", problem, suggested_fix: suggestedFix });

export function auditCourse({ course, modules = [], units = [], videoUnitIds = [], moduleExerciseSets = [], cumulativeReviews = [], notationAvailable = true }) {
  const issues = [];
  const moduleIds = new Set(modules.map((module) => module.id));
  const unitIds = new Set(units.map((unit) => unit.id));
  const moduleExerciseIds = new Set(moduleExerciseSets.flatMap((set) => (set.exercises ?? []).map((exercise) => exercise.id)));
  const orderedModules = [...modules].sort((a, b) => a.order - b.order);
  if (!course) issues.push(issue("course manifest is missing", "Add a course JSON document."));
  if (units.length < 45 || units.length > 70) issues.push(issue(`course has ${units.length} Learning Units; expected approximately 45–70`, "Keep meaningful Unit boundaries within the target range."));
  if (modules.length !== 8 || orderedModules.some((module, index) => module.order !== index)) issues.push(issue("Modules 0–7 are not all present in order", "Define eight ordered modules from prerequisites through applications."));
  if (course?.modules?.some((id) => !moduleIds.has(id))) issues.push(issue("course references a missing module", "Resolve every Course → Module reference."));
  if (course?.units?.some((id) => !unitIds.has(id))) issues.push(issue("course references a missing Learning Unit", "Resolve every Course → Unit reference."));
  const initialSlice = ["linear-combination", "span", "linear-independence", "basis-definition", "dimension-and-rank", "coordinate-vectors"];
  const courseUnits = course?.units ?? [];
  const slicePositions = initialSlice.map((id) => courseUnits.indexOf(id));
  if (slicePositions.some((position) => position < 0) || slicePositions.some((position, index) => index > 0 && position <= slicePositions[index - 1])) {
    issues.push(issue("the initial vector-space Course slice is missing or out of order", "Keep linear-combination → span → independence → basis → dimension → coordinates in that order."));
  }
  for (const module of modules) {
    if (module.course !== course?.id) issues.push(issue(`module '${module.id}' points to a different course`, "Use the current Course ID."));
    if (module.units.some((id) => !unitIds.has(id))) issues.push(issue(`module '${module.id}' references a missing Unit`, "Resolve every Module → Unit reference."));
    if (!module.exercise_ids?.length) issues.push(issue(`module '${module.id}' has no module exercise set`, "Attach at least one exercise set with complete solutions."));
    for (const exerciseId of module.exercise_ids ?? []) if (!moduleExerciseIds.has(exerciseId)) issues.push(issue(`module '${module.id}' references missing module exercise '${exerciseId}'`, "Resolve every Module exercise reference."));
    if (!module.purpose || !module.entry_prerequisites?.length || !module.learning_objectives?.length || !module.exit_competencies?.length || !module.adjacent_modules) issues.push(issue(`module '${module.id}' lacks completion metadata`, "Add purpose, entry prerequisites, objectives, exit competencies, and adjacent module links."));
  }
  for (const unit of units) {
    if (!moduleIds.has(unit.module)) issues.push(issue(`unit '${unit.id}' has no valid module`, "Attach each Unit to one Module."));
    if (unit.estimated_duration.video_minutes > 15 || unit.estimated_duration.video_minutes < 8) issues.push(issue(`unit '${unit.id}' is outside the normal 10–15 minute video window`, "Adjust the boundary or record a pedagogical exception."));
    if (unit.id === "basis-definition" && unit.order === 0) issues.push(issue("basis is incorrectly positioned as the Course center", "Keep the Course route explicit and begin with foundations."));
    if (["planned", "researched"].includes(unit.status)) issues.push(issue(`unit '${unit.id}' is not authored`, "Required Units must contain learner-facing source, examples, and exercises."));
    if (!unit.content?.length || unit.content.some((block) => !block.body?.trim() || /予定|整備予定|準備中|placeholder|TODO/i.test(block.body))) issues.push(issue(`unit '${unit.id}' contains empty or placeholder content`, "Replace planning prose with canonical instructional content."));
    const kinds = new Set((unit.content ?? []).map((block) => block.type));
    if (!kinds.has("motivation") || !kinds.has("worked_example") || !kinds.has("checkpoint") || !kinds.has("connection") || !(kinds.has("definition") || kinds.has("formal_definition"))) issues.push(issue(`unit '${unit.id}' misses a required pedagogical section`, "Include motivation, definition, worked example, checkpoint, and next connection."));
    if (!unit.exercises?.length) issues.push(issue(`unit '${unit.id}' has no exercise`, "Attach at least one formative exercise with a complete solution."));
    for (const exercise of unit.exercises ?? []) {
      const solution = exercise.solution;
      if (!solution || !solution.conclusion || solution.steps?.length < 2 || !solution.why?.length || !solution.common_wrong_path) issues.push(issue(`unit '${unit.id}' exercise '${exercise.id}' has an incomplete solution`, "Provide method, intermediate steps, justification, conclusion, and a common wrong path."));
    }
    if (unit.formats?.html?.required && unit.formats.html.status === "planned") issues.push(issue(`unit '${unit.id}' has no HTML publication status`, "Mark the learner-facing format as authored."));
    if (unit.formats?.pdf?.required && unit.formats.pdf.status === "planned") issues.push(issue(`unit '${unit.id}' has no PDF source status`, "Mark the PDF adapter source as ready."));
  }
  const slice = initialSlice;
  if (slice.some((id) => !unitIds.has(id))) issues.push(issue("initial vector-space Course slice is incomplete", "Define the linear-combination → span → independence → basis → dimension → coordinates path."));
  if (videoUnitIds.length < 2) issues.push(issue("fewer than 2 video pilot Units are available", "Add at least 2 complete video sources for the initial slice."));
  if (moduleExerciseSets.length < modules.length) issues.push(issue(`only ${moduleExerciseSets.length}/${modules.length} Modules have exercise sets`, "Add a meaningful exercise set for every Module."));
  if (cumulativeReviews.length < 5) issues.push(issue(`only ${cumulativeReviews.length}/5 cumulative reviews exist`, "Add reviews for foundations, vector spaces, determinants/eigenvalues, orthogonality/least squares, and the final course."));
  for (const review of cumulativeReviews) for (const exerciseId of review.exercise_ids ?? []) if (!moduleExerciseIds.has(exerciseId)) issues.push(issue(`cumulative review '${review.id}' references missing exercise '${exerciseId}'`, "Reference a complete Module exercise."));
  if (course?.status === "experimental") issues.push(issue("course is still marked experimental", "Mark the course course_ready only after all required Units and reviews pass."));
  if (course?.reviews && course.reviews.some((id) => !cumulativeReviews.some((review) => review.id === id))) issues.push(issue("course references a missing cumulative review", "Resolve every Course review reference."));
  if (!notationAvailable) issues.push(issue("Domain notation policy is missing", "Add config/notation.yaml and use it as the notation contract."));
  if (units.some((unit) => unit.prerequisites.length && !unit.remediation?.length && unit.status !== "planned")) issues.push(issue("an authored Unit has prerequisites but no remediation route", "Add a short prerequisite review link or explicitly mark the dependency as already activated."));
  const exerciseTypes = new Set(units.flatMap((unit) => unit.exercises.map((exercise) => exercise.type)));
  for (const expected of ["recognition", "calculation", "explanation", "error_detection"]) if (!exerciseTypes.has(expected)) issues.push(issue(`Course exercise progression lacks ${expected}`, "Include recognition, calculation, explanation, and error-detection tasks."));
  const formatCoverage = { html: units.filter((unit) => unit.formats?.html?.status !== "planned").length, pdf: units.filter((unit) => unit.formats?.pdf?.status !== "planned").length, video: units.filter((unit) => videoUnitIds.includes(unit.id)).length };
  return { status: issues.length ? "fail" : "pass", issues, summary: "Course order, module coverage, initial slice, Unit boundaries, exercise progression, and format coverage reviewed.", counts: { modules: modules.length, units: units.length, videoPilots: videoUnitIds.length, moduleExerciseSets: moduleExerciseSets.length, cumulativeReviews: cumulativeReviews.length }, formatCoverage };
}
