import { IconCheck, IconPlus, IconX } from "./icons";

export const cn = (...a) => a.filter(Boolean).join(" ");

export function Card({ children, className }) {
  return <div className={cn("rounded-2xl border p-4 sm:p-5 shadow-sm transition-colors border-slate-200/80 bg-white dark:border-slate-700/60 dark:bg-slate-800/80 backdrop-blur-sm", className)}>{children}</div>;
}

export function Badge({ children, color = "slate" }) {
  const c = {
    teal: "bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/50",
    orange: "bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50",
    amber: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
    red: "bg-red-50 text-red-700 border-red-200/60 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50",
    slate: "bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/50",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
  };
  return <span className={cn("inline-block rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap", c[color])}>{children}</span>;
}

export function SectionTitle({ icon, title, subtitle, score, maxScore, color }) {
  const bar = { teal: "bg-teal-500", orange: "bg-orange-500", amber: "bg-amber-500" };
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        <span className="ml-auto font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">{score.toFixed(1)}<span className="text-slate-400 dark:text-slate-500">/{maxScore}</span></span>
      </div>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 ml-7">{subtitle}</p>}
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", bar[color])} style={{ width: `${Math.min(100, (score / maxScore) * 100)}%` }} />
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export function Select({ value, onChange, options, className }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={cn("w-full rounded-lg border px-3 py-2 text-sm outline-none transition border-slate-200 bg-white text-slate-700 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-teal-500", className)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function NumberInput({ value, onChange, min = 0, max = 99, step = 1 }) {
  return (
    <input type="number" value={value} min={min} max={max} step={step}
      onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
      className="w-20 rounded-lg border px-3 py-2 text-sm text-center outline-none transition border-slate-200 bg-white text-slate-700 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-teal-500" />
  );
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer group">
      <div className={cn("w-4 h-4 mt-0.5 shrink-0 rounded border-2 flex items-center justify-center transition-all",
        checked ? "bg-teal-500 border-teal-500" : "border-slate-300 group-hover:border-slate-400 dark:border-slate-500")}>
        {checked && <IconCheck />}
      </div>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

export function AddButton({ onClick, label }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400 font-medium py-1.5 px-3 rounded-lg border border-dashed border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition">
      <IconPlus />{label}
    </button>
  );
}

export function DynamicItem({ children, onRemove, onMoveUp, onMoveDown, score, showReorder }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg mb-2 border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex-1 flex flex-wrap gap-2 items-end">{children}</div>
      <div className="flex items-center gap-1 pt-1 shrink-0">
        {score !== undefined && <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded text-teal-600 bg-teal-50 dark:text-teal-300 dark:bg-teal-900/40">{score >= 0 ? "+" : ""}{score}</span>}
        {showReorder && (
          <>
            <button onClick={onMoveUp} disabled={!onMoveUp} className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 p-0.5 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"><IconChevronUp /></button>
            <button onClick={onMoveDown} disabled={!onMoveDown} className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 p-0.5 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"><IconChevronDown /></button>
          </>
        )}
        <button onClick={onRemove} className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 rounded transition"><IconX /></button>
      </div>
    </div>
  );
}

import { IconChevronUp, IconChevronDown } from "./icons";

export function TabNav({ active, onChange, tabs }) {
  return (
    <div className="flex gap-1 rounded-2xl p-1 mb-5 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/40">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={cn("flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all",
            active === t.key ? "bg-white text-slate-800 shadow-md dark:bg-slate-700 dark:text-slate-100" : "text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300")}>
          <span className="mr-1">{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
}
