import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { unitToMarkdown, moduleToMarkdown } from "../core/src/pdf/markdown.mjs";

const exec = promisify(execFile);
const mode = process.argv[2] ?? "check";
const root = process.cwd();

async function available(command, args = ["--version"]) {
  const candidates = [command, `${command}.exe`];
  if (process.platform === "win32") {
    if (command === "pandoc" && process.env.LOCALAPPDATA) candidates.push(path.join(process.env.LOCALAPPDATA, "Pandoc", "pandoc.exe"));
    if (command === "lualatex" && process.env.LOCALAPPDATA) candidates.push(path.join(process.env.LOCALAPPDATA, "Programs", "MiKTeX", "miktex", "bin", "x64", "lualatex.exe"));
    try {
      const located = await exec("where.exe", [command]);
      candidates.push(...located.stdout.split(/\r?\n/).map((value) => value.trim()).filter(Boolean));
    } catch {}
  }
  for (const candidate of [...new Set(candidates)]) {
    try {
      const result = await exec(candidate, args);
      return { available: true, version: `${result.stdout}\n${result.stderr ?? ""}`.trim().split(/\r?\n/)[0], command: candidate };
    } catch {}
  }
  return { available: false };
}
if (mode === "check") {
  console.log(JSON.stringify({ pandoc: await available("pandoc"), lualatex: await available("lualatex") }, null, 2));
  process.exit(0);
}
const domain = await loadDomain(root, process.argv[3] ?? "linear-algebra");
const units = domain.courseData.units.map((record) => record.value);
const modules = domain.courseData.modules.map((record) => record.value);
const outputRoot = path.join(domain.root, "pdf", "generated");
await mkdir(outputRoot, { recursive: true });
let name; let markdown;
if (mode === "unit") {
  const unitId = process.argv[4] ?? "basis-definition";
  const unit = units.find((item) => item.id === unitId);
  if (!unit) throw new Error(`unknown Learning Unit '${unitId}'`);
  const module = modules.find((item) => item.id === unit.module);
  name = `unit-${unit.id}`;
  markdown = unitToMarkdown(unit, module?.title?.ja ?? "");
} else if (mode === "module") {
  const moduleId = process.argv[4] ?? "module-vector-spaces";
  const module = modules.find((item) => item.id === moduleId);
  if (!module) throw new Error(`unknown Module '${moduleId}'`);
  name = `module-${module.id}`;
  markdown = moduleToMarkdown(module, module.units.map((id) => units.find((unit) => unit.id === id)).filter(Boolean));
} else throw new Error("Usage: npm run pdf:check | pdf:unit -- linear-algebra <unit> | pdf:module -- linear-algebra <module>");
const markdownPath = path.join(outputRoot, `${name}.md`);
const pdfPath = path.join(outputRoot, `${name}.pdf`);
await writeFile(markdownPath, markdown, "utf8");
const pandoc = await available("pandoc");
const lualatex = await available("lualatex");
if (!pandoc.available || !lualatex.available) {
  console.warn(`PDF source written: ${path.relative(root, markdownPath)}`);
  console.warn("Pandoc and LuaLaTeX are required for PDF rendering. Install them, then rerun this command.");
  process.exit(0);
}
try {
  await exec(pandoc.command, [markdownPath, `--pdf-engine=${lualatex.command}`, "-V", "documentclass=ltjsarticle", "-V", "geometry:a4paper", "-o", pdfPath], { cwd: root });
  console.log(`PDF written: ${path.relative(root, pdfPath)}`);
} catch (error) {
  throw new Error(`Pandoc/LuaLaTeX PDF build failed: ${error.stderr || error.message}`);
}
