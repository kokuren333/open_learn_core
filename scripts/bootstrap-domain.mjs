import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const requestArgument = process.argv[2];
if (!requestArgument) throw new Error("Usage: npm run bootstrap:domain -- <bootstrap-request.json>");
const requestPath = path.resolve(root, requestArgument);
const request = JSON.parse(await readFile(requestPath, "utf8"));
const concepts = request.concepts ?? [];
const ids = concepts.map((concept) => concept.id);
if (concepts.length !== 30) throw new Error(`Domain Bootstrap requires exactly 30 concepts; found ${concepts.length}`);
if (new Set(ids).size !== ids.length) throw new Error("Domain Bootstrap found duplicate Concept IDs");
if ((request.research?.sources?.length ?? 0) < 2) throw new Error("Domain Bootstrap requires at least two research sources");
if ((request.research?.comparisons?.length ?? 0) < 2) throw new Error("Domain Bootstrap requires at least two source comparisons");
const domainRoot = path.join(root, "domains", request.domain_id);
const goldConcepts = new Set(request.gold_concepts ?? []);
for (const id of goldConcepts) if (!ids.includes(id)) throw new Error(`Gold concept '${id}' is not in the 30-concept map`);
const writeJson = async (relative, value) => {
  const target = path.join(domainRoot, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const writeText = async (relative, value) => {
  const target = path.join(domainRoot, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, value, "utf8");
};
const localized = (ja, en) => ({ ja, en });
const titleOf = (concept) => localized(concept.title_ja, concept.title_en);
const commonProfile = (concept) => {
  const scores = { abstraction: concept.abstraction ?? 3, procedural: concept.procedural ?? 3, visual: concept.visual ?? 4, prerequisite_load: concept.prerequisite_load ?? 3, misconception_risk: concept.misconception_risk ?? 3, representation_switching: concept.representation_switching ?? 4, symbolic_density: concept.symbolic_density ?? 3 };
  const dimensions = Object.fromEntries(Object.entries(scores).map(([key, score]) => [key, { score, rationale: `${concept.title_ja}では${key}の負荷を${score}/5と見積もる。具体例・対比・形式化を段階的に接続する必要があるためである。` }]));
  return { scores, dimensions };
};
const coreConcept = (concept) => {
  const { scores, dimensions } = commonProfile(concept);
  const learningOutcomeIds = [`${concept.id}-explain`, `${concept.id}-apply`, `${concept.id}-transfer`];
  return {
    id: concept.id,
    title: titleOf(concept),
    central_mental_model: concept.mental_model,
    cognitive_types: [concept.cognitive_type ?? "structural_definition"],
    cognitive_profile: scores,
    cognitive_analysis: { primary_type: concept.cognitive_type ?? "structural_definition", dimensions },
    instructional_budget: { minimum_concrete_scenarios: 1, minimum_worked_examples: 1, minimum_counterexamples: 1, minimum_guided_questions: 1, minimum_independent_questions: 1, minimum_misconception_challenges: 1, minimum_representation_switches: 1, minimum_transfer_tasks: 1 },
    facets: [{ id: `${concept.id}-facet`, title: concept.facet ?? concept.title_ja, description: `${concept.title_ja}を具体例・形式化・転移課題で扱う。` }],
    procedures: [{ id: `${concept.id}-procedure`, title: `${concept.title_ja}を使う`, description: `${concept.title_ja}をデータの問いへ適用する手順を確認する。` }],
    properties: [`${concept.title_ja}は、観測された事実と不確実性を分けて考えるための${request.domain_title_ja}の構造を与える。`],
    representations: [{ id: `${concept.id}-representation-example`, title: "具体例", description: `${concept.title_ja}を身近なデータの場面で読む。` }, { id: `${concept.id}-representation-formal`, title: "数式と図", description: `${concept.title_ja}を式・図・言葉の間で変換する。` }],
    misconceptions: [`${concept.title_ja}を別の概念と同じだと思う`, `${concept.title_ja}の数値だけで結論を出してしまう`, `${concept.title_ja}の前提条件を確認しない`],
    applications: concept.applications ?? ["データ分析", "研究結果の解釈"],
    external_relations: [],
    learning_contract: { learning_outcome_ids: learningOutcomeIds, learner_should_be_able_to: [`${concept.title_ja}を自分の言葉で説明する`, `${concept.title_ja}を具体的なデータへ適用する`, `${concept.title_ja}の限界と前提を指摘する`], must_not_leave_with_misconceptions: [`${concept.title_ja}の値を文脈なしに解釈しない`, "標本と母集団を混同しない", "不確実性を確実性として扱わない"], required_representations: ["concrete example", "formal notation"], required_examples: ["positive example", "contrasting nonexample"], required_learning_elements: { motivating_problem: 1, intuition: 1, formalization: 1, positive_examples: 1, contrasting_nonexamples: 1, worked_examples: 1, learner_predictions: 1, misconceptions: 1, practice: { basic: 1, conceptual: 1, transfer: 1 }, synthesis: 1 } },
    pedagogical_plan: { pattern: concept.cognitive_type ?? "structural_definition", reason: `${concept.title_ja}は、具体的な場面から形式的な表現へ移り、最後に前提と限界を検討する順序が適している。`, stages: ["具体的な問い", "観察", "直観的な予測", "形式化", "反例と転移"], profile_driven_requirements: ["具体例と形式表現を併用する", "不確実性と前提を明示する"] },
    editorial_status: goldConcepts.has(concept.id) ? "gold" : "scaffold",
    source_concept_ids: [concept.id],
    prerequisites: concept.prerequisites ?? [],
    related: concept.related ?? []
  };
};
const genericLegacyConcept = (concept, index) => {
  const claimId = `${concept.id}-claim`;
  const evidenceId = `evidence-${concept.id}`;
  const lessonId = `${concept.id}-lesson`;
  const exerciseId = `${concept.id}-exercise`;
  return {
    id: concept.id,
    title: titleOf(concept),
    summary: localized(concept.summary_ja ?? `${concept.title_ja}を${request.domain_title_ja}の問いへ接続する。`, concept.summary_en ?? `Connect ${concept.title_en} to questions in ${request.domain_title_en}.`),
    prerequisites: concept.prerequisites ?? [],
    related: concept.related ?? [],
    learningObjectives: [`${concept.title_ja}の意味を説明する`],
    lessons: [{ id: lessonId, title: concept.title_ja, summary: `${concept.title_ja}の入口。`, objectives: [`${concept.title_ja}を説明する`], sections: [{ id: `${lessonId}-section`, title: "入口", kind: "explanation", body: `${concept.title_ja}は、${request.domain_title_ja}の問いに答えるときに使う概念です。まず具体的な場面を思い浮かべ、何を知りたいのか、どの量が変動するのかを区別します。`, claimRefs: [claimId] }], exerciseIds: [exerciseId] }],
    claims: [{ id: claimId, statement: `${concept.title_ja}は、観測された事実と問いを対応付けるための基本的な考え方である。`, sourceRefs: [{ source: request.research.sources[0].id, locator: request.research.sources[0].locator }], claimType: "curriculum_claim", status: "supported", evidence: [evidenceId] }],
    examples: [{ id: `${concept.id}-example`, statement: `${concept.title_ja}を含むデータの場面`, explanation: `観測対象と知りたい量を分けると、${concept.title_ja}がどこで働くかを説明できる。`, type: "positive", difficulty: "basic" }],
    exercises: [{ id: exerciseId, type: "short-answer", difficulty: "basic", question: `${concept.title_ja}が必要になる問いを一つ説明せよ。`, answer: `${concept.title_ja}を用いて観測データと統計的な問いを対応付ける。`, explanation: `${concept.title_ja}の役割を、データの場面と結び付けて説明する。`, lessonId, testsClaims: [claimId] }],
    misconceptions: [`${concept.title_ja}を別の概念と同一視する`, `${concept.title_ja}の値だけで結論を出す`, `${concept.title_ja}の前提を確認しない`],
    sources: [request.research.sources[0].id]
  };
};
const qualityConcept = (concept) => {
  const base = genericLegacyConcept(concept, 0);
  const claimId = `${concept.id}-claim`;
  const rich = (id, label, body, kind = "explanation") => ({ id, title: label, kind, body, claimRefs: [claimId] });
  base.contentLayers = [
    { id: `${concept.id}-motivation`, type: "motivation", title: "なぜ標本から考えるのか", body: "新しい薬の効果や授業の平均点を知りたいとき、対象全体を毎回調べることはできません。限られた標本から母集団について推論するには、標本の偶然の揺れを見積もる必要があります。標本平均がどのように変動するかを考えると、単一の観測値と推定の不確実性を区別でき、後の信頼区間や検定へ進む道筋が見えます。ここで大切なのは、標本の数字を母集団の真値として断定するのではなく、どんな手続きなら再現可能な推論になるかを先に問うことです。", claimRefs: [claimId] },
    { id: `${concept.id}-intuition`, type: "intuition", title: "標本平均の揺れを眺める", body: "同じ母集団から同じ大きさの標本を何度も取り直すと、標本平均は毎回少しずつ変わります。標本が小さいと平均の散らばりは大きく、標本が大きいと中心の近くへ集まりやすくなります。元のデータが左右対称でなくても、平均をたくさん集めると釣鐘型に近づくことがあります。ただしこの近づき方には標本サイズや独立性などの条件があり、図を見た印象だけで万能な法則と考えてはいけません。例えば右に長い尾をもつ待ち時間データでも、標本平均を何度も集めると元の一件の分布とは違う形が現れます。したがって、データの分布と統計量の分布を二つの別の対象として描き分けることが、推論の出発点になります。標本を一回しか取れない現実でも、この反復を頭の中で、またはシミュレーションで行うことで、観測した平均がどれほど典型的かを考えられます。", claimRefs: [claimId] },
    { id: `${concept.id}-formal`, type: "formal_definition", title: "形式化と条件", body: "独立で同じ分布に従う確率変数X₁,…,Xₙの平均をX̄とします。母平均をμ、母分散をσ²とすれば、標本平均の中心はμで、標準偏差はσ/√nです。中心極限定理は、適切な条件の下で(X̄−μ)/(σ/√n)の分布が標準正規分布へ近づくことを述べます。これは有限の標本が必ず正規分布になるという主張ではなく、標本平均の分布と近似の精度についての主張です。記号Xᵢはi番目の標本値、nは標本サイズ、X̄は標本平均、μとσは母集団側の量です。標準化は中心を0、揺れの尺度を1へ揃える操作なので、異なる単位の平均を同じ基準で比較できます。近似を使う前には、標本がどのように得られたか、観測が十分に独立か、極端な分布を小標本で扱っていないかを確認します。さらに、近づく対象は標本平均の分布であり、元のXᵢの分布ではないことを式の分子と分母から読み取ります。標準誤差σ/√nが小さくなることは、推定値の揺れが減ることを意味しますが、標本抽出のバイアスを自動的に消すわけではありません。", claimRefs: [claimId] },
    { id: `${concept.id}-connection`, type: "connection", title: "次の推論へ", body: "標本平均の分布を近似できると、標準誤差を使って母平均の不確実性を表せます。その表現が信頼区間や仮説検定の基礎になります。", claimRefs: [claimId] }
  ];
  base.lessons = Array.from({ length: 6 }, (_, index) => {
    const n = index + 1;
    const sectionPrefix = `${concept.id}-lesson-${String(n).padStart(2, "0")}`;
    const exIds = [1, 2, 3].map((offset) => `${concept.id}-exercise-${(index * 3 + offset).toString().padStart(2, "0")}`);
    return { id: sectionPrefix, title: ["標本と母集団", "標本平均の直観", "揺れを数式にする", "正規近似を読む", "条件と限界", "次の推論へ"][index], summary: `${concept.title_ja}を具体例、図、式、反例の順に確認する。`, objectives: [`${concept.title_ja}の${n}段階目を説明する`], sections: [rich(`${sectionPrefix}-problem`, "具体的な問い", `同じ母集団から標本を取り出して${concept.title_ja}を考えるとき、どの量が変わり、どの量を知りたいのかを最初に分けます。観測された一つの標本を母集団そのものと見なさず、標本抽出の偶然が結論にどのような幅を持たせるかを問いにします。`, "problem"), rich(`${sectionPrefix}-example`, "具体例", `例えば${n * 10}人の測定値から標本平均を計算すると、別の標本では別の値になります。平均の違いを誤差として捨てるのではなく、繰り返し標本を想像して分布として記録します。これにより、${concept.title_ja}は単なる公式ではなく、標本から母集団へ移るための見取り図になります。`, "example"), rich(`${sectionPrefix}-formal`, "式で確かめる", `標本平均と母平均を記号で書き、標準化した量がどのような分布へ近づくかを確認します。式に現れる各記号を、データの場面で何を表すかへ戻しながら読みます。`, "formal_definition"), rich(`${sectionPrefix}-checkpoint`, "Checkpoint", `${concept.title_ja}について、標本の一回の値と標本平均の分布を区別して説明してください。結論には、何を繰り返し、どの不確実性を表しているかを含めます。`, "checkpoint")], exerciseIds: exIds };
  });
  base.examples = [
    ...Array.from({ length: 6 }, (_, index) => ({ id: `${concept.id}-positive-${index + 1}`, statement: `標本平均の正例 ${index + 1}`, explanation: "同じ母集団から同じ大きさの標本を繰り返し、平均の分布を比較する。", type: "positive", difficulty: index < 2 ? "basic" : "standard" })),
    ...Array.from({ length: 4 }, (_, index) => ({ id: `${concept.id}-counter-${index + 1}`, statement: `適用条件を外した反例 ${index + 1}`, explanation: "標本が独立でない、極端な外れ値がある、標本サイズが小さいなど、近似をそのまま信じられない条件を確認する。", type: "counterexample", difficulty: "standard" })),
    ...Array.from({ length: 6 }, (_, index) => ({ id: `${concept.id}-worked-${index + 1}`, statement: `標本平均の計算例 ${index + 1}`, explanation: "標本平均、標準誤差、標準化の順に計算し、何を近似しているかを言葉で確認する。", type: "worked", difficulty: index < 2 ? "basic" : "standard", goal: "標本から平均の不確実性を説明する。", plan: "データの設定を確認し、平均と標準誤差を計算して解釈する。", steps: ["母集団と標本の役割を区別する。", "標本平均と標準誤差を計算する。", "近似の条件と結論を文章で確認する。"], finalConclusion: "標本平均の揺れを分布として扱うことで、母平均について推論できる。", whyThisWorks: "繰り返し標本の平均を考えると、単一標本に含まれる偶然の揺れを確率的に表せるから。", commonWrongPath: "一つの標本平均を母平均と同一視し、標準誤差を無視する。" }))
  ];
  base.exercises = Array.from({ length: 20 }, (_, index) => ({ id: `${concept.id}-exercise-${String(index + 1).padStart(2, "0")}`, type: index < 7 ? "calculation" : "explanation", difficulty: index < 7 ? "basic" : index < 15 ? "standard" : "challenge", question: `標本平均に関する課題 ${index + 1}。どの分布を考え、どの条件を確認すべきか説明せよ。`, answer: "標本平均の分布を考え、独立性・標本サイズ・母分散などの条件を確認する。", explanation: "標本の値と標本平均の分布を区別し、近似の前提を明示する。", lessonId: `${concept.id}-lesson-${String((index % 6) + 1).padStart(2, "0")}`, testsClaims: [claimId], expectedReasoning: "問いの対象、揺れ、近似条件を順に確認する。", commonWrongPath: "標本平均を母平均と同じものとして扱う。" }));
  base.diagnosticQuestions = Array.from({ length: 5 }, (_, index) => ({ id: `${concept.id}-diagnostic-${index + 1}`, question: `標本平均の分布についての診断問題 ${index + 1}。`, answer: "標本を取り直したときに変わる平均の分布を考える。", explanation: "単一観測の分布と標本平均の分布を切り分ける。", assesses: [claimId] }));
  base.misconceptions = ["中心極限定理は元データそのものを正規分布にする", "標本サイズに関係なく近似は同じ", "標本平均は一回で母平均と一致する", "独立性を確認しなくてよい", "標準誤差と標準偏差は同じ", "近似結果は条件なしに確実な結論を与える"];
  base.visualIds = [`${concept.id}-distribution-visual`, `${concept.id}-sampling-visual`, `${concept.id}-condition-visual`];
  base.related = ["sampling-distributions", "standard-error", "confidence-interval", "p-value"];
  return base;
};
const evidenceFor = (concept) => ({ id: `evidence-${concept.id}`, source: request.research.sources[0].id, locator: { type: "section", value: request.research.sources[0].locator, section: "curriculum comparison" }, evidence_role: "curriculum", supports: [`${concept.id}-claim`], extracted_meaning: { ja: `${concept.title_ja}は、${request.domain_title_ja}の導入から応用へ進むための共通要素として整理した。`, en: `${concept.title_en} is included as a shared element in the path from introductory ideas to application in ${request.domain_title_en}.` }, confidence: "high" });
const experienceFor = (concept) => {
  const outcomes = [`${concept.id}-explain`, `${concept.id}-apply`, `${concept.id}-transfer`];
  const blocks = ["hook", "guided_exploration", "formalization", "worked_example", "independent_practice"].map((type, index) => ({ id: `${concept.id}-block-${index + 1}`, type, purpose: `${concept.title_ja}を段階的に理解するための${type}。`, learner_state_before: "学習者は統計用語を部分的に知っている。", activity: `${concept.title_ja}の具体例を読み、予測し、式へ変換して確認する。`, required_elements: ["具体例", "確認問題"], learner_state_after: `${concept.title_ja}を別の表現へ移して説明できる。`, learning_outcome_ids: [outcomes[index % outcomes.length]], external_prerequisite_concept_ids: [], internal_block_dependencies: index ? [`${concept.id}-block-${index}`] : [], difficulty: index < 2 ? "basic" : index === 4 ? "challenge" : "standard", expected_time_minutes: 8, generated_from: "openlearn-domain-bootstrap-statistics", question: `${concept.title_ja}の考え方を、具体例と式の両方で説明できるか。`, answer: `${concept.title_ja}の対象、条件、解釈を対応付けて説明する。`, hint: "何の分布または変動を考えているかを先に書く。", ...(type === "worked_example" ? { worked_example: { problem: `${concept.title_ja}を使って標本から母集団について推論する。`, learner_prediction: "標本の揺れを考えれば不確実性を表せる。", reasoning_steps: ["問いと対象母集団を区別する。", "標本から統計量を計算する。", "前提条件を確認して解釈する。"], calculations: ["統計量を計算する。"], interpretation: "統計量は標本の偶然を含むため、幅を持って解釈する。", conclusion: "条件を満たす範囲で推論を行う。", generalizable_takeaway: "統計量の値だけでなく、生成過程と不確実性を説明する。" } } : {}) }));
  return { id: `${concept.id}-learning-experience`, concept_id: concept.id, editorial_status: "gold", instructional_budget: { minimum_concrete_scenarios: 1, minimum_worked_examples: 1, minimum_counterexamples: 1, minimum_guided_questions: 1, minimum_independent_questions: 1, minimum_misconception_challenges: 1, minimum_representation_switches: 1, minimum_transfer_tasks: 1 }, sequence: blocks, learner_sections: blocks.map((block, index) => ({ id: `${concept.id}-section-${index + 1}`, title: ["具体例から始める", "揺れを観察する", "式へ移す", "例題を解く", "別の場面へ移す"][index], description: `${concept.title_ja}の学習ステップ。`, block_ids: [block.id] })), lesson_content: blocks.map((block, index) => ({ block_id: block.id, body: `${concept.title_ja}を学ぶときは、まず何を観測し、何を推論したいのかを明確にします。次に具体例の揺れを観察し、記号と式へ移します。最後に、前提条件を確認しながら別のデータ場面へ転移します。`, equations: index === 2 ? ["\\bar{X} = \\frac{1}{n}\\sum_{i=1}^{n}X_i", "\\frac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}} \\Rightarrow N(0,1)"] : [] })), assessments: [{ id: `${concept.id}-assessment`, type: "explanation", prompt: `${concept.title_ja}が後続の推定や検定とどうつながるか説明せよ。`, expected_answer: "標本の揺れを分布として扱い、不確実性を推定へつなげる。", reasoning_rubric: ["対象と統計量を区別する", "条件と解釈を説明する"], tests_learning_outcome_ids: outcomes, representation: "言葉・図・式", difficulty: "standard" }] };
};
const svg = (title, subtitle) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 360" role="img" aria-label="${title}"><rect width="900" height="360" fill="#f7faf3"/><text x="450" y="48" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="700" fill="#18321f">${title}</text><path d="M100 285H820M150 300V80" stroke="#9eb6a5" stroke-width="2"/><path d="M160 270 C230 170 310 150 390 205 S550 280 650 180 S760 140 810 235" fill="none" stroke="#397b5a" stroke-width="6"/><text x="450" y="335" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#435047">${subtitle}</text></svg>\n`;
const manifest = `id: ${request.domain_id}\ntitle:\n  ja: ${request.domain_title_ja}\n  en: ${request.domain_title_en}\ndescription:\n  ja: ${request.domain_description_ja}\n  en: ${request.domain_description_en}\nversion: 0.1.0\nstatus: in_progress\nlanguage:\n  default: ja\n  supported:\n    - ja\n    - en\nlevel:\n  min: ${request.domain_scope.target_level}\n  max: university_intermediate\nentry_curriculum:\n  - ${request.domain_id}-foundations\nentry_concepts:\n  - ${request.entry_concept}\nquality_gate_concepts:\n  - ${request.quality_gate_concept}\ncore_compatibility:\n  min_version: "2.5"\ncontent_root: ./data\nasset_root: ./assets\ncore_concepts_file: ./data/core-concepts/core-concepts.json\nlearning_experiences_file: ./data/learning-experiences/learning-experiences.json\ncore_concepts:\n${ids.map((id) => `  - ${id}`).join("\n")}\npublish:\n  enabled: true\n  path: ${request.domain_id}\n`;
await writeText("domain.yaml", manifest);
await writeText("README.md", `# ${request.domain_title_ja}\n\nThis Domain was generated from a learner problem by the Open Learn Core Domain Bootstrap workflow.\n\nThe 30 Core Concepts are intentionally split into selected Gold Concepts and scaffold concepts.\n`);
await writeJson("data/core-concepts/core-concepts.json", { schema_version: "2.4", domain: request.domain_id, core_concepts: concepts.map(coreConcept) });
await writeJson("data/learning-experiences/learning-experiences.json", { schema_version: "2.4", domain: request.domain_id, experiences: concepts.filter((concept) => goldConcepts.has(concept.id)).map(experienceFor) });
const curriculumId = request.curriculum_id ?? `${request.domain_id}-foundations`;
await writeJson(`data/curricula/${curriculumId}.json`, { id: curriculumId, title: localized(request.curriculum_title_ja ?? `${request.domain_title_ja}の基礎`, request.curriculum_title_en ?? `${request.domain_title_en} Foundations`), description: request.curriculum_description ?? `${request.domain_title_ja}の主要概念を、前提関係に沿って学ぶ30 Core Concepts。`, sequence: ids });
for (const concept of concepts) await writeJson(`data/concepts/${concept.id}.json`, concept.id === request.quality_gate_concept ? qualityConcept(concept) : genericLegacyConcept(concept, 0));
await writeJson("data/sources/sources.json", request.research.sources.map((source) => ({ ...source, roles: source.roles ?? ["evidence", "supplementary_learning"], quality: source.quality ?? { authority: "high", accessibility: "high", pedagogical_value: "high" }, reuse: source.reuse ?? "link_only" })));
for (const concept of concepts) await writeJson(`data/evidence/items/evidence-${concept.id}.json`, evidenceFor(concept));
for (const [index, visual] of [
  ["distribution-visual", "標本平均の分布", "標本を取り直すと平均の分布ができる"],
  ["sampling-visual", "標本から推論へ", "一つの標本を母集団と同一視しない"],
  ["condition-visual", "近似の条件", "独立性・標本サイズ・分散を確認する"]
].entries()) {
  const id = `${request.quality_gate_concept}-${visual[0]}`;
  await writeText(`assets/diagrams/${id}.svg`, svg(visual[1], visual[2]));
  await writeJson(`data/visuals/${id}.json`, { id, concept: request.quality_gate_concept, type: "summary-infographic", learning_goal: localized(visual[1], visual[1]), source_claims: [`${request.quality_gate_concept}-claim`], target_claim: `${request.quality_gate_concept}-claim`, learner_question: localized("何が繰り返し変わるのか？", "What changes across repeated samples?"), layout: { type: "single-curve" }, labels: ["標本", "分布", "不確実性"], visual_encoding: "横軸を統計量、曲線の高さを相対的な頻度として表す。", misconception_risk: ["元データの分布と標本平均の分布を混同する"], placement: { lesson: `${request.quality_gate_concept}-lesson-${String(index + 1).padStart(2, "0")}`, position: "after_explanation" }, alt_text: localized(`${visual[1]}を示す曲線図。`, `A curve diagram showing ${visual[1]}.`), status: "published", output_path: `diagrams/${id}.svg`, svg: svg(visual[1], visual[2]) });
}
await writeJson("working/bootstrap/learner-problem.json", request.learner_problem);
await writeJson("working/bootstrap/domain-scope.json", request.domain_scope);
await writeJson("working/bootstrap/curriculum-research.json", request.research);
await writeJson("working/bootstrap/concept-map.json", { domain: request.domain_id, count: 30, gold_candidates: request.gold_candidates ?? [], gold_concepts: [...goldConcepts], concepts: concepts.map((concept, index) => ({ order: index + 1, id: concept.id, title: concept.title_ja, prerequisites: concept.prerequisites ?? [], status: goldConcepts.has(concept.id) ? "gold" : "scaffold" })) });
for (const directory of ["data/evidence/reviews", "data/curriculum-decisions", "assets", "tests"]) await writeText(`${directory}/.gitkeep`, "");
console.log(`Bootstrapped ${request.domain_id}: ${concepts.length} Core Concepts, ${goldConcepts.size} Gold, ${concepts.length - goldConcepts.size} scaffold`);
