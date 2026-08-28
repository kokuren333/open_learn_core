import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadDomain } from "../../core/src/domain/load-domain.mjs";
import { validateDomain } from "../../core/src/domain/validate-domain.mjs";
import { auditCourse } from "../../core/src/course/audit.mjs";
import { readVideoSource } from "../../core/src/video/io.mjs";
import { auditVideoSource } from "../../core/src/video/audit.mjs";
import { unitToMarkdown } from "../../core/src/pdf/markdown.mjs";
import { renderUnit } from "../../core/src/renderer/course-render.mjs";

const root = process.cwd();

test("v1.9 course keeps Knowledge and Learning layers separate", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const validation = await validateDomain(domain);
  assert.equal(validation.valid, true, validation.issues.join("\n"));
  assert.equal(domain.courseData.modules.length, 8);
  assert.equal(domain.courseData.units.length, 52);
  assert.ok(domain.courseData.moduleExercises.length >= 1);
  assert.ok(domain.courseData.cumulativeReviews.length >= 1);
  assert.ok(domain.courseData.units.some((record) => record.value.id === "span"));
  assert.ok(domain.dataset.concepts.some((record) => record.value.id === "basis"));
  const result = auditCourse({ course: domain.courseData.courses[0].value, modules: domain.courseData.modules.map((record) => record.value), units: domain.courseData.units.map((record) => record.value), videoUnitIds: ["span", "linear-independence", "basis-definition"], moduleExerciseSets: domain.courseData.moduleExercises.map((record) => record.value), cumulativeReviews: domain.courseData.cumulativeReviews.map((record) => record.value), notationAvailable: true });
  assert.equal(result.status, "pass", result.issues.map((issue) => issue.problem).join("\n"));
});

for (const unitId of ["span", "linear-independence", "basis-definition"]) {
  test(`video pilot ${unitId} enforces Biim and TTS contracts`, async () => {
    const base = path.join(root, "domains", "linear-algebra", "video", "units", unitId);
    const result = auditVideoSource({ source: await readVideoSource(path.join(base, "video.yaml")), slidesMarkdown: await readFile(path.join(base, "slides.md"), "utf8") });
    assert.equal(result.status, "pass", result.issues.map((issue) => issue.problem).join("\n"));
  });
}

test("PDF adapter preserves Unit structure and detailed solution headings", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const unit = domain.courseData.units.find((record) => record.value.id === "basis-definition").value;
  const markdown = unitToMarkdown(unit, "ベクトル空間と部分空間");
  assert.match(markdown, /## 学習目標/);
  assert.match(markdown, /## 演習/);
  assert.match(markdown, /操作の理由/);
});

test("Unit renderer exposes Course navigation and prerequisite remediation", async () => {
  const domain = await loadDomain(root, "linear-algebra");
  const course = domain.courseData.courses[0].value;
  const units = domain.courseData.units.map((record) => record.value);
  const unit = units.find((item) => item.id === "basis-definition");
  const module = domain.courseData.modules.map((record) => record.value).find((item) => item.id === unit.module);
  const html = renderUnit({ unit, module, course, units });
  assert.match(html, /unit-navigation/);
  assert.match(html, /dimension-and-rank/);
  assert.match(html, /前提の復習/);
  assert.match(html, /span\.html/);
});
