import test from "node:test";
import assert from "node:assert/strict";
import { loadDataset, validateDataset } from "../src/validation/index.mjs";
import { evaluatePublishGate } from "../src/quality/publish-gate.mjs";

const root = process.cwd();
async function basisCase() {
  const dataset = await loadDataset(root);
  const basis = dataset.concepts.find((record) => record.value.id === "basis").value;
  return { dataset, basis, validation: await validateDataset(dataset) };
}

test("math failure blocks publish", async () => {
  const item = await basisCase();
  item.basis.claims.find((claim) => claim.id === "basis-claim-01").statement = "基底は便利なベクトルの集合である。";
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.mathematics, false);
});

test("evidence failure blocks publish", async () => {
  const item = await basisCase();
  item.basis.claims[0].evidence = [];
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.evidence, false);
});

test("pedagogy failure blocks publish", async () => {
  const item = await basisCase();
  item.basis.contentLayers = item.basis.contentLayers.filter((layer) => layer.type !== "motivation");
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.pedagogy, false);
});

test("visual failure blocks publish", async () => {
  const item = await basisCase();
  item.dataset.visuals[0].value.alt_text.ja = "";
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.visual, false);
});

test("completeness failure blocks publish", async () => {
  const item = await basisCase();
  item.basis.exercises = item.basis.exercises.slice(0, 1);
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.completeness, false);
});

test("an audit artifact failure blocks publish", async () => {
  const item = await basisCase();
  const gate = await evaluatePublishGate({ ...item, auditDir: `${root}/tests/fixtures/audit-fail` });
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.mathematics, false);
});
