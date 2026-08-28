# Open Learn Core — MVP v1.7 Specification
## Evidence-Based Authoring Pipeline / Skill-Driven Educational Content Compiler

# 0. この文書の目的

本仕様書は `open_learn_core` の MVP v1.6 を改善し、MVP v1.7 を実装するための Codex 向け実装指示書である。

MVP v1.6 では Concept / prerequisite graph / Curriculum / Lesson / Claim / Exercise / Diagnostic Question / Source / Evidence Review / Evidence Item / Curriculum Decision / Evidence Coverage Report / Web renderer / validator を実装した。

MVP v1.7 の目的は、これを「Evidence付き教材データのサンプル」から「高品質な教材を再現可能に生成するシステム」へ進化させることである。

参考思想:
- https://github.com/kokuren333/Evidence-Based-Everything
- https://github.com/kokuren333/evidence-note-generater-skill

特に以下を取り込む。

1. 信頼できる参考資料を先に集めてから執筆する
2. Evidence / Claims / Sources を分離する
3. Skillによって役割を分担する
4. 単なる要約ではなく「わかりやすく、十分な説明」を生成する
5. インフォグラフィックス・図解を教材の正式要素として生成する
6. publish前に独立した品質チェックを複数回行う
7. 品質レビューを人間の必須作業にしない
8. Codex自身が別Skillを用いて成果物を再評価する
9. working artifacts / durable artifacts / published artifacts を分離する
10. Gateを通過しない教材を公開しない

# 1. MVP v1.7 の中心思想

教材を直接書くことを主作業にしない。

教材は以下の工程から生成される compiled artifact と考える。

```text
Research
→ Evidence Compilation
→ Concept Analysis
→ Pedagogical Design
→ Explanation Writing
→ Visual Design
→ Example / Exercise Design
→ Multi-Skill Quality Audit
→ Publish
```

MVP v1.7 のゴールは `basis` の教材を長くすることではない。

ゴールは、

> 数学Conceptを入力すると、信頼できる資料を調査し、Evidenceを整理し、学習設計を決め、十分かつ理解しやすい説明を作り、図解・例題・演習を生成し、Codex自身が独立Skillでレビューし、一定品質を満たした教材だけをpublishできる

という Evidence-Based Educational Authoring Pipeline を構築することである。

# 2. 長期ロードマップ

## MVP v1
Concept graph の成立確認。

## MVP v1.5
Concept / Lesson / Claim / Exercise の責務分離。

## MVP v1.6
Evidence Layer / Curriculum Decision / Evidence-backed prerequisite の導入。

## MVP v1.7
今回。Evidence-first authoring pipeline + Skills + self-review + infographic。

## MVP v2
小学算数から大学初頭までの数学全範囲へ拡張。

## MVP v3
予備校・塾・家庭教師を部分的または全面的に代替可能な無料学習基盤へ拡張。

# 3. 研究課題

- RQ1: Evidence-firstにすることで、LLMが直接教材を書く場合より信頼性・説明密度・一貫性を高められるか。
- RQ2: 説明生成を専用Skill化することで、短すぎる・定義だけ・直観がない・例が足りない・前提が飛ぶ、といった薄い教材を防げるか。
- RQ3: Visual / Infographic Skill により数学概念の理解を支援する視覚教材を構造的に生成できるか。
- RQ4: Codex自身による複数の独立Quality Audit Skillで、人間レビューなしでも最低品質を一定程度保証できるか。
- RQ5: 同一pipelineをv2の数百〜数千Conceptへ拡張できるか。

# 4. 最重要原則

## 4.1 Evidence Before Writing

教材本文を書いてから後付けで引用を付けてはならない。

必ず:

```text
Source Discovery
↓
Source Appraisal
↓
Evidence Extraction
↓
Claim Map
↓
Pedagogical Synthesis
↓
Writing
```

の順で処理する。

## 4.2 AI Generated Text is not Evidence

LLM出力そのものをEvidenceとして扱わない。Codexは執筆者・編集者・研究補助者であり、Sourceではない。

## 4.3 Explanation is a Designed Artifact

良い説明は単なるClaim列挙ではない。必要に応じて以下を統合する。

