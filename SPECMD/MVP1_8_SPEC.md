# Open Learn Core — MVP v1.8 Specification
## Deep Explanation & Semantic Quality

---

# 0. この文書の目的

本仕様書は `open_learn_core` の MVP v1.7 を改善し、MVP v1.8 を実装するための Codex 向け実装指示書である。

MVP v1.7 では以下の構造を実装した。

- Evidence-first authoring pipeline
- Skill architecture
- Source discovery
- Source appraisal
- Evidence extraction
- Claim building
- Pedagogy planning
- Explanation writing
- Example / Exercise / Diagnostic generation
- Infographic design
- Math / Evidence / Pedagogy / Visual / Completeness audit
- Publish Gate
- working / durable / published artifact lifecycle

しかし現状の問題は明確である。

**パイプラインとファイル構成は存在するが、生成される教材本文が依然として薄い。**

特に `basis` では、

- motivation はあるが短い
- intuition はあるが短い
- formal definition はあるが展開が浅い
- lesson は複数あるが各sectionが短い
- example数はあるが説明が浅い
- auditは主にpresence/count/reference checkであり、意味的品質を十分に評価していない

という問題が残っている。

MVP v1.8 の目的はこれを解消することである。

---

# 1. MVP v1.8 の中心テーマ

MVP v1.8 のテーマは、

**Deep Explanation & Semantic Quality**

である。

新しい大規模なSchemaやBackendを追加することは主目的ではない。

重点は以下の4点に置く。

1. 説明生成Skillを本格化する
2. 教え方設計Skillを本格化する
3. 例題・図解Skillを本格化する
4. Codexによる意味的レビューをPublish Gateの正式要件にする

---

# 2. MVP v1.8 のゴール

MVP v1.8 のゴールは、

> `basis` を「短い説明カードの集合」から、「初学者がこの教材だけで理解・演習できる授業単位」へ変換すること

である。

さらに重要なのは、

> その品質を偶然ではなく、Skill Contract と Semantic Audit により再現可能にすること

である。

---

# 3. 長期ロードマップ上の位置付け

## MVP v1
Concept graph

## MVP v1.5
Concept / Lesson / Claim / Exercise 分離

## MVP v1.6
Evidence Layer

## MVP v1.7
Evidence-based authoring pipeline + Skills + Publish Gate

## MVP v1.8
今回。

**Deep Explanation + Semantic Audit**

## MVP v2
小学算数〜大学初頭の数学全体へ拡張

## MVP v3
予備校・塾代替レベルの学習システム

---

# 4. MVP v1.8 で解決する問題

## Problem 1
Skillファイルが短すぎて、役割名だけになっている。

## Problem 2
Explanation Writer が「十分な説明」をどう作るか具体的に定義されていない。

## Problem 3
Pedagogy Auditor が「項目があるか」を主に確認しており、理解可能性を評価していない。

## Problem 4
Math Auditor が文字列や参照の存在確認に寄り、数学的意味を再検討していない。

## Problem 5
Completeness Audit が個数中心で、内容の深さを評価していない。

## Problem 6
Lesson が短いカードとして分断され、学習体験が連続していない。

## Problem 7
Exampleはあるが、なぜその例が重要なのか・何を見るべきかが弱い。

## Problem 8
Infographicが正式要素になったが、視覚的説明の設計ルールが弱い。

---

# 5. 最重要原則

## 5.1 Presence is not Quality

以下は禁止。

```text
motivation exists = PASS
intuition exists = PASS
definition exists = PASS
```

存在するだけでは品質とみなさない。

各sectionの学習上の役割を評価すること。

---

## 5.2 Length is not Quality

文字数だけで品質判定してはならない。

ただし極端な短さを防ぐ soft threshold は使用してよい。

---

## 5.3 Explanation Must Bridge Concrete and Abstract

説明は原則として、

```text
Problem
↓
Concrete Case
↓
Observed Pattern
↓
Intuition
↓
Formalization
↓
Definition
↓
Worked Application
↓
Counterexample
↓
Connection
```

のどこかを明示的に通る。

いきなり抽象定義だけを提示しない。

---

## 5.4 Auditors Must Perform Semantic Review

CodexのAuditor Skillは、単なるscript validatorではない。

以下の問いに答える。

