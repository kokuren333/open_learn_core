# Linear Algebra: 30 Core Concept Compression

## Decision

The learner-facing map for `linear-algebra` is exactly 30 Core Concepts. The former 57 Concepts remain in `domains/linear-algebra/data/concepts/` as an internal knowledge base and provenance source; they are not silently deleted and are not published as a second learner-facing map.

`domain.yaml.core_concepts` and `data/core-concepts/core-concepts.json` are the canonical public inventory. A build must publish exactly this inventory. The current editorial state is intentionally mixed: `basis` is the first `gold` Core Concept, while the other 29 are structured scaffolds awaiting full editorial content.

## Old → new classification

| Legacy Concept | Destination Core Concept | Classification | Why |
|---|---|---|---|
| `scalar`, `scalar-introduction` | `vector` | Merge as facet/property | Scalars are the coefficient language needed to operate on vectors, not a separate learner-facing hub in this course. |
| `vector`, `vector-introduction`, `vector-notation` | `vector` | Keep/merge | Three introductions describe one object and its equivalent arrow/component notation. |
| `vector-addition`, `scalar-multiplication` | `vector` | Merge as procedure/property | The operations define the usable behavior of the vector object. |
| `linear-combination` | `linear-combination` | Keep | It is the generative language connecting vectors, span, coordinates, and equations. |
| `linear-equations` | `linear-system` | Merge/rename | The learner needs the system-level object, including consistency and solution sets. |
| `matrix`, `matrix-introduction`, `matrix-operations` | `matrix` | Merge | Introduction, notation, and operations are facets of matrix as an operator representation. |
| `matrix-representation` | `linear-transformation` | Merge as representation | The matrix is the chosen representation of a map relative to bases. |
| `gaussian-elimination`, `rref-and-pivots` | `elimination` | Merge | Row reduction and pivot interpretation are one procedure plus its structural reading. |
| `inverse-and-lu` | `matrix-factorization` | Merge as procedure | Inversion and LU belong with factorization choices and computational routes. |
| `vector-spaces` | `vector-space` | Keep/rename | The abstract stage needs one stable name for the axiomatic setting. |
| `subspaces` | `subspace` | Keep/rename | The singular name matches the Core Concept convention. |
| `span` | `basis` | Merge as facet/property | Span is one half of the basis criterion; it remains explicitly represented in the Basis contract. |
| `linear-independence` | `linear-independence` | Keep | It is the other irreducible half of basis and deserves its own contrastive concept. |
| `basis` | `basis` | Keep / Gold | This is the first complete Gold Concept and the integration test for the model. |
| `dimension` | `dimension` | Keep | Dimension is the invariant count of independent directions. |
| `rank` | `rank-nullity` | Merge as facet | Rank is the retained-information side of the theorem. |
| `kernel-and-image` | `rank-nullity` | Merge as facet/property | Kernel and image explain lost and retained dimensions. |
| `coordinate-maps`, `coordinates`, `change-of-basis` | `coordinates-change-of-basis` | Merge | These are the object/translation/procedure views of one representation problem. |
| `linear-map`, `linear-transformations` | `linear-transformation` | Merge/rename | Duplicate naming is compressed into the structural map concept. |
| `determinant-definition`, `determinant-intuition`, `determinant-properties`, `determinant-computation`, `determinant-invertibility`, `determinant-volume` | `determinant` | Merge facets/procedures | Definition, geometry, computation, multiplicativity, and invertibility are one invariant with multiple representations. |
| `eigenvalue-eigenvector`, `characteristic-polynomial`, `eigenspace-and-multiplicity` | `eigenvalue-eigenvector` | Merge | The equation, polynomial, eigenspace, and multiplicity are one eigen-structure learning contract. |
| `diagonalization` | `diagonalization` | Keep | It is the representation change that exploits eigenvectors. |
| `dot-product-and-norm` | `inner-product` | Rename/generalize | The abstract inner product contains the familiar dot product and induces norm and angle. |
| `orthogonality`, `orthogonal-complement`, `orthonormal-bases`, `gram-schmidt` | `orthogonality` | Merge facets/procedures | Orthogonal relations, complements, orthonormal bases, and Gram–Schmidt form one decomposition toolkit. |
| `projection` | `projection` | Keep | Projection is a transformation/process with a distinct residual and nearest-point model. |
| `qr-least-squares` | `least-squares` | Merge as procedure | QR is a stable route inside the approximation problem, not a separate learner-facing goal. |
| `symmetric-spectral-theorem` | `symmetric-matrix` | Merge/generalize | Symmetry and its spectral consequences form one structural theorem concept. |
| `quadratic-forms` | `quadratic-form` | Rename | The singular form is the mathematical object; applications remain facets. |
| `positive-definite-matrices` | `positive-definiteness` | Rename/generalize | Positive definiteness is a property of a form/matrix pair, not merely a matrix label. |
| `svd-intuition` | `singular-value-decomposition` | Expand/keep | The intuition is retained as the geometric entry point to the full decomposition. |
| `low-rank-approximation` | `low-rank-approximation` | Keep | It is the optimization/representation consequence of SVD. |
| `pca-connection` | `principal-component-analysis` | Expand/rename | PCA becomes a complete applied transfer concept, not an SVD footnote. |
| `inverse-and-lu`, `qr-least-squares` | `matrix-factorization` | Cross-reference facet | LU and QR are compared as purpose-specific factorization routes. |
| `markov-matrices`, `differential-and-fourier` | `matrix-dynamics` | Merge/application | Both supply repeated linear action and long-term behavior examples. |
| `graph-network-matrices` | `graph-network-representation` | Rename | Graph-to-matrix translation is the stable learner-facing goal. |
| `numerical-stability` | `numerical-stability` | Keep | Numerical conditioning and algorithmic stability are a distinct transfer topic. |

