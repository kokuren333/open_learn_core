# Open Learn Core — MVP v1.6 Specification

## 0. この文書の目的

本仕様書は、`open_learn_core` の MVP v1.5 を改善し、MVP v1.6 を実装するための Codex / coding agent 向け実装指示書である。

MVP v1.6 の目的は、単に Concept / Lesson / Claim / Exercise を構造化することではない。

**「その教材が、なぜその内容・構造・順序になっているのかを、根拠まで遡って説明可能にする」**

ことを目的とする。

既存の以下の思想を統合する。

- `open_learn_core`
  - Concept-based knowledge architecture
  - prerequisite graph
  - Concept / Lesson / Claim / Exercise の責務分離
  - machine-readable curriculum
  - schema validation
  - static renderer

- `evidence-note-generater-skill`
  - 検索戦略を明示する
  - 信頼性の高い情報源を優先する
  - 採用・除外理由を記録する
  - 生成文そのものを根拠とみなさない
  - claim と evidence/source を追跡可能にする
  - 不確実な部分は不確実と明示する
  - evidence が不足している場合に、それを隠さない

MVP v1.6 では、これらを統合し、

**Evidence-backed Knowledge Graph + Learning Content System**

として成立するかを検証する。

---

# 1. 長期ロードマップ

## MVP v1

狭い数学分野について、

- Concept
- prerequisite
- Curriculum
- Web renderer
- validator

を実装し、

「数学知識を機械可読に構造化して教材へ変換できるか」

を検証した。

## MVP v1.5

Concept 内部をさらに、

- Lesson
- Claim
- Exercise
- Diagnostic Question
- Source

へ分離し、

「知識概念と教え方を分けて扱えるか」

を検証した。

## MVP v1.6

今回。

MVP v1.5 に Evidence Layer を追加し、

- どの資料を調べたか
- なぜその資料を採用したか
- なぜ別資料を除外したか
- 各 Claim は何に基づくか
- prerequisite edge はなぜ存在するか
- Curriculum の順序はなぜそうしたか
- 数学的事実と教育上の判断を区別できるか
- 不確実な教育判断を不確実として保持できるか

を machine-readable に管理する。

## MVP v2

小学算数から大学初頭までの数学全体を対象にする。

Concept を数百〜数千規模へ拡張し、

- 分野間接続
- prerequisite network
- 子概念・関連概念
- dependency graph
- 学習経路生成

を実現する。

v1.6 の Evidence Layer は、v2 の巨大な knowledge graph において、

**「なぜこのノードとエッジが存在するのか」**

を保証する基盤となる。

## MVP v3

単なる教科書・参考書の代替ではなく、

**予備校・塾・家庭教師を部分的または全面的に代替可能な無料学習基盤**

を目指す。

将来的には、

- diagnostic assessment
- adaptive learning
- prerequisite remediation
- spaced repetition
- problem recommendation
- mastery estimation
- AI tutor
- personalized curriculum
- entrance-exam preparation
- formative feedback
- misconception detection

等を実装する可能性がある。

---

# 2. MVP v1.6 の中心課題

MVP v1.6 は、次の問いに答えるための実証実験である。

## RQ1

教材内の数学的 Claim を、Evidence / Source へ明示的に追跡可能にできるか。

## RQ2

「この概念にはこの prerequisite が必要」という Knowledge Graph の edge 自体にも根拠を持たせられるか。

## RQ3

「どの順番で教えるか」「何を含めるか」という Curriculum Decision を、数学的事実と区別して管理できるか。

## RQ4

数学的に確定している内容と、教育学的に議論の余地がある判断を分離できるか。

## RQ5

人間またはAIが新しい Concept を追加するとき、

**検索 → Evidence整理 → Claim → Concept → Lesson → Exercise**

という再現可能な authoring pipeline を構築できるか。

## RQ6

v2 で数学全体へ拡張した際にも、教材が「LLMが大量生成した説明文の集合」に退化しない仕組みを作れるか。

---

# 3. 最重要原則

## 3.1 LLM Output is not Evidence

LLM が生成した文章自体を evidence として扱ってはならない。

LLM は、

