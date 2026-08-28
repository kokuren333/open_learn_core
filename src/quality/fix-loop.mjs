import { computeAudits } from "./audits.mjs";

export const auditSkillMap = {
  explanation: "openlearn-explanation-writer",
  pedagogy: "openlearn-pedagogy-synthesizer + openlearn-explanation-writer",
  math: "openlearn-math-auditor + relevant content designer",
  visual: "openlearn-infographic-designer",
  evidence: "openlearn-evidence-extractor + openlearn-source-appraiser",
  completeness: "missing content skill"
};

/**
 * A bounded authoring handoff. The caller reruns the independent audit after
 * each repair; this module never publishes an unresolved artifact.
 */
export function fixLoop({ dataset, validation, conceptId = "basis", maxLoops = 3, rerun }) {
  const history = [];
  for (let loop = 1; loop <= Math.min(maxLoops, 3); loop += 1) {
    const audit = computeAudits({ dataset, validation, conceptId });
    const failed = audit.names.filter((name) => audit.results[name].status !== "pass");
    history.push({ loop, failed, handoffs: failed.map((name) => ({ audit: name, skill: auditSkillMap[name] })) });
    if (!failed.length) return { status: "resolved", loops: loop, history };
    if (typeof rerun !== "function") return { status: "blocked", loops: loop, history };
    rerun({ loop, failed });
  }
  return { status: "blocked", loops: Math.min(maxLoops, 3), history };
}
