import { evidenceCoverage } from "../evidence/coverage.mjs";

const auditNames = ["math", "evidence", "pedagogy", "visual", "completeness"];

export function computeAudits({ dataset, validation, conceptId = "basis" }) {
  const concept = validation.conceptsById.get(conceptId);
  const coverage = evidenceCoverage(dataset, validation, conceptId);
  const results = {};
  const issues = (name, values) => { results[name] = { status: values.length ? "fail" : "pass", issues: values }; };
  issues("math", [
    ...(concept?.claims?.find((claim) => claim.id === "basis-claim-01")?.statement?.includes("span") && concept?.claims?.find((claim) => claim.id === "basis-claim-01")?.statement?.includes("線形独立") ? [] : ["basis definition claim must name span and linear independence"]),
    ...((concept?.examples ?? []).filter((example) => !example.explanation?.trim()).map((example) => `example '${example.id}' has no explanation`))
  ]);
  issues("evidence", [
    ...(concept?.claims ?? []).filter((claim) => !claim.evidence?.length).map((claim) => `claim '${claim.id}' has no evidence`),
    ...(dataset.evidenceItems ?? []).filter((record) => !record.value?.locator?.value).map((record) => `evidence item '${record.value?.id}' has no locator`),
    ...((new Set((dataset.sources ?? []).map((source) => source.type))).size < 2 ? ["source diversity is below two categories"] : [])
  ]);
  issues("pedagogy", [
    ...(coverage.layers.motivation < 1 ? ["motivation layer missing"] : []),
    ...(coverage.layers.intuition < 1 ? ["intuition layer missing"] : []),
    ...(coverage.layers.prerequisite_recall < 2 ? ["prerequisite recall layers below 2"] : []),
    ...(coverage.layers.formal_definition < 1 ? ["formal definition layer missing"] : []),
    ...(coverage.lessons.linkedToClaims < coverage.lessons.total ? ["not every lesson is linked to a claim"] : [])
  ]);
  issues("visual", (concept?.visualIds ?? []).flatMap((id) => {
    const visual = validation.visualsById?.get(id);
    return !visual ? [`visual '${id}' is missing`] : [
      ...(!visual.alt_text?.ja ? [`visual '${id}' has no Japanese alt text`] : []),
      ...(!visual.learning_goal?.ja ? [`visual '${id}' has no learning goal`] : []),
      ...(!visual.source_claims?.length ? [`visual '${id}' has no source claim`] : [])
    ];
  }));
  issues("completeness", [
    ...(coverage.examples.positive < 3 ? [`positive examples ${coverage.examples.positive}/3`] : []),
    ...(coverage.examples.counterexample < 3 ? [`counterexamples ${coverage.examples.counterexample}/3`] : []),
    ...(coverage.examples.worked < 4 ? [`worked examples ${coverage.examples.worked}/4`] : []),
    ...(coverage.misconceptions.total < 5 ? [`misconceptions ${coverage.misconceptions.total}/5`] : []),
    ...(coverage.exercises.total < 15 ? [`exercises ${coverage.exercises.total}/15`] : []),
    ...(coverage.diagnostics.total < 4 ? [`diagnostics ${coverage.diagnostics.total}/4`] : []),
    ...(coverage.connections.total < 3 ? [`concept connections ${coverage.connections.total}/3`] : []),
    ...(coverage.visuals.published < 2 ? [`published visuals ${coverage.visuals.published}/2`] : [])
  ]);
  return { names: auditNames, coverage, results };
}
