# Open Learn Core — Repository Restructure Specification
## `REPO_RESTRUCTURE_SPEC.md`

# 0. この文書の目的

本仕様書は、現在の `open_learn_core` repository を、今後の拡張に耐えられる責務分離された構成へ再編するための Codex 向け実装指示書である。

現在の repository には Core architecture / Schemas / Validators / Skills / Renderer / Evidence system / Quality gates / Linear Algebra教材データ / Visual / Working artifacts / Published output が同居している。

今回の再編では、repository をすぐ複数repoへ分割しない。まず現在のrepository内部を `core/` と `domains/` に分離し、最初の Domain として `domains/linear-algebra/` を作成する。将来的には各Domainを別repositoryへ切り出せる構造を目指す。

# 1. 基本方針

現在の repository 名は `open_learn_core` のまま維持する。

最終的な責務は以下。

```text
open_learn_core/
├─ core/                    # 共通基盤
├─ domains/
│  └─ linear-algebra/       # 線形代数教材
├─ docs/
├─ tests/
└─ dist/                    # GitHub Pages公開成果物
```

Coreは教材をbuildするエンジン、Domainは教材パッケージと考える。

# 2. 今回のゴール

1. Core codeと教材contentを明確に分離
2. Linear Algebraを独立Domainとして扱う
3. DomainごとにConcept / Curriculum / Lesson / Evidence / Exercise / Visualを所有
4. CoreはDomain固有データを知らない
5. DomainはCoreのSchema / Validator / Skills / Rendererを利用
6. 将来Domainを別repoへ移動しやすくする
7. build systemを複数Domain対応にする
8. 将来Portalが読めるmanifestを生成
9. visual / generated imageをDomain単位で管理
10. 既存v1.8機能を壊さずmigration

# 3. 非目標

今回やらないもの：

- 実際の複数GitHub repo分割
- Portal本格実装
- 数学全範囲への拡張
- 英語・物理・化学追加
- CDN / object storage
- DB
- learner account
- adaptive learning
- AI tutor
- video

# 4. 推奨Repository構造

```text
open_learn_core/
├─ README.md
├─ AGENTS.md
├─ package.json
├─ REPO_RESTRUCTURE_SPEC.md
│
├─ core/
│  ├─ schemas/
│  │  ├─ concept.schema.json
│  │  ├─ lesson.schema.json
│  │  ├─ claim.schema.json
│  │  ├─ exercise.schema.json
│  │  ├─ diagnostic.schema.json
│  │  ├─ misconception.schema.json
│  │  ├─ source.schema.json
│  │  ├─ evidence-review.schema.json
│  │  ├─ evidence-item.schema.json
│  │  ├─ curriculum.schema.json
│  │  ├─ curriculum-decision.schema.json
│  │  ├─ visual.schema.json
│  │  └─ domain-manifest.schema.json
│  ├─ src/
│  │  ├─ validation/
│  │  ├─ graph/
│  │  ├─ evidence/
│  │  ├─ quality/
│  │  ├─ renderer/
│  │  ├─ build/
│  │  └─ domain/
│  ├─ skills/
│  ├─ templates/
│  └─ config/
│
├─ domains/
│  └─ linear-algebra/
│     ├─ domain.yaml
│     ├─ README.md
│     ├─ data/
│     │  ├─ concepts/
│     │  ├─ lessons/
│     │  ├─ claims/
│     │  ├─ exercises/
│     │  ├─ diagnostics/
│     │  ├─ misconceptions/
│     │  ├─ curricula/
│     │  ├─ curriculum-decisions/
│     │  ├─ sources/
│     │  ├─ evidence/
│     │  │  ├─ reviews/
│     │  │  └─ items/
│     │  └─ visuals/
│     ├─ assets/
│     │  ├─ diagrams/
│     │  ├─ infographics/
│     │  ├─ thumbnails/
│     │  └─ generated/
│     ├─ working/
│     ├─ tests/
│     └─ dist/
│
├─ docs/
│  ├─ architecture.md
│  ├─ domain-system.md
│  ├─ repository-layout.md
│  ├─ asset-policy.md
│  └─ migration.md
│
├─ tests/
│  ├─ core/
│  └─ integration/
│
└─ dist/
   ├─ domain-index.json
   └─ domains/
      └─ linear-algebra/
```

# 5. Coreの責務

Coreに含めてよいもの：

