export function evidenceCoverage(dataset, validation, conceptId = "basis") {
  const concept = validation.conceptsById.get(conceptId);
  const claims = concept?.claims ?? [];
  const edges = concept?.prerequisiteEdges ?? [];
  const lessons = concept?.lessons ?? [];
  const decisions = (dataset.curriculumDecisions ?? []).map((record) => record.value).filter((decision) => decision.scope?.curriculum === "linear-algebra-basic");
  const lessonsLinkedToClaims = lessons.filter((lesson) => lesson.sections?.some((section) => section.claimRefs?.length)).length;
  return {
    conceptId,
    claims: { total: claims.length, withEvidence: claims.filter((claim) => claim.evidence?.length).length },
    prerequisiteEdges: { total: edges.length, withRationale: edges.filter((edge) => edge.rationale?.trim()).length, withEvidence: edges.filter((edge) => edge.evidence?.length).length },
    curriculumDecisions: { total: decisions.length, withEvidence: decisions.filter((decision) => decision.evidence?.length).length },
    lessons: { total: lessons.length, linkedToClaims: lessonsLinkedToClaims },
    exercises: { total: concept?.exercises?.length ?? 0, linkedToClaims: (concept?.exercises ?? []).filter((exercise) => exercise.testsClaims?.length).length }
  };
}
