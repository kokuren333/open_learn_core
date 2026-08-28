import { readFile } from "node:fs/promises";
import path from "node:path";
import { discoverDomains } from "./discover-domains.mjs";
import { readManifest } from "./manifest.mjs";
import { loadDataset } from "../validation/index.mjs";
import { loadCourseData } from "../course/load-course.mjs";

export async function loadDomain(repoRoot, domainId) {
  const discovered = await discoverDomains(repoRoot);
  const found = discovered.find((domain) => domain.id === domainId || path.basename(domain.root) === domainId);
  if (!found) throw new Error(`unknown domain '${domainId}'`);
  const manifest = found.manifest ?? await readManifest(path.join(found.root, "domain.yaml"));
  const dataset = await loadDataset(repoRoot, { dataRoot: path.resolve(found.root, manifest.content_root ?? "./data"), schemasRoot: path.join(repoRoot, "core", "schemas") });
  dataset.domainRoot = found.root;
  dataset.domainId = manifest.id;
  const courseData = await loadCourseData(found.root);
  let coreConcepts = [];
  if (manifest.core_concepts_file) {
    const corePath = path.resolve(found.root, manifest.core_concepts_file);
    const coreDocument = JSON.parse(await readFile(corePath, "utf8"));
    coreConcepts = coreDocument.core_concepts ?? [];
  }
  dataset.courses = courseData.courses;
  dataset.modules = courseData.modules;
  dataset.units = courseData.units;
  dataset.moduleExercises = courseData.moduleExercises;
  dataset.cumulativeReviews = courseData.cumulativeReviews;
  return { ...found, manifest, dataset, courseData, coreConcepts, assetRoot: path.resolve(found.root, manifest.asset_root ?? "./assets"), workingRoot: path.join(found.root, "working") };
}

export async function loadAllDomains(repoRoot = process.cwd()) {
  const domains = await discoverDomains(repoRoot);
  return Promise.all(domains.filter((domain) => domain.manifest).map((domain) => loadDomain(repoRoot, domain.id)));
}
