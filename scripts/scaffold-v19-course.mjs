import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const domainRoot = path.join(root, "domains", "linear-algebra");
const dataRoot = path.join(domainRoot, "data");
const jp = (ja, en) => ({ ja, en });
const block = (type, body, claimRefs = []) => ({ type, body, ...(claimRefs.length ? { claimRefs } : {}) });
const solution = (what_is_asked, concepts, strategy, steps, why, conclusion, common_wrong_path, alternative = "") => ({ what_is_asked, concepts, strategy, steps, why, conclusion, common_wrong_path, ...(alternative ? { alternative } : {}) });

const moduleDefinitions = [
  ["module-prerequisites-vectors", 0, "Prerequisites and Vectors", "ベクトルの言葉と計算", ["scalars", "vectors", "vector notation", "addition", "scalar multiplication", "dot product", "norm", "distance"]],
  ["module-systems-matrices", 1, "Linear Systems and Matrices", "連立方程式を行列で解く", ["linear equations", "matrix notation", "row operations", "Gaussian elimination", "RREF", "pivots", "consistency", "matrix multiplication", "inverse", "LU decomposition"]],
  ["module-vector-spaces", 2, "Vector Spaces and Subspaces", "ベクトル空間と部分空間", ["vector spaces", "subspaces", "span", "column space", "row space", "null space", "independence", "basis", "coordinates", "dimension", "rank", "rank-nullity", "four fundamental subspaces"]],
  ["module-linear-transformations", 3, "Linear Transformations", "線形写像で構造を見る", ["linear transformation", "kernel", "image", "matrix representation", "coordinate vectors", "change of basis", "composition", "inverse", "similarity"]],
  ["module-orthogonality", 4, "Orthogonality", "直交性と最小二乗", ["orthogonality", "orthogonal complement", "projection", "orthonormal basis", "Gram-Schmidt", "QR", "least squares", "pseudoinverse"]],
  ["module-determinants", 5, "Determinants", "行列式と可逆性", ["determinant intuition", "definition", "properties", "computation", "geometry", "invertibility", "volume", "orientation"]],
  ["module-eigenvalues", 6, "Eigenvalues and Eigenvectors", "固有値で変換を分解する", ["eigenvalue", "eigenvector", "characteristic polynomial", "eigenspace", "multiplicity", "diagonalization", "symmetric matrices", "spectral theorem", "positive definite"]],
  ["module-applications", 7, "Applications and Advanced Topics", "応用と発展", ["quadratic forms", "SVD", "low-rank approximation", "PCA", "Markov matrices", "graph matrices", "differential equations", "Fourier", "numerical stability"]],
];

const unitDefinitions = [
  ["module-prerequisites-vectors", ["scalar-introduction", "vector-introduction", "vector-notation", "vector-addition", "scalar-multiplication", "dot-product-and-norm"]],
  ["module-systems-matrices", ["linear-equations", "matrix-introduction", "matrix-operations", "gaussian-elimination", "rref-and-pivots", "inverse-and-lu"]],
  ["module-vector-spaces", ["vector-spaces", "subspaces", "linear-combination", "span", "linear-independence", "basis-definition", "dimension-and-rank", "coordinate-vectors"]],
  ["module-linear-transformations", ["linear-transformations", "kernel-and-image", "matrix-representation", "coordinate-maps", "change-of-basis", "composition-and-similarity"]],
  ["module-orthogonality", ["orthogonality", "orthogonal-complement", "projection", "orthonormal-bases", "gram-schmidt", "qr-least-squares"]],
  ["module-determinants", ["determinant-intuition", "determinant-definition", "determinant-properties", "determinant-computation", "determinant-invertibility", "determinant-volume"]],
  ["module-eigenvalues", ["eigenvalue-eigenvector", "characteristic-polynomial", "eigenspace-and-multiplicity", "diagonalization", "symmetric-spectral-theorem", "positive-definite-matrices"]],
  ["module-applications", ["quadratic-forms", "svd-intuition", "low-rank-approximation", "pca-connection", "markov-matrices", "graph-network-matrices", "differential-and-fourier", "numerical-stability"]],
];

