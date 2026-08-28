# Skill Architecture

v1.7のSkill群は、文章生成のためだけではなく、調査・Evidence抽出・教育設計・図解・独立監査を分担するための契約です。全Skillは`.agents/skills/OPENLEARN-SHARED-CONTRACT.md`を継承し、成果物を`_working/`へ残します。

```text
scope → discovery → appraisal → extraction → claims → prerequisites
  → pedagogy → explanation → examples/exercises/diagnostics → visuals
  → math/evidence/pedagogy/visual/completeness audits → publish gate
```

WriterとAuditorは別のSkill名・別の成果物を持ち、Auditは生成時の推論を引き継がず、artifact・source・evidenceを読み直す設計です。MVPの自動監査は決定的なチェックを担当し、将来のAI Skill実行結果も同じYAML契約に保存できます。
