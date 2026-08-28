import { access, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
const version = process.env.RELEASE_VERSION ?? "2.0.0";
const dist = path.join(root, "dist");
const domainDist = path.join(dist, "domains", domainId);
const releaseDir = path.join(dist, "release");
await access(domainDist);
await rm(releaseDir, { recursive: true, force: true });
await mkdir(releaseDir, { recursive: true });

async function archive(source, destination) {
  await access(source);
  const command = process.platform === "win32" ? "tar.exe" : "tar";
  await exec(command, ["-a", "-c", "-f", destination, "-C", source, "."], { cwd: root, maxBuffer: 1024 * 1024 * 8 });
}

const artifacts = [];
const htmlZip = path.join(releaseDir, `${domainId}-v${version}-html.zip`);
await archive(domainDist, htmlZip);
artifacts.push(htmlZip);
const pdf = path.join(domainDist, "pdf", `${domainId}.pdf`);
try { await access(pdf); const destination = path.join(releaseDir, `${domainId}-v${version}.pdf`); await copyFile(pdf, destination); artifacts.push(destination); } catch {}
const offline = path.join(dist, "offline", domainId);
try { await access(offline); const destination = path.join(releaseDir, `${domainId}-v${version}-offline.zip`); await archive(offline, destination); artifacts.push(destination); } catch {}
const manifest = path.join(domainDist, "publication-manifest.json");
try { await access(manifest); const destination = path.join(releaseDir, `${domainId}-v${version}-source-manifest.json`); await copyFile(manifest, destination); artifacts.push(destination); } catch {}

const checksums = [];
for (const file of artifacts.sort((a, b) => a.localeCompare(b))) checksums.push(`${createHash("sha256").update(await readFile(file)).digest("hex")}  ${path.basename(file)}`);
await writeFile(path.join(releaseDir, "checksums.txt"), `${checksums.join("\n")}\n`, "utf8");
console.log(JSON.stringify({ status: "pass", domain: domainId, version, artifacts: [...artifacts.map((file) => path.relative(root, file).replaceAll("\\", "/")), "dist/release/checksums.txt"] }, null, 2));
