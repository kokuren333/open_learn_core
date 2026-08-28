import { readFile } from "node:fs/promises";
import path from "node:path";
import { evidenceCoverage } from "../evidence/coverage.mjs";
import { computeAudits, auditNames, issueText } from "./audits.mjs";
import { artifactHash } from "./artifact-hash.mjs";

async function auditArtifact(auditDir, name, currentHash) {
  try {
    const content = await readFile(path.join(auditDir, `${name}.yaml`), "utf8");
    const status = content.match(/^status:\s*(pass|fail)\s*$/m)?.[1] ?? "fail";
    const hash = content.match(/^artifact_hash:\s*(sha256:[a-f0-9]+)\s*$/m)?.[1] ?? "";
    return { status, hash, fresh: hash === currentHash };
  } catch {
    return { status: "fail", hash: "", fresh: false };
  }
}

export async function evaluatePublishGate({ dataset, validation, conceptId = "basis", auditDir = path.join(dataset.root, "_working", conceptId, "audit") }) {
  const concept = validation.conceptsById.get(conceptId);
  const coverage = evidenceCoverage(dataset, validation, conceptId);
  const computed = computeAudits({ dataset, validation, conceptId });
  const currentHash = artifactHash({ dataset, validation, conceptId });
  const artifactResults = Object.fromEntries(await Promise.all(auditNames.map(async (name) => [name, await auditArtifact(auditDir, name, currentHash)])));
  const auditStatuses = Object.fromEntries(Object.entries(artifactResults).map(([name, value]) => [name, value.status]));
  const freshness = Object.fromEntries(Object.entries(artifactResults).map(([name, value]) => [name, value.fresh]));
  const gates = {
    structure: validation.valid,
    deterministic: validation.valid && computed.deterministic.references,
    evidence: validation.valid && coverage.claims.withEvidence === coverage.claims.total && coverage.prerequisiteEdges.withEvidence === coverage.prerequisiteEdges.total,
    mathematics: auditStatuses.math === "pass" && computed.results.math.status === "pass",
    pedagogy: auditStatuses.pedagogy === "pass" && computed.results.pedagogy.status === "pass",
    explanation: auditStatuses.explanation === "pass" && computed.results.explanation.status === "pass",
    visual: auditStatuses.visual === "pass" && computed.results.visual.status === "pass",
    completeness: auditStatuses.completeness === "pass" && computed.results.completeness.status === "pass",
    freshness: auditNames.every((name) => freshness[name]),
    assessment: coverage.exercises.linkedToClaims >= 1 && coverage.diagnostics.total >= 5
  };
  const issues = [];
  if (!concept) issues.push(`missing concept '${conceptId}'`);
  if (!validation.valid) issues.push(...validation.issues);
  for (const name of auditNames) {
    if (auditStatuses[name] !== "pass") issues.push(`${name} audit did not pass`);
    if (!freshness[name]) issues.push(`${name} audit is missing or stale`);
  }
  for (const [name, current] of Object.entries(computed.results)) if (current.status !== "pass") issues.push(...current.issues.map((item) => `${name}: ${issueText(item)}`));
  const allowed = Object.values(gates).every(Boolean);
  return { allowed, status: allowed ? "published" : "blocked", gates, audits: auditStatuses, freshness, artifactHash: currentHash, computedAudits: computed.results, coverage, issues };
}
