// 推荐器单测：直接 `node src/algorithms/recommender.test.js` 运行
// 无需测试框架，断言失败即抛出。

import {
  recommend, recommendGreedy, compareAlgorithms, CANDIDATES, complexityInfo,
  isCandidateReasonable, DEFAULT_USER_CONTEXT,
  achievedCandidateIds, isCandidateAvailable,
} from "./recommender.js";

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.log(`  ✗ ${msg}`);
  }
}

function makeScores(conductTotal, academic, artSport, org, rewardTotal, conduct = {}) {
  return {
    conduct: {
      total: conductTotal,
      collective: conduct.collective ?? 0,
      political: conduct.political ?? 0,
      social: conduct.social ?? 0,
    },
    ability: { academic, artSport, org, total: academic + artSport + org },
    reward: { total: rewardTotal },
    total: conductTotal + academic + artSport + org + rewardTotal,
  };
}

// 品行三子项全部封顶的便捷构造（集体3/思政3/社会4 → 70+10=80）
const CONDUCT_FULL = { collective: 3, political: 3, social: 4 };

console.log("\n=== Test 1: 已达目标，gap = 0 ===");
{
  const scores = makeScores(80, 10, 6, 4, 5); // 满分 105
  const r = recommend(scores, 100);
  assert(r.feasible, "feasible = true");
  assert(r.selected.length === 0, "无需选取任何项");
  assert(r.cost === 0, "代价为 0");
}

console.log("\n=== Test 2: 微小 gap，选最便宜 1 分项 ===");
{
  const scores = makeScores(75, 5, 0, 0, 0); // 总分 80，目标 81 → gap=1
  const r = recommend(scores, 81);
  assert(r.feasible, "feasible = true");
  assert(r.achievable >= 1, `achievable ≥ 1（实际 ${r.achievable}）`);
  // 最便宜的 1 分项：political_basic（cost=8）或 good_deeds_1（cost=10）
  // DP 应选 cost=8
  assert(r.cost <= 8, `cost ≤ 8（实际 ${r.cost}）`);
}

console.log("\n=== Test 3: 中等 gap，DP 与贪心均可行 ===");
{
  const scores = makeScores(70, 0, 0, 0, 0); // 总分 70，目标 80 → gap=10
  const r = recommend(scores, 80);
  const g = recommendGreedy(scores, 80);
  assert(r.feasible, "DP feasible");
  assert(g.feasible, "贪心 feasible");
  assert(r.achievable >= 10, `DP achievable ≥ 10`);
  assert(g.achievable >= 10, `贪心 achievable ≥ 10`);
  assert(r.cost <= g.cost + 1e-6, `DP 代价 ≤ 贪心代价（${r.cost} vs ${g.cost}）`);
}

console.log("\n=== Test 4: org 互斥约束 ===");
{
  const scores = makeScores(80, 10, 6, 0, 5, CONDUCT_FULL); // 仅 org 子项可加
  const r = recommend(scores, 102); // gap = 1，目标 102
  assert(r.feasible, "feasible");
  const orgItems = r.selected.filter(s => s.module === "org");
  assert(orgItems.length <= 1, `org 项最多选 1 个（实际 ${orgItems.length}）`);
}

console.log("\n=== Test 5: 模块封顶约束 ===");
{
  // 品行已满 80（三子项分别封顶），再选 conduct 项无效
  const scores = makeScores(80, 0, 0, 0, 0, CONDUCT_FULL); // gap = 5, 但 conduct 满了
  const r = recommend(scores, 85);
  assert(r.feasible, "feasible");
  const conductItems = r.selected.filter(s => s.module === "conduct");
  assert(conductItems.length === 0, `conduct 已封顶不应选取（实际 ${conductItems.length} 项）`);
}

console.log("\n=== Test 6: 不可达情形 ===");
{
  // 当前 0 分，目标 105 分。因为 conduct 基准分必须人工设置，模块上限累加 = 105
  // 候选项之和也能凑出 105 → 应该 feasible
  const scores = makeScores(0, 0, 0, 0, 0);
  const r = recommend(scores, 105);
  // 这个测试主要看不会崩溃，可行性视候选项设计
  assert(typeof r.feasible === "boolean", "返回 feasible 字段");
}

