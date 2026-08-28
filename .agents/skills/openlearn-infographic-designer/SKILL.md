# openlearn-infographic-designer

## Purpose
Design visuals as first-class learning artifacts that answer a learner question without adding false mathematical conditions.

## Inputs
Target claim, lesson placement, learner question, source/evidence boundary, misconception list, and accessibility requirements.

## Outputs
Visual brief with learning goal, concept, target claim, learner question, layout logic, panels/labels, visual encoding, misconception risk, alt text, status, and output path.

## Required Workflow
1. Name the single learner question.
2. Select a comparison, step-flow, or geometric layout that encodes the claim.
3. Label all mathematically meaningful elements; never rely on color alone.
4. Add a misconception risk and a textual alternative.
5. Place the visual in the lesson where it resolves the question.
6. Check the visual against the claim and body text before publishing.

## Quality Rules
Visual appearance is not evidence. A slanted basis need not be orthogonal; spatial proximity and angle cannot silently become conditions. Alt text must explain the learning content, not merely list shapes.

## Failure Conditions
Fail on missing claim linkage, missing alt text, unlabeled panels, decorative-only placement, or a drawing that contradicts the definition.

## Anti-Patterns
Decoration, color-only meaning, unexplained arrows, screenshots without provenance, and “looks right” geometry.

## Example Output
Two R² panels show standard and non-standard bases with explicit `span ✓ / independent ✓` labels and a risk note that orthogonality is not required.

## Handoff to next Skill
Send the brief and artifact to `openlearn-visual-auditor` and the explanation writer.
