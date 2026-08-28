import { loadDomain } from "../core/src/domain/load-domain.mjs";
import path from "node:path";
import { validateDataset } from "../core/src/validation/index.mjs";
import { runAudits } from "./run-audits.mjs";
import { evaluatePublishGate } from "../core/src/quality/publish-gate.mjs";

const root = process.cwd();
const domain = await loadDomain(root, process.argv[2]);
const dataset = domain.dataset;
const validation = await validateDataset(dataset);
const conceptId = process.argv[3] ?? domain.manifest.quality_gate_concepts?.[0] ?? domain.manifest.entry_concepts?.[0] ?? dataset.concepts[0]?.value?.id;
await runAudits(root, conceptId, dataset, validation, domain.root);
const gate = await evaluatePublishGate({ dataset, validation, conceptId, auditDir: path.join(domain.root, "working", conceptId, "audit") });
console.log(JSON.stringify(gate, null, 2));
if (!gate.allowed) process.exit(1);
