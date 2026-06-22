import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { IconChevronUp } from "./icons";

// 滚动超过阈值后出现的「回到顶部」悬浮按钮；reduced-motion 下为瞬时滚动。
export function BackToTop({ threshold = 400 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => { setShow(window.scrollY > threshold); ticking = false; };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // 初始判断（例如刷新时已在中部）
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const toTop = () => {
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="回到顶部"
      title="回到顶部"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={cn(
        "fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center justify-center",
        "w-11 h-11 rounded-full shadow-lg ring-1 transition-all duration-200",
        "bg-brand-700 text-white ring-brand-800/30 hover:bg-brand-800",
        "dark:bg-brand-400 dark:text-slate-950 dark:ring-white/15 dark:hover:bg-brand-300",
        "active:scale-95 motion-safe:transition",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
      )}
    >
      <IconChevronUp />
    </button>
  );
}