- Schema
- Validator
- Graph logic
- Evidence architecture
- Quality Gate infrastructure
- Semantic Audit contracts
- Shared Skills
- Renderer
- Domain loader
- Build system
- Shared templates
- Shared utilities
- Shared tests

Coreに含めてはいけないもの：

- basis固有データ
- span固有データ
- 線形代数特有の説明
- 線形代数画像
- 線形代数Evidence
- 線形代数Exercise
- 線形代数Curriculum本文

# 6. Domainの責務

`domains/<domain-id>/` は分野固有教材を所有する。

`domains/linear-algebra/` が持つもの：

- Concept
- Lesson
- Curriculum
- Claim
- Exercise
- Diagnostic
- Misconception
- Source
- Evidence
- Curriculum Decision
- Visual Specification
- Actual Assets
- Working artifacts
- Domain tests
- Domain README

# 7. Domain Manifest

各Domainは必ず `domain.yaml` を持つ。

例：

```yaml
id: linear-algebra

title:
  ja: 線形代数
  en: Linear Algebra

description:
  ja: >
    ベクトル、線形結合、span、線形独立、基底、次元、
    座標、線形写像、行列表現を扱う大学初年級向け教材。

version: 0.1.0
status: experimental

language:
  default: ja
  supported:
    - ja
    - en

level:
  min: upper_secondary
  max: university_introductory

entry_curriculum:
  - linear-algebra-basic

entry_concepts:
  - vector

core_compatibility:
  min_version: "1.8"

content_root: ./data
asset_root: ./assets

publish:
  enabled: true
  path: linear-algebra
```

Core側に `domain-manifest.schema.json` を追加しvalidateする。

# 8. Domain Loader

Coreに以下を実装する。

```text
core/src/domain/
├─ discover-domains.mjs
├─ load-domain.mjs
└─ validate-domain.mjs
```

動作：

```text
domains/*
↓
domain.yaml探索
↓
manifest validation
↓
domain data load
↓
schema validation
```

Core codeへ `linear-algebra` や `basis` をハードコードしない。

# 9. Build System

Domain単位で実行可能にする。

```bash
npm run validate:domain -- linear-algebra
npm run build:domain -- linear-algebra
npm run test:domain -- linear-algebra
npm run build:concept -- linear-algebra basis
```

全Domain：

```bash
npm run validate:all
npm run build:all
```

# 10. Dist構造

最終公開成果物はroot `dist/` に集約する。

```text
dist/
├─ index.html
├─ domain-index.json
└─ domains/
   └─ linear-algebra/
      ├─ index.html
      ├─ manifest.json
      ├─ concepts/
      ├─ curricula/
      └─ assets/
```

GitHub Pages側は `dist/` だけで自己完結して公開できること。

# 11. Portal向けManifest

build時にDomain manifestをJSONへ変換・補完して出力する。

例：

```json
{
  "id": "linear-algebra",
  "title": {"ja": "線形代数", "en": "Linear Algebra"},
  "url": "/domains/linear-algebra/",
  "curricula": [
    {"id": "linear-algebra-basic", "title": {"ja": "線形代数入門"}}
  ],
  "conceptCount": 12,
  "status": "experimental"
}
```

全Domain一覧を `dist/domain-index.json` に生成する。

将来の `openlearn-portal` はこのmanifest群だけを読めばよい構造にする。

# 12. Linear Algebra Migration

現在rootにある線形代数固有dataを `domains/linear-algebra/` へ移動する。

対象は実際に存在するもの：

```text
data/concepts/
data/lessons/
data/claims/
data/exercises/
data/diagnostics/
data/misconceptions/
data/curricula/
data/curriculum-decisions/
data/sources/
data/evidence/
data/visuals/
```

# 13. Working Artifacts

現在の `_working/` 内の線形代数成果物は、

```text
domains/linear-algebra/working/
```

へ移動する。

以後、Concept固有working artifactをCore rootへ置かない。

# 14. VisualとAssetを分離

Visual Specification：

```text
domains/linear-algebra/data/visuals/
```

実際の画像：

```text
domains/linear-algebra/assets/
```

推奨：

```text
assets/
├─ diagrams/
├─ infographics/
├─ thumbnails/
└─ generated/
```

# 15. Hybrid Visual Policy

全図をSVGに統一しない。

## SVG / programmatic が向くもの

