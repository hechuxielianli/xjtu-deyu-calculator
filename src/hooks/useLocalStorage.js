import { useEffect } from "react";
import { STORAGE_KEY, STORAGE_VERSION, DEFAULT_STATE } from "../data/constants";
import { DEFAULT_USER_CONTEXT } from "../algorithms/recommender";
import { uid } from "../utils/uid";

// 列表型字段：其条目需带稳定 id 作为 React key（避免删除/重排时编辑态错挂）。
const LIST_KEYS = ["penalties", "academicComps", "papers", "artComps", "sportComps", "honors"];

// 为旧版（无 id）localStorage 数据回填条目 id，保证升级后渲染稳定。
function withItemIds(state) {
  const next = { ...state };
  for (const k of LIST_KEYS) {
    if (Array.isArray(next[k])) {
      next[k] = next[k].map(item => (item && item.id != null) ? item : { ...item, id: uid() });
    }
  }
  return next;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (parsed.version === STORAGE_VERSION) return withItemIds({ ...DEFAULT_STATE, ...parsed.data });
    return DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

export function usePersistState(state) {
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, data: state })); } catch { /* ignore */ }
    // 刻意按字段逐项列依赖：直接依赖 state 对象会因每次渲染新建引用而每帧写入 localStorage。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.basePass, state.collectiveMode, state.collectiveCount, state.collectivePerActivity,
    state.collectiveManual, state.collectiveOutstanding, state.politicalStudy, state.socialService,
    state.penalties, state.academicComps, state.papers, state.artComps, state.sportComps,
    state.recordBreak, state.orgPosition, state.honors, state.goodDeeds]);
}

// ── 推荐器：用户排除项 ──
const EXCLUDED_KEY = "deyu_recommender_excluded_v1";

export function loadExcluded() {
  try {
    const raw = localStorage.getItem(EXCLUDED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch { return new Set(); }
}

export function saveExcluded(set) {
  try { localStorage.setItem(EXCLUDED_KEY, JSON.stringify([...set])); } catch { /* ignore */ }
}

// ── 推荐器：用户现状问卷 ──
const USER_CONTEXT_KEY = "deyu_recommender_user_context_v1";

export function loadUserContext() {
  try {
    const raw = localStorage.getItem(USER_CONTEXT_KEY);
    if (!raw) return { ...DEFAULT_USER_CONTEXT };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_CONTEXT, ...(parsed || {}) };
  } catch { return { ...DEFAULT_USER_CONTEXT }; }
}

export function saveUserContext(ctx) {
  try { localStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(ctx)); } catch { /* ignore */ }
}

// 一键重置时清除推荐器偏好（排除项 + 我的现状）；RecommenderTab 重挂载后即读到空值。
export function clearRecommenderPrefs() {
  try {
    localStorage.removeItem(EXCLUDED_KEY);
    localStorage.removeItem(USER_CONTEXT_KEY);
  } catch { /* ignore */ }
}

// ── 主题（深/浅色）──
// 与 index.html 首屏内联脚本共用同一 key，保证刷新前后一致、且无白屏闪烁。
// 显式主题偏好键：仅当用户手动切换时写入；缺省 = 跟随系统浅/深色。
// 键名相较旧版（deyu_theme）特意更名：旧版"挂载即持久化"会把跟随系统的值也写死，
// 更名后这些旧值自动失效、回到"跟随系统"，手动切换则以新键持久化。
const THEME_KEY = "deyu_theme_pref";

export function loadTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "dark") return true;
    if (t === "light") return false;
  } catch { /* ignore */ }
  // 未显式选择过 → 跟随系统偏好
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function saveTheme(dark) {
  try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch { /* ignore */ }
}

// 用户是否手动选择过主题；为 false 时才继续跟随系统切换。
export function hasExplicitTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "dark" || t === "light";
  } catch { return false; }
}
