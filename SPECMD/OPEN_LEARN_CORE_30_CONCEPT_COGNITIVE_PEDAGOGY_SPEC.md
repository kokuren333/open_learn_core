# Open Learn Core — 30 Core Concepts & Cognitive Pedagogy Refactor
## Codex Implementation Specification

**Status:** Authoritative implementation instruction  
**Target:** Refactor the current Open Learn Core architecture and the Linear Algebra domain  
**Primary objective:** Replace the current “many thin concepts + generic AI-filled lessons” model with a fixed **30 Core Concepts per Domain** model, cognitively adaptive pedagogy, typed cross-domain links, and audits that reject shallow AI-generated content.

---

# 0. Core Product Contract

Open Learn Core MUST adopt this absolute invariant:

> **Every Domain contains exactly 30 learner-facing Core Concepts.**

This is not a recommendation, not a soft limit, and not a default.

Validation MUST behave as follows:

```text
29 Core Concepts → FAIL
30 Core Concepts → PASS
31 Core Concepts → FAIL
```

There is no exception path.

If a subject cannot be coherently represented with exactly 30 Core Concepts, redesign the Domain boundary.

The architecture MUST be designed backward from this fixed budget:

```text
Raw domain knowledge
        ↓
Concept Compression
        ↓
EXACTLY 30 Core Concepts
        ↓
Cognitive Profile
        ↓
Learning Contract
        ↓
Pedagogical Plan
        ↓
Rich Learning Experience
        ↓
Semantic / Cognitive / Math Audit
        ↓
Web / PDF / Video
```

---

# 1. What This Refactor Is Solving

The current Linear Algebra implementation has two major defects:

1. too many learner-facing concepts, making the knowledge map difficult to understand;
2. many structurally valid Learning Units contain thin AI-generated prose that resembles filled templates rather than high-quality teaching material.

This refactor MUST solve both problems together.

Do NOT simply reduce file count.

Do NOT simply increase prose length.

Do NOT bulk-expand the current thin Units.

Instead:

- compress the Domain into exactly 30 major learner-facing mental models;
- move lower-level knowledge into internal structures;
- classify each Core Concept by cognitive nature;
- generate pedagogical structure from that cognitive nature;
- define a Learning Contract before prose is written;
- implement semantic audits that reject template-filling and shallow AI prose;
- use `Basis` as the first Gold Concept and quality reference.

---

# 2. Definition of Domain

An Open Learn Core Domain is:

> A coherent body of knowledge that can be represented to a learner as exactly 30 major mental models while preserving the essential explanatory structure of the subject.

Valid Domain granularity includes examples such as:

```text
Linear Algebra
Calculus
Probability
Statistics
Classical Mechanics
Electromagnetism
Thermodynamics
Organic Chemistry
Cell Biology
Algorithms
Operating Systems
```

Overly broad domains include:

```text
Mathematics
Physics
Biology
Computer Science
Medicine
```

If a subject is too broad for 30 Concepts, split it into multiple Domains.

---

# 3. Definition of Core Concept

A Core Concept is a learner-facing major mental model.

A Core Concept MUST:

- represent one coherent idea;
- have substantial explanatory value;
- support meaningful transfer;
- justify being remembered as a named part of the Domain;
- be useful for navigating the subject;
- be explainable through one central mental model.

A Core Concept MUST NOT be:

- a trivial vocabulary item;
- a single mechanical step;
- a minor theorem with no broad conceptual role;
- a random textbook section title;
- a giant bag of unrelated topics created only to satisfy the 30 limit.

Every Core Concept MUST have:

```yaml
central_mental_model: >
  A one- or two-sentence explanation of the single major idea represented
  by this concept.
```

Audit MUST reject a concept if the central mental model is merely a list or conjunction of unrelated major ideas.

INVALID:

```text
Matrices, Determinants, Eigenvalues, and Diagonalization
```

VALID:

