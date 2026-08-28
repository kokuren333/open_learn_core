import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { auditCourse } from "../core/src/course/audit.mjs";

const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
const domain = await loadDomain(root, domainId);
const course = domain.courseData.courses[0]?.value;
const modules = domain.courseData.modules.map((record) => record.value);
const units = domain.courseData.units.map((record) => record.value);
let videoUnitIds = [];
try { videoUnitIds = (await readdir(path.join(domain.root, "video", "units"), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name); } catch {}
let notationAvailable = true; try { await readFile(path.join(domain.root, "config", "notation.yaml")); } catch { notationAvailable = false; }
const result = auditCourse({ course, modules, units, videoUnitIds, moduleExerciseSets: domain.courseData.moduleExercises.map((record) => record.value), cumulativeReviews: domain.courseData.cumulativeReviews.map((record) => record.value), notationAvailable });
console.log(JSON.stringify(result, null, 2));
if (result.status === "fail") process.exit(1);
