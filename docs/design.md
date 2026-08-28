# MVP v1.5 設計

## Architecture

```text
Sources → Concept JSON（Concept / Lesson / Claim / Exercise）→ Curriculum JSON → Validator / Renderer → 静的HTML
```

### 設計判断

- **技術**: Node.js標準ライブラリのみ。データ検証、静的生成、テストを外部依存なしで動かせるようにする。
- **データ**: 人間がGitHub上で編集しやすいJSONを採用する。ConceptとCurriculumは別ディレクトリに置く。v1.5ではConcept内の責務をConcept、Lesson、Claim、Exerciseに分ける。
- **表示**: `npm run build`で`site/`を生成する。生成物はWebサーバーやGitHub Pagesにそのまま配置できる。
- **グラフ**: Conceptの`prerequisites`を有向辺として扱い、生成時にSVGへ変換する。UIはデータ層から独立している。
- **検証**: JSON Schema（`schemas/`）による形検証に加え、参照切れ、重複ID、循環、Curriculum参照を検査する。

## Data model

Conceptのメタデータ（ID、題名、要約、参照関係、出典）と学習コンテンツを分離する。`prerequisites`と`related`はstableなConcept IDのみを保持し、表示時に解決する。

### 責務

- **Concept**: 概念のstable identity、summary、prerequisite graph、関連概念、全体の学習目標を持つ。
- **Lesson**: そのConceptを教える小さな単位。直観・定義・関係・方法などの順序付きsectionと、対応するExercise IDを持つ。
- **Claim**: 教材の中で検証可能にしたい主張。1つ以上の`sourceRefs`を持ち、source IDと人間が再訪できるlocatorを保存する。
- **Exercise**: 習得を確認する問題。basic / standard / challengeの難易度、答え、解説、対象Lessonを持てる。

```text
Concept
├─ lessons[]
│  ├─ sections[] ── claimRefs[] → claims[] ── sourceRefs[] → sources[]
│  └─ exerciseIds[] → exercises[]
└─ diagnosticQuestions[]
```

```json
{
  "id": "basis",
  "title": { "ja": "基底", "en": "Basis" },
  "summary": { "ja": "...", "en": "..." },
  "prerequisites": ["span", "linear-independence"],
  "related": ["dimension"],
  "learningObjectives": ["基底の定義を説明できる"],
  "lessons": [{
    "id": "basis-lesson-02",
    "title": "定義の2条件",
    "summary": "spanと線形独立を同時に確認する。",
    "objectives": ["基底の2条件を使って判定できる"],
    "sections": [{
      "id": "basis-section-02",
      "title": "生成かつ独立",
      "kind": "definition",
      "body": "...",
      "claimRefs": ["basis-claim-01"]
    }],
    "exerciseIds": ["basis-basic-003"]
  }],
  "claims": [{
    "id": "basis-claim-01",
    "statement": "基底は空間をspanし、線形独立な集合である。",
    "sourceRefs": [{"source": "mit-ocw-linear-algebra", "locator": "Lecture 3: Basis and dimension"}]
  }],
  "content": { "explanation": "..." },
  "examples": [],
  "exercises": [],
  "misconceptions": [],
  "sources": ["mit-ocw-linear-algebra"]
}
```

## MVP v1.5 acceptance criteria

1. 12 ConceptをJSONで保存する。
2. Conceptからprerequisiteを辿れる。
3. Curriculumで学習順序を定義する。
4. ValidatorがSchema、参照、循環、Curriculumを検証する。
5. 12 Conceptの一覧、詳細、prerequisiteリンク、SVGグラフを静的HTMLとして生成する。
6. 12 ConceptにLesson / Claim / Exerciseを持たせる。
7. `linear-independence`と`basis`は、それぞれ5 Lesson・13 Exercise・3 Diagnostic・5 Claimを持つ。
8. Claimから出典URLとlocatorをたどれる。

## Technology and hosting

`site/`は相対リンクだけで構成するため、GitHub Pagesのプロジェクトページ配下でも動作する。動作確認は`npm run validate && npm test && npm run build`で行う。
