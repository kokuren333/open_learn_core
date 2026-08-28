# Learning Experience

Open Learn Core v2.2 separates the learner-facing experience from the Core Concept specification.

`Core Concept` describes the stable knowledge model: central mental model, cognitive profile, representations, misconceptions, prerequisites, and learning contract. `Learning Experience` describes what a learner actually does and how their state changes. It is stored in `data/learning-experiences/learning-experiences.json` and is the primary input for learner-facing Core Concept pages.

Each `LearningBlock` has a visible activity, a before/after learner state, required elements, outcome IDs, prerequisites, difficulty, expected time, and provenance. Worked examples expose prediction, reasoning steps, calculation, interpretation, conclusion, and a reusable takeaway. Misconception challenges expose the likely wrong path, correction, explanation, and a transfer check.

Learning Experience audits are separate from schema validation and the older semantic audits. The audit checks instructional budgets, activity visibility, sequence shape, reasoning visibility, misconception treatment, transfer, and assessment alignment. Automated reports explicitly record `independent_review: false`; a passing report is not a claim of human editorial review.

The current reference implementation makes `basis` the first Gold Learning Experience. The other 29 Core Concepts remain `scaffold` and are reported as warnings until their own experiences are authored.