- この説明は本当にわかるか
- 論理が飛んでいないか
- 例は概念を明らかにしているか
- 初学者が誤解しないか
- 数学的に正しいか
- EvidenceがClaimを本当に支えているか

---

## 5.5 Deterministic Validation and Semantic Audit Must Be Separate

JS/Node側:

- schema
- count
- broken reference
- cycle
- missing fields

Codex Skill側:

- mathematical meaning
- clarity
- explanatory depth
- pedagogy
- evidence interpretation
- visual correctness

両者を混同しない。

---

# 6. v1.8 で新規追加するSkill

最低限以下を追加する。

```text
.agents/skills/
└─ openlearn-explanation-auditor/
   └─ SKILL.md
```

必要なら以下も追加してよい。

```text
openlearn-lesson-architect
openlearn-proof-explainer
openlearn-notation-auditor
```

ただしSkillの乱造は避ける。

---

# 7. Explanation Writer Skill を全面改訂する

`openlearn-explanation-writer/SKILL.md` は数行のrole descriptionでは不十分。

最低限、以下の内容を持つ詳細Skillへ書き直す。

---

# 8. Explanation Writer — Required Workflow

各Concept / Lessonについて以下を順に検討する。

## Step 1: Learner State

確認する。

- learner level
- assumed prerequisites
- symbols already known
- vocabulary already known
- likely misconceptions
- learning objective

---

## Step 2: Why This Concept Exists

最初に、

**何を解決するための概念か**

を明確にする。

単なる歴史説明ではなく、数学上の必要性を示す。

basis例:

- 空間内のすべてのベクトルを列挙できない
- 少数の「材料」で空間全体を表したい
- ただし冗長な材料は避けたい

---

## Step 3: Concrete Case

抽象定義の前に、可能なら具体例を1つ提示する。

basis:

```text
R²の任意のベクトル (x,y) は
(1,0) と (0,1) を使って
x(1,0)+y(0,1)
と書ける。
```

---

## Step 4: Failure Cases

少なくとも2種類の失敗を見せる。

basis:

### insufficient
(1,0) だけ
→ R²全体を作れない

### redundant
(1,0), (0,1), (1,1)
→ 作れるが冗長

---

## Step 5: Extract the Pattern

具体例から、

```text
十分である
+
冗長でない
```

というパターンを言語化する。

---

## Step 6: Introduce Formal Vocabulary

その後で、

```text
十分である → span
冗長でない → linear independence
```

と接続する。

---

## Step 7: Formal Definition

正確な定義を提示する。

---

## Step 8: Unpack the Definition

定義を条件ごとに分解する。

basis:

```text
Condition A: spanする
Condition B: linear independent
```

それぞれ、

- 意味
- なぜ必要か
- 欠けると何が起こるか

を説明する。

---

## Step 9: Re-Apply to Initial Example

最初の具体例へ戻る。

```text
(1,0),(0,1)
はspanする
かつlinear independent
だからbasis
```

---

## Step 10: Near-Miss Examples

定義の片方だけを満たす例を出す。

---

## Step 11: Worked Example

途中過程を省略せず、判定手順を示す。

---

## Step 12: Misconception Check

典型的誤解を明示する。

---

## Step 13: Connection

次のConceptへの接続を示す。

basisなら:

- coordinate
- dimension
- matrix representation

---

## Step 14: Recap

最後に3〜5項目で、

「何を理解できればよいか」

をまとめる。

---

# 9. Lesson Architecture

v1.8 ではLessonを「短い説明カード」として扱わない。

1 Lesson は1つの学習ゴールを達成するまとまりとする。

basis推奨Lesson構造:

## Lesson 1 — Why Basis?
- problem
- concrete motivation
- insufficient set
- redundant set
- intuition

## Lesson 2 — Formal Definition
- prerequisite recall
- span
- independence
- definition
- condition-by-condition unpacking

## Lesson 3 — Identifying a Basis
- decision procedure
- worked examples
- near misses
- common mistakes

## Lesson 4 — Coordinates and Basis
- coordinate representation
- basis dependence
- worked example

## Lesson 5 — Basis and Dimension
- number of basis vectors
- relation to dimension
- examples
- next concept

---

# 10. Lesson Internal Structure

各Lessonは可能な限り次のblock typeを使用する。

```text
problem
motivation
recall
intuition
definition
explanation
example
counterexample
worked_example
checkpoint
misconception
connection
summary
visual
```

