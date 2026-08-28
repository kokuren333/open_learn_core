# Open Learn Core v2.0 Implementation Specification
## Linear Algebra Complete Reference Course + Production Publishing Pipeline

**Document status:** Authoritative implementation instruction  
**Target release:** `v2.0.0`  
**Baseline release:** Open Learn Core v1.9  
**Baseline commit:** `e6c63d6fd6c112c1b0ebbd60da3e1a129beaac1d`  
**Primary domain:** `linear-algebra`  
**Primary course:** `linear-algebra-foundations-to-applications`

---

# 1. Purpose

Open Learn Core v1.9 established the minimum architecture required to represent, compile, validate, and publish structured learning resources across multiple formats.

The v2.0 objective is not another architecture prototype.

The v2.0 objective is:

> **Use Open Learn Core itself to construct a complete, coherent, evidence-backed, auditable linear algebra course from the declared prerequisites through major introductory applications, then publish that course through a production-ready static web + object-storage pipeline.**

This release is the first full dogfooding release.

The framework MUST be exercised end-to-end against a real subject until the course is genuinely usable by a learner.

The project MUST prefer fixing problems revealed by real course production over adding speculative abstractions.

---

# 2. v2.0 in One Sentence

```text
v1.9 = the learning-resource compiler exists.

v2.0 = a complete real linear algebra course is built, audited, rendered,
       published, and reproducibly regenerated with that compiler.
```

---

# 3. Primary Success Condition

v2.0 is complete only when all of the following are true:

1. A learner can begin at the first required Unit and follow one canonical course sequence to the final Unit.
2. Every required Unit contains real instructional content rather than placeholders.
3. Every Module contains exercises.
4. Every required exercise has a complete solution.
5. Cumulative review material exists at meaningful checkpoints.
6. The mathematical content is internally consistent.
7. The declared curriculum has explicit documentary justification.
8. The course can be built into a complete static web edition.
9. The course can be adapted into a printable PDF edition.
10. The course can produce valid video-source packages compatible with the established video pipeline.
11. TTS text is separated from learner-visible subtitle text.
12. The generated site can reference large generated assets from external object storage.
13. The canonical editable source remains in GitHub.
14. Large generated binaries are NOT required to live in normal Git history.
15. The full course passes structural, mathematical, pedagogical, evidence, visual, explanation, video, and publication audits defined by the project.
16. A clean checkout can reproduce the publishable outputs using documented commands.
17. No critical TODO, placeholder, fabricated citation, unresolved broken link, or silently missing required Unit remains.

---

# 4. Definition of “Complete Linear Algebra Course”

“Complete” in this specification does NOT mean exhaustive coverage of all linear algebra known to mathematics.

It means:

> **A complete introductory undergraduate linear algebra course with sufficient prerequisites, theory, computational methods, geometric interpretation, exercises, solutions, and representative applications to function as an independent free learning resource.**

The course MUST cover at least the following conceptual families.

## 4.1 Foundations

- Scalars
- Vectors
- Vector notation
- Vector addition
- Scalar multiplication
- Linear combinations
- Systems of linear equations
- Matrices
- Matrix notation
- Matrix operations

## 4.2 Linear systems and computation

- Gaussian elimination
- Row operations
- Echelon form
- Reduced row echelon form
- Pivot variables
- Free variables
- Rank
- Matrix inverses
- LU-style factorization at an introductory level
- Numerical considerations where pedagogically appropriate

## 4.3 Vector spaces

- Vector spaces
- Subspaces
- Span
- Linear independence
- Basis
- Coordinates
- Dimension
- Rank
- Null space / kernel
- Column space / image
- Rank-nullity relationship

## 4.4 Linear transformations

- Linear maps
- Matrix representation
- Composition
- Change of basis
- Coordinate maps
- Similarity at the appropriate introductory level
- Kernel and image

## 4.5 Determinants

- Intuition
- Definition
- Computational methods
- Properties
- Relationship with invertibility
- Geometric interpretation
- Area / volume scaling
- Orientation where useful

## 4.6 Eigenvalues and eigenvectors

- Eigenvalues
- Eigenvectors
- Eigenspaces
- Characteristic polynomial
- Algebraic and geometric multiplicity at an introductory level
- Diagonalization
- Similarity
- Symmetric matrices
- Spectral theorem for real symmetric matrices

## 4.7 Inner products and orthogonality

- Dot product
- Norm
- Distance
- Orthogonality
- Orthogonal complements
- Orthonormal sets
- Orthonormal bases
- Gram-Schmidt
- Orthogonal projection
- QR decomposition
- Least squares

## 4.8 Quadratic and positive-definite structure

- Quadratic forms
- Symmetric matrices
- Positive-definite matrices
- Geometric interpretation where useful

## 4.9 Singular value decomposition and approximation

- SVD intuition
- Singular values
- Singular vectors
- Geometric interpretation
- Low-rank approximation
- Relationship to least squares where appropriate
- PCA connection

## 4.10 Applications

Include several representative applications, for example:

- Least squares and data fitting
- PCA / dimensionality reduction
- Markov matrices
- Graph/network matrices
- Low-rank approximation / compression
- Differential systems or Fourier-related connections at a conceptual level

The exact division into Modules and Units MAY evolve if curriculum evidence or pedagogical evaluation justifies it.

---

# 5. Target Learner

The default course target SHOULD be:

> A motivated learner with secondary-school algebra fluency who wants a rigorous first undergraduate course in linear algebra.

The course MUST explicitly declare prerequisite expectations.

The course MUST NOT silently assume prior university linear algebra.

Where prerequisite material is essential, either:

1. include it in a prerequisite Module, or
2. link to an explicit prerequisite Unit that is part of the repository.

The prerequisite boundary MUST be documented.

---

# 6. Canonical Architecture

