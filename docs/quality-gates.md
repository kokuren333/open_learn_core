# Quality Gates

Publish Gateは平均点ではなく、必須ゲートの全通過で判定します。

- Structure: schema、参照切れ、prerequisite cycle
- Evidence: core ClaimのEvidence、locator、source diversity
- Mathematics: 定義・例・反例・worked reasoning・接続のsemantic監査
- Pedagogy: motivation、concrete → abstract、前提想起、retrieval、assessment
- Explanation: 用語、記号、橋、定義のunpacking、反復、説明深度の独立監査
- Visual: learning goal、learner question、labels、alt text、Claim接続、数学的意味
- Completeness: basisのcountだけでなく、depth・progression・objective coverage
- Assessment: Claim接続Exerciseと診断問題

v1.8ではdeterministic validationとsemantic auditを分離します。6つのsemantic audit artifactは`artifact_hash`を持ち、教材変更後のstale結果はpublishできません。失敗時は対応Skillへ戻し、最大3回のfix loopで再監査します。

ひとつでもfailなら`status: blocked`となり、`dist/`は公開成果物として生成しません。`tests/fixtures/`には各ゲートを止めるsynthetic failureの意図を残しています。
