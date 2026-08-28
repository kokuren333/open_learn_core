import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "domains", "linear-algebra", "data", "core-concepts", "core-concepts.json");
const patterns = {
  concrete_object: ["encounter", "manipulate examples", "compare cases", "name the object", "formalize", "transfer"],
  structural_definition: ["need", "positive and negative cases", "formal definition", "test membership", "classify", "transfer"],
  abstraction: ["concrete cases", "common structure", "abstract object", "formalize", "new example", "transfer"],
  procedure: ["goal", "why the method", "algorithm", "worked example", "attempt", "diagnose errors", "limits"],
  transformation_process: ["input/output", "observable behavior", "visual model", "algebraic model", "composition", "invariants", "consequences"],
  invariant_quantity: ["phenomenon", "quantity", "compute", "interpret", "invariance", "limits", "application"],
  relationship_theorem: ["known concepts", "pattern", "formal statement", "hypotheses", "example", "counterexample", "consequences"],
  representation: ["same object", "representation A", "representation B", "translate", "what changes", "what remains", "translation task"],
  optimization_approximation: ["inexact problem", "objective", "geometric intuition", "formal objective", "solve", "interpret", "limitations"]
};
const profiles = {
  concrete_object: { abstraction: 2, procedural: 2, visual: 4, prerequisite_load: 1, misconception_risk: 3, representation_switching: 3, symbolic_density: 2 },
  structural_definition: { abstraction: 4, procedural: 3, visual: 3, prerequisite_load: 3, misconception_risk: 4, representation_switching: 4, symbolic_density: 4 },
  abstraction: { abstraction: 5, procedural: 2, visual: 3, prerequisite_load: 4, misconception_risk: 4, representation_switching: 4, symbolic_density: 4 },
  procedure: { abstraction: 3, procedural: 5, visual: 2, prerequisite_load: 3, misconception_risk: 4, representation_switching: 3, symbolic_density: 4 },
  transformation_process: { abstraction: 4, procedural: 3, visual: 5, prerequisite_load: 4, misconception_risk: 4, representation_switching: 4, symbolic_density: 3 },
  invariant_quantity: { abstraction: 4, procedural: 4, visual: 3, prerequisite_load: 4, misconception_risk: 4, representation_switching: 4, symbolic_density: 4 },
  relationship_theorem: { abstraction: 5, procedural: 3, visual: 3, prerequisite_load: 5, misconception_risk: 5, representation_switching: 4, symbolic_density: 4 },
  representation: { abstraction: 4, procedural: 3, visual: 4, prerequisite_load: 4, misconception_risk: 4, representation_switching: 5, symbolic_density: 4 },
  optimization_approximation: { abstraction: 4, procedural: 5, visual: 4, prerequisite_load: 5, misconception_risk: 5, representation_switching: 4, symbolic_density: 5 }
};
const item = (value, prefix, index) => ({ id: `${prefix}-${value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || Array.from(value).map((char) => char.codePointAt(0).toString(16)).join("")}-${index + 1}`, title: value, description: `${value}を具体例・形式化・転移課題で扱う。` });
const contract = (title, misconceptions, representations, examples) => ({
  learner_should_be_able_to: [`${title}を自分の言葉と式で説明する。`, `${title}を二つ以上の表現で判定・計算する。`, `${title}を未知の問題へ転移し、結果を検算する。`],
  must_not_leave_with_misconceptions: misconceptions,
  required_representations: representations,
  required_examples: examples,
  required_learning_elements: { motivating_problem: 1, intuition: 1, formalization: 1, positive_examples: 2, contrasting_nonexamples: 2, worked_examples: 2, learner_predictions: 2, misconceptions: 3, practice: { basic: 2, conceptual: 2, transfer: 1 }, synthesis: 1 }
});