```text
Basis

A basis is a sufficient but non-redundant set of directions that gives every
vector in a space a unique coordinate description.
```

---

# 4. Knowledge Hierarchy

The new hierarchy MUST be:

```text
Domain
└── exactly 30 Core Concepts
    ├── Facets
    ├── Procedures
    ├── Properties
    ├── Representations
    ├── Misconceptions
    ├── Examples
    ├── Applications
    └── External Relations
```

Only Core Concepts count toward 30.

Everything else remains machine-readable but does not become a learner-facing top-level concept unless it independently satisfies the Core Concept definition.

---

# 5. Facets

A Facet is a necessary internal component of understanding a Core Concept.

Example:

```text
Basis
├── spanning
├── linear independence
├── uniqueness of coordinates
└── standard vs non-standard basis
```

Facets do not count toward 30.

---

# 6. Procedures

Procedures are methods or algorithms associated with a Core Concept.

Examples:

```text
Linear Systems
└── Gaussian elimination

Orthogonality
└── Gram-Schmidt

Basis
└── Basis test
```

A Procedure does not automatically deserve Core Concept status.

Default rule:

> A procedure belongs inside the concept that gives the procedure meaning.

---

# 7. Properties

Properties represent important truths associated with a Concept.

Example:

```text
Basis
├── must span the space
├── must be linearly independent
├── gives unique coordinates
└── every basis of a finite-dimensional space has the same size
```

Properties do not count toward 30.

---

# 8. Representations

Concepts MAY have multiple representations.

Examples for Basis:

```text
geometric
algebraic
coordinate
matrix-based
```

Representations MUST be explicitly modeled because learning difficulty often comes from failure to translate between them.

---

# 9. Exactly-30 Validation

Add a Domain validation rule:

```text
domain.core_concepts.length === 30
```

This MUST be release-blocking.

Tests MUST include:

```text
29 concepts → fail
30 concepts → pass
31 concepts → fail
```

No override flag is allowed.

---

# 10. Concept Compression

Before authoring final content, run a Concept Compression phase for the current Linear Algebra Domain.

For every existing concept classify it as:

```text
A. Keep as Core Concept
B. Merge into another Core Concept as Facet
C. Move into Procedure
D. Move into Property
E. Move into Representation
F. Move into Application
G. Move into Cross-Domain Relation
H. Remove as duplicate / unnecessary
```

Do not silently delete concepts.

Create a migration record.

---

# 11. Linear Algebra Must End With Exactly 30 Core Concepts

The learner-facing Linear Algebra map MUST contain exactly 30 nodes.

A reasonable starting proposal is:

```text
01 Vector
02 Linear Combination
03 Linear System
04 Matrix
05 Elimination
06 Vector Space
07 Subspace
08 Linear Independence
09 Basis
10 Dimension
11 Linear Transformation
12 Coordinates & Change of Basis
13 Rank & Nullity
14 Determinant
15 Eigenvalue & Eigenvector
16 Diagonalization
17 Inner Product
18 Orthogonality
19 Projection
20 Least Squares
21 Symmetric Matrix
22 Quadratic Form
23 Positive Definiteness
24 Singular Value Decomposition
25 Low-Rank Approximation
26 Principal Component Analysis
27 Matrix Factorization
28 Matrix Dynamics
29 Graph & Network Representation
30 Numerical Stability / Computational View
```

This list is a starting hypothesis, not a command to accept it blindly.

Codex MUST inspect existing curriculum evidence and refine the final list.

The final count, however, MUST remain exactly 30.

---

# 12. Compression Criteria

Each candidate Core Concept SHOULD be evaluated on:

```text
explanatory_power
dependency_centrality
transfer_value
learner_memorability
distinct_mental_model
cross_topic_reuse
```

Concept Compression should optimize conceptually for:

```text
maximum explanatory coverage
subject to exactly 30 learner-facing Core Concepts
```

Do not optimize merely for resemblance to textbook chapter headings.

