import { useState, useEffect, useRef } from "react";
import { cn } from "./ui";
import { ACADEMIC_COMP, PAPER_SCORES, ART_COMP, SPORT_COMP, ORG_LEVELS, HONOR_LEVELS, PENALTY_TYPES } from "../data/constants";

export function RuleTooltip({ content }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex items-center align-middle">
      <button
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onClick={(e) => { e.preventDefault(); setOpen(o => !o); }}
        className="ml-1.5 w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-bold leading-none text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition cursor-help"
        aria-label="评分规则">?</button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3 rounded-xl shadow-lg border text-xs leading-relaxed max-h-64 overflow-y-auto bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-white border-b border-r border-slate-200 dark:bg-slate-800 dark:border-slate-600" />
        </div>
      )}
    </span>
  );
}

function RuleTable({ headers, rows }) {
  return (
    <table className="w-full text-xs mt-1.5">
      <thead><tr className="border-b border-slate-200 dark:border-slate-600">{headers.map((h, i) => <th key={i} className={cn("py-1", i === 0 ? "text-left" : "text-center")}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i} className="border-b border-slate-100 dark:border-slate-700">{row.map((cell, j) => <td key={j} className={cn("py-1", j === 0 ? "text-left" : "text-center")}>{cell}</td>)}</tr>)}</tbody>
    </table>
  );
}

export const TOOLTIP_BASE = <div><p className="font-semibold mb-1">基准分（70分）</p><p>合格即得70分。未通过基准考核则为0分。</p></div>;
export const TOOLTIP_COLLECTIVE = <div><p className="font-semibold mb-1">集体活动分（0~3分）</p><p>每参加一次学校/书院集体活动得0.1~0.5分，累计上限3分。被评为集体活动优秀个人直接得3分。</p></div>;
export const TOOLTIP_POLITICAL = <div><p className="font-semibold mb-1">思政学习分（0~3分）</p><p>完成基本学习任务+1；省级及以上竞赛获奖+2；被评为优秀+1。累计上限3分。</p></div>;
export const TOOLTIP_SOCIAL = <div><p className="font-semibold mb-1">社会服务分（0~4分）</p><p>志愿服务≥32h得1分（按比例）；社会实践合格+1；实习市级+1/省级+2；先进个人+1。上限4分。</p></div>;
export const TOOLTIP_PENALTY = (<div><p className="font-semibold mb-1">扣分项</p><RuleTable headers={["类型", "扣分"]} rows={PENALTY_TYPES.map(p => [p.label, p.score])} /></div>);
export const TOOLTIP_ACADEMIC = (<div><p className="font-semibold mb-1">学科/科技竞赛（上限10分）</p><p className="mb-1">同一项目取最高奖，不同项目累加。特等奖按一等奖计。</p><RuleTable headers={["级别", "一等", "二等", "三等"]} rows={Object.values(ACADEMIC_COMP).map(r => [r.label, r.first, r.second, r.third])} /></div>);
export const TOOLTIP_PAPER = (<div><p className="font-semibold mb-1">论文/专利/专著</p><p className="mb-1">与竞赛合计上限10分。按作者排名(1~4+)递减。</p><RuleTable headers={["类型", "第1", "第2", "第3", "第4+"]} rows={Object.values(PAPER_SCORES).map(r => [r.label, ...r.scores])} /></div>);
export const TOOLTIP_ART = (<div><p className="font-semibold mb-1">文艺竞赛评分标准</p><RuleTable headers={["级别", "一等", "二等", "三等", "优秀"]} rows={Object.values(ART_COMP).map(r => [r.label, r.first, r.second, r.third, r.excellence || "-"])} /></div>);
export const TOOLTIP_SPORT = (<div><p className="font-semibold mb-1">体育竞赛评分标准</p><p className="mb-1">破省级及以上纪录+5，破校纪录+3。</p><RuleTable headers={["级别", "第1", "第2", "第3", "4~8名"]} rows={Object.values(SPORT_COMP).map(r => [r.label, r.r1, r.r2, r.r3, r.r48])} /></div>);
export const TOOLTIP_ORG = (<div><p className="font-semibold mb-1">组织任职评分（上限4分）</p><p className="mb-1">多职务取最高分，不累加。</p><RuleTable headers={["级别", "优", "良", "合格"]} rows={ORG_LEVELS.map(l => [l.label.split("（")[0], l.scores.excellent, l.scores.good, l.scores.pass])} /></div>);
export const TOOLTIP_HONOR = (<div><p className="font-semibold mb-1">荣誉表彰评分</p><RuleTable headers={["级别", "得分"]} rows={HONOR_LEVELS.map(l => [l.label, l.score])} /></div>);
export const TOOLTIP_DEEDS = <div><p className="font-semibold mb-1">好人好事加分（0~5分）</p><p>视具体情况由学校/书院认定，每次0.5~5分。</p></div>;