The v1.9 separation between the Knowledge Layer and Learning Layer remains mandatory.

## 6.1 Knowledge Layer

Represents conceptual structure.

Typical objects:

```text
Concept
Relation
Knowledge Graph
Notation
Terminology
Evidence references
```

## 6.2 Learning Layer

Represents the learner-facing instructional sequence.

Canonical hierarchy:

```text
Course
  └── Module
       └── Learning Unit
```

The canonical course sequence MUST be defined by the Course and Module structure.

The Knowledge Graph MUST NOT be used to infer the canonical learner sequence automatically.

Knowledge dependency and teaching order are related but not identical.

---

# 7. Source of Truth

Structured educational source files MUST remain the source of truth.

Generated files MUST NOT become independently edited canonical content.

Conceptually:

```text
Structured source
      ↓
compiler/adapters
 ┌────┼────┐
 ↓    ↓    ↓
Web  PDF  Video
```

Do not create three independently maintained versions of the same lesson.

If a learner-visible correction is needed, fix the structured source and regenerate downstream outputs.

---

# 8. Repository Inspection Before Implementation

Before making substantive changes, the implementation agent MUST inspect the actual repository state.

At minimum:

```bash
git status
git log --oneline -n 20
```

Inspect relevant paths including:

```text
README.md
AGENTS.md                     # if present
SPECMD/
core/config/
core/schemas/
core/src/
core/skills/
.agents/skills/
scripts/
tests/
domains/linear-algebra/
docs/
package.json
.gitignore
```

Do NOT assume the baseline commit is still current HEAD.

If newer valid work exists, preserve it.

Do NOT reset the repository to v1.9.

---

# 9. Existing v1.9 Contracts Are Binding

Unless explicitly changed by this document, existing v1.9 contracts remain valid.

In particular preserve:

- Course / Module / Learning Unit schemas
- evidence-backed curriculum workflow
- module exercise sets
- cumulative reviews
- course auditing
- math auditing
- pedagogy auditing
- explanation auditing
- evidence auditing
- visual auditing
- video auditing
- TTS normalization
- BiimSlideMaker-compatible video adaptation
- domain-independent core logic
- generated artifact separation

If a v1.9 design prevents real course completion, change the minimum necessary layer and add a regression test.

---

# 10. Development Principle: Dogfood First

During v2.0, implementation priority MUST be:

```text
real learner need
    ↓
real course content
    ↓
actual build failure / quality failure
    ↓
small framework improvement
```

NOT:

```text
speculative architecture idea
    ↓
large abstraction
    ↓
future hypothetical use case
```

Every significant new Core abstraction SHOULD answer:

> Which concrete linear-algebra course production problem requires this?

If no concrete problem exists, defer it.

---

# 11. Course Construction Phases

The work SHOULD proceed in the following order.

---

## Phase 0 — Baseline Audit

Run all existing tests and validation.

Produce a baseline report containing:

- current test results
- current domain validation result
- current course audit result
- current number of Modules
- current number of Units
- current number of exercises
- current number of cumulative reviews
- current rendering status
- current PDF status
- current video-source status
- known placeholders
- known missing content
- known malformed content
- current build commands

Do not start large content generation until baseline failures are understood.

---

## Phase 1 — Curriculum Freeze

Review the existing linear algebra curriculum research.

Required outputs SHOULD include or preserve equivalents of:

```text
research/
  source-candidates.*
  source-appraisal.*
  topic-coverage-matrix.*
  ordering-analysis.*
  decisions.*
  limitations.*
```

The curriculum MUST answer:

1. Why is this course scope appropriate?
2. Which authoritative or high-quality curricula were considered?
3. Which major topics are common across references?
4. Which topics were intentionally excluded?
5. Why is the chosen order pedagogically defensible?
6. Which prerequisite assumptions are being made?
7. Which application topics were selected and why?

No major topic SHOULD exist merely because an LLM invented it during generation.

### Curriculum freeze output

Create a v2.0 curriculum manifest documenting:

```text
course scope
target learner
prerequisites
module order
unit order
coverage rationale
explicit exclusions
application selection
known limitations
```

After curriculum freeze, structural changes SHOULD require documented justification.

---

## Phase 2 — Knowledge Layer Completion

Audit all Knowledge Concepts used by the course.

For every required Concept:

- stable identifier
- canonical label
- aliases where useful
- concise definition
- notation
- related concepts
- prerequisite relations if represented
- source/evidence references where appropriate

Ensure that no Learning Unit depends on a concept that has no valid representation where such representation is expected by the existing architecture.

Do not create Knowledge Concepts merely to mirror every Learning Unit one-to-one.

---

## Phase 3 — Module Architecture Completion

Each Module MUST have:

- clear learner-facing title
- purpose
- entry prerequisites
- learning objectives
- ordered Units
- exit competencies
- module exercise set
- explicit relationship to adjacent Modules

Module sequencing MUST be pedagogical, not simply alphabetical or graph-derived.

A suggested high-level structure is:

```text
M00 Prerequisites and Vector Foundations
M01 Systems of Linear Equations and Matrices
M02 Vector Spaces, Subspaces, Basis, Dimension
M03 Linear Transformations and Coordinates
M04 Determinants
M05 Eigenvalues, Eigenvectors, Diagonalization
M06 Inner Products, Orthogonality, Projection
M07 Least Squares and QR
M08 Symmetric Matrices, Quadratic Forms, Positive Definiteness
M09 Singular Value Decomposition and Low-Rank Approximation
M10 Applications and Synthesis
```

This is a recommended structure, not a mandatory filename mapping.

If the current eight-module structure is pedagogically sound, it MAY be retained and expanded rather than rewritten.

---

# 12. Learning Unit Quality Contract

Every required Learning Unit MUST be a real lesson.

A Unit MUST NOT be considered complete because its JSON validates.

