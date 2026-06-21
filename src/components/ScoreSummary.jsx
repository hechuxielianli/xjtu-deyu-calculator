import { Card, AnimatedNumber } from "./ui";
import { cn } from "../utils/cn";
import { ScoreChart } from "./ScoreChart";
import { IconShare, IconSigma } from "./icons";

export function ScoreSummary({ scores, onExport, variant = "floating", className }) {
  const isSidebar = variant === "sidebar";

  return (
    <div className={cn(
      isSidebar ? "lg:sticky lg:top-[88px] space-y-4" : "mt-6 space-y-4",
      className,
    )}>
      <Card hoverable>
        <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
          <span className="inline-flex w-6 h-6 rounded-lg bg-brand-600 text-white dark:bg-brand-400 dark:text-slate-950 items-center justify-center"><IconSigma className="w-3.5 h-3.5" /></span>
          得分汇总
        </h3>
        <ScoreChart scores={scores} />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-slate-600 dark:text-slate-400">品行素质分</span>
            <span className="font-mono font-semibold text-right">
              <span className="text-slate-500 dark:text-slate-400 text-xs mr-1 hidden sm:inline">(70+{scores.conduct.collective.toFixed(1)}+{scores.conduct.political.toFixed(1)}+{scores.conduct.social.toFixed(1)}{scores.conduct.penalty > 0 ? `−${scores.conduct.penalty}` : ""})</span>
              <AnimatedNumber value={scores.conduct.total} className="text-slate-900 dark:text-slate-100" />
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-slate-600 dark:text-slate-400">能力拓展分</span>
            <span className="font-mono font-semibold text-right">
              <span className="text-slate-500 dark:text-slate-400 text-xs mr-1 hidden sm:inline">({scores.ability.academic.toFixed(1)}+{scores.ability.artSport.toFixed(1)}+{scores.ability.org.toFixed(1)})</span>
              <AnimatedNumber value={scores.ability.total} className="text-slate-900 dark:text-slate-100" />
            </span>
          </div>
          <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">奖励分</span>
            <AnimatedNumber value={scores.reward.total} className="font-mono font-semibold text-slate-900 dark:text-slate-100" />
          </div>
          <div className="border-t pt-2 flex justify-between items-baseline border-slate-200/80 dark:border-white/10">
            <span className="font-semibold text-slate-800 dark:text-slate-100">总分</span>
            <AnimatedNumber value={scores.total} className="font-mono text-2xl font-bold text-brand-700 dark:text-brand-300" />
          </div>
        </div>
      </Card>

      <button onClick={onExport}
        className={cn(
          "flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-medium transition-colors duration-200",
          "bg-brand-700 text-white hover:bg-brand-800",
          "dark:bg-brand-400 dark:text-slate-950 dark:hover:bg-brand-300",
          "active:scale-[0.98]",
          isSidebar ? "w-full" : "mx-auto",
        )}>
        <IconShare />导出得分报告
      </button>

      {!isSidebar && (
        <p className="text-center text-xs mt-2 text-slate-500 dark:text-slate-400">
          仅供参考，最终以学校/书院官方认定为准
        </p>
      )}
    </div>
  );
}
