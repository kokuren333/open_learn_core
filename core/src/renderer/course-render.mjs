const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const text = (value = "") => escapeHtml(value).replaceAll("\n", "<br>");

function layout(title, body, prefix = "") {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="description" content="${escapeHtml(title)}"><title>${escapeHtml(title)} | Open Learn Core</title><link rel="stylesheet" href="${prefix}styles.css"></head><body><header><nav><a href="${prefix || "./"}">Open Learn Core</a> · <a href="${prefix}course.html">Course</a></nav></header><main>${body}</main><footer>Open Learn Core · Multi-format Course Compiler</footer></body></html>`;
}

const unitHref = (id, prefix = "") => `${prefix}units/${id}.html`;
const moduleHref = (id, prefix = "") => `${prefix}modules/${id}.html`;

export function renderCourse({ course, modules, units }) {
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  const moduleCards = modules.sort((a, b) => a.order - b.order).map((module) => `<article><p>MODULE ${String(module.order).padStart(2, "0")}</p><h2><a href="${moduleHref(module.id)}">${escapeHtml(module.title.ja)}</a></h2><p>${text(module.description.ja)}</p><p>${module.units.length} Learning Units</p></article>`).join("");
  const slice = course.units.filter((id) => ["linear-combination", "span", "linear-independence", "basis-definition", "dimension-and-rank", "coordinate-vectors"].includes(id)).map((id) => unitsById.get(id)).filter(Boolean).map((unit) => `<li><a href="${unitHref(unit.id)}">${escapeHtml(unit.title.ja)}</a></li>`).join("");
  const body = `<section><p>COURSE / ${escapeHtml(course.domain)}</p><h1>${escapeHtml(course.title.ja)}</h1><p>${text(course.description.ja)}</p><p class="status">${escapeHtml(course.status)} · ${course.units.length} Learning Units · 8 Modules</p></section><section><h2>学習ルート</h2><ol>${slice}</ol></section><section><h2>Modules</h2><div class="grid">${moduleCards}</div></section>`;
  return layout(course.title.ja, body);
}

export function renderModule({ module, course, units, exerciseSets = [] }) {
  const cards = units.sort((a, b) => a.order - b.order).map((unit) => `<article><p>UNIT ${String(unit.order + 1).padStart(2, "0")}</p><h2><a href="${unitHref(unit.id, "../")}">${escapeHtml(unit.title.ja)}</a></h2><p>${text(unit.summary?.ja ?? "")}</p><span>${escapeHtml(unit.status)} · ${unit.estimated_duration.reading_minutes}分</span></article>`).join("");
  const exerciseMarkup = exerciseSets.flatMap((set) => set.exercises).map((exercise) => `<article class="exercise"><p>${escapeHtml(exercise.type)}</p><h3>${text(exercise.question)}</h3><details><summary>解答と解説</summary><p>${text(exercise.solution.conclusion)}</p></details></article>`).join("");
  const body = `<section><p>MODULE ${String(module.order).padStart(2, "0")}</p><h1>${escapeHtml(module.title.ja)}</h1><p>${text(module.description.ja)}</p><p><a href="../course.html">← Courseへ戻る</a></p></section><section><h2>Learning Units</h2><div class="grid">${cards}</div></section><section><h2>Module Review</h2>${exerciseMarkup || "<p>Module演習準備中</p>"}</section>`;
  return layout(module.title.ja, body, "../");
}

export function renderUnit({ unit, module, course, units = [], relatedConcepts = [], video = null }) {
  const unitsById = new Map(units.map((item) => [item.id, item]));
  const orderedUnits = (course?.units ?? []).map((id) => unitsById.get(id)).filter(Boolean);
  const position = orderedUnits.findIndex((item) => item.id === unit.id);
  const previous = position > 0 ? orderedUnits[position - 1] : null;
  const next = position >= 0 ? orderedUnits[position + 1] : null;
  const blocks = unit.content.map((content) => `<section class="block"><p class="kind">${escapeHtml(content.type)}</p><p>${text(content.body)}</p></section>`).join("");
  const exercises = unit.exercises.map((exercise) => `<article class="exercise"><p>${escapeHtml(exercise.type)} · ${escapeHtml(exercise.difficulty ?? "")}</p><h3>${text(exercise.question)}</h3><details><summary>解答と解説</summary><p><strong>問：</strong>${text(exercise.solution.what_is_asked)}</p><p><strong>Concept：</strong>${text(exercise.solution.concepts.join(", "))}</p><p><strong>方針：</strong>${text(exercise.solution.strategy)}</p><ol>${exercise.solution.steps.map((step) => `<li>${text(step)}</li>`).join("")}</ol><p><strong>なぜ：</strong>${text(exercise.solution.why.join(" "))}</p><p><strong>結論：</strong>${text(exercise.solution.conclusion)}</p><p><strong>よくある誤り：</strong>${text(exercise.solution.common_wrong_path)}</p></details></article>`).join("");
  const concepts = relatedConcepts.map((concept) => `<a href="../../concepts/${concept.id}.html">${escapeHtml(concept.title.ja)}</a>`).join("、");
  const remediation = (unit.remediation ?? []).map((id) => {
    const target = unitsById.get(id);
    return target ? `<a href="../../units/${target.id}.html">${escapeHtml(target.title.ja)}</a>` : `<a href="../../concepts/${id}.html">${escapeHtml(id)}を確認</a>`;
  }).join("、");
  const videoLink = video?.published ? `<a href="${escapeHtml(video.url)}" rel="noreferrer">動画で学ぶ</a>` : "動画版：準備中";
  const navigation = `<nav class="unit-navigation" aria-label="Unit navigation"><span>${previous ? `<a href="../../units/${previous.id}.html">← ${escapeHtml(previous.title.ja)}</a>` : ""}</span><a href="../modules/${escapeHtml(module.id)}.html">Module一覧</a><span>${next ? `<a href="../../units/${next.id}.html">${escapeHtml(next.title.ja)} →</a>` : ""}</span></nav>`;
  const body = `<section><p>LEARNING UNIT / ${escapeHtml(module.title.en)}</p><h1>${escapeHtml(unit.title.ja)}</h1><p>${text(unit.summary?.ja ?? "")}</p><p><a href="../modules/${escapeHtml(module.id)}.html">← ${escapeHtml(module.title.ja)}</a></p><ul>${unit.learning_objectives.map((item) => `<li>${text(item)}</li>`).join("")}</ul></section><section><h2>学習内容</h2>${blocks}</section><section><h2>演習</h2>${exercises || "<p>演習準備中</p>"}</section><aside><h2>関連Concept</h2><p>${concepts || "確認中"}</p><h2>前提の復習</h2><p>${remediation || "このUnitから開始できます"}</p><p><a href="../curriculum.html">Evidence / Sources を確認</a></p><p>${videoLink} · PDF版：準備中</p></aside>${navigation}`;
  return layout(unit.title.ja, body, "../../");
}
