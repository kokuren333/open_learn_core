import { loadDataset, validateDataset, formatIssues } from "../src/validation/index.mjs";

const dataset = await loadDataset(process.cwd());
const result = await validateDataset(dataset);
if (!result.valid) {
  console.error(`Validation failed (${result.issues.length} issue(s))\n${formatIssues(result.issues)}`);
  process.exitCode = 1;
} else {
  console.log(`Validation passed: ${result.conceptsById.size} concepts, ${dataset.curricula.length} curriculum, ${dataset.sources.length} sources.`);
}
