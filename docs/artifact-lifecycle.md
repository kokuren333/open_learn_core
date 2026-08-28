# Artifact Lifecycle

```text
_working/  調査・分析・draft・audit
data/      Publish Gate通過後のdurable machine-readable data
dist/      rendererが生成する公開教材
```

v1.7では`_working/basis/`にscope、検索ログ、source appraisal、Evidence draft、Claim map、pedagogy plan、Lesson outline、infographic brief、5つのaudit結果を保存します。`data/`には既存のConcept/Evidenceに加えVisual Artifactを保存し、`dist/build-report.json`が公開状態と件数を記録します。
