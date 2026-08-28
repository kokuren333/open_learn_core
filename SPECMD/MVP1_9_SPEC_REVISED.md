# Open Learn Core — MVP v1.9 Specification
## Linear Algebra Domain v0.1 / Evidence-Based Multi-Format Course Compiler
## HTML + Printable PDF + BiimSlideMaker-Compatible Video

---

# 0. Purpose

This document is the authoritative Codex implementation specification for MVP v1.9 of `open_learn_core`.

v1.9 consolidates all design decisions from v1.0–v1.8 and restructures the Linear Algebra Domain from a basis-centered concept experiment into a complete evidence-based course system covering foundations through advanced applications.

The system must support three publication formats from a shared structured source:

```text
Evidence-Based Curriculum
        ↓
Course
        ↓
Modules
        ↓
Learning Units
        ↓
Structured Content
   ┌────┼──────────┐
   ↓    ↓          ↓
 HTML   PDF       Video
               (BiimSlideMaker)
```

v1.9 MUST implement:

1. Evidence-backed full linear algebra curriculum
2. Separation of Knowledge Graph from pedagogical Course sequence
3. Course / Module / Learning Unit hierarchy
4. Approximately 45–70 Learning Units
5. Concise reference-oriented Concept pages
6. Rich but bounded Learning Unit pages
7. Detailed exercise solutions without reasoning omissions
8. HTML publication
9. Printable monochrome-oriented PDF publication via Pandoc + LuaLaTeX
10. Video authoring and rendering protocol compatible with `BiimSlideMaker`
11. Local cloned BiimSlideMaker toolchain rather than committed generated media
12. Default TTS: VOICEVOX, ずんだもん, ノーマル, reading speed ≈ 1.25
13. Separation of subtitle text from TTS pronunciation text
14. Generated audio/video excluded from Git
15. YouTube publication metadata registered after manual upload
16. Course-level semantic audit

Reference implementation for video tooling:

```text
https://github.com/kokuren333/BiimSlideMaker
```

The Open Learn repository MUST NOT merely imitate the visual style. It must formally adopt the relevant BiimSlideMaker authoring protocol and enforce it during video-source generation and audit.

---

# 1. v1.9 Core Goal

The goal is NOT:

- to keep expanding `basis`
- to create many disconnected Concept pages
- to use the Concept Graph as a curriculum
- to create three separately maintained HTML/PDF/video versions

The goal is:

> Build a coherent linear algebra course from foundations to applications, backed by trustworthy evidence, and compile the same structured educational source into HTML, printable PDF, and BiimSlideMaker-compatible video.

---

# 2. Separate Knowledge Architecture from Learning Architecture

The system MUST distinguish:

```text
Knowledge Layer
```

from:

```text
Learning Layer
```

## 2.1 Knowledge Layer

Represents mathematical dependency and relationships.

Example:

```text
eigenvalue
├─ prerequisite → matrix multiplication
├─ prerequisite → linear transformation
├─ related      → determinant
├─ used_in      → diagonalization
└─ related      → basis
```

The Knowledge Graph may be complex and many-to-many.

It is NOT required to be easy for a learner to navigate directly.

## 2.2 Learning Layer

Represents the intended human learning sequence.

```text
Course
↓
Module
↓
Learning Unit
↓
Next Unit
```

The learner-facing curriculum MUST be primarily Course-based, not Graph-based.

---

# 3. Education Entity Hierarchy

v1.9 formally adopts:

```text
Domain
  ↓
Course
  ↓
Module
  ↓
Learning Unit
  ↓
Content Blocks
```

Knowledge Concepts remain separate.

---

# 4. Entity Definitions

## 4.1 Domain

Example:

```text
linear-algebra
```

## 4.2 Course

A complete pedagogical route.

Example:

```text
linear-algebra-foundations-to-applications
```

## 4.3 Module

A coherent teaching section.

Examples:

```text
vectors
systems-and-matrices
vector-spaces
linear-transformations
orthogonality
determinants
eigenvalues
applications
```

## 4.4 Learning Unit

The canonical teaching/publication unit.

Target size:

```text
HTML reading: approximately 5–10 minutes
Video: approximately 10–15 minutes
```

Examples:

```text
gaussian-elimination
basis-definition
least-squares
svd-intuition
```

## 4.5 Knowledge Concept

A mathematical knowledge node.

Examples:

```text
basis
span
rank
eigenvalue
```

A Knowledge Concept and a Learning Unit MUST NOT be modeled as the same thing.

A single Concept MAY require multiple Learning Units.

A single Learning Unit MAY refer to multiple Concepts.

---

# 5. Learning Unit as the Multi-Format Source Unit

A Learning Unit is the canonical source for HTML, PDF, and video adaptation.

Example:

```yaml
id: basis-definition
module: module-vector-spaces

title:
  ja: 基底とは何か
  en: What Is a Basis?

estimated_duration:
  reading_minutes: 8
  video_minutes: 12

concepts:
  primary:
    - basis
  supporting:
    - span
    - linear-independence

prerequisites:
  - span
  - linear-independence

learning_objectives:
  - 基底の定義を説明できる
  - span と linear independence の両方が必要な理由を説明できる

content:
  - type: motivation
  - type: intuition
  - type: definition
  - type: worked_example
  - type: visual
  - type: checkpoint

formats:
  html:
    required: true
  pdf:
    required: true
  video:
    required: true
```

---

# 6. Full Linear Algebra Scope

The Course MUST cover the field broadly enough to provide an experimental “foundations through applications” linear algebra curriculum.

The curriculum MUST NOT be organized around `basis`.

---

# 7. Required Course Modules

## Module 0 — Prerequisites and Vectors

Topics should include:

- scalars
- vectors
- vector notation
- vector addition
- scalar multiplication
- linear combinations
- \(R^n\)
- geometric vector interpretation
- dot product
- norm
- distance
- basic geometry of vectors

## Module 1 — Linear Systems and Matrices

Topics should include:

- linear equations
- systems of equations
- matrix notation
- \(Ax=b\)
- row operations
- Gaussian elimination
- echelon form
- RREF
- pivots
- free variables
- consistency
- unique / none / infinitely many solutions
- matrix operations
- matrix multiplication
- inverse matrix
- elementary matrices
- LU decomposition

