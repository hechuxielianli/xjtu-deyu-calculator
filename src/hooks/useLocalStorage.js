import { useEffect } from "react";
import { STORAGE_KEY, STORAGE_VERSION, DEFAULT_STATE } from "../data/constants";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (parsed.version === STORAGE_VERSION) return { ...DEFAULT_STATE, ...parsed.data };
    return DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

export function usePersistState(state) {
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, data: state })); } catch {}
  }, [state.basePass, state.collectiveMode, state.collectiveCount, state.collectivePerActivity,
    state.collectiveManual, state.collectiveOutstanding, state.politicalStudy, state.socialService,
    state.penalties, state.academicComps, state.papers, state.artComps, state.sportComps,
    state.recordBreak, state.orgPosition, state.honors, state.goodDeeds]);
}