---

# 13. Cross-Domain Links

The architecture MUST support links from a Concept in one Domain to Concepts in another Domain.

These links do NOT increase the active Domain's 30-concept count.

Example:

```yaml
external_relations:
  - domain: statistics
    concept: covariance
    relation: requires

  - domain: differential-equations
    concept: linear-dynamical-systems
    relation: applied_in
```

Use a controlled vocabulary.

Initial relation types:

```text
requires
extends
applied_in
analogous_to
special_case_of
generalized_by
```

A generic fallback relation MAY exist but MUST NOT be the default.

---

# 14. Future Global Knowledge Model

The intended global architecture is:

```text
Domain A: exactly 30 concepts
          ↕
typed cross-domain links
          ↕
Domain B: exactly 30 concepts
          ↕
Domain C: exactly 30 concepts
```

Each Domain remains understandable as a human-sized map.

Cross-domain links connect maps without turning the active map into a giant ontology.

---

# 15. Cognitive Types

Every Core Concept MUST have one or more cognitive types.

At minimum support:

```text
concrete_object
structural_definition
abstraction
procedure
transformation_process
invariant_quantity
relationship_theorem
representation
optimization_approximation
```

Example:

```yaml
concept: basis

cognitive_types:
  - structural_definition
  - abstraction
  - representation
```

---

# 16. Cognitive Profile

Every Core Concept MUST have a machine-readable Cognitive Profile.

Use a documented bounded scale such as 1–5.

Example:

```yaml
cognitive_profile:
  abstraction: 5
  procedural: 2
  visual: 4
  prerequisite_load: 4
  misconception_risk: 5
  representation_switching: 4
  symbolic_density: 3
```

These scores MUST influence pedagogical planning.

They are not decorative metadata.

---

# 17. Pedagogical Pattern Library

Implement a reusable Pedagogical Pattern Library.

Every Concept MUST NOT use the same generic template.

At minimum implement the following.

## 17.1 Concrete Object

```text
encounter
→ concrete examples
→ manipulation
→ properties
→ notation
→ formalization
→ transfer
```

## 17.2 Structural Definition

```text
problem
→ desired properties
→ positive example
→ failure case A
→ failure case B
→ contrast
→ formal definition
→ classification task
→ implications
```

## 17.3 Abstraction

```text
multiple concrete cases
→ common structure
→ abstraction
→ formal object
→ new example
→ transfer to unfamiliar case
```

## 17.4 Procedure

```text
goal
→ why the method is needed
→ intuition
→ algorithm steps
→ worked example
→ learner attempt
→ error diagnosis
→ second example
→ limits / failure conditions
```

## 17.5 Transformation / Process

```text
input/output
→ observable behavior
→ visual model
→ invariants
→ algebraic representation
→ examples
→ composition / consequences
```

## 17.6 Invariant / Quantity

```text
phenomenon
→ what information is desired
→ quantity
→ computation
→ interpretation
→ invariance/dependence
→ limitations
→ applications
```

## 17.7 Relationship / Theorem

```text
known concepts
→ observed pattern
→ conjecture
→ formal statement
→ hypotheses
→ example
→ interpretation
→ consequences
→ counterexample when assumptions fail
```

## 17.8 Representation

```text
same object
→ representation A
→ representation B
→ conversion
→ what changes
→ what does not change
→ learner translation task
```

## 17.9 Optimization / Approximation

```text
problem that cannot or should not be solved exactly
→ optimization objective
→ geometric intuition
→ formal objective
→ solution mechanism
→ worked example
→ interpretation
→ application
→ limitations
```

---

# 18. Pedagogical Planner

Content generation MUST NOT directly do:

```text
Concept name
→ generate explanation
```

It MUST do:

```text
Concept
→ Cognitive Profile
→ Learning Contract
→ Pedagogical Plan
→ Content
```

The Pedagogical Plan MUST exist as inspectable structured data.