const pilot = {
  "linear-combination": {
    title: jp("線形結合とは何を作る操作か", "What Is a Linear Combination?"), primary: ["linear-combination"], supporting: ["vector", "scalar-multiplication"], prerequisites: ["vector-introduction", "scalar-multiplication"],
    objectives: ["線形結合を係数とベクトルの組として説明できる", "係数を変えたときに作れるベクトルの違いを計算できる"],
    blocks: [
      ["motivation", "二つのベクトルを足し合わせるだけでなく、係数を変えながら組み合わせると、どのようなベクトルを作れるでしょうか。線形結合は、後でspanや基底を理解するための共通の操作です。"],
      ["concrete_case", "v=(1,0) と w=(0,1) を考えます。2v+3w=(2,3) なので、係数2と3を選ぶだけで平面上の点を指定できます。係数の組と結果のベクトルを対応させることが出発点です。"],
      ["definition", "ベクトル v₁,…,vₖ とスカラー c₁,…,cₖ に対して、c₁v₁+⋯+cₖvₖ をそれらの線形結合と呼びます。係数は実数でも、扱うベクトル空間が指定するスカラーでも構いません。"],
      ["worked_example", "u=(1,2), v=(3,-1) から (7,3) を作れるか調べます。係数を a,b と置くと a+3b=7、2a-b=3 です。第一式から a=7-3b、これを第二式へ代入して14-7b=3、b=11/7、a=16/7を得ます。したがって (7,3)=(16/7)u+(11/7)v です。"],
      ["checkpoint", "確認：線形結合で変えられるのは係数であり、元のベクトルを途中で別の方向へ曲げる操作ではありません。係数をすべて0にすれば、どんなベクトル集合からも零ベクトルが作れます。"],
      ["connection", "係数を自由に動かしたときに到達できる集合全体がspanです。次のUnitでは、個別の計算結果ではなく、この到達可能な集合を調べます。"],
    ],
    exercises: [{ id: "linear-combination-ex-01", type: "calculation", difficulty: "basic", question: "u=(1,2), v=(2,1) の線形結合 3u−v を求めよ。", solution: solution("3u−vを成分ごとに計算する。", ["vector", "scalar-multiplication"], "各ベクトルを係数倍してから加える。", ["3u=(3,6)を計算する。", "−v=(−2,−1)を計算する。", "成分を加えて(1,5)を得る。"], ["係数倍は各成分に同じ係数を掛ける操作だから。", "ベクトル加法は対応する成分を足すから。"], "3u−v=(1,5)。", "係数を一部の成分だけに掛けると、別のベクトルを計算してしまう。") }],
  },
  span: {
    title: jp("span：作れる範囲を集合として見る", "Span: The Set of Reachable Vectors"), primary: ["span"], supporting: ["linear-combination", "vector-space"], prerequisites: ["linear-combination"],
    objectives: ["spanを線形結合全体の集合として説明できる", "与えられたベクトルがspanに属するかを係数方程式で判定できる"],
    blocks: [
      ["motivation", "線形結合を一回計算するだけでは、選んだベクトルが空間のどこまで届くかは分かりません。係数をすべて変えて得られる集合をまとめて見ると、ベクトルの組が持つ幾何学的な広がりを比較できます。"],
      ["concrete_case", "(1,0)と(0,1)の線形結合は(a,b)で、a,bを自由に選べるため平面全体になります。一方、(1,2)だけの線形結合は(t,2t)に限られ、原点を通る一本の直線です。"],
      ["definition", "ベクトル集合Sのspanとは、Sのベクトルの有限個の線形結合すべてからなる集合です。span(S)は必ずそのベクトルを含み、線形結合をさらに作っても外へ出ない最小の線形部分空間になります。"],
      ["worked_example", "(2,1)と(1,1)が(5,3)をspanするか調べます。2a+b=5、a+b=3を解くとa=2、b=1です。係数が存在するので(5,3)はこの二本のspanに含まれます。"],
      ["counterexample", "同じ方向の(1,2)と(2,4)では、線形結合が(t,2t)の形にしかなりません。(1,1)はこの形でないためspanに含まれません。ベクトルの本数だけで平面全体を作れるとは限りません。"],
      ["checkpoint", "spanは「選んだベクトルそのもの」ではなく、係数を変えたときに作れる全範囲です。次は、その範囲を作る表現に重複がないかを線形独立性で調べます。"],
    ],
    exercises: [{ id: "span-ex-01", type: "recognition", difficulty: "basic", question: "(1,0)のspanを幾何学的に説明せよ。", solution: solution("一つのベクトルから作れる集合を説明する。", ["span", "linear-combination"], "係数tを置いて一般形を書く。", ["t(1,0)=(t,0)と表す。", "tが実数全体を動くのでx軸上の全点を得る。"], ["spanは全ての係数の線形結合だから。"], "原点を通るx軸である。", "一本のベクトルのspanを平面全体と考えるのは、独立な方向が足りないため誤り。") }],
  },
  "linear-independence": {
    title: jp("線形独立性：表現に重複がない", "Linear Independence: No Redundant Representation"), primary: ["linear-independence"], supporting: ["span", "linear-combination"], prerequisites: ["span"],
    objectives: ["線形独立性を零ベクトルの表現で判定できる", "spanと線形独立性が別の条件であることを説明できる"],
    blocks: [
      ["motivation", "同じベクトルを作る方法が複数あると、係数を座標として使うときに困ります。spanが「どこまで作れるか」を表すのに対し、線形独立性は「同じ作り方が重複していないか」を表します。"],
      ["concrete_case", "(1,0)と(0,1)ではa(1,0)+b(0,1)=(0,0)となるのはa=b=0だけです。一方、(1,0),(0,1),(1,1)では(1,1)−(1,0)−(0,1)=0という非自明な関係があります。"],
      ["definition", "ベクトルv₁,…,vₖが線形独立とは、c₁v₁+⋯+cₖvₖ=0を満たす係数がすべて0だけであることです。0以外の係数による関係があれば、少なくとも一本は他のベクトルの線形結合で表せます。"],
      ["worked_example", "v₁=(1,2), v₂=(2,4)を調べます。c₁v₁+c₂v₂=0はc₁+2c₂=0という一つの条件にまとまり、c₂=1,c₁=−2が非零解になります。したがって二本は線形従属です。"],
      ["counterexample", "spanが同じでも独立性は異なります。(1,0),(0,1)は平面をspanし独立ですが、そこへ(1,1)を加えてもspanは平面のまま、独立性だけが失われます。"],
      ["checkpoint", "独立性は「本数が少ない」ことではありません。非自明な零関係がないことが定義です。次のUnitでは、spanと独立性を同時に満たす集合として基底を定義します。"],
    ],
    exercises: [{ id: "linear-independence-ex-01", type: "error_detection", difficulty: "standard", question: "二本のベクトルが同じ方向なら、なぜ線形独立でないか説明せよ。", solution: solution("同方向という幾何的条件から零関係を作る。", ["linear-independence", "linear-combination"], "一方を他方の定数倍として表す。", ["v₂=kv₁と書く。", "kv₁−v₂=0を作る。", "係数(k,−1)はすべて0ではない。"], ["非自明な係数で零ベクトルを作れたので、定義に反する。"], "同方向の二本は線形従属である。", "二本あるから独立だと判断するのは、本数と独立性を混同している。") }],
  },
  "basis-definition": {
    title: jp("基底：spanと独立性を同時に満たす", "Basis: Spanning Without Redundancy"), primary: ["basis"], supporting: ["span", "linear-independence"], prerequisites: ["span", "linear-independence"],
    objectives: ["基底の二条件を説明できる", "基底が存在と一意性を与える理由を例で説明できる"],
    blocks: [
      ["motivation", "空間を作れるだけなら、余分なベクトルをいくら加えてもよい。しかし座標や計算に使う材料としては、足りないことも重複することも避けたい。基底はこの二つの要求を一つの概念にまとめます。"],
      ["concrete_case", "平面の標準基底e₁=(1,0),e₂=(0,1)は平面をspanし、二本は独立です。(1,1)を追加してもspanは変わりませんが、独立性が壊れます。逆に一本だけでは平面をspanできません。"],
      ["definition", "ベクトル集合Bがベクトル空間Vの基底であるとは、BがVをspanし、かつBが線形独立であることです。spanは全てのベクトルを表せること、独立性はその表現が重複しないことを保証します。"],
      ["worked_example", "B={(1,1),(1,−1)}がR²の基底か調べます。係数a,bで(a+b,a−b)=(x,y)を解くとa=(x+y)/2,b=(x−y)/2が常に存在し、零ベクトルの場合の解もa=b=0だけです。よってspanと独立性の両方が成り立ちます。"],
      ["connection", "基底があると、各ベクトルに係数の組を対応させられます。その係数が座標です。また、同じ空間の基底の本数が一致する事実が次の次元へつながります。"],
      ["checkpoint", "基底は「きれいに見えるベクトル」や「直交するベクトル」に限定されません。重要なのは、空間をspanすることと、線形独立であることです。"],
    ],
    exercises: [{ id: "basis-definition-ex-01", type: "explanation", difficulty: "standard", question: "基底にspanと線形独立性の両方が必要な理由を説明せよ。", solution: solution("二条件が防ぐ失敗を対比する。", ["basis", "span", "linear-independence"], "不足と冗長性を別々に示す。", ["spanがなければ、空間の一部しか表せず材料不足になる。", "独立性がなければ、同じベクトルに複数の係数が対応して冗長になる。", "両方を満たすと表現の存在と一意性が得られる。"], ["基底を座標の基準として使うには、全てを表せて、しかも表し方が一つでなければならない。"], "spanは存在、独立性は一意性を支える。", "基底を単に『ベクトルの集合』とだけ説明すると二条件が抜ける。") }],
  },
  "dimension-and-rank": {
    title: jp("次元とrank：独立な方向の数", "Dimension and Rank: Counting Independent Directions"), primary: ["dimension", "rank"], supporting: ["basis", "linear-independence"], prerequisites: ["basis-definition"],
    objectives: ["次元を基底の本数として説明できる", "rankを列空間の次元として解釈できる"],
    blocks: [
      ["motivation", "平面を表す基底には二本、空間を表す基底には三本の独立な方向があります。見た目の大きさではなく、独立に動かせる方向の数を数える量が次元です。"],
      ["concrete_case", "R²の標準基底は二本ですが、斜めの二本の基底でも本数は二本です。同じ空間を張る基底の形は変わっても、本数は変わりません。この不変量がdimensionです。"],
      ["definition", "有限次元ベクトル空間Vの次元dim(V)は、Vの基底に含まれるベクトルの本数です。行列Aのrankは、Aの列が張る列空間の次元で、独立な列方向の数を表します。"],
      ["worked_example", "Aの列がc₁=(1,0,1), c₂=(0,1,1), c₃=(1,1,2)ならc₃=c₁+c₂です。三列は従属ですが、c₁,c₂は独立なので列空間の基底は二本、rank(A)=2です。"],
      ["connection", "行列の行基本変形でpivotの数を数えるとrankを計算できます。rankは解の自由度やnull spaceの次元とも関係し、rank-nullityへ進みます。"],
      ["checkpoint", "rankは行列の列数そのものではありません。列の中に重複する方向があれば、独立な方向だけがrankに寄与します。"],
    ],
    exercises: [{ id: "dimension-and-rank-ex-01", type: "calculation", difficulty: "standard", question: "c₁=(1,0,1), c₂=(0,1,1), c₃=(1,1,2)からrankを求めよ。", solution: solution("列空間の独立な方向数を求める。", ["rank", "linear-independence"], "列の関係を見つけ、独立な列を残す。", ["c₃=c₁+c₂を確認する。", "c₁とc₂は一方が他方の定数倍でないので独立。", "列空間の基底を二本選べる。"], ["従属な列は新しい方向を追加しないから。"], "rank(A)=2。", "列数3をそのままrankとするのは従属関係を見落としている。") }],
  },
  "coordinate-vectors": {
    title: jp("座標ベクトル：基底をものさしにする", "Coordinate Vectors: Measuring with a Basis"), primary: ["coordinates"], supporting: ["basis", "linear-combination", "dimension"], prerequisites: ["basis-definition", "dimension-and-rank"],
    objectives: ["基底に関する座標を係数の組として求められる", "基底を変えると座標が変わる理由を説明できる"],
    blocks: [
      ["motivation", "同じ幾何ベクトルでも、どの基底をものさしにするかで数値表現は変わります。座標はベクトルそのものではなく、選んだ基底に対する線形結合の係数です。"],
      ["concrete_case", "B={(1,1),(1,−1)}に対してv=(5,1)を表します。a(1,1)+b(1,−1)=(a+b,a−b)なので、a=3,b=2です。標準基底なら座標は(5,1)ですが、Bに関する座標は(3,2)です。"],
      ["definition", "基底B=(b₁,…,bₙ)に関するvの座標ベクトル[v]Bとは、v=c₁b₁+⋯+cₙbₙを満たす係数を並べた(c₁,…,cₙ)です。基底の独立性により、この係数は一意に定まります。"],
      ["worked_example", "B={(1,1),(1,−1)}、v=(5,1)ならa+b=5、a−b=1です。二式を足して2a=6、a=3。差を取って2b=4、b=2。したがって[v]B=(3,2)です。"],
      ["connection", "座標を使うと、基底に合わせた線形写像の行列表現を作れます。基底を変える操作は、同じベクトルを別の座標系で記述するchange of basisへつながります。"],
      ["checkpoint", "座標は基底を指定しないと意味が定まりません。(5,1)という数値だけを見て、常に標準基底の座標だと判断しないことが重要です。"],
    ],
    exercises: [{ id: "coordinates-ex-01", type: "calculation", difficulty: "standard", question: "B={(1,1),(1,−1)}に関するv=(5,1)の座標を求めよ。", solution: solution("vをBの線形結合で表す。", ["coordinates", "basis"], "未知係数を置いて連立方程式を解く。", ["a(1,1)+b(1,−1)=(a+b,a−b)と書く。", "a+b=5、a−b=1を立てる。", "加法で2a=6、減法で2b=4を得る。", "a=3,b=2を座標として並べる。"], ["座標の定義は基底ベクトルの係数だから。"], "[v]B=(3,2)。", "標準基底の成分(5,1)をそのまま使うと、基底Bへの変換をしていない。") }],
  },
};