## Module 2 — Vector Spaces and Subspaces

Topics should include:

- vector spaces
- subspaces
- span
- column space
- row space
- null space
- linear independence
- basis
- coordinate vectors
- dimension
- rank
- rank-nullity theorem
- four fundamental subspaces

## Module 3 — Linear Transformations

Topics should include:

- linear transformation
- kernel
- image
- matrix representation
- coordinate vectors
- change of basis
- composition
- inverse transformations
- similarity

## Module 4 — Orthogonality

Topics should include:

- orthogonality
- orthogonal complement
- orthogonal projection
- orthonormal basis
- Gram-Schmidt
- QR decomposition
- least squares
- pseudoinverse

## Module 5 — Determinants

Topics should include:

- determinant intuition
- determinant definition
- determinant properties
- computation
- geometric interpretation
- determinant and invertibility
- determinant and volume/orientation

## Module 6 — Eigenvalues and Eigenvectors

Topics should include:

- eigenvalue
- eigenvector
- characteristic polynomial
- eigenspace
- algebraic/geometric multiplicity where appropriate
- diagonalization
- repeated eigenvalues
- symmetric matrices
- spectral theorem
- positive definite matrices

## Module 7 — Applications and Advanced Topics

Topics should include:

- quadratic forms
- singular value decomposition
- low-rank approximation
- PCA connection
- Markov matrices
- graph/network matrices
- differential equation connections
- Fourier / complex matrix introduction
- numerical linear algebra
- conditioning
- numerical stability

---

# 8. Learning Unit Count

Target:

```text
approximately 45–70 Learning Units
```

Rules:

- Do not artificially split units to increase count.
- Do not create units that are too large for a 10–15 minute video.
- Unit boundaries MUST be justified pedagogically.
- Course design MUST be supported by curriculum evidence review.

---

# 9. Evidence-Based Curriculum Research

The Course MUST NOT be designed solely from model memory.

Create:

```text
domains/linear-algebra/working/curriculum-review/
```

with at least:

```text
research-question.yaml
source-candidates.yaml
source-appraisal.yaml
curriculum-comparison.yaml
topic-coverage-matrix.yaml
ordering-analysis.yaml
decisions.yaml
limitations.yaml
```

Compare multiple trustworthy sources, such as:

- university OER
- open textbooks
- university course syllabi
- official/institutional teaching materials

Analyze:

- topic coverage
- teaching order
- prerequisites
- module boundaries
- commonly omitted topics
- advanced topics
- differences in pedagogical organization

---

# 10. Curriculum Decisions

Major decisions MUST be recorded.

Example:

```yaml
id: decision-span-before-linear-independence

question:
  ja: span と linear independence のどちらを先に教えるか

decision:
  ja: span を先に扱う

rationale:
  ja: >
    線形結合から「どこまで作れるか」を先に扱い、
    その後に「冗長でない」という独立性を対比しやすくする。

evidence:
  - evidence-curriculum-001

status: supported
```

---

# 11. New Core Schemas

Add or revise:

```text
core/schemas/course.schema.json
core/schemas/module.schema.json
core/schemas/learning-unit.schema.json
core/schemas/video-source.schema.json
core/schemas/video-publication.schema.json
core/schemas/tts-config.schema.json
```

---

# 12. Linear Algebra Data Structure

Recommended:

```text
domains/linear-algebra/
├─ domain.yaml
├─ README.md
├─ config/
│  ├─ notation.yaml
│  ├─ style.yaml
│  └─ tts.yaml
│
├─ data/
│  ├─ knowledge/
│  │  ├─ concepts/
│  │  └─ graph/
│  ├─ courses/
│  ├─ modules/
│  ├─ units/
│  ├─ claims/
│  ├─ evidence/
│  ├─ sources/
│  ├─ exercises/
│  ├─ diagnostics/
│  ├─ misconceptions/
│  └─ visuals/
│
├─ assets/
│  ├─ diagrams/
│  ├─ infographics/
│  ├─ thumbnails/
│  └─ pdf/
│
├─ video/
│  ├─ units/
│  ├─ templates/
│  └─ generated/
│
├─ pdf/
│  ├─ templates/
│  └─ generated/
│
├─ working/
│  ├─ curriculum-review/
│  └─ units/
│
├─ tests/
└─ docs/
```

---

# 13. Concept Page Responsibility

Concept pages become concise reference pages.

Each Concept page SHOULD contain:

- short accurate summary
- formal definition
- key properties
- important relations
- prerequisite/related Concept references
- related Learning Units
- trustworthy sources
- evidence references
- where the Concept appears in the Course

Concept pages MUST NOT contain the entire teaching experience.

---

# 14. Learning Unit Responsibility

The Learning Unit is the main teaching page.

It may include:

```text
motivation
problem
recall
intuition
definition
theorem
proof
explanation
formula
example
counterexample
worked_example
visual
checkpoint
misconception
connection
summary
evidence_note
```

---

# 15. Learning Unit Quality

Typical target:

```text
Japanese main prose:
approximately 1500–3000 characters

HTML reading:
approximately 5–10 minutes

Video:
approximately 10–15 minutes

Worked examples:
1–2

Checkpoints:
2–4
```

Length is not a quality metric by itself.

A good Unit should usually connect:

```text
Why
↓
Concrete Case
↓
Intuition
↓
Formal Statement
↓
Unpacking
↓
Worked Example
↓
Counterexample
↓
Connection
```

---

# 16. Exercise Architecture

Use three levels:

## Unit Exercises

Approximately 3–8 questions.

## Module Exercises

Approximately 10–20 questions.

## Cumulative Reviews

Cross-module integration.

Exercise types should include:

```text
recognition
calculation
explanation
proof
error_detection
counterexample_construction
transfer
synthesis
application
```

---

# 17. Exercise Solution Contract

Solutions MUST NOT skip critical reasoning.

Substantial solutions should include:

1. What is being asked
2. Relevant Concepts
3. Strategy
4. Calculation/proof steps
5. Why each operation is used
6. Conclusion
7. Common wrong path
8. Alternative solution when educationally useful