AI may fill the plan, but MUST NOT invent the learning structure ad hoc every time.

---

# 19. Learning Contract

Every Core Concept MUST have a Learning Contract before final content is authored.

Example for Basis:

```yaml
learner_should_be_able_to:
  - explain basis informally
  - explain why spanning is necessary
  - explain why independence is necessary
  - classify simple candidate bases
  - express a vector in a given basis
  - explain uniqueness of coordinates

must_not_leave_with_misconceptions:
  - a basis is unique
  - basis vectors must be orthogonal
  - basis vectors must have norm 1
  - any n vectors in an n-dimensional space form a basis
  - spanning alone is sufficient
  - independence alone is sufficient

required_representations:
  - geometric
  - algebraic
  - coordinate

required_examples:
  - standard basis in R2
  - non-standard basis in R2
  - insufficient independent set
  - redundant spanning set
```

The final content MUST be audited against this contract.

---

# 20. Semantic Learning Elements

Do NOT use character count as the primary definition of quality.

Each Concept MUST define required semantic learning elements.

Example:

```yaml
required_learning_elements:
  motivating_problem:
    min: 1
  intuition:
    min: 1
  formalization:
    min: 1
  positive_examples:
    min: 2
  contrasting_nonexamples:
    min: 2
  worked_examples:
    min: 2
  learner_predictions:
    min: 2
  misconceptions:
    min: 3
  practice:
    basic: 2
    conceptual: 2
    transfer: 1
  synthesis:
    min: 1
```

Exact requirements MAY vary by cognitive type.

---

# 21. Adaptive Content Volume

All Concepts must be substantial, but equal length is NOT required.

Cognitive Profile MUST affect required content depth.

Examples:

```text
high abstraction
→ more concrete examples and non-examples

high procedural
→ more worked examples and practice

high visual
→ diagrams or interactive visualization required

high misconception risk
→ more contrastive examples and diagnostic questions

high representation switching
→ explicit translation between representations

high prerequisite load
→ retrieval and remediation
```

---

# 22. Minimum Quality Floor

Unless a pattern explicitly justifies otherwise, every Concept MUST contain at least:

```text
1 motivating problem/question
1 intuitive explanation
1 formal definition/statement where applicable
2 examples
1 meaningful non-example
1 worked example
1 learner prediction/check
3 misconceptions for difficult concepts
5 practice items across multiple cognitive roles
complete solutions
1 synthesis/summary
```

This is a floor, not a target.

Important Concepts SHOULD exceed it.

---

# 23. 30 Concepts Does Not Mean 30 Short Pages

One Core Concept may contain many pedagogical sections.

Example:

```text
Basis
├── Why do we need a basis?
├── Spanning without redundancy
├── Formal definition
├── Positive and negative examples
├── Basis tests
├── Coordinates
├── Visual model
├── Worked examples
├── Misconceptions
├── Practice
└── Synthesis
```

The fixed product rule is:

```text
30 learner-facing mental models
```

not:

```text
30 tiny documents
```

---

# 24. Gold Concept: Basis

Before expanding the refactor to all 30 Concepts, implement `Basis` as the Gold Concept.

Do NOT bulk-generate the remaining 29 final lessons before Basis passes Gold criteria.

Basis is the reference implementation for:

- cognitive profiling;
- learning contract;
- pedagogical planning;
- visual design;
- examples/non-examples;
- misconceptions;
- exercises;
- semantic audit;
- AI Slop Audit.

---

# 25. Required Basis Learning Flow

The Gold Basis experience SHOULD approximately follow:

