import { useState } from "react";
import { IconCheck, IconPlus, IconX, IconChevronUp, IconChevronDown } from "./icons";

export const cn = (...a) => a.filter(Boolean).join(" ");

export function Card({ children, className, hoverable = false, accent }) {
  const accentBorder = {
    brand:   "hover:border-brand-300/70   dark:hover:border-brand-500/40",
    conduct: "hover:border-conduct-300/70 dark:hover:border-conduct-500/40",
    ability: "hover:border-ability-300/70 dark:hover:border-ability-500/40",
    reward:  "hover:border-reward-300/70  dark:hover:border-reward-500/40",
  }[accent] || "hover:border-brand-300/70 dark:hover:border-brand-500/40";

  return (
    <div className={cn(
      "relative rounded-2xl border p-4 sm:p-5 transition-all duration-300",
      "border-white/70 dark:border-white/10",
      "bg-white/85 dark:bg-slate-900/60",
      "backdrop-blur-xl dark:backdrop-blur-2xl",
      "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]",
      "dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_32px_-12px_rgba(0,0,0,0.6)]",
      hoverable && "card-shine-on-hover hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_16px_40px_-16px_rgba(79,70,229,0.20)]",
      hoverable && accentBorder,
      className,
    )}>
      {children}
    </div>
  );
}

const BADGE_COLORS = {
  brand:   "bg-brand-50/80   text-brand-700   border-brand-200/60   dark:bg-brand-900/30   dark:text-brand-300   dark:border-brand-700/50",
  conduct: "bg-conduct-50/80 text-conduct-700 border-conduct-200/60 dark:bg-conduct-900/30 dark:text-conduct-300 dark:border-conduct-700/50",
  ability: "bg-ability-50/80 text-ability-700 border-ability-200/60 dark:bg-ability-900/30 dark:text-ability-300 dark:border-ability-700/50",
  reward:  "bg-reward-50/80  text-reward-700  border-reward-200/60  dark:bg-reward-900/30  dark:text-reward-300  dark:border-reward-700/50",
  danger:  "bg-danger-50/80  text-danger-700  border-danger-200/60  dark:bg-danger-900/30  dark:text-danger-300  dark:border-danger-700/50",
  success: "bg-success-50/80 text-success-700 border-success-200/60 dark:bg-success-900/30 dark:text-success-300 dark:border-success-700/50",
  neutral: "bg-slate-100/80  text-slate-600   border-slate-200/60   dark:bg-slate-700/50   dark:text-slate-300   dark:border-slate-600/50",
};

export function Badge({ children, color = "neutral" }) {
  return <span className={cn("inline-block rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap backdrop-blur-sm", BADGE_COLORS[color] || BADGE_COLORS.neutral)}>{children}</span>;
}

const BAR_COLORS = {
  conduct: "bg-gradient-to-r from-conduct-400 to-conduct-600 dark:from-conduct-400 dark:to-conduct-500",
  ability: "bg-gradient-to-r from-ability-400 to-ability-600 dark:from-ability-400 dark:to-ability-500",
  reward:  "bg-gradient-to-r from-reward-300 to-reward-500  dark:from-reward-300 dark:to-reward-400",
  brand:   "bg-gradient-to-r from-brand-400   to-brand-600   dark:from-brand-400   dark:to-brand-500",
};

const ICON_CHIP = {
  conduct: "bg-conduct-100/70 text-conduct-700 dark:bg-conduct-900/40 dark:text-conduct-300",
  ability: "bg-ability-100/70 text-ability-700 dark:bg-ability-900/40 dark:text-ability-300",
  reward:  "bg-reward-100/70  text-reward-700  dark:bg-reward-900/40  dark:text-reward-300",
  brand:   "bg-brand-100/70   text-brand-700   dark:bg-brand-900/40   dark:text-brand-300",
};

export function SectionTitle({ icon, title, subtitle, score, maxScore, color }) {
  const chip = ICON_CHIP[color] || ICON_CHIP.brand;
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className={cn("inline-flex items-center justify-center w-8 h-8 rounded-xl shrink-0", chip)}>{icon}</span>
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">{title}</h2>
        <span className="ml-auto font-mono text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">{score.toFixed(1)}<span className="text-slate-400 dark:text-slate-500">/{maxScore}</span></span>
      </div>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 ml-[2.625rem]">{subtitle}</p>}
      <div className="h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500 ease-out", BAR_COLORS[color] || BAR_COLORS.brand)} style={{ width: `${Math.min(100, (score / maxScore) * 100)}%` }} />
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

const FIELD_CLASS = cn(
  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all duration-200",
  "border-slate-300/80 bg-white/85 text-slate-700",
  "hover:border-slate-400 hover:bg-white",
  "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:bg-white",
  "dark:border-slate-600/80 dark:bg-slate-800/70 dark:text-slate-200",
  "dark:hover:border-slate-500 dark:hover:bg-slate-800/90",
  "dark:focus:border-brand-400 dark:focus:ring-brand-400/30 dark:focus:bg-slate-800",
);