Each Unit SHOULD contain the following pedagogical sequence where appropriate:

```text
1. Motivation / problem
2. Learning objectives
3. Prerequisite recall
4. Core idea in plain language
5. Formal definition or theorem
6. Geometric / computational intuition
7. Worked example
8. Common misconception or failure mode
9. Short check-for-understanding
10. Summary / takeaway
11. Connection to following material
```

Not every mathematical topic requires every section, but omission SHOULD be intentional.

---

# 13. Required Unit Content

Each Unit MUST have:

- unique stable ID
- title
- Module association
- learning objectives
- prerequisite declarations where supported
- learner-visible explanation
- valid mathematical notation
- at least one concrete example for nontrivial concepts
- exercise references or embedded formative checks where appropriate
- complete source references where evidence-dependent claims are made
- no placeholder prose

Units involving algorithms SHOULD include:

- algorithm intuition
- step sequence
- worked example
- interpretation of output
- failure/edge conditions where educationally relevant

Units involving abstract definitions SHOULD include:

- plain-language interpretation
- formal definition
- positive example
- at least one non-example or boundary case where useful

Units involving geometry SHOULD contain meaningful visualization when feasible.

---

# 14. Mathematical Writing Standard

Mathematical explanations MUST satisfy all of the following:

- definitions are not circular;
- notation is introduced before use;
- symbols have stable meaning within the course;
- dimensions of matrices/vectors are respected;
- examples are computationally correct;
- theorem hypotheses are not omitted when material;
- equivalent statements are not presented as identical when conditions differ;
- basis-dependent and basis-independent statements are distinguished;
- numerical algorithms are not confused with exact algebraic identities;
- determinant intuition is not substituted for definition;
- eigenvalue multiplicities are treated carefully;
- orthogonality and independence are not conflated;
- SVD is not presented as merely “eigendecomposition for rectangular matrices” without qualification;
- PCA connections are stated with appropriate centering/covariance assumptions;
- low-rank approximation claims use correct conditions.

Mathematical audits MUST treat correctness as a release-blocking property.

---

# 15. Notation Standard

Use the existing domain notation configuration where possible.

The course SHOULD establish consistent conventions for:

- scalars
- vectors
- matrices
- sets
- fields
- vector spaces
- linear maps
- transpose
- inverse
- norm
- inner product
- determinant
- rank
- null space
- column space
- eigenvalues
- eigenvectors
- singular values

Notation MUST NOT drift between Units without explicit explanation.

Where multiple conventions are common, select one default and note alternatives only when useful.

---

# 16. Explanation Depth

The course SHOULD teach at three interacting levels:

```text
intuition
↕
formal mathematics
↕
computation / application
```

Do not reduce the course to symbol manipulation.

Do not reduce the course to visual intuition without formal definitions.

Do not reduce the course to theorem statements without examples.

A strong Unit should usually make clear:

- what the object means;
- why the learner should care;
- how to compute with it;
- how it connects to earlier ideas;
- what changes when assumptions fail.

---

# 17. Examples

Every major concept MUST have examples.

Examples SHOULD progress from simple to meaningful.

Prefer small exact examples for introducing structure:

```text
2D vectors
2×2 matrices
2 or 3 equation systems
R² / R³ subspaces
small change-of-basis examples
```

Use larger or application-driven examples only after the learner understands the basic mechanism.

Examples MUST not contain unexplained magical steps.

Worked examples MUST show enough intermediate reasoning for independent study.

---

# 18. Exercises

Exercises are mandatory.

Each Module MUST have a meaningful exercise set.

Use at least three difficulty/role categories, consistent with the existing v1.9 exercise design where possible:

```text
A. Basic / retrieval / direct computation
B. Conceptual / interpretation / transfer
C. Synthesis / multi-step / application
```

The exact labels MAY differ, but the three pedagogical roles SHOULD exist.

Exercise sets SHOULD include a mix of:

- calculation
- conceptual reasoning
- proof-lite reasoning
- identifying false statements
- geometric interpretation
- applications
- synthesis across Units

Avoid generating dozens of near-identical arithmetic drills.

---

# 19. Solutions

Every required exercise MUST have a complete solution.

A complete solution MUST:

- state the final answer where appropriate;
- show the essential method;
- justify non-obvious steps;
- use notation consistent with the course;
- avoid unexplained answer-only responses.

For conceptual questions, the solution MUST explain why.

For false statements, provide either:

- a counterexample, or
- a correct logical explanation.

For computational exercises, include intermediate steps sufficient to diagnose learner mistakes.

---

# 20. Cumulative Reviews

Create cumulative reviews at major milestones.

At minimum include reviews approximately corresponding to:

```text
Review 1: vectors + systems + matrices
Review 2: vector spaces + basis + transformations
Review 3: determinants + eigenvalues
Review 4: orthogonality + least squares
Final Review: complete course
```

If the existing schema supports fewer or differently structured cumulative reviews, extend only as needed.

Reviews SHOULD intentionally interleave earlier topics.

The final review MUST not simply repeat Module exercises.

---

# 21. Visuals

Visuals SHOULD be used when they materially improve understanding.

Priority topics include:

- vector addition
- scalar multiplication
- span
- linear dependence
- basis
- change of basis
- linear transformations
- determinant area/volume
- eigenvectors
- orthogonal projection
- Gram-Schmidt
- least squares
- quadratic forms
- SVD geometry
- PCA
- low-rank approximation

Prefer reproducible vector graphics or diagram specifications over manually edited raster screenshots.

Where diagrams are generated, source files MUST be retained.

Generated diagram outputs MAY be regenerated during build.

---

# 22. Accessibility and Readability

The HTML edition MUST be usable without relying solely on color.

Required practices:

