# Repository Migration

旧pathからDomain-aware pathへの対応は次の通りです。

| Legacy | New |
|---|---|
| `schemas/` | `core/schemas/` |
| `src/` | `core/src/` |
| `.agents/skills/` | `core/skills/`（discovery用の現行コピーも維持） |
| `data/` | `domains/linear-algebra/data/` |
| `_working/` | `domains/linear-algebra/working/` |
| `tests/validation.test.mjs` | `tests/core/validation.test.mjs` |
| `tests/quality-gate.test.mjs` | `tests/core/quality-gate.test.mjs` |

旧directoryは段階移行後に削除し、Core CLIはDomain Loader経由でのみデータを読みます。`dist/`はrootに集約し、Domain別出力は`dist/domains/<domain-id>/`へ配置します。
