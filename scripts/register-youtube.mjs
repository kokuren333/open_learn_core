import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const domainId = process.argv[2];
const unitId = process.argv[3];
const url = process.argv[4];
if (!domainId || !unitId || !url) throw new Error("Usage: npm run youtube:register -- <domain> <unit> <youtube-url>");
const match = url.match(/[?&]v=([^&]+)/) ?? url.match(/youtu\.be\/([^?]+)/);
if (!match) throw new Error("Expected a YouTube URL such as https://youtube.com/watch?v=abc123");
const root = process.cwd();
const file = path.join(root, "domains", domainId, "video", "units", unitId, "youtube.yaml");
let metadata = { platform: "youtube", status: "not_planned", language: "ja" };
try { metadata = JSON.parse(await readFile(file, "utf8")); } catch {}
metadata.platform = "youtube";
metadata.status = "published";
metadata.video_id = match[1];
metadata.url = url;
metadata.published_at = new Date().toISOString().slice(0, 10);
await writeFile(file, JSON.stringify(metadata, null, 2) + "\n", "utf8");
console.log(`Registered YouTube publication for ${domainId}/${unitId}: ${url}`);
