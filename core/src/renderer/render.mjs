const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const text = (value = "") => escapeHtml(value).replaceAll("\n", "<br>");
const conceptPath = (id, nested = false) => nested ? `../concepts/${id}.html` : `concepts/${id}.html`;

function nav(active = "") {
  return `<header class="site-header"><div class="container nav-wrap"><a class="brand" href="${active === "concept" ? "../" : "./"}"><span class="brand-mark">∑</span><span>Open Learn Core</span></a><nav aria-label="メインナビゲーション"><a href="${active === "concept" ? "../" : "./"}">Concepts</a><a href="${active === "concept" ? "../graph.html" : "graph.html"}">Concept graph</a><a href="${active === "concept" ? "../curriculum.html" : "curriculum.html"}">Curriculum</a></nav></div></header>`;
}

function layout({ title, description, body, active = "", version = "2.0.0" }) {
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapeHtml(description)}"><title>${escapeHtml(title)} | Open Learn Core</title>
<link rel="stylesheet" href="${active === "concept" ? "../styles.css" : "styles.css"}"></head><body>${nav(active)}<main>${body}</main>
<footer class="site-footer"><div class="container"><span>Open Learn Core · Domain learning engine v${escapeHtml(version)}</span><a href="https://github.com/kokuren333/open_learn_core" rel="noreferrer">Open source learning infrastructure</a></div></footer></body></html>`;
}

function conceptCard(concept, { nested = false, order = null } = {}) {
  const step = order === null ? "" : `<span class="step">${String(order + 1).padStart(2, "0")}</span>`;
  const title = typeof concept.title === "string" ? { ja: concept.title, en: concept.title } : concept.title;
  const summary = concept.summary?.ja ?? concept.central_mental_model ?? "Learner-facing Core Concept";
  return `<a class="concept-card" href="${conceptPath(concept.id, nested)}"><div class="card-top">${step}<span class="eyebrow">${escapeHtml(title.en)}</span></div><h3>${escapeHtml(title.ja)}</h3><p>${text(summary)}</p><span class="card-link">学ぶ <span aria-hidden="true">→</span></span></a>`;
}

function conceptList(concepts, { nested = false } = {}) {
  return concepts.map((concept, index) => conceptCard(concept, { nested, order: index })).join("");
}

function referenceList(ids, conceptsById, { nested = false, empty = "なし" } = {}) {
  if (!ids?.length) return `<p class="muted">${empty}</p>`;
  return `<ul class="reference-list">${ids.map((id) => {
    const concept = conceptsById.get(id);
    return concept ? `<li><a href="${conceptPath(id, nested)}"><span>${escapeHtml(concept.title.ja)}</span><small>${escapeHtml(concept.title.en)}</small></a></li>` : `<li class="broken-ref">${escapeHtml(id)}</li>`;
  }).join("")}</ul>`;
}

function renderIndex({ concepts, coreConcepts = [], curricula, conceptsById, domainTitle = {}, course = null, courseUnits = [] }) {
  const learnerConcepts = coreConcepts.length ? coreConcepts : concepts;
  const learnerConceptsById = coreConcepts.length ? new Map(coreConcepts.map((concept) => [concept.id, concept])) : conceptsById;
  const curriculum = curricula[0]?.value;
  const sequence = coreConcepts.length ? coreConcepts.map((concept) => concept.id) : (curriculum?.sequence ?? concepts.map((concept) => concept.id));
  const ordered = sequence.map((id) => learnerConceptsById.get(id)).filter(Boolean);
  const titleJa = domainTitle.ja ?? "知識を、概念のつながりから学ぶ";
  const titleEn = domainTitle.en ?? "Concept-based learning";
  const courseLink = course ? `<a class="button primary" href="course.html">Courseを始める <span>↓</span></a>` : `<a class="button primary" href="#concepts">学習を始める <span>↓</span></a>`;
  const body = `<section class="hero"><div class="container hero-grid"><div><p class="kicker">CORE CONCEPTS / V2.2.0</p><h1>${escapeHtml(titleJa)}</h1><p class="hero-lede">学習者向けのCore Conceptを30件に固定し、Learning Experience・学習契約・根拠を一つの地図へまとめています。</p><div class="hero-actions">${courseLink}<a class="button secondary" href="graph.html">関係を眺める <span>↗</span></a></div></div><div class="hero-art" aria-label="概念グラフの装飾図"><div class="orb orb-a"></div><div class="orb orb-b"></div><div class="wire wire-a"></div><div class="wire wire-b"></div><div class="floating-node node-a">model</div><div class="floating-node node-b">lesson</div><div class="floating-node node-c">practice</div><div class="floating-node node-d">transfer</div><div class="hero-caption"><strong>${ordered.length}</strong><span>core concepts</span></div></div></div></section>
