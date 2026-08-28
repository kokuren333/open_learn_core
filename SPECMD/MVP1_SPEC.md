\# 教育OSS MVP v1 実装指示書



\## 0. このプロジェクトの目的



世界中に既に存在する良質な教育資源を、人間およびAIが再利用可能な形で整理・構造化し、誰でも無料で学習できるOSS教育基盤を作る。



最終的には、単なる「無料の教科書」ではなく、



\* 学習対象となる概念

\* 概念間の依存関係

\* 前提知識

\* 解説

\* 例

\* 演習

\* 解答

\* 誤解しやすいポイント

\* 出典

\* 学習順序

\* 習熟度評価



を機械可読な形式で管理し、Web教材・動画・問題集・学習支援AIなど複数の形式へ変換可能な教育OSS基盤を目指す。



ただし、今回実装するのは \*\*MVP v1のみ\*\* とする。



過剰な一般化やv2/v3の実装は行わない。



\---



\# 1. 長期ロードマップ



設計判断の参考として以下を理解すること。



\## MVP v1



数学の特定の狭い分野だけを対象として、



\*\*「知識を構造化し、概念関係を管理し、それを実際に学べる教材としてレンダリングすることが可能か」\*\*



を検証する。



今回実装するのはここまで。



\## MVP v2



小学算数から大学初年級程度までの数学全体を対象とする。



目標：



\* 数学全体を概念ノードとして管理

\* 分野間の接続を表現

\* prerequisiteを明示

\* 「ある概念を理解するために必要な子概念」を再帰的に辿れる

\* 学習者の現在地から目的概念までの学習経路を生成できる



例：



微分

↓ prerequisite

関数

↓

変数

↓

数



という単純な木ではなく、



微分

├─ 極限

│   ├─ 関数

│   ├─ 数列

│   └─ 実数

├─ 関数

└─ 代数操作



のような \*\*DAG（有向非巡回グラフ）に近い概念ネットワーク\*\* を想定する。



したがって、v1のデータ形式は将来的にグラフ構造へ拡張可能であること。



ただしv1でグラフDBなどを導入する必要はない。



\## MVP v3



既存の教科書・参考書の代替ではなく、



\*\*予備校・塾・家庭教師を部分的または全面的に代替できる無料学習システム\*\*



を目指す。



将来的には、



\* 理解度診断

\* adaptive learning

\* 問題推薦

\* 苦手概念の検出

\* prerequisiteへの自動遡及

\* 学習計画生成

\* 入試レベル別演習

\* 解答過程の評価

\* AI tutor

\* 復習タイミング最適化



などを実装する可能性がある。



v1では実装しない。



ただしデータを単なるMarkdown文章だけに閉じ込めないこと。



\---



\# 2. MVP v1 の研究目的



これは製品版ではなく \*\*Feasibility Study\*\* である。



以下の問いに答えるためのMVPを作る。



\### RQ1



数学教材を「文章」ではなく、「概念＋依存関係＋教材コンテンツ」として構造化できるか。



\### RQ2



その構造化データから、人間が実際に読んで学習可能なWeb教材を生成できるか。



\### RQ3



概念間の prerequisite を利用して、教材を読む順番や「先に理解すべき内容」を提示できるか。



\### RQ4



人間またはLLMが新しい概念・教材を追加しやすいデータ形式にできるか。



\### RQ5



将来的に小学算数～大学数学まで拡張しても、v1のデータ資産を捨てずに済むか。



\---



\# 3. MVP v1 の対象領域



大学初年級の線形代数の一部分を対象とする。



最初の概念セットとして以下を使用する。



1\. scalar

2\. vector

3\. vector-addition

4\. scalar-multiplication

5\. linear-combination

6\. span

7\. linear-independence

8\. basis

9\. dimension

10\. linear-map

11\. matrix

12\. matrix-representation



必要なら実装上自然になる範囲で追加してよい。



