import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { validateDomain } from "../core/src/domain/validate-domain.mjs";
import { auditCourse } from "../core/src/course/audit.mjs";
import { computeAudits } from "../core/src/quality/audits.mjs";
import { runAudits } from "./run-audits.mjs";
const exec = promisify(execFile);
const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
async function currentSourceCommit() {
  if (process.env.SOURCE_COMMIT) return process.env.SOURCE_COMMIT;
  try { return (await exec("git", ["rev-parse", "HEAD"], { cwd: root })).stdout.trim(); } catch { return "working-tree"; }
}
const domain = await loadDomain(root, domainId);
const validation = await validateDomain(domain);
const course = domain.courseData.courses[0]?.value;
const modules = domain.courseData.modules.map((record) => record.value);
const units = domain.courseData.units.map((record) => record.value);
const videoUnitIds = ["span", "linear-independence", "basis-definition"];
const courseResult = auditCourse({ course, modules, units, videoUnitIds, moduleExerciseSets: domain.courseData.moduleExercises.map((record) => record.value), cumulativeReviews: domain.courseData.cumulativeReviews.map((record) => record.value), notationAvailable: true });
const basisAudits = computeAudits({ dataset: domain.dataset, validation: validation.datasetValidation, conceptId: "basis" }).results;
await runAudits(root, "basis", domain.dataset, validation.datasetValidation, domain.root);
let publication = { status: "fail", issues: ["publication audit was not run"] };
try {
  const result = await exec(process.execPath, [path.join(root, "scripts", "publication-audit.mjs"), domainId], { cwd: root });
  publication = JSON.parse(result.stdout);
} catch (error) {
  try { publication = JSON.parse(error.stdout); } catch { publication = { status: "fail", issues: [error.message] }; }
}
let forensic = { status: "fail", issues: ["content forensic audit was not run"] };
try {
  const result = await exec(process.execPath, [path.join(root, "scripts", "content-forensic-audit.mjs"), domainId], { cwd: root, maxBuffer: 1024 * 1024 * 16 });
  forensic = JSON.parse(result.stdout);
} catch (error) {
  try { forensic = JSON.parse(error.stdout); } catch { forensic = { status: "fail", issues: [error.message] }; }
}
let coreConcepts = { status: "fail", issues: ["Core Concept audit was not run"] };
try {
  const result = await exec(process.execPath, [path.join(root, "scripts", "core-concept-audit.mjs"), domainId], { cwd: root, maxBuffer: 1024 * 1024 * 8 });
  coreConcepts = JSON.parse(result.stdout);
} catch (error) {
  try { coreConcepts = JSON.parse(error.stdout); } catch { coreConcepts = { status: "fail", issues: [error.message] }; }
}
let learningExperience = { status: "fail", issues: ["Learning Experience audit was not run"] };
try {
  const result = await exec(process.execPath, [path.join(root, "scripts", "learning-experience-audit.mjs"), domainId], { cwd: root, maxBuffer: 1024 * 1024 * 8 });
  learningExperience = JSON.parse(result.stdout);
} catch (error) {
  try { learningExperience = JSON.parse(error.stdout); } catch { learningExperience = { status: "fail", issues: [error.message] }; }
}
const reports = {
  structural: { status: validation.valid ? "pass" : "fail", severity: validation.valid ? "information" : "error", issues: validation.issues },
  completeness: { status: courseResult.status, severity: courseResult.status === "pass" ? "information" : "error", issues: courseResult.issues },
  math: { status: basisAudits.math.status, severity: basisAudits.math.status === "pass" ? "information" : "error", issues: basisAudits.math.issues, scope: "basis semantic audit plus structural course gate" },
  pedagogy: { status: basisAudits.pedagogy.status, severity: basisAudits.pedagogy.status === "pass" ? "information" : "error", issues: basisAudits.pedagogy.issues, scope: "basis semantic audit plus course sequence gate" },
  evidence: { status: basisAudits.evidence.status, severity: basisAudits.evidence.status === "pass" ? "information" : "error", issues: basisAudits.evidence.issues, scope: "claim/evidence audit and curriculum research records" },
  explanation: { status: basisAudits.explanation.status, severity: basisAudits.explanation.status === "pass" ? "information" : "error", issues: basisAudits.explanation.issues, scope: "basis semantic audit plus Unit completeness contract" },
  visual: { status: basisAudits.visual.status, severity: basisAudits.visual.status === "pass" ? "information" : "error", issues: basisAudits.visual.issues },
  video: { status: validation.valid ? "pass" : "fail", severity: validation.valid ? "information" : "error", issues: validation.issues.filter((issue) => issue.includes("video") || issue.includes("TTS")) },
  publication: { status: publication.status, severity: publication.status === "pass" ? "information" : "error", issues: publication.issues ?? [] },
  content_forensic: { status: forensic.summary?.status ?? forensic.status, severity: (forensic.summary?.status ?? forensic.status) === "pass" ? "information" : "error", issues: forensic.issues ?? [], summary: forensic.summary },
  core_concepts: { status: coreConcepts.status, severity: coreConcepts.status === "pass" ? "information" : "error", issues: coreConcepts.issues ?? [], summary: coreConcepts.summary, audits: coreConcepts.audits },
  learning_experience: { status: learningExperience.status, severity: learningExperience.status === "pass" ? "information" : "error", issues: learningExperience.issues ?? [], warnings: learningExperience.warnings ?? [], summary: learningExperience.summary }
};
const blocking = Object.entries(reports).filter(([, report]) => report.status !== "pass").map(([name, report]) => ({ audit: name, issues: report.issues }));
const output = path.join(root, "dist", "domains", domainId, "audit");
await mkdir(output, { recursive: true });
for (const [name, report] of Object.entries(reports)) await writeFile(path.join(output, `${name}.json`), JSON.stringify(report, null, 2) + "\n", "utf8");
const finalReport = { release_version: "2.3.0", source_commit: await currentSourceCommit(), domain: domainId, course_id: course?.id, core_concepts: domain.coreConcepts?.length ?? 0, learning_experiences: domain.learningExperiences?.length ?? 0, lesson_content_blocks: domain.learningExperiences?.reduce((sum, experience) => sum + experience.lesson_content.length, 0) ?? 0, legacy_concepts: domain.dataset.concepts.length, modules: modules.length, units: units.length, exercises: units.reduce((sum, unit) => sum + unit.exercises.length, 0) + domain.courseData.moduleExercises.reduce((sum, set) => sum + set.value.exercises.length, 0), solutions: units.reduce((sum, unit) => sum + unit.exercises.filter((exercise) => exercise.solution).length, 0) + domain.courseData.moduleExercises.reduce((sum, set) => sum + set.value.exercises.filter((exercise) => exercise.solution).length, 0), cumulative_reviews: domain.courseData.cumulativeReviews.length, audits: Object.fromEntries(Object.entries(reports).map(([name, report]) => [name, report.status])), deployment: "not_run: credentials intentionally not required for local/CI audit", known_limitations: ["Only three video source packages are production pilots; video binaries are optional build artifacts.", "The public learner map is exact-30 while legacy Learning Units remain internal during migration.", "Cloudflare Pages/R2 deployment requires user-provided production credentials.", "Judgment-based pedagogy findings are scoped and not presented as objective learner guarantees."], status: blocking.length ? "fail" : "pass", blocking };
await writeFile(path.join(output, "release-report.json"), JSON.stringify(finalReport, null, 2) + "\n", "utf8");
console.log(JSON.stringify(finalReport, null, 2));
if (blocking.length) process.exit(1);
