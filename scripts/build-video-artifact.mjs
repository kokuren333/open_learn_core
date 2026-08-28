import { spawn } from "node:child_process";
import { access, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadDomain } from "../core/src/domain/load-domain.mjs";
import { readVideoSource } from "../core/src/video/io.mjs";
import { auditVideoSource } from "../core/src/video/audit.mjs";

const root = process.cwd();
const domainId = process.argv[2];
const unitId = process.argv[3];
if (!domainId || !unitId) throw new Error("Usage: node scripts/build-video-artifact.mjs <domain> <unit>");
const domain = await loadDomain(root, domainId);
const unitRoot = path.join(domain.root, "video", "units", unitId);
const source = await readVideoSource(path.join(unitRoot, "video.yaml"));
const slidesMarkdown = await readFile(path.join(unitRoot, "slides.md"), "utf8");
const audit = auditVideoSource({ source, slidesMarkdown });
if (audit.status === "fail") throw new Error(`Video source audit failed: ${audit.issues.map((item) => item.problem).join("; ")}`);

const output = path.join(domain.root, "video", "generated", "rendered", unitId);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const marpCommand = path.join(root, "node_modules", "@marp-team", "marp-cli", "marp-cli.js");
const runTool = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.on("error", reject);
  child.on("close", (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${command} exited with code ${code}: ${stderr}`)));
});
const prefix = path.join(output, "rendered-slide.png");
await runTool(process.execPath, [marpCommand, path.join(unitRoot, "slides.md"), "--images", "png", "--output", prefix]);
const renderedSlides = (await readdir(output)).filter((name) => /^rendered-slide\.\d{3}\.png$/.test(name)).sort();
if (renderedSlides.length !== source.slides.length) throw new Error(`Marp rendered ${renderedSlides.length} slides; expected ${source.slides.length}`);
const framePaths = [];
for (const [index, name] of renderedSlides.entries()) {
  const target = path.join(output, `slide-${String(index + 1).padStart(3, "0")}.png`);
  await rename(path.join(output, name), target);
  framePaths.push(target);
}

const engineUrl = process.env.VOICEVOX_URL ?? "http://127.0.0.1:50021";
let speakerId = 3;
try {
  const speakers = await (await fetch(`${engineUrl}/speakers`)).json();
  const speaker = speakers.find((item) => item.name === source.tts.speaker.name)?.styles.find((item) => item.name === source.tts.speaker.style);
  if (speaker) speakerId = speaker.id;
} catch (error) { throw new Error(`VOICEVOX engine is unavailable at ${engineUrl}: ${error.message}`); }

const audioPaths = [];
for (const [index, slide] of source.slides.entries()) {
  const queryUrl = new URL(`${engineUrl}/audio_query`);
  queryUrl.searchParams.set("text", slide.spoken_script);
  queryUrl.searchParams.set("speaker", String(speakerId));
  const queryResponse = await fetch(queryUrl, { method: "POST" });
  if (!queryResponse.ok) throw new Error(`VOICEVOX audio_query failed for slide ${slide.id}: ${queryResponse.status}`);
  const query = await queryResponse.json();
  const synthesisResponse = await fetch(`${engineUrl}/synthesis?speaker=${speakerId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(query) });
  if (!synthesisResponse.ok) throw new Error(`VOICEVOX synthesis failed for slide ${slide.id}: ${synthesisResponse.status}`);
  const audioPath = path.join(output, `audio-${String(index + 1).padStart(3, "0")}.wav`);
  await writeFile(audioPath, Buffer.from(await synthesisResponse.arrayBuffer()));
  audioPaths.push(audioPath);
}

const segmentPaths = [];
for (const [index, [frame, audio]] of [...framePaths.map((frame, index) => [frame, audioPaths[index]]).entries()]) {
  const segment = path.join(output, `segment-${String(index + 1).padStart(3, "0")}.mp4`);
  await runTool("ffmpeg", ["-y", "-loop", "1", "-i", frame, "-i", audio, "-c:v", "libx264", "-tune", "stillimage", "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2", "-c:a", "aac", "-shortest", "-pix_fmt", "yuv420p", segment]);
  segmentPaths.push(segment);
}

const concatPath = path.join(output, "concat.txt");
await writeFile(concatPath, segmentPaths.map((segment) => `file '${segment.replaceAll("'", "'\\''")}'`).join("\n") + "\n", "utf8");
const videoPath = path.join(output, `${unitId}.mp4`);
await runTool("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatPath, "-c", "copy", "-movflags", "+faststart", videoPath]);

const probe = JSON.parse((await runTool("ffprobe", ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", videoPath])).stdout);
const duration = Number(probe.format?.duration ?? 0);
if (!Number.isFinite(duration) || duration <= 0 || !(probe.streams ?? []).some((stream) => stream.codec_type === "video") || !(probe.streams ?? []).some((stream) => stream.codec_type === "audio")) throw new Error("ffprobe rejected the generated video");
const srtPath = path.join(output, `${unitId}.srt`);
const durations = [];
for (const segment of segmentPaths) {
  const segmentProbe = JSON.parse((await runTool("ffprobe", ["-v", "quiet", "-print_format", "json", "-show_format", segment])).stdout);
  durations.push(Number(segmentProbe.format?.duration ?? 0));
}
const timestamp = (seconds) => { const ms = Math.max(0, Math.round(seconds * 1000)); const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); const s = Math.floor((ms % 60000) / 1000); return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`; };
let cursor = 0;
await writeFile(srtPath, source.slides.map((slide, index) => { const start = cursor; cursor += durations[index]; return `${index + 1}\n${timestamp(start)} --> ${timestamp(cursor)}\n${slide.script}\n`; }).join("\n"), "utf8");
await writeFile(path.join(output, "video-manifest.json"), JSON.stringify({ unit: unitId, artifact: path.relative(domain.root, videoPath).replaceAll("\\", "/"), subtitles: path.relative(domain.root, srtPath).replaceAll("\\", "/"), duration_seconds: duration, streams: { video: true, audio: true, subtitles: true }, status: "validated", source_audit: audit.status }, null, 2) + "\n", "utf8");
console.log(`Video artifact written: ${path.relative(root, videoPath)}`);