- motivation
- intuition
- prerequisite recall
- precise definition
- term-by-term explanation
- contrast
- positive examples
- counterexamples
- worked reasoning
- connections
- misconceptions
- recap
- next connection

## 4.4 Visuals are First-Class Learning Artifacts

図解・インフォグラフィックスを装飾と扱わない。Concept関係、手順、空間関係、比較、変換、分類、誤解修正などを視覚的に伝える正式教材要素とする。

## 4.5 Human Review is Optional, not Required

MVP v1.7 では人間レビューを必須にしない。

ただし同一Skillが自分自身を採点してpublishする構造は禁止する。

```text
lesson-writer
↓
math-auditor
↓
evidence-auditor
↓
pedagogy-auditor
↓
visual-auditor
↓
completeness-auditor
↓
publish-gate
```

# 5. Skill Architecture

`.agents/skills/` を正式Skill rootとする。

```text
.agents/
└─ skills/
   ├─ OPENLEARN-SHARED-CONTRACT.md
   ├─ openlearn-orchestrator/SKILL.md
   ├─ openlearn-scope-designer/SKILL.md
   ├─ openlearn-source-discovery/SKILL.md
   ├─ openlearn-source-appraiser/SKILL.md
   ├─ openlearn-evidence-extractor/SKILL.md
   ├─ openlearn-claim-builder/SKILL.md
   ├─ openlearn-prerequisite-analyst/SKILL.md
   ├─ openlearn-pedagogy-synthesizer/SKILL.md
   ├─ openlearn-explanation-writer/SKILL.md
   ├─ openlearn-example-designer/SKILL.md
   ├─ openlearn-exercise-designer/SKILL.md
   ├─ openlearn-diagnostic-designer/SKILL.md
   ├─ openlearn-infographic-designer/SKILL.md
   ├─ openlearn-math-auditor/SKILL.md
   ├─ openlearn-evidence-auditor/SKILL.md
   ├─ openlearn-pedagogy-auditor/SKILL.md
   ├─ openlearn-visual-auditor/SKILL.md
   ├─ openlearn-completeness-auditor/SKILL.md
   └─ openlearn-publisher/SKILL.md
```

# 6. Shared Contract

全Skillが継承する `OPENLEARN-SHARED-CONTRACT.md` を作成する。

## MUST

- Evidence before prose
- Source URL / locatorを捏造しない
- 数学的主張と教育設計判断を区別する
- 不確実な教育判断を断定しない
- prerequisiteを暗黙に飛ばさない
- unexplained symbolを残さない
- broken referenceをpublishしない
- failed auditの教材をpublishedへ移動しない
- 原資料の長文コピーを避け、Evidenceは要約・抽出中心にする
- 既存のSchema/validatorと矛盾する変更を行う場合はmigrationを明示する

## SHOULD

- primary / official / university / open textbookを優先
- 重要Claimは複数sourceで確認
- intuitionとformal definitionを両方提供
- positive exampleとcounterexampleを両方提供
- 視覚化が理解を助ける場合はVisual Artifactを作る

# 7. Orchestrator

`openlearn-orchestrator` は全工程を管理する。

ユーザーから「basisを作成」と依頼された場合、直接 `basis.json` を書いて終了してはならない。

標準workflow:

```text
1. Scope Design
2. Source Discovery
3. Source Appraisal
4. Evidence Extraction
5. Claim Building
6. Prerequisite Analysis
7. Pedagogical Synthesis
8. Explanation Writing
9. Example Design
10. Exercise Design
11. Diagnostic Design
12. Infographic Design
13. Math Audit
14. Evidence Audit
15. Pedagogy Audit
16. Visual Audit
17. Completeness Audit
18. Fix Loop
19. Publish Gate
20. Publish
```

# 8. Fix Loop

Auditで問題が見つかった場合、問題種別に対応するSkillへ戻す。

- Math Audit fail → explanation/example/exerciseへ戻す
- Evidence Audit fail → source-discovery/evidence-extractorへ戻す
- Pedagogy Audit fail → pedagogy-synthesizer/explanation-writerへ戻す
- Visual Audit fail → infographic-designerへ戻す
- Completeness Audit fail →不足担当Skillへ戻す

最大3iteration程度を上限とする。無限loopは禁止。

# 9. Artifact Lifecycle

EBEの思想を参考に、成果物を3層に分ける。