Add:

```text
openlearn-exercise-solution-writer
```

---

# 18. Prerequisite Remediation

Knowledge Graph is used internally for routing.

Learner UI should expose simple links such as:

```text
span を忘れた？
[5分で復習]
```

Optional short remediation units MAY exist:

```text
span-quick-review
linear-independence-quick-review
```

---

# 19. HTML Role

HTML is the canonical complete learning experience.

HTML should support:

- Course navigation
- Module navigation
- Learning Unit pages
- mathematical typesetting
- exact diagrams
- generated infographics
- prerequisite remediation
- checkpoints
- exercises
- collapsible solutions
- diagnostics
- evidence
- source links
- YouTube embed/link
- PDF download
- Previous / Next navigation

---

# 20. PDF Role

PDF is optimized for:

- printing
- offline reading
- annotation
- storage
- continuous study

PDF MUST NOT be a raw browser printout.

---

# 21. PDF Pipeline

Use:

```text
Structured Learning Unit
↓
Markdown / Pandoc AST
↓
Pandoc
↓
LaTeX
↓
LuaLaTeX
↓
PDF
```

Preferred stack:

```text
Pandoc
LuaLaTeX
luatexja
```

---

# 22. PDF Outputs

Support:

```text
Unit PDF
Module PDF
Course PDF
Exercise Book PDF
Solution Book PDF
```

Module PDF is the primary recommended distribution unit.

Course PDF may be optional if excessively large.

---

# 23. PDF Design

Default requirements:

- A4
- white background
- readable monochrome printing
- grayscale-safe visuals
- native LaTeX equations
- clear hierarchy
- page numbers
- table of contents for Module/Course
- evidence/sources in footnotes or end matter
- optional HTML/YouTube QR links

---

# 24. PDF Figures

Exact figures should prefer:

- TikZ
- PGFPlots
- SVG
- programmatic plotting

Conceptual infographics may use image generation.

Do not use image generation for mathematically exact coordinate diagrams when precision matters.

---

# 25. BiimSlideMaker Is the Reference Video Protocol

The video generation workflow MUST be based on the repository:

```text
https://github.com/kokuren333/BiimSlideMaker
```

Codex MUST inspect the current repository and its `prompt.txt` before implementing the video pipeline.

The implementation MUST treat BiimSlideMaker as a tool dependency/reference implementation, not merely as design inspiration.

---

# 26. Clone-Based BiimSlideMaker Integration

Do NOT commit a full copied BiimSlideMaker repository into Open Learn by default.

Create a setup mechanism that clones it locally.

Recommended path:

```text
.tools/BiimSlideMaker/
```

Add `.tools/BiimSlideMaker/` to `.gitignore`.

Provide a setup script such as:

```text
scripts/setup-biim-slide-maker.mjs
```

or equivalent.

The setup script SHOULD:

1. Check whether `.tools/BiimSlideMaker/` exists.
2. Clone `https://github.com/kokuren333/BiimSlideMaker` if absent.
3. Optionally checkout a configured commit/tag.
4. Report the installed revision.
5. Never silently overwrite local modifications.
6. Fail clearly if Git is unavailable.

Store desired upstream revision in a tracked config file if pinning is used.

Example:

```yaml
repository: https://github.com/kokuren333/BiimSlideMaker
revision: main
local_path: .tools/BiimSlideMaker
```

Before direct code reuse, Codex MUST inspect the upstream license and document the integration decision.

---

# 27. Do Not Fork the Authoring Contract Accidentally

The Open Learn video source MUST remain intentionally compatible with the core BiimSlideMaker authoring model:

```text
Marp Markdown
+
YAML
```

with per-slide fields corresponding to:

```yaml
slides:
  - id:
    script:
    note_top:
    note_bottom:
```

Open Learn MAY extend this source model, but compilation to a BiimSlideMaker-compatible representation MUST be explicit.

---

# 28. Mandatory BiimSlideMaker Prompt Rules

The Open Learn video authoring Skills MUST encode and enforce the important rules defined by the BiimSlideMaker `prompt.txt`.

At minimum:

## Slide density

One slide should contain very little information.

Target:

```text
approximately 3–5 lines maximum per slide
```

If more information is required:

- increase the number of slides
- move detail into narration
- use `note_bottom`
- use `note_top`

Do NOT cram the slide.

## Code blocks

Do NOT use fenced code blocks in Marp slides because they may break layout.

Inline code is allowed where useful.

## First slide

The first slide MUST use:

```html
<!-- class: title -->
```

## Highlight slides

Use:

```html
<!-- class: highlight -->
```

only for slides that truly need emphasis.

After a highlight slide, return to the default class with:

```html
<!-- class: -->
```

before the next normal slide.

The class reset MUST NOT be omitted.

## Markdown styling

Use available visual affordances where helpful:

- bold
- inline code
- blockquote
- lists
- headings

but maintain low slide density.

## YAML field meaning

Treat:

```text
script
```

as the canonical subtitle/narration-language text.

Treat:

```text
note_top
```

as a concise slide summary/key point.

Treat:

```text
note_bottom
```

as explanatory supplementary text.

`note_top` and `note_bottom` are DISPLAY TEXT and MAY use standard Japanese orthography, kanji, English terms, symbols, and mathematical notation.

---

# 29. Critical Separation: Display Script vs TTS Script

This is mandatory.

The canonical `script` field is human-readable Japanese and is used for:

- subtitles
- displayed narration text
- editorial review
- transcript source

It MAY contain:

- kanji
- English terms
- mathematical terminology
- standard orthography

The actual text sent to TTS MUST be a separately generated field:

```text
spoken_script
```

or equivalent.

Example:

```yaml
slides:
  - id: 12

    script: |
      次に、Gram-Schmidt法を使って直交基底を構成します。
      この操作は QR 分解にもつながります。

    spoken_script: |
      つぎに、グラムシュミットほうをつかって、
      ちょっこうきていをこうせいします。
      このそうさは、キューアールぶんかいにもつながります。

    note_top: Gram-Schmidt法と直交基底

    note_bottom: |
      線形独立なベクトル集合から直交系を構成する手順です。
      QR分解の基礎としても重要です。
```

