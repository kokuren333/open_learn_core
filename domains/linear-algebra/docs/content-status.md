# Course Content Status

## Core Concept status

The learner-facing inventory is exactly 30 Core Concepts. `basis` is the first `gold` Concept and is rendered from `data/core-content/core-content.json`; the remaining 29 Concepts are structured `scaffold` records. The 57 legacy Concept records and 52 Learning Units remain internal migration material and are not presented as a second public Concept map. Run `npm run audit:core -- linear-algebra` to check the exact-30, cognitive-pattern, semantic-element, and Basis Gold gates.

V2.0 course source status: 52 Learning Unit records are present and structurally authored, but the forensic content audit currently classifies them as a scaffold pending substantive editorial expansion. Generated PDF/video binaries remain build artifacts; their reproducible source indexes are produced by the documented commands.

| Unit | Module | HTML | PDF | Video Source | YouTube | Status |
|---|---|---|---|---|---|---|
| quadratic-forms | module-applications | authored | source_ready | — | not_planned | audited |
| svd-intuition | module-applications | authored | source_ready | — | not_planned | audited |
| low-rank-approximation | module-applications | authored | source_ready | — | not_planned | audited |
| pca-connection | module-applications | authored | source_ready | — | not_planned | audited |
| markov-matrices | module-applications | authored | source_ready | — | not_planned | audited |
| graph-network-matrices | module-applications | authored | source_ready | — | not_planned | audited |
| differential-and-fourier | module-applications | authored | source_ready | — | not_planned | audited |
| numerical-stability | module-applications | authored | source_ready | — | not_planned | audited |
| determinant-intuition | module-determinants | authored | source_ready | — | not_planned | audited |
| determinant-definition | module-determinants | authored | source_ready | — | not_planned | audited |
| determinant-properties | module-determinants | authored | source_ready | — | not_planned | audited |
| determinant-computation | module-determinants | authored | source_ready | — | not_planned | audited |
| determinant-invertibility | module-determinants | authored | source_ready | — | not_planned | audited |
| determinant-volume | module-determinants | authored | source_ready | — | not_planned | audited |
| eigenvalue-eigenvector | module-eigenvalues | authored | source_ready | — | not_planned | audited |
| characteristic-polynomial | module-eigenvalues | authored | source_ready | — | not_planned | audited |
| eigenspace-and-multiplicity | module-eigenvalues | authored | source_ready | — | not_planned | audited |
| diagonalization | module-eigenvalues | authored | source_ready | — | not_planned | audited |
| symmetric-spectral-theorem | module-eigenvalues | authored | source_ready | — | not_planned | audited |
| positive-definite-matrices | module-eigenvalues | authored | source_ready | — | not_planned | audited |
| linear-transformations | module-linear-transformations | authored | source_ready | — | not_planned | audited |
| kernel-and-image | module-linear-transformations | authored | source_ready | — | not_planned | audited |
| matrix-representation | module-linear-transformations | authored | source_ready | — | not_planned | audited |
| coordinate-maps | module-linear-transformations | authored | source_ready | — | not_planned | audited |
| change-of-basis | module-linear-transformations | authored | source_ready | — | not_planned | audited |
| composition-and-similarity | module-linear-transformations | authored | source_ready | — | not_planned | audited |
| orthogonality | module-orthogonality | authored | source_ready | — | not_planned | audited |
| orthogonal-complement | module-orthogonality | authored | source_ready | — | not_planned | audited |
| projection | module-orthogonality | authored | source_ready | — | not_planned | audited |
| orthonormal-bases | module-orthogonality | authored | source_ready | — | not_planned | audited |
| gram-schmidt | module-orthogonality | authored | source_ready | — | not_planned | audited |
| qr-least-squares | module-orthogonality | authored | source_ready | — | not_planned | audited |
| scalar-introduction | module-prerequisites-vectors | authored | source_ready | — | not_planned | audited |
| vector-introduction | module-prerequisites-vectors | authored | source_ready | — | not_planned | audited |
| vector-notation | module-prerequisites-vectors | authored | source_ready | — | not_planned | audited |
| vector-addition | module-prerequisites-vectors | authored | source_ready | — | not_planned | audited |
| scalar-multiplication | module-prerequisites-vectors | authored | source_ready | — | not_planned | audited |
| dot-product-and-norm | module-prerequisites-vectors | authored | source_ready | — | not_planned | audited |
| linear-equations | module-systems-matrices | authored | source_ready | — | not_planned | audited |
| matrix-introduction | module-systems-matrices | authored | source_ready | — | not_planned | audited |
| matrix-operations | module-systems-matrices | authored | source_ready | — | not_planned | audited |
| gaussian-elimination | module-systems-matrices | authored | source_ready | — | not_planned | audited |
| rref-and-pivots | module-systems-matrices | authored | source_ready | — | not_planned | audited |
| inverse-and-lu | module-systems-matrices | authored | source_ready | — | not_planned | audited |
| vector-spaces | module-vector-spaces | authored | source_ready | — | not_planned | audited |
| subspaces | module-vector-spaces | authored | source_ready | — | not_planned | audited |
| linear-combination | module-vector-spaces | authored | source_ready | — | not_planned | authored |
| span | module-vector-spaces | authored | source_ready | scripted | not_planned | authored |
| linear-independence | module-vector-spaces | authored | source_ready | scripted | not_planned | authored |
| basis-definition | module-vector-spaces | authored | source_ready | scripted | not_planned | authored |
| dimension-and-rank | module-vector-spaces | authored | source_ready | — | not_planned | authored |
| coordinate-vectors | module-vector-spaces | authored | source_ready | — | not_planned | authored |

## Course Gate

The course gate requires authored Units, complete solutions, Module exercise sets, five cumulative reviews, valid navigation, and source-backed publication metadata. Run `npm run audit -- linear-algebra` for the release audit.

The forensic audit is deliberately stricter and deterministic: `npm run audit:forensic -- linear-algebra` reports body length, sections, worked examples, exercises, solutions, visuals, citations, repeated sentences, and placeholder markers. A `pass` from the course gate does not override a forensic failure.
