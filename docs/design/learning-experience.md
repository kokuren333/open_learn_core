# Learning Experience

Open Learn Core v2.4 separates learner-facing lesson content from the Core Concept specification and the Learning Experience design layer. A Learning Experience may retain many internal Learning Blocks, while its `learner_sections` define the smaller, readable sequence presented to learners.

`Core Concept` describes the stable knowledge model: central mental model, cognitive profile, representations, misconceptions, prerequisites, and learning contract. `Learning Experience` describes what a learner actually does and how their state changes. It is stored in `data/learning-experiences/learning-experiences.json` and is the primary input for learner-facing Core Concept pages.

Each `LearningBlock` has a visible activity, a before/after learner state, required elements, outcome IDs, external Concept prerequisites, internal Block dependencies, difficulty, expected time, and provenance. Its corresponding `lesson_content` record requires only a learner-facing `body`; equations, prompts, feedback, and other components are optional and may be checked by block type. The default renderer uses the body as prose and progressively reveals practice, hints, worked solutions, and misconception explanations. Authoring and audit metadata are retained for review but are not shown on the learner page.

Learning Experience audits are separate from schema validation and the older semantic audits. The audit checks instructional budgets, activity visibility, sequence shape, reasoning visibility, misconception treatment, transfer, and assessment alignment. Automated reports explicitly record `independent_review: false`; a passing report is not a claim of human editorial review.

The current reference implementation makes `basis` the first Gold Learning Experience. The other 29 Core Concepts remain `scaffold` and are reported as warnings until their own experiences are authored.