The exact use of hiragana vs katakana MAY be adjusted for TTS quality.

The key requirement is:

> `script` remains suitable for subtitles.
> `spoken_script` is optimized exclusively for pronunciation.

---

# 30. Never Replace Canonical Script with Pronunciation Text

Forbidden:

```yaml
script: グラムシュミットホウヲツカイマス
```

if that makes subtitles worse.

Pronunciation normalization MUST happen in a separate artifact/field.

---

# 31. TTS Pronunciation Normalization Skill

Add:

```text
openlearn-tts-script-normalizer
```

Purpose:

Convert canonical subtitle `script` into TTS-oriented `spoken_script`.

It MUST preserve meaning.

It MAY transform:

- difficult kanji to kana
- English words to Japanese phonetic reading
- abbreviations to spoken form
- symbols to natural spoken language
- formulas to suitable spoken forms
- punctuation to improve pauses

Examples:

```text
SVD
→ エスブイディー

QR分解
→ キューアールぶんかい

Gram-Schmidt法
→ グラムシュミットほう

R^n
→ アールのエヌじょう
```

The canonical visible text remains unchanged.

---

# 32. TTS Normalization Must Be Auditable

Do not generate `spoken_script` as an invisible transient transform only.

Store it in tracked video-source data OR generate a deterministic/inspectable intermediate source before TTS.

The reviewer must be able to compare:

```text
script
vs
spoken_script
```

---

# 33. TTS Normalization Rules

The normalizer MUST:

1. Preserve mathematical meaning.
2. Avoid ambiguous readings.
3. Expand abbreviations where useful.
4. Convert hard-to-read English into Japanese phonetic reading when appropriate.
5. Convert difficult compounds to kana when TTS pronunciation is unreliable.
6. Preserve pauses with punctuation.
7. Never alter the subtitle text.
8. Never invent explanatory content absent from the script.
9. Keep one-to-one semantic correspondence with `script`.

---

# 34. Formula Reading

Formula reading should be explicitly authored when automatic conversion could be ambiguous.

Example source:

```yaml
script: |
  任意のベクトル v は、基底ベクトルの線形結合として表せます。

spoken_script: |
  にんいのベクトル、ブイは、
  きていベクトルのせんけいけつごうとしてあらわせます。
```

For expressions such as:

```text
Ax=b
R^n
λ
A^T
```

the spoken form MUST be checked.

A pronunciation dictionary MAY be used.

---

# 35. Domain Pronunciation Dictionary

Create:

```text
domains/linear-algebra/config/pronunciation.yaml
```

Example:

```yaml
entries:
  - surface: Gram-Schmidt
    reading: グラムシュミット

  - surface: SVD
    reading: エスブイディー

  - surface: QR
    reading: キューアール

  - surface: RREF
    reading: アールレフ

  - surface: PCA
    reading: ピーシーエー
```

Do not use the dictionary to alter displayed subtitles.

It applies only to TTS transformation.

---

# 36. TTS Backend Architecture

TTS MUST be adapter-based.

Supported initial backends:

```text
VOICEVOX
Aivis
```

Do not add Style-Bert-VITS2 as a required backend in v1.9.

Interface concept:

```text
synthesize(spoken_script, voice_config, synthesis_options) -> audio file
```

---

# 37. Default TTS

The default TTS for Open Learn videos is:

```text
backend: VOICEVOX
speaker: ずんだもん
style: ノーマル
speedScale: approximately 1.25
```

Store this in:

```text
domains/linear-algebra/config/tts.yaml
```

Example:

```yaml
default:
  backend: voicevox

  speaker:
    name: ずんだもん
    style: ノーマル

  synthesis:
    speed_scale: 1.25
```

---

# 38. Do Not Hardcode VOICEVOX Speaker ID If Avoidable

VOICEVOX speaker/style numeric IDs may be implementation-specific.

The adapter SHOULD:

1. Query available speakers from VOICEVOX.
2. Resolve:
   - speaker name = `ずんだもん`
   - style = `ノーマル`
3. Obtain the corresponding runtime speaker/style ID.
4. Fail clearly if not available.

A configured numeric fallback MAY exist but SHOULD NOT be the primary identity.

---

# 39. VOICEVOX Default Speed

Default:

```text
speedScale = 1.25
```

Reason:

The standard playback speed is considered too slow for these educational videos.

Allow per-video or per-slide override only when justified.

Recommended bounds:

```text
0.9–1.5
```

with default 1.25.

The Video Auditor SHOULD flag unusual values.

---

# 40. Aivis Support

Aivis remains an alternative backend.

Example:

```yaml
tts:
  backend: aivis
```

The canonical video source MUST NOT depend on VOICEVOX-specific syntax.

TTS adaptation happens after `spoken_script` generation.

---

# 41. Video Source Data Model

Recommended canonical source:

```yaml
unit: basis-definition

tts:
  backend: voicevox

slides:
  - id: 1

    script: |
      今回は、基底とは何かを考えます。

    spoken_script: |
      こんかいは、きていとはなにかをかんがえます。

    note_top: 基底とは何か

    note_bottom: |
      基底は、ベクトル空間を表現するための最小限の「材料」と考えると理解しやすくなります。
```

---

# 42. BiimSlideMaker Compilation Adapter

Because upstream BiimSlideMaker may assume a single `script` field for both subtitles and TTS, Open Learn MUST provide an adapter layer.

The adapter is responsible for generating the files BiimSlideMaker needs WITHOUT losing the canonical subtitle script.

Conceptual flow:

```text
Open Learn canonical video.yaml
  ├─ script           ← subtitle/display
  ├─ spoken_script    ← TTS
  ├─ note_top
  └─ note_bottom
        │
        ↓
Open Learn Biim adapter
        │
        ├─ subtitle/render data from script
        ├─ TTS input from spoken_script
        └─ Biim-compatible intermediate files
```

If upstream BiimSlideMaker currently couples subtitles and TTS through the same `script` field, the integration MUST solve this with:

