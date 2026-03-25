import { useState, useEffect } from "react";
import { TabNav } from "./components/ui";
import { IconSun, IconMoon, IconShare } from "./components/icons";
import { ConductTab } from "./components/tabs/ConductTab";
import { AbilityTab } from "./components/tabs/AbilityTab";
import { RewardTab } from "./components/tabs/RewardTab";
import { ScoreSummary } from "./components/ScoreSummary";
import { ExportModal } from "./components/ExportModal";
import { useScoreCalculator } from "./hooks/useScoreCalculator";
import { loadState, usePersistState } from "./hooks/useLocalStorage";

export default function App() {
  const [tab, setTab] = useState("conduct");
  const [dark, setDark] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => { if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) setDark(true); }, []);

  // ── State (restored from localStorage) ──
  const [initialState] = useState(() => loadState());
  const [basePass, setBasePass] = useState(initialState.basePass);
  const [collectiveMode, setCollectiveMode] = useState(initialState.collectiveMode);
  const [collectiveCount, setCollectiveCount] = useState(initialState.collectiveCount);
  const [collectivePerActivity, setCollectivePerActivity] = useState(initialState.collectivePerActivity);
  const [collectiveManual, setCollectiveManual] = useState(initialState.collectiveManual);
  const [collectiveOutstanding, setCollectiveOutstanding] = useState(initialState.collectiveOutstanding);
  const [politicalStudy, setPoliticalStudy] = useState(initialState.politicalStudy);
  const [socialService, setSocialService] = useState(initialState.socialService);
  const [penalties, setPenalties] = useState(initialState.penalties);
  const [academicComps, setAcademicComps] = useState(initialState.academicComps);
  const [papers, setPapers] = useState(initialState.papers);
  const [artComps, setArtComps] = useState(initialState.artComps);
  const [sportComps, setSportComps] = useState(initialState.sportComps);
  const [recordBreak, setRecordBreak] = useState(initialState.recordBreak);
  const [orgPosition, setOrgPosition] = useState(initialState.orgPosition);
  const [honors, setHonors] = useState(initialState.honors);
  const [goodDeeds, setGoodDeeds] = useState(initialState.goodDeeds);

  const stateObj = {
    basePass, collectiveMode, collectiveCount, collectivePerActivity,
    collectiveManual, collectiveOutstanding, politicalStudy, socialService,
    penalties, academicComps, papers, artComps, sportComps,
    recordBreak, orgPosition, honors, goodDeeds,
  };

  const scores = useScoreCalculator(stateObj);
  usePersistState(stateObj);

  return (
    <div className={dark ? "dark" : ""}>
      <div style={{ fontFamily: "'Noto Sans SC','PingFang SC',-apple-system,sans-serif" }}
        className="min-h-screen transition-colors bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">

        {/* ── HEADER ── */}
        <div className="sticky top-0 z-50 border-b backdrop-blur-xl transition-colors bg-white/70 border-slate-200/60 dark:bg-slate-900/70 dark:border-slate-700/50">
          <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold tracking-tight truncate text-slate-800 dark:text-slate-100">西安交通大学 · 综合素质测评计算器</h1>
                <p className="text-xs truncate text-slate-400 dark:text-slate-500 hidden sm:block">依据《本科生专业选择综合素质测评内容及评分标准》</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setShowExport(true)} title="导出" className="p-2 rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"><IconShare /></button>
                <button onClick={() => setDark(!dark)} title={dark ? "浅色" : "深色"} className="p-2 rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">{dark ? <IconSun /> : <IconMoon />}</button>
                <div className="text-right ml-1">
                  <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-800 dark:text-slate-100">{scores.total.toFixed(1)}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 -mt-0.5">/ 105</div>
                </div>
              </div>
            </div>
            <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700/60">
              <div className="bg-teal-500 rounded-l-full transition-all duration-500" style={{ width: `${(scores.conduct.total / 105) * 100}%` }} />
              <div className="bg-orange-500 transition-all duration-500" style={{ width: `${(scores.ability.total / 105) * 100}%` }} />
              <div className="bg-amber-500 rounded-r-full transition-all duration-500" style={{ width: `${(scores.reward.total / 105) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span><span className="inline-block w-2 h-2 rounded-full bg-teal-500 mr-1 align-middle" />品行 {scores.conduct.total.toFixed(1)}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1 align-middle" />能力 {scores.ability.total.toFixed(1)}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1 align-middle" />奖励 {scores.reward.total.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-5 pb-20">
          <TabNav active={tab} onChange={setTab} tabs={[
            { key: "conduct", icon: "🎯", label: "品行素质" },
            { key: "ability", icon: "🏆", label: "能力拓展" },
            { key: "reward", icon: "⭐", label: "奖励分" },
          ]} />

          {tab === "conduct" && (
            <ConductTab scores={scores}
              basePass={basePass} setBasePass={setBasePass}
              collectiveMode={collectiveMode} setCollectiveMode={setCollectiveMode}
              collectiveCount={collectiveCount} setCollectiveCount={setCollectiveCount}
              collectivePerActivity={collectivePerActivity} setCollectivePerActivity={setCollectivePerActivity}
              collectiveManual={collectiveManual} setCollectiveManual={setCollectiveManual}
              collectiveOutstanding={collectiveOutstanding} setCollectiveOutstanding={setCollectiveOutstanding}
              politicalStudy={politicalStudy} setPoliticalStudy={setPoliticalStudy}
              socialService={socialService} setSocialService={setSocialService}
              penalties={penalties} setPenalties={setPenalties} />
          )}

          {tab === "ability" && (
            <AbilityTab scores={scores}
              academicComps={academicComps} setAcademicComps={setAcademicComps}
              papers={papers} setPapers={setPapers}
              artComps={artComps} setArtComps={setArtComps}
              sportComps={sportComps} setSportComps={setSportComps}
              recordBreak={recordBreak} setRecordBreak={setRecordBreak}
              orgPosition={orgPosition} setOrgPosition={setOrgPosition} />
          )}

          {tab === "reward" && (
            <RewardTab scores={scores}
              honors={honors} setHonors={setHonors}
              goodDeeds={goodDeeds} setGoodDeeds={setGoodDeeds} />
          )}

          <ScoreSummary scores={scores} onExport={() => setShowExport(true)} />
        </div>

        {showExport && <ExportModal scores={scores} isDark={dark} onClose={() => setShowExport(false)} />}
      </div>
    </div>
  );
}
