import { useState, useEffect, useRef, useId } from "react";

export function RuleTooltip({ content }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex items-center align-middle">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        onClick={(e) => { e.preventDefault(); setOpen(o => !o); }}
        aria-label="评分规则" aria-expanded={open} aria-describedby={open ? tipId : undefined}
        className="ml-1.5 w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-bold leading-none text-brand-500 hover:text-white dark:text-brand-300 dark:hover:text-white bg-brand-100/80 hover:bg-brand-500 dark:bg-brand-900/40 dark:hover:bg-brand-500 transition-colors duration-200 cursor-help">?</button>
      {open && (
        <div id={tipId} role="tooltip" className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3 rounded-xl shadow-lg border text-xs leading-relaxed max-h-64 overflow-y-auto bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-white/10 dark:text-slate-200 origin-bottom motion-safe:animate-[popIn_0.15s_ease-out]">
          {content}
          <div aria-hidden="true" className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-white border-b border-r border-slate-200 dark:bg-slate-900 dark:border-white/10" />
        </div>
      )}
    </span>
  );
}