```text
_working/
data/
dist/
```

## `_working/`

探索・分析・draftのみ。

```text
_working/basis/
├─ scope.yaml
├─ search-log.yaml
├─ source-candidates.yaml
├─ source-appraisal.yaml
├─ evidence-draft.yaml
├─ claim-map.yaml
├─ prerequisite-analysis.yaml
├─ pedagogy-plan.yaml
├─ lesson-outline.yaml
├─ infographic-brief.yaml
├─ audit/
│  ├─ math.yaml
│  ├─ evidence.yaml
│  ├─ pedagogy.yaml
│  ├─ visual.yaml
│  └─ completeness.yaml
└─ build-report.json
```

## `data/`

Publish Gate通過後のdurable machine-readable data。

```text
data/
├─ concepts/
├─ lessons/
├─ claims/
├─ sources/
├─ evidence/
├─ curricula/
├─ curriculum-decisions/
├─ exercises/
├─ diagnostics/
├─ misconceptions/
└─ visuals/
```

## `dist/`

rendererが生成する公開教材。

# 10. Scope Designer

Conceptの教育範囲を定義する。

basisでは最低限:

- target learner
- assumed prerequisites
- learning objectives
- expected mastery
- terminology policy
- excluded topics

例:

```yaml
concept: basis
target:
  level: university_introductory
assumed_prerequisites:
  - vector
  - linear-combination
  - span
  - linear-independence
learning_objectives:
  - 基底の定義を説明できる
  - 与えられた集合が基底か判定できる
  - 座標表示との関係を理解する
  - dimensionとの関係を説明できる
out_of_scope:
  - infinite-dimensional basis
  - Hamel basis
  - functional analysis
```

# 11. Source Discovery Skill

教材を書く前にsource候補を集める。

優先順位:

1. official curriculum / standard
2. university OER
3. open textbook
4. reputable university course material
5. peer-reviewed educational research
6. reputable textbook metadata / preview
7. secondary explanation

basisでは最低3 source候補を比較する。

検索結果一覧を出すだけで終了しない。

# 12. Source Appraiser Skill

各sourceについて少なくとも以下を評価する。

- authority
- directness
- pedagogical relevance
- mathematical reliability
- transparency
- license / reuse suitability
- limitations

pseudo-precisionな単一scoreだけで判断しない。

例:

```yaml
source: mit-ocw-linear-algebra
authority: high
directness: high
pedagogical_relevance: high
reuse_suitability: medium
strengths:
  - ...
limitations:
  - ...
decision: include
```

# 13. Evidence Extractor Skill

Sourceから教材に必要なEvidence Itemを抽出する。

最低限以下を区別する。

- definitions
- mathematical facts
- theorem / proof ideas
- examples
- conceptual explanations
- prerequisite evidence
- ordering evidence
- pedagogical guidance

Evidence Itemは必ずsourceとlocatorを持つ。

# 14. Claim Builder Skill

EvidenceからClaimを構築する。

Claim type:

```text
definition
mathematical_fact
theorem
interpretation
prerequisite_claim
pedagogical_claim
curriculum_claim
assessment_claim
```

重要Claimは可能な限り複数Evidenceで確認する。

# 15. Prerequisite Analyst Skill

「必要そうだから」という直観だけでedgeを追加しない。

各edgeについて:

- relation: required / strongly_recommended / helpful
- rationale
- supporting claim/evidence
- whether direct or transitive
- learner consequence if missing

を整理する。

# 16. Pedagogy Synthesizer Skill

v1.7の中心Skill。

Evidence・Concept structure・prerequisiteを基に「どう教えるか」を設計する。

例:

```yaml
concept: basis
teaching_sequence:
  - motivation
  - intuition
  - prerequisite_recall
  - formal_definition
  - positive_example
  - counterexample
  - worked_example
  - coordinate_connection
  - dimension_connection
  - misconceptions
  - recap
design_rationale:
  - ...
```

# 17. Explanation Writer Skill

EBEの「わかりやすく、十分な説明」を教育向けに実装する。

短い辞書説明や定義列挙は禁止。

必要に応じて以下の層を生成する。

