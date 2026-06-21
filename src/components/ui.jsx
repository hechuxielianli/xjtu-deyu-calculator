import { useState, useRef } from "react";
import { IconCheck, IconPlus, IconX, IconChevronUp, IconChevronDown } from "./icons";
import { cn } from "../utils/cn";
import { useCountUp } from "../hooks/useCountUp";

// 数字 count-up 展示：内部用 useCountUp 补间，reduced-motion 自动落终值。
// 配合 tabular-nums 防止滚动时宽度抖动。
export function AnimatedNumber({ value, decimals = 1, duration = 550, startOnMount = false, className }) {
  const v = useCountUp(value, { duration, startOnMount });
  return <span className={cn("tabular-nums", className)}>{v.toFixed(decimals)}</span>;
}

// ── 极简留白·纯净近单色原子库 ──
// 墨/纸灰阶 + 单一交大蓝强调；扁平、发丝线、大留白、无玻璃/无重阴影。
// 三模块色（conduct/ability/reward）在原子层统一塌缩为交大蓝；语义红仅留给负分（扣分）。
// 各 Tab 表单体仍传 color="conduct" 等 —— 被此处塌缩，无需改动。

export function Card({ children, className, hoverable = false }) {
  return (
    <div className={cn(
      "relative rounded-2xl border p-5 sm:p-6 transition-colors duration-200",
      "border-slate-200/80 dark:border-white/10",
      "bg-white/60 dark:bg-white/[0.02]",
      hoverable && "hover:border-brand-300 dark:hover:border-brand-500/50",
      className,
    )}>
      {children}
    </div>
  );
}

// 颜色塌缩：danger→语义红；neutral→墨；其余（brand/conduct/ability/reward/success）→交大蓝强调
const badgeTone = (color) => (color === "danger" ? "danger" : color === "neutral" || color == null ? "neutral" : "accent");
const BADGE_TONE = {
  accent:  "border-brand-300/80  text-brand-700  dark:border-brand-600/60  dark:text-brand-300",
  danger:  "border-danger-300/80 text-danger-700 dark:border-danger-700/60 dark:text-danger-300",
  neutral: "border-slate-200     text-slate-600  dark:border-white/15       dark:text-slate-300",
};

export function Badge({ children, color = "neutral" }) {
  return <span className={cn("inline-block rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap", BADGE_TONE[badgeTone(color)])}>{children}</span>;
}

export function SectionTitle({ icon, title, subtitle, score, maxScore }) {
  const pct = maxScore > 0 ? Math.min(100, (score / maxScore) * 100) : 0;
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl shrink-0 bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">{icon}</span>
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h2>
        <span className="ml-auto font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">{score.toFixed(1)}<span className="text-slate-400 dark:text-slate-500">/{maxScore}</span></span>
      </div>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 ml-[2.625rem]">{subtitle}</p>}
      <div className="relative h-px w-full bg-slate-200 dark:bg-white/10">
        <div className="absolute left-0 top-0 h-px bg-brand-600 dark:bg-brand-400 transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}

const FIELD_CLASS = cn(
  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors duration-200",
  "border-slate-300 bg-transparent text-slate-800",
  "hover:border-slate-400",
  "focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30",
  "dark:border-white/15 dark:text-slate-100",
  "dark:hover:border-white/30 dark:focus:border-brand-400 dark:focus:ring-brand-400/30",
);

export function Select({ value, onChange, options, className }) {
  return (
    // color-scheme 让原生下拉弹层在暗色下渲染为深色；option 再显式着色，确保跨浏览器可读
    <select value={value} onChange={e => onChange(e.target.value)}
      className={cn(FIELD_CLASS, "cursor-pointer [color-scheme:light] dark:[color-scheme:dark]", className)}>
      {options.map(o => (
        <option key={o.value} value={o.value} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">{o.label}</option>
      ))}
    </select>
  );
}

export function NumberInput({ value, onChange, min = 0, max = 99, step = 1 }) {
  // draft 为 null 表示受控于外部 value；为 string 表示用户正在编辑（允许临时空/前导 0/中间态）
  const [draft, setDraft] = useState(null);
  const display = draft !== null ? draft : String(value);

  const clamp = (n) => Math.max(min, Math.min(max, n));

  const handleChange = (e) => {
    const raw = e.target.value;
    setDraft(raw);
    if (raw === "" || raw === "-") return;
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    const clamped = clamp(num);
    if (clamped !== value) onChange(clamped);
  };

  const handleBlur = () => {
    if (draft === null) return;
    if (draft === "" || draft === "-" || Number.isNaN(Number(draft))) {
      if (value !== min) onChange(min);
    } else {
      const clamped = clamp(Number(draft));
      if (clamped !== value) onChange(clamped);
    }
    setDraft(null);
  };

  const handleFocus = (e) => { e.target.select(); };

  return (
    <input type="number" inputMode="decimal" value={display} min={min} max={max} step={step}
      onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus}
      className={cn(FIELD_CLASS, "w-20 text-center")} />
  );
}

