import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDomain } from "../core/src/domain/load-domain.mjs";

const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
const domain = await loadDomain(root, domainId);
const course = domain.courseData.courses[0]?.value;
const unitsById = new Map(domain.courseData.units.map((record) => [record.value.id, record.value]));
const unitIds = course?.units ?? [...unitsById.keys()];
const minBodyChars = Number.parseInt(process.env.MIN_UNIT_BODY_CHARS ?? "1500", 10);
const minExercises = 3;
const rows = [];

const sentenceList = (value) => value.split(/[。！？!?\n]+/).map((item) => item.trim()).filter((item) => item.length >= 18);
for (const id of unitIds) {
  const unit = unitsById.get(id);
  if (!unit) { rows.push({ id, verdict: "FAIL", flags: ["missing_unit"] }); continue; }
  const body = (unit.content ?? []).map((block) => block.body ?? "").join("\n");
  const sentences = sentenceList(body);
  const counts = new Map(sentences.map((sentence) => [sentence, sentences.filter((item) => item === sentence).length]));
  const repeated = [...counts.entries()].filter(([, count]) => count > 1).map(([sentence, count]) => ({ sentence, count }));
  const examples = (unit.content ?? []).filter((block) => ["worked", "worked_example"].includes(block.type)).length;
  const exercises = unit.exercises ?? [];
  const solutions = exercises.filter((exercise) => exercise.solution?.steps?.length > 0).length;
  const flags = [];
  const warnings = [];
  if (body.length < minBodyChars) flags.push(`body_chars_below_${minBodyChars}`);
  if (examples < 1) flags.push("worked_example_missing");
  if (exercises.length < minExercises) flags.push(`exercises_below_${minExercises}`);
  if (solutions < exercises.length) flags.push("incomplete_solution");
  if (/(TODO|TBD|整備予定|未実装|placeholder)/i.test(body)) flags.push("placeholder_marker");
  if (repeated.length >= 3) flags.push("repeated_sentences");
  if (!(unit.visuals ?? []).length) warnings.push("no_unit_visual");
  if (!(unit.evidence ?? []).length) warnings.push("no_unit_evidence");
  rows.push({ id, module: unit.module, body_chars: body.length, sections: (unit.content ?? []).length, worked_examples: examples, exercises: exercises.length, solutions, visuals: (unit.visuals ?? []).length, citations: (unit.evidence ?? []).length, repeated_sentences: repeated.length, flags, warnings, verdict: flags.length ? "FAIL" : "PASS" });
}

const failures = rows.filter((row) => row.verdict === "FAIL");
const report = {
  audit: "content-forensic",
  auditor: "openlearn-content-forensic-auditor",
  independent_review: false,
  domain: domainId,
  course_id: course?.id,
  concepts: domain.dataset.concepts.length,
  units: rows.length,
  thresholds: { min_body_chars: minBodyChars, min_exercises: minExercises, complete_solution_required: true },
  summary: {
    status: failures.length ? "fail" : "pass",
    failures: failures.length,
    body_chars: { min: Math.min(...rows.map((row) => row.body_chars ?? 0)), max: Math.max(...rows.map((row) => row.body_chars ?? 0)), average: Math.round(rows.reduce((sum, row) => sum + (row.body_chars ?? 0), 0) / Math.max(rows.length, 1)) },
    under_body_threshold: rows.filter((row) => (row.body_chars ?? 0) < minBodyChars).length,
    missing_visuals: rows.filter((row) => row.warnings?.includes("no_unit_visual")).length,
    missing_citations: rows.filter((row) => row.warnings?.includes("no_unit_evidence")).length
  },
  issues: failures.map((row) => ({ unit: row.id, flags: row.flags })),
  units: rows
};
const output = path.join(root, "dist", "domains", domainId, "audit", "content_forensic.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