console.log("\n=== Test 7: DP 全局最优性（小规模手算对比）===");
{
  // 仅留两个候选项：A(value=2,cost=10) 与 B(value=3,cost=12)
  // 当前 100 分，目标 103，gap=3：A 一次不够（2<3），必须选 B（cost=12）
  // 0/1 背包不能选 A 两次。期望：cost=12
  const cands = [
    { id: "a", label: "A", module: "reward", value: 2, cost: 10 },
    { id: "b", label: "B", module: "reward", value: 3, cost: 12 },
  ];
  const scores = makeScores(80, 10, 6, 4, 0); // total=100，仅 reward 还能加 5
  const r = recommend(scores, 103, cands); // gap=3
  assert(r.feasible, "feasible");
  assert(r.cost === 12, `应选 B（cost=12），实际 cost=${r.cost}`);
  assert(r.selected.length === 1 && r.selected[0].id === "b", "选取的是 B");
}

console.log("\n=== Test 8: DP ≤ 贪心 在多场景下成立 ===");
{
  const cases = [
    { scores: makeScores(72, 2, 1, 1, 0), target: 90 },
    { scores: makeScores(70, 0, 0, 0, 0), target: 95 },
    { scores: makeScores(75, 5, 3, 2, 1), target: 92 },
  ];
  let dpBetterOrEqual = 0;
  for (const { scores, target } of cases) {
    const dp = recommend(scores, target);
    const g = recommendGreedy(scores, target);
    if (dp.feasible && g.feasible) {
      if (dp.cost <= g.cost + 1e-6) dpBetterOrEqual++;
    } else if (dp.feasible && !g.feasible) {
      dpBetterOrEqual++; // DP 找到了贪心找不到的解
    }
  }
  assert(dpBetterOrEqual === cases.length, `DP 在所有 ${cases.length} 个场景中不劣于贪心`);
}

console.log("\n=== Test 9: 性能 sanity check ===");
{
  const scores = makeScores(72, 3, 2, 1, 0);
  const { dp, greedy } = compareAlgorithms(scores, 92);
  console.log(`  DP: ${dp.timeMs.toFixed(3)}ms, cost=${dp.cost}`);
  console.log(`  Greedy: ${greedy.timeMs.toFixed(3)}ms, cost=${greedy.cost}`);
  assert(dp.timeMs < 100, `DP 在 100ms 内完成（实际 ${dp.timeMs.toFixed(3)}ms）`);
  assert(greedy.timeMs < 10, `贪心在 10ms 内完成（实际 ${greedy.timeMs.toFixed(3)}ms）`);
}

console.log("\n=== Test 10: 复杂度信息 ===");
{
  const info = complexityInfo();
  assert(info.N === CANDIDATES.length, `N = ${CANDIDATES.length}`);
  assert(info.W_total === 1050, `W_total = 1050（80+10+6+4+5 各乘 10）`);
  console.log(`  DP 复杂度：${info.dp}`);
  console.log(`  Greedy 复杂度：${info.greedy}`);
}

console.log("\n=== Test 11: 候选项必须带 difficulty 字段 ===");
{
  const allowed = new Set(["normal", "hard", "very-hard"]);
  const missing = CANDIDATES.filter(c => !allowed.has(c.difficulty));
  assert(missing.length === 0, `全部 ${CANDIDATES.length} 项 difficulty ∈ {normal, hard, very-hard}（缺失/非法：${missing.length}）`);
}

console.log("\n=== Test 12: 空候选池返回 infeasible 不崩 ===");
{
  const scores = makeScores(70, 0, 0, 0, 0);
  const r = recommend(scores, 80, []);
  assert(r.feasible === false, "feasible = false");
  assert(typeof r.gap === "number", "返回 gap 字段");
  assert(Array.isArray(r.selected), "返回 selected 数组");
}

console.log("\n=== Test 13: 空 userContext / 全 null 时不过滤任何项 ===");
{
  const allTrueDefault = CANDIDATES.every(c => isCandidateReasonable(c, DEFAULT_USER_CONTEXT));
  const allTrueEmpty = CANDIDATES.every(c => isCandidateReasonable(c, {}));
  assert(allTrueDefault, "DEFAULT_USER_CONTEXT 下所有候选项都通过");
  assert(allTrueEmpty, "空对象 {} 下所有候选项都通过");
}