<section class="section intro"><div class="container split"><div><p class="kicker">THE MODEL</p><h2>Conceptを、<br><em>Lesson</em>で学ぶ。</h2></div><p>Conceptは知識グラフの単位。Lessonは直観・定義・方法・関係へと学びを分け、Exerciseで確認し、Claimから主張の根拠まで辿れる構造です。</p></div></section>
<section class="section concepts-section" id="concepts"><div class="container"><div class="section-heading"><div><p class="kicker">${course ? "CORE CONCEPTS / " + escapeHtml(course.title.en) : "CORE CONCEPT MAP / " + escapeHtml(curriculum?.title?.en ?? titleEn)}</p><h2>${escapeHtml(course?.title?.ja ?? curriculum?.title?.ja ?? titleJa)}</h2></div><span class="count">${ordered.length} core concepts</span></div><p class="section-lede">公開される学習地図は常に30件です。従来の知識は各ページの移行情報と内部データへ追跡できます。</p><div class="concept-grid">${conceptList(ordered)}</div></div></section>
<section class="section callout-section"><div class="container callout"><div><p class="kicker">EXPLORE THE GRAPH</p><h2>知識は、一本道ではない。</h2><p>Conceptのprerequisiteを有向グラフとして可視化しています。別の経路から同じ概念へ到達できる構造を確認できます。</p></div><a class="button dark" href="graph.html">グラフを見る <span>↗</span></a></div></section>`;
  return layout({ title: titleJa, description: `${titleEn} learning site`, body });
}

function renderLegacyConcept({ concept, conceptsById, sourceById }) {
  const sourceList = (concept.sources ?? []).map((id) => {
    const source = sourceById.get(id);
    return source ? `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)} <span aria-hidden="true">↗</span></a><small>${escapeHtml(source.license)}</small></li>` : `<li class="broken-ref">${escapeHtml(id)}</li>`;
  }).join("");
  const examples = (concept.examples ?? []).map((example) => `<article class="example-card"><span class="number">EXAMPLE</span><h3>${escapeHtml(example.statement)}</h3><p>${text(example.explanation)}</p></article>`).join("");
  const exercises = (concept.exercises ?? []).map((exercise) => `<article class="exercise-card"><div class="exercise-meta"><span>${escapeHtml(exercise.type)}</span><span>${escapeHtml(exercise.difficulty)}</span></div><h3>${escapeHtml(exercise.question)}</h3><details><summary>解答と解説を見る</summary><p><strong>答え：</strong>${text(exercise.answer)}</p><p>${text(exercise.explanation)}</p></details></article>`).join("");
  const body = `<section class="concept-hero"><div class="container"><a class="back-link" href="../">← すべてのConcept</a><div class="concept-title-row"><div><p class="kicker">CONCEPT / ${escapeHtml(concept.title.en)}</p><h1>${escapeHtml(concept.title.ja)}</h1><p class="concept-summary">${text(concept.summary.ja)}</p></div><div class="concept-id">${escapeHtml(concept.id)}</div></div></div></section>
