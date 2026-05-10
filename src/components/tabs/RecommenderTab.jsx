import { useMemo, useState } from "react";
import { Card, Badge, SectionTitle, Field } from "../ui";
import { compareAlgorithms, complexityInfo, CANDIDATES } from "../../algorithms/recommender";

const MODULE_META = {
  conduct: { label: "品行素质", color: "teal" },
  academic: { label: "学术科研", color: "orange" },
  arts: { label: "文体竞赛", color: "orange" },
  org: { label: "组织任职", color: "orange" },
  reward: { label: "奖励分", color: "amber" },
};

function formatCost(hours) {
  if (hours === Infinity) return "—";
  if (hours >= 100) return `${hours} 小时（≈${(hours / 8).toFixed(1)} 工作日）`;
  return `${hours} 小时`;
}

function ResultCard({ title, result, badge }) {
  if (!result) return null;
  if (!result.feasible) {
    return (
      <Card className="border-red-300 dark:border-red-700">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
          <Badge color="red">不可行</Badge>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">现有候选项无法达到目标分（候选库覆盖范围受限）。</p>
      </Card>
    );
  }
  if (result.selected.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
          <Badge color="emerald">已达标</Badge>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">当前总分已≥目标分，无需任何加分项。</p>
      </Card>
    );
  }
  const grouped = result.selected.reduce((m, c) => {
    (m[c.module] = m[c.module] || []).push(c);
    return m;
  }, {});
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        {badge && <Badge color={badge.color}>{badge.label}</Badge>}
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-mono">
          耗时 {result.timeMs.toFixed(2)} ms
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">目标分差</div>
          <div className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">+{result.gap.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">实际增量</div>
          <div className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{result.achievable.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">总代价</div>
          <div className="font-mono text-sm font-semibold text-orange-600 dark:text-orange-400">{result.cost} 小时</div>
        </div>
      </div>
      <div className="space-y-2">
        {Object.entries(grouped).map(([m, items]) => (
          <div key={m}>
            <div className="flex items-center gap-2 mb-1">
              <Badge color={MODULE_META[m]?.color || "slate"}>{MODULE_META[m]?.label || m}</Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                +{items.reduce((s, c) => s + c.value, 0).toFixed(1)} 分 / {items.reduce((s, c) => s + c.cost, 0)} 小时
              </span>
            </div>
            <ul className="space-y-1 ml-1">
              {items.map((c, i) => (
                <li key={`${c.id}-${i}`} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
                  <span className="text-slate-700 dark:text-slate-200">{c.label}</span>
                  <span className="shrink-0 font-mono text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400">+{c.value}</span>
                    <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
                    <span className="text-orange-600 dark:text-orange-400">{formatCost(c.cost)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RecommenderTab({ scores }) {
  const [target, setTarget] = useState(() => Math.min(105, Math.ceil(scores.total + 5)));
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const info = useMemo(() => complexityInfo(), []);

  const onCompute = () => {
    setRunning(true);
    // 异步避免阻塞 UI（虽然 DP 仅几毫秒，但为了仪式感）
    setTimeout(() => {
      const r = compareAlgorithms(scores, target);
      setResult(r);
      setRunning(false);
    }, 50);
  };

  const gap = target - scores.total;
  const dpVsGreedy = result && result.dp.feasible && result.greedy.feasible
    ? { saved: result.greedy.cost - result.dp.cost, ratio: (1 - result.dp.cost / result.greedy.cost) * 100 }
    : null;

  return (
    <div className="space-y-4">
      <SectionTitle icon="🧮" title="目标分推荐器" subtitle="0/1 背包 DP vs 贪心算法 · 反向求解最优加分组合" score={scores.total} maxScore={105} color="orange" />

      <Card>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">设置目标</h3>
        <div className="mb-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">当前总分</span>
            <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">{scores.total.toFixed(1)} / 105</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">目标总分</span>
            <span className="font-mono text-base font-bold text-orange-600 dark:text-orange-400">{target.toFixed(1)}</span>
          </div>
          <input type="range" min={Math.ceil(scores.total)} max={105} step={0.5} value={target}
            onChange={e => setTarget(Number(e.target.value))}
            className="w-full accent-orange-500" />
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
            <span>{Math.ceil(scores.total)}</span>
            <span>需要 +{gap.toFixed(1)} 分</span>
            <span>105</span>
          </div>
        </div>
        <button onClick={onCompute} disabled={running || gap <= 0}
          className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium transition disabled:cursor-not-allowed">
          {running ? "计算中…" : gap <= 0 ? "目标已达成" : "计算最优加分方案"}
        </button>
      </Card>

      {result && (
        <>
          <ResultCard title="DP 精确解（0/1 背包）" result={result.dp} badge={{ label: "最优", color: "emerald" }} />
          <ResultCard title="贪心解（按性价比降序）" result={result.greedy} badge={{ label: "近似", color: "amber" }} />

          {dpVsGreedy && (
            <Card className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">📊 算法对比</h3>
              {dpVsGreedy.saved > 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  本场景下 DP 比贪心节省 <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{dpVsGreedy.saved.toFixed(0)} 小时</span>
                  <span className="text-slate-400 dark:text-slate-500">（{dpVsGreedy.ratio.toFixed(1)}%）</span>
                </p>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  本场景下两算法解相同（贪心恰好命中最优）。
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                <div className="px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60">
                  <div className="text-slate-500 dark:text-slate-400 mb-1">DP 耗时</div>
                  <div className="font-mono font-semibold text-slate-700 dark:text-slate-200">{result.dp.timeMs.toFixed(3)} ms</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60">
                  <div className="text-slate-500 dark:text-slate-400 mb-1">贪心耗时</div>
                  <div className="font-mono font-semibold text-slate-700 dark:text-slate-200">{result.greedy.timeMs.toFixed(3)} ms</div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      <Card>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">算法说明</h3>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <p><span className="font-semibold">问题建模：</span>给定当前总分 S 与目标 T，候选项集合 {`{(v_i, c_i, m_i)}`}（增量 / 代价 / 模块），求 0/1 决策变量 x_i 使 Σv_i·x_i ≥ T-S 且 Σc_i·x_i 最小，受各模块上限与组织任职互斥约束。</p>
          <p><span className="font-semibold">DP 算法：</span>分模块 0/1 背包获得 cost(v) 表 → 跨模块合并背包 → 在 v ≥ T-S 区间取最小 cost 并回溯。复杂度 {info.dp}。</p>
          <p><span className="font-semibold">贪心算法：</span>按 v_i / c_i 降序选取直至满足约束。复杂度 {info.greedy}，作为近似解对照。</p>
          <p className="text-slate-400 dark:text-slate-500">候选项库共 {info.N} 项 · 总状态空间 W = {info.W_total}（0.1 精度 × 105 满分）</p>
        </div>
      </Card>
    </div>
  );
}
