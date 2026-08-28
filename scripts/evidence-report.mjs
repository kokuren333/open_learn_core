import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { evidenceCoverage } from "../core/src/evidence/coverage.mjs";
import { validateDataset } from "../core/src/validation/index.mjs";

const domain = await loadDomain(process.cwd(), process.argv[2]);
const dataset = domain.dataset;
const result = await validateDataset(dataset);
if (!result.valid) {
  console.error("Cannot report invalid dataset:\n" + result.issues.map((issue) => `- ${issue}`).join("\n"));
  process.exit(1);
}
const conceptId = process.argv[3] ?? domain.manifest.quality_gate_concepts?.[0] ?? domain.manifest.entry_concepts?.[0] ?? dataset.concepts[0]?.value?.id;
const coverage = evidenceCoverage(dataset, result, conceptId);
console.log(`Evidence coverage: ${coverage.conceptId}`);
console.log(`- claims with evidence: ${coverage.claims.withEvidence}/${coverage.claims.total}`);
console.log(`- prerequisite edges with rationale: ${coverage.prerequisiteEdges.withRationale}/${coverage.prerequisiteEdges.total}`);
console.log(`- prerequisite edges with evidence: ${coverage.prerequisiteEdges.withEvidence}/${coverage.prerequisiteEdges.total}`);
console.log(`- curriculum decisions with evidence: ${coverage.curriculumDecisions.withEvidence}/${coverage.curriculumDecisions.total}`);
console.log(`- lessons linked to claims: ${coverage.lessons.linkedToClaims}/${coverage.lessons.total}`);
console.log(`- exercises linked to claims: ${coverage.exercises.linkedToClaims}/${coverage.exercises.total}`);
console.log(`- published visuals: ${coverage.visuals.published}/${coverage.visuals.total}`);
console.log(`- examples: ${coverage.examples.positive} positive, ${coverage.examples.counterexample} counterexample, ${coverage.examples.worked} worked`);
console.log(`- diagnostics: ${coverage.diagnostics.total}; misconceptions: ${coverage.misconceptions.total}; connections: ${coverage.connections.total}`);
