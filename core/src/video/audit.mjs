import { compareScripts } from "./tts-normalizer.mjs";

const issue = (problem, suggestedFix) => ({ severity: "major", problem, suggested_fix: suggestedFix });

function slideLineCount(markdown) {
  const source = markdown.replace(/^---[\s\S]*?---\s*/m, "");
  return source.split(/^---\s*$/m).map((slide) => slide.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith("<!--") && !line.trim().startsWith("---")).length);
}

export function auditVideoSource({ source, slidesMarkdown, ttsConfig = null }) {
  const issues = [];
  const firstSlide = slidesMarkdown.split(/^---\s*$/m).slice(0, 3).join("\n");
  if (!/<!--\s*class:\s*title\s*-->/.test(firstSlide)) issues.push(issue("first slide is missing the title class", "Add <!-- class: title --> before the first slide."));
  if (/```/.test(slidesMarkdown)) issues.push(issue("fenced code blocks are not allowed in Marp slides", "Use inline code or move detail into note_bottom."));
  const density = slideLineCount(slidesMarkdown);
  density.forEach((count, index) => { if (count > 5) issues.push(issue(`slide ${index + 1} has ${count} visible lines`, "Split the slide or move detail into narration/notes.")); });
  const highlightCount = (slidesMarkdown.match(/<!--\s*class:\s*highlight\s*-->/g) ?? []).length;
  const resetCount = (slidesMarkdown.match(/<!--\s*class:\s*-->\s*/g) ?? []).length;
  if (highlightCount > resetCount) issues.push(issue("highlight class is not explicitly reset", "Add <!-- class: --> before the next normal slide."));
  const ids = source.slides.map((slide) => slide.id);
  if (ids.some((id, index) => id !== index + 1)) issues.push(issue("slide IDs are not sequential", "Use 1-based sequential slide IDs."));
  const markdownSlideCount = slidesMarkdown.replace(/^---[\s\S]*?---\s*/m, "").split(/^---\s*$/m).filter((slide) => slide.trim()).length;
  if (markdownSlideCount !== source.slides.length) issues.push(issue(`video source has ${source.slides.length} slides but slides.md has ${markdownSlideCount}`, "Keep the canonical YAML and Marp slide count aligned."));
  for (const slide of source.slides) {
    if (!slide.script?.trim()) issues.push(issue(`slide ${slide.id} has no canonical script`, "Write readable subtitle/narration text in script."));
    if (!slide.spoken_script?.trim()) issues.push(issue(`slide ${slide.id} has no spoken_script`, "Add inspectable TTS-oriented text without changing script."));
    if (!compareScripts(slide.script, slide.spoken_script)) issues.push(issue(`slide ${slide.id} script and spoken_script may have drifted`, "Review semantic correspondence and preserve numeric expressions."));
  }
  const tts = source.tts ?? ttsConfig?.default;
  if (tts?.backend !== "voicevox") issues.push(issue("video pilot does not use the default VOICEVOX backend", "Use VOICEVOX unless a deliberate override is recorded."));
  if (tts?.speaker?.name !== "ずんだもん" || tts?.speaker?.style !== "ノーマル") issues.push(issue("video pilot does not use ずんだもん / ノーマル", "Resolve the configured default speaker by name and style."));
  if (Math.abs(Number(tts?.synthesis?.speed_scale) - 1.25) > 0.01) issues.push(issue("video speed differs from the default 1.25", "Use speed_scale 1.25 or document a justified override."));
  return { status: issues.length ? "fail" : "pass", issues, density, summary: "Biim authoring rules, subtitle/TTS separation, and default voice settings reviewed." };
}
