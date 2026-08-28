import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const skills = {
  "openlearn-curriculum-researcher": "Compare trustworthy curricula, record source scope, and produce evidence-backed ordering decisions.",
  "openlearn-course-architect": "Separate the Knowledge Graph from the learner-facing Course and define explicit Course and Module routes.",
  "openlearn-module-architect": "Group related Units into bounded teaching modules with objectives, prerequisites, and review points.",
  "openlearn-unit-architect": "Define Learning Units that fit a 5–10 minute reading and 10–15 minute video window without artificial splitting.",
  "openlearn-exercise-solution-writer": "Write solutions that expose the question, Concepts, strategy, every critical step, reasons, conclusion, and common wrong path.",
  "openlearn-pdf-adapter": "Adapt structured Units into Pandoc Markdown and verify A4, Japanese LaTeX, equations, figures, and monochrome readability.",
  "openlearn-video-adapter": "Compile canonical video sources into BiimSlideMaker-compatible intermediate files while keeping subtitle and TTS text separate.",
  "openlearn-video-script-writer": "Select a single Unit objective and write a visual, narrated 10–15 minute script rather than reading the full HTML article.",
  "openlearn-video-slide-designer": "Generate Marp slides with one idea per slide, low density, title/highlight classes, explicit resets, and no fenced code blocks.",
  "openlearn-tts-script-normalizer": "Convert canonical script to inspectable spoken_script using a Domain pronunciation dictionary without modifying subtitles.",
  "openlearn-video-auditor": "Audit Biim protocol, slide density, script/spoken_script correspondence, TTS defaults, and narrative quality.",
  "openlearn-course-auditor": "Audit whole-course coverage, ordering, terminology, notation, exercise progression, remediation, and format coverage."
};
for (const [name, purpose] of Object.entries(skills)) {
  const directory = path.join(root, "core", "skills", name);
  await mkdir(directory, { recursive: true });
  const body = `# ${name}\n\n## Purpose\n${purpose}\n\n## Contract\n\n- Read structured Domain artifacts before writing.\n- Keep Core contracts domain-independent and preserve evidence boundaries.\n- Emit inspectable tracked source artifacts; generated media belongs only in ignored generated directories.\n- Report uncertainty and missing prerequisites instead of silently inventing content.\n\n## v1.9 Rules\n\nFor video work, canonical script is readable subtitle text and spoken_script is pronunciation-oriented TTS input. For Course work, the explicit Course → Module → Learning Unit sequence is authoritative; do not infer learner order by walking the Knowledge Graph.\n`;
  await writeFile(path.join(directory, "SKILL.md"), body, "utf8");
}
console.log(`Scaffolded ${Object.keys(skills).length} v1.9 skills.`);
