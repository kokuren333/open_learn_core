# MVP v1 設計

## Architecture

```text
Sources → Concept JSON → Curriculum JSON → Validator / Renderer → 静的HTML
```

### 設計判断

- **技術**: Node.js標準ライブラリのみ。データ検証、静的生成、テストを外部依存なしで動かせるようにする。
- **データ**: 人間がGitHub上で編集しやすいJSONを採用する。ConceptとCurriculumは別ディレクトリに置く。
- **表示**: `npm run build`で`site/`を生成する。生成物はWebサーバーやGitHub Pagesにそのまま配置できる。
- **グラフ**: Conceptの`prerequisites`を有向辺として扱い、生成時にSVGへ変換する。UIはデータ層から独立している。
- **検証**: JSON Schema（`schemas/`）による形検証に加え、参照切れ、重複ID、循環、Curriculum参照を検査する。

## Data model

Conceptのメタデータ（ID、題名、要約、参照関係、出典）と学習コンテンツ（説明、例、演習、誤解）を分離する。`prerequisites`と`related`はstableなConcept IDのみを保持し、表示時に解決する。

```json
{
  "id": "basis",
  "title": { "ja": "基底", "en": "Basis" },
  "summary": { "ja": "...", "en": "..." },
  "prerequisites": ["span", "linear-independence"],
  "related": ["dimension"],
  "learningObjectives": ["基底の定義を説明できる"],
  "content": { "explanation": "..." },
  "examples": [],
  "exercises": [],
  "misconceptions": [],
  "sources": ["mit-ocw-linear-algebra"]
}
```

## MVP acceptance criteria

1. 12 ConceptをJSONで保存する。
2. Conceptからprerequisiteを辿れる。
3. Curriculumで学習順序を定義する。
4. ValidatorがSchema、参照、循環、Curriculumを検証する。
5. 12 Conceptの一覧、詳細、prerequisiteリンク、SVGグラフを静的HTMLとして生成する。
6. 主要5 Conceptに実用的な説明、例、演習、解答、誤解、出典を持たせる。

## Technology and hosting

`site/`は相対リンクだけで構成するため、GitHub Pagesのプロジェクトページ配下でも動作する。動作確認は`npm run validate && npm test && npm run build`で行う。
