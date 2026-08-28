import { loadDataset, validateDataset } from "../src/validation/index.mjs";
import { evidenceCoverage } from "../src/evidence/coverage.mjs";

const dataset = await loadDataset(process.cwd());
const validation = await validateDataset(dataset);
if (!validation.valid) {
  console.error("Cannot report invalid dataset:\n" + validation.issues.map((issue) => `- ${issue}`).join("\n"));
  process.exit(1);
}
const coverage = evidenceCoverage(dataset, validation, "basis");
console.log(`Evidence coverage: ${coverage.conceptId}`);
console.log(`- claims with evidence: ${coverage.claims.withEvidence}/${coverage.claims.total}`);
console.log(`- prerequisite edges with rationale: ${coverage.prerequisiteEdges.withRationale}/${coverage.prerequisiteEdges.total}`);
console.log(`- prerequisite edges with evidence: ${coverage.prerequisiteEdges.withEvidence}/${coverage.prerequisiteEdges.total}`);
console.log(`- curriculum decisions with evidence: ${coverage.curriculumDecisions.withEvidence}/${coverage.curriculumDecisions.total}`);
console.log(`- lessons linked to claims: ${coverage.lessons.linkedToClaims}/${coverage.lessons.total}`);
console.log(`- exercises linked to claims: ${coverage.exercises.linkedToClaims}/${coverage.exercises.total}`);
