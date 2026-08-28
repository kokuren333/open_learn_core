# Authoring Workflow

新しいConceptは次の順に作成します。

1. Conceptの境界、学習目標、前提Conceptを決める。
2. Sourceを選び、URL・ライセンス・確認日を登録する。
3. Evidence Reviewに調査質問、検索語、採否、限界を書く。
4. SourceからEvidenceItemを抽出し、locatorと読み取った意味を記録する。
5. Claimを定義・数学的事実・定理・解釈・教育判断などに分類する。
6. ClaimへEvidenceItem IDとSource locatorを接続する。
7. prerequisiteEdgesに関係、理由、根拠、確信度を書く。
8. Lessonを直観、定義、関係、方法、まとめに分解する。
9. Lesson sectionからClaimを参照する。
10. Exampleをpositive / counterexample / workedに分類する。
11. Exerciseに難易度、答え、解説、必要Concept、検証するClaimを付ける。
12. Diagnosticとmisconceptionに、誤答時の不足Conceptや修正説明を付ける。
13. Curriculum順序の判断をCurriculumDecisionとして残す。
14. `npm run validate && npm test && npm run evidence:report && npm run build`を実行する。

数学的な主張と「初学者にはこの順がよい」という判断は、Claimの`claimType`または独立したCurriculumDecisionで区別します。未検証の学習効果は`uncertain`や`open_questions`に残します。