- 座標軸
- ベクトル
- 関数グラフ
- 厳密な幾何図
- 正確な位置関係
- 数学的厳密性が重要

## Image Generation が向くもの

- Concept overview
- Infographic
- Misconception comparison
- Learning roadmap
- Summary visual
- Thumbnail
- 視線誘導を重視する説明図

基本方針：

```text
Exact Mathematical Diagram
→ SVG / programmatic

Conceptual Infographic
→ Image generation
```

# 16. Image Generation Artifact Contract

画像生成時は画像だけ保存して終わらせない。

例：

```yaml
id: infographic-basis-overview

concept: basis
type: infographic

generator:
  type: imagegen

learning_goal:
  ja: >
    基底が「空間全体を作れる」かつ「冗長でない」集合だと理解する。

prompt_spec:
  subject:
    ja: ...
  constraints:
    - ...
  avoid:
    - ...

source_claims:
  - claim-basis-definition

alt_text:
  ja: ...

asset:
  path: ../../assets/infographics/basis-overview.webp

status: published
```

画像生成API自体をCore runtime dependencyにはしない。Authoring Skillの能力として扱う。

# 17. Asset Format Policy

GitHub Pages運用を考慮する。

原則：

- generated raster → WebP推奨
- transparency必須 → WebP / PNG
- exact diagram → SVG
- unnecessary ultra-high-resolution禁止
- 1枚数MB級を常態化しない

推奨目安：

```text
thumbnail: 400–800 px
lesson infographic: 1000–1600 px
normal web target: 500 KB〜1 MB程度
```

hard limitではなく最適化目標。

# 18. Asset Size Report

可能なら：

```bash
npm run assets:report -- linear-algebra
```

を追加。

例：

```text
Linear Algebra Assets

SVG       8 files     84 KB
WebP      5 files    1.8 MB
PNG       0 files
Total               1.88 MB
```

警告/失敗候補：

- >2 MB normal image → warning
- >5 MB normal image → fail推奨
- missing alt
- visual spec without asset
- broken asset path

# 19. Skills配置

現在の `.agents/skills/` がCodex discoveryに必要なら壊さない。

推奨：

- 実体：`core/skills/`
- `.agents/skills/`：symlink または thin wrapper

ただし実行環境でsymlinkが不安定なら現状維持してよい。

重要なのはSkillをCore responsibilityとして扱うこと。

# 20. SkillとDomainの境界

Core SkillはDomain-independentにする。

悪い：

```text
openlearn-basis-writer
```

良い：

```text
openlearn-explanation-writer
```

Domain knowledgeはinput artifactから受け取る。

# 21. Tests再編

Core tests：

```text
tests/core/
```

- schema
- domain loader
- validator
- build infrastructure
- graph
- quality infrastructure

Domain tests：

```text
domains/linear-algebra/tests/
```

- basis acceptance
- domain content coverage
- visual availability
- curriculum references

Integration：

```text
tests/integration/
```

- Core + Linear Algebra build
- domain manifest generation
- final dist

# 22. Minimal Synthetic Domain

Core testsがLinear Algebra自体へ依存しないよう、

```text
tests/fixtures/minimal-domain/
```

を作ってよい。

# 23. README再編

root READMEは線形代数教材のREADMEではなくCore READMEへ変更する。

最低限：

- What is Open Learn Core
- Architecture
- Core vs Domains
- Current Domains
- Build
- Add a Domain
- Roadmap

Linear Algebraには：

```text
domains/linear-algebra/README.md
```

を作る。

内容：

- Scope
- Target learner
- Curriculum
- Concept list
- Current completeness
- Entry point
- Evidence policy
- Visual policy
- Build command

# 24. カリキュラム量の方針

Repository restructureと同時に、`basis`だけ高品質で他Conceptが薄い状態を明示的に管理する。

Linear Algebra mini-courseの中核Concept：

```text
vector
linear-combination
span
linear-independence
basis
dimension
coordinates
matrix-representation
```

既存IDに合わせる。

# 25. Concept Tier

品質を3 tierに分ける。

## Tier A — Flagship
v1.8完全品質。

現状：
- basis

## Tier B — Course Ready
十分なLesson / Example / Exercise / Visualを持ち単独学習可能。

最優先候補：
- span
- linear-independence
- dimension
- coordinates

## Tier C — Structural
Knowledge Graph上は存在するが教材は簡易。