function plannedUnit(id, moduleId, order) {
  const label = id.replaceAll("-", " ");
  return { id, module: moduleId, order, title: jp(label, label), summary: jp(`${label}を段階的に学ぶための計画Unit。`, `A planned unit on ${label}.`), estimated_duration: { reading_minutes: 7, video_minutes: 12 }, concepts: { primary: [id], supporting: [] }, prerequisites: [], learning_objectives: [`${label}の基本的な意味を説明できる`], content: [block("planned", `このUnitは、${label}を前提知識から例題・演習へ接続する教材として整備予定です。`)], exercises: [], formats: { html: { required: true, status: "planned" }, pdf: { required: true, status: "planned" }, video: { required: false, status: "not_planned" } }, evidence: [], visuals: [], remediation: [], status: "planned" };
}

const allUnits = [];
for (const [moduleId, units] of unitDefinitions) for (const [order, id] of units.entries()) {
  const spec = pilot[id];
  const unit = spec ? { id, module: moduleId, order, title: spec.title, summary: jp(`${spec.title.ja}を具体例と定義から学ぶ。`, `A guided unit on ${spec.title.en}.`), estimated_duration: { reading_minutes: 8, video_minutes: 12 }, concepts: { primary: spec.primary, supporting: spec.supporting }, prerequisites: spec.prerequisites, learning_objectives: spec.objectives, content: spec.blocks.map(([type, body]) => block(type, body)), exercises: spec.exercises, formats: { html: { required: true, status: "authored" }, pdf: { required: true, status: "source_ready" }, video: { required: true, status: "scripted" } }, evidence: [], visuals: [], remediation: spec.prerequisites.slice(0, 2), status: "authored" } : plannedUnit(id, moduleId, order);
  allUnits.push(unit);
}

