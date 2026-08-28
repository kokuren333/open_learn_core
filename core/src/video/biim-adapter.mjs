import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeBiimCompatibility({ domainRoot, source }) {
  const output = path.join(domainRoot, "video", "generated", "biim", source.unit);
  await mkdir(output, { recursive: true });
  const compatibility = { slides: source.slides.map((slide) => ({ id: slide.id, script: slide.spoken_script, note_top: slide.note_top, note_bottom: slide.note_bottom })) };
  await writeFile(path.join(output, "tts-source.yaml"), JSON.stringify(compatibility, null, 2) + "\n");
  await writeFile(path.join(output, "subtitle-source.json"), JSON.stringify({ slides: source.slides.map(({ id, script }) => ({ id, script })) }, null, 2) + "\n");
  await writeFile(path.join(output, "adapter-manifest.json"), JSON.stringify({ unit: source.unit, canonical_script: "script", tts_script: "spoken_script", generated_for: "BiimSlideMaker", compatibility_source: "tts-source.yaml" }, null, 2) + "\n");
  return output;
}
