import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const configText = await readFile(path.join(root, "core", "config", "biim-slide-maker.yaml"), "utf8");
const config = Object.fromEntries([...configText.matchAll(/^([a-z_]+):\s*(.+)$/gm)].map(([, key, value]) => [key, value.trim()]));
const target = path.join(root, config.local_path);
try { await access(path.join(target, ".git")); } catch {
  try { await exec("git", ["clone", config.repository, target], { cwd: root }); } catch (error) { throw new Error(`BiimSlideMaker setup failed. Git is required: ${error.message}`); }
}
const { stdout: status } = await exec("git", ["status", "--porcelain"], { cwd: target });
if (status.trim()) throw new Error(`BiimSlideMaker checkout has local modifications; refusing to overwrite: ${target}`);
if (config.revision && config.revision !== "main") await exec("git", ["checkout", config.revision], { cwd: target });
const { stdout: revision } = await exec("git", ["rev-parse", "HEAD"], { cwd: target });
console.log(`BiimSlideMaker ready: ${revision.trim()} (${target})`);
