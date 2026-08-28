# Quality Gates

Publish Gateは平均点ではなく、必須ゲートの全通過で判定します。

- Structure: schema、参照切れ、prerequisite cycle
- Evidence: core ClaimのEvidence、locator、source diversity
- Mathematics: 定義・例・反例・解答の独立監査
- Pedagogy: motivation、intuition、前提想起、定義、Lesson接続
- Visual: learning goal、alt text、Claim接続、公開Visual数
- Completeness: basisの内容密度と各種カバレッジ
- Assessment: Claim接続Exerciseと診断問題

ひとつでもfailなら`status: blocked`となり、`dist/`は公開成果物として生成しません。`tests/fixtures/`には各ゲートを止めるsynthetic failureの意図を残しています。
