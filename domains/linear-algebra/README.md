# Linear Algebra Domain

## Scope

大学初年級向けに、スカラー、ベクトル、線形結合、span、線形独立、基底、次元、線形写像、行列、行列表現を扱います。

## Current status

`basis`がTier Aのflagship教材です。その他のConceptはKnowledge Graphとカリキュラムを支えるTier Cから整備中です。詳細は[`docs/content-status.md`](docs/content-status.md)を参照してください。

## Curriculum and entry point

The entry curriculum is `linear-algebra-basic`, beginning at `vector`. The current quality-gate entry point is the complete `basis` concept; the course graph exposes the route from scalar and vector operations through combinations, span, independence, basis, dimension, and matrix representation.

The v1.9 teaching layer is `linear-algebra-foundations-to-applications`: 8 ordered Modules and 52 Learning Units. Learner navigation follows the Course and Module pages; the Knowledge Graph remains a separate reference structure. The first six vector-space Units (`linear-combination` through `coordinate-vectors`) are the initial authored slice, with HTML content, PDF source adaptation, and three video pilots.

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
npm run build:all
```

Video sources are tracked under `video/units/`; generated Biim compatibility files and media are ignored. See [`../../docs/video-protocol.md`](../../docs/video-protocol.md) and [`../../docs/pdf-pipeline.md`](../../docs/pdf-pipeline.md) for the multi-format contracts.

Domain固有データは`data/`、Visual Specificationは`data/visuals/`、公開用/生成用assetは`assets/`、authoring artifactは`working/`に置きます。出典とEvidenceを先に確定し、Coreのschema・validator・quality gateを通過したものだけを公開します。
