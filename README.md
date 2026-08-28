# Open Learn Core

線形代数の概念を、前提関係と根拠付きの教材コンテンツとして管理し、そこから静的Web教材を生成する教育OSSのMVP v1.5です。

## What

スカラー、ベクトル、線形結合、span、線形独立、基底、次元、線形写像、行列など12個のConceptを収録しています。ConceptページではLesson単位の説明、例、難易度別演習、解答、理解度セルフチェック、誤解しやすい点、出典、前提Conceptを確認できます。特に`linear-independence`と`basis`は5 Lesson・13 Exercise・3 Diagnostic・5 Claimで構成しています。

## Why

通常のMarkdown教材はページ単位で整理されますが、このプロジェクトではConceptを知識グラフの単位にします。Conceptは「何を知るか」、Lessonは「どの順で教えるか」、Claimは「どの主張をどの出典のどこで支えるか」、Exerciseは「何ができれば理解したとみなすか」を担当します。これにより、順序の異なるカリキュラム、グラフ表示、将来の教材形式への変換を同じデータから行えます。

## Architecture

```text
Sources
  ↓
Concept Data (data/concepts/*.json)
  ↓
Lesson / Claim / Exercise
  ↓
Curriculum (data/curricula/*.json)
  ↓
Validator / Renderer
  ↓
Static Web (site/)
```

Schemaは`schemas/`、設計判断は`docs/design.md`にあります。Concept JSONでは、グラフメタデータと`lessons`、根拠付き`claims`、`exercises`、`diagnosticQuestions`を分けています。`content.explanation`はConcept全体の導入、細かな学習展開はLessonの`sections`に置きます。

## Run

Node.js 20以上が必要です。外部パッケージは使いません。

```bash
npm run validate
npm test
npm run build
npm run dev
```

`npm run dev`の後、ターミナルに表示されたURLを開いてください。既定の4173番ポートが使用中の場合は、空いている次のポートへ自動的に切り替わります。`npm run build`で生成される`site/`は、そのまま静的ホスティングやGitHub Pagesへ配置できます。

## Validate

`npm run validate`は次を検査します。

- JSON Schemaに対する必須フィールド、型、形式
- Concept / Curriculum / Sourceの重複ID
- prerequisiteとrelatedの参照切れ
- prerequisiteの循環
- Curriculumから参照されたConceptの存在
- Lessonから参照されたExerciseの存在
- Lesson本文から参照されたClaimの存在
- Claimのsourceとlocator

## Add a Concept

1. `data/concepts/your-concept-id.json`を作成し、既存Conceptと同じSchemaの全必須フィールドを記入します。
2. `id`は小文字英数字とハイフンのstable identifierにし、ファイル名と一致させます。
3. `prerequisites`、`related`、`sources`には既存のIDだけを指定します。
4. `lessons`に直観・定義・方法・関係などの節を追加し、`exercises`をLessonの`exerciseIds`から参照します。
5. 重要な主張は`claims`に切り出し、`sourceRefs`で出典IDとlocatorを付けます。
6. `data/curricula/linear-algebra-basic.json`の`sequence`に学習順を追加します。ConceptとCurriculumは別の関心事なので、別ファイルのまま編集します。
7. `npm run validate && npm test && npm run build`を実行します。

## Roadmap

- **MVP v1**: 線形代数の狭い範囲、Conceptデータ、検証、静的教材、prerequisite graph
- **MVP v1.5**: Lesson / Claim / Exerciseの責務分離、2 Conceptの実用的な教材密度、claim-level provenance（現在地）
- **v2**: 小学算数から大学初年級までのConcept DAGと学習経路
- **v3**: 理解度診断、adaptive learning、問題推薦、AI tutorなど

アカウント、DB、LLM API、動画生成、LMSなどはMVP v1の対象外です。
