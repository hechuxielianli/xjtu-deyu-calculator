import { cn } from "../utils/cn";

// 评分规则提示里的小表格（首列左对齐，其余居中）。
export function RuleTable({ headers, rows }) {
  return (
    <table className="w-full text-xs mt-1.5">
      <thead><tr className="border-b border-slate-200 dark:border-slate-600">{headers.map((h, i) => <th key={i} className={cn("py-1", i === 0 ? "text-left" : "text-center")}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i} className="border-b border-slate-100 dark:border-slate-700">{row.map((cell, j) => <td key={j} className={cn("py-1", j === 0 ? "text-left" : "text-center")}>{cell}</td>)}</tr>)}</tbody>
    </table>
  );
}