export function Select({ value, onChange, options, className }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={cn(FIELD_CLASS, "cursor-pointer", className)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function NumberInput({ value, onChange, min = 0, max = 99, step = 1 }) {
  // draft 为 null 表示受控于外部 value；为 string 表示用户正在编辑（允许临时空/前导 0/中间态）
  const [draft, setDraft] = useState(null);
  // 显示值：编辑中用 draft，否则跟随外部 value
  const display = draft !== null ? draft : String(value);

  const clamp = (n) => Math.max(min, Math.min(max, n));

  const handleChange = (e) => {
    const raw = e.target.value;
    setDraft(raw); // 永远先保留用户键入的原始文本（含 "" 和 "010"）

    if (raw === "" || raw === "-") return; // 中间态，不提交
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    const clamped = clamp(num);
    if (clamped !== value) onChange(clamped);
  };

  const handleBlur = () => {
    if (draft === null) return;
    if (draft === "" || draft === "-" || Number.isNaN(Number(draft))) {
      // 空白或非法 → 回落到 min
      if (value !== min) onChange(min);
    } else {
      // 规范化（如 "010" → 10），同步给父
      const clamped = clamp(Number(draft));
      if (clamped !== value) onChange(clamped);
    }
    setDraft(null); // 退出编辑模式，恢复受控显示
  };

  const handleFocus = (e) => {
    // 聚焦时选中全部内容，方便整体替换（解决 0 删不掉的体验问题）
    e.target.select();
  };

  return (
    <input type="number" inputMode="decimal" value={display} min={min} max={max} step={step}
      onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus}
      className={cn(FIELD_CLASS, "w-20 text-center")} />
  );
}

export function Checkbox({ checked, onChange, label, disabled = false }) {
  return (
    <label className={cn(
      "flex items-start gap-2 group",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    )}>
      <div className={cn(
        "w-4 h-4 mt-0.5 shrink-0 rounded border-2 flex items-center justify-center transition-all",
        checked && !disabled && "bg-brand-500 border-brand-500 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]",
        checked && disabled && "bg-slate-400 border-slate-400 dark:bg-slate-500 dark:border-slate-500",
        !checked && "border-slate-300 bg-white/60 group-hover:border-brand-400 dark:border-slate-500 dark:bg-slate-700/40 dark:group-hover:border-brand-400",
      )}>
        {checked && <IconCheck />}
      </div>
      <input type="checkbox" checked={checked} disabled={disabled}
        onChange={e => !disabled && onChange(e.target.checked)} className="sr-only" />
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

export function AddButton({ onClick, label }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-300 font-medium py-1.5 px-3 rounded-lg border border-dashed border-brand-300/80 dark:border-brand-500/40 hover:bg-brand-50/70 dark:hover:bg-brand-900/30 hover:border-brand-400 dark:hover:border-brand-400 transition-all">
      <IconPlus />{label}
    </button>
  );
}

const SCORE_BADGE_COLORS = {
  conduct: "text-conduct-700 bg-conduct-50/80 dark:text-conduct-200 dark:bg-conduct-900/40",
  ability: "text-ability-700 bg-ability-50/80 dark:text-ability-200 dark:bg-ability-900/40",
  reward:  "text-reward-700  bg-reward-50/80  dark:text-reward-200  dark:bg-reward-900/40",
  danger:  "text-danger-700  bg-danger-50/80  dark:text-danger-200  dark:bg-danger-900/40",
  brand:   "text-brand-700   bg-brand-50/80   dark:text-brand-200   dark:bg-brand-900/40",
};

export function DynamicItem({ children, onRemove, onMoveUp, onMoveDown, score, showReorder, scoreColor = "brand" }) {
  const badgeColor = score !== undefined && score < 0 ? SCORE_BADGE_COLORS.danger : SCORE_BADGE_COLORS[scoreColor];
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl mb-2 border border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm transition-all hover:bg-white/70 dark:hover:bg-slate-800/60">
      <div className="flex-1 flex flex-wrap gap-2 items-end">{children}</div>
      <div className="flex items-center gap-1 pt-1 shrink-0">
        {score !== undefined && <span className={cn("font-mono text-xs font-semibold px-1.5 py-0.5 rounded", badgeColor)}>{score >= 0 ? "+" : ""}{score}</span>}
        {showReorder && (
          <>
            <button onClick={onMoveUp} disabled={!onMoveUp} className="text-slate-300 hover:text-brand-500 dark:text-slate-600 dark:hover:text-brand-400 p-0.5 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"><IconChevronUp /></button>
            <button onClick={onMoveDown} disabled={!onMoveDown} className="text-slate-300 hover:text-brand-500 dark:text-slate-600 dark:hover:text-brand-400 p-0.5 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"><IconChevronDown /></button>
          </>
        )}
        <button onClick={onRemove} className="text-slate-400 hover:text-danger-500 dark:text-slate-500 dark:hover:text-danger-400 p-1 rounded transition"><IconX /></button>
      </div>
    </div>
  );
}

export function TabNav({ active, onChange, tabs, className }) {
  const activeIdx = Math.max(0, tabs.findIndex(t => t.key === active));
  const widthPct = 100 / tabs.length;
  return (
    <div className={cn(
      "relative flex gap-1 rounded-2xl p-1 mb-5",
      "bg-white/60 dark:bg-slate-800/50",
      "backdrop-blur-xl",
      "border border-white/60 dark:border-white/10",
      "shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]",
      "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
      className,
    )}>
      {/* 滑动 indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-700/80 shadow-md shadow-brand-500/10 dark:shadow-brand-500/20 transition-all duration-300 ease-out pointer-events-none"
        style={{
          width: `calc(${widthPct}% - 0.5rem)`,
          left: `calc(${activeIdx * widthPct}% + 0.25rem)`,
        }}
      />
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-colors duration-200",
            active === t.key
              ? "text-brand-700 dark:text-brand-200"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
          )}>
          <span className="shrink-0">{t.icon}</span><span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
