import { useState, useEffect } from "react";
import { TabNav } from "./components/ui";
import { IconSun, IconMoon, IconShare } from "./components/icons";
import { ConductTab } from "./components/tabs/ConductTab";
import { AbilityTab } from "./components/tabs/AbilityTab";
import { RewardTab } from "./components/tabs/RewardTab";
import { RecommenderTab } from "./components/tabs/RecommenderTab";
import { ScoreSummary } from "./components/ScoreSummary";
import { ExportModal } from "./components/ExportModal";
import { BackgroundDecoration } from "./components/BackgroundDecoration";
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
        className="min-h-screen relative transition-colors bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-900">

        <BackgroundDecoration dark={dark} />

        {/* ── HEADER ── */}
        <div className="sticky top-0 z-50 border-b backdrop-blur-xl transition-colors bg-white/70 border-white/60 dark:bg-slate-950/60 dark:border-white/10 shadow-[0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)]">
          <div className="max-w-2xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
            <div className="flex items-center justify-between gap-2 mb-2 lg:mb-0">
              <div className="min-w-0 flex items-center gap-3">
                <img
                  src="/xjtublue.png"
                  alt="西安交通大学校徽"
                  className="hidden sm:block w-9 h-9 rounded-xl object-contain shadow-lg shadow-brand-500/20 bg-white/70 dark:bg-white/90 p-1 ring-1 ring-white/60 dark:ring-white/20"
                />
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight truncate text-slate-800 dark:text-slate-100">西安交通大学 · 综合素质测评计算器</h1>
                  <p className="text-xs truncate text-slate-500 dark:text-slate-400 hidden sm:block">依据《本科生专业选择综合素质测评内容及评分标准》</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setShowExport(true)} title="导出" className="p-2 rounded-lg transition-all hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-300 text-slate-500 dark:text-slate-400"><IconShare /></button>
                <button onClick={() => setDark(!dark)} title={dark ? "浅色" : "深色"} className="p-2 rounded-lg transition-all hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-300 text-slate-500 dark:text-slate-400">{dark ? <IconSun /> : <IconMoon />}</button>
                <div className="text-right ml-2">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums bg-gradient-to-br from-brand-600 to-accent-600 dark:from-brand-300 dark:to-accent-300 bg-clip-text text-transparent">{scores.total.toFixed(1)}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 -mt-0.5">/ 105</div>
                </div>
              </div>
            </div>
            {/* 小屏展示三色进度条 + 模块标签；大屏由右栏 ScoreSummary 承担 */}
            <div className="lg:hidden">
              <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-slate-200/60 dark:bg-slate-700/60">
                <div className="bg-gradient-to-r from-conduct-400 to-conduct-600 rounded-l-full transition-all duration-500" style={{ width: `${(scores.conduct.total / 105) * 100}%` }} />
                <div className="bg-gradient-to-r from-ability-400 to-ability-600 transition-all duration-500" style={{ width: `${(scores.ability.total / 105) * 100}%` }} />
                <div className="bg-gradient-to-r from-reward-300 to-reward-500 rounded-r-full transition-all duration-500" style={{ width: `${(scores.reward.total / 105) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span><span className="inline-block w-2 h-2 rounded-full bg-conduct-500 mr-1 align-middle" />品行 {scores.conduct.total.toFixed(1)}</span>
                <span><span className="inline-block w-2 h-2 rounded-full bg-ability-500 mr-1 align-middle" />能力 {scores.ability.total.toFixed(1)}</span>
                <span><span className="inline-block w-2 h-2 rounded-full bg-reward-400 mr-1 align-middle" />奖励 {scores.reward.total.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="max-w-2xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5 lg:py-7 pb-20">
          <TabNav className="lg:max-w-2xl" active={tab} onChange={setTab} tabs={[
            { key: "conduct", icon: "🎯", label: "品行素质" },
            { key: "ability", icon: "🏆", label: "能力拓展" },
            { key: "reward", icon: "⭐", label: "奖励分" },
            { key: "recommender", icon: "🧮", label: "目标推荐" },
          ]} />

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
            {/* ── 左栏：Tab 内容 + 小屏 ScoreSummary ── */}
            <div className="min-w-0">
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

              {tab === "recommender" && <RecommenderTab scores={scores} state={stateObj} />}

              <ScoreSummary scores={scores} onExport={() => setShowExport(true)} variant="floating" className="lg:hidden" />
            </div>

            {/* ── 右栏：大屏 ScoreSummary (sticky) ── */}
            <aside className="hidden lg:block">
              <ScoreSummary scores={scores} onExport={() => setShowExport(true)} variant="sidebar" />
            </aside>
          </div>

          {/* 大屏专属底部声明（小屏由 floating ScoreSummary 承担） */}
          <p className="hidden lg:block text-center text-xs mt-8 text-slate-400 dark:text-slate-500">
            仅供参考，最终以学校/书院官方认定为准
          </p>
        </div>

        {showExport && <ExportModal scores={scores} isDark={dark} onClose={() => setShowExport(false)} />}
      </div>
    </div>
  );
}