単一の巨大`body` stringに全てを押し込まない。

既存Schemaがsection structureを持つ場合、それを拡張する。

大規模migrationは避ける。

---

# 11. Explanation Density Soft Threshold

文字数だけでqualityを決めないが、極端な薄さを排除するためsoft thresholdを設定する。

日本語教材の目安:

```text
motivation:
  recommended 150–500 chars

intuition:
  recommended 300–900 chars

formal definition + unpacking:
  recommended 400–1200 chars

worked example:
  recommended 500–1600 chars

misconception section:
  recommended 300–800 chars

primary lesson:
  recommended 1500–3500 chars
```

soft threshold未満の場合、自動failではなくAuditorが理由を確認する。

---

# 12. Explanation Writer 禁止事項

禁止:

- 定義1文だけ
- 「つまり〜です」で終わる
- 同じ内容の言い換えによる水増し
- 例の答えだけ提示
- 式変形を途中で飛ばす
- 未定義語を使う
- prerequisiteを参照だけして説明しない
- 「明らか」「自明」で飛ばす
- formalとintuitionを混同
- 誤った幾何学的比喩
- Wikipedia風の百科事典説明だけで終える

---

# 13. Pedagogy Synthesizer を全面改訂する

`openlearn-pedagogy-synthesizer` は単なるsequence listを出すだけでは不十分。

最低限以下を設計する。

- target learner
- prior knowledge activation
- motivating problem
- concrete first example
- abstraction timing
- definition timing
- example progression
- counterexample strategy
- misconception strategy
- retrieval checkpoints
- assessment alignment
- visual placement
- connection to next concept

---

# 14. Pedagogy Plan Schema

例:

```yaml
concept: basis

target:
  level: university_introductory

instructional_strategy:
  approach: concrete_to_abstract

entry_problem:
  ja: >
    R²のすべてのベクトルを、できるだけ少ないベクトルを使って表すにはどうすればよいか。

prior_knowledge_activation:
  - span
  - linear-independence

sequence:
  - problem
  - concrete_example
  - failure_insufficient
  - failure_redundant
  - intuition
  - formal_definition
  - worked_example
  - counterexample
  - checkpoint
  - connection

visual_strategy:
  - compare spanning/dependent/independent/basis
  - show coordinate change

assessment_strategy:
  - recognition
  - explanation
  - calculation
  - transfer
```

---

# 15. Example Designer を本格化する

各exampleは必ず学習上の役割を持つ。

metadata例:

```yaml
type: counterexample
purpose:
  ja: spanだけではbasisにならないことを示す
target_claim:
  - claim-basis-definition
contrast_with:
  - example-standard-basis-r2
what_to_notice:
  ja: >
    空間全体は作れるが、3本目が他の2本から作れてしまう点を見る。
```

---

# 16. Example Progression

basisでは最低限以下の順序を検討する。

1. canonical positive
2. insufficient
3. redundant
4. non-standard positive
5. R³
6. coordinate application
7. transfer / unfamiliar example

単なるランダム例題集にしない。

---

# 17. Worked Example Contract

Worked Exampleは最低限:

- question
- goal
- plan
- step-by-step reasoning
- intermediate checks
- final conclusion
- why this works
- common wrong path

を含む。

---

# 18. Exercise Designer 改訂

Exerciseは以下のタイプを区別できるようにする。

```text
recognition
definition_recall
calculation
explanation
error_detection
counterexample_construction
transfer
synthesis
```

basisの15問はタイプを偏らせない。

---

# 19. Exercise Quality Rules

問題数だけでpassにしない。

各major learning objectiveについて最低1問以上。

少なくとも:

- recognition
- calculation
- explanation
- error detection
- transfer

を含む。

---

# 20. Diagnostic Quality Rules

Diagnosticは、

「間違えたら何が不足しているか」

が明示されること。

単なる小テストとの差別化を維持する。

---

# 21. Infographic Designer を本格化する

Visualは学習設計と接続する。

各Visualに最低限:

- learning goal
- concept
- target claim
- learner question
- layout logic
- labels
- visual encoding
- misconception risk
- alt text
- lesson placement

を持たせる。

---

# 22. Infographic Brief Example