<section class="section concept-content"><div class="container content-layout"><article class="lesson"><section class="lesson-section"><p class="kicker">01 / EXPLANATION</p><h2>考え方</h2><p class="explanation">${text(concept.content.explanation)}</p></section><section class="lesson-section"><p class="kicker">02 / EXAMPLES</p><h2>例</h2><div class="example-grid">${examples}</div></section><section class="lesson-section"><p class="kicker">03 / PRACTICE</p><h2>演習</h2><div class="exercise-stack">${exercises}</div></section><section class="lesson-section"><p class="kicker">04 / WATCH OUT</p><h2>よくある誤解</h2><ul class="misconception-list">${(concept.misconceptions ?? []).map((item) => `<li>${text(item)}</li>`).join("")}</ul></section></article><aside class="lesson-sidebar"><section class="sidebar-block"><p class="kicker">PREREQUISITES</p><h2>先に理解するConcept</h2>${referenceList(concept.prerequisites, conceptsById, { nested: true })}</section><section class="sidebar-block"><p class="kicker">OBJECTIVES</p><h2>学習目標</h2><ul class="check-list">${concept.learningObjectives.map((item) => `<li>${text(item)}</li>`).join("")}</ul></section><section class="sidebar-block"><p class="kicker">RELATED</p><h2>関連Concept</h2>${referenceList(concept.related, conceptsById, { nested: true })}</section><section class="sidebar-block sources-block"><p class="kicker">SOURCES</p><h2>出典</h2><ul class="source-list">${sourceList}</ul></section></aside></div></section>`;
  return layout({ title: concept.title.ja, description: concept.summary.ja, body, active: "concept" });
}

function renderClaimLinks(claimRefs, claimsById) {
  if (!claimRefs?.length) return "";
  return `<div class="claim-links"><span>根拠</span>${claimRefs.map((id) => claimsById.has(id) ? `<a href="#claim-${escapeHtml(id)}">${escapeHtml(id)}</a>` : `<span class="broken-ref">${escapeHtml(id)}</span>`).join("")}</div>`;
}

function renderEvidence(evidenceIds, evidenceById, sourceById) {
  if (!evidenceIds?.length) return "<p class=\"muted\">EvidenceItem未登録</p>";
  return `<ul class="evidence-list">${evidenceIds.map((id) => { const item = evidenceById.get(id); if (!item) return `<li class="broken-ref">${escapeHtml(id)}</li>`; const source = sourceById.get(item.source); return `<li><strong>${escapeHtml(source?.title ?? item.source)}</strong><span>${escapeHtml(item.locator.section)} · ${escapeHtml(item.locator.value)}</span><p>${text(item.extracted_meaning.ja)}</p></li>`; }).join("")}</ul>`;
}

function renderVisual(visual) {
  return `<figure class="visual-artifact" id="${escapeHtml(visual.id)}">${visual.svg ?? `<div class="visual-placeholder">${escapeHtml(visual.type)}</div>`}<figcaption><strong>${escapeHtml(visual.learning_goal.ja)}</strong><span>${escapeHtml(visual.alt_text.ja)}</span></figcaption></figure>`;
}

function renderConcept({ concept, conceptsById, sourceById, evidenceById = new Map(), visualsById = new Map() }) {
  const claimsById = new Map((concept.claims ?? []).map((claim) => [claim.id, claim]));
  const sourceList = (concept.sources ?? []).map((id) => {
    const source = sourceById.get(id);
    return source ? `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)} <span aria-hidden="true">↗</span></a><small>${escapeHtml(source.license)}</small></li>` : `<li class="broken-ref">${escapeHtml(id)}</li>`;
  }).join("");
  const visualsByLesson = new Map((concept.visualIds ?? []).map((id) => visualsById.get(id)).filter((visual) => visual?.placement?.lesson).reduce((map, visual) => map.set(visual.placement.lesson, [...(map.get(visual.placement.lesson) ?? []), visual]), new Map()));
  const lessonNavigation = (lessonIndex) => `<div class="lesson-nav">${lessonIndex > 0 ? `<a href="#${escapeHtml(concept.lessons[lessonIndex - 1].id)}">← 前のLesson</a>` : "<span></span>"}${lessonIndex < concept.lessons.length - 1 ? `<a href="#${escapeHtml(concept.lessons[lessonIndex + 1].id)}">次のLesson →</a>` : "<span></span>"}</div>`;
  const lessons = (concept.lessons ?? []).map((lesson, lessonIndex) => `<article class="lesson-card" id="${escapeHtml(lesson.id)}"><div class="lesson-card-heading"><span class="lesson-number">LESSON ${String(lessonIndex + 1).padStart(2, "0")}</span><h3>${escapeHtml(lesson.title)}</h3></div><p class="lesson-summary">${text(lesson.summary)}</p><ul class="lesson-objectives">${lesson.objectives.map((item) => `<li>${text(item)}</li>`).join("")}</ul><div class="lesson-sections">${lesson.sections.map((section) => `<section class="lesson-subsection ${section.kind === "checkpoint" ? "checkpoint" : ""}"><div class="subsection-heading"><span class="section-kind">${escapeHtml(section.kind)}</span><h4>${escapeHtml(section.title)}</h4></div><p>${text(section.body)}</p>${renderClaimLinks(section.claimRefs, claimsById)}</section>`).join("")}</div>${visualsByLesson.get(lesson.id)?.map((visual) => `<div class="visual-inline">${renderVisual(visual)}</div>`).join("") ?? ""}${lessonNavigation(lessonIndex)}</article>`).join("");
  const examples = (concept.examples ?? []).map((example) => `<article class="example-card"><div class="exercise-meta"><span>${escapeHtml(example.type ?? "example")}</span>${example.difficulty ? `<span>${escapeHtml(example.difficulty)}</span>` : ""}</div><h3>${escapeHtml(example.statement)}</h3><p>${text(example.explanation)}</p>${example.steps?.length ? `<ol>${example.steps.map((step) => `<li>${text(step)}</li>`).join("")}</ol>` : ""}</article>`).join("");
  const lessonsByExercise = new Map((concept.lessons ?? []).flatMap((lesson) => lesson.exerciseIds.map((id) => [id, lesson.title])));
  const exercises = (concept.exercises ?? []).map((exercise) => `<article class="exercise-card"><div class="exercise-meta"><span>${escapeHtml(exercise.difficulty)}</span><span>${escapeHtml(exercise.type)}</span>${exercise.skill ? `<span>${escapeHtml(exercise.skill)}</span>` : ""}</div><p class="exercise-lesson">${escapeHtml(lessonsByExercise.get(exercise.id) ?? "Practice")}</p><h3>${escapeHtml(exercise.question)}</h3><details><summary>解答と解説を見る</summary><p><strong>答え：</strong>${text(exercise.answer)}</p><p>${text(exercise.explanation)}</p></details></article>`).join("");
  const diagnostics = (concept.diagnosticQuestions ?? []).map((item) => `<article class="diagnostic-card" id="${escapeHtml(item.id)}"><h3>${escapeHtml(item.question)}</h3><details><summary>診断結果を見る</summary><p><strong>答え：</strong>${text(item.answer)}</p><p>${text(item.explanation)}</p>${item.diagnoses?.incorrect ? `<p class="diagnosis"><strong>誤答時：</strong>${text(item.diagnoses.incorrect.feedback)}（確認：${item.diagnoses.incorrect.possibleMissingConcepts.map((id) => escapeHtml(conceptsById.get(id)?.title.ja ?? id)).join("、")}）</p>` : ""}</details></article>`).join("");
  const claims = (concept.claims ?? []).map((claim) => `<article class="claim-card" id="claim-${escapeHtml(claim.id)}"><div class="claim-heading"><span class="claim-id">${escapeHtml(claim.id)}</span>${claim.claimType ? `<span>${escapeHtml(claim.claimType)}</span>` : ""}${claim.status ? `<span>${escapeHtml(claim.status)}</span>` : ""}</div><p>${text(claim.statement)}</p>${renderEvidence(claim.evidence, evidenceById, sourceById)}${claim.sourceRefs?.length ? `<ul class="legacy-source-list">${claim.sourceRefs.map((sourceRef) => { const source = sourceById.get(sourceRef.source); return source ? `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a><span>${escapeHtml(sourceRef.locator)}</span></li>` : `<li class="broken-ref">${escapeHtml(sourceRef.source)}</li>`; }).join("")}</ul>` : ""}</article>`).join("");
  const edgeCards = (concept.prerequisiteEdges ?? []).map((edge) => `<article class="edge-card"><strong>${escapeHtml(conceptsById.get(edge.concept)?.title.ja ?? edge.concept)}</strong><span>${escapeHtml(edge.relation)} · confidence ${escapeHtml(edge.confidence)}</span><p>${text(edge.rationale)}</p>${renderEvidence(edge.evidence, evidenceById, sourceById)}</article>`).join("");
  const misconceptionDetails = (concept.misconceptionDetails ?? []).map((item) => `<li><strong>${text(item.statement)}</strong><br>${text(item.correctiveExplanation)} <a href="#${escapeHtml(item.diagnosticQuestionId)}">診断へ</a></li>`).join("");
  const contentLayers = (concept.contentLayers ?? []).map((layer) => `<article class="content-layer"><span class="section-kind">${escapeHtml(layer.type)}</span><h3>${escapeHtml(layer.title)}</h3><p>${text(layer.body)}</p>${renderClaimLinks(layer.claimRefs, claimsById)}</article>`).join("");
  const visuals = "";
  const body = `<section class="concept-hero"><div class="container"><a class="back-link" href="../">← すべてのConcept</a><div class="concept-title-row"><div><p class="kicker">CONCEPT / ${escapeHtml(concept.title.en)}</p><h1>${escapeHtml(concept.title.ja)}</h1><p class="concept-summary">${text(concept.summary.ja)}</p></div><div class="concept-id">${escapeHtml(concept.id)}</div></div></div></section>
