const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const text = (value = "") => escapeHtml(value).replaceAll("\n", "<br>");

function layout(title, body, prefix = "") {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="description" content="${escapeHtml(title)}"><title>${escapeHtml(title)} | Open Learn Core</title><link rel="stylesheet" href="${prefix}styles.css"></head><body><header><nav><a href="${prefix || "./"}">Open Learn Core</a> · <a href="${prefix}course.html">Course</a></nav></header><main>${body}</main><footer>Open Learn Core · Multi-format Course Compiler</footer></body></html>`;
}

const unitHref = (id, prefix = "") => `${prefix}units/${id}.html`;
const moduleHref = (id, prefix = "") => `${prefix}modules/${id}.html`;
const reviewHref = (id, prefix = "") => `${prefix}reviews/${id}.html`;

function solutionMarkup(solution) {
  if (!solution) return "<p>解答データがありません。</p>";
  return `<p><strong>問：</strong>${text(solution.what_is_asked)}</p><p><strong>関連Concept：</strong>${text((solution.concepts ?? []).join(", "))}</p><p><strong>方針：</strong>${text(solution.strategy)}</p><ol>${(solution.steps ?? []).map((step) => `<li>${text(step)}</li>`).join("")}</ol><p><strong>なぜ：</strong>${text((solution.why ?? []).join(" "))}</p><p><strong>結論：</strong>${text(solution.conclusion)}</p><p><strong>よくある誤り：</strong>${text(solution.common_wrong_path)}</p>`;
}

export function renderCourse({ course, modules, units }) {
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  const moduleCards = modules.sort((a, b) => a.order - b.order).map((module) => `<article><p>MODULE ${String(module.order).padStart(2, "0")}</p><h2><a href="${moduleHref(module.id)}">${escapeHtml(module.title.ja)}</a></h2><p>${text(module.description.ja)}</p><p>${module.units.length} Learning Units</p></article>`).join("");
  const sequence = course.units.map((id, index) => { const unit = unitsById.get(id); return unit ? `<li><span>${String(index + 1).padStart(2, "0")}</span> <a href="${unitHref(unit.id)}">${escapeHtml(unit.title.ja)}</a></li>` : `<li class="broken-ref">${escapeHtml(id)}</li>`; }).join("");
  const reviewLinks = (course.reviews ?? []).map((id) => `<li><a href="${reviewHref(id)}">${escapeHtml(id)}</a></li>`).join("");
  const learner = course.target_learner?.ja ? `<p><strong>対象：</strong>${text(course.target_learner.ja)}</p>` : "";
  const body = `<section><p>COURSE / ${escapeHtml(course.domain)}</p><h1>${escapeHtml(course.title.ja)}</h1><p>${text(course.description.ja)}</p>${learner}<p class="status">v${escapeHtml(course.version ?? "2.0.0")} · ${escapeHtml(course.status)} · ${course.units.length} Learning Units · ${modules.length} Modules</p></section><section><h2>受講前に</h2><p>${text((course.prerequisites ?? []).join("\n"))}</p></section><section><h2>完全な学習ルート</h2><ol>${sequence}</ol></section><section><h2>累積レビュー</h2><ul>${reviewLinks || "<li>レビュー準備中</li>"}</ul></section><section><h2>Modules</h2><div class="grid">${moduleCards}</div></section><section><h2>出典・ライセンス</h2><p>Source repository: <a href="${escapeHtml(course.repository ?? "https://github.com/kokuren333/open_learn_core")}">${escapeHtml(course.repository ?? "GitHub")}</a></p><p>${escapeHtml(course.license?.content ?? "CC BY-SA 4.0")}</p></section>`;
  return layout(course.title.ja, body);
}

export function renderModule({ module, course, units, exerciseSets = [] }) {
  const cards = units.sort((a, b) => a.order - b.order).map((unit) => `<article><p>UNIT ${String(unit.order + 1).padStart(2, "0")}</p><h2><a href="${unitHref(unit.id, "../")}">${escapeHtml(unit.title.ja)}</a></h2><p>${text(unit.summary?.ja ?? "")}</p><span>${escapeHtml(unit.status)} · ${unit.estimated_duration.reading_minutes}分</span></article>`).join("");
  const exerciseMarkup = exerciseSets.flatMap((set) => set.exercises).map((exercise) => `<article class="exercise"><p>${escapeHtml(exercise.type)} · ${escapeHtml(exercise.difficulty ?? "")}</p><h3>${text(exercise.question)}</h3><details><summary>解答と解説</summary>${solutionMarkup(exercise.solution)}</details></article>`).join("");
  const adjacent = module.adjacent_modules ? `<p>前：${escapeHtml(module.adjacent_modules.previous)} / 次：${escapeHtml(module.adjacent_modules.next)}</p>` : "";
  const body = `<section><p>MODULE ${String(module.order).padStart(2, "0")}</p><h1>${escapeHtml(module.title.ja)}</h1><p>${text(module.description.ja)}</p><p>${text(module.purpose?.ja ?? "")}</p>${adjacent}<p><a href="../course.html">← Courseへ戻る</a></p></section><section><h2>到達目標</h2><ul>${(module.exit_competencies ?? []).map((item) => `<li>${text(item)}</li>`).join("")}</ul></section><section><h2>Learning Units</h2><div class="grid">${cards}</div></section><section><h2>Module Review</h2>${exerciseMarkup || "<p>Module演習準備中</p>"}</section>`;
  return layout(module.title.ja, body, "../");
}

