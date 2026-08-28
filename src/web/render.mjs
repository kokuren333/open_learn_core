const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const text = (value = "") => escapeHtml(value).replaceAll("\n", "<br>");
const conceptPath = (id, nested = false) => nested ? `../concepts/${id}.html` : `concepts/${id}.html`;

function nav(active = "") {
  return `<header class="site-header"><div class="container nav-wrap"><a class="brand" href="${active === "concept" ? "../" : "./"}"><span class="brand-mark">∑</span><span>Open Learn Core</span></a><nav aria-label="メインナビゲーション"><a href="${active === "concept" ? "../" : "./"}">Concepts</a><a href="${active === "concept" ? "../graph.html" : "graph.html"}">Concept graph</a></nav></div></header>`;
}

function layout({ title, description, body, active = "" }) {
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapeHtml(description)}"><title>${escapeHtml(title)} | Open Learn Core</title>
<link rel="stylesheet" href="${active === "concept" ? "../styles.css" : "styles.css"}"></head><body>${nav(active)}<main>${body}</main>
<footer class="site-footer"><div class="container"><span>Open Learn Core · Linear Algebra MVP v1</span><a href="https://github.com/" rel="noreferrer">Open source learning infrastructure</a></div></footer></body></html>`;
}

function conceptCard(concept, { nested = false, order = null } = {}) {
  const step = order === null ? "" : `<span class="step">${String(order + 1).padStart(2, "0")}</span>`;
  return `<a class="concept-card" href="${conceptPath(concept.id, nested)}"><div class="card-top">${step}<span class="eyebrow">${escapeHtml(concept.title.en)}</span></div><h3>${escapeHtml(concept.title.ja)}</h3><p>${text(concept.summary.ja)}</p><span class="card-link">学ぶ <span aria-hidden="true">→</span></span></a>`;
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

function renderIndex({ concepts, curricula, conceptsById }) {
  const curriculum = curricula[0]?.value;
  const sequence = curriculum?.sequence ?? concepts.map((concept) => concept.id);
  const ordered = sequence.map((id) => conceptsById.get(id)).filter(Boolean);
  const body = `<section class="hero"><div class="container hero-grid"><div><p class="kicker">CONCEPT-BASED LEARNING / MVP v1</p><h1>線形代数を、<em>概念のつながり</em>から学ぶ。</h1><p class="hero-lede">Open Learn Coreは、説明文をページに固定するのではなく、Conceptデータから教材を生成するオープンな学習基盤です。</p><div class="hero-actions"><a class="button primary" href="#concepts">学習を始める <span>↓</span></a><a class="button secondary" href="graph.html">関係を眺める <span>↗</span></a></div></div><div class="hero-art" aria-label="概念グラフの装飾図"><div class="orb orb-a"></div><div class="orb orb-b"></div><div class="wire wire-a"></div><div class="wire wire-b"></div><div class="floating-node node-a">vector</div><div class="floating-node node-b">span</div><div class="floating-node node-c">basis</div><div class="floating-node node-d">dimension</div><div class="hero-caption"><strong>12</strong><span>connected concepts</span></div></div></div></section>
<section class="section intro"><div class="container split"><div><p class="kicker">THE MODEL</p><h2>ページではなく、<br><em>Concept</em>が最小単位。</h2></div><p>各Conceptは、前提知識、学習目標、説明、例、演習、誤解、出典をまとめて持ちます。カリキュラムはConceptとは分離され、学ぶ順番を別に定義します。</p></div></section>
<section class="section concepts-section" id="concepts"><div class="container"><div class="section-heading"><div><p class="kicker">CURRICULUM / ${escapeHtml(curriculum?.title?.en ?? "Linear Algebra")}</p><h2>${escapeHtml(curriculum?.title?.ja ?? "線形代数入門")}</h2></div><span class="count">${ordered.length} concepts</span></div><p class="section-lede">スカラーから行列表示まで、前提関係に沿った学習順序です。各カードから教材ページへ進めます。</p><div class="concept-grid">${conceptList(ordered)}</div></div></section>
<section class="section callout-section"><div class="container callout"><div><p class="kicker">EXPLORE THE GRAPH</p><h2>知識は、一本道ではない。</h2><p>Conceptのprerequisiteを有向グラフとして可視化しています。別の経路から同じ概念へ到達できる構造を確認できます。</p></div><a class="button dark" href="graph.html">グラフを見る <span>↗</span></a></div></section>`;
  return layout({ title: "線形代数を概念のつながりから学ぶ", description: "Concept-based linear algebra learning MVP", body });
}

function renderConcept({ concept, conceptsById, sourceById }) {
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

function renderGraph({ concepts, conceptsById, curricula }) {
  const sequence = curricula[0]?.value?.sequence ?? concepts.map((concept) => concept.id);
  const ordered = sequence.map((id) => conceptsById.get(id)).filter(Boolean);
  const positions = new Map(ordered.map((concept, index) => [concept.id, { x: 170 + (index % 3) * 350, y: 105 + Math.floor(index / 3) * 145 }]));
  const edges = ordered.flatMap((concept) => (concept.prerequisites ?? []).map((prerequisite) => {
    const from = positions.get(prerequisite);
    const to = positions.get(concept.id);
    return from && to ? `<line class="graph-edge" x1="${from.x}" y1="${from.y + 27}" x2="${to.x}" y2="${to.y - 27}" marker-end="url(#arrow)" />` : "";
  })).join("");
  const nodes = ordered.map((concept) => { const position = positions.get(concept.id); return `<a href="concepts/${concept.id}.html"><g class="graph-node" transform="translate(${position.x - 120},${position.y - 28})"><rect width="240" height="56" rx="14"></rect><text x="120" y="23" text-anchor="middle">${escapeHtml(concept.title.ja)}</text><text class="graph-node-en" x="120" y="42" text-anchor="middle">${escapeHtml(concept.title.en)}</text></g></a>`; }).join("");
  const rows = ordered.map((concept, index) => `<tr><td>${String(index + 1).padStart(2, "0")}</td><td><a href="concepts/${concept.id}.html">${escapeHtml(concept.title.ja)}</a></td><td>${(concept.prerequisites ?? []).map((id) => conceptsById.get(id)?.title.ja ?? id).join("、") || "—"}</td></tr>`).join("");
  const body = `<section class="graph-hero"><div class="container"><p class="kicker">CONCEPT GRAPH / PREREQUISITE RELATIONSHIPS</p><h1>つながりを、<em>地図</em>として見る。</h1><p>矢印は「先に理解しておくとよいConcept」から、次のConceptへ向かっています。ノードをクリックすると教材へ移動できます。</p></div></section><section class="section"><div class="container"><div class="graph-frame"><svg viewBox="0 0 1000 700" role="img" aria-label="線形代数Conceptのprerequisite graph"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs>${edges}${nodes}</svg></div><div class="graph-table-wrap"><h2>Curriculum sequence</h2><table><thead><tr><th>順</th><th>Concept</th><th>Prerequisites</th></tr></thead><tbody>${rows}</tbody></table></div></div></section>`;
  return layout({ title: "Concept graph", description: "Linear algebra prerequisite graph", body });
}

export { renderIndex, renderConcept, renderGraph };
