import { useEffect, useRef } from "react";
import { cn } from "../utils/cn";

// 小而可访问的确认弹窗：role=dialog、Esc / 点击遮罩取消、打开时锁定背景滚动、
// 自动聚焦「取消」、关闭后焦点归还触发元素。
export function ConfirmDialog({ open, title, message, confirmLabel = "确认", cancelLabel = "取消", tone = "brand", onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onCancel(); return; }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const list = Array.from(dialog.querySelectorAll("button")).filter(el => !el.disabled && el.offsetParent !== null);
      if (list.length === 0) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      if (prevActive instanceof HTMLElement) prevActive.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  const confirmCls = tone === "danger"
    ? "bg-danger-600 text-white hover:bg-danger-700 dark:bg-danger-500 dark:hover:bg-danger-400"
    : "bg-brand-700 text-white hover:bg-brand-800 dark:bg-brand-400 dark:text-slate-950 dark:hover:bg-brand-300";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={onCancel}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-msg"
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 outline-none motion-safe:animate-[fadeInUp_0.24s_ease-out]"
        onClick={e => e.stopPropagation()}>
        <div className="p-5 sm:p-6">
          <h3 id="confirm-title" className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
          {message && <p id="confirm-msg" className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>}
          <div className="flex gap-3 mt-5">
            <button ref={cancelRef} type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border border-slate-300 dark:border-white/15 bg-transparent text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-white/30 active:scale-[0.98]">
              {cancelLabel}
            </button>
            <button type="button" onClick={onConfirm}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-[0.98]", confirmCls)}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
