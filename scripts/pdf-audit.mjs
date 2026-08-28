import { access, readFile } from "node:fs/promises";
import path from "node:path";

const domainId = process.argv[2] ?? "linear-algebra";
const target = process.argv[3] ?? "unit-basis-definition";
const file = path.join(process.cwd(), "domains", domainId, "pdf", "generated", `${target}.md`);
await access(file);
const markdown = await readFile(file, "utf8");
const issues = [];
if (!/^# /m.test(markdown)) issues.push("PDF source is missing a title");
if (!/## 学習内容/m.test(markdown)) issues.push("PDF source is missing the learning content section");
if (/\\color|background-color/.test(markdown)) issues.push("PDF source includes non-monochrome styling");
const result = { status: issues.length ? "fail" : "pass", file: path.relative(process.cwd(), file), issues, checks: ["Pandoc source exists", "hierarchy exists", "monochrome-safe source"] };
console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exit(1);
