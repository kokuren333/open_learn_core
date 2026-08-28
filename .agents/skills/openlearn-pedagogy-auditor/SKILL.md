# openlearn-pedagogy-auditor

## Purpose
Independently judge whether a lesson is understandable and learnable, beyond checking that sections exist.

## Inputs
Learner profile, pedagogy plan, lesson sequence, explanation, examples, misconceptions, exercises, diagnostics, and visual placements.

## Outputs
`pedagogy.yaml` with status, artifact hash, summary, and issue records.

## Required Workflow
Review entry motivation; prerequisite activation; concrete-to-abstract flow; definition timing; example progression; misconception anticipation; retrieval checkpoints; assessment alignment; visual timing; cognitive load; and next-concept connection.

## Quality Rules
Every major objective must be practiced. Checkpoints must require retrieval or explanation, not merely display an answer. Near-misses must be close enough to diagnose the distinction.

## Failure Conditions
Fail on abrupt abstraction, no learner problem, content overload, calculation-only assessment, missing misconception handling, or objectives with no observable task.

## Anti-Patterns
Presence-only review, topic-order worship, and equating longer text with better teaching.

## Example Output
Lesson 2 passes because recall precedes notation, nearby cases are contrasted, a visual answers the learner question, and a checkpoint distinguishes the target property from a common near-miss.

## Handoff to next Skill
Return instructional issues to pedagogy synthesizer and explanation writer; return assessment issues to exercise/diagnostic designers.
