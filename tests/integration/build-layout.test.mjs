import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");

test("published output has portal and domain manifest", async () => {
  await access(path.join(dist, "index.html"));
  await access(path.join(dist, "domain-index.json"));
  await access(path.join(dist, "domains", "linear-algebra", "index.html"));
  const index = JSON.parse(await readFile(path.join(dist, "domain-index.json"), "utf8"));
  assert.equal(index.domains[0].id, "linear-algebra");
  const manifest = JSON.parse(await readFile(path.join(dist, "domains", "linear-algebra", "manifest.json"), "utf8"));
  assert.ok(manifest.conceptCount >= 12);
});
