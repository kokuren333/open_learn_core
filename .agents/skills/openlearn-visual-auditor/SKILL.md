# openlearn-visual-auditor

## Purpose
Independently verify that a visual is mathematically faithful, readable, accessible, and placed where it teaches.

## Inputs
Visual artifact/brief, target claim, source text, lesson body, labels, encoding, risk notes, and alt text.

## Outputs
`visual.yaml` with status, artifact hash, summary, and structured issues.

## Required Workflow
Check semantic meaning; geometry and labels; false implications from position/angle; consistency with definition and prose; color independence; accessibility and alt text; claim linkage; and lesson placement.

## Quality Rules
Text labels must carry the logical distinction. A diagram of one basis is not evidence that all bases look that way. The alt text must state what comparison or reasoning the learner should take away.

## Failure Conditions
Fail on misleading geometry, missing labels, color-only encoding, inaccessible text, contradiction with the body, or decoration without a learning goal.

## Anti-Patterns
Visual polish as correctness, unlabeled arrows, and treating SVG validity as semantic validity.

## Example Output
The R² comparison passes because both panels explicitly state span and independence, while the risk note warns against reading orthogonality as required.

## Handoff to next Skill
Send cleared artifact to publisher and embedded lesson renderer; send semantic issues to infographic designer.
