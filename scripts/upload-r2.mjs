import { access, readdir, readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
const dryRun = process.env.DEPLOY_DRY_RUN === "1";
const bucket = process.env.R2_BUCKET;
const version = process.env.RELEASE_VERSION ?? "2.0.0";
const base = path.join(root, "dist", "domains", domainId);
const candidates = ["pdf", "video"];
const files = [];

async function walk(dir) {
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else files.push(file);
  }
}

for (const candidate of candidates) {
  const dir = path.join(base, candidate);
  try { await access(dir); await walk(dir); } catch {}
}
const offlineDir = path.join(root, "dist", "offline", domainId);
try { await access(offlineDir); await walk(offlineDir); } catch {}
if (!files.length) {
  console.error(`R2 upload blocked: no generated large artifacts found under dist/domains/${domainId}/{pdf,video,offline}. Build the optional artifacts first.`);
  process.exit(1);
}

const missing = ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN", "R2_BUCKET"].filter((name) => !process.env[name]);
if (missing.length && !dryRun) {
  console.error(`R2 upload blocked: missing ${missing.join(", ")}. Set DEPLOY_DRY_RUN=1 to inspect the upload plan without credentials.`);
  process.exit(1);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const uploads = files.map((file) => {
  const relative = file.startsWith(offlineDir) ? path.join("offline", path.relative(offlineDir, file)) : path.relative(base, file);
  return { file: path.relative(root, file).replaceAll("\\", "/"), key: `releases/${domainId}/${version}/${relative.replaceAll("\\", "/")}` };
});
if (dryRun || missing.length) {
  console.log(JSON.stringify({ status: "dry-run", provider: "cloudflare-r2", bucket: bucket ?? "<missing R2_BUCKET>", uploads, missing }, null, 2));
  process.exit(0);
}

for (const upload of uploads) {
  const file = path.join(root, upload.file);
  const args = ["wrangler", "r2", "object", "put", `${bucket}/${upload.key}`, `--file=${file}`, "--remote"];
  const result = await exec(command, args, { cwd: root, env: process.env, maxBuffer: 1024 * 1024 * 8 });
  if (result.stdout.trim()) console.log(result.stdout.trim());
  if (result.stderr.trim()) console.error(result.stderr.trim());
}
console.log(`Uploaded ${uploads.length} artifact(s) to R2 bucket ${bucket}.`);