<section class="section concept-content"><div class="container content-layout"><article class="lesson"><section class="lesson-section overview-section"><p class="kicker">OVERVIEW / CONCEPT</p><h2>このConceptで学ぶこと</h2><p class="explanation">${text(concept.content.explanation)}</p></section>${contentLayers ? `<section class="lesson-section"><p class="kicker">WHY / HOW TO LEARN</p><h2>このConceptを理解する道筋</h2><div class="content-layer-stack">${contentLayers}</div></section>` : ""}<section class="lesson-section lesson-path"><div class="lesson-heading-row"><div><p class="kicker">LESSON PATH / ${concept.lessons.length} LESSONS</p><h2>学習の道筋</h2></div><span class="path-note">Conceptの中を、Lessonに分けて学ぶ</span></div>${lessons}</section>${visuals ? `<section class="lesson-section"><p class="kicker">INFOGRAPHICS / ${concept.visualIds.length} VISUALS</p><h2>図解でつかむ</h2><div class="visual-stack">${visuals}</div></section>` : ""}${examples ? `<section class="lesson-section"><p class="kicker">EXAMPLES</p><h2>例</h2><div class="example-grid">${examples}</div></section>` : ""}<section class="lesson-section"><div class="lesson-heading-row"><div><p class="kicker">PRACTICE / ${concept.exercises.length} EXERCISES</p><h2>演習</h2></div><span class="path-note">basic → standard → challenge</span></div><div class="exercise-stack">${exercises}</div></section>${diagnostics ? `<section class="lesson-section"><p class="kicker">DIAGNOSTIC / ${concept.diagnosticQuestions.length} QUESTIONS</p><h2>理解度セルフチェック</h2><div class="diagnostic-stack">${diagnostics}</div></section>` : ""}<section class="lesson-section"><p class="kicker">EVIDENCE / ${concept.claims.length} CLAIMS</p><h2>根拠をたどる</h2><p class="section-note">教材内の主張を、EvidenceItemのlocatorと出典までたどれます。</p><div class="claim-stack">${claims}</div></section><section class="lesson-section"><p class="kicker">WATCH OUT</p><h2>よくある誤解</h2><ul class="misconception-list">${(concept.misconceptions ?? []).map((item) => `<li>${text(item)}</li>`).join("")}${misconceptionDetails}</ul></section></article><aside class="lesson-sidebar"><section class="sidebar-block"><p class="kicker">PREREQUISITES</p><h2>先に理解するConcept</h2>${referenceList(concept.prerequisites, conceptsById, { nested: true })}${edgeCards ? `<div class="edge-stack">${edgeCards}</div>` : ""}</section><section class="sidebar-block"><p class="kicker">OBJECTIVES</p><h2>学習目標</h2><ul class="check-list">${concept.learningObjectives.map((item) => `<li>${text(item)}</li>`).join("")}</ul></section><section class="sidebar-block"><p class="kicker">RELATED</p><h2>関連Concept</h2>${referenceList(concept.related, conceptsById, { nested: true })}</section><section class="sidebar-block sources-block"><p class="kicker">SOURCES</p><h2>出典</h2><ul class="source-list">${sourceList}</ul></section></aside></div></section>`;
  return layout({ title: concept.title.ja, description: concept.summary.ja, body, active: "concept" });
}

function renderLearningBlock(block, index) {
  const labels = {
    hook: "導入・必要感", concrete_problem: "具体問題", learner_prediction: "予測", guided_exploration: "ガイド付き探索",
    failure_case: "失敗例", contrast: "対比例", concept_emergence: "概念の立ち上げ", formalization: "形式化",
    worked_example: "Worked Example", guided_practice: "ガイド付き練習", misconception_challenge: "誤解への挑戦",
    independent_practice: "独立演習", transfer: "転移", synthesis: "統合"
  };
  const worked = block.worked_example;
  const challenge = block.misconception_challenge;
  const list = (values) => values?.length ? `<ul>${values.map((value) => `<li>${text(value)}</li>`).join("")}</ul>` : "";
  const answer = block.answer ? `<details><summary>答え・フィードバックを見る</summary><p>${text(block.answer)}</p></details>` : "";
  const workedHtml = worked ? `<div class="learning-detail worked-detail"><h4>推論を追う</h4><p><strong>問題：</strong>${text(worked.problem)}</p><p><strong>学習者の予測：</strong>${text(worked.learner_prediction)}</p><h5>推論ステップ</h5>${list(worked.reasoning_steps)}<p><strong>計算：</strong>${text(worked.calculations)}</p><p><strong>解釈：</strong>${text(worked.interpretation)}</p><p><strong>結論：</strong>${text(worked.conclusion)}</p><p><strong>一般化：</strong>${text(worked.generalizable_takeaway)}</p></div>` : "";
  const challengeHtml = challenge ? `<div class="learning-detail misconception-detail"><h4>誤解をほどく</h4><p><strong>問い：</strong>${text(challenge.prompt)}</p><p><strong>起こりやすい誤った道筋：</strong>${text(challenge.expected_wrong_path)}</p><p><strong>修正：</strong>${text(challenge.correction)}</p><p><strong>なぜか：</strong>${text(challenge.explanation)}</p><p><strong>転移チェック：</strong>${text(challenge.transfer_check)}</p></div>` : "";
  const metadata = `<details class="learning-metadata"><summary>このブロックの設計情報</summary><dl><dt>type</dt><dd>${escapeHtml(block.type)}</dd><dt>outcomes</dt><dd>${escapeHtml(block.learning_outcome_ids.join(", "))}</dd><dt>prerequisites</dt><dd>${escapeHtml(block.prerequisite_ids.join(", ") || "なし")}</dd><dt>difficulty / time</dt><dd>${escapeHtml(block.difficulty)} / ${escapeHtml(block.expected_time_minutes)}分</dd><dt>generated_from</dt><dd>${escapeHtml(block.generated_from)}</dd></dl></details>`;
  return `<article class="learning-block learning-block-${escapeHtml(block.type)}" data-learning-block-type="${escapeHtml(block.type)}" id="${escapeHtml(block.id)}"><div class="learning-block-heading"><span class="lesson-number">${String(index + 1).padStart(2, "0")}</span><span class="learning-block-type">${escapeHtml(labels[block.type] ?? block.type)}</span><span class="learning-difficulty">${escapeHtml(block.difficulty)}</span></div><h3>${escapeHtml(labels[block.type] ?? block.type)}</h3><p class="learning-purpose"><strong>ねらい：</strong>${text(block.purpose)}</p><p class="learning-activity"><strong>やってみる：</strong>${text(block.activity)}</p>${block.question ? `<div class="learning-question"><strong>考える問い</strong><p>${text(block.question)}</p>${block.hint ? `<p class="learning-hint">ヒント：${text(block.hint)}</p>` : ""}</div>` : ""}<div class="learner-state"><span>Before</span><p>${text(block.learner_state_before)}</p><span>After</span><p>${text(block.learner_state_after)}</p></div>${workedHtml}${challengeHtml}${answer}${block.takeaway ? `<p class="learning-takeaway"><strong>持ち帰ること：</strong>${text(block.takeaway)}</p>` : ""}${metadata}</article>`;
}

function renderCoreConcept({ concept, conceptsById, content = null, experience = null }) {
  const title = concept.title;
  const list = (values) => `<ul class="check-list">${values.map((value) => `<li>${text(typeof value === "string" ? value : value.title)}</li>`).join("")}</ul>`;
  const assessments = experience?.assessments?.map((assessment) => `<article class="assessment-card"><div class="exercise-meta"><span>${escapeHtml(assessment.type)}</span><span>${escapeHtml(assessment.difficulty)}</span></div><h3>${text(assessment.prompt)}</h3><details><summary>評価基準と答えを見る</summary><p><strong>期待される答え：</strong>${text(assessment.expected_answer)}</p>${list(assessment.reasoning_rubric)}</details></article>`).join("") ?? "";
  const experienceHtml = experience ? `<section class="lesson-section learning-experience"><div class="lesson-heading-row"><div><p class="kicker">LEARNING EXPERIENCE / ${escapeHtml(experience.editorial_status)}</p><h2>やってみながら理解する</h2></div><span class="path-note">${experience.sequence.length} learning blocks</span></div><p class="section-note">各ブロックは、学習者の状態変化・活動・到達アウトカムを持つ学習単位です。</p><div class="learning-block-stack">${experience.sequence.map(renderLearningBlock).join("")}</div></section>${assessments ? `<section class="lesson-section"><p class="kicker">ASSESSMENT / ${experience.assessments.length} ITEMS</p><h2>できるようになったか確かめる</h2><div class="assessment-stack">${assessments}</div></section>` : ""}` : "";
  const scaffoldHtml = `<section class="lesson-section learning-experience learning-experience-pending"><p class="kicker">LEARNING EXPERIENCE / NOT READY</p><h2>学習体験を準備中です</h2><p class="explanation">このCore ConceptにはまだLearning Experienceがありません。定義や設計情報だけを教材として公開せず、学習者が実際に考え、試し、説明し、転移できるブロックを整えてからGoldとして公開します。</p></section>`;
  const body = `<section class="concept-hero"><div class="container"><a class="back-link" href="../">← Core Concept一覧</a><div class="concept-title-row"><div><p class="kicker">CORE CONCEPT / ${escapeHtml(title.en)}</p><h1>${escapeHtml(title.ja)}</h1><p class="concept-summary">${text(concept.central_mental_model)}</p></div><div class="concept-id">${escapeHtml(concept.id)} · ${escapeHtml(experience?.editorial_status ?? concept.editorial_status)}</div></div></div></section>
