import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const videoRoot = path.join(root, "domains", "linear-algebra", "video", "units");
const pilots = {
  span: {
    title: "span",
    subtitle: "ベクトルから作れる範囲",
    notes: [
      ["今回は、ベクトルから作れる範囲を考えます。", "こんかいは、ベクトルからつくれるはんいをかんがえます。", "作れる範囲を考える", "線形結合を一回計算するだけでなく、係数をすべて動かした結果を見ます。"],
      ["(1,0) と (0,1) の線形結合は、平面上の任意の点を作ります。", "いちぜろと、ぜろいちのせんけいけつごうは、へいめんじょうのまかせのてんをつくります。", "二方向があれば平面へ", "a(1,0)+b(0,1)=(a,b)なので、aとbを選ぶことで平面全体に届きます。"],
      ["一方、(1,2) 一本の線形結合は、(t,2t) の形に限られます。", "いっぽう、いちに、いっぽんのせんけいけつごうは、てぃー、にてぃーのかたちにかぎられます。", "一本なら直線に限られる", "係数tを変えても、原点を通る同じ直線から外へ出られません。"],
      ["この到達可能な集合全体を span と呼びます。", "このとうたつかのうなしゅうごうぜんたいを、すぱんとよびます。", "span = 線形結合の全体", "次のUnitでは、同じspanを作るベクトルに重複があるかを調べます。"]
    ]
  },
  "linear-independence": {
    title: "線形独立性", subtitle: "表現に重複がない",
    notes: [
      ["今回は、ベクトルの組に重複がないとはどういうことかを考えます。", "こんかいは、ベクトルのくみにちょうふくがないとはどういうことかをかんがえます。", "重複のないベクトル", "spanが作れる範囲なら、線形独立性は作り方の冗長性を問います。"],
      ["(1,0) と (0,1) の線形結合が零ベクトルになるのは、係数が両方0のときだけです。", "いちぜろと、ぜろいちのせんけいけつごうがれいベクトルになるのは、けいすうがりょうほうぜろのときだけです。", "非自明な零関係がない", "a(1,0)+b(0,1)=(0,0)ならa=0,b=0です。"],
      ["(1,0),(0,1),(1,1) には、三本目が前の二本の和になる関係があります。", "いちぜろ、ぜろいち、いちいちには、さんほんめがまえのにほんのわになるかんけいがあります。", "余分な方向は重複", "(1,1)−(1,0)−(0,1)=0という、係数がすべて0ではない関係です。"],
      ["非自明な零関係がないとき、ベクトルは線形独立です。", "ひじめいなれいかんけいがないとき、ベクトルはせんけいどくりつです。", "独立性の定義", "次のUnitでは、spanと独立性を同時に満たす集合として基底を見ます。"]
    ]
  },
  "basis-definition": {
    title: "基底とは何か", subtitle: "span と線形独立性",
    notes: [
      ["今回は、基底がなぜ二つの条件を持つのかを考えます。", "こんかいは、きていがなぜふたつのじょうけんをもつのかをかんがえます。", "基底の二条件", "空間を作れることと、材料が重複しないことを同時に要求します。"],
      ["spanは、空間のすべてを表せることを保証します。", "すぱんは、くうかんのすべてをあらわせることをほしょうします。", "span = 表現の存在", "足りないベクトル集合では、空間の一部しか表現できません。"],
      ["線形独立性は、同じベクトルに複数の係数が対応しないことを保証します。", "せんけいどくりつせいは、おなじベクトルにふくすうのけいすうがたいおうしないことをほしょうします。", "独立性 = 表現の一意性", "余分なベクトルがあると、非自明な零関係が生まれます。"],
      ["基底とは、空間を span し、線形独立でもあるベクトル集合です。", "きていとは、くうかんをすぱんし、せんけいどくりつでもあるベクトルしゅうごうです。", "basis = span + independence", "この二条件が、座標の存在と一意性を支えます。"]
    ]
  }
};

function jsonSource(unit, notes) {
  return JSON.stringify({ unit, tts: { backend: "voicevox", speaker: { name: "ずんだもん", style: "ノーマル" }, synthesis: { speed_scale: 1.25 } }, slides: notes.map(([script, spoken_script, note_top, note_bottom], index) => ({ id: index + 1, script, spoken_script, note_top, note_bottom })), status: "scripted" }, null, 2) + "\n";
}

function markdown({ title, subtitle, notes }) {
  return `---\nmarp: true\npaginate: true\n---\n\n<!-- class: title -->\n# ${title}\n## ${subtitle}\n\n---\n\n<!-- class: -->\n# ${notes[1][2]}\n\n一つの要点に集中する\n\n---\n\n# ${notes[2][2]}\n\n一つの要点に集中する\n\n---\n\n<!-- class: highlight -->\n# ${notes[3][2]}\n\n定義を一文で確認する\n`;
}

for (const [unit, spec] of Object.entries(pilots)) {
  const directory = path.join(videoRoot, unit);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "video.yaml"), jsonSource(unit, spec.notes));
  await writeFile(path.join(directory, "slides.md"), markdown(spec));
  await writeFile(path.join(directory, "youtube.yaml"), JSON.stringify({ platform: "youtube", status: "not_planned", language: "ja" }) + "\n");
}
console.log(`Scaffolded ${Object.keys(pilots).length} video pilots.`);