# 26. Content Status

`domains/linear-algebra/docs/content-status.md` を作成する。

例：

| Concept | Tier | Lessons | Exercises | Visuals | Status |
|---|---|---:|---:|---:|---|
| basis | A | 6 | 20 | 3 | flagship |
| span | C | ... | ... | ... | thin |
| linear-independence | C | ... | ... | ... | thin |

「basisだけ完成」の状態を隠さない。

# 27. 次のContent Priority

再編後の優先順位：

```text
P0 span
P0 linear-independence
P1 dimension
P1 coordinates
P2 linear-combination
P2 matrix-representation
```

basisのさらなる肥大化よりこちらを優先する。

# 28. Course-level Quality Gate

将来、Concept単体GateだけでなくCourse Gateを導入可能な構造にする。

例：

```yaml
course: linear-algebra-basic

requirements:
  basis: flagship
  span: course_ready
  linear-independence: course_ready
  dimension: course_ready
  coordinates: course_ready
```

今回の完全実装は必須ではないが、設計をdocumentする。

# 29. 将来の別repo分割

今回の構造は将来的に：

```text
openlearn-core
openlearn-math-linear-algebra
openlearn-math-calculus
openlearn-physics
openlearn-portal
openlearn-assets
```

へ切り出せることを意識する。

DomainからCoreへの大量相対path依存を避ける。

可能ならinternal package interfaceを使う。

# 30. Monorepo Workspace

既存構成への影響が小さいならnpm workspace化してよい。

例：

```json
{
  "workspaces": [
    "core",
    "domains/*"
  ]
}
```

ただしMVPで大規模破壊になるなら不要。

# 31. Migration Strategy

一度に全部移して壊さない。

## Phase 1 — Inventory
現在のtreeを分類：

```text
CORE
DOMAIN_LINEAR_ALGEBRA
WORKING
DIST
DOC
UNKNOWN
```

`docs/migration.md` に旧path→新path mappingを書く。

## Phase 2 — New Structure
`core/` と `domains/linear-algebra/` を作る。旧fileはまだ削除しない。

## Phase 3 — Core Move
schemas / validator / graph / renderer / build / quality / shared skills を移す。Core testsをpass。

## Phase 4 — Domain Move
線形代数固有dataをDomainへ移す。`domain.yaml`を作る。Domain Loaderから読める状態にする。

## Phase 5 — Working Move
`_working/` の線形代数artifactをDomainへ移す。

## Phase 6 — Assets
SVG / visualを分類し、Domain assetsへ移す。path修正。

## Phase 7 — Build
build systemをDomain-aware化。旧path hardcodeを除去。

## Phase 8 — Regression
以下を全て実行：

```text
validate core
validate linear-algebra
test core
test domain
build linear-algebra
build all
```

## Phase 9 — Remove Legacy
全test pass後のみ旧directory削除。

# 32. Core Purity Rule

Core実装に以下のliteralがある場合は原則疑う。

```text
basis
span
linear-independence
MIT OCW
OpenStax
```

test fixture以外ではDomain固有語彙をhardcodeしない。

# 33. Domain Purity Rule

Domain dataに以下を入れない。

- machine-specific absolute path
- Core implementation detail
- local-only dependency
- user-specific config

# 34. Working Publish Policy

`working/` は公開buildへ含めない。

除外対象：

- audit drafts
- failed drafts
- search candidates
- temporary source material
- original oversized images
- debug artifacts

# 35. GitHub Pages Compatibility

最終的な `dist/` は静的サイトとして自己完結すること。

GitHub PagesはDomain構造を意識しなくてよい。

画像生成を使うこと自体は問題としない。Web公開用画像を最適化する。

# 36. Source Asset / Publish Asset

必要なら：

```text
assets/generated/source/
assets/generated/web/
```

へ分ける。

例：

```text
source PNG 4 MB
↓ optimize
web WebP 350 KB
```

公開にはWeb版のみ含める。

# 37. 将来Assets Repoを分離する条件

現時点では `openlearn-assets` を別repoにしない。

以下の状況で検討：

- repoが数百MB〜1GBへ接近
- 数千枚以上の画像
- audio/video導入
- cloneが重い
- GitHub Pages bandwidthが問題

# 38. Portalとの将来関係

将来 `openlearn-portal` を別repoとして作る。

PortalはCore内部fileを直接読まない。