- 検索
- 抽出
- 要約
- 比較
- 統合
- 教材化

を支援する主体であり、根拠そのものではない。

---

## 3.2 Source と Claim の間に Evidence Layer を置く

v1.5 の

```text
Claim
  ↓
Source
```

を、

```text
Source
  ↓
Evidence Item
  ↓
Claim
```

へ変更する。

Source は資料全体を表す。

Evidence Item は、

**その資料のどの箇所から、何を読み取ったか**

を表す。

Claim は教材内で採用する主張を表す。

---

## 3.3 Mathematical Fact と Pedagogical Decision を区別する

例えば、

「基底とは、線形独立で空間を span する集合である」

と、

「基底を教える前に span を学習させるべきである」

は同じ種類の Claim ではない。

前者は数学上の定義。

後者は教育上の設計判断である。

必ず区別して表現できるようにする。

---

## 3.4 Knowledge Graph Edge も説明可能にする

v2 では prerequisite edge が数千以上になる可能性がある。

単なる

```yaml
prerequisites:
  - span
  - linear-independence
```

ではなく、

**なぜ prerequisite なのか**

を保持できること。

---

## 3.5 不確実性を隠さない

数学的事実について uncertainty を付ける必要は通常ない。

しかし、

- 教える順番
- 直観から教えるべきか
- 形式定義から始めるべきか
- ある前提概念を必須とするか
- どの演習形式が有効か

などの Pedagogical / Curriculum Decision は不確実であり得る。

その場合、

`uncertain`
`mixed`
`provisional`

などの状態を保持可能にする。

---

# 4. MVP v1.6 の対象範囲

既存の線形代数 Concept 群を維持する。

新しい数学範囲を広げることを主目的にしない。

## Primary Demonstration Concept

MVP v1.6 の完全な実証対象として、

**basis**

を使用する。

必要に応じて、

- span
- linear-independence
- dimension

も Evidence Layer の接続確認に利用する。

ただし、全 Concept を同密度に作り込む必要はない。

---

# 5. MVP v1.6 の完成イメージ

`basis` について、最終的に以下を追跡できること。

```text
なぜ basis を学ぶのか
        ↓
Curriculum Decision
        ↓
なぜ span / linear-independence が prerequisite なのか
        ↓
Prerequisite Evidence
        ↓
どの数学的定義・定理を採用したか
        ↓
Claim
        ↓
どの資料のどの箇所を根拠にしたか
        ↓
Evidence Item
        ↓
Source
```

さらに、

```text
Claim
  ↓
Lesson
  ↓
Worked Example
  ↓
Exercise
  ↓
Diagnostic Question
```

まで接続する。

---

# 6. データモデルの追加・改善

既存の v1.5 のデータを可能な限り壊さず拡張すること。

大規模な migration を避ける。

---

# 7. Source

Source は資料そのものを表す。

例：

```yaml
id: mit-ocw-linear-algebra

title: Linear Algebra

provider: MIT OpenCourseWare

type: university_oer

url: https://...

authors:
  - Gilbert Strang

license:
  name: CC BY-NC-SA
  url: ...

language: en

accessed_at: 2026-08-28
```

最低限、

- id
- title
- provider
- type
- url
- license
- language
- accessed_at

を保持できること。

---

# 8. Evidence Review

新規 entity として `EvidenceReview` を導入する。

これは、

**ある Concept / Curriculum Decision を作成する際、どのように資料調査を行ったか**

を記録する。

例：

```yaml
id: review-basis-001

target:
  type: concept
  id: basis

research_question:
  ja: >
    大学初年級の「基底」の教材に、
    どの定義・直観・例・前提概念を含めるべきか。

searched_at: 2026-08-28

search_queries:
  - "MIT linear algebra basis span independence"
  - "OpenStax basis linear independence"
  - "introductory linear algebra basis curriculum"

source_priority:
  - university_oer
  - open_textbook
  - official_curriculum
  - reputable_textbook
  - peer_reviewed_pedagogy

included_sources:
  - source: mit-ocw-linear-algebra
    reason:
      ja: "大学初年級線形代数の代表的公開教材であり、内容確認が可能。"

  - source: openstax-linear-algebra
    reason:
      ja: "オープンライセンスで定義・例題・章構成を比較可能。"

excluded_sources:
  - title: Example Random Blog
    url: https://...
    reason:
      ja: "一次教育資料ではなく、追加価値が限定的。"

limitations:
  - ja: >
      MVPでは教育効果に関する実証研究の網羅的レビューまでは行っていない。
```

