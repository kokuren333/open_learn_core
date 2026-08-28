import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const names = ["missing-module", "basis-centric-course", "graph-used-as-course", "thin-unit", "broken-video-ref", "tracked-mp4", "bad-youtube-metadata", "pdf-overflow", "exercise-solution-skip", "notation-inconsistency", "dense-biim-slide", "missing-highlight-reset", "fenced-code-slide", "tts-script-used-as-subtitle", "missing-spoken-script", "spoken-script-semantic-drift", "wrong-default-tts", "invalid-voicevox-speaker-resolution"];
const root = path.join(process.cwd(), "tests", "fixtures", "v19");
for (const name of names) {
  const directory = path.join(root, name);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "README.md"), `# ${name}\n\nReserved synthetic failure fixture for the v1.9 Course/PDF/Video audit contract.\n`, "utf8");
}
console.log(`Scaffolded ${names.length} v1.9 failure fixtures.`);
