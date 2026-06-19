import { useState } from "react";

export function CollapsibleList({ items, threshold = 3, renderItem, renderAdd }) {
  const [expanded, setExpanded] = useState(false);
  const shouldCollapse = items.length > threshold;
  const visibleItems = shouldCollapse && !expanded ? items.slice(0, threshold) : items;

  // 仅当条目数"增加"（新增一项）时自动展开，让用户立刻看到刚添加的项。
  // 删除条目或初始挂载都不强制展开，从而保留"收起/默认折叠"的预期行为。
  // 采用 React 官方"渲染期对比上一次值"的派生状态写法（用 state 而非 ref，符合 hooks 规则）。
  const [prevLen, setPrevLen] = useState(items.length);
  if (items.length !== prevLen) {
    if (items.length > prevLen) setExpanded(true);
    setPrevLen(items.length);
  }

  return (
    <div>
      {/* 阈值之外、展开时新出现的项做一次性淡入（CSS 动画仅挂载时播放，编辑时不重播） */}
      {visibleItems.map((item, i) => (
        <div key={item.id ?? i} className={i >= threshold ? "motion-safe:animate-[fadeInUp_0.2s_ease-out]" : undefined}>
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