- a wrapper
- a preprocessing stage
- a minimal local patch applied at setup/build time
- or a clean adapter interface

Do NOT degrade subtitles to phonetic kana simply to satisfy upstream TTS behavior.

---

# 43. Biim Intermediate Files

Generated compatibility/intermediate files MUST be placed under ignored generated directories, for example:

```text
domains/linear-algebra/video/generated/biim/
```

These generated compatibility files are not the canonical authoring source.

---

# 44. Marp Source Protocol

For every video:

```text
slides.md
```

MUST be valid Marp Markdown.

First slide:

```html
<!-- class: title -->
```

After title slide, explicitly reset to default when needed:

```html
<!-- class: -->
```

Highlight slide:

```html
<!-- class: highlight -->
```

Following normal slide MUST reset:

```html
<!-- class: -->
```

---

# 45. Slide Density Protocol

Mandatory:

- Prefer one teaching message per slide.
- Aim for no more than approximately 3–5 lines of main visible content.
- Use more slides rather than shrinking fonts or cramming content.
- Put supplementary explanation into `note_bottom`.
- Put the concise key point into `note_top`.
- Narration may contain more detail than the visible slide.

The Video Auditor MUST check this.

---

# 46. No Fenced Code Blocks in Video Slides

Fenced Markdown code blocks are prohibited in generated Marp slides unless the integration is explicitly redesigned and tested.

Reason:

BiimSlideMaker's documented prompt warns that code blocks can break layout.

Inline code is allowed.

---

# 47. `note_top` Protocol

`note_top` is concise visible summary text.

It SHOULD:

- summarize the slide
- contain important terminology
- remain readable at a glance

It MAY contain:

- kanji
- English
- symbols
- standard mathematical expressions

It MUST NOT be converted to TTS-oriented kana.

---

# 48. `note_bottom` Protocol

`note_bottom` is supplementary visible explanation.

It MAY:

- expand on the slide
- clarify terminology
- show concise supporting explanation
- carry information omitted from the slide to preserve low density

It MAY contain:

- normal Japanese
- kanji
- English
- mathematical notation

It MUST NOT be pronunciation-normalized.

---

# 49. `script` Protocol

`script` is the canonical narration/subtitle text.

It MUST:

- be natural written Japanese
- be suitable as subtitles
- use accurate technical terminology
- preserve standard orthography
- correspond to the slide content

It MAY use difficult kanji or English terms if that is appropriate for subtitles.

---

# 50. `spoken_script` Protocol

`spoken_script` exists only to improve TTS pronunciation.

It MUST:

- preserve meaning
- be pronunciation-optimized
- remain semantically aligned with `script`
- use kana/phonetic readings when useful
- be passed to VOICEVOX/Aivis

It MUST NOT be used as the displayed subtitle source.

---

# 51. Subtitle Source

Subtitles MUST be produced from:

```text
script
```

not:

```text
spoken_script
```

This is non-negotiable.

---

# 52. Video Narrative Design

Videos MUST NOT be article-reading videos.

Preferred pattern:

```text
Hook
↓
Question
↓
Visual intuition
↓
Formal idea
↓
Worked example
↓
Recap
↓
HTML / PDF pointer
```

---

# 53. Video Length

Default:

```text
10–15 minutes
```

Learning Unit boundaries SHOULD align with this.

Allow exceptions when justified.

---

# 54. Slide Design

Rules:

- one principal idea per slide
- large math
- minimal text
- visuals where useful
- strong separation between slide text and spoken explanation
- more slides rather than dense slides
- highlight slides used selectively
- title class only for title/introduction slide

---

# 55. Video Working Directory

Recommended:

```text
domains/linear-algebra/video/
├─ units/
│  └─ basis-definition/
│     ├─ video.yaml
│     ├─ slides.md
│     └─ youtube.yaml
│
├─ generated/
│  ├─ biim/
│  ├─ audio/
│  ├─ slides/
│  └─ video/
│
└─ templates/
```

`video.yaml` may contain the canonical `script` and `spoken_script`.

Separate `narration.yaml` is optional if it better matches implementation.

---

# 56. Generated Media Policy

Generated media MUST NOT be Git-tracked.

Do not commit:

- WAV
- MP3
- synthesized audio
- rendered slide images
- intermediate image frames
- MP4
- MOV
- MKV
- ffmpeg temporary files
- generated Biim compatibility YAML
- generated TTS input artifacts

---

# 57. `.gitignore`

At minimum:

```gitignore
# Local cloned video tool
.tools/BiimSlideMaker/

# Open Learn generated video artifacts
domains/*/video/generated/

# Open Learn generated PDF artifacts
domains/*/pdf/generated/

# Common generated media
*.wav
*.mp3
*.mp4
*.mov
*.mkv
```

Prefer scoped rules if global rules interfere with fixtures.

---

# 58. Git-Tracked Video Assets

Track:

- canonical `video.yaml`
- `slides.md`
- source visual references
- TTS config
- pronunciation dictionary
- YouTube metadata
- video publication status
- transcript source where useful
- chapter metadata
- build configuration

Principle:

```text
Git tracks reproducible source.
Git does not track heavy generated media.
```

---

# 59. YouTube Publication Metadata

After the user uploads the generated video manually, the repository must support registering the public URL.

Example:

```yaml
platform: youtube
status: published

video_id: abc123
url: https://youtube.com/watch?v=abc123

published_at: 2026-09-01

language: ja
duration_seconds: 742
```

---

# 60. Video Publication Status

Allowed states:

```text
not_planned
planned
scripted
generated
uploaded
published
deprecated
```

---

# 61. YouTube Is Not Required for Build

HTML/PDF builds MUST work even if YouTube metadata is absent.

HTML may display:

```text
動画版：準備中
```

---

# 62. HTML Video Embedding

If YouTube metadata status is `published`, the Unit page SHOULD offer:

```text
動画で学ぶ
```

with embed or link.

---

# 63. PDF-to-Video Linking

PDF MAY include:

- Unit HTML URL
- YouTube URL
- QR code

This is optional in v1.9.

---

# 64. Video Skills

Add or revise:

```text
openlearn-video-adapter
openlearn-video-script-writer
openlearn-video-slide-designer
openlearn-tts-script-normalizer
openlearn-video-auditor
```

---

# 65. Video Script Writer Responsibilities

The writer MUST:

1. Read the Learning Unit.
2. Select what belongs in a 10–15 minute explanation.
3. Create a coherent narration.
4. Create slide-level `script`.
5. Keep subtitles readable.
6. Avoid pronunciation-oriented kana in canonical `script`.
7. Hand off to `tts-script-normalizer`.

---

# 66. TTS Script Normalizer Responsibilities

The normalizer MUST:

1. Read `script`.
2. Read pronunciation dictionary.
3. Generate `spoken_script`.
4. Preserve semantic correspondence.
5. Normalize difficult readings.
6. Normalize English terms.
7. Normalize abbreviations.
8. Normalize formula/symbol reading when required.
9. Never modify `script`.

---

# 67. Video Slide Designer Responsibilities

The slide designer MUST enforce BiimSlideMaker prompt rules:

- Marp format
- title class on first slide
- selective highlight class
- explicit class reset
- low information density
- 3–5 line guideline
- no fenced code blocks
- use more slides when needed
- `note_top` for concise summary
- `note_bottom` for supplemental explanation

---

# 68. Video Auditor Responsibilities

The Video Auditor MUST review:

## Biim protocol

- first slide uses title class
- highlight resets are correct
- code blocks absent
- slide density acceptable
- note fields correctly used

## Narration

- script is readable as subtitles
- spoken_script is TTS-oriented
- script/spoken_script meanings match
- no accidental phonetic subtitles

## TTS

- VOICEVOX default configured
- ずんだもん / ノーマル resolved
- speed approximately 1.25 unless overridden
- difficult terms normalized
- formula readings checked

## Pedagogy

- 10–15 min scope
- one central Unit objective
- logical progression
- important example
- no unexplained notation
- no mathematical error

---

# 69. VOICEVOX Adapter

Implement an adapter that:

1. Connects to the configured VOICEVOX engine endpoint.
2. Resolves `ずんだもん` + `ノーマル`.
3. Creates audio query.
4. Sets speed scale to 1.25 by default.
5. Synthesizes `spoken_script`.
6. Writes generated audio only under ignored generated paths.
7. Fails with an actionable error if engine is unavailable.

---

# 70. Aivis Adapter

Aivis support SHOULD remain available.

It consumes the same `spoken_script`.

The canonical authoring source remains backend-independent.

---

# 71. Video Build Flow

Required logical pipeline:

```text
Learning Unit
↓
Video Script Writer
↓
canonical video.yaml
  ├─ script
  ├─ note_top
  └─ note_bottom
↓
TTS Script Normalizer
↓
spoken_script
↓
Video Slide Designer
↓
slides.md
↓
Biim Adapter
↓
Biim-compatible generated artifacts
↓
VOICEVOX or Aivis
↓
audio
↓
Marp render
↓
ffmpeg composition
↓
MP4
```

---

# 72. Video Build Commands

Recommended:

```bash
npm run video:setup
npm run video:prepare -- linear-algebra basis-definition
npm run video:build -- linear-algebra basis-definition
npm run video:audit -- linear-algebra basis-definition
```

`video:setup` should clone/check BiimSlideMaker.

Actual naming may follow existing project conventions.

---

# 73. CI Policy for Video

CI MUST NOT require local TTS engines or full MP4 rendering.

CI SHOULD validate:

- video source schema
- required fields
- Biim authoring constraints
- script/spoken_script existence where required
- slide references
- pronunciation dictionary format
- TTS config schema
- YouTube metadata schema
- generated directories ignored

Full rendering remains local/manual.

---

# 74. Single Source Principle Across Formats

Do NOT separately author three independent lessons.

Source:

```text
Learning Unit
+ Evidence
+ Visuals
+ Exercises
```

Adapters:

```text
HTML Renderer
PDF Adapter
Video Adapter
```

Format-specific adaptation is allowed and expected.

---

# 75. Format Roles

## HTML

Complete learning experience.

## PDF

Printable/offline structured material.

## Video

10–15 minute visual explanation.

---

# 76. Course-Level Quality Audit

Add:

```text
openlearn-course-auditor
```

It audits:

- major topic coverage
- module ordering
- prerequisite correctness
- basis-centric bias
- terminology consistency
- notation consistency
- exercise progression
- remediation
- HTML/PDF/video coverage

---

# 77. Notation Policy

Create:

```text
domains/linear-algebra/config/notation.yaml
```

Example:

```yaml
vector:
  style: bold

matrix:
  style: uppercase

inner_product:
  notation: angle_brackets

transpose:
  notation: superscript_T
```

---

# 78. Knowledge Graph Edge Types

Support at least:

```text
prerequisite
related
generalizes
specializes
used_in
equivalent_view
```

Do not overcomplicate the taxonomy without need.

---

# 79. Initial Fully Authored Course Slice

At minimum:

```text
linear-combination
→ span
→ linear-independence
→ basis
→ dimension
→ coordinates
```

Prefer also:

```text
vector
matrix-introduction
```

---

# 80. Initial Slice Requirements

Each Course Ready Unit should have:

- HTML
- PDF source/build support
- video source
- script
- spoken_script or normalizer output path
- detailed exercises
- step-by-step solutions
- evidence
- visuals
- semantic audits

---

# 81. Initial Video Requirement

At least 2–3 Learning Units MUST have:

- valid `video.yaml`
- valid `slides.md`
- `script`
- `spoken_script`
- VOICEVOX config
- local BiimSlideMaker-compatible generation flow

Actual YouTube upload is not required.

Generated media remains ignored.

---

# 82. Initial PDF Requirement

At least:

- one Unit PDF builds
- one Module PDF builds

Prefer the vector spaces Module if feasible.

---

# 83. Visual Strategy

Use:

```text
Exact mathematical figure
→ SVG / TikZ / PGFPlots / programmatic

Conceptual infographic
→ image generation
```

Do not enforce SVG-only diagrams.

Do not use image generation for exact mathematical geometry.

---

# 84. Image Assets