- descriptive headings
- readable equation layout
- meaningful alt text for instructional visuals where practical
- sufficient semantic HTML
- keyboard-accessible navigation where interaction exists
- no critical information encoded only by color
- responsive layout for desktop and mobile
- readable code/preformatted blocks where used

Avoid unnecessary animation.

---

# 23. Web Edition

The web edition is the primary learner-facing publication.

It MUST include at minimum:

```text
Course landing page
Curriculum / module overview
Module pages
Learning Unit pages
Exercise pages or exercise sections
Solution access
Cumulative review access
Navigation between Units
Course metadata / license
Source repository link
Build/version information
```

Recommended additions:

- previous / next Unit navigation
- Module progress context
- table of contents
- glossary or Concept lookup
- notation reference
- printable links
- citation/reference section
- course download links

The site MUST remain usable as static output.

Server-side rendering or database infrastructure MUST NOT be required for the basic course.

---

# 24. PDF Edition

v2.0 MUST produce a coherent printable PDF edition or a deterministic PDF-ready source pipeline.

The PDF MUST NOT simply be a screenshot dump of web pages.

The PDF adaptation SHOULD handle:

- cover/title page
- course metadata
- table of contents
- Module headings
- Unit headings
- equations
- figures
- page breaks
- exercise formatting
- solution formatting
- references
- links where supported

PDF-specific layout changes MAY be generated by an adapter, but the educational source remains shared.

Generated PDF binaries SHOULD be treated as release/build artifacts, not canonical source.

---

# 25. Video Edition

Each required video-capable Unit SHOULD produce a video source package compatible with the project’s established BiimSlideMaker workflow.

The video pipeline MUST preserve separation between:

```text
visible subtitle / script
```

and

```text
spoken TTS text
```

These are NOT interchangeable.

## 25.1 Subtitle/script

Learner-visible text MAY use:

- kanji
- English terminology
- mathematical notation
- ordinary written Japanese

## 25.2 Spoken script

TTS-oriented text SHOULD normalize difficult readings where needed.

Examples:

```text
固有値 → コユウチ
QR分解 → キューアールブンカイ
SVD → エスブイディー
```

Normalization MUST preserve semantic meaning.

A pronunciation normalization MUST NOT change the learner-visible subtitle.

---

# 26. Default TTS

The default v2.0 TTS configuration MUST remain:

```text
engine: VOICEVOX
speaker: ずんだもん
speedScale: approximately 1.25
```

Use the correct VOICEVOX speaker/style resolution mechanism already established by v1.9.

Do not hardcode an invalid speaker identifier.

Aivis or other supported engines MAY remain optional.

The default build path MUST not require proprietary TTS.

---

# 27. Video Script Quality

Video narration MUST be adapted for listening.

Do not simply read dense textbook prose verbatim.

Video scripts SHOULD:

- use shorter sentences;
- introduce notation verbally;
- avoid large equation dumps without explanation;
- summarize slide transitions;
- explicitly connect visual elements to narration;
- pronounce mathematical terminology correctly;
- preserve conceptual equivalence with the source Unit.

Semantic drift between textbook explanation and video explanation MUST be audit-able.

---

# 28. Generated Media Policy

Do NOT commit ordinary generated media outputs to normal Git history unless there is a specific small fixture/test need.

Normal generated artifacts include:

```text
*.mp4
*.wav
*.mp3
large rendered images
generated PDFs
offline bundles
```

The canonical GitHub repository SHOULD contain:

```text
structured educational source
curriculum research
schemas
compiler
tests
video scripts
slide source
TTS pronunciation rules
diagram source
small reusable assets
publication metadata
deployment configuration
```

This maintains complete reproducibility without turning Git history into a binary archive.

---

# 29. Publication Architecture

v2.0 MUST establish the following conceptual separation:

```text
GitHub
= canonical editable source + code + configuration + small assets

Cloudflare static hosting
= current public web edition

Cloudflare R2
= large generated publication artifacts

GitHub Releases
= versioned release snapshots / downloadable bundles
```

A provider abstraction is preferred where cheap to implement, but Cloudflare is the reference deployment.

---

# 30. GitHub Responsibilities

GitHub is the canonical development and archival source.

The repository MUST contain enough material to reconstruct the published course.

GitHub SHOULD contain:

```text
core/
domains/
tests/
scripts/
docs/
SPECMD/
publication config
deployment workflows
source diagrams
video source
course content
exercise source
solution source
evidence records
```

Normal Git history SHOULD NOT contain large final video binaries.

Git LFS SHOULD NOT be required for the default contributor workflow.

---

# 31. Cloudflare Static Hosting

Use Cloudflare Pages or Workers Static Assets for the learner-facing static website.

The publication implementation MUST treat the website as replaceable static output.

Do not couple educational source to Cloudflare-specific APIs.

The generated web package SHOULD be deployable to another static host if necessary.

---

# 32. Cloudflare R2

Use R2 as the reference location for large generated artifacts such as:

```text
videos
audio
PDF builds
offline course packages
large downloadable datasets/assets
```

The web edition SHOULD reference stable public URLs or a configurable asset base URL.

Example conceptual configuration:

```yaml
publication:
  site_base_url: https://learn.example.org
  asset_base_url: https://media.example.org
```

Do NOT scatter hardcoded production domains throughout Unit source files.

---

# 33. GitHub Releases

Each tagged stable release SHOULD be capable of attaching versioned outputs such as:

```text
linear-algebra-v2.0.0.pdf
linear-algebra-v2.0.0-html.zip
linear-algebra-v2.0.0-source-manifest.json
linear-algebra-v2.0.0-offline.zip
checksums.txt
```

Videos MAY be attached to GitHub Releases when useful, but release attachments are not required to be the primary streaming origin.

R2 SHOULD remain the primary scalable media delivery layer.

---

# 34. Publication Manifest

Add or extend a machine-readable publication manifest.

It SHOULD include at least:

