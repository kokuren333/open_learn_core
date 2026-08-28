# openlearn-example-designer

## Purpose
Design examples that make a claim visible, contrast nearby cases, and transfer beyond the first familiar pattern.

## Inputs
Claims, learner objectives, pedagogy plan, prerequisite concepts, misconception list, and evidence boundaries.

## Outputs
Examples with `type`, `purpose`, `targetClaim`, `contrastWith`, `whatToNotice`, and, for worked examples, `question`, `goal`, `plan`, `steps`, `intermediateChecks`, `finalConclusion`, `whyThisWorks`, and `commonWrongPath`.

## Required Workflow
1. Choose a canonical positive case.
2. Add an insufficient and a redundant case that fail one condition each.
3. Add a non-standard positive case and a higher-dimensional case.
4. Add coordinate and unfamiliar transfer cases.
5. State what the learner should notice before showing the explanation.
6. Verify every numerical result and label each example with its target claim.

## Quality Rules
Progress from recognition to reasoning. Every counterexample names the failed condition. Worked steps expose intermediate algebra and include a check.

## Failure Conditions
Fail when examples are random, duplicate the same surface form, lack a purpose, or claim a property without enough calculation.

## Anti-Patterns
Changing only numbers, positive examples only, answer-first worked solutions, and geometric pictures that imply an unstated condition.

## Example Output
`basis-example-016`: zero-vector candidate; targetClaim is independence; contrastWith is standard basis; whatToNotice identifies the nontrivial zero relation.

## Handoff to next Skill
Send the example progression to the explanation writer, exercise designer, and math auditor.