const courseId = "linear-algebra-foundations-to-applications";
const course = { id: courseId, title: jp("線形代数：基礎から応用へ", "Linear Algebra: Foundations to Applications"), description: jp("ベクトルから数値線形代数と応用までを、Knowledge Graphとは分離したCourse順序で学ぶ。", "A course from vectors through numerical linear algebra and applications."), domain: "linear-algebra", modules: moduleDefinitions.map(([id]) => id), units: allUnits.map((unit) => unit.id), status: "experimental", requirements: { curriculum_review: "pass", required_modules_present: true, terminology_consistency: "pending", notation_consistency: "pending" }, evidence_review: "curriculum-review/decisions.yaml" };

await mkdir(path.join(dataRoot, "courses"), { recursive: true });
await mkdir(path.join(dataRoot, "modules"), { recursive: true });
await mkdir(path.join(dataRoot, "units"), { recursive: true });
await writeFile(path.join(dataRoot, "courses", `${course.id}.json`), JSON.stringify(course, null, 2) + "\n");
for (const [id, order, titleEn, titleJa, topics] of moduleDefinitions) {
  const units = unitDefinitions.find(([moduleId]) => moduleId === id)[1];
  const module = { id, course: courseId, order, title: jp(titleJa, titleEn), description: jp(`${titleJa}を、前提関係と学習活動に沿って構成する。`, `A coherent module on ${titleEn}.`), topics, units };
  await writeFile(path.join(dataRoot, "modules", `${id}.json`), JSON.stringify(module, null, 2) + "\n");
}
for (const unit of allUnits) await writeFile(path.join(dataRoot, "units", `${unit.id}.json`), JSON.stringify(unit, null, 2) + "\n");
await writeFile(path.join(dataRoot, "knowledge", "graph", "edge-types.json"), JSON.stringify({ edge_types: ["prerequisite", "related", "generalizes", "specializes", "used_in", "equivalent_view"] }, null, 2) + "\n");
console.log(`Scaffolded ${allUnits.length} Learning Units across ${moduleDefinitions.length} modules.`);
