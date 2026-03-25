import { cn } from "./ui";

export function ScoreChart({ scores }) {
  const modules = [
    { label: "品行素质", score: scores.conduct.total, max: 80, color: "teal",
      subs: [{ l: "基准", v: scores.conduct.base }, { l: "集体", v: scores.conduct.collective }, { l: "思政", v: scores.conduct.political }, { l: "服务", v: scores.conduct.social }, ...(scores.conduct.penalty > 0 ? [{ l: "扣分", v: -scores.conduct.penalty }] : [])] },
    { label: "能力拓展", score: scores.ability.total, max: 20, color: "orange",
      subs: [{ l: "学术", v: scores.ability.academic }, { l: "文体", v: scores.ability.artSport }, { l: "任职", v: scores.ability.org }] },
    { label: "奖励分", score: scores.reward.total, max: 5, color: "amber",
      subs: [{ l: "荣誉", v: scores.reward.honor }, { l: "好事", v: scores.reward.deeds }] },
  ];
  const colors = {
    teal: { bar: "bg-teal-500 dark:bg-teal-400", text: "text-teal-600 dark:text-teal-400" },
    orange: { bar: "bg-orange-500 dark:bg-orange-400", text: "text-orange-600 dark:text-orange-400" },
    amber: { bar: "bg-amber-500 dark:bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
  };
  return (
    <div className="space-y-3 my-3">
      {modules.map(m => {
        const pct = m.max > 0 ? (m.score / m.max) * 100 : 0;
        const c = colors[m.color];
        return (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-xs font-semibold", c.text)}>{m.label}</span>
              <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{m.score.toFixed(1)}<span className="text-slate-400 dark:text-slate-500">/{m.max}</span></span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-500", c.bar)} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <div className="flex gap-2 mt-1 flex-wrap">
              {m.subs.map(s => (
                <span key={s.l} className="text-[10px] text-slate-400 dark:text-slate-500">
                  {s.l} <span className={cn("font-mono", s.v < 0 ? "text-red-500" : "text-slate-500 dark:text-slate-400")}>{s.v >= 0 ? "+" : ""}{s.v.toFixed(1)}</span>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
