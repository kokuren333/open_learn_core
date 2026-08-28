import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { validateJsonSchema } from "../validation/schema.mjs";
import { loadDomain } from "./load-domain.mjs";

export async function validateDomain(domain, { schema } = {}) {
  const manifestSchema = schema ?? JSON.parse(await readFile(path.join(domain.dataset.schemasRoot, "domain-manifest.schema.json"), "utf8"));
  const schemas = { "concept.schema.json": JSON.parse(await readFile(path.join(domain.dataset.schemasRoot, "concept.schema.json"), "utf8")) };
  const issues = [...validateJsonSchema(domain.manifest, manifestSchema, { schemas, path: `${domain.root}/domain.yaml` })];
  if (domain.manifest.id !== path.basename(domain.root)) issues.push("domain manifest id must match directory name");
  const datasetValidation = await (await import("../validation/index.mjs")).validateDataset(domain.dataset);
  issues.push(...datasetValidation.issues);
  for (const id of domain.manifest.entry_curriculum ?? []) if (!datasetValidation.curriculaById.has(id)) issues.push(`manifest entry curriculum '${id}' is missing`);
  for (const id of domain.manifest.entry_concepts ?? []) if (!datasetValidation.conceptsById.has(id)) issues.push(`manifest entry concept '${id}' is missing`);
  for (const visualRecord of domain.dataset.visuals ?? []) {
    const outputPath = visualRecord.value?.output_path;
    if (!outputPath) continue;
    const assetPath = path.resolve(domain.assetRoot, outputPath);
    if (!assetPath.startsWith(`${domain.assetRoot}${path.sep}`)) issues.push(`visual '${visualRecord.value.id}' asset path escapes asset root`);
    else try { await access(assetPath); } catch { issues.push(`visual '${visualRecord.value.id}' asset is missing: ${outputPath}`); }
  }
  return { valid: issues.length === 0, issues, datasetValidation };
}

export async function loadAndValidateDomain(repoRoot, domainId) {
  const domain = await loadDomain(repoRoot, domainId);
  return { domain, validation: await validateDomain(domain) };
}