1. Motivation — なぜ必要か
2. Intuition — 形式定義前の直観
3. Prerequisite Recall — 前提概念の再確認
4. Formal Definition — 正確な定義
5. Term-by-Term Explanation — 定義中の語・式の分解
6. Positive Example
7. Counterexample
8. Worked Reasoning
9. Connections
10. Misconceptions
11. Summary
12. Next Connection

## Explanation Quality Rules

MUST:
- 新しい記号を説明なしに使わない
- prerequisiteを飛ばさない
- 定義だけで終わらない
- 「明らか」「自明」で説明を省略しない
- 例だけで一般則を説明したことにしない
- intuitionとformal definitionを混同しない
- 数学的に不正確な比喩を使わない

SHOULD:
- 一段落を過度に長くしない
- 重要式の前後に言語説明を置く
- 初学者が何を見るべきかを明示する
- 言語・式・図の複数表現を使う

# 18. Content Density Gate

「スカスカ教材」を直接防ぐ。

basis最低要件:

- motivation >= 1
- intuition >= 1
- formal definition >= 1
- prerequisite recall >= 2
- positive examples >= 3
- counterexamples >= 3
- worked examples >= 4
- misconceptions >= 5
- exercises >= 15
- diagnostics >= 4
- concept connections >= 3
- infographic / diagram >= 2

単純文字数だけで品質判定しない。

# 19. Example Designer Skill

例を種類別に設計する。

types:

```text
minimal
canonical
worked
counterexample
boundary_case
transfer
visual
```

basisでは最低限:

- R² standard basis
- R² non-standard basis
- spanning but dependent
- independent but not spanning ambient space
- R³ example
- coordinate representation

を扱う。

# 20. Exercise Designer Skill

問題を数合わせで作らない。

各exerciseは可能な限り以下を持つ。

- learning objective
- tested claim
- required concept
- difficulty
- expected reasoning
- answer
- worked solution
- common wrong path

basis最低15問。

推奨内訳:
- basic 6
- standard 6
- challenge 3

# 21. Diagnostic Designer Skill

誤答から不足Conceptやmisconceptionを推定できる問題を設計する。

basis最低4問。

例:
- spanだけ確認してbasisと判断 → linear-independence不足
- 本数だけでbasis判定 → dimension / independence理解不足

# 22. Infographic Designer Skill

EBEのInfographic generation思想を教育向けに移植する。

Visual Artifactは必ずlearning goalを持つ。

Visual types:

```text
concept-map
dependency-diagram
comparison
step-flow
geometric-diagram
worked-example-diagram
misconception-contrast
summary-infographic
```

basis最低2点。

推奨Visual:

1. `Basis = Span + Linear Independence` の比較図
2. R² における異なる基底と座標表現

# 23. Visual Artifact Schema

例:

```yaml
id: visual-basis-span-independence
concept: basis
type: comparison
learning_goal:
  ja: spanとlinear independenceの両方が必要であることを視覚的に理解する
source_claims:
  - claim-basis-definition
placement:
  lesson: basis-definition
alt_text:
  ja: ...
status: published
```

実画像生成可能なら画像生成またはSVG生成を利用してよい。

ただし最低限:
- visual specification
- alt text
- source claim linkage
- placement
- expected output path

を保持する。

生成不能環境でもpipeline全体が壊れないこと。

# 24. Math Auditor Skill

執筆Skillとは独立して数学的正確性を確認する。

チェック:
- definition correctness
- theorem correctness
- example validity
- counterexample validity
- worked solution
- notation consistency
- hidden assumptions
- logical gaps
- prerequisite mismatch

出力例:

```yaml
status: pass
issues: []
```

fail時:

```yaml
status: fail
issues:
  - severity: critical
    location: ...
    description: ...
    suggested_fix: ...
```

# 25. Evidence Auditor Skill

チェック:
- major claim has evidence
- locator exists
- source actually supports claim
- citation overreach
- unsupported statement
- pedagogical claim presented stronger than evidence
- contrary evidence ignored
- source diversity不足

# 26. Pedagogy Auditor Skill

チェック:
- motivation exists
- intuition exists
- definition is understandable
- prerequisite jump
- cognitive overload
- example progression
- counterexamples
- misconception handling
- explanation completeness
- assessment alignment
- beginner accessibility

「数学的に正しい」だけではpassにしない。

# 27. Visual Auditor Skill

