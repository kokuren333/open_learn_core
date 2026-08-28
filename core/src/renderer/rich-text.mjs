import katex from "katex";

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

function renderMath(expression, displayMode = false) {
  try {
    return katex.renderToString(String(expression).trim(), { displayMode, throwOnError: false, strict: false, output: "htmlAndMathml" });
  } catch {
    return `<code>${escapeHtml(expression)}</code>`;
  }
}

function renderInline(value = "", { citations = new Map() } = {}) {
  const math = [];
  const citationTokens = [];
  const source = String(value)
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, expression) => `\uE000${math.push(renderMath(expression, true)) - 1}\uE001`)
    .replace(/\$([^$\n]+)\$/g, (_, expression) => `\uE000${math.push(renderMath(expression)) - 1}\uE001`)
    .replace(/\{\{cite:([a-z][a-z0-9-]*)\}\}/g, (_, id) => `\uE100${citationTokens.push({ id, marker: citations.get(id) }) - 1}\uE101`);
  let html = escapeHtml(source)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
  html = html.replace(/\uE000(\d+)\uE001/g, (_, index) => math[Number(index)]);
  return html.replace(/\uE100(\d+)\uE101/g, (_, index) => {
    const citation = citationTokens[Number(index)];
    return citation.marker ? `<sup class="citation"><a href="#reference-${escapeHtml(citation.id)}" aria-label="参考資料 ${citation.marker}">[${citation.marker}]</a></sup>` : `<sup class="citation citation-missing" title="参照が見つかりません">[?]</sup>`;
  });
}

function renderRichText(value = "", options = {}) {
  const source = String(value).replace(/\r\n/g, "\n").trim();
  if (!source) return "";
  const blocks = source.split(/\n{2,}/);
  return blocks.map((block) => {
    const callout = block.match(/^:::(example|question|answer|note)\n([\s\S]*?)\n:::$/);
    if (callout) return `<aside class="rich-callout rich-callout-${callout[1]}">${renderRichText(callout[2], options)}</aside>`;
    if (/^#{1,3} /.test(block)) {
      const [, hashes, heading] = block.match(/^(#{1,3})\s+(.+)$/);
      return `<h${hashes.length + 2}>${renderInline(heading, options)}</h${hashes.length + 2}>`;
    }
    if (block.split("\n").every((line) => /^[-*] /.test(line))) return `<ul>${block.split("\n").map((line) => `<li>${renderInline(line.slice(2), options)}</li>`).join("")}</ul>`;
    return `<p>${renderInline(block, options)}</p>`;
  }).join("");
}

export { renderInline, renderMath, renderRichText };
