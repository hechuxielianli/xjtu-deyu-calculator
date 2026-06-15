import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Badge, SectionTitle, Select, Checkbox, cn } from "../ui";
import { IconX } from "../icons";
import {
  recommend, CANDIDATES, isCandidateReasonable,
  isCandidateAvailable, achievedCandidateIds,
  USER_CONTEXT_DIMENSIONS, DEFAULT_USER_CONTEXT,
  complexityInfo,
} from "../../algorithms/recommender";
import {
  loadExcluded, saveExcluded,
  loadUserContext, saveUserContext,
} from "../../hooks/useLocalStorage";

const MODULE_META = {
  conduct:  { label: "品行素质", color: "conduct" },
  academic: { label: "学术科研", color: "ability" },
  arts:     { label: "文体竞赛", color: "ability" },
  org:      { label: "组织任职", color: "ability" },
  reward:   { label: "奖励分",   color: "reward"  },
};

function formatCost(hours) {
  if (hours === Infinity) return "—";
  if (hours >= 100) return `${hours} 小时（≈${(hours / 8).toFixed(1)} 工作日）`;
  return `${hours} 小时`;
}

function runRecommend(scores, target, excludedIds, includeHard, userContext, state) {
  // 自动跳过：① 已完成的一次性项（缺陷 1）；② 前置依赖未满足、会算 0 分的无效项。
  const achievedIds = achievedCandidateIds(state);
  const baseFilter = c =>
    !excludedIds.has(c.id) &&
    !achievedIds.has(c.id) &&
    isCandidateAvailable(c, state) &&
    isCandidateReasonable(c, userContext);

  const filtered = CANDIDATES.filter(c => baseFilter(c) && (includeHard || c.difficulty !== "very-hard"));
  const result = recommend(scores, target, filtered);
  let relaxed = null;
  if (!result.feasible && !includeHard) {
    const r = recommend(scores, target, CANDIDATES.filter(baseFilter));
    if (r.feasible) relaxed = r;
  }
  return { result, relaxed, skippedCount: achievedIds.size };
}

