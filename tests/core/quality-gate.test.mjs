import test from "node:test";
import assert from "node:assert/strict";
import { loadDomain } from "../../core/src/domain/load-domain.mjs";
import { validateDataset } from "../../core/src/validation/index.mjs";
import { evaluatePublishGate } from "../../core/src/quality/publish-gate.mjs";

const root = process.cwd();
async function basisCase() {
  const dataset = (await loadDomain(root, "linear-algebra")).dataset;
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

test("shallow explanation fixture fails the explanation gate", async () => {
  const item = await basisCase();
  item.basis.contentLayers = item.basis.contentLayers.filter((layer) => ["motivation", "intuition", "formal_definition"].includes(layer.type)).map((layer) => ({ ...layer, body: "定義だけ。" }));
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.explanation, false);
});

test("missing bridge fixture fails the pedagogy gate", async () => {
  const item = await basisCase();
  item.basis.lessons[0].sections = item.basis.lessons[0].sections.map((section) => ({ ...section, body: "定義を覚える。" }));
  item.basis.contentLayers = item.basis.contentLayers.map((layer) => ({ ...layer, body: layer.type === "motivation" ? "定義を示す。" : layer.body }));
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.pedagogy, false);
});

test("fake depth fixture fails repetitive explanation", async () => {
  const item = await basisCase();
  item.basis.contentLayers[0].body = "定義です。定義です。定義です。定義です。定義です。定義です。";
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.explanation, false);
});

test("unexplained symbol fixture fails explanation audit", async () => {
  const item = await basisCase();
  item.basis.lessons[0].sections[0].body += " 未定義のζを使う。";
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.explanation, false);
});

test("bad worked example fixture fails math audit", async () => {
  const item = await basisCase();
  item.basis.examples.find((example) => example.type === "worked").steps = ["答えを書く。"];
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.mathematics, false);
});

test("misleading visual fixture fails visual audit", async () => {
  const item = await basisCase();
  item.dataset.visuals[0].value.alt_text.ja = "";
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.visual, false);
});

test("assessment mismatch fixture fails completeness audit", async () => {
  const item = await basisCase();
  item.basis.lessons[0].exerciseIds = [];
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.completeness, false);
});

test("stale semantic audits cannot publish changed content", async () => {
  const item = await basisCase();
  item.basis.content.explanation += " 変更された説明。";
  const gate = await evaluatePublishGate(item);
  assert.equal(gate.allowed, false);
  assert.equal(gate.gates.freshness, false);
});
