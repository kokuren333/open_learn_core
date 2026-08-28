import { readdir } from "node:fs/promises";
import path from "node:path";
import { readManifest } from "./manifest.mjs";

export async function discoverDomains(repoRoot = process.cwd()) {
  const domainsRoot = path.join(repoRoot, "domains");
  let entries = [];
  try { entries = await readdir(domainsRoot, { withFileTypes: true }); } catch { return []; }
  const domains = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const domainRoot = path.join(domainsRoot, entry.name);
    try {
      const manifest = await readManifest(path.join(domainRoot, "domain.yaml"));
      domains.push({ id: manifest.id ?? entry.name, root: domainRoot, manifest });
    } catch (error) {
      domains.push({ id: entry.name, root: domainRoot, manifest: null, error: error.message });
    }
  }
  return domains;
}
