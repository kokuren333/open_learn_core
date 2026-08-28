# Open Learn Core — Next Implementation Plan
## From Concept Specification to Actual Learning Material

Status: Proposed next implementation phase  
Priority: P0  
Target: `open_learn_core`

---

# 1. Problem Statement

The current system has improved substantially in curriculum structure, concept compression, cognitive profiling, pedagogical planning, and auditability.

However, the learner-facing output still has a fundamental problem:

> It describes what should be learned, but does not actually teach it.

The current `BASIS` page is the clearest example.

It contains definitions, learning goals, examples, misconceptions, and pedagogical labels, but the page behaves more like:

- a curriculum document,
- a concept specification,
- an instructional design outline,
- or an AI-generated summary,

than an actual learning resource.

The next implementation phase MUST therefore separate:

1. what a concept is,
2. what must be learned,
3. how learning should develop,
4. what the learner actually sees and does,
5. whether learning actually occurred.

The project MUST stop treating “content generation” as equivalent to “lesson generation”.

---

# 2. Core Architectural Change

Introduce a new explicit layer:

```text
Domain Model
    ↓
30 Core Concepts
    ↓
Concept Specification
    ↓
Cognitive Analysis
    ↓
Pedagogical Design
    ↓
Learning Experience
    ↓
Assessment
    ↓
Learning Audit
```

The learner-facing page MUST be generated primarily from the `Learning Experience` layer, not directly from the Concept Specification.

---

# 3. Separate the Five Layers

## 3.1 Domain Model

Purpose:

- define the domain boundary,
- define the exact 30 Core Concepts,
- preserve concept relationships,
- preserve external links to other domains.

This layer is NOT learner-facing instructional content.

---

## 3.2 Concept Specification

Purpose:

Define what knowledge and capabilities belong to the concept.

Example fields:

```yaml
concept_specification:
  id: basis
  name: Basis
  essential_idea:
  prerequisites:
  learning_outcomes:
  key_properties:
  procedures:
  representations:
  misconceptions:
  applications:
  related_concepts:
```

This layer answers:

> What must a learner eventually understand or be able to do?

It MUST NOT be treated as a page outline.

---

## 3.3 Cognitive Analysis

Purpose:

Describe why the concept is cognitively difficult and what forms of support are required.

Example:

```yaml
cognitive_analysis:
  primary_type: structural_definition

  dimensions:
    abstraction:
      score: 4
      rationale: >
        Basis requires coordinating span and linear independence as
        two simultaneous constraints rather than memorizing one property.

    prerequisite_load:
      score: 4
      rationale: >
        The learner must already distinguish span, linear combination,
        independence, and vector representation.

    misconception_risk:
      score: 5
      rationale: >
        Learners commonly confuse spanning sets, independent sets,
        and bases.

    representation_switching:
      score: 4
      rationale: >
        Understanding requires switching between geometric vectors,
        algebraic equations, and coordinate representations.
```

Every numeric cognitive score MUST have a rationale.

A bare score MUST fail validation.

---

# 4. Introduce Learning Experience as a First-Class Object

The most important implementation change is the addition of a structured `LearningExperience`.

The system MUST NOT generate a learner-facing page by expanding headings such as:

- Definition
- Example
- Misconception
- Summary

Instead, it MUST generate a sequence of learner interactions intended to cause specific changes in understanding.

Example schema:

```yaml
learning_experience:
  concept_id: basis

  sequence:
    - type: hook
    - type: concrete_problem
    - type: learner_prediction
    - type: guided_exploration
    - type: failure_case
    - type: contrast
    - type: concept_emergence
    - type: formalization
    - type: worked_example
    - type: guided_practice
    - type: misconception_challenge
    - type: worked_example
    - type: independent_practice
    - type: transfer
    - type: synthesis
```

The sequence MUST be concept-specific.

A fixed universal order is NOT required.

The pedagogical planner SHOULD select, add, remove, or reorder learning blocks according to the cognitive profile.

---

# 5. Learning Blocks Must Define Learner Effects

Every learning block MUST specify its intended cognitive effect.

Example:

