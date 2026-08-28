import { access, readFile } from "node:fs/promises";
import path from "node:path";

const domainId = process.argv[2] ?? "linear-algebra";
const target = process.argv[3] ?? "unit-basis-definition";
const isCourse = target === "course";
const file = isCourse
  ? path.join(process.cwd(), "dist", "domains", domainId, "pdf", "course.md")
  : path.join(process.cwd(), "domains", domainId, "pdf", "generated", `${target}.md`);
await access(file);
const markdown = await readFile(file, "utf8");
const issues = [];
if (!/^# /m.test(markdown)) issues.push("PDF source is missing a title");
if (!isCourse && !/## 学習内容/m.test(markdown)) issues.push("PDF source is missing the learning content section");
if (isCourse && (markdown.match(/^# /gm) ?? []).length < 1) issues.push("Course PDF source is missing a title");
if (/\\color|background-color/.test(markdown)) issues.push("PDF source includes non-monochrome styling");
if (isCourse) {
  const pdf = path.join(process.cwd(), "dist", "domains", domainId, "pdf", `${domainId}.pdf`);
  try { await access(pdf); } catch { issues.push("Course PDF binary is missing; run npm run build:pdf first"); }
}
const result = { status: issues.length ? "fail" : "pass", file: path.relative(process.cwd(), file), issues, checks: ["Pandoc source exists", "hierarchy exists", "monochrome-safe source", ...(isCourse ? ["course PDF binary exists"] : [])] };
console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exit(1);
