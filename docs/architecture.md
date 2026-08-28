# Architecture

Open Learn Coreは教材をbuildする共通エンジンです。DomainはConcept、Curriculum、Evidence、Assessment、Visual、Working artifactを所有する教材パッケージです。

```text
Core (schema / validation / graph / quality / renderer / build)
                         ↓
Domain manifest + data + assets
                         ↓
                 domain-aware build
                         ↓
              root dist + domain manifest
```

Coreは特定の数学用語、source、画像、教材本文を知りません。新しいDomainは`domains/<id>/domain.yaml`とデータパッケージを追加し、Coreのloaderを利用します。
