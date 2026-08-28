import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { loadDomain } from "../core/src/domain/load-domain.mjs";

const exec = promisify(execFile);
const root = process.cwd();
const domain = await loadDomain(root, process.argv[2] ?? "linear-algebra");
const conceptId = process.argv[3] ?? "basis";
const concept = domain.coreConcepts.find((item) => item.id === conceptId);
const experience = domain.learningExperiences.find((item) => item.concept_id === conceptId);
const resources = domain.conceptResources.find((item) => item.concept_id === conceptId);
if (!concept || !experience) throw new Error(`Cannot build concept PDF: missing concept or learning experience '${conceptId}'`);

const sourceById = new Map((domain.dataset.sources ?? []).map((source) => [source.id, source]));
const visualsById = new Map((domain.dataset.visuals ?? []).map((record) => [record.value.id, record.value]));
const contentByBlock = new Map((experience.lesson_content ?? []).map((item) => [item.block_id, item]));
const citationMap = new Map((resources?.claims ?? []).map((claim, index) => [claim.id, index + 1]));
const clean = (value = "") => String(value).replace(/\{\{cite:([a-z][a-z0-9-]*)\}\}/g, (_, id) => citationMap.has(id) ? `[${citationMap.get(id)}]` : "").trim();
const lines = [`% ${concept.title.ja}`, `% ${concept.title.en}`, "% Open Learn Core", "", "# はじめに", "", clean(concept.central_mental_model), "", "# 目次", "", ...experience.learner_sections.map((section) => `- ${section.title}`), "- 理解度チェック", ...(resources?.further_learning?.length ? ["- さらに学ぶ"] : []), ...(resources?.claims?.length ? ["- 参考資料"] : []), ""];

for (const section of experience.learner_sections) {
  lines.push(`# ${section.title}`, "", clean(section.description ?? ""), "");
  for (const blockId of section.block_ids) {
    const block = experience.sequence.find((item) => item.id === blockId);
    const content = contentByBlock.get(blockId);
    if (!block || !content) continue;
    lines.push(clean(content.body ?? content.explanation ?? ""), "");
    for (const equation of content.equations ?? []) lines.push("$$", equation, "$$", "");
    if (block.question ?? content.learner_prompt) lines.push("**確認**", "", clean(block.question ?? content.learner_prompt), "");
    if (block.hint) lines.push(`ヒント：${clean(block.hint)}`, "");
    if (block.answer) lines.push(`答え：${clean(block.answer)}`, "");
    if (block.worked_example) {
      const worked = block.worked_example;
      lines.push("**例題の解法**", "", clean(worked.problem), "", ...worked.reasoning_steps.map((step, index) => `${index + 1}. ${clean(step)}`), "", clean(worked.calculations), "", clean(worked.interpretation), "");
    }
    const media = (resources?.representations ?? []).filter((item) => item.after_block_id === blockId && item.visual_id);
    for (const item of media) {
      const visual = visualsById.get(item.visual_id);
      if (visual?.output_path) lines.push(`![${clean(item.caption ?? visual.alt_text?.ja ?? item.title ?? "図") }](../assets/${visual.output_path.replaceAll("\\", "/")})`, "");
    }
  }
}

lines.push("# 理解度チェック", "", ...(experience.assessments ?? []).flatMap((assessment) => [`## ${clean(assessment.prompt)}`, "", `期待される答え：${clean(assessment.expected_answer)}`, "", ...(assessment.reasoning_rubric ?? []).map((item) => `- ${clean(item)}`), ""]));
if (resources?.further_learning?.length) lines.push("# さらに学ぶ", "", ...resources.further_learning.flatMap((item) => { const source = sourceById.get(item.source_id); return source ? [`- [${source.title}](${source.url})：${clean(item.description)}`] : []; }), "");
if (resources?.claims?.length) lines.push("# 参考資料", "", ...resources.claims.flatMap((claim) => { const refs = claim.source_refs.map((ref) => { const source = sourceById.get(ref.source_id); return source ? `[${source.title}](${source.url})${ref.locator ? `（${ref.locator}）` : ""}` : ref.source_id; }).join("; "); return [`[${citationMap.get(claim.id)}] ${clean(claim.statement)} — ${refs}`]; }), "");

const output = path.join(root, "dist", "domains", domain.manifest.publish.path ?? domain.id, "pdf");
await mkdir(output, { recursive: true });
const markdownPath = path.join(output, `${conceptId}.md`);
const pdfPath = path.join(output, `${conceptId}.pdf`);
await writeFile(markdownPath, lines.join("\n"), "utf8");

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
  console.warn(`PDF source written: ${path.relative(root, markdownPath)}`);
  process.exit(0);
}
await exec(pandoc, [markdownPath, "--from", "markdown+tex_math_dollars", "--toc", "--number-sections", `--pdf-engine=${lualatex}`, "-V", "documentclass=ltjsarticle", "-V", "geometry:a4paper,margin=22mm", "-o", pdfPath], { cwd: root });
const pdfBytes = await readFile(pdfPath);
if (pdfBytes.length === 0 || pdfBytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error(`Generated PDF failed validation: ${pdfPath}`);
console.log(`Concept PDF validated: ${path.relative(root, pdfPath)} (${pdfBytes.length} bytes)`);
