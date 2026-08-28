export function normalizeSpokenScript(script, entries = []) {
  let normalized = String(script ?? "");
  for (const entry of entries) if (entry?.surface && entry?.reading) normalized = normalized.replaceAll(entry.surface, entry.reading);
  return normalized
    .replaceAll("R^n", "アールのエヌじょう")
    .replaceAll("Ax=b", "エーエックス イコール ビー")
    .replaceAll("λ", "ラムダ")
    .replaceAll("A^T", "エーのてんすう");
}

export function compareScripts(script, spokenScript) {
  const numbers = (value) => (String(value).match(/\d+(?:\.\d+)?/g) ?? []).join(",");
  const scriptNumbers = numbers(script);
  const spokenNumbers = numbers(spokenScript);
  return Boolean(String(script).trim() && String(spokenScript).trim()) && (!scriptNumbers || !spokenNumbers || scriptNumbers === spokenNumbers);
}
