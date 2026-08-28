# v1.8 Design Migration Note

v1.7で構築したEvidence-based authoring pipelineを維持し、v1.8ではLessonをカードから学習単位へ拡張した。Concept schemaは既存データを壊さず、section kind、worked-example metadata、visual brief metadataを追加する。

品質判定は二層に分ける。`validate`が決定的な構造を確認し、独立Skill群が意味を確認する。JS側のauditはSemantic Skillの実行を置き換えるものではなく、ローカルMVPで再現可能なminimum semantic checksとartifact freshnessを提供する。