```yaml
- type: failure_case

  purpose:
    Make the learner notice that spanning alone is insufficient
    for a set to be a basis.

  learner_state_before:
    The learner may believe that any spanning set is a basis.

  activity:
    Present a redundant spanning set and ask which vector can be removed.

  required_elements:
    - explicit concrete vectors
    - learner-facing question
    - visible reasoning
    - redundancy demonstration
    - explanation of why expressive power is unchanged

  learner_state_after:
    The learner distinguishes "spans the space" from
    "is a minimal/non-redundant representation".
```

Blocks MUST describe an intended transition in learner understanding.

---

# 6. Ban Specification-Like Learner Pages

The learner-facing renderer MUST reject or flag pages dominated by:

- definitions,
- lists of properties,
- learning objectives,
- generic summaries,
- glossary-style prose,
- “important because...” statements,
- one-sentence examples,
- generic misconception descriptions.

The following structure MUST NOT be sufficient:

```text
Definition
Properties
Example
Misconception
Exercise
Summary
```

A page following that structure MAY exist only if the actual instructional interactions within each section are sufficiently rich.

---

# 7. Strengthen the Meaning of “Example”

The current system risks treating any concrete instance as an educational example.

This MUST be changed.

## 7.1 Example

An `example` may simply instantiate a concept.

Example:

```text
(1,0) and (0,1) form a basis of R².
```

This is NOT a worked example.

---

## 7.2 Worked Example

A `worked_example` MUST contain:

```yaml
worked_example:
  problem:
  learner_prediction:
  reasoning_steps:
  calculations:
  interpretation:
  conclusion:
  generalizable_takeaway:
```

At minimum, the page MUST expose:

- what problem is being solved,
- why each step is performed,
- intermediate reasoning,
- the result,
- what general lesson should be retained.

Worked examples that only show a final calculation MUST fail audit.

---

# 8. Misconceptions Must Be Experienced, Not Listed

A misconception section such as:

> A common misconception is that every spanning set is a basis.

is insufficient.

Instead, the system SHOULD generate a misconception challenge.

Example:

```yaml
misconception_challenge:
  prompt: >
    The vectors (1,0), (0,1), and (1,1) span R².
    Are they therefore a basis?

  expected_wrong_path:
    "Yes, because they span R²."

  correction:
    Show that (1,1) = (1,0) + (0,1).

  explanation:
    Spanning is necessary but not sufficient.
    Redundancy violates linear independence.

  transfer_check:
    Give a new spanning set and ask whether redundancy remains.
```

The learner SHOULD be given a realistic opportunity to make the mistake before correction.

---

# 9. Add Instructional Substance Budgets

The system currently validates the presence of pedagogical components.

It must also validate that enough instructional substance exists.

Introduce concept-level instructional budgets.

Example:

```yaml
instructional_budget:
  minimum_concrete_scenarios: 2
  minimum_worked_examples: 4
  minimum_counterexamples: 3
  minimum_guided_questions: 5
  minimum_independent_questions: 4
  minimum_misconception_challenges: 2
  minimum_representation_switches: 2
  minimum_transfer_tasks: 1
```

These values SHOULD be derived from cognitive complexity.

For example:

```text
high abstraction
    → more concrete anchors

high misconception risk
    → more contrasts and misconception challenges

high procedural load
    → more worked examples and fading guidance

high visual score
    → more diagrams / spatial representations

high representation switching
    → explicit transitions between representations
```

Word count MAY be used as a weak heuristic but MUST NOT be the primary quality metric.

---

# 10. Add Content Depth Rules

The generator MUST NOT satisfy a required block with one or two generic sentences.

For each block type, define minimum semantic requirements.

Example:

```yaml
block_requirements:

  concrete_problem:
    must_include:
      - concrete quantities or objects
      - an explicit problem
      - a reason the learner should care about solving it

  contrast:
    must_include:
      - at least two cases
      - one meaningful difference
      - explicit comparison

  worked_example:
    must_include:
      - problem
      - reasoning
      - intermediate steps
      - interpretation
      - takeaway

  transfer:
    must_include:
      - novel surface form
      - same underlying concept
      - no direct copying of prior example
```

---

# 11. Create a Learning Page Audit

Add a new audit category:

```text
Learning Experience Audit
```

This is separate from:

- schema validation,
- concept coverage,
- cognitive profile audit,
- AI slop audit.

The audit MUST ask whether the page can plausibly teach the concept to the intended learner.

---

# 12. Learning Experience Audit Criteria

The following checks SHOULD be implemented.

## 12.1 Concrete grounding

Fail if an abstract concept is introduced without sufficient concrete grounding.

---

## 12.2 Reasoning visibility

Fail if worked material skips the reasoning that connects steps.

---

## 12.3 Learner activity

Fail if the learner is never asked to predict, classify, calculate, explain, compare, or transfer.

---

## 12.4 Contrast

Fail if concepts with common confusions are taught without positive/negative contrasts.

---

## 12.5 Misconception repair

Fail if misconceptions are merely named rather than challenged and corrected.

---

## 12.6 Redundant prose

Fail if removing a paragraph would not meaningfully reduce instructional value.

---

## 12.7 Definition-first overuse

Warn or fail when a high-abstraction concept is introduced primarily through formal definition without preceding intuition, problem, or examples.

---

## 12.8 Example insufficiency

Fail when examples merely instantiate the definition without exposing reasoning.

---

## 12.9 Assessment alignment

Fail if exercises do not test the stated learning outcomes.

---

## 12.10 Transfer

For sufficiently important concepts, fail if the learner is never asked to apply the concept in a new context.

---

# 13. Add a Simulated Learner Audit

Introduce an optional but strongly recommended evaluation stage.

The audit agent receives:

- the learner-facing page,
- assumed prerequisites,
- no hidden concept specification.

It then attempts an assessment designed independently from the page.

Example:

```yaml
simulated_learner_audit:
  assumed_background:
    - high-school algebra
    - vectors
    - prior Open Learn Core concepts

  tests:
    - explain concept in own words
    - classify examples and counterexamples
    - solve standard task
    - identify misconception
    - perform representation switch
    - solve transfer task
```

The evaluator MUST NOT reward lexical overlap with the source page.

It SHOULD test whether the lesson enables correct reasoning.

---

# 14. BASIS Must Become the Gold Learning Experience

Do NOT immediately regenerate all 30 concepts.

First rebuild `BASIS` until it is genuinely usable by a learner.

`BASIS` MUST become the reference implementation for the new architecture.

---

# 15. Required BASIS Learning Experience

At minimum, the Basis page SHOULD implement the following progression.

## Phase 1 — The representation problem

Ask:

> How can we represent every vector in a plane using a small collection of reusable directions?

Use concrete 2D vectors.

---

## Phase 2 — Too little

Show that one vector cannot represent all of R².

Example:

```text
v₁ = (1, 0)
```

Ask the learner to produce `(0,1)` from multiples of `v₁`.

Make failure explicit.

---

## Phase 3 — Enough

Introduce:

```text
v₁ = (1, 0)
v₂ = (0, 1)
```

Demonstrate:

```text
(3,2) = 3v₁ + 2v₂
(-1,4) = -v₁ + 4v₂
```

Explain that these vectors span the plane.

---

## Phase 4 — Too much

Add:

```text
v₃ = (1,1)
```

Ask whether the third vector adds any new expressive ability.

Show:

```text
v₃ = v₁ + v₂
```

Then show that removing `v₃` changes nothing.

---

## Phase 5 — Discover the two requirements

Guide the learner to formulate:

1. the set must be sufficient to represent the space,
2. no vector should be redundant.

Only after this should formal terminology be introduced.

---

## Phase 6 — Connect previous concepts

Map:

```text
"sufficient to represent the space"
    → span

"no vector is redundant"
    → linear independence
```

Then:

```text
basis
    = spanning
    + linear independence
```

---

## Phase 7 — Formal definition

Now provide the formal definition.

The definition should feel like a name for a structure the learner already understands.

---

## Phase 8 — Positive examples

Include multiple bases of R², not only the standard basis.

Example:

```text
(1,1), (1,-1)
```

Show why they work.

---

## Phase 9 — Counterexamples

At least:

- insufficient set,
- redundant spanning set,
- linearly independent set that does not span the target space,
- duplicate/parallel vectors.

---

## Phase 10 — Classification

Give multiple vector sets.

