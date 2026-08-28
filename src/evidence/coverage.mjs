export function evidenceCoverage(dataset, validation, conceptId = "basis") {
  const concept = validation.conceptsById.get(conceptId);
  const claims = concept?.claims ?? [];
  const edges = concept?.prerequisiteEdges ?? [];
  const lessons = concept?.lessons ?? [];
  const decisions = (dataset.curriculumDecisions ?? []).map((record) => record.value).filter((decision) => decision.scope?.curriculum === "linear-algebra-basic");
  const lessonsLinkedToClaims = lessons.filter((lesson) => lesson.sections?.some((section) => section.claimRefs?.length)).length;
  const examples = concept?.examples ?? [];
  const layers = concept?.contentLayers ?? [];
  return {
    conceptId,
    claims: { total: claims.length, withEvidence: claims.filter((claim) => claim.evidence?.length).length },
    prerequisiteEdges: { total: edges.length, withRationale: edges.filter((edge) => edge.rationale?.trim()).length, withEvidence: edges.filter((edge) => edge.evidence?.length).length },
    curriculumDecisions: { total: decisions.length, withEvidence: decisions.filter((decision) => decision.evidence?.length).length },
    lessons: { total: lessons.length, linkedToClaims: lessonsLinkedToClaims },
    exercises: { total: concept?.exercises?.length ?? 0, linkedToClaims: (concept?.exercises ?? []).filter((exercise) => exercise.testsClaims?.length || exercise.assesses?.length).length },
    diagnostics: { total: concept?.diagnosticQuestions?.length ?? 0 },
    misconceptions: { total: concept?.misconceptions?.length ?? 0, detailed: concept?.misconceptionDetails?.length ?? 0 },
    connections: { total: (concept?.related ?? []).length + layers.filter((layer) => layer.type === "connection").length },
    layers: Object.fromEntries(["motivation", "intuition", "prerequisite_recall", "formal_definition", "term_by_term", "connection", "recap", "next_connection"].map((type) => [type, layers.filter((layer) => layer.type === type).length])),
    examples: { total: examples.length, positive: examples.filter((example) => ["positive", "canonical", "minimal"].includes(example.type)).length, counterexample: examples.filter((example) => example.type === "counterexample").length, worked: examples.filter((example) => example.type === "worked").length },
    visuals: { total: (concept?.visualIds ?? []).length, published: (concept?.visualIds ?? []).filter((id) => validation.visualsById?.get(id)?.status === "published").length }
  };
}