---

# 9. Evidence Item

新規 entity として `EvidenceItem` を導入する。

Evidence Item は Source の特定箇所から得た情報を表す。

例：

```yaml
id: evidence-basis-definition-mit-001

source: mit-ocw-linear-algebra

locator:
  type: lecture
  value: "Lecture 4"
  section: "Independence and Basis"

evidence_role: definition

supports:
  - claim-basis-definition

extracted_meaning:
  ja: >
    基底は、ベクトル空間を張り、かつ線形独立なベクトル集合として扱われている。

confidence: high

notes:
  ja: >
    標準的定義であり、OpenStaxの記述とも整合する。
```

`extracted_meaning` は原文転載ではなく、原則として要約・解釈とする。

必要に応じて短い quotation を保持してもよいが、著作権上不必要な長文引用を避ける構造とする。

---

# 10. Claim

既存 Claim を拡張する。

最低限、Claim Type を導入する。

```yaml
claim_type:
  - definition
  - mathematical_fact
  - theorem
  - interpretation
  - prerequisite_claim
  - pedagogical_claim
  - curriculum_claim
  - difficulty_claim
```

例：

```yaml
id: claim-basis-definition

claim_type: definition

statement:
  ja: >
    ベクトル空間の基底とは、その空間を張り、
    かつ線形独立なベクトル集合である。

evidence:
  - evidence-basis-definition-mit-001
  - evidence-basis-definition-openstax-001

status: established
```

---

# 11. Claim Status

Claim に状態を持たせる。

候補：

```yaml
status:
  - established
  - strongly_supported
  - supported
  - provisional
  - uncertain
  - contested
```

数学的定義・定理については通常 `established`。

教育上の判断については evidence に応じて適切に設定する。

---

# 12. Prerequisite Edge の拡張

Concept の prerequisite を単純な ID 配列だけでなく、根拠付き edge として扱えるようにする。

推奨形：

```yaml
prerequisites:
  - concept: span

    relation: required

    rationale:
      ja: >
        基底の定義に「空間を張る」という条件が含まれるため。

    evidence:
      - evidence-basis-prerequisite-span-001

    confidence: high

  - concept: linear-independence

    relation: required

    rationale:
      ja: >
        基底の定義に線形独立性が含まれるため。

    evidence:
      - evidence-basis-prerequisite-independence-001

    confidence: high
```

---

# 13. Prerequisite Relation

将来の v2 を考慮し、relation の種類を限定的に導入する。

最低限：

```yaml
relation:
  - required
  - strongly_recommended
  - helpful
```

MVP v1.6 ではこれ以上増やしすぎない。

---

# 14. Curriculum Decision

新規 entity として `CurriculumDecision` を導入する。

これは、

- なぜ Concept を含めるのか
- なぜこの順番なのか
- なぜある項目を後回しにしたのか

を記録する。

例：

```yaml
id: decision-basis-after-independence

scope:
  curriculum: linear-algebra-basic

question:
  ja: >
    basis を linear-independence より後に配置するべきか。

decision:
  ja: >
    linear-independence を先に配置する。

rationale:
  ja: >
    basis の定義自体が線形独立性を前提とするため。

claim_type: curriculum_claim

evidence:
  - evidence-basis-order-mit-001
  - evidence-basis-order-openstax-001

alternatives:
  - option:
      ja: "basis と linear-independence を同一Lessonで導入する"
    rejected_reason:
      ja: >
        MVPでは概念依存関係を明示的に保つ設計を優先した。

status: supported
```

---

# 15. Known / Uncertain の区別

Evidence Review または Curriculum Decision に、

```yaml
known:
  - ...

uncertain:
  - ...

open_questions:
  - ...
```