チェック:
- clear learning goal
- mathematical correctness
- label clarity
- false geometric implication
- decorative complexity
- accessibility / alt text
- lesson relevance
- source-claim linkage

# 28. Completeness Auditor Skill

Coverage Matrixを生成する。

例:

```text
Basis Coverage
Motivation              PASS
Intuition               PASS
Formal definition       PASS
Prerequisite recall     PASS
Positive examples       3/3
Counterexamples         3/3
Worked examples         4/4
Misconceptions          5/5
Exercises               15/15
Diagnostics             4/4
Visuals                 2/2
Evidence coverage       PASS
```

# 29. Audit Independence

Audit Skillは生成時のwriter reasoningをそのまま引き継がず、artifact / source / evidence / schemaを新規読者として読み直して評価する。

# 30. Publish Gate

全て自動判定する。

## Structure
- schema valid
- no broken references
- no prerequisite cycle

## Evidence
- core claim evidence coverage = 100%
- major source locator present
- evidence audit = pass

## Mathematics
- math audit = pass

## Pedagogy
- pedagogy audit = pass

## Completeness
- content density minimum met
- completeness audit = pass

## Visual
- required visual count met
- visual audit = pass

## Assessment
- exercise minimum met
- diagnostic minimum met
- learning objective linkage exists

Gate failure時はpublishedへ移動しない。

# 31. Quality Score Policy

`87/100` のような平均点だけでpublish判定しない。

Critical Gate方式:

- Math correctness: MUST PASS
- Evidence integrity: MUST PASS
- Pedagogy completeness: MUST PASS
- Structure: MUST PASS
- Visual: MUST PASS

# 32. Build Command

可能なら:

```bash
npm run build:concept -- basis
```

または同等のコマンドで deterministic な以下を実行できるようにする。

- schema validate
- reference validate
- coverage check
- audit artifact check
- publish-gate check
- render
- build report

Codexによる調査・執筆はSkill workflow、npm scriptはvalidation / compilationを担当する。

# 33. Build Report

例:

```json
{
  "concept": "basis",
  "version": "1.7",
  "status": "published",
  "audits": {
    "math": "pass",
    "evidence": "pass",
    "pedagogy": "pass",
    "visual": "pass",
    "completeness": "pass"
  },
  "counts": {
    "claims": 12,
    "evidenceItems": 18,
    "examples": 8,
    "exercises": 15,
    "diagnostics": 4,
    "misconceptions": 5,
    "visuals": 2
  }
}
```

# 34. Web Renderer v1.7

basisページ最低構成:

```text
Overview
Why this matters
Prerequisites
Intuition
Definition
Examples
Counterexamples
Worked examples
Connections
Infographics
Misconceptions
Exercises
Diagnostics
Evidence
Sources
```

JSON dump表示は禁止。

Machine-readable source of truth と human-readable view を分離する。

# 35. Evidence UI

通常学習画面ではEvidenceを邪魔にならない位置に置く。

例:

```text
[この説明の根拠を見る]
```

展開すると:
- Claim
- Evidence Item
- Source
- Locator
- Status

を確認可能にする。

# 36. Infographic UI

VisualをLesson内の適切な位置に表示する。

ページ最下部に画像一覧として置くだけでは不十分。

# 37. Skill Output Contract

各Skillは可能な限りstructured artifactを残す。

例:

```text
source-discovery        → source-candidates.yaml
source-appraiser        → source-appraisal.yaml
evidence-extractor      → evidence-draft.yaml
claim-builder           → claim-map.yaml
pedagogy-synthesizer    → pedagogy-plan.yaml
infographic-designer    → infographic-brief.yaml
math-auditor            → math-audit.yaml
evidence-auditor        → evidence-audit.yaml
pedagogy-auditor        → pedagogy-audit.yaml
visual-auditor          → visual-audit.yaml
completeness-auditor    → completeness-audit.yaml
```

口頭的な推論だけで工程を終わらせない。

# 38. Human Intervention Policy

原則Codexが自走する。

確認が必要なのは:
- scopeが重大に曖昧
- license / legal issue
- destructive migration
- project goal conflict

などに限定する。

通常の「この文章でいいですか」「この資料を使ってよいですか」は不要。

# 39. Quality Fix Policy