Generated image assets may be Git-tracked when they are deliberate published educational assets and appropriately optimized.

Generated VIDEO/AUDIO media remains untracked.

Optimize web images:

- WebP where appropriate
- sensible dimensions
- lazy loading
- no unnecessary source originals in published output

---

# 85. Course Publication Status

Track completion per Unit and format.

Example states:

```text
planned
researched
authored
audited
html_published
pdf_published
video_scripted
video_generated
video_published
```

---

# 86. Content Status Dashboard

Generate or maintain:

```text
domains/linear-algebra/docs/content-status.md
```

Recommended columns:

```text
Unit
Module
HTML
PDF
Video Source
YouTube
Audit
```

---

# 87. Course Gate

Course status may remain `experimental` while incomplete.

A complete course should require:

```yaml
curriculum_review: pass
course_audit: pass
required_modules_present: true
terminology_consistency: pass
notation_consistency: pass
html_required_units: 100%
pdf_required_units: 100%
```

Video publication MAY be incomplete during early versions.

---

# 88. Skills to Add/Revise

Minimum v1.9 skill set additions:

```text
openlearn-curriculum-researcher
openlearn-course-architect
openlearn-module-architect
openlearn-unit-architect
openlearn-exercise-solution-writer
openlearn-pdf-adapter
openlearn-video-adapter
openlearn-video-script-writer
openlearn-video-slide-designer
openlearn-tts-script-normalizer
openlearn-video-auditor
openlearn-course-auditor
```

Existing semantic auditors remain.

---

# 89. Existing Semantic Audits Continue

For each Learning Unit:

```text
Math Audit
Evidence Audit
Pedagogy Audit
Explanation Audit
Visual Audit
Completeness Audit
```

Add:

```text
PDF Audit
Video Audit
```

where applicable.

---

# 90. PDF Auditor

Check:

- Pandoc succeeds
- LuaLaTeX succeeds
- Japanese rendering
- equations fit
- figures fit
- page breaks
- monochrome readability
- exercise solution alignment
- source/evidence readability

---

# 91. Anti-Patterns

Forbidden:

1. Re-centering the course around basis.
2. Using Knowledge Graph traversal as Course order.
3. Thin Unit explosion.
4. Monolithic oversized Units.
5. Triple-authoring HTML/PDF/video.
6. Committing generated MP4/audio.
7. Using `spoken_script` as subtitle text.
8. Overwriting `script` with kana for TTS.
9. Skipping BiimSlideMaker prompt rules.
10. Dense slides with tiny text.
11. Fenced code blocks in Marp video slides.
12. Forgetting `<!-- class: -->` after highlight slides.
13. Using note_top/note_bottom as TTS pronunciation text.
14. Using image generation for exact vector geometry.
15. Omitting exercise reasoning.
16. Designing curriculum from LLM memory only.
17. Making video a spoken copy of the HTML article.
18. Hardcoding a fragile numeric VOICEVOX speaker ID without name/style resolution.

---

# 92. Migration from Current v1.8

Preserve existing content.

Map:

```text
Concept
→ Knowledge Layer

Lesson
→ candidate Learning Unit source

Curriculum
→ Course / Module architecture

Exercises
→ Unit / Module / Cumulative layers

Visuals
→ Unit placement
```

Document:

```text
domains/linear-algebra/docs/v1.9-migration.md
```

---

# 93. Implementation Order

Codex SHOULD implement in this order:

1. Inspect current repository.
2. Inspect current `BiimSlideMaker` repository.
3. Read `BiimSlideMaker/prompt.txt`.
4. Record video integration design.
5. Inspect BiimSlideMaker license before direct reuse.
6. Create clone/setup mechanism under `.tools/BiimSlideMaker`.
7. Update `.gitignore`.
8. Create `docs/v1.9-design.md`.
9. Run curriculum evidence review.
10. Build full linear algebra topic inventory.
11. Create Course schema.
12. Create Module schema.
13. Create Learning Unit schema.
14. Create TTS config schema.
15. Create video source/publication schemas.
16. Create Course manifest.
17. Define Modules 0–7.
18. Define approximately 45–70 Learning Units.
19. Separate/revise Knowledge Graph.
20. Create migration map from current basis/Concept data.
21. Create initial Course Slice.
22. Create notation policy.
23. Create pronunciation dictionary.
24. Add curriculum researcher Skill.
25. Add Course architect Skill.
26. Add Module architect Skill.
27. Add Unit architect Skill.
28. Add exercise solution writer Skill.
29. Add PDF adapter Skill.
30. Implement Pandoc + LuaLaTeX pipeline.
31. Implement Unit PDF.
32. Implement Module PDF.
33. Add video adapter Skill.
34. Add video script writer Skill.
35. Add TTS script normalizer Skill.
36. Add video slide designer Skill.
37. Add video auditor Skill.
38. Implement VOICEVOX adapter.
39. Configure ずんだもん / ノーマル / speed 1.25.
40. Keep Aivis adapter available.
41. Implement Biim compatibility adapter.
42. Implement local video build commands.
43. Add YouTube metadata registration support.
44. Update HTML Course/Module/Unit renderers.
45. Add prerequisite remediation links.
46. Author Initial Slice.
47. Write detailed exercises/solutions.
48. Add exact diagrams and conceptual infographics.
49. Run Unit semantic audits.
50. Run PDF audits.
51. Run video source audits.
52. Run Course audit.
53. Generate content status dashboard.
54. Add tests/fixtures.
55. Update README/docs.
56. Final regression/build.

---

# 94. Acceptance Criteria — Curriculum

AC1. Evidence-based curriculum review exists.

AC2. Modules 0–7 exist.

AC3. Approximately 45–70 Learning Units are defined.

AC4. Course is not basis-centric.

AC5. Major foundation-through-application topics are included.

---

# 95. Acceptance Criteria — Knowledge vs Course

AC6. Knowledge Graph and Course sequence are separate.

AC7. Course / Module / Learning Unit schemas exist.

AC8. Concept and Learning Unit are separate entities.

AC9. Concept page and teaching Unit page have different responsibilities.

---

# 96. Acceptance Criteria — HTML

AC10. Course page exists.

