import { loadAllDomains } from "../core/src/domain/load-domain.mjs";
import { validateDomain } from "../core/src/domain/validate-domain.mjs";
import { formatIssues } from "../core/src/validation/index.mjs";

const domains = await loadAllDomains(process.cwd());
const results = await Promise.all(domains.map((domain) => validateDomain(domain)));
const issues = results.flatMap((result) => result.issues);
if (issues.length) {
  console.error(`Validation failed (${issues.length} issue(s))\n${formatIssues(issues)}`);
  process.exitCode = 1;
} else {
  const counts = domains.reduce((sum, domain) => ({ concepts: sum.concepts + domain.dataset.concepts.length, curricula: sum.curricula + domain.dataset.curricula.length, sources: sum.sources + domain.dataset.sources.length, evidence: sum.evidence + domain.dataset.evidenceItems.length, visuals: sum.visuals + domain.dataset.visuals.length }), { concepts: 0, curricula: 0, sources: 0, evidence: 0, visuals: 0 });
  console.log(`Validation passed: ${counts.concepts} concepts, ${counts.curricula} curriculum, ${counts.sources} sources, ${counts.evidence} evidence items, ${counts.visuals} visuals across ${domains.length} domain(s).`);
}