を持てるようにする。

例：

```yaml
known:
  - ja: >
      基底の定義には span と linear independence が必要である。

uncertain:
  - ja: >
      初学者には代数的定義と幾何学的直観のどちらを先に提示する方が
      学習効果が高いかは、このMVPでは十分検証していない。
```

---

# 16. Lesson

v1.5 の Lesson 設計は維持する。

ただし Lesson Section から Claim を参照できるだけでなく、

**そのLessonで何を根拠として教えているか**

をUI上で表示可能にする。

例：

```yaml
sections:
  - id: basis-definition

    title:
      ja: 定義

    body:
      ja: ...

    claims:
      - claim-basis-definition
```

---

# 17. Worked Example

MVP v1.6 の `basis` では、単一の例だけで終わらせない。

最低限、

- Positive Example
- Counterexample
- Worked Example

を区別する。

例：

```yaml
examples:
  - id: basis-example-standard-r2

    type: worked

    difficulty: basic

    prompt:
      ja: >
        R² において (1,0), (0,1) が基底であることを確認せよ。

    steps:
      - ja: "まず span を確認する。"
      - ja: "次に linear independence を確認する。"
      - ja: "両方を満たすため基底である。"

    concepts_used:
      - span
      - linear-independence
```

---

# 18. Exercise

MVP v1.6 の basis について最低限：

- basic × 5
- standard × 5
- challenge × 2

を用意する。

各 Exercise は可能なら、

```yaml
tests_claims:
  - claim-basis-definition

requires_concepts:
  - span
  - linear-independence
```

を保持する。

---

# 19. Diagnostic Question

basis について最低3問用意する。

目的は点数評価ではなく、

**どの prerequisite が欠けているかを推測できる構造**

を試すこと。

例：

```yaml
id: diagnostic-basis-001

question:
  ja: >
    ベクトル集合が空間全体を span していれば、
    必ず基底と言えるか。

answer: false

diagnoses:
  incorrect:
    possible_missing_concepts:
      - linear-independence

    feedback:
      ja: >
        基底には span だけでなく線形独立性も必要です。
```

---

# 20. Misconception

basis について最低5件用意する。

例：

- 基底は一意である
- span すれば必ず基底である
- ベクトル数が次元と同じなら必ず基底である
- 標準基底だけが基底である
- 基底ベクトルは互いに直交しなければならない

各 misconception は、

- related claim
- corrective explanation
- optional diagnostic question

へ接続可能にする。

---

# 21. ディレクトリ構造

既存 repo の構造を尊重しつつ、以下に近い形へ拡張する。

```text
/
├─ data/
│  ├─ concepts/
│  ├─ curricula/
│  ├─ lessons/              # 必要なら分離
│  ├─ claims/
│  ├─ exercises/
│  ├─ diagnostics/
│  ├─ sources/
│  ├─ evidence/
│  │  ├─ reviews/
│  │  └─ items/
│  └─ curriculum-decisions/
│
├─ schemas/
│  ├─ concept.schema.json
│  ├─ lesson.schema.json
│  ├─ claim.schema.json
│  ├─ exercise.schema.json
│  ├─ diagnostic.schema.json
│  ├─ source.schema.json
│  ├─ evidence-review.schema.json
│  ├─ evidence-item.schema.json
│  └─ curriculum-decision.schema.json
│
├─ src/
│  ├─ validation/
│  ├─ graph/
│  ├─ evidence/
│  └─ web/
│
├─ docs/
│  ├─ design.md
│  ├─ evidence-model.md
│  └─ authoring-workflow.md
│
└─ tests/
```

既存 v1.5 が Concept JSON 内に lessons / claims / exercises を埋め込んでいる場合、

MVP v1.6 では、

**少なくとも evidence / source / curriculum decision は独立ファイル化すること。**

Lessons / Claims / Exercises を完全分離するかは、既存コードへの影響を評価して決めてよい。

ただし設計判断を `docs/design.md` に明記する。

---

# 22. Validator の拡張

以下を検証する。

## Existing

