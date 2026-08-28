# Evidence Model

v1.6は、教材の主張・出典・学習設計の判断を同じリポジトリから追跡できるようにします。

```text
Source → EvidenceItem → Claim → Concept → Lesson → Exercise / Diagnostic
Evidence → CurriculumDecision → Curriculum / prerequisite graph
```

- **Source**: URL、提供者、資料種別、ライセンス、言語、確認日を持つ再訪可能な資料。
- **EvidenceItem**: Sourceのlocator、抽出した意味、支えるClaim、役割、確信度を記録する単位。
- **EvidenceReview**: 調査質問、検索語、採用・除外理由、限界、既知・不確実・未解決事項を残す調査ログ。
- **Claim**: 教材で検証可能にしたい主張。数学的事実と教育上の判断を`claimType`で区別する。
- **CurriculumDecision**: 「なぜこの順序か」という教育設計の判断。数学定理と混同しない。

`basis`では、MIT OpenCourseWareとOpen Textbook Libraryの公開資料をSourceとして使用し、定義・座標・一意性・次元のClaimをEvidenceItemのlocatorへ接続しています。`basis-order`はspanとlinear-independenceを先に置く判断をCurriculumDecisionとして記録し、代替順序と未検証点も保持します。

Evidenceは正しさを自動証明する仕組みではありません。公開資料へ再訪できること、教材内のどの主張を支えるか、どこからが著者の設計判断かを明確にする監査情報です。
