import { access } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
const dryRun = process.env.DEPLOY_DRY_RUN === "1";
const projectName = process.env.CLOUDFLARE_PAGES_PROJECT ?? "open-learn-core";
const output = path.join(root, "dist");
const missing = ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"].filter((name) => !process.env[name]);

await access(output);
if (missing.length && !dryRun) {
  console.error(`Cloudflare Pages deployment blocked: missing ${missing.join(", ")}. Set DEPLOY_DRY_RUN=1 to inspect the plan without credentials.`);
  process.exit(1);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const args = ["wrangler", "pages", "deploy", output, "--project-name", projectName, "--branch", process.env.CLOUDFLARE_PAGES_BRANCH ?? "main"];
if (dryRun || missing.length) {
  console.log(JSON.stringify({ status: "dry-run", provider: "cloudflare-pages", domain: domainId, project: projectName, command: `${command} ${args.join(" ")}`, missing }, null, 2));
  process.exit(0);
}

const result = await exec(command, args, { cwd: root, env: process.env, maxBuffer: 1024 * 1024 * 8 });
console.log(result.stdout.trim());
if (result.stderr.trim()) console.error(result.stderr.trim());
