import test from "node:test";
import assert from "node:assert/strict";
import { loadDomain } from "../../core/src/domain/load-domain.mjs";
import { validateDomain } from "../../core/src/domain/validate-domain.mjs";
import { auditCourse } from "../../core/src/course/audit.mjs";

const root = process.cwd();

test("v2.0 linear algebra course satisfies the course gate", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const validation = await validateDomain(domain);
  assert.equal(validation.valid, true, validation.issues.join("\n"));
  const course = domain.courseData.courses[0].value;
  const modules = domain.courseData.modules.map((record) => record.value);
  const units = domain.courseData.units.map((record) => record.value);
  const result = auditCourse({
    course,
    modules,
    units,
    videoUnitIds: ["span", "linear-independence", "basis-definition"],
    moduleExerciseSets: domain.courseData.moduleExercises.map((record) => record.value),
    cumulativeReviews: domain.courseData.cumulativeReviews.map((record) => record.value),
    notationAvailable: true
  });
  assert.equal(result.status, "pass", result.issues.map((issue) => issue.problem).join("\n"));
  assert.equal(course.version, "2.0.0");
  assert.equal(modules.length, 8);
  assert.equal(units.length, 52);
  assert.ok(domain.courseData.cumulativeReviews.length >= 5);
});

test("v2.0 module and review assessments have complete solutions", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const sets = domain.courseData.moduleExercises.map((record) => record.value);
  const reviews = domain.courseData.cumulativeReviews.map((record) => record.value);
  assert.equal(sets.length, 8);
  assert.ok(sets.every((set) => set.exercises.length >= 3));
  assert.ok(sets.flatMap((set) => set.exercises).every((exercise) => exercise.solution?.steps?.length > 0));
  assert.ok(reviews.length >= 5);
  assert.ok(reviews.every((review) => review.exercise_ids?.length > 0));
});
