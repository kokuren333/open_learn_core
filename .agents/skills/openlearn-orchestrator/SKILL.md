# openlearn-orchestrator

Own the deterministic authoring workflow. Run the skills in this order: scope designer, source discovery, source appraiser, evidence extractor, claim builder, prerequisite analyst, pedagogy synthesizer, explanation writer, example designer, exercise designer, diagnostic designer, infographic designer, math auditor, evidence auditor, pedagogy auditor, visual auditor, completeness auditor, fix loop, publisher.

Input: a Concept ID and its durable data. Output: the complete `_working/<concept>/` artifact set, audit results, and a publish-gate decision. Maximum fix iterations: three. Never bypass a failed gate.