```json
{
  "course_id": "...",
  "version": "2.0.0",
  "source_commit": "...",
  "build_timestamp": "...",
  "web": {...},
  "pdf": {...},
  "videos": [...],
  "checksums": {...},
  "license": "...",
  "asset_base_url": "..."
}
```

The exact schema may differ.

The important requirement is reproducible linkage between:

```text
course version
source commit
generated artifacts
public URLs
```

---

# 35. Build Outputs

A successful full-course build SHOULD conceptually produce:

```text
dist/
└── linear-algebra/
    ├── web/
    │   ├── index.html
    │   ├── course.html
    │   ├── modules/
    │   ├── units/
    │   ├── exercises/
    │   ├── reviews/
    │   ├── assets/
    │   └── styles.css
    │
    ├── pdf/
    │   ├── course.md or intermediate source
    │   └── linear-algebra.pdf
    │
    ├── video/
    │   ├── sources/
    │   ├── manifests/
    │   └── build-index.json
    │
    ├── audit/
    │   ├── structural.json
    │   ├── math.json
    │   ├── pedagogy.json
    │   ├── evidence.json
    │   ├── explanation.json
    │   ├── visual.json
    │   ├── video.json
    │   └── publication.json
    │
    ├── manifest.json
    └── build-report.json
```

Exact filenames MAY follow existing project conventions.

Do not create unnecessary migration churn merely to match this example.

---

# 36. Build Commands

v2.0 SHOULD converge on simple documented commands.

Desired conceptual interface:

```bash
npm install
npm test

npm run validate -- linear-algebra
npm run audit -- linear-algebra
npm run build -- linear-algebra
npm run build:web -- linear-algebra
npm run build:pdf -- linear-algebra
npm run build:video -- linear-algebra
npm run publish:manifest -- linear-algebra
```

If current CLI conventions differ, preserve compatibility where reasonable.

The top-level README MUST clearly document the real commands.

---

# 37. Clean-Build Requirement

A clean checkout MUST be able to reproduce all source-derived outputs that do not depend on optional external binary services.

Document required tooling.

If a tool is external, specify:

```text
name
version/range
installation
purpose
whether mandatory or optional
```

For example:

- Node.js
- PDF tooling
- VOICEVOX
- BiimSlideMaker
- optional media encoders

Failure messages SHOULD tell the user what dependency is missing.

---

# 38. Determinism

Where practical, builds SHOULD be deterministic.

At minimum:

- ordering MUST be stable;
- manifest ordering MUST be stable;
- generated filenames MUST be stable;
- IDs MUST not change randomly;
- timestamps SHOULD be isolated from semantic output;
- source commit MUST be recorded;
- checksums SHOULD be generated for release artifacts.

Randomly regenerated IDs are prohibited.

---

# 39. Audit Architecture

The v2.0 course MUST be audited in multiple dimensions.

At minimum preserve or implement:

```text
Structural audit
Course completeness audit
Mathematical audit
Pedagogical audit
Evidence audit
Explanation audit
Visual audit
Video audit
Publication audit
```

An audit report MUST distinguish:

```text
error
warning
information
```

Release-blocking errors MUST cause CI failure.

---

# 40. Structural Audit

Structural audit MUST detect at least:

- duplicate IDs
- missing required files
- missing referenced Units
- missing referenced Modules
- invalid schema
- broken sequence references
- orphan required Units
- unresolved Concept references
- invalid exercise references
- missing solutions
- missing required reviews
- malformed video source
- missing publication metadata

---

# 41. Course Completeness Audit

The completeness audit MUST detect:

- placeholder Unit content
- empty explanations
- obviously incomplete sections
- required Units with no examples
- Modules with no exercises
- required exercises without solutions
- missing cumulative reviews
- missing publication outputs
- critical TODO markers

Do not use file existence alone as a definition of completeness.

---

# 42. Mathematical Audit

Math audit SHOULD inspect:

- arithmetic correctness
- dimensional consistency
- notation consistency
- definition correctness
- theorem assumptions
- example outputs
- solution correctness
- linear independence claims
- basis claims
- determinant calculations
- inverse calculations
- eigenvalue calculations
- orthogonality
- projections
- least squares
- SVD claims
- PCA relationships

Machine checks SHOULD be used where practical.

Symbolic or numeric verification MAY be added for fixtures/examples when useful.

---

# 43. Pedagogy Audit

Pedagogy audit SHOULD inspect:

- prerequisite ordering
- concept introduction before use
- cognitive load
- missing examples
- abrupt jumps
- excessive terminology
- inadequate learner checks
- lack of connection between Units
- exercise difficulty distribution
- absence of cumulative retrieval
- unsupported prerequisite assumptions

Pedagogy audit MUST not claim objective certainty for inherently judgment-based issues.

Use severity and rationale.

---

# 44. Evidence Audit

Evidence audit MUST reject:

- fabricated source records
- nonexistent references
- unsupported claims of authority
- curriculum decisions with no recorded rationale where rationale is required
- inaccessible source identifiers when access metadata is expected

Evidence audit SHOULD distinguish:

```text
curriculum evidence
mathematical reference
pedagogical evidence
general external reference
```

Do not treat all citations as equivalent.

---

# 45. Explanation Audit

Explanation audit SHOULD identify:

- definition-only teaching
- examples without explanation
- unexplained notation
- circular explanation
- hidden prerequisite use
- analogy presented as literal identity
- intuition that contradicts formal mathematics
- missing interpretation of computations

---

# 46. Visual Audit

Visual audit SHOULD detect where practical:

- missing referenced image
- unreadable labels
- wrong aspect ratio
- duplicate or irrelevant visual
- visual contradicting explanation
- essential information conveyed only by color
- generated visual with no source/provenance metadata where required

---

# 47. Video Audit

Video audit MUST preserve v1.9 failure protections and SHOULD include tests for:

