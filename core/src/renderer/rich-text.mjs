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

function renderInline(value = "") {
  const math = [];
  const source = String(value)
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, expression) => `\uE000${math.push(renderMath(expression, true)) - 1}\uE001`)
    .replace(/\$([^$\n]+)\$/g, (_, expression) => `\uE000${math.push(renderMath(expression)) - 1}\uE001`);
  let html = escapeHtml(source)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
  return html.replace(/\uE000(\d+)\uE001/g, (_, index) => math[Number(index)]);
}

function renderRichText(value = "") {
  const source = String(value).replace(/\r\n/g, "\n").trim();
  if (!source) return "";
  const blocks = source.split(/\n{2,}/);
  return blocks.map((block) => {
    const callout = block.match(/^:::(example|question|answer|note)\n([\s\S]*?)\n:::$/);
    if (callout) return `<aside class="rich-callout rich-callout-${callout[1]}">${renderRichText(callout[2])}</aside>`;
    if (/^#{1,3} /.test(block)) {
      const [, hashes, heading] = block.match(/^(#{1,3})\s+(.+)$/);
      return `<h${hashes.length + 2}>${renderInline(heading)}</h${hashes.length + 2}>`;
    }
    if (block.split("\n").every((line) => /^[-*] /.test(line))) return `<ul>${block.split("\n").map((line) => `<li>${renderInline(line.slice(2))}</li>`).join("")}</ul>`;
    return `<p>${renderInline(block)}</p>`;
  }).join("");
}

export { renderInline, renderMath, renderRichText };