ただし20概念を超えないこと。



重要なのは教材量ではなく、



\*\*概念モデル → データ → UI\*\*



が一度完全に通ることである。



\---



\# 4. 基本思想



このプロジェクトでは、



「ページ」



ではなく



\*\*Concept\*\*



を最小単位とする。



例えば「基底」という概念について、



\* 基底とは何か

\* 理解するために何が必要か

\* どの概念と関係するか

\* どの教材で説明するか

\* どんな例があるか

\* 何を解ければ理解したと判断できるか



をデータとして持つ。



\---



\# 5. データモデル



実装前にSchemaを設計すること。



最低限、Conceptに以下を持たせる。



```yaml

id: basis



title:

&#x20; ja: 基底

&#x20; en: Basis



summary:

&#x20; ja: ベクトル空間を一意に表現するための...



prerequisites:

&#x20; - span

&#x20; - linear-independence



related:

&#x20; - dimension

&#x20; - matrix-representation



learning\_objectives:

&#x20; - 基底の定義を説明できる

&#x20; - 与えられたベクトル集合が基底か判定できる

&#x20; - 基底を用いてベクトルを座標表示できる



content:

&#x20; explanation: |

&#x20;   ...



examples:

&#x20; - id: basis-example-001

&#x20;   statement: ...

&#x20;   explanation: ...



exercises:

&#x20; - id: basis-exercise-001

&#x20;   type: short-answer

&#x20;   difficulty: basic

&#x20;   question: ...

&#x20;   answer: ...

&#x20;   explanation: ...



misconceptions:

&#x20; - 基底は一意に決まるとは限らない



sources:

&#x20; - id: source-001

&#x20;   title: ...

&#x20;   url: ...

&#x20;   license: ...

```



これは例であり、より良い形式を提案してよい。



ただし以下を守る。



\### MUST



コンテンツ本文とメタデータを区別できること。



\### MUST



Concept IDは人間にも読めるstable identifierとする。



\### MUST



prerequisiteをID参照で表現する。



\### MUST



source / citationを保持できる。



\### MUST



日本語・英語など多言語化可能な構造にする。



MVPでは日本語だけ実データを用意してもよい。



\### MUST



Schema validationを実装する。



\### SHOULD



YAMLまたはJSONを使用する。



人間がGitHub上で編集しやすいことを優先する。



\---



\# 6. Curriculum と Concept を分離する



重要。



概念そのものと、



「どの順番で教えるか」



は別の問題である。



したがって、



```text

concepts/

curricula/

```



を分けること。



例：



```yaml

id: linear-algebra-basic



title: 線形代数入門



sequence:

&#x20; - scalar

&#x20; - vector

&#x20; - vector-addition

&#x20; - scalar-multiplication

&#x20; - linear-combination

&#x20; - span

&#x20; - linear-independence

&#x20; - basis

&#x20; - dimension

```



Concept graph上では複数の経路があり得る。



Curriculumは、そのうち一つの学習順序を定義するものとする。



\---



\# 7. Evidence / Source



将来的には既存の



\* evidence-note-generater-skill

\* BiimSlideMaker



との統合を想定する。



参考：



https://github.com/kokuren333/evidence-note-generater-skill



https://github.com/kokuren333/BiimSlideMaker



ただし、このMVPではそれらへの強い依存は作らない。



evidence-note-generaterの思想である、



\*\*「LLMの生成文だけを信頼するのではなく、根拠となるsourceを保持する」\*\*



という考え方は取り入れる。



各Conceptはsourceを参照可能にする。



将来的には、



```text

source

↓

evidence note

↓

concept

↓

lesson

↓

web / pdf / video

```



というパイプラインへ拡張可能にする。



\---



\# 8. Web UI



MVPでは非常に簡単でよい。



静的サイトとして動作することを優先する。



GitHub Pages等へ容易にdeployできる構成が望ましい。



最低限以下を実装する。



\## 8.1 Concept一覧



