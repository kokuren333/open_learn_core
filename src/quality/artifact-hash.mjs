import { createHash } from "node:crypto";

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}

export function artifactHash({ dataset, validation, conceptId = "basis" }) {
  const concept = validation.conceptsById.get(conceptId);
  const evidence = (dataset.evidenceItems ?? []).map((record) => record.value).filter((item) => item.concept === conceptId || item.supports?.some((id) => concept?.claims?.some((claim) => claim.id === id)));
  const visuals = (concept?.visualIds ?? []).map((id) => validation.visualsById?.get(id)).filter(Boolean);
  const payload = stable({ concept, evidence, visuals });
  return `sha256:${createHash("sha256").update(JSON.stringify(payload)).digest("hex")}`;
}
