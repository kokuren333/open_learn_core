# Linear Algebra Domain

## Scope

高校数学の代数を前提に、大学初年級向けの線形代数を、ベクトル・連立方程式・行列からSVDと代表的応用まで一貫して扱います。

## Current status

V2.0では52 Learning Unitsをauthored/audited状態にし、8 Module exercise sets、完全解答、5つの累積レビュー、HTML/PDF/video sourceを揃えています。詳細は[`docs/content-status.md`](docs/content-status.md)を参照してください。

## Curriculum and entry point

The entry curriculum is `linear-algebra-basic`, while the learner-facing canonical route is `linear-algebra-foundations-to-applications`. The Course sequence—not the Knowledge Graph—controls navigation. The evidence-backed research and V2.0 freeze manifest live under `working/curriculum-review/`.

The course has 8 ordered Modules and 52 Learning Units. Every Unit includes a learner-facing explanation, definitions, examples, a boundary case, a checkpoint, a next connection, and exercises with complete solutions. Three foundational Units also have BiimSlideMaker-compatible video source packages.

## Concept list

`scalar`, `scalar-multiplication`, `vector`, `vector-addition`, `linear-combination`, `span`, `linear-independence`, `basis`, `dimension`, `linear-map`, `matrix`, and `matrix-representation`.

## Evidence and visual policy

Mathematical claims are linked to EvidenceItems and source locators under `data/evidence/` and `data/sources/`. Visual Specifications live under `data/visuals/`; exact mathematical diagrams are kept as SVG assets, while conceptual infographics may use optimized generated raster assets. Every published visual needs an accessible alt text, claim linkage, and a lesson placement.

## Build

```bash
npm run validate:domain -- linear-algebra
npm run build:domain -- linear-algebra
npm run test:domain -- linear-algebra
npm run course:audit -- linear-algebra
npm run build -- linear-algebra
npm run build:pdf -- linear-algebra
npm run build:video -- linear-algebra
npm run publication:audit -- linear-algebra
```

Video sources are tracked under `video/units/`; generated Biim compatibility files and media are ignored. See [`../../docs/video-protocol.md`](../../docs/video-protocol.md) and [`../../docs/pdf-pipeline.md`](../../docs/pdf-pipeline.md) for the multi-format contracts.

Domain固有データは`data/`、Visual Specificationは`data/visuals/`、公開用/生成用assetは`assets/`、authoring artifactは`working/`に置きます。Unitは`data/units/`、演習と解答はUnit内および`data/exercises/`、記法は`config/notation.yaml`、引用は`data/sources/`とEvidenceに置きます。出典とEvidenceを先に確認し、Coreのschema・validator・Course completeness gateを通過したものだけを公開します。コードはMIT、オリジナル教材はCC BY-SA 4.0です。