console.log("\n=== Test 14: 组织任职升档约束（三级用户不应推一二级）===");
{
  const ctx = { ...DEFAULT_USER_CONTEXT, org: "t3" };
  const ok3 = CANDIDATES.filter(c => c.id.startsWith("org_3_")).every(c => isCandidateReasonable(c, ctx));
  const ok4 = CANDIDATES.filter(c => c.id.startsWith("org_4_")).every(c => isCandidateReasonable(c, ctx));
  const reject2 = CANDIDATES.filter(c => c.id.startsWith("org_2_")).every(c => !isCandidateReasonable(c, ctx));
  const reject1 = CANDIDATES.filter(c => c.id.startsWith("org_1_")).every(c => !isCandidateReasonable(c, ctx));
  assert(ok3, "三级用户：所有三级职务通过");
  assert(ok4, "三级用户：所有四级职务通过");
  assert(reject2, "三级用户：所有二级职务被拒");
  assert(reject1, "三级用户：所有一级职务被拒");

  // "暂无" → 仅四级
  const ctxNone = { ...DEFAULT_USER_CONTEXT, org: "none" };
  const onlyT4 = CANDIDATES.filter(c => c.id.startsWith("org_") && isCandidateReasonable(c, ctxNone))
    .every(c => c.id.startsWith("org_4_"));
  assert(onlyT4, "暂无任职用户：仅四级职务通过");
}

console.log('\n=== Test 15: 学科竞赛"暂无"用户仅推校级 ===');
{
  const ctx = { ...DEFAULT_USER_CONTEXT, academic: "none" };
  const okSchool = CANDIDATES.filter(c => c.id.startsWith("comp_school")).every(c => isCandidateReasonable(c, ctx));
  const rejectProv = CANDIDATES.filter(c => c.id.startsWith("comp_prov")).every(c => !isCandidateReasonable(c, ctx));
  const rejectNat = CANDIDATES.filter(c => c.id.startsWith("comp_nat")).every(c => !isCandidateReasonable(c, ctx));
  assert(okSchool, "暂无学科竞赛经验：所有校级项通过");
  assert(rejectProv, "暂无学科竞赛经验：所有省级项被拒");
  assert(rejectNat, "暂无学科竞赛经验：所有国家级项被拒");
}

console.log('\n=== Test 16: 论文"国内一般"用户不推核心 / 国际 / 专著 ===');
{
  const ctx = { ...DEFAULT_USER_CONTEXT, paper: "general" };
  const okGeneral = CANDIDATES.filter(c => c.id.startsWith("paper_general")).every(c => isCandidateReasonable(c, ctx));
  const rejectCore = CANDIDATES.filter(c => c.id.startsWith("paper_core")).every(c => !isCandidateReasonable(c, ctx));
  const rejectIntl = CANDIDATES.filter(c => c.id.startsWith("paper_intl")).every(c => !isCandidateReasonable(c, ctx));
  const rejectBookPat = ["book_first", "patent_invention"].every(id => {
    const c = CANDIDATES.find(x => x.id === id);
    return c && !isCandidateReasonable(c, ctx);
  });
  assert(okGeneral, "国内一般用户：一般期刊各档通过");
  assert(rejectCore, "国内一般用户：核心期刊各档被拒");
  assert(rejectIntl, "国内一般用户：国际期刊各档被拒");
  assert(rejectBookPat, "国内一般用户：专著与发明专利被拒");
}

console.log("\n=== Test 17: 品行子项封顶——思政满则不推思政（修缺陷 2）===");
{
  // conduct.total=73（基准70+思政3），思政子项已满但品行整体仍有余量
  const scores = makeScores(73, 0, 0, 0, 0, { collective: 0, political: 3, social: 0 });
  const r = recommend(scores, 76); // gap=3
  assert(r.feasible, "feasible");
  const politicalPicked = r.selected.filter(c => c.id.startsWith("political_"));
  assert(politicalPicked.length === 0, `思政已满不应推荐思政项（实际 ${politicalPicked.length} 项）`);
  // 反证：思政未满时仍可推荐思政项
  const scores2 = makeScores(70, 0, 0, 0, 0, { collective: 0, political: 0, social: 0 });
  const r2 = recommend(scores2, 71); // gap=1，思政空 → 最便宜的 political_basic(8) 应入选
  assert(r2.selected.some(c => c.id === "political_basic"), "思政未满时可推荐 political_basic");
}

