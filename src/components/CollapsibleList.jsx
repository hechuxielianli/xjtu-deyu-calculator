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
      {visibleItems.map((item, i) => renderItem(item, i))}
      {shouldCollapse && !expanded && (
        <button onClick={() => setExpanded(true)}
          className="w-full py-1.5 text-xs text-center text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition mb-2">
          展开剩余 {items.length - threshold} 项
        </button>
      )}
      {shouldCollapse && expanded && (
        <button onClick={() => setExpanded(false)}
          className="w-full py-1.5 text-xs text-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition mb-2">
          收起
        </button>
      )}
      {renderAdd()}
    </div>
  );
}

export const moveUp = (arr, i) => { if (i <= 0) return arr; const n = [...arr]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; };
export const moveDown = (arr, i) => { if (i >= arr.length - 1) return arr; const n = [...arr]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n; };