```text
1. Ask:
   How many vectors are needed to describe every vector in a plane?

2. Show one vector:
   independent but insufficient to span R².

3. Show three vectors:
   spanning but redundant.

4. Elicit the desired condition:
   enough to generate the space, but with no redundancy.

5. Connect this to:
   span + linear independence.

6. Introduce the formal definition.

7. Standard basis example.

8. Non-standard basis example.

9. Non-example:
   insufficient set.

10. Non-example:
    redundant set.

11. Basis classification activity.

12. Coordinates relative to a basis.

13. Explicitly distinguish:
    vector itself != coordinate representation.

14. Misconception section.

15. Worked example:
    basis test.

16. Worked example:
    coordinates in a non-standard basis.

17. Learner practice.

18. Transfer problem.

19. Synthesis.

20. Link forward to Dimension / Change of Basis.
```

---

# 26. Required Basis Misconceptions

Basis MUST explicitly address:

```text
basis is unique
basis vectors must be orthogonal
basis vectors must have norm 1
any n vectors in n dimensions form a basis
spanning alone is enough
independence alone is enough
standard basis is the only natural basis
```

---

# 27. Basis Visual Requirement

Basis SHOULD include a meaningful R² visualization.

Ideal behavior:

```text
drag b1
drag b2

non-parallel:
→ they can generate the plane

approaching parallel:
→ geometric degeneration becomes visible

parallel:
→ no longer a basis
```

If interactive visualization is not yet practical, use reproducible vector diagrams with source definitions.

Decorative images do not satisfy this requirement.

---

# 28. Basis Gold Acceptance Criteria

Basis becomes `gold` only when:

- Learning Contract is fully satisfied;
- required representations are present and connected;
- examples are correct;
- failure cases are contrasted clearly;
- exercises test more than direct calculation;
- full solutions exist;
- visual support is meaningful;
- Cognitive Pattern Audit passes;
- Semantic Coverage Audit passes;
- AI Slop Audit passes;
- Math Audit passes;
- Pedagogy Audit passes;
- the learner-facing dev page is clearly more useful than the old scaffold.

---

# 29. AI Slop Audit

Implement an explicit audit for shallow generated educational content.

It SHOULD detect:

- explanation that merely restates a definition;
- “important/useful” filler without explanation;
- abstract claims with no concrete grounding;
- worked examples with unexplained jumps;
- examples that add no information;
- exercises that only replace numbers;
- summaries copied from body text;
- identical structures across cognitively different concepts;
- “intuitively” without actual intuitive explanation;
- generic misconception lists;
- repeated wording used to inflate length;
- learning objectives not assessed;
- headings present but pedagogical functions absent.

This audit MUST be separate from schema validation.

---

# 30. Cognitive Pattern Audit

For each Concept:

```text
read Cognitive Profile
→ determine required pattern
→ inspect Pedagogical Plan
→ verify required functions exist
→ verify content actually performs those functions
```

Example:

A `structural_definition` Concept MUST fail if it contains only:

```text
definition
example
exercise
```

without meaningful contrastive failure cases.

---

# 31. Semantic Coverage Audit

Audit the final content against the Learning Contract.

The audit MUST answer:

```text
Did the lesson actually teach every learner_should_be_able_to item?
Did it address every required misconception?
Did it connect all required representations?
Did it include required positive and negative cases?
```

Do NOT pass simply because matching fields exist.

---

# 32. Contrast Audit

Where pedagogically important, require explicit contrast.

Examples:

```text
basis vs non-basis
linear vs nonlinear
independent vs dependent
invertible vs singular
orthogonal vs non-orthogonal
exact solution vs least-squares approximation
```

Lessons containing examples but no informative contrast SHOULD fail or warn according to Concept contract.

---

# 33. Transfer Audit

Exercises MUST include transfer.

Transfer does NOT mean:

```text
same algorithm + different numbers
```

At least one exercise per major Concept SHOULD require one of:

```text
unfamiliar representation
conceptual explanation
new application
method selection
error diagnosis
comparison between cases
```

---

# 34. Prerequisite Audit

Detect use of unexplained Core Concepts before they appear in the canonical learning route.

Cross-domain prerequisites MUST be represented explicitly.

Do NOT silently assume knowledge from another Domain.

---

# 35. Representation Audit

