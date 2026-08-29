# Domain Bootstrap

Domain Bootstrap is the upstream path from a learner's natural-language need to a reusable Open Learn Core Domain. It keeps learner context in authoring metadata, delegates scope and curriculum work to the existing Skills, and emits an exact 30-node public Core Concept map before individual Concepts are sent through the normal authoring pipeline.

## Workflow

```text
learner problem
  -> scope and boundaries
  -> curriculum source comparison
  -> 30 Core Concepts
  -> prerequisite graph + course order
  -> domain scaffold
  -> selected Gold Concepts
```

The durable bootstrap artifacts live under `domains/<domain>/working/bootstrap/`. They are not learner-facing lesson content.

## Command

```bash
npm run bootstrap:domain -- domains/statistics/working/bootstrap-request.json
npm run validate:domain -- statistics
npm run build:domain -- statistics
```

The generator accepts any request JSON with `domain_id`, `learner_problem`, `domain_scope`, `research.sources`, and exactly 30 `concepts`. It writes a Domain scaffold and does not add a subject-specific branch to `core/`.

## Statistics dogfooding

`statistics` contains 30 scaffold Concepts at this stage. The map is intentionally complete while editorial content is intentionally selective. The bootstrap request records Gold candidates, but a Concept is not promoted to Gold until its Web learning experience, visual explanation, traceable sources, Further Learning links, readable PDF, and playable video artifact all exist. Curriculum comparison records OpenIntro Statistics, the NIST/SEMATECH e-Handbook, Penn State statistics course material, and OpenStax Introductory Statistics as link-only research sources; it does not copy their prose.
