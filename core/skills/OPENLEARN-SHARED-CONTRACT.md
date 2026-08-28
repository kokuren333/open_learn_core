# Open Learn Shared Contract

Every Open Learn skill follows the same contract.

## MUST

- Collect and inspect Evidence before writing prose.
- Never invent Source URLs or locators; distinguish unavailable facts as uncertain.
- Separate mathematical claims from pedagogical and curriculum decisions.
- Make prerequisites explicit and explain every new symbol.
- Preserve stable IDs and fail on broken references.
- Do not publish failed audits or treat generated text as Evidence.
- Prefer concise extraction and paraphrase over copying source text.
- Record structured artifacts so another skill can re-evaluate the work independently.

## SHOULD

- Prefer official, university OER, open textbook, or peer-reviewed sources.
- Confirm important claims with more than one source when possible.
- Pair intuition with a precise definition and positive examples with counterexamples.
- Add a Visual Artifact when a diagram materially improves understanding.
- Mark weak educational evidence as provisional or uncertain.

## Artifact protocol

Inputs are read from a Domain package's `domains/<domain-id>/data/` and `working/`. Draft outputs stay in the Domain's `working/`; only publish-gate-passing, durable records go to the Domain's `data/`; generated public material goes to root `dist/domains/<domain-id>/`.
