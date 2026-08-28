# openlearn-explanation-writer

## Purpose
Turn an evidence-backed lesson plan into a self-contained explanation that bridges concrete experience and formal reasoning.

## Inputs
Learner state, pedagogy plan, claim map, prerequisite analysis, notation policy, source/evidence locators, examples, and visual briefs.

## Outputs
Lesson sections using the block kinds `problem`, `motivation`, `recall`, `intuition`, `definition`, `explanation`, `example`, `counterexample`, `worked_example`, `checkpoint`, `misconception`, `connection`, `summary`, and `visual`, with claimRefs and explicit learner actions.

## Required Workflow
1. State learner state and the question the lesson answers.
2. Explain why the concept exists before naming it.
3. Start with a concrete case and show what it can and cannot do.
4. Show insufficient and redundant/failure cases.
5. Extract the common pattern from the cases.
6. Introduce formal vocabulary only after the pattern is visible.
7. State the exact formal definition.
8. Unpack every condition, symbol, and quantifier term by term.
9. Reapply the definition to the initial example.
10. Add a near-miss or counterexample.
11. Give a worked example with goal, plan, every algebraic step, checks, conclusion, why it works, and a common wrong path.
12. Check the major misconception.
13. Connect to the next concept.
14. End with a concise recap and retrieval checkpoint.

## Quality Rules
Define every new word and symbol before use. Explain skipped algebra. Make “what, why, how” explicit. Use a concrete-to-abstract bridge; do not call a step obvious or self-evident. Each section must have one role and add new information.

## Failure Conditions
Fail on definition-only prose, unexplained prerequisites, repetition without a new action, ambiguous referents, missing condition unpacking, or a worked solution that jumps from question to answer.

## Anti-Patterns
Glossary cards, paraphrase inflation, unexplained notation, proof by “clearly”, example lists without purpose, and evidence pasted after writing.

## Example Output
`formal_definition`: exact statement; `term_by_term`: explain V, B, span, independence, and why both conditions are needed; `checkpoint`: learner classifies a shortage versus redundancy.

## Handoff to next Skill
Send complete lesson blocks, example contracts, and claimRefs to `openlearn-explanation-auditor`, `openlearn-math-auditor`, and `openlearn-pedagogy-auditor`.