For Concepts with multiple required representations, verify explicit mapping between them.

Basis example:

```text
geometric directions
↔ spanning + independence
↔ coordinate description
```

Three disconnected examples are insufficient.

---

# 36. Concept Compression Audit

At Domain level, audit each of the 30 Concepts.

Ask:

```text
Does it represent a distinct major mental model?
Could it be a Facet of another Concept?
Is it too broad?
Is it too narrow?
Does it have sufficient explanatory power?
Does it justify top-level learner-facing status?
```

The Domain MUST fail if count != 30.

---

# 37. Core Concept Balance Audit

Warn if the Domain is structurally pathological, for example:

```text
all 30 concepts are procedures
all 30 are definitions
all 30 are applications
```

This may be a warning rather than hard failure.

---

# 38. Core Concept vs Learning Unit

Do NOT assume:

```text
1 Core Concept = 1 tiny Learning Unit
```

A Core Concept may require multiple internal sections or learning experiences.

However, the learner-facing navigation MUST preserve the 30-concept product model.

Avoid exposing 50+ top-level Units as if they are equivalent to Core Concepts.

---

# 39. Learning Route

The 30 Concepts MAY be grouped into Modules.

Example:

```text
Module 1 → Concepts 01–05
Module 2 → Concepts 06–10
...
```

All 30 MUST appear exactly once as primary nodes in the canonical route.

Concepts may be revisited.

---

# 40. User-Facing Progress

The data model MUST support progress such as:

```text
Linear Algebra
8 / 30 Concepts
```

Progress MUST count Core Concepts, not Facets, Procedures, or internal lesson sections.

---

# 41. Concept Map

The learner-facing Concept Map MUST:

- show exactly 30 Domain nodes;
- remain visually understandable;
- show meaningful typed internal relations;
- support cross-domain links without increasing active Domain count;
- hide Facets from the top-level map by default.

---

# 42. Cross-Domain Navigation

The data model SHOULD support future UI such as:

```text
Related in Statistics → Covariance
Required from Calculus → Derivative
Used in Differential Equations → Linear Systems
```

Links may initially point to not-yet-published Domains.

The schema MUST support them now.

---

# 43. Schema Changes

Likely new or extended fields:

```text
domain.core_concepts
concept.central_mental_model
concept.facets
concept.procedures
concept.properties
concept.representations
concept.misconceptions
concept.applications
concept.external_relations
concept.cognitive_types
concept.cognitive_profile
concept.learning_contract
concept.pedagogical_plan
concept.editorial_status
```

Avoid duplicating the same semantic information in multiple canonical locations.

---

# 44. Migration

Existing knowledge must not simply disappear.

Create explicit old → new migration mappings.

Example:

```yaml
old_id: gram-schmidt
new_parent_concept: orthogonality
new_role: procedure
new_id: gram-schmidt
```

Preserve stable identifiers where useful.

Record duplicates and removals.

---

# 45. Content Maturity Status

Introduce explicit content maturity.

Recommended values:

```text
scaffold
draft
reviewed
gold
```

Definitions:

```text
scaffold
= structure exists but content may be thin

draft
= substantial authored content exists

reviewed
= required audits and real editorial review passed

gold
= reference-quality exemplar
```

Basis MUST become `gold`.

Do NOT auto-mark the other 29 as reviewed.

---

# 46. Review Semantics

Do NOT write:

```yaml
independent_review: true
```

unless an actually independent review process occurred.

If a model or automated process reviewed content, label it accurately:

```yaml
review_type: automated_semantic_review
```

Do not misrepresent machine self-review as independent review.

---

# 47. Forensic Content Metrics

Generate a report per Core Concept including:

```text
character_count
section_count
example_count
nonexample_count
worked_example_count
misconception_count
practice_count
solution_count
visual_count
representation_count
learning_contract_coverage
pedagogical_pattern_coverage
status
```

Metrics are diagnostic only.

They MUST NOT replace semantic audits.