- subtitle/TTS text confusion
- invalid VOICEVOX speaker resolution
- wrong default TTS
- semantic drift in spoken script
- missing slide references
- missing narration
- malformed BiimSlideMaker source
- overlong slide text
- missing publication metadata

---

# 48. Publication Audit

Add a publication-focused audit if one does not exist.

It SHOULD check:

- broken local links
- broken generated navigation
- missing files referenced in manifest
- missing R2 object mapping
- hardcoded localhost paths
- absolute build-machine paths
- invalid asset-base URLs
- missing version metadata
- missing license metadata
- source repository link
- release manifest integrity
- checksum mismatch where checksums exist

---

# 49. Fixtures and Negative Tests

Continue the strong v1.9 pattern of maintaining deliberately bad fixtures.

For each important rule, tests SHOULD include a failure example.

Examples:

```text
missing-unit
duplicate-unit-id
unit-with-placeholder
exercise-without-solution
wrong-matrix-dimension
invalid-basis-example
invalid-eigenvalue-solution
missing-reference
fake-reference
wrong-course-order
spoken-script-as-subtitle
semantic-drift
invalid-voicevox-speaker
missing-video-slide
broken-publication-url
missing-r2-asset
hardcoded-local-path
```

A specification rule without any test SHOULD be considered weaker than one backed by a regression fixture.

---

# 50. Content Generation Workflow

The recommended generation workflow for each Unit is:

```text
1. inspect curriculum role
2. inspect prerequisites
3. inspect related Knowledge Concepts
4. draft learning objectives
5. draft explanation
6. create worked examples
7. create visuals if useful
8. create formative questions
9. create exercises
10. create solutions
11. run math audit
12. run explanation audit
13. run pedagogy audit
14. generate web output
15. adapt to PDF
16. adapt to video source
17. normalize TTS
18. run video audit
19. fix failures
20. mark Unit complete
```

Do NOT bulk-generate all Units and postpone validation until the end.

Prefer Module-sized batches.

---

# 51. Module Completion Gate

A Module is not complete until:

- all required Units are complete;
- module exercise set exists;
- all solutions exist;
- Module navigation is valid;
- Module web output renders;
- Module PDF source renders;
- required video sources validate;
- math audit passes;
- pedagogy audit has no critical issue;
- evidence audit has no critical issue;
- no placeholder remains.

The agent SHOULD complete one Module end-to-end before scaling the process.

---

# 52. Recommended Implementation Order

Use the following sequence unless the repository already has mature content that makes another order more efficient.

```text
Step 1  Baseline tests and repository inventory
Step 2  Curriculum research audit and curriculum freeze
Step 3  Course + Module sequence finalization
Step 4  Unit completeness schema/audit improvements
Step 5  Complete first foundational Module end-to-end
Step 6  Fix framework deficiencies discovered
Step 7  Complete systems/matrices Module
Step 8  Complete vector spaces Module
Step 9  Complete transformations Module
Step 10 Complete determinants Module
Step 11 Complete eigenvalue Module
Step 12 Complete orthogonality/least-squares Modules
Step 13 Complete SVD/applications
Step 14 Add cumulative reviews
Step 15 Full mathematical consistency pass
Step 16 Full pedagogy consistency pass
Step 17 Full web build
Step 18 Full PDF build
Step 19 Full video-source build
Step 20 Publication manifest
Step 21 Cloudflare publication pipeline
Step 22 GitHub Release packaging
Step 23 Fresh-clone reproducibility test
Step 24 Release audit
Step 25 Tag v2.0.0
```

---

# 53. CI

CI SHOULD perform at least:

```text
schema validation
unit tests
domain validation
course structural audit
course completeness audit
fixture regression tests
web build
publication integrity check
```

Math/pedagogy/evidence audits that require model-based judgment MAY run separately if necessary, but release procedures MUST include them.

CI MUST NOT require production Cloudflare credentials for ordinary pull requests.

Deployment steps SHOULD run only on appropriate branches/tags and secrets.

---

# 54. Deployment Workflow

Reference workflow:

```text
push / PR
   ↓
test + validate + build preview

merge to main
   ↓
build latest web edition
   ↓
deploy static site
   ↓
upload large generated artifacts to R2
   ↓
generate publication manifest

tag v2.0.0
   ↓
rebuild from tag
   ↓
checksums
   ↓
GitHub Release assets
   ↓
versioned publication metadata
```

Deployment scripts MUST fail safely if secrets are missing.

Do not embed secrets in repository files.

---

# 55. Cloudflare Configuration

Production-specific data MUST be configurable.

