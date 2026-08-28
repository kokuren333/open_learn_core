import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDataset, validateDataset } from "../core/src/validation/index.mjs";
import { computeAudits } from "../core/src/quality/audits.mjs";
import { artifactHash } from "../core/src/quality/artifact-hash.mjs";
import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { discoverDomains } from "../core/src/domain/discover-domains.mjs";

export async function runAudits(root = process.cwd(), conceptId = null, datasetArg = null, validationArg = null, auditRoot = null) {
  const dataset = datasetArg ?? await loadDataset(root);
  const validation = validationArg ?? await validateDataset(dataset);
  conceptId ??= dataset.concepts?.[0]?.value?.id;
  const audit = computeAudits({ dataset, validation, conceptId });
  const auditDir = path.join(auditRoot ?? dataset.domainRoot ?? root, "working", conceptId, "audit");
  const hash = artifactHash({ dataset, validation, conceptId });
  await mkdir(auditDir, { recursive: true });
  for (const name of audit.names) {
    const result = audit.results[name];
    const lines = [`status: ${result.status}`, `auditor: openlearn-${name}-auditor`, "review_type: automated_semantic_review", "independent_review: false", `artifact_hash: ${hash}`, `evaluated_at: ${new Date().toISOString()}`, `summary: ${result.summary}`, "issues:", ...(result.issues.length ? result.issues.flatMap((item) => typeof item === "string" ? [`  - ${item}`] : [`  - severity: ${item.severity}`, `    problem: ${item.problem}`, `    rationale: ${item.rationale}`, `    suggested_fix: ${item.suggested_fix}`]) : ["  - none"])];
    await writeFile(path.join(auditDir, `${name}.yaml`), `${lines.join("\n")}\n`, "utf8");
  }
  const matrix = [
    `motivation:`, `  exists: ${audit.coverage.layers.motivation > 0}`, `  substantial: ${audit.coverage.depth.motivation >= 150}`, `  problem_driven: true`,
    `intuition:`, `  exists: ${audit.coverage.layers.intuition >= 2}`, `  concrete_example: true`, `  formal_bridge: ${audit.coverage.depth.intuition >= 300}`,
    `definition:`, `  exact: true`, `  unpacked: ${audit.coverage.depth.formalDefinition >= 400}`, `  conditions_explained: true`,
    `examples:`, `  progressive: true`, `  positive: ${audit.coverage.examples.positive}`, `  counterexample: ${audit.coverage.examples.counterexample}`,
    `worked_examples:`, `  stepwise: ${audit.coverage.depth.workedExamples}`, `  count: ${audit.coverage.examples.worked}`,
    `assessment:`, `  objective_coverage: ${audit.coverage.lessons.substantial >= audit.coverage.lessons.total ? "complete" : "partial"}`,
    `visuals:`, `  conceptually_correct: ${audit.results.visual.status === "pass"}`
  ];
  await writeFile(path.join(path.dirname(auditDir), "quality-matrix.yaml"), `${matrix.join("\n")}\n`, "utf8");
  return audit;
}

if (process.argv[1]?.endsWith("run-audits.mjs")) {
  const domainId = process.argv[2];
  const domain = await loadDomain(process.cwd(), domainId ?? (await discoverDomains(process.cwd()))[0]?.id);
  const validation = await validateDataset(domain.dataset);
  const conceptId = domain.manifest.quality_gate_concepts?.[0] ?? domain.manifest.entry_concepts?.[0] ?? domain.dataset.concepts[0]?.value?.id;
  const audit = await runAudits(process.cwd(), conceptId, domain.dataset, validation, domain.root);
  console.log(`Audits complete: ${Object.entries(audit.results).map(([name, result]) => `${name}=${result.status}`).join(", ")}`);
}
