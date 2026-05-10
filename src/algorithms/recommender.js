// 目标分推荐器：给定当前得分与目标分，求最少努力代价的加分组合
// 核心算法：分模块 0/1 背包 + 跨模块合并背包（精确最优）
// 对照算法：贪心（按性价比降序选取，启发式近似）

const SCALE = 10;

export const CANDIDATES = [
  { id: "collective_x10", label: "完成 10 次集体活动", module: "conduct", value: 3, cost: 20 },
  { id: "volunteer_32", label: "志愿服务 32 小时", module: "conduct", value: 1, cost: 32 },
  { id: "volunteer_64", label: "志愿服务 64 小时（已封顶）", module: "conduct", value: 1, cost: 64 },
  { id: "social_practice", label: "参加一次社会实践", module: "conduct", value: 1, cost: 24 },
  { id: "intern_city", label: "市级挂职锻炼", module: "conduct", value: 1, cost: 80 },
  { id: "intern_province", label: "省级挂职锻炼", module: "conduct", value: 2, cost: 120 },
  { id: "advanced_individual", label: "获评社会服务先进个人", module: "conduct", value: 1, cost: 50 },
  { id: "political_basic", label: "完成基础思政学习", module: "conduct", value: 1, cost: 8 },
  { id: "political_provincial", label: "参加省部级培训", module: "conduct", value: 2, cost: 40 },
  { id: "political_outstanding", label: "思政突出表现", module: "conduct", value: 1, cost: 30 },

  { id: "comp_school_3", label: "校级竞赛三等奖", module: "academic", value: 2, cost: 60 },
  { id: "comp_school_2", label: "校级竞赛二等奖", module: "academic", value: 3, cost: 100 },
  { id: "comp_school_1", label: "校级竞赛一等奖", module: "academic", value: 4, cost: 150 },
  { id: "comp_prov_3", label: "省级竞赛三等奖", module: "academic", value: 4, cost: 120 },
  { id: "comp_prov_2", label: "省级竞赛二等奖", module: "academic", value: 6, cost: 200 },
  { id: "comp_prov_1", label: "省级竞赛一等奖", module: "academic", value: 8, cost: 300 },
  { id: "comp_nat_3", label: "国家级竞赛三等奖", module: "academic", value: 8, cost: 280 },
  { id: "comp_nat_2", label: "国家级竞赛二等奖", module: "academic", value: 9, cost: 400 },
  { id: "comp_nat_1", label: "国家级竞赛一等奖", module: "academic", value: 10, cost: 600 },
  { id: "paper_general", label: "1 作国内一般期刊论文", module: "academic", value: 3, cost: 100 },
  { id: "paper_core", label: "1 作国内核心论文", module: "academic", value: 6, cost: 200 },
  { id: "paper_intl", label: "1 作国际期刊论文", module: "academic", value: 10, cost: 400 },

  { id: "art_school_3", label: "校级文艺三等奖", module: "arts", value: 1, cost: 30 },
  { id: "art_school_1", label: "校级文艺一等奖", module: "arts", value: 2, cost: 60 },
  { id: "art_prov_3", label: "省级文艺三等奖", module: "arts", value: 3, cost: 100 },
  { id: "art_prov_1", label: "省级文艺一等奖", module: "arts", value: 4, cost: 180 },
  { id: "sport_school_r1", label: "校级体育第 1 名", module: "arts", value: 2, cost: 50 },
  { id: "sport_record_school", label: "破校级体育纪录", module: "arts", value: 3, cost: 80 },

  { id: "org_4_pass", label: "担任四级职务（合格）", module: "org", value: 0.5, cost: 30 },
  { id: "org_4_excellent", label: "担任四级职务（优）", module: "org", value: 1, cost: 60 },
  { id: "org_3_pass", label: "担任三级职务（合格）", module: "org", value: 1, cost: 50 },
  { id: "org_3_good", label: "担任三级职务（良）", module: "org", value: 1.5, cost: 80 },
  { id: "org_3_excellent", label: "担任三级职务（优）", module: "org", value: 2, cost: 100 },
  { id: "org_2_excellent", label: "担任二级职务（优）", module: "org", value: 3.5, cost: 250 },
  { id: "org_1_excellent", label: "担任一级职务（优）", module: "org", value: 4, cost: 400 },

  { id: "honor_school", label: "获校级荣誉表彰", module: "reward", value: 2, cost: 100 },
  { id: "honor_provincial", label: "获省级荣誉表彰", module: "reward", value: 4, cost: 350 },
  { id: "honor_national", label: "获全国级荣誉", module: "reward", value: 5, cost: 600 },
  { id: "good_deeds_1", label: "完成 1 件好人好事", module: "reward", value: 1, cost: 10 },
];

const MODULES = ["conduct", "academic", "arts", "org", "reward"];

function moduleCaps(scores) {
  return {
    conduct: Math.max(0, 80 - scores.conduct.total),
    academic: Math.max(0, 10 - scores.ability.academic),
    arts: Math.max(0, 6 - scores.ability.artSport),
    org: Math.max(0, 4 - scores.ability.org),
    reward: Math.max(0, 5 - scores.reward.total),
  };
}