// Each tuple is a deliberate compression decision: one learner-facing concept, its mental model,
// cognitive pattern, learning contract vocabulary, and every legacy record it subsumes.
const definitions = [
  ["vector","ベクトル","Vector","ベクトルは、成分や矢印の見た目に依存せず、加法とスカラー倍によって方向・変化・状態を運ぶ対象である。","concrete_object",["矢印と成分","自由ベクトル","ベクトル演算"],["成分計算","幾何操作"],["加法とスカラー倍が閉じている","同じ対象に複数の表現がある"],["矢印","成分組","変位"],["ベクトルは始点に固定される","大きさだけでベクトルは決まる","矢印で描けないものはベクトルでない"],["力と変位","データ特徴量"],["vector","vector-introduction","vector-notation","vector-addition","scalar","scalar-introduction","scalar-multiplication"],[]],
  ["linear-combination","線形結合","Linear Combination","線形結合は、複数の対象を係数で調整して一つの対象を作る共通言語であり、span・座標・方程式をつなぐ。","abstraction",["係数","生成","係数比較"],["結合を立てる","係数を解く"],["係数はスカラー","順序を変えても和は同じ"],["式","矢印の合成","行列の列"],["係数は1だけ","係数は自然数だけ","元の材料しか作れない"],["座標表示","信号混合"],["linear-combination"],["vector"]],
  ["linear-system","線形方程式系","Linear System","線形方程式系は、未知量の組が複数の線形条件を同時に満たすかを問う問題で、幾何・行列・解空間を統一する。","structural_definition",["未知量","共通条件","解集合"],["係数行列を作る","解を分類する"],["解は0個・1個・無限個","同次系は零解を持つ"],["方程式","拡大行列","幾何的交点"],["解は常に一つ","係数行列だけで右辺も表す","自由変数は失敗"],["回路方程式","資源配分"],["linear-equations"],["linear-combination"]],
  ["matrix","行列","Matrix","行列は数表ではなく、線形な入力を出力へ移す操作を計算可能な形で表す構造である。","representation",["行と列","積の意味","写像の表現"],["行列積","転置","行列ベクトル積"],["積は一般に非可換","形状が積の可否を決める"],["数表","写像","列ベクトルの結合"],["行列は単なる表","AB=BAが常に成り立つ","サイズは無関係"],["画像変換","連立方程式"],["matrix","matrix-introduction","matrix-operations","matrix-representation"],["vector"]],
  ["elimination","消去法","Elimination","消去法は、解集合を変えない操作で条件を見通しのよい形へ変え、構造と計算を同時に明らかにする手続きである。","procedure",["行操作","ピボット","後退代入"],["前進消去","後退代入","ピボット選択"],["基本行操作は解を保つ","零行は自由変数を示す"],["拡大係数行列","方程式","操作列"],["行を列のように操作する","ピボットなしは解なし","手順だけ暗記する"],["ガウス消去","LU分解"],["gaussian-elimination","rref-and-pivots"],["linear-system","matrix"]],
  ["vector-space","ベクトル空間","Vector Space","ベクトル空間は、対象の見た目ではなく加法とスカラー倍の規則が整合することで、同じ線形推論を再利用できる抽象的な舞台である。","abstraction",["公理","例の共通構造","抽象化"],["公理を検査する","閉性を確認する"],["零元がある","演算が閉じる"],["数ベクトル","多項式","行列"],["要素は必ず矢印","公理は検査不要","部分集合なら自動的に空間"],["多項式空間","行列空間"],["vector-spaces"],["vector"]],
  ["subspace","部分空間","Subspace","部分空間は、より大きな空間の中で線形演算に閉じた小さな空間であり、解集合・核・像を同じ言葉で捉える。","structural_definition",["原点を含む直線","閉性","制約集合"],["部分空間判定","生成元で記述する"],["零元を含む","加法とスカラー倍に閉じる"],["幾何","方程式","生成集合"],["曲線も部分空間","原点を通らない直線も部分空間","spanと集合は同じ"],["解空間","核と像"],["subspaces"],["vector-space"]],
  ["linear-independence","線形独立性","Linear Independence","線形独立性は、与えた材料の間に隠れた重複がなく、零を作る方法が自明なものだけであることを表す。","structural_definition",["零の関係","冗長性","一意性"],["係数方程式を解く","rankで判定する"],["零ベクトルを含めば従属","独立集合の部分集合は独立"],["係数方程式","方向図","列行列"],["本数が少なければ独立","直交性と独立性は同じ","spanすれば独立"],["基底判定","特徴量の重複除去"],["linear-independence"],["linear-combination","vector-space"]],
  ["basis","基底","Basis","基底は、空間のすべてを作れる十分性と、余分な重複がない独立性を同時に満たし、各ベクトルへ一意な座標を与えるものさしである。","structural_definition",["spanと独立の統合","一意な座標","標準・非標準基底"],["基底テスト","係数を解く","冗長性を除く"],["spanが必要","独立性が必要","直交性は必須でない"],["幾何方向","代数条件","座標表示","行列"],["基底は一意","直交必須","長さ1必須","spanだけで十分","独立だけで十分"],["座標系","数値計算","関数空間"],["basis","span"],["linear-combination","subspace","linear-independence"]],
  ["dimension","次元","Dimension","次元は、空間を重複なく記述するために必要な独立方向の数であり、見た目ではなく基底の不変量である。","invariant_quantity",["自由度","基底の本数","不変量"],["基底の本数を数える","rankから求める"],["すべての基底は同じ本数","部分空間の次元は包含で増えない"],["自由度","基底の本数","rank"],["生成元の本数が必ず次元","図の見た目だけが次元","基底で次元が変わる"],["自由度分析","解空間"],["dimension"],["basis"]],
  ["linear-transformation","線形写像","Linear Transformation","線形写像は、加法とスカラー倍を保ちながら一つの空間の構造を別の空間へ運び、核・像・行列表示を生む。","transformation_process",["入力と出力","構造保存","核と像"],["線形性テスト","基底の像から行列を作る"],["零を零へ写す","和とスカラー倍を保存"],["写像","幾何変形","行列"],["原点を通るだけで線形","全写像は行列","線形写像は必ず可逆"],["画像変換","微分作用素"],["linear-map","linear-transformations"],["vector-space"]],
  ["coordinates-change-of-basis","座標と基底変換","Coordinates and Change of Basis","座標はベクトルそのものではなく選んだ基底に対する係数であり、基底変換は同じ対象の表現を翻訳する操作である。","representation",["座標とベクトル","遷移行列","同じ対象の別表示"],["係数を解く","基底行列を掛ける","変換を合成する"],["ベクトルは基底に依存しない","座標は基底に依存する"],["幾何ベクトル","標準座標","非標準座標","行列"],["座標が対象そのもの","変換行列の向きは任意","標準基底が常に正しい"],["物理座標系","CG"],["coordinates","coordinate-maps","change-of-basis"],["basis"]],
  ["rank-nullity","階数と零化度","Rank and Nullity","rank-nullityは、写像が保つ独立な情報の数と失う自由度の数が、入力空間の次元を分割するという保存則である。","relationship_theorem",["情報の保持と消失","核と像","次元の分割"],["rank計算","nullity計算","次元公式を適用する"],["rank+nullity=domain dimension","核と像は異なる空間"],["写像","pivot","部分空間の次元"],["rankは要素数","nullityは零行数","rankは常に行数"],["回帰","情報量"],["rank","kernel-and-image","dimension"],["dimension","linear-transformation"]],
  ["determinant","行列式","Determinant","行列式は、線形変換が向き付き体積をどれだけ拡大縮小し、可逆性を失っていないかを一つの量で示す。","invariant_quantity",["符号付き体積","多重線形性","可逆性"],["小行列式計算","余因子展開","行操作で計算"],["det(AB)=det(A)det(B)","det=0 iff 非可逆"],["面積・体積","置換の式","行列"],["detは要素の積","det=0なら零行列","行列積のdetは和"],["体積変換","連立方程式"],["determinant-definition","determinant-computation","determinant-invertibility","determinant-properties","determinant-volume","determinant-intuition"],["matrix","elimination"]],
  ["eigenvalue-eigenvector","固有値と固有ベクトル","Eigenvalue and Eigenvector","固有ベクトルは、変換しても方向が変わらず、固有値がその方向の伸縮率として変換の隠れた軸を示す。","relationship_theorem",["不変方向","伸縮率","固有空間"],["固有方程式を解く","固有空間を求める"],["固有ベクトルは零でない","異なる固有値の固有ベクトルは独立"],["矢印の変形","Av=λv","特性多項式"],["零ベクトルも固有ベクトル","固有値は常に実数","固有ベクトルは一つだけ"],["振動","安定性分析"],["eigenvalue-eigenvector","characteristic-polynomial","eigenspace-and-multiplicity"],["matrix"]],
  ["diagonalization","対角化","Diagonalization","対角化は、適切な基底で変換を独立な方向ごとの単純な伸縮として表し、反復計算と構造理解を容易にする。","representation",["固有基底","PDP^-1","反復"],["固有ベクトルを並べる","P^-1APを計算","可否を判定"],["固有ベクトルが基底を作る必要","全行列が対角化可能ではない"],["標準基底","固有基底","対角行列"],["固有値があれば必ず対角化","Pの順序を無視","対角化は行操作"],["漸化式","力学系"],["diagonalization","composition-and-similarity"],["eigenvalue-eigenvector"]],
  ["inner-product","内積","Inner Product","内積は二つのベクトルを一つのスカラーへ対応させ、長さ・角度・直交性を同じ計算から引き出す構造である。","structural_definition",["長さ","角度","正定値性"],["内積計算","ノルム計算","不等式を適用"],["対称性","線形性","正値性"],["幾何角度","成分積","関数の積分"],["内積は要素積の和だけ","直交は見た目で決まる","自己内積は負でもよい"],["信号処理","関数空間"],["dot-product-and-norm"],["vector"]],
  ["orthogonality","直交性","Orthogonality","直交性は、内積がゼロになることで相互の成分が干渉しない関係を表し、分解・補空間・近似の基準になる。","relationship_theorem",["内積ゼロ","直交補空間","分解"],["内積判定","補空間計算","正規直交化"],["非零直交ベクトルは独立","直交補空間は部分空間"],["角度","内積","平面・高次元"],["直交は軸に平行","直交なら単位ベクトル","見た目だけで判定"],["信号分離","フーリエ級数"],["orthogonality","orthogonal-complement","orthonormal-bases","gram-schmidt"],["inner-product"]],
  ["projection","射影","Projection","射影は、対象をある部分空間へ落とし、残差を直交にすることで、複雑なベクトルを意味のある成分と誤差へ分ける操作である。","transformation_process",["影","最近点","残差"],["射影公式","射影行列","直交分解"],["残差は直交","同じ部分空間への射影は冪等"],["幾何的影","内積公式","行列"],["射影は任意の近い点","残差は射影そのもの","斜め射影も直交射影"],["信号除去","最小二乗"],["projection"],["orthogonality","subspace"]],
  ["least-squares","最小二乗","Least Squares","最小二乗は、完全には満たせない条件に対して残差の二乗和を最小化し、最も整合する近似解を直交性で特徴付ける。","optimization_approximation",["不整合な方程式","残差","目的関数"],["正規方程式","QR法","残差評価"],["残差は列空間に直交","外れ値は二乗和に強く影響"],["点への直線","Ax≈b","射影"],["近似解は誤差ゼロ","各誤差が個別に最小","正規方程式は常に安定"],["回帰","データフィッティング"],["qr-least-squares"],["projection","matrix-factorization"]],
  ["symmetric-matrix","対称行列","Symmetric Matrix","対称行列は転置しても変わらない構造を持ち、直交する固有方向と実固有値によって幾何と計算を整える。","relationship_theorem",["転置対称","固有方向","直交対角化"],["対称性判定","固有分解","二次形式判定"],["固有値は実数","直交行列で対角化可能"],["成分対称","二次形式","主軸"],["対称なら対角行列","固有値は必ず異なる","固有ベクトルは任意"],["PCA","エネルギー形式"],["symmetric-spectral-theorem"],["eigenvalue-eigenvector"]],
  ["quadratic-form","二次形式","Quadratic Form","二次形式は、ベクトルを同じベクトルの両側から行列で測り、形状・曲率・エネルギーを一つの式で表現する。","representation",["x^TAx","等高線","主軸"],["行列から式へ","平方完成","固有基底へ変換"],["対称部分だけが値を決める","符号は曲率を表す"],["多項式","行列","幾何曲線"],["x^TAxは線形","交差項係数をそのまま読む","反対称部分も値に影響"],["最適化","物理エネルギー"],["quadratic-forms"],["matrix","inner-product"]],
  ["positive-definiteness","正定値性","Positive Definiteness","正定値性は、二次形式が零でない方向に常に正の値を返すことで、曲率・安定性・一意な最小値を保証する。","structural_definition",["全方向の正","曲率","安定性"],["固有値判定","主座小行列判定","二次形式評価"],["対称行列では固有値正と同値","正定値は可逆を含意"],["二次形式","固有値","等高線"],["対称であれば正定値","非負と正を同一視","対角成分だけで判定"],["凸最適化","エネルギー安定性"],["positive-definite-matrices"],["quadratic-form","symmetric-matrix"]],
  ["singular-value-decomposition","特異値分解","Singular Value Decomposition","特異値分解は、任意の行列を入力側の直交基底・方向別の伸縮・出力側の直交基底へ分解し、情報の大きさを並べ替える。","representation",["三段階の変換","特異方向","特異値"],["A^TAの固有分解","特異値計算","再構成"],["特異値は非負","左右の特異ベクトルは別空間"],["幾何変換","A=UΣV^T","スペクトル"],["SVDは固有分解そのもの","左右の基底を同一視","矩形行列にはSVDがない"],["画像圧縮","逆問題"],["svd-intuition"],["eigenvalue-eigenvector","orthogonality"]],
  ["low-rank-approximation","低ランク近似","Low-Rank Approximation","低ランク近似は、保持したい構造を少数の特異方向へ圧縮し、再現誤差とのトレードオフを制御する方法である。","optimization_approximation",["情報圧縮","ランク制約","誤差"],["上位特異値を切る","誤差を評価","ランクを選ぶ"],["特異値順に保持する","ランクを下げると誤差は一般に増える"],["行列","特異値列","画像"],["小さい要素だけ残す","近似は厳密","ランクと次元は同じ"],["画像圧縮","推薦"],["low-rank-approximation"],["singular-value-decomposition"]],
  ["principal-component-analysis","主成分分析","Principal Component Analysis","主成分分析は、データのばらつきを最もよく説明する直交方向を選び、次元削減と解釈可能な座標を同時に行う。","optimization_approximation",["分散","主軸","中心化"],["中心化","共分散行列","固有方向を選ぶ"],["主成分は直交","分散最大化と再構成誤差最小が対応"],["散布図","共分散行列","固有ベクトル"],["主成分は元変数そのもの","最大分散は予測保証","中心化は不要"],["可視化","特徴量圧縮"],["pca-connection"],["symmetric-matrix","eigenvalue-eigenvector"]],
  ["matrix-factorization","行列分解","Matrix Factorization","行列分解は、複雑な線形操作を意味の異なる単純な因子へ分け、計算・解釈・安定性の目的に応じた表現を選ぶ考え方である。","procedure",["因子","目的別分解","計算経路"],["LU","QR","適用条件を比較"],["因子分解は一意とは限らない","条件により使える分解が異なる"],["積","三角行列","直交因子"],["全行列に同じ分解","因子は常に対称","分解できれば安定"],["連立方程式","最小二乗"],["inverse-and-lu","qr-least-squares"],["matrix","elimination"]],
  ["matrix-dynamics","行列力学","Matrix Dynamics","行列力学は、行列の反復作用を時間発展として読み、固有構造・安定性・長期挙動を結び付ける見方である。","transformation_process",["状態","反復","長期挙動"],["行列べき","固有値で成長判定","定常状態計算"],["固有値の絶対値が成長率を支配","初期状態で過程が変わる"],["状態ベクトル","遷移行列","時系列"],["一回の変換で長期挙動が分かる","行列積の順番は自由","全初期状態が同じ極限"],["Markov連鎖","人口モデル"],["markov-matrices","differential-and-fourier"],["eigenvalue-eigenvector","matrix"]],
  ["graph-network-representation","グラフとネットワーク表現","Graph and Network Representation","グラフとネットワーク表現は、関係を行列へ符号化し、接続・流れ・クラスタ構造を線形代数の計算対象へ変換する。","representation",["頂点と辺","隣接行列","行列からグラフ"],["隣接行列を作る","次数行列を読む","表現を翻訳する"],["表現は情報を符号化する","対称性は無向性と関係する"],["図","隣接行列","Laplacian"],["隣接行列は必ず対称","向きは無関係","行列表示がグラフそのもの"],["PageRank","ネットワーク分析"],["graph-network-matrices"],["matrix"]],
  ["numerical-stability","数値安定性","Numerical Stability","数値安定性は、有限精度で計算しても入力の小さな誤差が答えを壊さないかを、条件数・アルゴリズム・誤差伝播で評価する視点である。","invariant_quantity",["丸め誤差","条件数","安定な方法"],["条件数を評価","ピボットを選ぶ","誤差を比較"],["条件の悪さとアルゴリズムの安定性は別","残差が小さくても解の誤差は大きい"],["浮動小数点","条件数","誤差グラフ"],["高精度なら必ず正しい","残差ゼロなら解も正確","理論上同値なら数値上も同じ"],["科学計算","工学シミュレーション"],["numerical-stability"],["matrix-factorization","elimination"]]
];