## Final 30 and rationale

The 30 public concepts preserve a coherent spine: object → combination → system/matrix → space/subspace → independence/basis/dimension → maps/coordinates → rank/determinant → spectral structure → inner-product geometry → approximation → applications and numerical limits. Each Core Concept has a central mental model, cognitive type, profile, facets, procedures, representations, misconceptions, applications, learning contract, pedagogical pattern, and source IDs in the structured definition file.

The canonical ordered inventory is: `vector`, `linear-combination`, `linear-system`, `matrix`, `elimination`, `vector-space`, `subspace`, `linear-independence`, `basis`, `dimension`, `linear-transformation`, `coordinates-change-of-basis`, `rank-nullity`, `determinant`, `eigenvalue-eigenvector`, `diagonalization`, `inner-product`, `orthogonality`, `projection`, `least-squares`, `symmetric-matrix`, `quadratic-form`, `positive-definiteness`, `singular-value-decomposition`, `low-rank-approximation`, `principal-component-analysis`, `matrix-factorization`, `matrix-dynamics`, `graph-network-representation`, and `numerical-stability`.

The compression is deliberately asymmetric. `span` is not exposed as a separate card because its learner-facing job is to distinguish “enough to generate” from “no redundancy” inside `basis`; `linear-independence` remains separate because it carries a high-risk misconception contrast and is needed before Basis. Conversely, `determinant` absorbs six legacy records because splitting its definition, intuition, computation, volume, and invertibility would force learners to reconstruct one invariant across cards.

## Invariants and unresolved risks

- Exactly 30 IDs are enforced by schema, domain validation, and build-time public manifest generation. A 29/31 inventory is invalid.
- All 57 legacy source IDs are retained in the dataset or explicitly recorded in the migration table. No source record is discarded by compression.
- Legacy Learning Units remain internal until a course-level migration maps them to Core Concepts. Their thin prose is not bulk-expanded or mislabeled as Gold.
- `basis` is the only Gold page in this phase. The other 29 pages deliberately display `scaffold` so the UI cannot imply course completion.
- A future editorial pass must decide whether `matrix-factorization` should remain a late application concept or split its QR/LU procedures into internal Lessons. That is a Lesson-granularity decision, not a reason to exceed 30 Core Concepts.
- The current legacy curriculum still references the 57-Concept dataset for internal course completeness. The public Core map is authoritative for learner navigation; a later course migration must reconcile Unit-level links and remediation paths with the Core IDs.
- External domains such as statistics and differential equations are recorded as relations only. They are not fabricated into this repository's 30-count inventory.