function ResultBody({ result, onExclude, fadingId }) {
  const grouped = result.selected.reduce((m, c) => {
    (m[c.module] = m[c.module] || []).push(c);
    return m;
  }, {});
  return (
    <>
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">目标分差</div>
          <div className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">+{result.gap.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">实际增量</div>
          <div className="font-mono text-sm font-semibold text-success-600 dark:text-success-400">+{result.achievable.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">总时长</div>
          <div className="font-mono text-sm font-semibold text-ability-600 dark:text-ability-300">{result.cost} 小时</div>
        </div>
      </div>
      <div className="space-y-2">
        {Object.entries(grouped).map(([m, items]) => (
          <div key={m}>
            <div className="flex items-center gap-2 mb-1">
              <Badge color={MODULE_META[m]?.color || "neutral"}>{MODULE_META[m]?.label || m}</Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                +{items.reduce((s, c) => s + c.value, 0).toFixed(1)} 分 / {items.reduce((s, c) => s + c.cost, 0)} 小时
              </span>
            </div>
            <ul className="space-y-1 ml-1">
              {items.map((c) => {
                const fading = fadingId === c.id;
                return (
                  <li
                    key={c.id}
                    className={cn(
                      "flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm transition-all duration-200",
                      "bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm border border-white/40 dark:border-white/5",
                      fading ? "opacity-30 line-through" : "opacity-100",
                    )}
                  >
                    <span className="text-slate-700 dark:text-slate-200 flex-1 truncate">{c.label}</span>
                    <span className="shrink-0 font-mono text-xs">
                      <span className="text-success-600 dark:text-success-400">+{c.value}</span>
                      <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
                      <span className="text-ability-600 dark:text-ability-300">{formatCost(c.cost)}</span>
                    </span>
                    <button
                      onClick={() => onExclude(c.id)}
                      disabled={fading}
                      aria-label={`排除${c.label}`}
                      title="排除此项"
                      className="shrink-0 text-slate-400 hover:text-danger-500 dark:text-slate-500 dark:hover:text-danger-400 p-1 rounded transition disabled:opacity-50"
                    >
                      <IconX />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

export function RecommenderTab({ scores, state }) {
  const [target, setTarget] = useState(() => Math.min(105, Math.ceil(scores.total + 5)));
  const [result, setResult] = useState(null);
  const [relaxed, setRelaxed] = useState(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const [excludedIds, setExcludedIds] = useState(() => loadExcluded());
  const [includeHard, setIncludeHard] = useState(true);
  const [userContext, setUserContext] = useState(() => loadUserContext());
  const [fadingId, setFadingId] = useState(null);
  const hasComputedRef = useRef(false);

  useEffect(() => { saveExcluded(excludedIds); }, [excludedIds]);
  useEffect(() => { saveUserContext(userContext); }, [userContext]);

  const labelById = useMemo(() => {
    const m = {};
    for (const c of CANDIDATES) m[c.id] = c.label;
    return m;
  }, []);

  const info = useMemo(() => complexityInfo(), []);

  const compute = () => {
    hasComputedRef.current = true;
    const { result: r, relaxed: rx, skippedCount: sc } = runRecommend(scores, target, excludedIds, includeHard, userContext, state);
    setResult(r);
    setRelaxed(rx);
    setSkippedCount(sc);
  };

  useEffect(() => {
    if (!hasComputedRef.current) return;
    const { result: r, relaxed: rx, skippedCount: sc } = runRecommend(scores, target, excludedIds, includeHard, userContext, state);
    setResult(r);
    setRelaxed(rx);
    setSkippedCount(sc);
    // target 故意不在依赖里：滑块拖动不应触发自动重算
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludedIds, includeHard, userContext]);

  const onExclude = (id) => {
    setFadingId(id);
    setTimeout(() => {
      setExcludedIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setFadingId(null);
    }, 200);
  };

  const onRestore = (id) => {
    setExcludedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const onClearExcluded = () => setExcludedIds(new Set());
  const onClearContext = () => setUserContext({ ...DEFAULT_USER_CONTEXT });

  const gap = target - scores.total;
  const excludedArray = [...excludedIds];
  const contextFilledCount = Object.values(userContext).filter(v => v != null).length;

  return (
    <div className="space-y-4">
      <SectionTitle icon="🧮" title="目标分推荐器" subtitle="推荐最经济的加分组合" score={scores.total} maxScore={105} color="brand" />

      <Card>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">设置目标</h3>
        <div className="mb-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">当前总分</span>
            <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">{scores.total.toFixed(1)} / 105</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">目标总分</span>
            <span className="font-mono text-base font-bold bg-gradient-to-br from-brand-600 to-accent-600 dark:from-brand-300 dark:to-accent-300 bg-clip-text text-transparent">{target.toFixed(1)}</span>
          </div>
          <input type="range" min={Math.ceil(scores.total)} max={105} step={0.5} value={target}
            onChange={e => setTarget(Number(e.target.value))}
            className="w-full" />
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
            <span>{Math.ceil(scores.total)}</span>
            <span>需要 +{Math.max(0, gap).toFixed(1)} 分</span>
            <span>105</span>
          </div>
        </div>
        <button onClick={compute} disabled={gap <= 0}
          className="w-full py-2.5 rounded-xl text-white text-sm font-medium transition-all bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 hover:from-brand-700 hover:via-brand-600 hover:to-accent-600 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:bg-none disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed">
          {gap <= 0 ? "目标已达成" : "生成推荐"}
        </button>

        {excludedArray.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">已排除 {excludedArray.length} 项</span>
              <button onClick={onClearExcluded} className="ml-auto text-xs text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200 underline">
                全部恢复
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {excludedArray.map(id => (
                <button key={id} onClick={() => onRestore(id)}
                  title="点击恢复"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100/80 dark:bg-slate-700/50 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/30 dark:hover:text-danger-300 transition">
                  <span className="truncate max-w-[10rem]">{labelById[id] || id}</span>
                  <span aria-hidden>×</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="pt-0.5">
            <Checkbox checked={includeHard} onChange={setIncludeHard} label="" />
          </div>
          <div className="flex-1 -ml-1">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">包含高难度项目</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              如破校纪录、国家级竞赛奖项、省级以上荣誉、出版专著、发明专利等。取消勾选可仅看容易达成的项目。
            </p>
          </div>
        </label>
      </Card>

      {/* ── 推荐结果（放在配置之后、"我的现状"之前） ── */}
      {result && skippedCount > 0 && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2 text-xs border bg-brand-50/60 dark:bg-brand-900/20 border-brand-100/70 dark:border-brand-800/40 text-slate-600 dark:text-slate-300 motion-safe:animate-[fadeInUp_0.25s_ease-out]">
          <span aria-hidden className="shrink-0 mt-px font-bold text-brand-500 dark:text-brand-300">ⓘ</span>
          <span>已根据你当前的填写，自动跳过 <span className="font-semibold text-slate-800 dark:text-slate-100">{skippedCount}</span> 个已完成 / 不再增分的项目。</span>
        </div>
      )}

      {result && !result.feasible && (
        <Card className="border-danger-300/70 dark:border-danger-700/50 motion-safe:animate-[fadeInUp_0.25s_ease-out]">
          <h3 className="text-sm font-semibold text-danger-700 dark:text-danger-300 mb-2">无法达成目标</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            当前候选项不足以达成目标。可以：① 取消已排除的项目；② 在「我的现状」中提高已声明的最高档位以扩大推荐范围；③ 或调低目标分。
          </p>
          {relaxed && (
            <button onClick={() => setIncludeHard(true)}
              className="w-full py-2 rounded-lg bg-brand-100/80 dark:bg-brand-900/30 backdrop-blur-sm text-brand-700 dark:text-brand-300 text-xs font-medium hover:bg-brand-200/80 dark:hover:bg-brand-900/50 transition">
              包含高难度项目后可达成，总时长 {relaxed.cost} 小时 · 一键包含
            </button>
          )}
        </Card>
      )}

      {result && result.feasible && result.selected.length === 0 && (
        <Card className="motion-safe:animate-[fadeInUp_0.25s_ease-out]">
          <Badge color="success">已达标</Badge>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">当前总分已≥目标分，无需任何加分项。</p>
        </Card>
      )}

      {result && result.feasible && result.selected.length > 0 && (
        <Card className="motion-safe:animate-[fadeInUp_0.25s_ease-out]">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">推荐加分方案</h3>
          <ResultBody result={result} onExclude={onExclude} fadingId={fadingId} />
        </Card>
      )}

      <Card>
        <details open className="group">
          <summary className="cursor-pointer flex items-center gap-2 select-none list-none">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">我的现状</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {contextFilledCount > 0 ? `已填 ${contextFilledCount}/6 项` : "可选 · 填写后推荐更贴合实际"}
            </span>
            <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform duration-200">▾</span>
          </summary>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-3">
            推荐器只会建议「不超过你已达档位」的项目。例如选择"任职=三级"，将不再推荐一/二级职务。
          </p>
          <div className="space-y-2">
            {Object.entries(USER_CONTEXT_DIMENSIONS).map(([key, dim]) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-xs text-slate-600 dark:text-slate-300 w-24 shrink-0">{dim.label}</label>
                <Select
                  value={userContext[key] ?? ""}
                  onChange={v => setUserContext(prev => ({ ...prev, [key]: v === "" ? null : v }))}
                  options={[{ value: "", label: "不指定" }, ...dim.options.map(o => ({ value: o.v, label: o.l }))]}
                />
              </div>
            ))}
            {contextFilledCount > 0 && (
              <div className="flex justify-end pt-1">
                <button onClick={onClearContext}
                  className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200 underline">
                  清空全部
                </button>
              </div>
            )}
          </div>
        </details>
      </Card>

      <details className="group">
        <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none py-1 inline-flex items-center gap-1 transition-colors duration-200">
          ▸<span className="group-open:hidden">了解推荐原理</span><span className="hidden group-open:inline">推荐原理</span>
        </summary>
        <div className="mt-3 p-3 space-y-3 text-xs rounded-xl border bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border-white/50 dark:border-white/5 text-slate-600 dark:text-slate-300 motion-safe:animate-[fadeInUp_0.2s_ease-out]">
          <div>
            <p className="font-semibold mb-1 text-slate-700 dark:text-slate-200">① 优化目标</p>
            <p>
              在所有能达到目标分的加分组合中，选出 <span className="font-semibold text-brand-700 dark:text-brand-300">总努力时长最少</span> 的一组。
              每个候选项都标注了估算的小时数代价（来自经验估值，如"志愿 32 小时"、"准备校级竞赛 ≈60 小时"等）。
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1 text-slate-700 dark:text-slate-200">② 约束条件</p>
            <ul className="space-y-0.5 list-disc list-inside pl-1 text-slate-500 dark:text-slate-300">
              <li>各模块独立封顶：品行 <span className="font-mono">80</span> / 学术 <span className="font-mono">10</span> / 文体 <span className="font-mono">6</span> / 任职 <span className="font-mono">4</span> / 奖励 <span className="font-mono">5</span></li>
              <li>组织任职<span className="font-semibold text-slate-700 dark:text-slate-200">互斥</span>：最多担任一项</li>
              <li>"我的现状"声明的档位会自动过滤掉超出范围的候选项（例如已任三级则不再推荐一/二级）</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-1 text-slate-700 dark:text-slate-200">③ 求解算法</p>
            <p className="mb-1.5">
              问题等价于 <span className="font-semibold">带模块上限的 0/1 背包变形</span>：
              <br />
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-300">变量 x_i ∈ {`{0,1}`}，约束 Σ value_i·x_i ≥ 分差 且 各模块 Σ ≤ cap_m，目标 min Σ cost_i·x_i</span>
            </p>
            <ul className="space-y-1 list-disc list-inside pl-1 text-slate-500 dark:text-slate-300">
              <li>
                <span className="font-medium text-slate-700 dark:text-slate-200">DP（动态规划，本工具采用）</span>：
                按模块独立做 0/1 背包得到「精确增量 v → 最小代价」表 → 跨模块合并背包 → 在 v ≥ 分差区间取最小 cost 并回溯还原选项。复杂度 <span className="font-mono text-[11px]">{info.dp}</span>。
              </li>
              <li>
                <span className="font-medium text-slate-700 dark:text-slate-200">贪心（理论对照）</span>：
                按性价比 <span className="font-mono">value / cost</span> 降序逐项选取至达成约束。复杂度 <span className="font-mono text-[11px]">{info.greedy}</span>，仅得近似解 — 在临近上限的「刚好够用」场景下可能多选 1–2 项造成浪费。
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-1 text-slate-700 dark:text-slate-200">④ 数据规模 / 性能</p>
            <p className="text-slate-500 dark:text-slate-300">
              候选项库共 <span className="font-mono text-slate-700 dark:text-slate-200">{info.N}</span> 项，
              总状态空间 W = <span className="font-mono text-slate-700 dark:text-slate-200">{info.W_total}</span>（0.1 分精度 × 105 满分）。
              典型场景下 DP 实测耗时 &lt; 1 ms，对用户交互无可感延迟。
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
