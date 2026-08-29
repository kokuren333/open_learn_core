# openlearn-domain-bootstrap

## Purpose

Turn a learner's natural-language study need into a durable Open Learn Core Domain plan. This is the upstream entry point before a Concept ID exists; it does not replace the downstream Concept authoring or audit skills.

## Trigger

Use when a learner asks to learn, relearn, understand, or build a domain around a subject, especially when they describe current knowledge, confusion, level, or intended use. The learner does not need to know this skill's name.

## Contract

1. Preserve the learner's desire, current knowledge, difficulty, level, and intended use as authoring metadata.
2. Reuse `openlearn-scope-designer`, `openlearn-curriculum-researcher`, `openlearn-source-discovery`, `openlearn-source-appraiser`, `openlearn-prerequisite-analyst`, and `openlearn-course-architect`; do not duplicate their responsibilities.
3. Compare multiple trustworthy curriculum sources before fixing the public map.
4. Produce exactly 30 learner-facing Core Concepts with unique IDs, explicit prerequisites, and a separate course order.
5. Generate a domain scaffold under `domains/<domain>/` without copying subject-specific code into `core/`.
6. Mark only explicitly selected Concepts as `gold`; the remaining Concepts may be `scaffold` and must remain visible in the 30-node map.
7. Pass selected Gold Concepts to `openlearn-orchestrator` only after the Domain map, scope, source comparison, and prerequisite graph are inspectable.

## Input model

Capture at least:

```yaml
learner_problem:
  desire: ""
  current_knowledge: ""
  difficulty: ""
  desired_level: ""
  intended_use: ""
domain_scope:
  subject: ""
  target_level: ""
  prerequisites: []
  objectives: []
  excluded_topics: []
```

## Durable outputs

- `working/bootstrap/learner-problem.json`
- `working/bootstrap/domain-scope.json`
- `working/bootstrap/curriculum-research.json`
- `working/bootstrap/concept-map.json`
- `data/core-concepts/core-concepts.json`
- `data/curricula/<domain>-foundations.json`

The generator is invoked with `npm run bootstrap:domain -- <request.json>`. Validate with `npm run validate:domain -- <domain>` before authoring Gold content.
