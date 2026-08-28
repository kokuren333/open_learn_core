export function prerequisiteEdges(concepts = []) {
  return concepts.flatMap((concept) => (concept.prerequisites ?? []).map((prerequisite) => ({
    from: prerequisite,
    to: concept.id,
  })));
}

export function prerequisiteIds(concept) {
  return [...(concept?.prerequisites ?? [])];
}