各Domainが公開する：

```text
manifest.json
```

と `domain-index.json` のみを利用する。

# 39. Imagegen Visual Audit

generated imageは必ずVisual Auditor対象。

特に：

- basis=orthogonalと誤認させない
- 座標関係が不正確でない
- ベクトル本数が正しい
- 数学的意味を見た目で壊していない
- label文字化けがない
- alt textがある

# 40. Documentation

最低限：

```text
docs/
├─ architecture.md
├─ domain-system.md
├─ repository-layout.md
├─ asset-policy.md
└─ migration.md
```

Domain側推奨：

```text
domains/linear-algebra/docs/
├─ curriculum.md
├─ concept-map.md
└─ content-status.md
```

# 41. Tests

最低限追加：

## Core
- discover domain
- valid manifest
- invalid manifest fail
- load domain

## Domain
- linear-algebra loads
- curriculum resolves
- assets resolve
- concepts validate

## Build
- build linear-algebra
- generate domain manifest
- generate domain-index

## Purity
- CoreにDomain固有dataが不要
- Coreにbasis path hardcodeなし

# 42. Acceptance Criteria

## Structure
- AC1 `core/` が存在
- AC2 `domains/linear-algebra/` が存在
- AC3 Linear Algebra固有dataがDomainへ移動
- AC4 Coreに教材固有dataが残っていない

## Domain System
- AC5 `domain.yaml` が存在
- AC6 Domain Manifest Schemaが存在
- AC7 Domain Loaderが存在
- AC8 loaderでlinear-algebraを取得可能

## Build
- AC9 Domain単位validate可能
- AC10 Domain単位build可能
- AC11 全Domain build可能
- AC12 root `dist/` に統合出力
- AC13 Portal向けmanifest生成

## Assets
- AC14 Visual Specとactual assetが分離
- AC15 Linear Algebra assetはDomain配下
- AC16 SVG/imagegen hybrid policyがdocument
- AC17 asset path validation
- AC18 可能ならasset size report

## Working
- AC19 Working artifactsがDomainへ移動
- AC20 Working artifactsがpublishへ混入しない

## Tests
- AC21 Core tests pass
- AC22 Linear Algebra tests pass
- AC23 Integration build pass
- AC24 旧path dependencyなし

## Documentation
- AC25 root READMEがCore中心へ更新
- AC26 Linear Algebra READMEが存在
- AC27 `docs/migration.md` が存在
- AC28 `docs/asset-policy.md` が存在
- AC29 Linear Algebra content statusが可視化

# 43. Completion Check

Codexは完了時に以下へYESと答えられること。

1. Coreだけを見たときbasis固有知識が含まれていないか。
2. Linear Algebra教材は1directoryに閉じているか。
3. 新Domain追加時にCore code編集が不要か。
4. Domain ManifestだけでDomain discover可能か。
5. buildはDomain-awareか。
6. GitHub Pages出力は自己完結しているか。
7. image assetsはDomainごとに管理されているか。
8. SVGとgenerated infographicを使い分けられるか。
9. Portalが将来manifestだけでDomain一覧を作れるか。
10. Linear Algebraを将来別repoへ切り出せるか。
11. basis以外のConcept品質状況が見えるか。
12. span / linear-independence / dimension / coordinatesを次に強化できるか。

重大なNOがある場合、再編未完了。

# 44. Definition of Done

今回の成功条件はrepoを細かく分けることではない。

成功条件は：

```text
Open Learn Core
= 教材をbuildする共通エンジン

Linear Algebra Domain
= 共通エンジン上で動く教材パッケージ
```

という責務分離が成立すること。

最終イメージ：

```text
Core
├─ schemas
├─ skills
├─ validators
├─ quality
├─ build
└─ renderer
       │
       ↓
Domains
└─ Linear Algebra
   ├─ concepts
   ├─ lessons
   ├─ evidence
   ├─ exercises
   ├─ visuals
   └─ assets
       │
       ↓
      build
       │
       ↓
      dist
       │
       ↓
 GitHub Pages
```

既存v1.8機能が正常動作した時点でrepository restructure完了とする。

その後の最優先作業は、

```text
span
linear-independence
dimension
coordinates
```

を `basis` に近い品質へ引き上げ、

**「1個の完成Concept」ではなく「小さいが一貫したLinear Algebra Course」**

を成立させることである。