AC11. Module pages exist.

AC12. Unit pages exist.

AC13. Previous/Next navigation exists.

AC14. Prerequisite remediation links exist.

AC15. Evidence and source views exist.

---

# 97. Acceptance Criteria — PDF

AC16. Pandoc/LaTeX pipeline exists.

AC17. LuaLaTeX Japanese PDF builds.

AC18. Unit PDF builds.

AC19. Module PDF builds.

AC20. PDF is monochrome-readable.

AC21. Mathematics and figures render correctly.

---

# 98. Acceptance Criteria — BiimSlideMaker Integration

AC22. BiimSlideMaker clone/setup mechanism exists.

AC23. `.tools/BiimSlideMaker/` is ignored.

AC24. Upstream prompt rules are documented in Open Learn video protocol.

AC25. First slide title class is enforced.

AC26. Highlight reset is enforced.

AC27. Slide 3–5 line density rule is audited.

AC28. Fenced code blocks are rejected.

AC29. `script`, `note_top`, `note_bottom` roles match BiimSlideMaker protocol.

---

# 99. Acceptance Criteria — Subtitle/TTS Separation

AC30. Canonical `script` exists.

AC31. TTS-oriented `spoken_script` exists or is generated inspectably.

AC32. Subtitles use `script`.

AC33. TTS uses `spoken_script`.

AC34. `script` is never replaced by kana solely for TTS.

AC35. note_top/note_bottom remain normal display text.

AC36. script/spoken_script semantic consistency is audited.

---

# 100. Acceptance Criteria — VOICEVOX

AC37. VOICEVOX adapter exists.

AC38. Default speaker is ずんだもん.

AC39. Default style is ノーマル.

AC40. Default speed scale is approximately 1.25.

AC41. Speaker/style resolution does not rely solely on fragile numeric ID.

AC42. Aivis remains an optional backend.

---

# 101. Acceptance Criteria — Generated Media

AC43. Generated audio is ignored.

AC44. Generated MP4 is ignored.

AC45. Generated slide renders are ignored.

AC46. Canonical video source remains tracked.

AC47. YouTube metadata remains tracked.

AC48. Missing YouTube URL does not break build.

---

# 102. Acceptance Criteria — Video Pilot

AC49. At least 2–3 Learning Units have complete video source.

AC50. Each pilot has Marp slides.

AC51. Each pilot has canonical script.

AC52. Each pilot has TTS-normalized spoken_script.

AC53. Each pilot can reach the local BiimSlideMaker-compatible build pipeline.

---

# 103. Acceptance Criteria — Exercises

AC54. Unit exercise architecture exists.

AC55. Module exercise architecture exists.

AC56. Detailed solution contract is enforced.

AC57. Critical reasoning steps are not omitted.

AC58. Exercise types progress through the Course.

---

# 104. Acceptance Criteria — Course Audit

AC59. Course Auditor exists.

AC60. Topic coverage is audited.

AC61. Terminology consistency is audited.

AC62. Notation consistency is audited.

AC63. Exercise progression is audited.

AC64. Remediation is audited.

AC65. Format coverage is audited.

---

# 105. Synthetic Failure Fixtures

Add tests/fixtures for:

```text
missing-module
basis-centric-course
graph-used-as-course
thin-unit
broken-video-ref
tracked-mp4
bad-youtube-metadata
pdf-overflow
exercise-solution-skip
notation-inconsistency
dense-biim-slide
missing-highlight-reset
fenced-code-slide
tts-script-used-as-subtitle
missing-spoken-script
spoken-script-semantic-drift
wrong-default-tts
invalid-voicevox-speaker-resolution
```

---

# 106. Final Quality Questions

Codex MUST be able to answer YES:

1. Is there a complete linear algebra course map?
2. Is basis no longer the curriculum center?
3. Are Knowledge Graph and Course sequence separate?
4. Are approximately 45–70 meaningful Learning Units defined?
5. Are Units compatible with 10–15 minute video scope?
6. Are Concept pages concise references?
7. Are Unit pages sufficiently explanatory?
8. Are exercise solutions step-by-step?
9. Can HTML/PDF/video derive from shared structured content?
10. Is the PDF printable and monochrome-safe?
11. Does video tooling clone/use BiimSlideMaker as the reference implementation?
12. Are BiimSlideMaker `prompt.txt` rules enforced?
13. Are slides kept low-density?
14. Is `script` preserved as readable subtitle text?
15. Is `spoken_script` separately optimized for TTS?
16. Does VOICEVOX receive spoken_script rather than canonical subtitles?
17. Is ずんだもん / ノーマル the default voice?
18. Is default speed approximately 1.25?
19. Are generated audio/video files excluded from Git?
20. Can the user register YouTube URLs later?
21. Does Aivis remain available as an alternative?
22. Does Course Auditor evaluate whole-course quality?
23. Does the Initial Slice form a coherent learning path?
24. Can the same architecture later be reused for other domains?
25. Is the project now a multi-format Course compiler rather than a collection of Concept notes?

Any major NO means v1.9 is incomplete.

---

# 107. Definition of Done

MVP v1.9 is complete when:

```text
Evidence-Based Curriculum
        ↓
Course
        ↓
Modules
        ↓
Learning Units
        ↓
Structured Educational Source
   ┌────────┼────────────┐
   ↓        ↓            ↓
 HTML      PDF          Video
                       ↓
                BiimSlideMaker
                       ↓
          script / spoken_script
                       ↓
             VOICEVOX or Aivis
                       ↓
                     MP4
                       ↓
                 manual YouTube
                       ↓
               tracked URL metadata
```

is implemented.

The Knowledge Graph remains the mathematical dependency layer.

The Course remains the learner-facing route.

The video protocol MUST preserve a strict distinction:

```text
script
= readable subtitle / canonical narration text

spoken_script
= pronunciation-optimized TTS input
```

The default video voice MUST be:

```text
VOICEVOX
ずんだもん
ノーマル
speedScale ≈ 1.25
```

Generated media MUST remain outside Git.

The user must be able to manually upload finished MP4 files to YouTube and then register the resulting public URL in the repository.

This state defines MVP v1.9 completion.
