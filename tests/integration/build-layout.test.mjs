import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");

test("published output has portal and domain manifest", async () => {
  await access(path.join(dist, "index.html"));
  await access(path.join(dist, "domain-index.json"));
  await access(path.join(dist, "domains", "linear-algebra", "index.html"));
  await access(path.join(dist, "domains", "statistics", "index.html"));
  const index = JSON.parse(await readFile(path.join(dist, "domain-index.json"), "utf8"));
  assert.equal(index.domains[0].id, "linear-algebra");
  const statistics = index.domains.find((domain) => domain.id === "statistics");
  assert.ok(statistics, "statistics must be discoverable from the portal index");
  assert.equal(statistics.conceptCount, 30);
  const manifest = JSON.parse(await readFile(path.join(dist, "domains", "linear-algebra", "manifest.json"), "utf8"));
  assert.equal(manifest.conceptCount, 30);
  assert.equal(index.domains[0].conceptCount, manifest.conceptCount);
  const statisticsManifest = JSON.parse(await readFile(path.join(dist, "domains", "statistics", "manifest.json"), "utf8"));
  assert.equal(statisticsManifest.conceptCount, 30);
  assert.equal(statisticsManifest.curricula[0].title.ja, "統計学の基礎");
  assert.match(await readFile(path.join(dist, "index.html"), "utf8"), /30 concepts/);
});
