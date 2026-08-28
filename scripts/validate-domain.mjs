import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { validateDomain } from "../core/src/domain/validate-domain.mjs";
import { discoverDomains } from "../core/src/domain/discover-domains.mjs";

const root = process.cwd();
const domainId = process.argv[2] ?? (await discoverDomains(root))[0]?.id;
const domain = await loadDomain(root, domainId);
const result = await validateDomain(domain);
if (!result.valid) {
  console.error(`Domain '${domain.id}' validation failed:\n${result.issues.map((issue) => `- ${issue}`).join("\n")}`);
  process.exit(1);
}
console.log(`Domain validation passed: ${domain.id} (${domain.dataset.concepts.length} concepts, ${domain.dataset.curricula.length} curricula).`);