<section class="section concept-content"><div class="container content-layout"><article class="lesson"><section class="lesson-section"><p class="kicker">LEARNING CONTRACT</p><h2>このConceptでできるようになること</h2>${list(concept.learning_contract.learner_should_be_able_to)}</section>${experienceHtml || scaffoldHtml}<section class="lesson-section"><p class="kicker">REPRESENTATION SWITCHING</p><h2>同じ対象を別の表現で見る</h2>${list(concept.representations)}</section><section class="lesson-section"><p class="kicker">WATCH OUT</p><h2>よくある誤解</h2>${list(concept.misconceptions)}</section><section class="lesson-section"><p class="kicker">TRANSFER</p><h2>使われる場面</h2>${list(concept.applications)}</section></article><aside class="lesson-sidebar"><section class="sidebar-block"><p class="kicker">STATUS</p><h2>${escapeHtml(experience?.editorial_status ?? concept.editorial_status)}</h2><p>${experience ? "このページはLearning Experienceを一次入力として生成されています。" : "この概念は構造設計済みで、Learning Experienceは準備中です。"}</p></section><section class="sidebar-block"><p class="kicker">PREREQUISITES</p><h2>先に理解するCore Concept</h2>${referenceList(concept.prerequisites, conceptsById, { nested: true })}</section><section class="sidebar-block"><p class="kicker">COGNITIVE PROFILE</p><h2>認知プロファイル</h2>${list(Object.entries(concept.cognitive_profile).map(([key, value]) => `${key}: ${typeof value === "object" ? value.score : value}/5`))}</section><section class="sidebar-block"><p class="kicker">LEARNING ELEMENTS</p><h2>必要な要素</h2>${list(Object.entries(concept.learning_contract.required_learning_elements).filter(([key]) => key !== "practice").map(([key, value]) => `${key}: ${value}`))}</section></aside></div></section>`;
  return layout({ title: title.ja, description: concept.central_mental_model, body, active: "concept", version: "2.2.0" });
}

function renderGraph({ concepts, conceptsById, curricula }) {
  const sequence = curricula[0]?.value?.sequence ?? concepts.map((concept) => concept.id);
  const ordered = sequence.map((id) => conceptsById.get(id)).filter(Boolean);
  const positions = new Map(ordered.map((concept, index) => [concept.id, { x: 170 + (index % 3) * 350, y: 105 + Math.floor(index / 3) * 145 }]));
  const graphHeight = Math.max(700, 180 + Math.ceil(ordered.length / 3) * 145);
  const edges = ordered.flatMap((concept) => (concept.prerequisites ?? []).map((prerequisite) => {
    const from = positions.get(prerequisite);
    const to = positions.get(concept.id);
    return from && to ? `<line class="graph-edge" x1="${from.x}" y1="${from.y + 27}" x2="${to.x}" y2="${to.y - 27}" marker-end="url(#arrow)" />` : "";
  })).join("");
  const nodes = ordered.map((concept) => { const position = positions.get(concept.id); return `<a href="concepts/${concept.id}.html"><g class="graph-node" transform="translate(${position.x - 120},${position.y - 28})"><rect width="240" height="56" rx="14"></rect><text x="120" y="23" text-anchor="middle">${escapeHtml(concept.title.ja)}</text><text class="graph-node-en" x="120" y="42" text-anchor="middle">${escapeHtml(concept.title.en)}</text></g></a>`; }).join("");
  const rows = ordered.map((concept, index) => `<tr><td>${String(index + 1).padStart(2, "0")}</td><td><a href="concepts/${concept.id}.html">${escapeHtml(concept.title.ja)}</a></td><td>${(concept.prerequisites ?? []).map((id) => conceptsById.get(id)?.title.ja ?? id).join("、") || "—"}</td></tr>`).join("");
  const body = `<section class="graph-hero"><div class="container"><p class="kicker">CORE CONCEPT GRAPH / PREREQUISITE RELATIONSHIPS</p><h1>つながりを、<em>地図</em>として見る。</h1><p>矢印は「先に理解しておくとよいCore Concept」から、次のCore Conceptへ向かっています。ノードをクリックすると教材へ移動できます。</p></div></section><section class="section"><div class="container"><div class="graph-frame"><svg viewBox="0 0 1000 ${graphHeight}" role="img" aria-label="Core Conceptのprerequisite graph"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs>${edges}${nodes}</svg></div><div class="graph-table-wrap"><h2>Core Concept sequence</h2><table><thead><tr><th>順</th><th>Concept</th><th>Prerequisites</th></tr></thead><tbody>${rows}</tbody></table></div></div></section>`;
  return layout({ title: "Concept graph", description: "Prerequisite graph", body });
}

function renderCurriculum({ curriculum, conceptsById, decisions = [], evidenceById = new Map(), sourceById = new Map() }) {
  const sequence = curriculum.sequence.map((id) => conceptsById.get(id)).filter(Boolean);
  const decisionCards = decisions.map((decision) => `<article class="decision-card"><span class="claim-id">${escapeHtml(decision.id)}</span><h3>${escapeHtml(decision.question)}</h3><p><strong>決定：</strong>${text(decision.decision)}</p><p>${text(decision.rationale)}</p><ul class="evidence-list">${decision.evidence.map((id) => { const item = evidenceById.get(id); const source = sourceById.get(item?.source); return `<li><strong>${escapeHtml(source?.title ?? item?.source ?? id)}</strong><span>${escapeHtml(item?.locator?.section ?? "Evidence")}</span></li>`; }).join("")}</ul></article>`).join("");
  const body = `<section class="graph-hero"><div class="container"><p class="kicker">CURRICULUM / EVIDENCE-BACKED DECISIONS</p><h1>${escapeHtml(curriculum.title.ja)}</h1><p>${text(curriculum.description)}</p></div></section><section class="section"><div class="container"><div class="section-heading"><div><p class="kicker">SEQUENCE</p><h2>学習順序</h2></div><span class="count">${sequence.length} concepts</span></div><div class="concept-grid">${conceptList(sequence)}</div>${decisionCards ? `<div class="lesson-section curriculum-decisions"><p class="kicker">CURRICULUM DECISIONS</p><h2>なぜこの順序なのか</h2><div class="claim-stack">${decisionCards}</div></div>` : ""}</div></section>`;
  return layout({ title: curriculum.title.ja, description: curriculum.description, body });
}

export { renderIndex, renderConcept, renderCoreConcept, renderGraph, renderCurriculum };
