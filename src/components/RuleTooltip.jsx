import { useState, useEffect, useRef } from "react";

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
        className="ml-1.5 w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-bold leading-none text-brand-500 hover:text-white dark:text-brand-300 dark:hover:text-white bg-brand-100/80 hover:bg-brand-500 dark:bg-brand-900/40 dark:hover:bg-brand-500 transition-colors duration-200 cursor-help"
        aria-label="评分规则">?</button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3 rounded-xl shadow-xl border text-xs leading-relaxed max-h-64 overflow-y-auto bg-white/95 backdrop-blur-xl border-white/60 text-slate-700 dark:bg-slate-900/95 dark:border-white/10 dark:text-slate-200 origin-bottom motion-safe:animate-[popIn_0.15s_ease-out]">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-white/95 border-b border-r border-white/60 dark:bg-slate-900/95 dark:border-white/10" />
        </div>
      )}
    </span>
  );
}
