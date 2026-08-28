import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

async function readJsonDirectory(directory) {
  try {
    const entries = (await readdir(directory, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith(".json")).sort((a, b) => a.name.localeCompare(b.name));
    return Promise.all(entries.map(async (entry) => ({ file: path.join(directory, entry.name), value: JSON.parse(await readFile(path.join(directory, entry.name), "utf8")) })));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export async function loadCourseData(domainRoot) {
  const dataRoot = path.join(domainRoot, "data");
  const [courses, modules, units, moduleExercises, cumulativeReviews] = await Promise.all([
    readJsonDirectory(path.join(dataRoot, "courses")),
    readJsonDirectory(path.join(dataRoot, "modules")),
    readJsonDirectory(path.join(dataRoot, "units")),
    readJsonDirectory(path.join(dataRoot, "exercises", "modules")),
    readJsonDirectory(path.join(dataRoot, "exercises", "reviews")),
  ]);
  return { courses, modules, units, moduleExercises, cumulativeReviews };
}

export function courseMaps(courseData) {
  return {
    coursesById: new Map(courseData.courses.map((record) => [record.value.id, record.value])),
    modulesById: new Map(courseData.modules.map((record) => [record.value.id, record.value])),
    unitsById: new Map(courseData.units.map((record) => [record.value.id, record.value])),
  };
}