```yaml
id: visual-basis-span-independence

learning_goal:
  ja: >
    basisにはspanとlinear independenceの両方が必要であると理解する。

learner_question:
  ja: >
    「空間全体を作れる」だけでは、なぜbasisではないのか。

layout:
  type: three_panel_comparison

panels:
  - title: insufficient
    meaning: independent_but_not_spanning

  - title: redundant
    meaning: spanning_but_dependent

  - title: basis
    meaning: spanning_and_independent

labels:
  required:
    - span
    - independent
    - basis

misconception_risk:
  - >
    orthogonalでなければbasisではないと誤解させないこと
```

---

# 23. Visual Auditor を強化する

Visual Auditorは以下を意味的に確認する。

- 視覚表現が数学的に正しいか
- 位置や角度が不要な条件を暗示していないか
- ラベルは定義と一致するか
- 色や配置だけに意味を依存していないか
- 図が本文と矛盾しないか
- 図を見ただけで誤概念を形成しないか
- alt textが図の学習内容を説明しているか

---

# 24. Math Auditor を本格化する

Math Auditorは deterministic script ではなくCodex Skillとしてsemantic reviewを行う。

最低限:

## Definitions
- 定義が正確か
- 必要条件/十分条件を取り違えていないか

## Examples
- 本当に条件を満たすか
- counterexampleが本当に反例か

## Worked Solutions
- 全stepが正しいか
- hidden assumptionがないか
- 記号が一貫しているか

## Connections
- dimension / coordinate / matrix等との関係が正しいか

## Language
- intuitionがformal statementを歪めていないか

---

# 25. Evidence Auditor を強化する

以下を意味的に確認する。

- Sourceが実際にClaimをsupportするか
- locatorがClaimに対応しているか
- Sourceの主張範囲を超えていないか
- pedagogical claimのcertaintyが適切か
- source間の差異を無視していないか
- Evidenceを後付け引用として使っていないか

---

# 26. Pedagogy Auditor を強化する

以下を評価する。

## Entry
- learnerが「何を学ぶか」を理解できるか
- motivationが実質的か

## Flow
- concrete → abstract の橋があるか
- abrupt abstractionがないか
- prerequisite activationが適切か

## Explanation
- 定義の各条件が説明されているか
- whyが説明されているか

## Examples
- progressionがあるか
- contrastが機能しているか

## Misconceptions
- 典型誤解を先回りしているか

## Assessment
- learning objectiveと一致しているか

## Cognitive Load
- 一度に新しい概念を詰め込みすぎていないか

---

# 27. Explanation Auditor を新設する

`openlearn-explanation-auditor`

これはv1.8の重要追加。

Pedagogy全体ではなく、文章・説明そのものを評価する。

チェック項目:

- 前提なしに段落を追えるか
- referentが曖昧でないか
- 新語の導入があるか
- 記号を説明しているか
- 「何」「なぜ」「どう使う」が揃っているか
- 定義がparaphraseされているか
- concreteとabstractの橋があるか
- reasoning stepが飛んでいないか
- exampleが何を示すか明示されているか
- counterexampleが条件との差を明らかにしているか
- 言い換えだけの水増しがないか
- sectionごとに明確な役割があるか

出力:

```yaml
status: pass | fail
issues:
  - severity: critical | major | minor
    lesson:
    section:
    problem:
    rationale:
    suggested_fix:
```

---

# 28. Completeness Auditor を改訂する

単なるcount checkerから、

**coverage + depth checker**

へ変更する。

例:

```text
Motivation
  exists: yes
  explains_problem: yes
  depth: sufficient

Intuition
  exists: yes
  concrete_bridge: yes
  depth: sufficient

Formal Definition
  exists: yes
  unpacked: yes
  conditions_explained: yes

Worked Example
  count: 4
  stepwise: 4/4
  purpose_explicit: 4/4
```

---

# 29. Deterministic Audit の責務を縮小する

`src/quality/audits.mjs` 等の deterministic code は以下に限定する。

- required section existence
- count
- broken reference
- schema
- missing alt
- missing audit artifact
- publish status

「理解しやすいか」「数学的に正しいか」をJS文字列チェックだけで判定しない。

---

# 30. Semantic Audit Artifacts

各Conceptについて以下を `_working/<concept>/audit/` に保存する。

```text
math.yaml
evidence.yaml
pedagogy.yaml
explanation.yaml
visual.yaml
completeness.yaml
```