- Critical: 数学誤り、捏造引用、broken evidence → 必ず修正
- Major: 説明不足、prerequisite jump、exercise mismatch → 原則修正
- Minor: style redundancy等 → 自動修正可能なら修正

# 40. basis Acceptance Content

## Explanation
- Why basis matters
- Intuition
- Formal definition
- Span relation
- Linear independence relation
- Standard basis
- Non-standard basis
- Coordinate representation
- Dimension relation

## Examples
最低6

## Counterexamples
最低3

## Worked Examples
最低4

## Misconceptions
最低5

## Exercises
最低15

## Diagnostics
最低4

## Infographics
最低2

# 41. Evidence Requirements for basis

最低3つの信頼できるsourceを調査する。

最低2種類のsource categoryを含むことが望ましい。

例:
- university OER
- open textbook
- official / institutional educational material

重要ClaimにはEvidence Itemを付ける。

source listに存在するだけではcoverageとみなさない。

# 42. Pedagogy Evidence

数学的定義だけでなく「どう説明するか」に関する信頼できる教育研究が見つかる場合は利用する。

ただしMVPでsystematic reviewは要求しない。

Evidenceが弱い場合は `provisional` 等で明示する。

# 43. Assessment Evidence

v1.7では試験的でよい。

```yaml
assesses:
  - claim-basis-definition
diagnoses:
  - misconception-basis-span-only
difficulty_basis:
  type: model_expert_judgement
  status: provisional
```

将来的に実学習データで更新可能にする。

# 44. Documentation

最低限:

```text
docs/
├─ design.md
├─ evidence-model.md
├─ authoring-workflow.md
├─ skill-architecture.md
├─ quality-gates.md
├─ infographic-policy.md
└─ artifact-lifecycle.md
```

# 45. README更新

READMEに以下を明記する。

Open Learn Coreは「AIで教材文章を大量生成するプロジェクト」ではない。

Evidence / Knowledge Graph / Pedagogy / Assessment / Visual / Audit を分離し、

**高品質な教材を再現可能にbuildするOSS基盤**

である。

# 46. Test Requirements

既存testを維持し追加する。

## Skill artifacts
- required working artifact presence

## Coverage
- basis minimum coverage

## Publish Gate
- math fail → publish blocked
- evidence fail → publish blocked
- pedagogy fail → publish blocked
- visual fail → publish blocked
- completeness fail → publish blocked

## Visual
- broken visual claim reference detection
- missing alt text detection

## Exercise
- broken assessed claim
- broken required concept

## Build Report
- output consistency

# 47. Synthetic Failure Fixtures

Quality Gateを本当にテストするため、意図的に悪いfixtureを作る。

- `bad_math`: 基底定義が誤っている
- `bad_evidence`: 存在しないlocator
- `thin_content`: 定義1文のみ
- `bad_pedagogy`: 未定義のspanを突然使用
- `bad_visual`: Claimと図解説明が矛盾

これらがPublish Gateを通過しないことをテストする。

# 48. MVP v1.7で実装しないもの

- 全数学
- user account
- personalization
- adaptive engine
- mastery model
- learner telemetry
- spaced repetition
- entrance exam corpus
- full AI tutor
- automatic PDF OCR pipeline
- graph DB
- vector DB
- video generation
- BiimSlideMaker integration
- mobile app
- monetization
- classroom LMS
- human review workflow

# 49. Anti-Patterns

禁止:
1. Codexがいきなり完成Lessonを書く
2. 説明を長くしただけで「充実した」と判定
3. 引用URLだけでEvidence-basedと呼ぶ
4. Infographicを装飾画像として生成
5. writer Skillの自己採点だけでpublish
6. Audit failを無視してpublish
7. 平均quality scoreで数学誤りを相殺
8. source locatorを推測
9. 「明らか」「自明」で初学者説明を省略
10. v2を見据えすぎて過剰backendを追加

# 50. Implementation Order

Codexは以下の順で実装する。

