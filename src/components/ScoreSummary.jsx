import { Card } from "./ui";
import { ScoreChart } from "./ScoreChart";
import { IconShare } from "./icons";

export function ScoreSummary({ scores, onExport }) {
  return (
    <>
      <div className="mt-6">
        <Card className="border-slate-300/60 dark:border-slate-600/50 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800/40">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">得分汇总</h3>
          <ScoreChart scores={scores} />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-slate-600 dark:text-slate-400">品行素质分</span>
              <span className="font-mono font-semibold text-right">
                <span className="text-slate-400 dark:text-slate-500 text-xs mr-1 hidden sm:inline">(70+{scores.conduct.collective.toFixed(1)}+{scores.conduct.political.toFixed(1)}+{scores.conduct.social.toFixed(1)}{scores.conduct.penalty > 0 ? `−${scores.conduct.penalty}` : ""})</span>
                <span className="text-teal-600 dark:text-teal-400">{scores.conduct.total.toFixed(1)}</span>
              </span>
            </div>
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-slate-600 dark:text-slate-400">能力拓展分</span>
              <span className="font-mono font-semibold text-right">
                <span className="text-slate-400 dark:text-slate-500 text-xs mr-1 hidden sm:inline">({scores.ability.academic.toFixed(1)}+{scores.ability.artSport.toFixed(1)}+{scores.ability.org.toFixed(1)})</span>
                <span className="text-orange-600 dark:text-orange-400">{scores.ability.total.toFixed(1)}</span>
              </span>
            </div>
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">奖励分</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{scores.reward.total.toFixed(1)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between border-slate-200 dark:border-slate-600">
              <span className="font-semibold text-slate-800 dark:text-slate-100">总分</span>
              <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-100">{scores.total.toFixed(1)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 flex justify-center">
        <button onClick={onExport}
          className="flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-md shadow-teal-500/20 dark:shadow-teal-500/10 active:scale-[0.97]">
          <IconShare />导出得分报告
        </button>
      </div>

      <p className="text-center text-xs mt-5 mb-4 text-slate-400 dark:text-slate-500">
        仅供参考，最终以学校/书院官方认定为准
      </p>
    </>
  );
}
