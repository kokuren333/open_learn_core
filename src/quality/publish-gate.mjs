import { readFile } from "node:fs/promises";
import path from "node:path";
import { evidenceCoverage } from "../evidence/coverage.mjs";
import { computeAudits } from "./audits.mjs";

const requiredAuditNames = ["math", "evidence", "pedagogy", "visual", "completeness"];

async function auditStatus(auditDir, name) {
  try {
    const content = await readFile(path.join(auditDir, `${name}.yaml`), "utf8");
    const match = content.match(/^status:\s*(pass|fail)\s*$/m);
    return match?.[1] ?? "fail";
  } catch {
    return "fail";
  }
}

export async function evaluatePublishGate({ dataset, validation, conceptId = "basis", auditDir = path.join(dataset.root, "_working", conceptId, "audit") }) {
  const concept = validation.conceptsById.get(conceptId);
  const coverage = evidenceCoverage(dataset, validation, conceptId);
  const computed = computeAudits({ dataset, validation, conceptId });
  const auditStatuses = Object.fromEntries(await Promise.all(requiredAuditNames.map(async (name) => [name, await auditStatus(auditDir, name)])));
  const gates = {
    structure: validation.valid,
    evidence: validation.valid && coverage.claims.withEvidence === coverage.claims.total && coverage.prerequisiteEdges.withEvidence === coverage.prerequisiteEdges.total,
    mathematics: auditStatuses.math === "pass" && computed.results.math.status === "pass",
    pedagogy: auditStatuses.pedagogy === "pass" && computed.results.pedagogy.status === "pass",
    visual: auditStatuses.visual === "pass" && computed.results.visual.status === "pass" && coverage.visuals.published >= 2,
    completeness: auditStatuses.completeness === "pass" && computed.results.completeness.status === "pass" && coverage.layers.motivation >= 1 && coverage.layers.intuition >= 1 && coverage.layers.prerequisite_recall >= 2 && coverage.layers.formal_definition >= 1 && coverage.examples.positive >= 3 && coverage.examples.counterexample >= 3 && coverage.examples.worked >= 4 && coverage.connections.total >= 3 && coverage.misconceptions.total >= 5 && coverage.exercises.total >= 15 && coverage.diagnostics.total >= 4,
    assessment: coverage.exercises.linkedToClaims >= 1 && coverage.diagnostics.total >= 4
  };
  const issues = [];
  if (!concept) issues.push(`missing concept '${conceptId}'`);
  if (!validation.valid) issues.push(...validation.issues);
  for (const [name, status] of Object.entries(auditStatuses)) if (status !== "pass") issues.push(`${name} audit did not pass`);
  if (coverage.visuals.total < 2) issues.push("basis requires at least 2 visual artifacts");
  if (coverage.exercises.total < 15) issues.push("basis requires at least 15 exercises");
  if (coverage.diagnostics.total < 4) issues.push("basis requires at least 4 diagnostics");
  for (const [name, result] of Object.entries(computed.results)) if (result.status !== "pass") issues.push(...result.issues.map((issue) => `${name}: ${issue}`));
  return { allowed: Object.values(gates).every(Boolean), status: Object.values(gates).every(Boolean) ? "published" : "blocked", gates, audits: auditStatuses, computedAudits: computed.results, coverage, issues };
}