各artifactは:

- auditor name
- evaluated artifact version/hash if possible
- status
- issues
- summary
- timestamp

を持つ。

---

# 31. Semantic Audit Freshness

教材内容が変更された場合、古いAudit結果をそのまま利用してはいけない。

可能ならcontent hashを保存する。

例:

```yaml
artifact_hash: sha256:...
```

hashが一致しないAuditはstaleとしてPublish Gateを通さない。

---

# 32. Publish Gate v1.8

以下全て必須。

## Deterministic
- schema pass
- references pass
- counts pass
- required artifacts exist

## Semantic
- math audit pass
- evidence audit pass
- pedagogy audit pass
- explanation audit pass
- visual audit pass
- completeness audit pass

## Freshness
- semantic audit hash matches current content

---

# 33. Fix Loop v1.8

Audit fail時に対応Skillへ戻す。

```text
explanation fail
→ explanation-writer

pedagogy fail
→ pedagogy-synthesizer + explanation-writer

math fail
→ relevant writer/designer

visual fail
→ infographic-designer

evidence fail
→ evidence-extractor/source work

completeness fail
→ missing content skill
```

最大3loop。

3回で解決しない場合:

```text
status: blocked
```

としpublishしない。

---

# 34. basis のv1.8再生成

既存basisをそのまま少し追記するだけで終わらせない。

v1.8 Skill workflowを用いて、basis教材を再構成する。

最低Lesson:

1. Why Basis?
2. Span and Independence
3. Formal Definition
4. How to Test a Basis
5. Coordinates in a Basis
6. Basis and Dimension

必要に応じて変更可能。

---

# 35. basis Lesson 1 要件

## Why Basis?

最低限:

- problem introduction
- R² concrete case
- insufficient set
- redundant set
- intuition
- term preview
- checkpoint

---

# 36. basis Lesson 2 要件

## Span and Independence

最低限:

- prerequisite recall
- span explanation
- independence explanation
- side-by-side contrast
- near-miss examples
- visual
- checkpoint

---

# 37. basis Lesson 3 要件

## Formal Definition

最低限:

- exact definition
- condition A
- condition B
- why both
- reapply to standard basis
- non-standard basis
- counterexamples

---

# 38. basis Lesson 4 要件

## How to Test a Basis

最低限:

- decision procedure
- R² worked example
- R³ worked example
- failure example
- common wrong path
- exercises

---

# 39. basis Lesson 5 要件

## Coordinates in a Basis

最低限:

- why coordinates depend on basis
- standard coordinate example
- non-standard basis example
- worked conversion
- visual
- connection to matrices

---

# 40. basis Lesson 6 要件

## Basis and Dimension

最低限:

- basis vector count
- dimension concept
- examples R² / R³
- misconception
- connection to next concept

---

# 41. basis Content Minimums

v1.8 basisは最低限:

- lessons >= 6
- motivation >= 1 substantial section
- intuition >= 2 substantial sections
- positive examples >= 6
- counterexamples >= 4
- worked examples >= 6
- misconceptions >= 6
- exercises >= 20
- diagnostics >= 5
- visuals >= 3
- checkpoints >= 6
- concept connections >= 4

ただし数を満たすだけではpassではない。

---

# 42. basis Exercise Distribution

推奨:

```text
recognition          3
definition/explain   3
calculation          5
error_detection      3
counterexample       2
transfer             3
synthesis            1
```

合計20以上。

---

# 43. basis Visual Minimums

最低3。

推奨:

## Visual A
span / independent / basis comparison

## Visual B
R²で異なる2つのbasis

## Visual C
同じvectorのcoordinateがbasisによって変わる図

---

# 44. Content Quality Matrix

basisについてmachine-readableまたはaudit artifact内にQuality Matrixを作る。

例:

```yaml
motivation:
  exists: true
  substantial: true
  problem_driven: true

intuition:
  exists: true
  concrete_example: true
  formal_bridge: true

definition:
  exact: true
  unpacked: true
  conditions_explained: true

examples:
  progressive: true
  positive: 6
  counterexample: 4

worked_examples:
  stepwise: true
  count: 6

assessment:
  objective_coverage: complete

visuals:
  conceptually_correct: true
```

---

# 45. Build Report v1.8

