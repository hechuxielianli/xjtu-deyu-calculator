import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Badge, SectionTitle } from "../ui";
import { IconX } from "../icons";
import { recommend, CANDIDATES } from "../../algorithms/recommender";
import { loadExcluded, saveExcluded } from "../../hooks/useLocalStorage";

const MODULE_META = {
  conduct: { label: "品行素质", color: "teal" },
  academic: { label: "学术科研", color: "orange" },
  arts: { label: "文体竞赛", color: "orange" },
  org: { label: "组织任职", color: "orange" },
  reward: { label: "奖励分", color: "amber" },
};

const VERY_HARD_HINT = "破纪录、国家级奖项、省级以上荣誉等";

function formatCost(hours) {
  if (hours === Infinity) return "—";
  if (hours >= 100) return `${hours} 小时（≈${(hours / 8).toFixed(1)} 工作日）`;
  return `${hours} 小时`;
}

function runRecommend(scores, target, excludedIds, includeHard) {
  const filtered = CANDIDATES.filter(c =>
    !excludedIds.has(c.id) && (includeHard || c.difficulty !== "very-hard")
  );
  const result = recommend(scores, target, filtered);
  let relaxed = null;
  if (!result.feasible && !includeHard) {
    const r = recommend(scores, target, CANDIDATES.filter(c => !excludedIds.has(c.id)));
    if (r.feasible) relaxed = r;
  }
  return { result, relaxed };
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
          <div className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{result.achievable.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">总时长</div>
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
              {items.map((c) => {
                const fading = fadingId === c.id;
                return (
                  <li
                    key={c.id}
                    className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm transition-all duration-200 ${fading ? "opacity-30 line-through" : "opacity-100"}`}
                  >
                    <span className="text-slate-700 dark:text-slate-200 flex-1 truncate">{c.label}</span>
                    <span className="shrink-0 font-mono text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400">+{c.value}</span>
                      <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
                      <span className="text-orange-600 dark:text-orange-400">{formatCost(c.cost)}</span>
                    </span>
                    <button
                      onClick={() => onExclude(c.id)}
                      disabled={fading}
                      aria-label={`排除${c.label}`}
                      title="排除此项"
                      className="shrink-0 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 rounded transition disabled:opacity-50"
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

export function RecommenderTab({ scores }) {
  const [target, setTarget] = useState(() => Math.min(105, Math.ceil(scores.total + 5)));
  const [result, setResult] = useState(null);
  const [relaxed, setRelaxed] = useState(null);
  const [excludedIds, setExcludedIds] = useState(() => loadExcluded());
  const [includeHard, setIncludeHard] = useState(false);
  const [fadingId, setFadingId] = useState(null);
  const hasComputedRef = useRef(false);

  useEffect(() => { saveExcluded(excludedIds); }, [excludedIds]);

  const labelById = useMemo(() => {
    const m = {};
    for (const c of CANDIDATES) m[c.id] = c.label;
    return m;
  }, []);

  const hiddenHardCount = useMemo(
    () => CANDIDATES.filter(c => c.difficulty === "very-hard" && !excludedIds.has(c.id)).length,
    [excludedIds]
  );

  const compute = () => {
    hasComputedRef.current = true;
    const { result: r, relaxed: rx } = runRecommend(scores, target, excludedIds, includeHard);
    setResult(r);
    setRelaxed(rx);
  };

  useEffect(() => {
    if (!hasComputedRef.current) return;
    const { result: r, relaxed: rx } = runRecommend(scores, target, excludedIds, includeHard);
    setResult(r);
    setRelaxed(rx);
    // target 故意不在依赖里：滑块拖动不应触发自动重算
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludedIds, includeHard]);

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

  const gap = target - scores.total;
  const excludedArray = [...excludedIds];

  return (
    <div className="space-y-4">
      <SectionTitle icon="🧮" title="目标分推荐器" subtitle="推荐最经济的加分组合" score={scores.total} maxScore={105} color="orange" />

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
        <button onClick={compute} disabled={gap <= 0}
          className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium transition disabled:cursor-not-allowed">
          {gap <= 0 ? "目标已达成" : "生成推荐"}
        </button>

        {excludedArray.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">已排除 {excludedArray.length} 项</span>
              <button onClick={onClearExcluded} className="ml-auto text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline">
                全部恢复
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {excludedArray.map(id => (
                <button key={id} onClick={() => onRestore(id)}
                  title="点击恢复"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition">
                  <span className="truncate max-w-[10rem]">{labelById[id] || id}</span>
                  <span aria-hidden>×</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {hiddenHardCount > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
          {includeHard ? (
            <>已包含全部高难度项目（{VERY_HARD_HINT}）。<button onClick={() => setIncludeHard(false)} className="text-orange-600 dark:text-orange-400 hover:underline">隐藏</button></>
          ) : (
            <>已自动隐藏 {hiddenHardCount} 项高难度推荐（{VERY_HARD_HINT}）。<button onClick={() => setIncludeHard(true)} className="text-orange-600 dark:text-orange-400 hover:underline">显示</button></>
          )}
        </div>
      )}

      {result && !result.feasible && (
        <Card className="border-red-300 dark:border-red-700">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">无法达成目标</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            当前排除项与候选范围下，剩余可选项不足以达到目标分。可恢复部分排除项、调低目标分，或包含高难度项目。
          </p>
          {relaxed && (
            <button onClick={() => setIncludeHard(true)}
              className="w-full py-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition">
              包含高难度项目后可达成，总时长 {relaxed.cost} 小时 · 一键包含
            </button>
          )}
        </Card>
      )}

      {result && result.feasible && result.selected.length === 0 && (
        <Card>
          <Badge color="emerald">已达标</Badge>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">当前总分已≥目标分，无需任何加分项。</p>
        </Card>
      )}

      {result && result.feasible && result.selected.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">推荐加分方案</h3>
          <ResultBody result={result} onExclude={onExclude} fadingId={fadingId} />
        </Card>
      )}

      <details className="group">
        <summary className="text-xs text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none py-1">
          了解推荐原理
        </summary>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1 px-1">
          <p>推荐器以"达到目标分所需总时长最少"为优化目标，在各模块上限与组织任职互斥约束下求最优组合。</p>
          <p>算法细节与实验对比见仓库内 <code className="text-slate-600 dark:text-slate-300">docs/ALGORITHM.md</code>。</p>
        </div>
      </details>
    </div>
  );
}