1. 現在のv1.6 architectureを確認
2. `docs/design.md` にmigration planを書く
3. Shared Contract
4. orchestrator
5. scope-designer
6. source-discovery
7. source-appraiser
8. evidence-extractor
9. claim-builder
10. prerequisite-analyst
11. pedagogy-synthesizer
12. explanation-writer
13. example-designer
14. exercise-designer
15. diagnostic-designer
16. infographic-designer
17. math-auditor
18. evidence-auditor
19. pedagogy-auditor
20. visual-auditor
21. completeness-auditor
22. publisher
23. working artifact structure
24. visual schema
25. build report schema
26. publish gate
27. synthetic failure fixtures
28. basis research pipeline
29. basis content regeneration
30. basis visuals
31. basis exercises / diagnostics
32. audits
33. automatic fix loop
34. renderer improvements
35. tests
36. docs
37. README
38. final build
39. final publish gate

# 51. Acceptance Criteria

## Architecture
- AC1: `.agents/skills/` にOpen Learn専用Skill群が存在
- AC2: Shared Contractが存在
- AC3: Orchestratorが標準workflowを定義
- AC4: working / durable / dist のartifact lifecycleが存在

## Evidence-first authoring
- AC5: 執筆前にsource discovery artifactが生成
- AC6: source appraisal artifactが存在
- AC7: evidence extraction artifactが存在
- AC8: Claim Mapが存在

## Pedagogy
- AC9: Pedagogy Planが存在
- AC10: Explanation Writer Skillが存在
- AC11: basisがmotivation / intuition / formal definition / example / counterexampleを持つ
- AC12: Completeness Auditが薄い教材を検出できる

## Visual
- AC13: Infographic Designer Skillが存在
- AC14: Visual Artifact Schemaが存在
- AC15: basisに最低2 Visual Artifact
- AC16: alt textが存在
- AC17: VisualがClaimまたはLessonへリンク

## Assessment
- AC18: basis exercise >= 15
- AC19: basis diagnostic >= 4
- AC20: exerciseがClaim / objectiveへ接続可能

## Audit
- AC21: Math Auditorが存在
- AC22: Evidence Auditorが存在
- AC23: Pedagogy Auditorが存在
- AC24: Visual Auditorが存在
- AC25: Completeness Auditorが存在
- AC26: Audit failureでpublish blocked
- AC27: 自動Fix Loopまたは明示的再実行機構が存在

## Publish
- AC28: Publish Gateが存在
- AC29: build report生成
- AC30: basisが全Gate通過
- AC31: synthetic bad fixturesがGate不通過

## Regression
- AC32: v1.6 Evidence機能が壊れていない
- AC33: prerequisite graphが壊れていない
- AC34: static renderer正常
- AC35: 既存test pass

# 52. Final Quality Questions

完了時に以下へYESと答えられること。

1. 教材本文を書く前にEvidenceを集めたか
2. 重要ClaimはSourceまで遡れるか
3. basisを初見の学生がこのサイトだけで理解できるか
4. 定義だけではなく直観があるか
5. positive exampleとcounterexampleがあるか
6. worked exampleが途中過程を説明しているか
7. prerequisiteを飛ばしていないか
8. 典型的誤解を扱っているか
9. 十分な演習があるか
10. 診断問題から不足Conceptを推定できるか
11. 図解はlearning goalを持つか
12. 図解は数学的に正しいか
13. 数学的正確性をwriterとは別Skillが確認したか
14. Evidence integrityを別Skillが確認したか
15. Pedagogy qualityを別Skillが確認したか
16. Visual qualityを別Skillが確認したか
17. Content completenessを別Skillが確認したか
18. Gate failure時にpublishされないか
19. v2で同じpipelineを別Conceptへ適用できるか
20. 「AIが文章を量産しただけ」のrepoになっていないか

重大なNOが1つでもある場合、MVP v1.7は未完成とみなす。

# 53. Definition of Done

MVP v1.7の成功条件は、basisの記事が長くなることではない。

成功条件は、

```text
Research
↓
Evidence
↓
Knowledge Modeling
↓
Pedagogical Design
↓
Explanation
↓
Visuals
↓
Examples / Exercises
↓
Independent AI Audits
↓
Publish Gate
↓
Published Learning Material
```

という工程がrepo上に実装され、Codexが人間レビューなしでも自走できることである。

Open Learn Core を Knowledge Database から **Evidence-Based Learning Content Compiler** へ進化させる。

このpipelineがbasisでend-to-endに成立した時点でMVP v1.7完了とする。
