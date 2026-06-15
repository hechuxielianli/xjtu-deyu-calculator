import { Card, cn } from "./ui";
import { ScoreChart } from "./ScoreChart";
import { IconShare, IconSigma } from "./icons";

export function ScoreSummary({ scores, onExport, variant = "floating", className }) {
  const isSidebar = variant === "sidebar";

  return (
    <div className={cn(
      isSidebar ? "lg:sticky lg:top-[88px] space-y-4" : "mt-6 space-y-4",
      className,
    )}>
      <Card hoverable accent="brand" className="bg-gradient-to-br from-white/80 to-brand-50/40 dark:from-slate-900/60 dark:to-brand-950/30">
        <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
          <span className="inline-flex w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white items-center justify-center"><IconSigma className="w-3.5 h-3.5" /></span>
          得分汇总
        </h3>
        <ScoreChart scores={scores} />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-slate-600 dark:text-slate-400">品行素质分</span>
            <span className="font-mono font-semibold text-right">
              <span className="text-slate-400 dark:text-slate-500 text-xs mr-1 hidden sm:inline">(70+{scores.conduct.collective.toFixed(1)}+{scores.conduct.political.toFixed(1)}+{scores.conduct.social.toFixed(1)}{scores.conduct.penalty > 0 ? `−${scores.conduct.penalty}` : ""})</span>
              <span className="text-conduct-600 dark:text-conduct-300">{scores.conduct.total.toFixed(1)}</span>
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-slate-600 dark:text-slate-400">能力拓展分</span>
            <span className="font-mono font-semibold text-right">
              <span className="text-slate-400 dark:text-slate-500 text-xs mr-1 hidden sm:inline">({scores.ability.academic.toFixed(1)}+{scores.ability.artSport.toFixed(1)}+{scores.ability.org.toFixed(1)})</span>
              <span className="text-ability-600 dark:text-ability-300">{scores.ability.total.toFixed(1)}</span>
            </span>
          </div>
          <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">奖励分</span>
            <span className="font-mono font-semibold text-reward-600 dark:text-reward-300">{scores.reward.total.toFixed(1)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-baseline border-slate-200/80 dark:border-white/10">
            <span className="font-semibold text-slate-800 dark:text-slate-100">总分</span>
            <span className="font-mono text-2xl font-bold tabular-nums text-brand-700 dark:text-brand-300">{scores.total.toFixed(1)}</span>
          </div>
        </div>
      </Card>

      <button onClick={onExport}
        className={cn(
          "flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-medium transition-all duration-200",
          "bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 text-white",
          "hover:from-brand-700 hover:via-brand-600 hover:to-accent-600",
          "shadow-lg shadow-brand-500/25 dark:shadow-brand-500/20",
          "hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5",
          "active:scale-[0.97] active:translate-y-0",
          isSidebar ? "w-full" : "mx-auto",
        )}>
        <IconShare />导出得分报告
      </button>

      {!isSidebar && (
        <p className="text-center text-xs mt-2 text-slate-400 dark:text-slate-500">
          仅供参考，最终以学校/书院官方认定为准
        </p>
      )}
    </div>
  );
}
