import { cp, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const domainId = process.argv[2] ?? "linear-algebra";
const source = path.join(root, "dist", "domains", domainId);
const output = path.join(root, "dist", "offline", domainId);
await mkdir(output, { recursive: true });
for (const item of ["index.html", "course.html", "modules", "units", "reviews", "exercises", "concepts", "assets", "styles.css", "manifest.json", "publication-manifest.json"]) try { await cp(path.join(source, item), path.join(output, item), { recursive: true, force: true }); } catch (error) { if (error.code !== "ENOENT") throw error; }
await writeFile(path.join(output, "OFFLINE-README.txt"), "このディレクトリは、Open Learn Coreのテキスト中心オフライン版です。大容量の動画・音声は含めず、HTML/CSSと小規模アセットを同梱しています。\n", "utf8");
console.log(`Offline textual package written: ${path.relative(root, output)}`);
