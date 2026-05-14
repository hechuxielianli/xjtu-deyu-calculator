// 目标分推荐器：给定当前得分与目标分，求最少努力代价的加分组合
// 核心算法：分模块 0/1 背包 + 跨模块合并背包（精确最优）
// 对照算法：贪心（按性价比降序选取，启发式近似）

const SCALE = 10;

export const CANDIDATES = [
  { id: "collective_x10", label: "完成 10 次集体活动", module: "conduct", value: 3, cost: 20, difficulty: "normal" },
  { id: "volunteer_32", label: "志愿服务 32 小时", module: "conduct", value: 1, cost: 32, difficulty: "normal" },
  { id: "volunteer_64", label: "志愿服务 64 小时（已封顶）", module: "conduct", value: 1, cost: 64, difficulty: "normal" },
  { id: "social_practice", label: "参加一次社会实践", module: "conduct", value: 1, cost: 24, difficulty: "normal" },
  { id: "intern_city", label: "市级挂职锻炼", module: "conduct", value: 1, cost: 200, difficulty: "hard" },
  { id: "intern_province", label: "省级挂职锻炼", module: "conduct", value: 2, cost: 400, difficulty: "very-hard" },
  { id: "advanced_individual", label: "获评社会服务先进个人", module: "conduct", value: 1, cost: 50, difficulty: "hard" },
  { id: "political_basic", label: "完成基础思政学习", module: "conduct", value: 1, cost: 8, difficulty: "normal" },
  { id: "political_provincial", label: "参加省部级培训", module: "conduct", value: 2, cost: 40, difficulty: "hard" },
  { id: "political_outstanding", label: "思政突出表现", module: "conduct", value: 1, cost: 30, difficulty: "normal" },

  { id: "comp_school_excellence", label: "校级竞赛优秀奖", module: "academic", value: 1, cost: 30, difficulty: "normal" },
  { id: "comp_school_3", label: "校级竞赛三等奖", module: "academic", value: 2, cost: 60, difficulty: "normal" },
  { id: "comp_school_2", label: "校级竞赛二等奖", module: "academic", value: 3, cost: 100, difficulty: "normal" },
  { id: "comp_school_1", label: "校级竞赛一等奖", module: "academic", value: 4, cost: 150, difficulty: "normal" },
  { id: "comp_prov_3", label: "省级竞赛三等奖", module: "academic", value: 4, cost: 120, difficulty: "normal" },
  { id: "comp_prov_2", label: "省级竞赛二等奖", module: "academic", value: 6, cost: 200, difficulty: "hard" },
  { id: "comp_prov_1", label: "省级竞赛一等奖", module: "academic", value: 8, cost: 300, difficulty: "hard" },
  { id: "comp_nat_3", label: "国家级竞赛三等奖", module: "academic", value: 8, cost: 280, difficulty: "very-hard" },
  { id: "comp_nat_2", label: "国家级竞赛二等奖", module: "academic", value: 9, cost: 400, difficulty: "very-hard" },
  { id: "comp_nat_1", label: "国家级竞赛一等奖", module: "academic", value: 10, cost: 600, difficulty: "very-hard" },
  { id: "paper_general", label: "1 作国内一般期刊论文", module: "academic", value: 3, cost: 100, difficulty: "normal" },
  { id: "paper_general_2", label: "2 作国内一般期刊论文", module: "academic", value: 2, cost: 60, difficulty: "normal" },
  { id: "paper_general_3", label: "3 作国内一般期刊论文", module: "academic", value: 1, cost: 30, difficulty: "normal" },
  { id: "paper_core", label: "1 作国内核心论文", module: "academic", value: 6, cost: 200, difficulty: "very-hard" },
  { id: "paper_core_2", label: "2 作国内核心论文", module: "academic", value: 5, cost: 150, difficulty: "hard" },
  { id: "paper_core_3", label: "3 作国内核心论文", module: "academic", value: 4, cost: 120, difficulty: "hard" },
  { id: "paper_intl", label: "1 作国际期刊论文", module: "academic", value: 10, cost: 400, difficulty: "very-hard" },
  { id: "paper_intl_2", label: "2 作国际期刊论文", module: "academic", value: 8, cost: 300, difficulty: "very-hard" },
  { id: "paper_intl_3", label: "3 作国际期刊论文", module: "academic", value: 6, cost: 200, difficulty: "very-hard" },
  { id: "book_first", label: "1 作出版专著", module: "academic", value: 10, cost: 800, difficulty: "very-hard" },
  { id: "patent_invention", label: "获得发明专利", module: "academic", value: 10, cost: 500, difficulty: "very-hard" },
  { id: "patent_utility", label: "实用新型 / 软件著作权", module: "academic", value: 6, cost: 150, difficulty: "hard" },

  { id: "art_school_3", label: "校级文艺三等奖", module: "arts", value: 1, cost: 30, difficulty: "normal" },
  { id: "art_school_2", label: "校级文艺二等奖", module: "arts", value: 1.5, cost: 45, difficulty: "normal" },
  { id: "art_school_1", label: "校级文艺一等奖", module: "arts", value: 2, cost: 60, difficulty: "normal" },
  { id: "art_prov_ex", label: "省级文艺优秀奖", module: "arts", value: 2, cost: 80, difficulty: "hard" },
  { id: "art_prov_3", label: "省级文艺三等奖", module: "arts", value: 3, cost: 100, difficulty: "hard" },
  { id: "art_prov_2", label: "省级文艺二等奖", module: "arts", value: 3.5, cost: 150, difficulty: "hard" },
  { id: "art_prov_1", label: "省级文艺一等奖", module: "arts", value: 4, cost: 180, difficulty: "hard" },
  { id: "art_nat_ex", label: "国家级文艺优秀奖", module: "arts", value: 3, cost: 100, difficulty: "very-hard" },
  { id: "art_nat_3", label: "国家级文艺三等奖", module: "arts", value: 4, cost: 150, difficulty: "very-hard" },
  { id: "art_nat_2", label: "国家级文艺二等奖", module: "arts", value: 5, cost: 200, difficulty: "very-hard" },
  { id: "art_nat_1", label: "国家级文艺一等奖", module: "arts", value: 6, cost: 250, difficulty: "very-hard" },
  { id: "sport_school_r48", label: "校级体育 4-8 名", module: "arts", value: 0.5, cost: 15, difficulty: "normal" },
  { id: "sport_school_r3", label: "校级体育第 3 名", module: "arts", value: 1, cost: 30, difficulty: "hard" },
  { id: "sport_school_r2", label: "校级体育第 2 名", module: "arts", value: 1.5, cost: 40, difficulty: "hard" },
  { id: "sport_school_r1", label: "校级体育第 1 名", module: "arts", value: 2, cost: 50, difficulty: "hard" },
  { id: "sport_prov_r48", label: "省级体育 4-8 名", module: "arts", value: 2, cost: 80, difficulty: "hard" },
  { id: "sport_prov_r3", label: "省级体育第 3 名", module: "arts", value: 3, cost: 140, difficulty: "hard" },
  { id: "sport_prov_r2", label: "省级体育第 2 名", module: "arts", value: 3.5, cost: 170, difficulty: "hard" },
  { id: "sport_prov_r1", label: "省级体育第 1 名", module: "arts", value: 4, cost: 200, difficulty: "hard" },
  { id: "sport_nat_r48", label: "国家级体育 4-8 名", module: "arts", value: 3, cost: 100, difficulty: "very-hard" },
  { id: "sport_nat_r3", label: "国家级体育第 3 名", module: "arts", value: 4, cost: 180, difficulty: "very-hard" },
  { id: "sport_nat_r2", label: "国家级体育第 2 名", module: "arts", value: 5, cost: 240, difficulty: "very-hard" },
  { id: "sport_nat_r1", label: "国家级体育第 1 名", module: "arts", value: 6, cost: 300, difficulty: "very-hard" },
  { id: "sport_record_school", label: "破校级体育纪录", module: "arts", value: 3, cost: 80, difficulty: "very-hard" },
  { id: "sport_record_provincial", label: "破省级及以上体育纪录", module: "arts", value: 5, cost: 200, difficulty: "very-hard" },

  { id: "org_4_pass", label: "担任四级职务（合格）", module: "org", value: 0.5, cost: 30, difficulty: "normal" },
  { id: "org_4_good", label: "担任四级职务（良）", module: "org", value: 0.75, cost: 50, difficulty: "normal" },
  { id: "org_4_excellent", label: "担任四级职务（优）", module: "org", value: 1, cost: 60, difficulty: "normal" },
  { id: "org_3_pass", label: "担任三级职务（合格）", module: "org", value: 1, cost: 50, difficulty: "normal" },
  { id: "org_3_good", label: "担任三级职务（良）", module: "org", value: 1.5, cost: 80, difficulty: "normal" },
  { id: "org_3_excellent", label: "担任三级职务（优）", module: "org", value: 2, cost: 100, difficulty: "normal" },
  { id: "org_2_pass", label: "担任二级职务（合格）", module: "org", value: 2.5, cost: 180, difficulty: "hard" },
  { id: "org_2_good", label: "担任二级职务（良）", module: "org", value: 3, cost: 200, difficulty: "hard" },
  { id: "org_2_excellent", label: "担任二级职务（优）", module: "org", value: 3.5, cost: 250, difficulty: "hard" },
  { id: "org_1_pass", label: "担任一级职务（合格）", module: "org", value: 3, cost: 300, difficulty: "hard" },
  { id: "org_1_good", label: "担任一级职务（良）", module: "org", value: 3.5, cost: 350, difficulty: "very-hard" },
  { id: "org_1_excellent", label: "担任一级职务（优）", module: "org", value: 4, cost: 400, difficulty: "very-hard" },

  { id: "honor_yuan", label: "获院级荣誉表彰", module: "reward", value: 1, cost: 30, difficulty: "normal" },
  { id: "honor_school", label: "获校级荣誉表彰", module: "reward", value: 2, cost: 100, difficulty: "hard" },
  { id: "honor_city", label: "获市级荣誉表彰", module: "reward", value: 3, cost: 200, difficulty: "hard" },
  { id: "honor_provincial", label: "获省级荣誉表彰", module: "reward", value: 4, cost: 350, difficulty: "very-hard" },
  { id: "honor_national", label: "获全国级荣誉", module: "reward", value: 5, cost: 600, difficulty: "very-hard" },
  { id: "good_deeds_1", label: "完成 1 件好人好事", module: "reward", value: 1, cost: 10, difficulty: "normal" },
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

// 用户现状问卷的 6 个维度。每个字段值为某个 option 的 v 或 null（未填写）。
export const USER_CONTEXT_DIMENSIONS = {
  org:      { label: "当前最高任职", options: [
    { v: "none", l: "暂无" }, { v: "t4", l: "四级（干事/班级干部/宿舍长等）" },
    { v: "t3", l: "三级（部长/班长/团支书等）" }, { v: "t2", l: "二级（院级副职/优秀社团正职等）" },
    { v: "t1", l: "一级（院级及以上正职等）" },
  ]},
  academic: { label: "学科竞赛最高获奖", options: [
    { v: "none", l: "暂无" }, { v: "school", l: "校级/地方/行业" },
    { v: "provincial", l: "省级" }, { v: "national", l: "国际/国家级" },
  ]},
  paper:    { label: "论文 / 专著 / 专利经验", options: [
    { v: "none", l: "暂无" }, { v: "general", l: "国内一般期刊 / 国内会议" },
    { v: "core", l: "国内核心 / 国际会议" }, { v: "intl", l: "国际期刊" },
    { v: "book_patent", l: "出版专著 / 发明专利" },
  ]},
  art:      { label: "文艺竞赛经验", options: [
    { v: "none", l: "暂无" }, { v: "school", l: "校级" },
    { v: "provincial", l: "省级" }, { v: "national", l: "国际/国家级" },
  ]},
  sport:    { label: "体育竞赛经验", options: [
    { v: "none", l: "暂无" }, { v: "school", l: "校级" },
    { v: "provincial", l: "省级" }, { v: "national", l: "国际/国家级" },
  ]},
  honor:    { label: "最高荣誉表彰", options: [
    { v: "none", l: "暂无" }, { v: "yuan", l: "院级" }, { v: "school", l: "校级" },
    { v: "city", l: "市级" }, { v: "provincial", l: "省级" }, { v: "national", l: "全国级" },
  ]},
};

export const DEFAULT_USER_CONTEXT = { org: null, academic: null, paper: null, art: null, sport: null, honor: null };

// 各维度档位→数值秩（数字越大代表用户在该维度的当前水平越高）
const ORG_USER_TIER = { none: 4, t4: 4, t3: 3, t2: 2, t1: 1 };          // tier 数字越小=级别越高（一级=1）
const COMP_LEVEL_RANK = { none: 1, school: 1, provincial: 2, national: 3 };
const PAPER_USER_RANK = { none: 1, general: 1, core: 2, intl: 3, book_patent: 3 };
const HONOR_USER_RANK = { none: 1, yuan: 1, school: 2, city: 3, provincial: 4, national: 5 };

// 判断单个候选项是否符合用户声明的现状（"≤ 当前已达档位"原则）。
// 字段为 null 时跳过该模块过滤；其它项目（基础思政/志愿/集体活动等）不受现状约束。
export function isCandidateReasonable(c, ctx = DEFAULT_USER_CONTEXT) {
  const id = c.id;

  // 组织任职：候选 tier 编号 ≥ 用户 tier 编号（编号越大=级别越低）
  if (id.startsWith("org_")) {
    if (ctx.org == null) return true;
    const m = id.match(/^org_(\d+)_/);
    if (!m) return true;
    const candTier = parseInt(m[1], 10);
    const userTier = ORG_USER_TIER[ctx.org] ?? 4;
    return candTier >= userTier;
  }

  // 学科竞赛
  if (id.startsWith("comp_")) {
    if (ctx.academic == null) return true;
    const candLevel = id.startsWith("comp_school") ? 1 : id.startsWith("comp_prov") ? 2 : id.startsWith("comp_nat") ? 3 : 1;
    return candLevel <= (COMP_LEVEL_RANK[ctx.academic] ?? 1);
  }

  // 论文 / 专著 / 专利
  if (id.startsWith("paper_") || id.startsWith("book_") || id.startsWith("patent_")) {
    if (ctx.paper == null) return true;
    let candRank = 1;
    if (id.startsWith("paper_general")) candRank = 1;
    else if (id.startsWith("paper_core")) candRank = 2;
    else if (id.startsWith("paper_intl")) candRank = 3;
    else if (id.startsWith("book_") || id === "patent_invention") candRank = 3;
    else if (id === "patent_utility") candRank = 2;
    return candRank <= (PAPER_USER_RANK[ctx.paper] ?? 1);
  }

  // 文艺
  if (id.startsWith("art_")) {
    if (ctx.art == null) return true;
    const candLevel = id.startsWith("art_school") ? 1 : id.startsWith("art_prov") ? 2 : id.startsWith("art_nat") ? 3 : 1;
    return candLevel <= (COMP_LEVEL_RANK[ctx.art] ?? 1);
  }

  // 体育（含破纪录）
  if (id.startsWith("sport_")) {
    if (ctx.sport == null) return true;
    let candLevel = 1;
    if (id.startsWith("sport_school") || id === "sport_record_school") candLevel = 1;
    else if (id.startsWith("sport_prov") || id === "sport_record_provincial") candLevel = 2;
    else if (id.startsWith("sport_nat")) candLevel = 3;
    return candLevel <= (COMP_LEVEL_RANK[ctx.sport] ?? 1);
  }

  // 荣誉表彰
  if (id.startsWith("honor_")) {
    if (ctx.honor == null) return true;
    const candLevel = { honor_yuan: 1, honor_school: 2, honor_city: 3, honor_provincial: 4, honor_national: 5 }[id] ?? 1;
    return candLevel <= (HONOR_USER_RANK[ctx.honor] ?? 1);
  }

  // 其它（基础思政、志愿、集体活动、社会实践、挂职、好人好事等）不受现状约束
  return true;
}
