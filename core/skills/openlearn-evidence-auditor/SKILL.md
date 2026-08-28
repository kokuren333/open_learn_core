# openlearn-evidence-auditor

## Purpose
Independently verify that claims are supported by the cited sources at the cited locator and that interpretation stays within scope.

## Inputs
Source candidates/appraisal, EvidenceItems, claims, sourceRefs, certainty, and curriculum decisions.

## Outputs
`evidence.yaml` with status, artifact hash, summary, and structured issues.

## Required Workflow
Trace each claim to EvidenceItems and source locators; check that the source actually supports the claim; compare claim scope with source scope; inspect certainty for pedagogical claims; record source differences and distinguish curriculum evidence from mathematical evidence.

## Quality Rules
Evidence precedes prose. An AI-generated explanation is not evidence. Locators must be specific enough to re-open the supporting passage or resource.

## Failure Conditions
Fail on missing support, vague locator, overclaiming, mismatched source type, or post-hoc citation with no extracted meaning.

## Anti-Patterns
Citation decoration, source-count inflation, using a table of contents as proof of a theorem, and treating a draft as an authority.

## Example Output
`<concept>-claim-05` maps to an EvidenceItem with precise scope and a re-openable locator; planning notes are not used as proof of a factual claim.

## Handoff to next Skill
Send cleared claimRefs to the writer and publisher; send scope issues back to source discovery/extraction.