---

# 48. Required Adversarial Fixtures

Create deliberately invalid fixtures, including:

```text
29-core-concepts
31-core-concepts
giant-merged-concept
tiny-trivial-core-concept
definition-only-basis
basis-without-nonexamples
basis-without-misconceptions
basis-with-generic-ai-filler
basis-with-number-swapped-exercises-only
basis-with-wrong-math
basis-with-unexplained-coordinates
basis-with-missing-representation
invalid-cross-domain-relation-type
cross-domain-link-to-missing-concept
cognitive-profile-with-no-matching-plan
learning-contract-not-covered
```

Each fixture MUST fail the expected audit.

---

# 49. Existing Audit Semantics Must Be Fixed

Do not let:

```yaml
status: pass
issues:
  - none
```

mean “finished educational content” merely because schemas are valid.

Separate at minimum:

```text
structural_validity
editorial_completeness
mathematical_correctness
pedagogical_quality
cognitive_pattern_quality
semantic_coverage
publication_validity
```

A scaffold may pass structural validity while failing editorial completeness.

---

# 50. Dev Integration

The learner-facing `npm run dev` output MUST use canonical current Domain data.

After migration it MUST NOT show stale counts such as:

```text
57 connected concepts
12 connected concepts
MVP v1.9
```

It MUST derive the visible concept count from the exact-30 canonical model.

Add regression tests.

---

# 51. Exact-30 UI Regression Test

Verify:

```text
Linear Algebra landing page shows 30 Core Concepts
Concept Map renders exactly 30 Domain nodes
Facets do not count as Core Concepts
Procedures do not count as Core Concepts
Cross-domain links do not increase the Domain count
```

---

# 52. Required Implementation Order

Codex MUST work in this order unless a small dependency forces adjustment:

```text
Phase 01 Inspect current repository and HEAD
Phase 02 Run current tests and audits
Phase 03 Inventory current Linear Algebra concepts and Units
Phase 04 Produce exactly-30 compression proposal
Phase 05 Produce old → new migration map
Phase 06 Implement exact-30 validation
Phase 07 Implement/refactor Concept schema
Phase 08 Implement cross-domain relation schema
Phase 09 Implement Cognitive Profile
Phase 10 Implement Learning Contract
Phase 11 Implement Pedagogical Pattern Library
Phase 12 Implement Pedagogical Plan representation
Phase 13 Refactor Basis into Gold Concept
Phase 14 Implement AI Slop Audit
Phase 15 Implement Cognitive Pattern Audit
Phase 16 Implement Semantic Coverage Audit
Phase 17 Implement Concept Compression Audit
Phase 18 Add adversarial fixtures
Phase 19 Rebuild learner-facing Concept Map
Phase 20 Verify exactly 30 visible nodes
Phase 21 Only after Basis passes, migrate remaining 29 concepts
Phase 22 Re-run full build/audits
Phase 23 Update README and design documentation
```

---

# 53. First Mandatory Deliverable

Before major content migration, create:

```text
docs/design/linear-algebra-30-concept-compression.md
```

or equivalent.

It MUST include:

1. all current concepts;
2. proposed final 30;
3. old → new mapping;
4. rationale for every merge;
5. rationale for every retained Core Concept;
6. concepts moved to Facets;
7. concepts moved to Procedures;
8. concepts moved to Properties/Representations;
9. concepts moved to Applications;
10. cross-domain candidates;
11. risks and unresolved questions.

Do NOT skip this deliverable.

---

# 54. Second Mandatory Deliverable

Create structured definitions for the final 30 Concepts before bulk prose authoring.

Each must include at minimum:

```text
id
title
central_mental_model
cognitive_types
cognitive_profile
facets
procedures
properties
representations
misconceptions
learning_contract
external_relations
```

Do NOT generate full final prose for all 30 yet.

---

# 55. Third Mandatory Deliverable

Complete `Basis` as the Gold Concept.

