import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { moduleToMarkdown } from "../core/src/pdf/markdown.mjs";

const exec = promisify(execFile);
const root = process.cwd();
const domain = await loadDomain(root, process.argv[2] ?? "linear-algebra");
const modules = domain.courseData.modules.map((record) => record.value).sort((a, b) => a.order - b.order);
const units = new Map(domain.courseData.units.map((record) => [record.value.id, record.value]));
const output = path.join(root, "dist", "domains", domain.id, "pdf");
await mkdir(output, { recursive: true });
const course = domain.courseData.courses[0]?.value;
const markdown = [`% ${course.title.ja}`, `% Open Learn Core v${course.version ?? "2.0.0"}`, "%", "# コース概要", "", course.description.ja, "", "## 学習目標", "", ...(course.target_learner ? [`対象：${course.target_learner.ja}`, ""] : []), "## 目次", "", ...modules.map((module) => `- ${module.title.ja}`), "", ...modules.map((module) => moduleToMarkdown(module, module.units.map((id) => units.get(id)).filter(Boolean)))].join("\n");
const markdownPath = path.join(output, "course.md");
const pdfPath = path.join(output, "linear-algebra.pdf");
await writeFile(markdownPath, markdown, "utf8");

async function findTool(command) {
  const candidates = [command, `${command}.exe`];
  if (process.platform === "win32") {
    if (command === "pandoc" && process.env.LOCALAPPDATA) candidates.push(path.join(process.env.LOCALAPPDATA, "Pandoc", "pandoc.exe"));
    if (command === "lualatex" && process.env.LOCALAPPDATA) candidates.push(path.join(process.env.LOCALAPPDATA, "Programs", "MiKTeX", "miktex", "bin", "x64", "lualatex.exe"));
    try { candidates.push(...(await exec("where.exe", [command])).stdout.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)); } catch {}
  }
  for (const candidate of [...new Set(candidates)]) try { await exec(candidate, ["--version"]); return candidate; } catch {}
  return null;
}
const pandoc = await findTool("pandoc");
const lualatex = await findTool("lualatex");
if (!pandoc || !lualatex) {
  console.warn(`PDF-ready source written: ${path.relative(root, markdownPath)}`);
  console.warn("Pandoc and LuaLaTeX are required for binary PDF output. See docs/pdf-pipeline.md.");
  process.exit(0);
}
try {
  await exec(pandoc, [markdownPath, "--toc", "--number-sections", `--pdf-engine=${lualatex}`, "-V", "documentclass=ltjsarticle", "-V", "geometry:a4paper,margin=22mm", "-o", pdfPath], { cwd: root });
  console.log(`Course PDF written: ${path.relative(root, pdfPath)}`);
} catch (error) {
  throw new Error(`Pandoc/LuaLaTeX course build failed: ${error.stderr || error.message}`);
}
