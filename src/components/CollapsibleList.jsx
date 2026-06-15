import { useState, useEffect } from "react";

export function CollapsibleList({ items, threshold = 3, renderItem, renderAdd }) {
  const [expanded, setExpanded] = useState(false);
  const shouldCollapse = items.length > threshold;
  const visibleItems = shouldCollapse && !expanded ? items.slice(0, threshold) : items;

  useEffect(() => {
    if (items.length > 0) setExpanded(true);
  }, [items.length]);

  return (
    <div>
      {/* 阈值之外、展开时新出现的项做一次性淡入（CSS 动画仅挂载时播放，编辑时不重播） */}
      {visibleItems.map((item, i) => (
        <div key={i} className={i >= threshold ? "motion-safe:animate-[fadeInUp_0.2s_ease-out]" : undefined}>
          {renderItem(item, i)}
        </div>
      ))}
      {shouldCollapse && !expanded && (
        <button onClick={() => setExpanded(true)}
          className="w-full py-1.5 text-xs text-center text-brand-600 dark:text-brand-300 hover:bg-brand-50/70 dark:hover:bg-brand-900/30 rounded-lg transition-colors duration-200 mb-2">
          展开剩余 {items.length - threshold} 项
        </button>
      )}
      {shouldCollapse && expanded && (
        <button onClick={() => setExpanded(false)}
          className="w-full py-1.5 text-xs text-center text-slate-400 dark:text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors duration-200 mb-2">
          收起
        </button>
      )}
      {renderAdd()}
    </div>
  );
}

export const moveUp = (arr, i) => { if (i <= 0) return arr; const n = [...arr]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; };
export const moveDown = (arr, i) => { if (i >= arr.length - 1) return arr; const n = [...arr]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n; };