Use environment variables or deployment configuration for values such as:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
R2_BUCKET
R2_ENDPOINT
SITE_BASE_URL
ASSET_BASE_URL
```

Names MAY differ based on implementation.

Provide an example configuration file that contains no real secret.

Example:

```text
.env.example
```

---

# 56. Asset Addressing

Large assets SHOULD be referenced through stable logical paths.

Example:

```text
/videos/linear-algebra/<unit-id>.mp4
/pdf/linear-algebra/v2.0.0/linear-algebra.pdf
/releases/linear-algebra/v2.0.0/offline.zip
```

Do not encode random temporary upload URLs in educational source.

The asset origin MUST be configurable independently of content.

---

# 57. Offline Distribution

v2.0 SHOULD provide an offline-friendly package.

At minimum consider:

```text
HTML/CSS/JS
small local assets
course manifest
optional PDF
```

Large video inclusion MAY be optional to avoid oversized bundles.

A learner SHOULD be able to download the textual course without Cloudflare access.

---

# 58. Licensing and Attribution

The course MUST clearly expose:

- project license
- content license if distinct
- source repository
- third-party asset attribution
- external source/reference attribution

Third-party material MUST NOT be copied into the repository merely because it is accessible online.

Prefer:

- original explanations
- original diagrams
- public-domain material
- openly licensed material compatible with the project
- citations to external references rather than unauthorized copying

Track licenses for imported assets.

---

# 59. Citation Discipline

External educational sources SHOULD support curriculum and factual verification.

Do not produce pseudo-citations.

For each stored citation, preserve enough metadata to identify the source.

Where available:

```text
title
author
organization
edition/version
year
URL/DOI
access date
license
relevance
```

Do not imply endorsement by cited institutions.

---

# 60. README Update

The top-level README MUST be updated for v2.0.

It SHOULD explain:

1. what Open Learn Core is;
2. what makes it different from a static textbook repository;
3. the Knowledge Layer / Learning Layer distinction;
4. the compiler architecture;
5. the linear algebra reference course;
6. how to build it;
7. how to run audits;
8. how publication works;
9. where the live course is hosted;
10. how to contribute;
11. licensing.

Recommended positioning:

> Open Learn Core is an open-source framework for building reproducible, auditable learning resources from structured educational source and publishing them across web, print, and video.

Avoid marketing claims that cannot be demonstrated.

---

# 61. Domain README

`domains/linear-algebra/README.md` MUST explain:

- target learner
- prerequisite assumptions
- course scope
- Module structure
- source structure
- how to validate the domain
- how to build the course
- how to build videos
- known limitations
- curriculum evidence location
- license

---

# 62. Contributor Experience

A new contributor SHOULD be able to determine:

```text
Where do I edit a Unit?
Where do I add an exercise?
Where do I add a solution?
Where do I edit notation?
Where do I add a citation?
How do I build the page?
How do I run audits?
How do I preview a video source?
```

without reverse engineering the project.

Add contributor documentation where necessary.

---

# 63. Do Not Hide Generated Content Behind AI

The course MUST remain inspectable and editable as normal source files.

Do not create an architecture in which critical educational content exists only inside opaque model prompts or caches.

AI MAY generate or revise content.

The final accepted content MUST be stored in the canonical structured source and reviewable through Git.

---

# 64. AI Provenance

Where practical, the project MAY record whether content was:

```text
human-written
AI-assisted
AI-generated then reviewed
programmatically generated
```

However, do NOT block v2.0 solely to implement elaborate provenance infrastructure.

Correctness and reproducibility are higher priority.

---

# 65. No Silent Hallucination Rule

If a generation step is uncertain about:

- a theorem
- a curriculum claim
- a citation
- an external fact
- a source license
- a mathematical result

it MUST NOT silently invent an answer.

Prefer:

```text
flag uncertainty
record unresolved issue
verify with source
```

before marking content complete.

---

# 66. Search and External Research

When generating curriculum or validating nontrivial factual claims, use credible sources.

Priority order SHOULD generally be:

1. official university/open-course curriculum
2. established open textbook
3. recognized mathematical reference
4. primary documentation
5. peer-reviewed educational literature where pedagogical claims require it

Do not over-cite trivial arithmetic.

---

# 67. Quality Over Raw Unit Count

Do NOT target a specific number of Units merely to appear comprehensive.

The current v1.9 repository already contains roughly fifty Units across core linear algebra topics.

v2.0 SHOULD preserve useful granularity, merge Units only if pedagogically justified, and add Units only where genuine gaps exist.

The release metric is:

```text
complete learning path
```

not:

```text
maximum number of JSON files
```

---

# 68. Breaking Changes

Avoid breaking schema changes.

If unavoidable:

1. document the reason;
2. provide migration;
3. migrate the linear algebra domain;
4. update fixtures;
5. update documentation;
6. preserve backwards compatibility where inexpensive.

Do not rename IDs casually.

Stable educational identifiers are part of the public interface.

---

# 69. Versioning

Use semantic versioning for project releases.

The course publication MUST include project/course version metadata.

At release:

```text
2.0.0
```

must map to a known source commit.

If content is updated after release, do not silently mutate the meaning of the versioned downloadable release.

The live site MAY represent latest/main, but should expose version information.

---

# 70. v2.0 Release Blockers

The following are release-blocking:

- failing required tests
- invalid schemas
- broken canonical course sequence
- missing required Unit
- placeholder required Unit
- missing required exercise solutions
- known critical mathematical error
- fabricated citation
- unresolved critical audit result
- broken full web build
- broken required PDF pipeline
- broken required video-source pipeline
- subtitle/TTS conflation
- invalid default VOICEVOX configuration
- broken production asset references
- inability to reproduce build from clean checkout
- missing license information
- deployment requiring undocumented manual edits

---

# 71. Non-Blocking for v2.0

The following MAY remain future work if documented:

- learner accounts
- cloud progress sync
- quizzes with server persistence
- adaptive learning
- automatic grading backend
- mobile native apps
- advanced search
- multilingual full-course translation
- additional academic domains
- analytics dashboard
- comments/discussion
- SCORM/LTI integration
- full LMS functionality
- automatic credentialing
- all video MP4s pre-rendered in CI
- high-cost AI evaluation on every pull request

---

# 72. Acceptance Tests

At minimum, implement or manually verify the following release scenarios.

## Scenario A — First-time learner

A learner opens the site and can determine:

- what the course teaches;
- what prerequisites are required;
- where to start;
- what comes next;
- where exercises are;
- where solutions are;
- where cumulative reviews are.

## Scenario B — Full learning route

Following next links from the first required Unit eventually reaches the final Unit without:

- dead ends
- unexpected cycles
- missing page
- unintroduced mandatory topic

## Scenario C — Contributor build

On a clean checkout:

```bash
npm install
npm test
npm run build -- linear-algebra
```

or documented equivalents succeed.

## Scenario D — Unit correction

A contributor edits one canonical Unit source, rebuilds, and the correction appears in generated HTML/PDF/video source without independently editing three formats.

## Scenario E — Exercise correction

A solution can be corrected in its canonical source and propagated to publication outputs.

## Scenario F — Invalid mathematics fixture

A deliberately invalid mathematical fixture fails the expected audit.

## Scenario G — Invalid TTS fixture

A subtitle/TTS contract violation fails video audit.

## Scenario H — Publication

The built static site references large assets using configured publication URLs and contains no build-machine absolute paths.

## Scenario I — Offline package

A learner can open the offline textual edition without depending on the production host for core textual content.

## Scenario J — Version traceability

From a published manifest, a maintainer can identify the source commit used to generate the release.

---

# 73. Recommended Work Tracking

Maintain a v2.0 checklist, for example:

```text
[ ] Baseline audit
[ ] Curriculum freeze
[ ] Module 0 complete
[ ] Module 1 complete
[ ] Module 2 complete
[ ] Module 3 complete
[ ] Module 4 complete
[ ] Module 5 complete
[ ] Module 6 complete
[ ] Module 7 complete
[ ] SVD/application content complete
[ ] Module exercises complete
[ ] Solutions complete
[ ] Cumulative reviews complete
[ ] Math audit clean
[ ] Pedagogy audit clean
[ ] Evidence audit clean
[ ] Visual audit clean
[ ] Web edition complete
[ ] PDF edition complete
[ ] Video sources complete
[ ] TTS audit clean
[ ] Publication manifest
[ ] Cloudflare deployment
[ ] R2 upload pipeline
[ ] GitHub Release packaging
[ ] Clean-clone reproduction
[ ] README/docs update
[ ] Final release audit
```

Do not mark a Module complete based solely on content file generation.

---

# 74. Completion Report

When implementation is complete, produce a concise machine-readable and human-readable report containing:

```text
release version
source commit
number of Modules
number of Units
number of exercises
number of solutions
number of cumulative reviews
web build status
PDF build status
video source status
audit status by category
deployment status
known limitations
```

This report SHOULD be included in or linked from the build output.

---

# 75. Mandatory Agent Behavior

The implementation agent MUST:

- inspect existing code before changing architecture;
- reuse v1.9 contracts;
- work incrementally;
- keep tests passing;
- validate generated content;
- prefer small patches;
- preserve stable IDs;
- record significant curriculum decisions;
- verify mathematics rather than assume generated answers are correct;
- treat course completion as the main objective;
- keep large generated media out of ordinary Git history;
- keep GitHub as canonical source;
- keep deployment configuration separate from educational content.

The agent MUST NOT:

- claim completion while required Units remain placeholders;
- generate fake references;
- silently skip failing Units;
- disable audits merely to make CI green;
- hardcode private deployment credentials;
- commit secrets;
- convert TTS pronunciation text into visible subtitles;
- replace the architecture without demonstrated need;
- introduce a proprietary mandatory dependency for the basic course.

---

# 76. Final Definition of Done

Open Learn Core v2.0 is DONE when this statement is true:

> A third party can clone the repository, inspect the evidence and curriculum decisions, build the complete linear algebra course, audit it, read it as a static website, generate its print representation, reproduce its video source packages, understand how its TTS text is produced, and trace the published artifacts back to the exact open source used to generate them.

The final release should demonstrate that Open Learn Core is not merely a collection of educational JSON files and not merely an AI content generator.

It should demonstrate:

```text
structured knowledge
      +
