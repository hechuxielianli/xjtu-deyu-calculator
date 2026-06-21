import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 数字补间：从当前显示值（或挂载时 0）用 rAF + easeOutCubic 过渡到 target。
// reduced-motion 或零时长时直接落终值。所有 setState 只在 rAF 回调内触发，
// 以规避 react-hooks 的 set-state-in-effect 规则。
export function useCountUp(target, { duration = 550, startOnMount = false } = {}) {
  const [display, setDisplay] = useState(startOnMount ? 0 : target);
  const displayRef = useRef(startOnMount ? 0 : target);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = displayRef.current;
    const to = target;
    cancelAnimationFrame(rafRef.current);

    if (prefersReducedMotion() || duration <= 0 || from === to) {
      rafRef.current = requestAnimationFrame(() => {
        displayRef.current = to;
        setDisplay(to);
      });
      return () => cancelAnimationFrame(rafRef.current);
    }

    let startTs = 0;
    const tick = (ts) => {
      if (!startTs) startTs = ts;
      const p = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const v = from + (to - from) * eased;
      displayRef.current = v;
      setDisplay(v);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else { displayRef.current = to; }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}