build reportにsemantic auditを追加する。

例:

```json
{
  "concept": "basis",
  "version": "1.8",
  "status": "published",
  "semanticAudits": {
    "math": "pass",
    "evidence": "pass",
    "pedagogy": "pass",
    "explanation": "pass",
    "visual": "pass",
    "completeness": "pass"
  },
  "content": {
    "lessons": 6,
    "workedExamples": 6,
    "counterexamples": 4,
    "exercises": 20,
    "diagnostics": 5,
    "visuals": 3
  }
}
```

---

# 46. Web Renderer 改訂

basisページは読み物として自然にする。

推奨:

```text
Overview
↓
Lesson 1
↓
Checkpoint
↓
Lesson 2
↓
Visual
↓
Checkpoint
↓
...
↓
Practice
↓
Diagnostics
↓
Evidence / Sources
```

---

# 47. Navigation

長文化するため以下を導入してよい。

- table of contents
- lesson navigation
- previous / next
- collapsible evidence
- progress-like section markers

user accountは不要。

---

# 48. Evidence 表示

本文の可読性を壊さない。

通常は簡潔なsource marker。

必要時に:

```text
この説明の根拠
```

を展開する。

---

# 49. README 更新

v1.8について以下を明示する。

- v1.7: pipeline構築
- v1.8: explanation depth / semantic quality
- deterministic validation と semantic audit の違い
- human reviewを必須にしない理由
- Skillによる独立レビュー方式

---

# 50. Documentation

最低限更新/新規作成:

```text
docs/
├─ deep-explanation.md
├─ semantic-audit.md
├─ lesson-architecture.md
├─ quality-gates.md
├─ infographic-policy.md
└─ authoring-workflow.md
```

---

# 51. Skill Documentation Quality

各主要Skillは最低限以下を明示する。

- Purpose
- Inputs
- Outputs
- Required Workflow
- Quality Rules
- Failure Conditions
- Anti-Patterns
- Example Output
- Handoff to next Skill

対象:

- pedagogy-synthesizer
- explanation-writer
- example-designer
- infographic-designer
- math-auditor
- evidence-auditor
- pedagogy-auditor
- explanation-auditor
- visual-auditor
- completeness-auditor

---

# 52. Synthetic Failure Fixtures v1.8

追加する。

## shallow_explanation
定義と短い言い換えしかない

## missing_bridge
具体例からformal definitionへの橋がない

## fake_depth
同じ説明を言い換えて水増し

## unexplained_symbol
未定義記号を使用

## bad_worked_example
途中推論を省略

## misleading_visual
直交性がbasis条件であるように見える

## assessment_mismatch
learning objectiveとexerciseが一致しない

これらをSemantic AuditまたはGateが落とすこと。

---

# 53. v1.8でやらないこと

- 全数学への拡張
- user model
- adaptive learning
- spaced repetition
- full AI tutor
- learner telemetry
- graph DB
- vector DB
- mobile app
- video
- BiimSlideMaker integration
- human review dashboard
- CMS
- monetization

---

# 54. Anti-Patterns

禁止:

1. Schema追加だけして完了
2. Skillファイルを数行だけ作る
3. countを増やして品質改善とみなす
4. 長文化だけする
5. 同義反復で水増し
6. deterministic scriptだけでsemantic qualityを判定
7. writer自身の自己レビューだけでpublish
8. stale auditでpublish
9. lessonを短いカードの寄せ集めにする
10. visualを装飾扱いする
11. exerciseを計算問題だけに偏らせる
12. Evidenceを後付けする

---

# 55. Implementation Order

1. v1.7の現状を確認
2. design migration note
3. Explanation Writer全面改訂
4. Pedagogy Synthesizer全面改訂
5. Example Designer改訂
6. Exercise Designer改訂
7. Infographic Designer改訂
8. Math Auditor改訂
9. Evidence Auditor改訂
10. Pedagogy Auditor改訂
11. Explanation Auditor新設
12. Visual Auditor改訂
13. Completeness Auditor改訂
14. deterministic auditの責務縮小
15. semantic audit artifact schema
16. audit freshness/hash
17. publish gate改訂
18. synthetic failure fixtures
19. basis pedagogy plan再生成
20. basis lessons再設計
21. basis explanation再生成
22. basis examples再生成
23. basis exercises 20+
24. basis diagnostics 5+
25. basis visuals 3+
26. semantic audits実行
27. fix loop
28. renderer改訂
29. tests
30. docs
31. README
32. final build
33. final publish gate

