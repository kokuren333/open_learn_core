# Repository Layout

```text
core/                         # 共通エンジンとschema/skills
domains/linear-algebra/       # 線形代数Domain
docs/                         # repo-wide architecture docs
tests/core/                   # Core unit tests
tests/integration/            # Core + Domain build tests
dist/                         # GitHub Pages向け公開成果物
```

`working/`はDomain内部に置き、公開`dist/`へコピーしません。Visual SpecificationはDomain data、実際の画像はDomain assetsとして分離します。