const concepts = definitions.map(([id, ja, en, model, pattern, facets, procedures, properties, representations, misconceptions, applications, source, prerequisites]) => ({
  id, title: { ja, en }, central_mental_model: model, cognitive_types: [pattern, ...(pattern === "representation" ? ["transformation_process"] : [])], cognitive_profile: profiles[pattern],
  facets: facets.map((value, index) => item(value, "facet", index)), procedures: procedures.map((value, index) => item(value, "procedure", index)), properties, representations: representations.map((value, index) => item(value, "representation", index)), misconceptions, applications,
  external_relations: [], learning_contract: contract(ja, misconceptions, representations, [representations[0], representations[1]]),
  pedagogical_plan: { pattern, reason: `${ja}の認知的な難所を、観察・形式化・対比・転移へ段階的に分解する。`, stages: patterns[pattern], profile_driven_requirements: [`抽象度${profiles[pattern].abstraction}/5に応じて具体例と形式化を往復する。`, `誤解リスク${profiles[pattern].misconception_risk}/5と表現切替${profiles[pattern].representation_switching}/5に応じて対比・翻訳課題を置く。`] },
  editorial_status: id === "basis" ? "gold" : "scaffold", source_concept_ids: source, prerequisites
}));
if (concepts.length !== 30) throw new Error(`expected 30 core concepts, found ${concepts.length}`);
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ schema_version: "2.1", domain: "linear-algebra", core_concepts: concepts }, null, 2) + "\n", "utf8");
console.log(`Wrote ${concepts.length} Core Concepts to ${path.relative(root, output)}`);
