# openlearn-explanation-auditor

## Purpose
Independently audit explanation quality itself: clarity, semantic depth, terminology, bridges, and continuity of reasoning.

## Inputs
Lesson blocks, content layers, notation policy, learner state, examples, worked solutions, diagnostics, and claimRefs.

## Outputs
`explanation.yaml` in `_working/<concept>/audit/` with `status`, `auditor`, `artifact_hash`, `summary`, timestamp, and issues shaped as:

```yaml
severity: critical | major | minor
lesson: basis-lesson-01
section: basis-section-01-intuition
problem: concrete case does not connect to formal term
rationale: learner cannot infer why the definition is introduced
suggested_fix: name span after showing the reachable set
```

## Required Workflow
Check whether a learner can enter without hidden prerequisites; locate each new word and symbol at first use; test referents and quantifiers; verify “what, why, how”; compare exact definitions with their paraphrase; inspect concrete-to-abstract bridges; follow every reasoning step; verify each example states what it demonstrates; compare counterexamples by the failed condition; detect paraphrase-only filler; and check each section's single role.

## Quality Rules
Definition, intuition, and application must reinforce rather than replace one another. A long paragraph is not deep if it adds no learner action or distinction. “Obviously” and “self-evident” are not explanations.

## Failure Conditions
Fail on unexplained symbols, abrupt abstraction, ambiguous referents, missing definition unpacking, skipped algebra, fake depth, or a lesson that remains a short card.

## Anti-Patterns
Writer self-review, synonym expansion, undefined notation, example dumping, and measuring quality only by character count.

## Example Output
`basis-lesson-03 / basis-section-03-unpack`: pass when V, B, span, and independence are defined and both conditions are tied to existence and uniqueness.

## Handoff to next Skill
Return issues to `openlearn-explanation-writer`; rerun all semantic audits before publishing.