---

# 56. Acceptance Criteria

## Skills

### AC1
Explanation Writerが詳細workflowを持つ。

### AC2
Pedagogy Synthesizerが詳細設計を行う。

### AC3
Example Designerがpurpose/contrast/what-to-noticeを扱う。

### AC4
Infographic Designerがlearning goalベースで設計する。

### AC5
Explanation Auditorが存在する。

---

## Semantic Audit

### AC6
Math Auditorがsemantic reviewを行う。

### AC7
Evidence Auditorがsemantic supportを確認する。

### AC8
Pedagogy Auditorが理解可能性を評価する。

### AC9
Explanation Auditorが説明の深さを評価する。

### AC10
Visual Auditorが数学的意味を評価する。

### AC11
Completeness Auditorがcount以外のdepthを評価する。

---

## Publish Gate

### AC12
Deterministic validationとSemantic Auditが分離されている。

### AC13
全Semantic Audit passがpublish必須。

### AC14
stale auditは無効。

### AC15
failed auditでpublish blocked。

---

## basis Content

### AC16
basis lessons >= 6。

### AC17
worked examples >= 6。

### AC18
counterexamples >= 4。

### AC19
exercises >= 20。

### AC20
diagnostics >= 5。

### AC21
visuals >= 3。

### AC22
各Lessonが単なる1〜2文カードではなく、学習単位として成立する。

### AC23
definitionがconditionごとにunpackされている。

### AC24
concrete → abstract bridgeが存在する。

### AC25
major misconceptionが説明・例・診断のいずれかに接続される。

---

## Tests

### AC26
shallow_explanation fixtureがfail。

### AC27
missing_bridge fixtureがfail。

### AC28
fake_depth fixtureがfail。

### AC29
unexplained_symbol fixtureがfail。

### AC30
bad_worked_example fixtureがfail。

### AC31
misleading_visual fixtureがfail。

### AC32
assessment_mismatch fixtureがfail。

### AC33
既存v1.7 testsが壊れていない。

---

# 57. Final Quality Questions

完了時にCodexは以下へYESと答えられること。

1. basisの最初のLessonだけで「なぜbasisが必要か」を理解できるか
2. concrete caseからformal definitionへ自然に移行しているか
3. spanとindependenceがなぜ両方必要か説明しているか
4. 各条件を片方ずつ破るcounterexampleがあるか
5. worked exampleは途中推論を示しているか
6. 初学者が未定義記号に遭遇しないか
7. basisがorthogonal basisと混同されないか
8. coordinateとの接続が理解できるか
9. dimensionとの接続が理解できるか
10. exercisesが単なる計算問題だけでないか
11. diagnosticが不足Conceptを示せるか
12. visualsが本文の理解を本当に助けるか
13. writerとは別のSkillが説明品質を評価したか
14. math auditが内容を意味的に再確認したか
15. evidence auditが引用の後付け化を防いでいるか
16. pedagogy auditがpresence以上の判断をしているか
17. stale auditでpublishできないか
18. countだけ満たした薄いfixtureをGateが落とすか
19. 同じSkill群を別Conceptに再利用できるか
20. basisが「辞書項目」ではなく「授業」として成立しているか

重大なNOが1つでもある場合、MVP v1.8は未完成とみなす。

---

# 58. Definition of Done

MVP v1.8 の成功条件は、

**basisの文章量が増えることではない。**

成功条件は、

> 高品質な説明を作るための具体的Skill Contractと、
> それを別Skillが意味的にレビューする仕組みが成立し、
> 「存在するだけ」「数があるだけ」「長いだけ」の教材がPublish Gateを通れなくなること

である。

最終的に `basis` が、

```text
Motivation
→ Concrete Experience
→ Intuition
→ Formal Definition
→ Unpacking
→ Contrast
→ Worked Reasoning
→ Practice
→ Diagnosis
→ Visual Understanding
→ Connections
```

という学習体験として成立し、

Codex自身が、

```text
Math
Evidence
Pedagogy
Explanation
Visual
Completeness
```

の観点から独立レビューした上でpublishされること。

この状態をもって MVP v1.8 完了とする。
