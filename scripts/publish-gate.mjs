import { loadDataset, validateDataset } from "../src/validation/index.mjs";
import { runAudits } from "./run-audits.mjs";
import { evaluatePublishGate } from "../src/quality/publish-gate.mjs";

const root = process.cwd();
const dataset = await loadDataset(root);
const validation = await validateDataset(dataset);
await runAudits(root, "basis", dataset, validation);
const gate = await evaluatePublishGate({ dataset, validation, conceptId: "basis" });
console.log(JSON.stringify(gate, null, 2));
if (!gate.allowed) process.exit(1);