The Gold Basis page MUST be inspectable through:

```bash
npm run dev
```

and MUST demonstrate clear superiority over the current scaffold.

---

# 56. Quality Gate Before Scaling

Do NOT migrate all final content until all of these are demonstrated:

```text
Basis = gold
Exact-30 validation works
Concept Map = 30 nodes
Cross-domain schema works
Cognitive Pattern Audit works
Semantic Coverage Audit works
AI Slop Audit works
Adversarial fixtures fail correctly
```

Only then expand the pattern to the remaining 29 Core Concepts.

---

# 57. README Positioning

Update project positioning to reflect the new model.

Suggested wording:

> Open Learn Core organizes every learning domain into exactly 30 core concepts, then builds each concept into a learning experience based on its cognitive structure.

Potential short positioning:

> **Learn any domain through 30 core concepts.**

Do not claim Domains that are not yet implemented.

---

# 58. Documentation Requirements

Document:

```text
Why exactly 30?
What is a Core Concept?
What becomes a Facet?
What becomes a Procedure?
How is a Domain boundary chosen?
How are cognitive types assigned?
How does the Pedagogical Planner work?
How are cross-domain links represented?
How does the system reject shallow AI-generated educational content?
```

---

# 59. AI Role

AI MAY:

- propose Concept Compression;
- draft examples;
- draft explanations;
- propose exercises;
- propose misconceptions;
- propose diagrams.

AI MUST operate inside:

```text
Domain Contract
+
Concept Contract
+
Cognitive Profile
+
Pedagogical Plan
+
Audits
```

AI does not decide that a Concept is complete.

---

# 60. Do Not Hide Architecture in Prompts

The following MUST exist as inspectable structured source:

```text
30-concept list
compression decisions
cognitive profiles
learning contracts
pedagogical plans
cross-domain relations
```

Do NOT make critical design state exist only inside prompts, logs, or model caches.

---

# 61. No Fake Completeness

A Concept is NOT complete if:

- it only restates a definition;
- it lacks meaningful examples;
- it lacks contrast where contrast is necessary;
- exercises are repetitive number substitutions;
- Learning Contract items are uncovered;
- cognitive pattern requirements are unmet;
- misconceptions are ignored;
- representations are disconnected;
- mathematical correctness is unverified.

File existence is not completion.

---

# 62. Priority Order

When trade-offs occur:

```text
1. Learner comprehensibility
2. Exactly-30 mental model
3. Mathematical correctness
4. Conceptual coherence
5. Pedagogical quality
6. Semantic coverage
7. Auditability
8. Reproducibility
9. Maintainability
10. Raw prose volume
```

Do not maximize:

```text
file count
concept count
word count
```

Maximize understanding under the fixed 30-concept interface.

---

# 63. Completion Definition

This refactor is complete when:

> Linear Algebra is represented by exactly 30 learner-facing Core Concepts; every formerly important subtopic is explicitly preserved as a Core Concept, Facet, Procedure, Property, Representation, Application, or typed cross-domain relation; every Core Concept has a Cognitive Profile and Learning Contract; pedagogical structure is determined by cognitive nature; shallow generic AI prose is rejected by dedicated audits; and Basis exists as a Gold reference implementation that is substantially more learnable than the previous scaffold.

---

# 64. Final Instruction to Codex

Do NOT interpret this task as:

> Reduce 57 JSON files to 30 JSON files.

Interpret it as:

> Redesign the knowledge and pedagogy architecture so that an entire Domain is intentionally represented through exactly 30 learner-facing mental models, with all remaining knowledge structured inside or across those models, and each model taught according to its cognitive nature.

The success criterion is:

```text
EXACTLY 30 Core Concepts
+
rich internal concept structure
+
cognitive pedagogical planning
+
typed cross-domain links
+
Gold-quality Basis implementation
+
audits that reject shallow AI-generated lessons
```

That is the new Open Learn Core contract.