console.log("\n=== Test 18: 已完成的一次性项被自动跳过（修缺陷 1）===");
{
  const state = {
    politicalStudy: { basic: true, provincial: false, outstanding: false },
    socialService: { volunteerHours: 40, socialPractice: true, internLevel: "city", advancedIndividual: false },
    recordBreak: "school",
  };
  const ids = achievedCandidateIds(state);
  assert(ids.has("political_basic"), "已勾选基础思政 → 跳过 political_basic");
  assert(ids.has("volunteer_32") && ids.has("volunteer_64"), "志愿≥32h → 跳过 volunteer_32/64");
  assert(ids.has("social_practice"), "已参加社会实践 → 跳过 social_practice");
  assert(ids.has("intern_city"), "市级挂职 → 跳过 intern_city");
  assert(!ids.has("intern_province"), "市级挂职不应跳过 intern_province");
  assert(ids.has("sport_record_school"), "已破校纪录 → 跳过 sport_record_school");
  assert(!ids.has("sport_record_provincial"), "破校纪录不应跳过 sport_record_provincial");

  // 模拟 RecommenderTab 过滤后：已完成项不再出现在推荐里
  const scores = makeScores(72, 0, 0, 0, 0, { collective: 0, political: 1, social: 2 });
  const filtered = CANDIDATES.filter(c => !ids.has(c.id));
  const r = recommend(scores, 75, filtered);
  assert(r.selected.every(c => !ids.has(c.id)), "推荐结果不含任何已完成项");

  // 空 state 不崩
  assert(achievedCandidateIds(undefined).size === 0, "空 state → 空集合");
}

console.log("\n=== Test 19: 前置依赖守卫——无前置不推额外加分 ===");
{
  const noPrereq = {
    politicalStudy: { basic: false, provincial: false },
    socialService: { volunteerHours: 0, socialPractice: false, internLevel: "none" },
  };
  const outstanding = CANDIDATES.find(c => c.id === "political_outstanding");
  const advanced = CANDIDATES.find(c => c.id === "advanced_individual");
  assert(!isCandidateAvailable(outstanding, noPrereq), "无培训 → 不推思政优秀学员");
  assert(!isCandidateAvailable(advanced, noPrereq), "无社会服务 → 不推先进个人");

  const withPrereq = {
    politicalStudy: { basic: true, provincial: false },
    socialService: { volunteerHours: 10, socialPractice: false, internLevel: "none" },
  };
  assert(isCandidateAvailable(outstanding, withPrereq), "已做基础思政 → 可推优秀学员");
  assert(isCandidateAvailable(advanced, withPrereq), "已有志愿时长 → 可推先进个人");
  // 无关项不受影响
  assert(isCandidateAvailable(CANDIDATES.find(c => c.id === "good_deeds_1"), noPrereq), "好人好事不受前置约束");
}

console.log("\n=== Test 20: org 替换模型（修缺陷 3，按净增计、不推已达职务）===");
{
  // 当前 org=2（三级优）；品行/学术/文体/奖励都已满，只剩 org 可加
  const scores = makeScores(80, 10, 6, 2, 5, CONDUCT_FULL); // total=103
  const r = recommend(scores, 104); // gap=1
  assert(r.feasible, "feasible");
  const orgItems = r.selected.filter(c => c.module === "org");
  assert(orgItems.length === 1, `只选 1 个 org 项（实际 ${orgItems.length}）`);
  // 净增 ≤ 当前 org 分(2) 的职务被丢弃，所选职务按"净增"计，受 org 余量(4-2=2)约束
  assert(orgItems[0].value <= 2 + 1e-9, `org 项按净增计 ≤2（实际 ${orgItems[0].value}）`);
  assert(r.achievable <= 2 + 1e-9, `实际增量受 org 余量约束 ≤2（实际 ${r.achievable}）`);

  // org 已满(=4) 且仅 org 候选 → 不可达不崩
  const full = makeScores(80, 10, 6, 4, 0, CONDUCT_FULL); // total=100
  const orgOnly = CANDIDATES.filter(c => c.module === "org");
  const r2 = recommend(full, 101, orgOnly); // 需 +1，但 org 已满
  assert(!r2.feasible, "org 已满且仅 org 候选 → infeasible");
}

console.log(`\n=== 总计 ${passed + failed} 项断言：${passed} 通过，${failed} 失败 ===`);
if (failed > 0) process.exit(1);
