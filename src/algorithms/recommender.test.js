// 推荐器单测：直接 `node src/algorithms/recommender.test.js` 运行
// 无需测试框架，断言失败即抛出。

import { recommend, recommendGreedy, compareAlgorithms, CANDIDATES, complexityInfo } from "./recommender.js";

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

function makeScores(conductTotal, academic, artSport, org, rewardTotal) {
  return {
    conduct: { total: conductTotal },
    ability: { academic, artSport, org, total: academic + artSport + org },
    reward: { total: rewardTotal },
    total: conductTotal + academic + artSport + org + rewardTotal,
  };
}

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
  const scores = makeScores(80, 10, 6, 0, 5); // 仅 org 子项可加
  const r = recommend(scores, 102); // gap = 1，目标 102
  assert(r.feasible, "feasible");
  const orgItems = r.selected.filter(s => s.module === "org");
  assert(orgItems.length <= 1, `org 项最多选 1 个（实际 ${orgItems.length}）`);
}

console.log("\n=== Test 5: 模块封顶约束 ===");
{
  // 品行已满 80，再选 conduct 项无效
  const scores = makeScores(80, 0, 0, 0, 0); // gap = 5, 但 conduct 满了
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

console.log(`\n=== 总计 ${passed + failed} 项断言：${passed} 通过，${failed} 失败 ===`);
if (failed > 0) process.exit(1);