evidence-backed curriculum
      +
pedagogical source
      +
reproducible compilers
      +
multi-format publication
      +
quality audits
      =
reproducible open learning infrastructure
```

---

# 77. Priority Rule When Trade-offs Occur

When two implementation choices conflict, use the following priority order:

```text
1. Mathematical correctness
2. Learner comprehensibility
3. Course completeness
4. Reproducibility
5. Auditability
6. Maintainability
7. Open accessibility
8. Build reliability
9. Performance
10. Architectural elegance
```

Do not sacrifice correctness or learner comprehension merely to preserve a clever abstraction.

---

# 78. Immediate First Task for Codex

After reading this specification, DO NOT immediately bulk-generate the entire course.

Perform the following first:

```text
1. Inspect current HEAD.
2. Run current tests.
3. Inventory all linear algebra Modules and Units.
4. Classify each Unit as:
   - complete
   - partial
   - placeholder
   - structurally valid but educationally insufficient
5. Inventory exercises and solutions.
6. Inventory curriculum evidence.
7. Inventory current web/PDF/video build capabilities.
8. Identify the smallest set of framework deficiencies blocking one
   complete end-to-end Module.
9. Produce/update a v2.0 implementation checklist.
10. Complete ONE foundational Module end-to-end.
11. Run all audits.
12. Only then scale the workflow to the remaining Modules.
```

This staged approach is mandatory because v2.0 is intended to validate the architecture through real use rather than hide architecture problems behind bulk content generation.

---

# 79. Suggested Commit Strategy

Prefer reviewable commits.

Example sequence:

```text
chore: inventory v2.0 linear algebra course gaps
docs: freeze v2.0 linear algebra curriculum
feat: enforce unit completeness audit
content: complete vector foundations module
test: add negative fixtures for incomplete units
content: complete systems and matrices module
content: complete vector spaces module
...
feat: add publication manifest
feat: add cloudflare static deployment
feat: add r2 artifact publishing
docs: document v2.0 contributor workflow
release: prepare linear algebra v2.0.0
```

Avoid one enormous commit containing the entire course unless there is a compelling operational reason.

---

# 80. Closing Instruction

The purpose of v2.0 is proof.

Do not merely make the repository larger.

Make it possible to point to one complete course and say:

> **This course was constructed from open structured source, its educational design is inspectable, its outputs are reproducible, its large artifacts are distributable without bloating Git, and its quality can be systematically audited.**

That is the v2.0 milestone.