Ask:

> Basis or not?

Require reasoning, not only yes/no.

---

## Phase 11 — Coordinates

Use a non-standard basis.

Show that a vector can be represented by coefficients relative to that basis.

---

## Phase 12 — Vector vs coordinates

Explicitly demonstrate:

> The vector is the geometric/algebraic object.
> Coordinates are its representation relative to a chosen basis.

Use one vector and two different bases.

---

## Phase 13 — Worked examples

Include several full worked examples.

At least:

- check whether a set is a basis,
- find coordinates in a basis,
- construct a basis,
- explain why a candidate fails.

---

## Phase 14 — Guided practice

Use partially completed problems.

Gradually remove hints.

---

## Phase 15 — Independent practice

Include problems that require complete learner reasoning.

---

## Phase 16 — Transfer

Use a context or representation not identical to the worked examples.

Examples:

- polynomial space,
- function space,
- matrix space,
- a geometric coordinate-system analogy.

---

## Phase 17 — Synthesis

End with a compact mental model, not a generic summary.

Example conceptual structure:

```text
A basis is a coordinate system for a vector space.

It must contain:
- enough directions to reach everything,
- but no unnecessary direction.

That is exactly:
span + linear independence.
```

---

# 16. Rendering Changes

The learner-facing renderer SHOULD visually distinguish:

- question,
- prediction,
- explanation,
- worked reasoning,
- warning,
- misconception,
- interactive task,
- formal definition,
- takeaway.

The page SHOULD NOT visually resemble documentation.

Avoid large sequences of static prose under generic headings.

---

# 17. Add Block-Level Metadata

Each rendered block SHOULD preserve metadata such as:

```yaml
learning_block:
  id:
  type:
  pedagogical_function:
  learning_outcome_ids:
  prerequisite_ids:
  difficulty:
  expected_time:
  generated_from:
```

This will enable auditing and later adaptive sequencing.

---

# 18. Concept Compression Audit

The exact-30 constraint remains.

However, the project SHOULD add stronger provenance for how the 30 concepts were selected.

For each candidate concept:

```yaml
concept_candidate:
  name:
  decision: retain | merge | demote | externalize
  destination:
  rationale:
  coverage_preserved:
```

The system SHOULD make it possible to answer:

> Where did every important piece of knowledge go after compression to 30 concepts?

---

# 19. Cognitive Profile Audit

Add explicit checks for cognitive classification.

A profile MUST NOT be accepted solely because an LLM produced plausible numbers.

Audit questions SHOULD include:

- Does the rationale justify the score?
- Does the profile match the actual learning difficulty?
- Do different scores lead to different instructional plans?
- Is the same generic profile being reused across concepts?
- Are high-risk dimensions reflected in the final learning experience?

---

# 20. Learning Contract Changes

The Learning Contract SHOULD describe observable learner capability.

Bad:

```text
Understand what a basis is.
```

Better:

```text
After the lesson, the learner can:
- determine whether a finite set is a basis in familiar vector spaces,
- explain separately why spanning and independence are required,
- compute coordinates relative to a given basis,
- explain why coordinates depend on the basis while the vector does not.
```

Learning Contracts MUST map directly to assessment items.

---

# 21. New Release-Blocking Conditions

A concept page MUST fail release if any of the following occurs:

1. Concept Specification exists but no Learning Experience exists.
2. The learner-facing page is primarily definition/property exposition.
3. Worked examples lack reasoning steps.
4. Misconceptions are listed but never challenged.
5. High misconception-risk concepts contain no counterexamples.
6. High abstraction concepts lack concrete anchors.
7. The learner performs no meaningful activity.
8. Assessment does not cover Learning Contract outcomes.
9. Instructional budget is not satisfied.
10. The page passes schema checks but fails Learning Experience Audit.
11. Gold Concept quality is below the defined gold threshold.
12. Generated content is structurally repetitive across unrelated concepts.

---

# 22. Recommended File / Module Changes

The exact repository layout may differ, but the implementation SHOULD introduce equivalents of:

```text
schemas/
  concept_specification.schema.*
  cognitive_analysis.schema.*
  pedagogical_design.schema.*
  learning_experience.schema.*
  learning_block.schema.*
  assessment.schema.*

generation/
  generate_concept_specification.*
  generate_cognitive_analysis.*
  generate_pedagogical_design.*
  generate_learning_experience.*
  generate_assessment.*

audit/
  audit_concept_compression.*
  audit_cognitive_profile.*
  audit_learning_experience.*
  audit_instructional_substance.*
  audit_assessment_alignment.*
  audit_simulated_learner.*

render/
  render_learning_experience.*
```

Avoid one monolithic generation prompt.

Each transformation SHOULD have a defined input/output contract.

---

# 23. Prompt Architecture

Replace prompts that ask:

> Write a comprehensive lesson about Basis.

with staged prompts.

Recommended pipeline:

```text
1. Analyze concept
2. Identify learner difficulties
3. Design learner-state transitions
4. Build learning sequence
5. Instantiate each learning block
6. Generate aligned assessment
7. Audit pedagogical sufficiency
8. Revise failed blocks
```

The generation model SHOULD receive the pedagogical purpose of each block.

---

# 24. Avoid Template Homogenization

The cognitive system is intended to produce different teaching structures for different concepts.

Therefore the audit SHOULD detect excessive structural similarity.

For example:

```text
motivation
definition
example
misconception
exercise
summary
```

repeated 30 times MUST be considered a failure even if every page is technically valid.

Different concepts SHOULD produce meaningfully different learning experiences.

---

# 25. Implementation Order

## P0 — Architecture

1. Add `LearningExperience`.
2. Add `LearningBlock`.
3. Separate Concept Specification from learner-facing content.
4. Update renderer to consume Learning Experience.

---

## P0 — BASIS Gold Rewrite

5. Rebuild Basis using the new architecture.
6. Add substantial worked examples.
7. Add misconception challenges.
8. Add guided and independent practice.
9. Add coordinate/basis-change explanation.
10. Add transfer task.

Do NOT mass-regenerate the remaining concepts yet.

---

## P0 — Audits

11. Add Learning Experience Audit.
12. Add instructional substance checks.
13. Add assessment alignment checks.
14. Add definition-first / documentation-like page detection.

---

## P1 — Cognitive Quality

15. Require rationale for cognitive scores.
16. Add Cognitive Profile Audit.
17. Ensure cognitive dimensions materially affect lesson structure.

---

## P1 — Simulated Learner Evaluation

18. Add independently generated assessment.
19. Add simulated learner audit.
20. Add automatic revision on failed learning outcomes.

---

## P2 — Scale Out

21. Only after Basis reaches gold quality, apply the pipeline to the other 29 concepts.
22. Compare structural diversity across all 30.
23. Run cross-concept consistency and dependency audits.

---

# 26. Definition of Done for BASIS

The BASIS page is complete only when:

- a learner can begin without already knowing the formal definition,
- the need for a basis emerges from concrete problems,
- span and independence are understood as separate requirements,
- positive and negative examples are both abundant,
- reasoning is shown, not merely asserted,
- the learner must actively answer questions,
- common errors are elicited and repaired,
- non-standard bases are included,
- coordinates are taught,
- vector vs coordinate representation is explicitly distinguished,
- guided practice transitions to independent practice,
- transfer is tested,
- every Learning Contract outcome is assessed,
- the page reads like a lesson rather than documentation.

---

# 27. Global Principle

The project MUST optimize for:

> learner state change

not:

> amount of information presented

A page is not educational merely because it contains correct definitions, examples, properties, and exercises.

The final learner-facing artifact must cause the learner to:

```text
notice
→ predict
→ attempt
→ fail or succeed
→ compare
→ revise
→ formalize
→ practice
→ transfer
```

Open Learn Core should generate and audit that process.

---

# 28. Final Product Direction

The intended identity of Open Learn Core should be:

> A system that compresses a domain into exactly 30 core mental models,
> models the cognitive nature of each concept,
> designs an appropriate learning experience,
> generates actual learner-facing instruction,
> and audits whether that instruction plausibly produces understanding.

It should NOT become:

> A structured encyclopedia with pedagogical metadata.

The next implementation phase should be judged entirely by whether `BASIS` becomes a page that an actual beginner can learn from.