全Conceptを表示。



例：



```text

線形代数



ベクトル

↓

線形結合

↓

span

↓

線形独立

↓

基底

↓

次元

```



\---



\## 8.2 Conceptページ



Conceptを開くと以下を表示。



\* タイトル

\* short summary

\* prerequisite

\* learning objectives

\* explanation

\* examples

\* exercises

\* misconceptions

\* sources

\* related concepts



\---



\## 8.3 prerequisite navigation



例えばBasisページでは、



```text

この内容を理解する前に：



✓ ベクトル

✓ 線形結合

✓ span

✓ 線形独立

```



を表示する。



各項目からConceptページへ遷移できる。



\---



\## 8.4 Concept graph



MVPとして簡単な可視化を行う。



例えば、



```text

vector

&#x20;  ↓

linear combination

&#x20;  ↓

span ─────────┐

&#x20;  ↓          │

linear independence

&#x20;  ↓          │

basis ←───────┘

&#x20;  ↓

dimension

```



程度でよい。



巨大なgraph libraryを使う必要はない。



ただしv2で数百～数千Conceptに拡張できるよう、UIとデータ層を密結合させない。



\---



\# 9. 検証機能



教材データに対してvalidatorを用意する。



最低限チェックする。



\* ID duplicate

\* prerequisiteとして指定されたConceptが存在するか

\* related Conceptが存在するか

\* prerequisite cycle

\* required field

\* curriculumから参照されたConceptが存在するか



可能なら、



```bash

npm run validate

```



など1コマンドで検証できるようにする。



\---



\# 10. テスト



最低限以下をテストする。



\### Schema validation



正常なConceptが通る。



不正Conceptが失敗する。



\### Broken reference



存在しないConcept IDをprerequisiteとして指定した場合に検出する。



\### Cycle detection



A → B → A



のような循環を検出する。



\### Curriculum validation



Curriculum内のConcept参照を検証する。



\---



\# 11. 推奨ディレクトリ構造



必要なら変更してよい。



```text

/

├─ README.md

├─ AGENTS.md

├─ package.json

│

├─ data/

│  ├─ concepts/

│  │  ├─ vector.yaml

│  │  ├─ linear-combination.yaml

│  │  ├─ span.yaml

│  │  ├─ linear-independence.yaml

│  │  └─ basis.yaml

│  │

│  ├─ curricula/

│  │  └─ linear-algebra-basic.yaml

│  │

│  └─ sources/

│

├─ schemas/

│  ├─ concept.schema.json

│  └─ curriculum.schema.json

│

├─ src/

│  ├─ data/

│  ├─ graph/

│  ├─ validation/

│  └─ web/

│

├─ scripts/

│  └─ validate.\*

│

└─ tests/

```



\---



\# 12. 技術選定



技術は過度に複雑にしないこと。



以下を優先する。



1\. OSS

2\. GitHub管理しやすい

3\. 静的hosting可能

4\. データとUIが分離

5\. dependencyが少ない

6\. 長期保守しやすい

7\. AI coding agentが扱いやすい



React等を使ってもよいが、必要性を判断すること。



Graph DB、backend server、authentication、databaseなどは原則MVP v1では不要。



「将来必要になるから」という理由だけで導入しない。



\---



\# 13. 教材内容について



MVPの教材品質も最低限検証できるレベルにする。



Lorem ipsumや「TODO:説明を書く」のようなダミーデータだけで終わらせない。



最低でも主要5Conceptについて、



\* explanation

\* example

\* exercise

\* answer/explanation

\* misconception

\* source



を実際に入れる。



対象候補：



\* vector

\* linear-combination

\* span

\* linear-independence

\* basis



数学的に誤った内容を入れない。



\---



\# 14. Sourceについて



Sourceは可能な限り、



\* Open Educational Resources

\* 大学公開教材

\* open textbook

\* 公的教育資料



など、公開・確認可能な資料を想定した構造にする。