// 模块内 0/1 背包：返回 cost[v] = 在该模块达到精确增量 v 的最小代价
// org 模块特殊：互斥（最多选一项）
function moduleKnapsack(items, cap, isExclusive) {
  const W = Math.round(cap * SCALE);
  const cost = new Float64Array(W + 1).fill(Infinity);
  const pick = new Array(W + 1).fill(null);
  cost[0] = 0;
  pick[0] = [];

  if (isExclusive) {
    for (let i = 0; i < items.length; i++) {
      const v = Math.min(W, Math.round(items[i].value * SCALE));
      if (v <= 0) continue;
      if (items[i].cost < cost[v]) {
        cost[v] = items[i].cost;
        pick[v] = [i];
      }
    }
  } else {
    for (let i = 0; i < items.length; i++) {
      const v = Math.round(items[i].value * SCALE);
      if (v <= 0 || v > W) continue;
      for (let w = W; w >= v; w--) {
        if (cost[w - v] + items[i].cost < cost[w]) {
          cost[w] = cost[w - v] + items[i].cost;
          pick[w] = [...(pick[w - v] || []), i];
        }
      }
    }
  }

  return { cost, pick, items, leaf: true };
}

// 合并两个 cost 表：merged[v] = min over (a + b = v) of t1[a] + t2[b]
function mergeTables(t1, t2) {
  const W1 = t1.cost.length - 1;
  const W2 = t2.cost.length - 1;
  const W = W1 + W2;
  const cost = new Float64Array(W + 1).fill(Infinity);
  const split = new Array(W + 1).fill(-1);
  for (let a = 0; a <= W1; a++) {
    const ca = t1.cost[a];
    if (ca === Infinity) continue;
    for (let b = 0; b <= W2; b++) {
      const cb = t2.cost[b];
      if (cb === Infinity) continue;
      const v = a + b;
      const c = ca + cb;
      if (c < cost[v]) {
        cost[v] = c;
        split[v] = b;
      }
    }
  }
  return { cost, split, prev: t1, next: t2, leaf: false };
}

function backtrack(table, v) {
  if (v <= 0) return [];
  if (table.leaf) {
    const idxs = table.pick[v] || [];
    return idxs.map(i => table.items[i]);
  }
  const b = table.split[v];
  if (b < 0) return [];
  const a = v - b;
  return [...backtrack(table.prev, a), ...backtrack(table.next, b)];
}

// 主入口：精确最优解（DP）
export function recommend(scores, targetTotal, candidates = CANDIDATES) {
  const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  const gap = targetTotal - scores.total;
  if (gap <= 0) {
    return { selected: [], cost: 0, achievable: 0, gap, feasible: true, timeMs: 0 };
  }

  const caps = moduleCaps(scores);
  const groups = {};
  for (const c of candidates) (groups[c.module] = groups[c.module] || []).push(c);

  const tables = MODULES.map(m =>
    moduleKnapsack(groups[m] || [], caps[m] || 0, m === "org")
  );
  let merged = tables[0];
  for (let i = 1; i < tables.length; i++) merged = mergeTables(merged, tables[i]);

  const W = Math.ceil(gap * SCALE);
  let bestV = -1;
  let bestCost = Infinity;
  for (let v = W; v < merged.cost.length; v++) {
    if (merged.cost[v] < bestCost) {
      bestCost = merged.cost[v];
      bestV = v;
    }
  }

  const t1 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  if (bestV < 0) {
    return { selected: [], cost: Infinity, achievable: 0, gap, feasible: false, timeMs: t1 - t0 };
  }
  return {
    selected: backtrack(merged, bestV),
    cost: bestCost,
    achievable: bestV / SCALE,
    gap,
    feasible: true,
    timeMs: t1 - t0,
  };
}

// 对照算法：贪心（按性价比降序）
export function recommendGreedy(scores, targetTotal, candidates = CANDIDATES) {
  const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  const gap = targetTotal - scores.total;
  if (gap <= 0) {
    return { selected: [], cost: 0, achievable: 0, gap, feasible: true, timeMs: 0 };
  }

  const caps = moduleCaps(scores);
  const sorted = [...candidates].sort((a, b) => b.value / b.cost - a.value / a.cost);

  const used = { conduct: 0, academic: 0, arts: 0, org: 0, reward: 0 };
  let orgPicked = false;
  const selected = [];
  let achieved = 0;
  let totalCost = 0;

  for (const c of sorted) {
    if (achieved >= gap) break;
    if (c.module === "org" && orgPicked) continue;
    const remain = caps[c.module] - used[c.module];
    if (c.value > remain + 1e-9) continue;
    selected.push(c);
    used[c.module] += c.value;
    if (c.module === "org") orgPicked = true;
    achieved += c.value;
    totalCost += c.cost;
  }

  const t1 = (typeof performance !== "undefined" ? performance.now() : Date.now());
  return {
    selected,
    cost: achieved >= gap ? totalCost : Infinity,
    achievable: achieved,
    gap,
    feasible: achieved >= gap,
    timeMs: t1 - t0,
  };
}

// 算法对比（供 UI 展示）
export function compareAlgorithms(scores, targetTotal, candidates = CANDIDATES) {
  return {
    dp: recommend(scores, targetTotal, candidates),
    greedy: recommendGreedy(scores, targetTotal, candidates),
  };
}

// 复杂度参数（供 UI 展示）
export function complexityInfo(candidates = CANDIDATES) {
  const N = candidates.length;
  const caps = { conduct: 80, academic: 10, arts: 6, org: 4, reward: 5 };
  const W_total = Object.values(caps).reduce((a, b) => a + b, 0) * SCALE;
  return {
    N,
    W_total,
    capsScaled: Object.fromEntries(Object.entries(caps).map(([k, v]) => [k, v * SCALE])),
    dp: `O(Σ N_i · W_i + Σ W_i · W_j) ≈ O(N · W_max + W_total²)`,
    greedy: `O(N log N)`,
  };
}
