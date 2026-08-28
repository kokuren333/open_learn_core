import { readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataRoot = path.join(root, "domains", "linear-algebra", "data");
const moduleRoot = path.join(dataRoot, "modules");
const exerciseRoot = path.join(dataRoot, "exercises", "modules");
const reviewRoot = path.join(dataRoot, "exercises", "reviews");
const moduleFiles = [
  "module-prerequisites-vectors", "module-systems-matrices", "module-vector-spaces", "module-linear-transformations",
  "module-orthogonality", "module-determinants", "module-eigenvalues", "module-applications"
];

const makeSolution = ({ module, topic, role, method, answer, wrong }) => ({
  what_is_asked: `${module}の${topic}について、${role}を行う。`,
  concepts: [topic],
  strategy: method,
  steps: ["対象の次元・条件・記号を確認する。", `${method}`, "小さな例または定義へ戻って結果を検算する。"],
  why: ["条件を先に固定すると、似た記号や異なる規約を混同しにくい。", "最後に意味へ戻ることで、答えが単なる数値で終わらない。"],
  conclusion: answer,
  common_wrong_path: wrong
});

const modules = [];
for (const file of moduleFiles) modules.push(JSON.parse(await readFile(path.join(moduleRoot, `${file}.json`), "utf8")));
modules.sort((a, b) => a.order - b.order);

const allExerciseIds = new Map();
for (const module of modules) {
  const units = module.units;
  const topic = module.topics[0];
  const secondTopic = module.topics[1] ?? topic;
  const lastTopic = module.topics.at(-1) ?? topic;
  const exercises = [
    { id: `${module.id}-exercise-basic`, type: "calculation", difficulty: "basic", question: `${topic}について、このModuleで使う基本的な定義または計算規則を一つ書き、小さな例で確認せよ。`, answer: `${topic}の定義を明示し、例の各ステップを計算できる。`, explanation: `${topic}はModuleの入口となる語である。定義・入力・出力を分けて書き、数値を代入して条件が成立することを確認する。`, method: `${topic}の定義を式にし、例へ代入する。`, wrong: "用語だけを答え、対象や条件を示さない。" },
    { id: `${module.id}-exercise-conceptual`, type: "explanation", difficulty: "standard", question: `${topic}と${secondTopic}の関係を、計算・幾何・構造のうち二つの観点で説明せよ。`, answer: `${topic}を定義し、${secondTopic}がその結果をどう利用するかを、式または具体例付きで説明する。`, explanation: `${topic}と${secondTopic}は独立な暗記項目ではなく、Module内の前後関係を持つ。片方の結果がもう片方の入力・条件・解釈になることを明記する。`, method: "二つの語を別々に定義してから、共通する例の中で接続する。", wrong: "似た言葉を同義語として扱い、条件の違いを消す。" },
    { id: `${module.id}-exercise-synthesis`, type: "synthesis", difficulty: "challenge", question: `${topic}から${lastTopic}までの学習内容を使う、小さな総合問題を設計し、解法と検算を示せ。`, answer: `${topic}の条件を出発点に、${lastTopic}へ至る三段階以上の推論を示し、最後に元の条件へ戻って検算する。`, explanation: `総合問題では、途中の概念を飛ばさず、どのUnitの知識を使ったかを明示する。正しい最終結果だけでなく、途中の条件と検算が解答の一部になる。`, method: "出発条件→中間表現→最終計算→解釈の順に分解する。", wrong: "最後の公式だけを適用し、前提条件や中間結果を省略する。" }
  ].map((item) => ({ id: item.id, type: item.type, difficulty: item.difficulty, question: item.question, solution: makeSolution({ module: module.title.ja, topic: item.id.endsWith("basic") ? topic : item.id.endsWith("conceptual") ? `${topic}・${secondTopic}` : `${topic}・${lastTopic}`, role: item.type, method: item.method, answer: item.answer, wrong: item.wrong }) }));
  const set = { id: `${module.id}-review`, module: module.id, title: { ja: `${module.title.ja} Module演習`, en: `${module.title.en} Module Review` }, exercises };
  await writeFile(path.join(exerciseRoot, `${set.id}.json`), JSON.stringify(set, null, 2) + "\n", "utf8");
  module.exercise_ids = exercises.map((exercise) => exercise.id);
  module.purpose = module.description;
  module.entry_prerequisites = module.order === 0 ? ["secondary-school algebra fluency"] : [modules[module.order - 1].id];
  module.learning_objectives = module.units.slice(0, 3).map((unit) => `${unit}の定義・例・基本計算を説明できる`);
  module.exit_competencies = [`${topic}から${lastTopic}までの主要な関係を説明できる`, "Module演習をbasic・standard・challengeの三役割で解ける"];
  module.adjacent_modules = { previous: modules[module.order - 1]?.id ?? "none", next: modules[module.order + 1]?.id ?? "none" };
  await writeFile(path.join(moduleRoot, `${module.id}.json`), JSON.stringify(module, null, 2) + "\n", "utf8");
  for (const exercise of exercises) allExerciseIds.set(exercise.id, module.id);
}

const reviews = [
  ["review-01-foundations", "基礎横断レビュー：ベクトル・方程式・行列", "Review 1: Vectors, Systems, and Matrices", [0, 1], ["module-prerequisites-vectors", "module-systems-matrices"]],
  ["review-02-vector-spaces", "構造横断レビュー：ベクトル空間・基底・変換", "Review 2: Vector Spaces, Basis, and Transformations", [1, 2, 3], ["module-systems-matrices", "module-vector-spaces", "module-linear-transformations"]],
  ["review-03-determinants-eigenvalues", "構造横断レビュー：行列式と固有値", "Review 3: Determinants and Eigenvalues", [5, 6], ["module-determinants", "module-eigenvalues"]],
  ["review-04-orthogonality-least-squares", "計算横断レビュー：直交性・最小二乗・近似", "Review 4: Orthogonality, Least Squares, and Approximation", [4, 7], ["module-orthogonality", "module-applications"]],
  ["review-05-final-synthesis", "最終総合レビュー：線形代数の地図", "Final Review: Linear Algebra Synthesis", [0, 1, 2, 3, 4, 5, 6, 7], moduleFiles]
];
for (const [id, ja, en, indexes, moduleIds] of reviews) {
  const exerciseIds = indexes.map((index) => `${modules[index].id}-review`).flatMap((setId) => {
    const set = JSON.parse(readFileSync(path.join(exerciseRoot, `${setId}.json`), "utf8"));
    return set.exercises.map((exercise) => exercise.id);
  });
  await writeFile(path.join(reviewRoot, `${id}.json`), JSON.stringify({ id, title: { ja, en }, module_ids: moduleIds, exercise_ids: exerciseIds }, null, 2) + "\n", "utf8");
}
console.log(`Completed ${modules.length} Module exercise sets and ${reviews.length} cumulative reviews.`);
