const clean = (value = "") => String(value).replaceAll("\n", "\n\n");

export function unitToMarkdown(unit, moduleTitle = "") {
  const lines = [`# ${unit.title.ja}`, `\n*${moduleTitle}*`, "", unit.summary?.ja ?? "", "", "## 学習目標", "", ...unit.learning_objectives.map((item) => `- ${item}`), "", "## 学習内容", ""];
  for (const content of unit.content) lines.push(`### ${content.type}`, "", clean(content.body), "");
  if (unit.exercises?.length) {
    lines.push("## 演習", "");
    for (const [index, exercise] of unit.exercises.entries()) {
      lines.push(`### ${index + 1}. ${exercise.question}`, "", `**問われていること:** ${exercise.solution.what_is_asked}`, "", `**関連Concept:** ${exercise.solution.concepts.join(", ")}`, "", `**方針:** ${exercise.solution.strategy}`, "", "**手順:**", "", ...exercise.solution.steps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`), "", `**操作の理由:** ${exercise.solution.why.join(" ")}`, "", `**結論:** ${exercise.solution.conclusion}`, "", `**よくある誤り:** ${exercise.solution.common_wrong_path}`, "");
    }
  }
  lines.push("## Evidence / Sources", "", "このUnitの主張はDomainのEvidenceとsource locatorを参照して監査します。", "");
  return lines.join("\n");
}

export function moduleToMarkdown(module, units) {
  return [`# ${module.title.ja}`, "", module.description.ja, "", ...units.sort((a, b) => a.order - b.order).map((unit) => unitToMarkdown(unit, module.title.ja)), ""].join("\n");
}
