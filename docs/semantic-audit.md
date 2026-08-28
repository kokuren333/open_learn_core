# Semantic Audit

Deterministic validationとsemantic auditは責務を分けます。前者はschema、ID、参照、循環、必須項目、件数を確認します。後者は、意味を持つ独立レビューとして次を確認します。

- Math: 定義、条件、計算、反例、worked reasoning、概念接続
- Evidence: claimがsourceの範囲を超えていないか、locatorと解釈が対応するか
- Pedagogy: motivation、concrete → abstract、retrieval、assessment、認知負荷
- Explanation: 用語、記号、referent、橋、定義の分解、反復、説明の深さ
- Visual: 数学的意味、ラベル、アクセシビリティ、誤概念リスク、本文との整合
- Completeness: countに加えてdepth、progression、objective coverage

各結果は`_working/<concept>/audit/*.yaml`へ保存し、auditor、summary、issues、timestamp、`artifact_hash`を含めます。hashが現在の教材と一致しない結果はstaleとしてPublish Gateで拒否します。

失敗時はaudit typeに応じて対応Skillへ戻し、最大3回のfix loopで再監査します。解決しなければblockedのままpublishしません。