- duplicate Concept ID
- broken prerequisite reference
- prerequisite cycle
- broken related reference
- curriculum Concept reference
- Lesson → Exercise
- Section → Claim
- Claim → Source

## New

### Evidence Item

- source が存在する
- supports の Claim が存在する
- locator が空でない
- evidence_role が schema 上有効

### Claim

- evidence reference が存在する
- claim_type が有効
- status が有効

### Prerequisite Edge

- concept reference が存在する
- evidence reference が存在する場合、そのEvidenceが存在する
- relation が有効

### Curriculum Decision

- curriculum reference が存在する
- evidence reference が存在する
- status が有効

### Evidence Review

- target が存在する
- included source が存在する
- duplicated source entry を検出可能
- searched_at が存在する

---

# 23. Evidence Coverage Check

新しい validator/report を追加する。

例：

```bash
npm run evidence:report
```

出力例：

```text
Evidence Coverage Report

Concept: basis

Claims
  8 total
  8 with evidence
  coverage: 100%

Prerequisite edges
  2 total
  2 with rationale
  2 with evidence
  coverage: 100%

Curriculum decisions
  2 total
  2 with evidence

Lessons
  5 total
  5 linked to claims
```

この report は v2 で大量生成した際の品質確認に使う。

---

# 24. Evidence Quality は自動採点しない

重要。

Source の質を単純な numeric score で自動判定しない。

例えば、

```yaml
quality_score: 0.83
```

のような疑似精密性は避ける。

必要なら categorical metadata を使う。

例：

```yaml
source_type:
  - official_curriculum
  - university_oer
  - open_textbook
  - peer_reviewed_research
  - reputable_textbook
  - secondary_explanation
```

---

# 25. Authoring Workflow

`docs/authoring-workflow.md` を作成する。

新しい Concept を追加する標準フローを定義する。

最低限：

```text
1. Research Question 定義
        ↓
2. Source Search
        ↓
3. Evidence Review 作成
        ↓
4. Evidence Item 抽出
        ↓
5. Claim 作成
        ↓
6. Concept / prerequisite edge 作成
        ↓
7. Curriculum Decision
        ↓
8. Lesson 作成
        ↓
9. Examples / Exercises
        ↓
10. Diagnostics / Misconceptions
        ↓
11. Validator
        ↓
12. Evidence Coverage Report
        ↓
13. Web Renderer
```

---

# 26. AI Agent を Contributor として扱う

将来的な AI authoring を見据え、

「AIに教材を書かせる」

のではなく、

**AIをOSS教材開発の contributor として扱う**

設計にする。

AI Agent が新 Concept を追加する場合、

単純に本文を生成して終了してはならない。

少なくとも、

- search log
- evidence review
- claim
- source link
- prerequisite rationale
- validation

を生成する。

---

# 27. Evidence Note Generator との関係

既存 `evidence-note-generater-skill` を直接 dependency にする必要はない。

今回取り込むのは主に思想とworkflowである。

将来的には、

```text
evidence-note-generater
        ↓
generic evidence-research skill
        ↓
open_learn_core authoring pipeline
```

のように一般化できる。

MVP v1.6 では外部repoへのruntime dependencyを作らない。

---

# 28. Web UI の改善

MVP v1.6 では派手なUIを作らない。

ただし basis ページで、最低限以下を表示する。

## Main Learning View

- Concept title
- prerequisite
- learning objectives
- Lesson
- worked examples
- exercises
- diagnostics
- misconceptions

## Evidence View

折りたたみ等でよいので、

- Claim
- Claim type
- Supporting Evidence
- Source
- Locator
- Status

を閲覧可能にする。

例：

```text
この記述の根拠

Claim:
「基底は span かつ線形独立な集合である」

Evidence:
MIT OCW — Lecture 4
OpenStax — Section ...

Status:
Established
```

---

# 29. Prerequisite Graph UI

Graph edge を選択または展開したとき、

可能なら、

```text
basis
  ↑ requires
linear-independence

理由:
基底の定義に線形独立性が含まれるため

Evidence:
MIT OCW ...
```

を表示できるようにする。

MVPなので高度なinteractionは不要。

---

# 30. Curriculum Decision UI

