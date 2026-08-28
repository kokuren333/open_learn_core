import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { readVideoSource } from "../core/src/video/io.mjs";
import { writeBiimCompatibility } from "../core/src/video/biim-adapter.mjs";
import { auditVideoSource } from "../core/src/video/audit.mjs";

const exec = promisify(execFile);
const root = process.cwd();
const domainId = process.argv[2];
const unitId = process.argv[3];
if (!domainId || !unitId) throw new Error("Usage: npm run video:build -- <domain> <unit>");
const domain = await loadDomain(root, domainId);
const base = path.join(domain.root, "video", "units", unitId);
const source = await readVideoSource(path.join(base, "video.yaml"));
const audit = auditVideoSource({ source, slidesMarkdown: await readFile(path.join(base, "slides.md"), "utf8") });
if (audit.status === "fail") throw new Error(`Video source audit failed: ${audit.issues.map((item) => item.problem).join("; ")}`);
const output = await writeBiimCompatibility({ domainRoot: domain.root, source });
async function detectTool(command) {
  const versionArgs = command === "ffmpeg" ? ["-version"] : ["--version"];
  const candidates = [command, `${command}.exe`, `${command}.cmd`];
  if (process.platform === "win32") candidates.push(path.join(root, "node_modules", ".bin", `${command}.cmd`));
  if (process.platform === "win32") {
    try {
      const located = await exec("where.exe", [command]);
      candidates.push(...located.stdout.split(/\r?\n/).map((value) => value.trim()).filter(Boolean));
    } catch {}
  }
  for (const candidate of [...new Set(candidates)]) {
    try {
      const result = candidate.toLowerCase().endsWith(".cmd") && process.platform === "win32"
        ? await exec(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", candidate, ...versionArgs])
        : await exec(candidate, versionArgs);
      const versionOutput = `${result.stdout}\n${result.stderr ?? ""}`.trim();
      return { available: true, version: versionOutput.split(/\r?\n/)[0], command: candidate };
    } catch {}
  }
  return { available: false };
}

const tools = {};
for (const command of ["marp", "ffmpeg"]) tools[command] = await detectTool(command);
const plan = { unit: unitId, canonical_subtitles: "script", tts_input: "spoken_script", biim_root: ".tools/BiimSlideMaker", output, tools, rendering: Object.values(tools).every((item) => item.available) ? "ready" : "blocked_external_tools" };
await mkdir(output, { recursive: true });
await writeFile(path.join(output, "build-plan.json"), JSON.stringify(plan, null, 2) + "\n");
console.log(JSON.stringify(plan, null, 2));
if (plan.rendering === "blocked_external_tools") console.warn("Source preparation succeeded; install Marp CLI and ffmpeg for local MP4 rendering.");