ライセンス項目を持たせる。



ただし今回の実装では、大量の外部資料収集を主目的にしない。



\---



\# 15. MVP v1で実装しないもの



以下は禁止ではないが、今回作らない。



\* 小学校～大学までの全数学

\* ユーザーアカウント

\* DBサーバー

\* AI tutor

\* LLM API integration

\* 自動問題生成

\* adaptive learning

\* spaced repetition

\* 学習履歴

\* 動画自動生成

\* BiimSlideMaker統合

\* evidence-note-generater自動統合

\* graph database

\* ベクトルDB

\* recommendation engine

\* 本格的CMS

\* スマホアプリ

\* 課金

\* 認証

\* LMS



必要なのは、



\*\*Concept graphを持つ数学教材をOSSとして実際に構築可能であることを証明すること\*\*



だけである。



\---



\# 16. READMEに記載すること



READMEには最低限以下を書く。



\## What



何を作っているか。



\## Why



なぜ普通のMarkdown教材ではなくConcept-based architectureなのか。



\## Architecture



```text

Sources

&#x20;  ↓

Concept Data

&#x20;  ↓

Curriculum

&#x20;  ↓

Renderer

&#x20;  ↓

Web

```



\## Run



ローカルで起動する方法。



\## Validate



データ検証方法。



\## Add a Concept



新しいConceptの追加方法。



\## Roadmap



MVP v1 → v2 → v3



\---



\# 17. 実装方針



最初にコードを書き始めないこと。



まずrepositoryを確認したうえで、



1\. architecture

2\. data model

3\. technology choice

4\. directory structure

5\. MVP acceptance criteria



を簡潔に `docs/design.md` にまとめる。



その後、実装する。



ただし設計文書だけ作って終了せず、MVPを最後まで動作させる。



\---



\# 18. Acceptance Criteria



MVP v1完成条件は以下。



\### AC1



10前後の数学Conceptがmachine-readableな形式で保存されている。



\### AC2



各Conceptがprerequisiteを持てる。



\### AC3



prerequisite graphを生成できる。



\### AC4



ConceptをWeb教材として閲覧できる。



\### AC5



Conceptページからprerequisiteへ移動できる。



\### AC6



Curriculumとして学習順序を定義できる。



\### AC7



Schema validationが存在する。



\### AC8



Broken referenceを検出できる。



\### AC9



Prerequisite cycleを検出できる。



\### AC10



最低5Conceptについて実際に学習可能な教材内容が存在する。



\### AC11



GitHub Pagesなどの静的hostingに載せられる。



\### AC12



READMEだけ読めば第三者がConceptを1つ追加できる。



\---



\# 19. 最重要原則



このMVPの評価基準は、



\*\*「見栄えのいい教材サイトができたか」ではない。\*\*



評価したいのは、



> 数学という知識体系をConcept単位で構造化し、

> その構造から実際の教材を生成するという設計が成立するか



である。



したがって、



UI 30%

データ構造 40%

検証可能性 20%

教材内容 10%



程度の優先順位で考えること。



特に、文章をページごとにハードコードして単なる静的教材サイトを作ることは、このMVPの目的を満たさない。



\*\*教材のSingle Source of TruthはConceptデータでなければならない。\*\*



WebページはそのConceptデータから生成されるviewであること。



\---



\# 20. 最初に行う作業



以上を踏まえて、次の順序で作業を開始する。



1\. repositoryを確認

2\. `docs/design.md` を作成

3\. Concept Schemaを定義

4\. Curriculum Schemaを定義

5\. validatorを実装

6\. 5Conceptの実データを作成

7\. Web rendererを実装

8\. prerequisite navigationを実装

9\. concept graphを実装

10\. Conceptを10前後まで増やす

11\. test

12\. README整備



設計上の細かな判断は自律的に行ってよい。



ただし、MVP v1の目的から外れる大規模な機能追加は行わない。



