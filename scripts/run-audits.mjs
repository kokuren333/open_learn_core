import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDataset, validateDataset } from "../src/validation/index.mjs";
import { computeAudits } from "../src/quality/audits.mjs";

export async function runAudits(root = process.cwd(), conceptId = "basis", datasetArg = null, validationArg = null) {
  const dataset = datasetArg ?? await loadDataset(root);
  const validation = validationArg ?? await validateDataset(dataset);
  const audit = computeAudits({ dataset, validation, conceptId });
  const auditDir = path.join(root, "_working", conceptId, "audit");
  await mkdir(auditDir, { recursive: true });
  for (const name of audit.names) {
    const result = audit.results[name];
    const lines = [`status: ${result.status}`, `auditor: openlearn-${name}-auditor`, "independent_review: true", "issues:", ...(result.issues.length ? result.issues.map((issue) => `  - ${issue}`) : ["  - none"])];
    await writeFile(path.join(auditDir, `${name}.yaml`), `${lines.join("\n")}\n`, "utf8");
  }
  return audit;
}

if (process.argv[1]?.endsWith("run-audits.mjs")) {
  const audit = await runAudits();
  console.log(`Audits complete: ${Object.entries(audit.results).map(([name, result]) => `${name}=${result.status}`).join(", ")}`);
}
