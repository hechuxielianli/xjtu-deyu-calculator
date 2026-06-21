import { cn } from "../utils/cn";

export function ScoreChart({ scores }) {
  const modules = [
    { label: "品行素质", score: scores.conduct.total, max: 80, color: "conduct",
      subs: [{ l: "基准", v: scores.conduct.base }, { l: "集体", v: scores.conduct.collective }, { l: "思政", v: scores.conduct.political }, { l: "服务", v: scores.conduct.social }, ...(scores.conduct.penalty > 0 ? [{ l: "扣分", v: -scores.conduct.penalty }] : [])] },
    { label: "能力拓展", score: scores.ability.total, max: 20, color: "ability",
      subs: [{ l: "学术", v: scores.ability.academic }, { l: "文体", v: scores.ability.artSport }, { l: "任职", v: scores.ability.org }] },
    { label: "奖励分", score: scores.reward.total, max: 5, color: "reward",
      subs: [{ l: "荣誉", v: scores.reward.honor }, { l: "好事", v: scores.reward.deeds }] },
  ];
  // 近单色：三模块统一交大蓝实色条 + 墨色标签（模块靠文字区分，不再用色相）
  const c = { bar: "bg-brand-600 dark:bg-brand-400", text: "text-slate-700 dark:text-slate-200" };
  return (
    <div className="space-y-3 my-3">
      {modules.map(m => {
        const pct = m.max > 0 ? (m.score / m.max) * 100 : 0;
        return (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-xs font-semibold", c.text)}>{m.label}</span>
              <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{m.score.toFixed(1)}<span className="text-slate-500 dark:text-slate-400">/{m.max}</span></span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-500 ease-out", c.bar)} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <div className="flex gap-2 mt-1 flex-wrap">
              {m.subs.map(s => (
                <span key={s.l} className="text-[10px] text-slate-500 dark:text-slate-400">
                  {s.l} <span className={cn("font-mono", s.v < 0 ? "text-danger-500 dark:text-danger-400" : "text-slate-500 dark:text-slate-400")}>{s.v >= 0 ? "+" : ""}{s.v.toFixed(1)}</span>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
