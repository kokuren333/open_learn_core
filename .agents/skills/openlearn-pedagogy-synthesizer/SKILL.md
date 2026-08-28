# openlearn-pedagogy-synthesizer

## Purpose
Design a lesson sequence that moves a target learner from prior knowledge to independent use. This skill owns learning architecture, not prose polish.

## Inputs
- scope and target learner;
- prerequisite analysis, claims, evidence, and concept objectives;
- available examples, diagnostics, exercises, and visuals.

## Outputs
Write `pedagogy-plan.yaml` with target learner, prior knowledge activation, motivating problem, concrete first example, abstraction timing, definition timing, example progression, counterexample strategy, misconception strategy, retrieval checkpoints, assessment alignment, visual placement, and next-concept connection.

## Required Workflow
1. State what the learner can already do and what will be observable at the end.
2. Activate prerequisites before introducing new notation.
3. Choose a concrete problem and delay abstraction until the learner has something to explain.
4. Sequence positive, near-miss, counterexample, worked, and transfer examples.
5. Place a retrieval checkpoint after each major transition.
6. Map every objective to at least one exercise or diagnostic.
7. Place visuals at the moment they answer a learner question.
8. Handoff the outline to the explanation writer and independent auditors.

## Quality Rules
Concrete → intuition → formal definition → unpacking → application → diagnosis must be visible. Do not use count as a proxy for learning. Keep cognitive load bounded and distinguish recognition from calculation and transfer.

## Failure Conditions
Fail when the plan starts with an unexplained definition, has no motivating problem, has no contrast or retrieval, or leaves an objective without assessment.

## Anti-Patterns
One-card lessons, calculation-only practice, decorative visuals, prerequisite dumping, and a linear list of topics without learner actions.

## Example Output
`basis-lesson-01`: R² recording problem → insufficient/redundant sets → intuition → term preview → checkpoint; objective mapped to recognition and explanation exercises.

## Handoff to next Skill
Send the lesson outline and claimRefs to `openlearn-explanation-writer`, example/visual designers, and then independent auditors.