export function Checkbox({ checked, onChange, label, disabled = false, ariaLabel }) {
  return (
    <label className={cn(
      "flex items-start gap-2.5 group",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    )}>
      <div aria-hidden="true" className={cn(
        "w-4 h-4 mt-0.5 shrink-0 rounded-[5px] border flex items-center justify-center transition-colors",
        checked && !disabled && "bg-brand-600 border-brand-600 dark:bg-brand-400 dark:border-brand-400",
        checked && disabled && "bg-slate-400 border-slate-400 dark:bg-slate-500 dark:border-slate-500",
        !checked && "border-slate-300 group-hover:border-brand-500 dark:border-white/25 dark:group-hover:border-brand-400",
      )}>
        {checked && <IconCheck />}
      </div>
      <input type="checkbox" checked={checked} disabled={disabled}
        aria-label={ariaLabel || (typeof label === "string" && label) || undefined}
        onChange={e => !disabled && onChange(e.target.checked)} className="sr-only" />
      {label && <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>}
    </label>
  );
}

export function AddButton({ onClick, label }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 dark:text-brand-300 py-1.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-white/15 hover:border-brand-500 hover:text-brand-800 dark:hover:border-brand-400 dark:hover:text-brand-200 transition-colors">
      <IconPlus />{label}
    </button>
  );
}

export function DynamicItem({ children, onRemove, onMoveUp, onMoveDown, score, showReorder }) {
  const neg = score !== undefined && score < 0;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl mb-2 border border-slate-200/80 dark:border-white/10 bg-transparent transition-colors hover:border-slate-300 dark:hover:border-white/20 motion-safe:animate-[popInRow_0.34s_ease-out]">
      <div className="flex-1 flex flex-wrap gap-2 items-end">{children}</div>
      <div className="flex items-center gap-1 pt-1 shrink-0">
        {score !== undefined && (
          <span className={cn("font-mono text-xs font-semibold px-1 tabular-nums", neg ? "text-danger-600 dark:text-danger-300" : "text-brand-700 dark:text-brand-300")}>
            {score >= 0 ? "+" : ""}{score}
          </span>
        )}
        {showReorder && (
          <>
            <button type="button" onClick={onMoveUp} disabled={!onMoveUp} aria-label="上移" className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 p-0.5 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"><IconChevronUp /></button>
            <button type="button" onClick={onMoveDown} disabled={!onMoveDown} aria-label="下移" className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 p-0.5 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"><IconChevronDown /></button>
          </>
        )}
        <button type="button" onClick={onRemove} aria-label="删除" className="text-slate-500 hover:text-danger-600 dark:text-slate-400 dark:hover:text-danger-400 p-1 rounded transition"><IconX /></button>
      </div>
    </div>
  );
}

export function TabNav({ active, onChange, tabs, className }) {
  const activeIdx = Math.max(0, tabs.findIndex(t => t.key === active));
  const widthPct = 100 / tabs.length;
  const btnRefs = useRef([]);

  // 键盘：←/→（及 ↑/↓）循环切换，Home/End 跳首尾，并把焦点跟到目标 tab（WAI-ARIA Tabs 模式）。
  const moveTo = (idx) => {
    const t = tabs[idx];
    if (!t) return;
    onChange(t.key);
    btnRefs.current[idx]?.focus();
  };
  const onKeyDown = (e) => {
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (activeIdx + 1) % tabs.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (activeIdx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next !== null) { e.preventDefault(); moveTo(next); }
  };

  return (
    <div role="tablist" aria-label="评分模块" aria-orientation="horizontal" onKeyDown={onKeyDown}
      className={cn(
        "relative flex gap-1 rounded-2xl p-1 mb-5 border",
        "bg-slate-100 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/10",
        className,
      )}>
      {/* 滑动 indicator（扁平·纯净） */}
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 rounded-xl bg-white dark:bg-slate-700 shadow-sm transition-all duration-300 ease-out pointer-events-none"
        style={{
          width: `calc(${widthPct}% - 0.5rem)`,
          left: `calc(${activeIdx * widthPct}% + 0.25rem)`,
        }}
      />
      {tabs.map((t, i) => (
        <button key={t.key} type="button"
          ref={el => (btnRefs.current[i] = el)}
          role="tab"
          id={`tab-${t.key}`}
          aria-selected={active === t.key}
          aria-controls={`panel-${t.key}`}
          tabIndex={active === t.key ? 0 : -1}
          onClick={() => onChange(t.key)}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-colors duration-200",
            active === t.key
              ? "text-brand-700 dark:text-brand-200"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
          )}>
          <span className="shrink-0" aria-hidden="true">{t.icon}</span><span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