export function renderReview({ review, exerciseSets = [] }) {
  const byId = new Map(exerciseSets.flatMap((set) => set.exercises.map((exercise) => [exercise.id, exercise])));
  const exercises = (review.exercise_ids ?? []).map((id, index) => { const exercise = byId.get(id); return exercise ? `<article class="exercise"><p>${String(index + 1).padStart(2, "0")} · ${escapeHtml(exercise.type)} · ${escapeHtml(exercise.difficulty ?? "")}</p><h2>${text(exercise.question)}</h2><details><summary>解答と解説</summary>${solutionMarkup(exercise.solution)}</details></article>` : `<p class="broken-ref">Missing exercise: ${escapeHtml(id)}</p>`; }).join("");
  const body = `<section><p>CUMULATIVE REVIEW</p><h1>${escapeHtml(review.title.ja)}</h1><p>${escapeHtml(review.title.en)}</p><p>対象Module：${escapeHtml((review.module_ids ?? []).join("、"))}</p><p><a href="../course.html">← Courseへ戻る</a></p></section><section><h2>横断演習</h2>${exercises}</section>`;
  return layout(review.title.ja, body, "../");
}

export function renderUnit({ unit, module, course, units = [], relatedConcepts = [], video = null }) {
  const unitsById = new Map(units.map((item) => [item.id, item]));
  const orderedUnits = (course?.units ?? []).map((id) => unitsById.get(id)).filter(Boolean);
  const position = orderedUnits.findIndex((item) => item.id === unit.id);
  const previous = position > 0 ? orderedUnits[position - 1] : null;
  const next = position >= 0 ? orderedUnits[position + 1] : null;
  const blocks = unit.content.map((content) => `<section class="block"><p class="kind">${escapeHtml(content.type)}</p><p>${text(content.body)}</p></section>`).join("");
  const exercises = unit.exercises.map((exercise) => `<article class="exercise"><p>${escapeHtml(exercise.type)} · ${escapeHtml(exercise.difficulty ?? "")}</p><h3>${text(exercise.question)}</h3><details><summary>解答と解説</summary>${solutionMarkup(exercise.solution)}</details></article>`).join("");
  const concepts = relatedConcepts.map((concept) => `<a href="../concepts/${concept.id}.html">${escapeHtml(concept.title.ja)}</a>`).join("、");
  const remediation = (unit.remediation ?? []).map((id) => {
    const target = unitsById.get(id);
    return target ? `<a href="../units/${target.id}.html">${escapeHtml(target.title.ja)}</a>` : `<a href="../concepts/${id}.html">${escapeHtml(id)}を確認</a>`;
  }).join("、");
  const videoLink = video?.published ? `<a href="${escapeHtml(video.url)}" rel="noreferrer">動画で学ぶ</a>` : "動画版：準備中";
  const navigation = `<nav class="unit-navigation" aria-label="Unit navigation"><span>${previous ? `<a href="../units/${previous.id}.html">← ${escapeHtml(previous.title.ja)}</a>` : ""}</span><a href="../modules/${escapeHtml(module.id)}.html">Module一覧</a><span>${next ? `<a href="../units/${next.id}.html">${escapeHtml(next.title.ja)} →</a>` : ""}</span></nav>`;
  const body = `<section><p>LEARNING UNIT / ${escapeHtml(module.title.en)}</p><h1>${escapeHtml(unit.title.ja)}</h1><p>${text(unit.summary?.ja ?? "")}</p><p><a href="../modules/${escapeHtml(module.id)}.html">← ${escapeHtml(module.title.ja)}</a></p><ul>${unit.learning_objectives.map((item) => `<li>${text(item)}</li>`).join("")}</ul></section><section><h2>学習内容</h2>${blocks}</section><section><h2>演習</h2>${exercises || "<p>演習準備中</p>"}</section><aside><h2>関連Concept</h2><p>${concepts || "確認中"}</p><h2>前提の復習</h2><p>${remediation || "このUnitから開始できます"}</p><p><a href="../curriculum.html">Evidence / Sources を確認</a></p><p>${videoLink} · PDF版はビルド成果物を参照</p></aside>${navigation}`;
  return layout(unit.title.ja, body, "../");
}
