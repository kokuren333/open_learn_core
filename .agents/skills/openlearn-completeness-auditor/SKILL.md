# openlearn-completeness-auditor

## Purpose
Review coverage and depth so a concept is a learnable unit rather than a collection of populated fields.

## Inputs
Concept schema, lesson architecture, quality matrix, objectives, claims, examples, exercises, diagnostics, misconceptions, visuals, and all audit results.

## Outputs
`completeness.yaml` with counts plus depth fields: motivation substantial/problem-driven, intuition concrete/formal bridge, definition exact/unpacked/conditions explained, worked stepwise/purpose explicit, objective coverage, and visual correctness.

## Required Workflow
Check minimum coverage; inspect primary-layer depth; verify every lesson has multiple roles and a checkpoint; inspect example progression and worked contracts; map objectives to varied exercises; connect misconceptions to explanations/diagnostics; and confirm visuals are placed.

## Quality Rules
Counts are necessary but never sufficient. Reject duplicate filler, shallow cards, orphaned exercises, and disconnected diagnostics.

## Failure Conditions
Fail on missing required artifact, thin lesson, missing depth field, objective mismatch, or a pass achieved only by increasing item count.

## Anti-Patterns
Count-only gates, word-count worship, duplicate examples, and treating all exercise types as equivalent.

## Example Output
`worked_examples.stepwise: 6/6`; `assessment.objective_coverage: complete`; `motivation.problem_driven: true`; status pass only when these are supported by inspected artifacts.

## Handoff to next Skill
Send the quality matrix to publish gate; return gaps to the specific content designer and use the bounded fix loop.