必須ではないが、可能なら Curriculum ページで、

「なぜこの順番なのか」

を表示できるようにする。

例：

```text
Linear Independence
        ↓
Basis

Reason:
Basis の定義には Linear Independence が必要

Evidence:
MIT OCW
OpenStax
```

---

# 31. basis の教材品質

MVP v1.6 の basis は、

**第三者がこのページだけで概念を理解し、基礎問題を解ける**

程度まで作り込む。

最低限 Lesson は以下を含む。

1. 直観
2. 定義
3. span との関係
4. linear independence との関係
5. R² の基底
6. 非基底の例
7. 判定方法
8. 座標表示
9. dimension との関係

Lesson数そのものは固定しない。

内容の自然さを優先する。

---

# 32. basis の Examples

最低限：

- 標準基底
- 非標準基底
- span するが基底ではない例
- linear independent だが空間全体の基底ではない例
- R²
- R³

を含める。

---

# 33. basis の Exercises

最低12問。

- basic: 5
- standard: 5
- challenge: 2

全問に解答と解説を付ける。

少なくとも一部の問題で、

**どの prerequisite / claim を確認しているか**

を metadata として持つ。

---

# 34. basis の Diagnostics

最低3問。

誤答時に、

- span不足
- linear-independence不足
- dimension理解不足

などを推定できるようにする。

---

# 35. basis の Evidence

最低2種類以上の良質な公開資料を使う。

推奨：

- university OER
- open textbook

可能なら3資料以上比較する。

ただし数を増やすこと自体を目的にしない。

---

# 36. Curriculum Evidence

`linear-algebra-basic` について少なくとも、

- basis の位置
- linear-independence の位置
- dimension の位置

のどれか1〜2個を Curriculum Decision として実証する。

---

# 37. v1.6 でやらないこと

以下は今回実装しない。

- 小学〜大学数学全体
- graph database
- vector database
- user account
- login
- cloud backend
- adaptive learning engine
- mastery model
- spaced repetition
- AI tutor
- LLM API integration
- automatic web crawling infrastructure
- full systematic review engine
- automatic citation extraction from arbitrary PDFs
- recommendation engine
- entrance exam database
- video generation
- BiimSlideMaker integration
- mobile app
- CMS
- monetization

---

# 38. 実装上の重要な注意

## DO NOT

「将来必要になる」という理由だけで大規模な抽象化をしない。

## DO NOT

Evidence を形式的に埋めるだけのダミーデータにしない。

## DO NOT

Source URL があるだけで「evidence-backed」と判断しない。

## DO NOT

数学的事実と教育上の設計判断を混同しない。

## DO NOT

不明な教育的効果を断定しない。

## DO NOT

LLMの一般知識だけで citation locator を捏造しない。

---

# 39. README 更新

README に以下を追加する。

## What changed in v1.6

- Evidence Review
- Evidence Item
- Claim Type
- Claim Status
- Evidence-backed prerequisite
- Curriculum Decision
- Evidence Coverage Report

## Architecture

```text
Source
  ↓
Evidence Review
  ↓
Evidence Item
  ↓
Claim
  ↓
Concept
  ↓
Lesson
  ↓
Exercise / Diagnostic

Curriculum Decision
        ↓
Curriculum / Prerequisite Graph
```

## Why Evidence Matters

このプロジェクトが単なるAI生成教材ではなく、

**判断過程・根拠・不確実性まで公開するOSS教育基盤**

を目指していることを説明する。

---

# 40. docs/evidence-model.md

新規作成する。

以下を説明する。

- Source
- Evidence Review
- Evidence Item
- Claim
- Claim Type
- Claim Status
- Curriculum Decision
- Prerequisite Evidence
- uncertainty

簡単な具体例として basis を使う。

---

# 41. docs/design.md 更新

v1.5 → v1.6 の変更点を追記する。

特に、

**Concept / Lesson / Evidence は異なる責務を持つ**

ことを明示する。

---

# 42. テスト

最低限以下を追加する。

## Evidence Item

- valid evidence item passes
- missing source fails
- missing claim fails

## Claim

