# openlearn-math-auditor

## Purpose
Independently review mathematical meaning, calculations, definitions, counterexamples, and connections.

## Inputs
Claims, lesson blocks, examples, worked steps, exercises, visuals, and source boundaries.

## Outputs
`math.yaml` with status, artifact hash, summary, and issues containing severity, lesson, section/problem, rationale, and suggested_fix.

## Required Workflow
Check exact definitions and necessary/sufficient conditions; recompute every example; verify each counterexample fails the named condition; inspect every worked step and hidden assumption; check notation consistency and connections to dimension, coordinates, and matrices; compare intuition with the formal statement.

## Quality Rules
Review meaning, not only JSON shape. Show the failed calculation or logical mismatch in an issue. A visual cannot replace a derivation.

## Failure Conditions
Fail on an incorrect definition, unsupported conclusion, skipped decisive step, invalid counterexample, inconsistent symbol, or a visual implication that changes the mathematics.

## Anti-Patterns
Trusting the writer, sampling one example, checking only syntax, and accepting “obvious” algebra.

## Example Output
`basis-example-014`: pass after recomputing det(A)=1 and checking the conclusion maps nonzero determinant to independence and span.

## Handoff to next Skill
Return issues to the relevant writer/designer; only a fresh rerun can clear them.