- valid claim + evidence passes
- invalid claim type fails
- broken evidence reference fails

## Prerequisite

- valid evidence-backed edge passes
- broken concept fails
- invalid relation fails

## Curriculum Decision

- valid decision passes
- broken curriculum reference fails
- broken evidence reference fails

## Evidence Review

- included source validation
- target validation

## Coverage

- basis の evidence coverage が expected threshold を満たす

---

# 43. Acceptance Criteria

MVP v1.6 は以下を満たした場合に完成とする。

### AC1

Source と Evidence Item が別 entity として存在する。

### AC2

Evidence Review が存在し、検索戦略・採用資料・除外理由を保持できる。

### AC3

Claim が Evidence Item を参照できる。

### AC4

Claim Type を区別できる。

### AC5

Claim Status / uncertainty を保持できる。

### AC6

Prerequisite edge が rationale を持てる。

### AC7

Prerequisite edge が Evidence を参照できる。

### AC8

Curriculum Decision を machine-readable に保存できる。

### AC9

Evidence Review / Evidence Item / Claim / Curriculum Decision の validator が存在する。

### AC10

Evidence Coverage Report が出力できる。

### AC11

basis が第三者が学習可能な密度まで作り込まれている。

### AC12

basis に最低12問の Exercise がある。

### AC13

basis に最低3問の Diagnostic Question がある。

### AC14

basis に最低5件の Misconception がある。

### AC15

basis の主要 Claim に evidence が付いている。

### AC16

basis の主要 prerequisite edge に rationale がある。

### AC17

少なくとも1件の Curriculum Decision が実装されている。

### AC18

Web UI から Claim → Evidence → Source を確認できる。

### AC19

README と docs が v1.6 architecture を説明している。

### AC20

既存 v1.5 の Concept graph / renderer / validator が壊れていない。

---

# 44. MVP v1.6 の評価基準

優先順位：

```text
Evidence architecture      30%
Knowledge architecture     20%
Traceability               20%
教材品質                   15%
Validation                 10%
UI                          5%
```

UIは最低限でよい。

最重要なのは、

**なぜこの教材がこの形なのかを機械的に追跡できること。**

---

# 45. 実装開始手順

最初に既存 repository を確認する。

その後、

1. 現在の v1.5 architecture を把握
2. migration plan を `docs/design.md` に記載
3. Evidence Review schema
4. Evidence Item schema
5. Claim schema 拡張
6. prerequisite schema 拡張
7. Curriculum Decision schema
8. validator 拡張
9. basis Evidence Review 作成
10. Source 調査
11. Evidence Item 作成
12. basis Claim 更新
13. prerequisite edge 更新
14. Curriculum Decision 作成
15. basis Lesson 拡充
16. Examples 作成
17. Exercises 12問以上
18. Diagnostics 3問以上
19. Misconceptions 5件以上
20. Evidence Coverage Report
21. Web Evidence View
22. tests
23. README
24. docs/evidence-model.md
25. 最終 validation

の順に進める。

---

# 46. 最終確認

実装終了時に、Codex自身で以下を確認する。

```text
Can I answer:

1. Why is "basis" included?
2. Why does basis require span?
3. Why does basis require linear independence?
4. What sources support the definition?
5. Which exact evidence items support each major claim?
6. Which decisions are mathematical facts?
7. Which decisions are pedagogical choices?
8. Which choices remain uncertain?
9. Which lesson teaches each claim?
10. Which exercises test each important claim?
```

この10問に repository 内の machine-readable data だけを用いて回答できない場合、

MVP v1.6 は未完成とみなす。

---

# 47. Definition of Done

MVP v1.6 のゴールは、

**「引用付き教材を作ること」ではない。**

ゴールは、

> Source → Evidence → Claim → Concept → Lesson → Assessment  
> および  
> Evidence → Curriculum Decision → Knowledge Graph

という二つの経路を成立させ、

**数学教材の内容と教育設計の双方を追跡可能にすること**

である。

この構造が `basis` で完全に成立すれば、MVP v1.6 は成功とする。

その後、MVP v2 で小学算数〜大学初頭数学の全体 Knowledge Graph へ拡張する。
