import { useState, useMemo, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════
//  DATA & SCORING TABLES
// ═══════════════════════════════════════════════════════════

const ACADEMIC_COMP = {
  national: { label: "国际/国家级", first: 10, second: 9, third: 8 },
  provincial: { label: "省级", first: 8, second: 6, third: 4 },
  school: { label: "校级/地方/行业", first: 4, second: 3, third: 2, excellence: 1 },
};

const PAPER_SCORES = {
  intl_journal: { label: "国际期刊论文", scores: [10, 8, 6, 2] },
  core_journal: { label: "国内核心/国际会议", scores: [6, 5, 4, 1] },
  general: { label: "国内一般期刊/会议", scores: [3, 2, 1, 0] },
  book: { label: "出版专著", scores: [10, 8, 6, 0] },
  invention_patent: { label: "发明专利", scores: [10, 8, 6, 2] },
  utility_patent: { label: "实用新型/软著", scores: [6, 5, 4, 1] },
};

const ART_COMP = {
  national: { label: "国际/国家级", first: 6, second: 5, third: 4, excellence: 3 },
  provincial: { label: "省级", first: 4, second: 3.5, third: 3, excellence: 2 },
  school: { label: "校级", first: 2, second: 1.5, third: 1 },
};

const SPORT_COMP = {
  national: { label: "国际/国家级", r1: 6, r2: 5, r3: 4, r48: 3 },
  provincial: { label: "省级", r1: 4, r2: 3.5, r3: 3, r48: 2 },
  school: { label: "校级", r1: 2, r2: 1.5, r3: 1, r48: 0.5 },
};

const ORG_LEVELS = [
  { label: "一级（大学生党委副书记/院级及以上学生组织正职等）", scores: { excellent: 4, good: 3.5, pass: 3 } },
  { label: "二级（党总支委员/院级及以上学生组织副职/优秀社团正职等）", scores: { excellent: 3.5, good: 3, pass: 2.5 } },
  { label: "三级（党支部委员/部长/甲级社团正职/团支书/班长等）", scores: { excellent: 2, good: 1.5, pass: 1 } },
  { label: "四级（干事/班级一般干部/宿舍长等）", scores: { excellent: 1, good: 0.75, pass: 0.5 } },
];

const HONOR_LEVELS = [
  { label: "全国级", score: 5 },
  { label: "省级", score: 4 },
  { label: "市级", score: 3 },
  { label: "校级", score: 2 },
  { label: "院级", score: 1 },
];

const PENALTY_TYPES = [
  { label: "通报批评", score: 2 },
  { label: "警告处分", score: 4 },
  { label: "严重警告处分", score: 6 },
  { label: "记过处分", score: 8 },
  { label: "留校察看处分", score: 10 },
  { label: "旷课（未达处分）", score: 1 },
  { label: "宿舍卫生不合格", score: 1 },
];

// ═══════════════════════════════════════════════════════════
//  SVG ICONS
// ═══════════════════════════════════════════════════════════

const IconSun = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
const IconMoon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
const IconCamera = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M12 7h.01"/></svg>;
const IconPrinter = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IconX = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>;
const IconPlus = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>;
const IconCheck = () => <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>;
const IconShare = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>;

// ═══════════════════════════════════════════════════════════
//  HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════

const cn = (...a) => a.filter(Boolean).join(" ");

function Card({ children, className }) {
  return <div className={cn("rounded-2xl border p-4 sm:p-5 shadow-sm transition-colors border-slate-200/80 bg-white dark:border-slate-700/60 dark:bg-slate-800/80 backdrop-blur-sm", className)}>{children}</div>;
}

function Badge({ children, color = "slate" }) {
  const c = {
    teal: "bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/50",
    orange: "bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50",
    amber: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
    red: "bg-red-50 text-red-700 border-red-200/60 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50",
    slate: "bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/50",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
  };
  return <span className={cn("inline-block rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap", c[color])}>{children}</span>;
}

function SectionTitle({ icon, title, subtitle, score, maxScore, color }) {
  const bar = { teal: "bg-teal-500", orange: "bg-orange-500", amber: "bg-amber-500" };
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        <span className="ml-auto font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">{score.toFixed(1)}<span className="text-slate-400 dark:text-slate-500">/{maxScore}</span></span>
      </div>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 ml-7">{subtitle}</p>}
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", bar[color])} style={{ width: `${Math.min(100, (score / maxScore) * 100)}%` }} />
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function Select({ value, onChange, options, className }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={cn("w-full rounded-lg border px-3 py-2 text-sm outline-none transition border-slate-200 bg-white text-slate-700 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-teal-500", className)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function NumberInput({ value, onChange, min = 0, max = 99, step = 1 }) {
  return (
    <input type="number" value={value} min={min} max={max} step={step}
      onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
      className="w-20 rounded-lg border px-3 py-2 text-sm text-center outline-none transition border-slate-200 bg-white text-slate-700 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-teal-500" />
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer group">
      <div className={cn("w-4 h-4 mt-0.5 shrink-0 rounded border-2 flex items-center justify-center transition-all",
        checked ? "bg-teal-500 border-teal-500" : "border-slate-300 group-hover:border-slate-400 dark:border-slate-500")}>
        {checked && <IconCheck />}
      </div>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

function AddButton({ onClick, label }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400 font-medium py-1.5 px-3 rounded-lg border border-dashed border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition">
      <IconPlus />{label}
    </button>
  );
}

function DynamicItem({ children, onRemove, score }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg mb-2 border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex-1 flex flex-wrap gap-2 items-end">{children}</div>
      <div className="flex items-center gap-1.5 pt-1 shrink-0">
        {score !== undefined && <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded text-teal-600 bg-teal-50 dark:text-teal-300 dark:bg-teal-900/40">{score >= 0 ? "+" : ""}{score}</span>}
        <button onClick={onRemove} className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 rounded transition"><IconX /></button>
      </div>
    </div>
  );
}

function TabNav({ active, onChange, tabs }) {
  return (
    <div className="flex gap-1 rounded-2xl p-1 mb-5 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/40">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={cn("flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all",
            active === t.key ? "bg-white text-slate-800 shadow-md dark:bg-slate-700 dark:text-slate-100" : "text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300")}>
          <span className="mr-1">{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  TOOLTIP COMPONENT
// ═══════════════════════════════════════════════════════════

function RuleTooltip({ content }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex items-center align-middle">
      <button
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onClick={(e) => { e.preventDefault(); setOpen(o => !o); }}
        className="ml-1.5 w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-bold leading-none text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition cursor-help"
        aria-label="评分规则">?</button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3 rounded-xl shadow-lg border text-xs leading-relaxed max-h-64 overflow-y-auto bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-white border-b border-r border-slate-200 dark:bg-slate-800 dark:border-slate-600" />
        </div>
      )}
    </span>
  );
}

function RuleTable({ headers, rows }) {
  return (
    <table className="w-full text-xs mt-1.5">
      <thead><tr className="border-b border-slate-200 dark:border-slate-600">{headers.map((h, i) => <th key={i} className={cn("py-1", i === 0 ? "text-left" : "text-center")}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i} className="border-b border-slate-100 dark:border-slate-700">{row.map((cell, j) => <td key={j} className={cn("py-1", j === 0 ? "text-left" : "text-center")}>{cell}</td>)}</tr>)}</tbody>
    </table>
  );
}

// ── Tooltip content for each scoring section ──

const TOOLTIP_BASE = <div><p className="font-semibold mb-1">基准分（70分）</p><p>合格即得70分。未通过基准考核则为0分。</p></div>;

const TOOLTIP_COLLECTIVE = <div><p className="font-semibold mb-1">集体活动分（0~3分）</p><p>每参加一次学校/书院集体活动得0.1~0.5分，累计上限3分。被评为集体活动优秀个人直接得3分。</p></div>;

const TOOLTIP_POLITICAL = <div><p className="font-semibold mb-1">思政学习分（0~3分）</p><p>完成基本学习任务+1；省级及以上竞赛获奖+2；被评为优秀+1。累计上限3分。</p></div>;

const TOOLTIP_SOCIAL = <div><p className="font-semibold mb-1">社会服务分（0~4分）</p><p>志愿服务≥32h得1分（按比例）；社会实践合格+1；实习市级+1/省级+2；先进个人+1。上限4分。</p></div>;

const TOOLTIP_PENALTY = (<div><p className="font-semibold mb-1">扣分项</p>
  <RuleTable headers={["类型", "扣分"]} rows={PENALTY_TYPES.map(p => [p.label, p.score])} /></div>);

const TOOLTIP_ACADEMIC = (<div><p className="font-semibold mb-1">学科/科技竞赛（上限10分）</p><p className="mb-1">同一项目取最高奖，不同项目累加。特等奖按一等奖计。</p>
  <RuleTable headers={["级别", "一等", "二等", "三等"]} rows={Object.values(ACADEMIC_COMP).map(r => [r.label, r.first, r.second, r.third])} /></div>);

const TOOLTIP_PAPER = (<div><p className="font-semibold mb-1">论文/专利/专著</p><p className="mb-1">与竞赛合计上限10分。按作者排名(1~4+)递减。</p>
  <RuleTable headers={["类型", "第1", "第2", "第3", "第4+"]} rows={Object.values(PAPER_SCORES).map(r => [r.label, ...r.scores])} /></div>);

const TOOLTIP_ART = (<div><p className="font-semibold mb-1">文艺竞赛评分标准</p>
  <RuleTable headers={["级别", "一等", "二等", "三等", "优秀"]} rows={Object.values(ART_COMP).map(r => [r.label, r.first, r.second, r.third, r.excellence || "-"])} /></div>);

const TOOLTIP_SPORT = (<div><p className="font-semibold mb-1">体育竞赛评分标准</p><p className="mb-1">破省级及以上纪录+5，破校纪录+3。</p>
  <RuleTable headers={["级别", "第1", "第2", "第3", "4~8名"]} rows={Object.values(SPORT_COMP).map(r => [r.label, r.r1, r.r2, r.r3, r.r48])} /></div>);

const TOOLTIP_ORG = (<div><p className="font-semibold mb-1">组织任职评分（上限4分）</p><p className="mb-1">多职务取最高分，不累加。</p>
  <RuleTable headers={["级别", "优", "良", "合格"]} rows={ORG_LEVELS.map(l => [l.label.split("（")[0], l.scores.excellent, l.scores.good, l.scores.pass])} /></div>);

const TOOLTIP_HONOR = (<div><p className="font-semibold mb-1">荣誉表彰评分</p>
  <RuleTable headers={["级别", "得分"]} rows={HONOR_LEVELS.map(l => [l.label, l.score])} /></div>);

const TOOLTIP_DEEDS = <div><p className="font-semibold mb-1">好人好事加分（0~5分）</p><p>视具体情况由学校/书院认定，每次0.5~5分。</p></div>;

// ═══════════════════════════════════════════════════════════
//  SCORE DISTRIBUTION CHART
// ═══════════════════════════════════════════════════════════

function ScoreChart({ scores }) {
  const modules = [
    { label: "品行素质", score: scores.conduct.total, max: 80, color: "teal",
      subs: [{ l: "基准", v: scores.conduct.base }, { l: "集体", v: scores.conduct.collective }, { l: "思政", v: scores.conduct.political }, { l: "服务", v: scores.conduct.social }, ...(scores.conduct.penalty > 0 ? [{ l: "扣分", v: -scores.conduct.penalty }] : [])] },
    { label: "能力拓展", score: scores.ability.total, max: 20, color: "orange",
      subs: [{ l: "学术", v: scores.ability.academic }, { l: "文体", v: scores.ability.artSport }, { l: "任职", v: scores.ability.org }] },
    { label: "奖励分", score: scores.reward.total, max: 5, color: "amber",
      subs: [{ l: "荣誉", v: scores.reward.honor }, { l: "好事", v: scores.reward.deeds }] },
  ];
  const colors = {
    teal: { bar: "bg-teal-500 dark:bg-teal-400", text: "text-teal-600 dark:text-teal-400" },
    orange: { bar: "bg-orange-500 dark:bg-orange-400", text: "text-orange-600 dark:text-orange-400" },
    amber: { bar: "bg-amber-500 dark:bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
  };
  return (
    <div className="space-y-3 my-3">
      {modules.map(m => {
        const pct = m.max > 0 ? (m.score / m.max) * 100 : 0;
        const c = colors[m.color];
        return (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-xs font-semibold", c.text)}>{m.label}</span>
              <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{m.score.toFixed(1)}<span className="text-slate-400 dark:text-slate-500">/{m.max}</span></span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-500", c.bar)} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <div className="flex gap-2 mt-1 flex-wrap">
              {m.subs.map(s => (
                <span key={s.l} className="text-[10px] text-slate-400 dark:text-slate-500">
                  {s.l} <span className={cn("font-mono", s.v < 0 ? "text-red-500" : "text-slate-500 dark:text-slate-400")}>{s.v >= 0 ? "+" : ""}{s.v.toFixed(1)}</span>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  CANVAS EXPORT
// ═══════════════════════════════════════════════════════════

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawExportImage(scores, isDark) {
  const W = 800, H = 520, dpr = window.devicePixelRatio || 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const bg = isDark ? "#1c1917" : "#fafaf9";
  const cardBg = isDark ? "#292524" : "#ffffff";
  const tp = isDark ? "#e7e5e4" : "#1c1917";
  const ts = isDark ? "#a8a29e" : "#78716c";
  const tm = isDark ? "#78716c" : "#a8a29e";
  const bd = isDark ? "#44403c" : "#e7e5e4";
  const teal = isDark ? "#5eead4" : "#0d9488";
  const orange = isDark ? "#fb923c" : "#ea580c";
  const amber = isDark ? "#fbbf24" : "#d97706";
  const red = isDark ? "#f87171" : "#dc2626";
  const subBg = isDark ? "#1c1917" : "#fafaf9";
  const font = "'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif";
  const mono = "'SF Mono','Menlo','Consolas',monospace";

  ctx.fillStyle = bg; roundRect(ctx, 0, 0, W, H, 16, true);
  ctx.fillStyle = cardBg; ctx.strokeStyle = bd; ctx.lineWidth = 1;
  roundRect(ctx, 24, 24, W - 48, H - 48, 12, true, true);

  const L = 56, R = W - 56;
  let y = 56;

  ctx.fillStyle = tp; ctx.font = `bold 18px ${font}`; ctx.textAlign = "left";
  ctx.fillText("西安交通大学 · 综合素质测评得分", L, y);
  y += 16; ctx.fillStyle = tm; ctx.font = `12px ${font}`;
  ctx.fillText("依据《本科生专业选择综合素质测评内容及评分标准》", L, y);

  ctx.fillStyle = tp; ctx.font = `bold 48px ${mono}`; ctx.textAlign = "right";
  ctx.fillText(scores.total.toFixed(1), R, 82);
  ctx.fillStyle = tm; ctx.font = `14px ${font}`; ctx.fillText("/ 105", R, 100);

  y = 120; ctx.strokeStyle = bd; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();

  y = 140; const barW = R - L;
  ctx.fillStyle = isDark ? "#44403c" : "#e7e5e4"; roundRect(ctx, L, y, barW, 10, 5, true);
  const p1 = (scores.conduct.total / 105) * barW, p2 = (scores.ability.total / 105) * barW, p3 = (scores.reward.total / 105) * barW;
  ctx.fillStyle = teal; roundRect(ctx, L, y, p1, 10, 5, true);
  ctx.fillStyle = orange; ctx.fillRect(L + p1, y, p2, 10);
  ctx.fillStyle = amber; roundRect(ctx, L + p1 + p2, y, p3, 10, 5, true);

  y = 176; const colW = (barW - 32) / 3;
  const blocks = [
    { label: "品行素质分", score: scores.conduct.total, max: 80, color: teal, items: [
      ["基准分", scores.conduct.base], ["集体活动", scores.conduct.collective], ["思政学习", scores.conduct.political],
      ["社会服务", scores.conduct.social], ...(scores.conduct.penalty > 0 ? [["扣分", -scores.conduct.penalty]] : [])] },
    { label: "能力拓展分", score: scores.ability.total, max: 20, color: orange, items: [
      ["学术科研", scores.ability.academic], ["文体竞赛", scores.ability.artSport], ["组织任职", scores.ability.org]] },
    { label: "奖励分", score: scores.reward.total, max: 5, color: amber, items: [
      ["荣誉表彰", scores.reward.honor], ["好人好事", scores.reward.deeds]] },
  ];

  blocks.forEach((b, i) => {
    const bx = L + i * (colW + 16);
    ctx.fillStyle = subBg; ctx.strokeStyle = bd; ctx.lineWidth = 0.5;
    roundRect(ctx, bx, y, colW, 280, 10, true, true);
    ctx.fillStyle = b.color; ctx.font = `bold 13px ${font}`; ctx.textAlign = "left";
    ctx.fillText(b.label, bx + 16, y + 28);
    ctx.fillStyle = tp; ctx.font = `bold 28px ${mono}`; ctx.textAlign = "right";
    ctx.fillText(b.score.toFixed(1), bx + colW - 16, y + 30);
    ctx.fillStyle = tm; ctx.font = `12px ${font}`; ctx.fillText(`/${b.max}`, bx + colW - 16, y + 48);
    let iy = y + 72;
    b.items.forEach(([name, val]) => {
      ctx.textAlign = "left"; ctx.fillStyle = ts; ctx.font = `13px ${font}`; ctx.fillText(name, bx + 16, iy);
      ctx.fillStyle = val < 0 ? red : tp; ctx.font = `13px ${mono}`; ctx.textAlign = "right";
      ctx.fillText((val >= 0 ? "+" : "") + val.toFixed(1), bx + colW - 16, iy);
      iy += 28;
    });
  });

  ctx.fillStyle = tm; ctx.font = `11px ${font}`; ctx.textAlign = "center";
  ctx.fillText("仅供参考，最终以学校/书院官方认定为准", W / 2, H - 36);
  return canvas;
}

// ═══════════════════════════════════════════════════════════
//  EXPORT MODAL
// ═══════════════════════════════════════════════════════════

function ExportModal({ scores, isDark, onClose }) {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const c = drawExportImage(scores, isDark);
    canvasRef.current = c;
    if (previewRef.current) { previewRef.current.innerHTML = ""; c.style.width = "100%"; c.style.height = "auto"; c.style.borderRadius = "8px"; previewRef.current.appendChild(c); }
  }, [scores, isDark]);

  const saveImage = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.download = `xjtu-score-${scores.total.toFixed(1)}.png`;
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  const printPDF = () => {
    if (!canvasRef.current) return;
    const img = canvasRef.current.toDataURL("image/png");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>综合素质测评</title><style>@page{size:A4 landscape;margin:20mm}body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh}img{max-width:100%;height:auto}</style></head><body><img src="${img}" onload="setTimeout(()=>{window.print();window.close()},400)"/></body></html>`);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">导出得分</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition"><IconX /></button>
        </div>
        <div className="p-4 overflow-auto">
          <div ref={previewRef} className="mb-4 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700" />
          <div className="flex gap-3">
            <button onClick={saveImage}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98]">
              <IconCamera />保存图片
            </button>
            <button onClick={printPDF}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98]">
              <IconPrinter />打印 / PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  LOCAL STORAGE PERSISTENCE
// ═══════════════════════════════════════════════════════════

const STORAGE_KEY = "xjtu-deyu-data";
const STORAGE_VERSION = 1;
const DEFAULT_STATE = {
  basePass: true, collectiveMode: "count", collectiveCount: 0, collectivePerActivity: 0.3,
  collectiveManual: 0, collectiveOutstanding: false,
  politicalStudy: { basic: false, provincial: false, outstanding: false },
  socialService: { volunteerHours: 0, socialPractice: false, internLevel: "none", advancedIndividual: false },
  penalties: [], academicComps: [], papers: [], artComps: [], sportComps: [],
  recordBreak: "none", orgPosition: { level: -1, rating: "none" }, honors: [], goodDeeds: 0,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (parsed.version === STORAGE_VERSION) return { ...DEFAULT_STATE, ...parsed.data };
    return DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

// ═══════════════════════════════════════════════════════════
//  MAIN APPLICATION
// ═══════════════════════════════════════════════════════════

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

  // ── Auto-save to localStorage ──
  useEffect(() => {
    const data = {
      basePass, collectiveMode, collectiveCount, collectivePerActivity,
      collectiveManual, collectiveOutstanding, politicalStudy, socialService,
      penalties, academicComps, papers, artComps, sportComps,
      recordBreak, orgPosition, honors, goodDeeds,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, data })); } catch {}
  }, [basePass, collectiveMode, collectiveCount, collectivePerActivity,
    collectiveManual, collectiveOutstanding, politicalStudy, socialService,
    penalties, academicComps, papers, artComps, sportComps,
    recordBreak, orgPosition, honors, goodDeeds]);

  // ═══════════════════════════════════════════════════════════
  //  SCORE CALCULATIONS
  // ═══════════════════════════════════════════════════════════

  const scores = useMemo(() => {
    const base = basePass ? 70 : 0;
    const collectiveRaw = collectiveOutstanding ? 3 : collectiveMode === "count" ? collectiveCount * collectivePerActivity : collectiveManual;
    const collective = Math.min(3, Math.max(0, collectiveRaw));

    let political = 0;
    if (politicalStudy.basic) political += 1;
    if (politicalStudy.provincial) political += 2;
    if (politicalStudy.outstanding) political += 1;
    political = Math.min(3, political);

    let social = Math.min(1, socialService.volunteerHours / 32);
    if (socialService.socialPractice) social += 1;
    if (socialService.internLevel === "city") social += 1;
    if (socialService.internLevel === "province") social += 2;
    if (socialService.advancedIndividual) social += 1;
    social = Math.min(4, social);

    const penaltyTotal = penalties.reduce((s, p) => s + (PENALTY_TYPES[p.type]?.score || 0) * (p.count || 1), 0);
    const conductCapped = Math.min(80, Math.max(0, base + collective + political + social - penaltyTotal));

    let academicCompTotal = 0;
    academicComps.forEach(c => {
      const t = ACADEMIC_COMP[c.level]; if (!t) return;
      if (c.award === "special" || c.award === "first") academicCompTotal += t.first;
      else if (c.award === "second") academicCompTotal += t.second;
      else if (c.award === "third") academicCompTotal += t.third;
      else if (c.award === "excellence") academicCompTotal += t.excellence || 0;
    });
    let paperTotal = 0;
    papers.forEach(p => {
      const t = PAPER_SCORES[p.type]; if (!t) return;
      let s = t.scores[Math.min(p.authorRank - 1, 3)] || 0;
      if (p.type === "book" && p.authorRank > 3) s = Math.max(1, 6 - (p.authorRank - 3));
      if (p.outstandingPaper) s += 1;
      paperTotal += s;
    });
    const academicTotal = Math.min(10, academicCompTotal + paperTotal);

    let artTotal = 0;
    artComps.forEach(c => { const t = ART_COMP[c.level]; if (t) artTotal += t[c.award] || 0; });
    let sportTotal = 0;
    sportComps.forEach(c => { const t = SPORT_COMP[c.level]; if (t) sportTotal += t[c.rank] || 0; });
    const recordBonus = recordBreak === "provincial" ? 5 : recordBreak === "school" ? 3 : 0;
    const artSportTotal = Math.min(6, artTotal + sportTotal + recordBonus);

    let orgScore = 0;
    if (orgPosition.level >= 0 && orgPosition.rating !== "none") orgScore = ORG_LEVELS[orgPosition.level]?.scores[orgPosition.rating] || 0;
    const orgCapped = Math.min(4, orgScore);
    const abilityTotal = Math.min(20, academicTotal + artSportTotal + orgCapped);

    let honorTotal = 0;
    honors.forEach(h => { honorTotal += HONOR_LEVELS[h.level]?.score || 0; });
    const rewardCapped = Math.min(5, honorTotal + goodDeeds);

    return {
      conduct: { base, collective, political, social, penalty: penaltyTotal, total: conductCapped },
      ability: { academic: academicTotal, artSport: artSportTotal, org: orgCapped, total: abilityTotal },
      reward: { honor: Math.min(5, honorTotal), deeds: goodDeeds, total: rewardCapped },
      total: conductCapped + abilityTotal + rewardCapped,
    };
  }, [basePass, collectiveMode, collectiveCount, collectivePerActivity, collectiveManual, collectiveOutstanding,
    politicalStudy, socialService, penalties, academicComps, papers, artComps, sportComps, recordBreak, orgPosition, honors, goodDeeds]);

  const getAcademicCompScore = (c) => { const t = ACADEMIC_COMP[c.level]; if (!t) return 0; if (c.award === "special" || c.award === "first") return t.first; if (c.award === "second") return t.second; if (c.award === "third") return t.third; return t.excellence || 0; };
  const getPaperScore = (p) => { const t = PAPER_SCORES[p.type]; if (!t) return 0; let s = t.scores[Math.min(p.authorRank - 1, 3)] || 0; if (p.type === "book" && p.authorRank > 3) s = Math.max(1, 6 - (p.authorRank - 3)); if (p.outstandingPaper) s += 1; return s; };
  const getArtScore = (c) => { const t = ART_COMP[c.level]; return t?.[c.award] || 0; };
  const getSportScore = (c) => { const t = SPORT_COMP[c.level]; return t?.[c.rank] || 0; };

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════

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

          {/* ═══════ TAB 1 ═══════ */}
          {tab === "conduct" && (
            <div className="space-y-4">
              <SectionTitle icon="📋" title="品行素质分" subtitle="基准分 + 集体活动 + 思政学习 + 社会服务 − 扣分" score={scores.conduct.total} maxScore={80} color="teal" />

              <Card>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">基准分<RuleTooltip content={TOOLTIP_BASE} /></h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">经班级评议合格、书院审定通过</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge color={basePass ? "emerald" : "red"}>{basePass ? "+70" : "0"}</Badge>
                    <Checkbox checked={basePass} onChange={setBasePass} label="" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">集体活动分<RuleTooltip content={TOOLTIP_COLLECTIVE} /> <Badge color="teal">上限 3</Badge></h3>
                  <Badge color={collectiveOutstanding ? "emerald" : "slate"}>{collectiveOutstanding ? "满分" : `+${scores.conduct.collective.toFixed(1)}`}</Badge>
                </div>
                <Checkbox checked={collectiveOutstanding} onChange={setCollectiveOutstanding} label="对集体荣誉有突出贡献（一次性获满分 3 分）" />
                {!collectiveOutstanding && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex gap-1 rounded-lg p-0.5 mb-3 bg-slate-100 dark:bg-slate-700">
                      {["count", "manual"].map(m => (
                        <button key={m} onClick={() => setCollectiveMode(m)}
                          className={cn("flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all",
                            collectiveMode === m ? "bg-white text-slate-800 shadow-sm dark:bg-slate-600 dark:text-slate-100" : "text-slate-500 dark:text-slate-400")}>
                          {m === "count" ? "按次数计算" : "手动填写"}
                        </button>
                      ))}
                    </div>
                    {collectiveMode === "count" ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="text-sm text-slate-600 dark:text-slate-400">次数</label>
                          <NumberInput value={collectiveCount} onChange={setCollectiveCount} min={0} max={30} />
                          <span className="text-xs text-slate-400 dark:text-slate-500">×</span>
                          <label className="text-sm text-slate-600 dark:text-slate-400">每次</label>
                          <NumberInput value={collectivePerActivity} onChange={setCollectivePerActivity} min={0.1} max={1} step={0.05} />
                          <span className="text-xs text-slate-400 dark:text-slate-500">分</span>
                        </div>
                        <div className="text-xs px-3 py-2 rounded-lg text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50">
                          {collectiveCount} × {collectivePerActivity} = {(collectiveCount * collectivePerActivity).toFixed(1)}
                          {collectiveCount * collectivePerActivity > 3 && <span className="text-amber-600 dark:text-amber-400 font-medium ml-2">→ 封顶 3.0</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input type="range" min={0} max={3} step={0.1} value={collectiveManual} onChange={e => setCollectiveManual(Number(e.target.value))} className="flex-1 accent-teal-500" />
                        <span className="font-mono text-sm w-10 text-right font-semibold text-slate-700 dark:text-slate-200">{collectiveManual.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">思政学习分<RuleTooltip content={TOOLTIP_POLITICAL} /> <Badge color="teal">上限 3</Badge></h3>
                <div className="space-y-2.5">
                  <Checkbox checked={politicalStudy.basic} onChange={v => setPoliticalStudy(p => ({ ...p, basic: v }))} label="参加党团组织理论学习培训（含网络学习）(+1)" />
                  <Checkbox checked={politicalStudy.provincial} onChange={v => setPoliticalStudy(p => ({ ...p, provincial: v }))} label="参加省、部级理论学习培训 (+2)" />
                  <Checkbox checked={politicalStudy.outstanding} onChange={v => setPoliticalStudy(p => ({ ...p, outstanding: v }))} label="获得优秀学员 (额外+1)" />
                </div>
                <div className="mt-2 text-right"><Badge color="teal">+{scores.conduct.political.toFixed(1)}</Badge></div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">社会服务分<RuleTooltip content={TOOLTIP_SOCIAL} /> <Badge color="teal">上限 4</Badge></h3>
                <Field label="志愿服务时长（小时/学年）" hint="≥32h 得 1 分，不足按比例">
                  <div className="flex items-center gap-3">
                    <NumberInput value={socialService.volunteerHours} onChange={v => setSocialService(p => ({ ...p, volunteerHours: v }))} max={200} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">→ +{Math.min(1, socialService.volunteerHours / 32).toFixed(2)}</span>
                  </div>
                </Field>
                <Checkbox checked={socialService.socialPractice} onChange={v => setSocialService(p => ({ ...p, socialPractice: v }))} label="参加校级社会实践，考核合格 (+1)" />
                <Field label="挂职锻炼/政府见习">
                  <Select value={socialService.internLevel} onChange={v => setSocialService(p => ({ ...p, internLevel: v }))}
                    options={[{ value: "none", label: "未参加" }, { value: "city", label: "市、县级 (+1)" }, { value: "province", label: "省、部级 / 国际组织 (+2)" }]} />
                </Field>
                <Checkbox checked={socialService.advancedIndividual} onChange={v => setSocialService(p => ({ ...p, advancedIndividual: v }))} label="获先进个人及表彰 (额外+1)" />
                <div className="mt-2 text-right"><Badge color="teal">+{scores.conduct.social.toFixed(1)}</Badge></div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">扣分项<RuleTooltip content={TOOLTIP_PENALTY} /> <Badge color="red">不设上限</Badge></h3>
                {penalties.map((p, i) => (
                  <DynamicItem key={i} onRemove={() => setPenalties(ps => ps.filter((_, j) => j !== i))} score={-((PENALTY_TYPES[p.type]?.score || 0) * (p.count || 1))}>
                    <div className="flex-1 min-w-[140px]">
                      <Select value={p.type} onChange={v => setPenalties(ps => ps.map((pp, j) => j === i ? { ...pp, type: Number(v) } : pp))}
                        options={PENALTY_TYPES.map((t, idx) => ({ value: idx, label: `${t.label} (-${t.score})` }))} />
                    </div>
                    <div className="w-20"><NumberInput value={p.count} onChange={v => setPenalties(ps => ps.map((pp, j) => j === i ? { ...pp, count: v } : pp))} min={1} max={20} /></div>
                  </DynamicItem>
                ))}
                <AddButton onClick={() => setPenalties(ps => [...ps, { type: 0, count: 1 }])} label="添加扣分项" />
                {scores.conduct.penalty > 0 && <div className="mt-2 text-right"><Badge color="red">−{scores.conduct.penalty.toFixed(1)}</Badge></div>}
              </Card>
            </div>
          )}

          {/* ═══════ TAB 2 ═══════ */}
          {tab === "ability" && (
            <div className="space-y-4">
              <SectionTitle icon="🏆" title="能力拓展分" subtitle="学术科研（10）+ 文体竞赛（6）+ 组织任职（4）" score={scores.ability.total} maxScore={20} color="orange" />

              <div className="rounded-2xl border border-orange-200/60 bg-orange-50/40 dark:border-orange-800/40 dark:bg-orange-950/20 p-2 sm:p-3 space-y-3">
                <Card>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">学科/科技竞赛获奖<RuleTooltip content={TOOLTIP_ACADEMIC} /></h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">同一项目取最高，不同项目累加。特等奖按一等奖。</p>
                  {academicComps.map((c, i) => (
                    <DynamicItem key={i} onRemove={() => setAcademicComps(cs => cs.filter((_, j) => j !== i))} score={getAcademicCompScore(c)}>
                      <div className="min-w-[120px] flex-1 sm:flex-none sm:w-36">
                        <Select value={c.level} onChange={v => setAcademicComps(cs => cs.map((cc, j) => j === i ? { ...cc, level: v } : cc))}
                          options={Object.entries(ACADEMIC_COMP).map(([k, v]) => ({ value: k, label: v.label }))} />
                      </div>
                      <div className="w-24 sm:w-28">
                        <Select value={c.award} onChange={v => setAcademicComps(cs => cs.map((cc, j) => j === i ? { ...cc, award: v } : cc))}
                          options={[{ value: "special", label: "特等奖" }, { value: "first", label: "一等奖" }, { value: "second", label: "二等奖" }, { value: "third", label: "三等奖" },
                            ...(c.level === "school" ? [{ value: "excellence", label: "优秀奖" }] : [])]} />
                      </div>
                    </DynamicItem>
                  ))}
                  <AddButton onClick={() => setAcademicComps(cs => [...cs, { level: "national", award: "first" }])} label="添加竞赛获奖" />
                </Card>

                <Card>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">论文 / 专利 / 专著<RuleTooltip content={TOOLTIP_PAPER} /></h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">与竞赛合计上限 10 分</p>
                  {papers.map((p, i) => (
                    <DynamicItem key={i} onRemove={() => setPapers(ps => ps.filter((_, j) => j !== i))} score={getPaperScore(p)}>
                      <div className="min-w-[120px] flex-1 sm:flex-none sm:w-40">
                        <Select value={p.type} onChange={v => setPapers(ps => ps.map((pp, j) => j === i ? { ...pp, type: v } : pp))}
                          options={Object.entries(PAPER_SCORES).map(([k, v]) => ({ value: k, label: v.label }))} />
                      </div>
                      <div className="w-24">
                        <Select value={p.authorRank} onChange={v => setPapers(ps => ps.map((pp, j) => j === i ? { ...pp, authorRank: Number(v) } : pp))}
                          options={[1,2,3,4,5,6].map(n => ({ value: n, label: `第${n}作者` }))} />
                      </div>
                      <Checkbox checked={p.outstandingPaper || false} onChange={v => setPapers(ps => ps.map((pp, j) => j === i ? { ...pp, outstandingPaper: v } : pp))} label="优秀论文" />
                    </DynamicItem>
                  ))}
                  <AddButton onClick={() => setPapers(ps => [...ps, { type: "intl_journal", authorRank: 1, outstandingPaper: false }])} label="添加论文/专利" />
                </Card>

                <div className="mt-1 pr-2 text-right"><Badge color="orange">学术: {scores.ability.academic.toFixed(1)}/10</Badge></div>
              </div>

              <Card>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">文艺竞赛<RuleTooltip content={TOOLTIP_ART} /></h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">文体合计上限 6 分</p>
                {artComps.map((c, i) => (
                  <DynamicItem key={i} onRemove={() => setArtComps(cs => cs.filter((_, j) => j !== i))} score={getArtScore(c)}>
                    <div className="min-w-[100px] flex-1 sm:flex-none sm:w-32">
                      <Select value={c.level} onChange={v => setArtComps(cs => cs.map((cc, j) => j === i ? { ...cc, level: v } : cc))}
                        options={Object.entries(ART_COMP).map(([k, v]) => ({ value: k, label: v.label }))} />
                    </div>
                    <div className="w-24 sm:w-28">
                      <Select value={c.award} onChange={v => setArtComps(cs => cs.map((cc, j) => j === i ? { ...cc, award: v } : cc))}
                        options={[{ value: "first", label: "一等奖" }, { value: "second", label: "二等奖" }, { value: "third", label: "三等奖" },
                          ...(c.level !== "school" ? [{ value: "excellence", label: "优秀奖" }] : [])]} />
                    </div>
                  </DynamicItem>
                ))}
                <AddButton onClick={() => setArtComps(cs => [...cs, { level: "national", award: "first" }])} label="添加文艺获奖" />

                <div className="my-4 border-t border-slate-200/80 dark:border-slate-700/60" />

                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">体育竞赛<RuleTooltip content={TOOLTIP_SPORT} /></h3>
                {sportComps.map((c, i) => (
                  <DynamicItem key={i} onRemove={() => setSportComps(cs => cs.filter((_, j) => j !== i))} score={getSportScore(c)}>
                    <div className="min-w-[100px] flex-1 sm:flex-none sm:w-32">
                      <Select value={c.level} onChange={v => setSportComps(cs => cs.map((cc, j) => j === i ? { ...cc, level: v } : cc))}
                        options={Object.entries(SPORT_COMP).map(([k, v]) => ({ value: k, label: v.label }))} />
                    </div>
                    <div className="w-24 sm:w-28">
                      <Select value={c.rank} onChange={v => setSportComps(cs => cs.map((cc, j) => j === i ? { ...cc, rank: v } : cc))}
                        options={[{ value: "r1", label: "第1名" }, { value: "r2", label: "第2名" }, { value: "r3", label: "第3名" }, { value: "r48", label: "4-8名" }]} />
                    </div>
                  </DynamicItem>
                ))}
                <AddButton onClick={() => setSportComps(cs => [...cs, { level: "national", rank: "r1" }])} label="添加体育获奖" />
                <Field label="破纪录">
                  <Select value={recordBreak} onChange={setRecordBreak}
                    options={[{ value: "none", label: "未破纪录" }, { value: "provincial", label: "破省级及以上 (+5)" }, { value: "school", label: "破校级 (+3)" }]} />
                </Field>
                <div className="mt-2 text-right"><Badge color="orange">文体: {scores.ability.artSport.toFixed(1)}/6</Badge></div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">学生组织任职<RuleTooltip content={TOOLTIP_ORG} /> <Badge color="orange">上限 4</Badge></h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">多职务以最高分计，不累加</p>
                <Field label="最高职务级别">
                  <Select value={orgPosition.level} onChange={v => setOrgPosition(p => ({ ...p, level: Number(v) }))}
                    options={[{ value: -1, label: "未担任职务" }, ...ORG_LEVELS.map((l, i) => ({ value: i, label: l.label }))]} />
                </Field>
                {orgPosition.level >= 0 && (
                  <Field label="考核结果">
                    <Select value={orgPosition.rating} onChange={v => setOrgPosition(p => ({ ...p, rating: v }))}
                      options={[{ value: "none", label: "请选择" }, { value: "excellent", label: "优" }, { value: "good", label: "良" }, { value: "pass", label: "合格" }]} />
                  </Field>
                )}
                <div className="mt-2 text-right"><Badge color="orange">任职: {scores.ability.org.toFixed(1)}/4</Badge></div>
              </Card>
            </div>
          )}

          {/* ═══════ TAB 3 ═══════ */}
          {tab === "reward" && (
            <div className="space-y-4">
              <SectionTitle icon="⭐" title="奖励分" subtitle="荣誉表彰 + 好人好事，累加上限 5 分" score={scores.reward.total} maxScore={5} color="amber" />
              <Card>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">荣誉表彰<RuleTooltip content={TOOLTIP_HONOR} /></h3>
                {honors.map((h, i) => (
                  <DynamicItem key={i} onRemove={() => setHonors(hs => hs.filter((_, j) => j !== i))} score={HONOR_LEVELS[h.level]?.score || 0}>
                    <div className="w-40">
                      <Select value={h.level} onChange={v => setHonors(hs => hs.map((hh, j) => j === i ? { ...hh, level: Number(v) } : hh))}
                        options={HONOR_LEVELS.map((l, idx) => ({ value: idx, label: `${l.label} (+${l.score})` }))} />
                    </div>
                  </DynamicItem>
                ))}
                <AddButton onClick={() => setHonors(hs => [...hs, { level: 0 }])} label="添加荣誉表彰" />
              </Card>
              <Card>
                <Field label="好人好事 / 突出贡献" hint="每次 +1 分，可累加">
                  <div className="flex items-center gap-3">
                    <NumberInput value={goodDeeds} onChange={setGoodDeeds} min={0} max={10} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">次 → +{goodDeeds}</span>
                  </div>
                </Field>
              </Card>
            </div>
          )}

          {/* ═══════ SUMMARY ═══════ */}
          <div className="mt-6">
            <Card className="border-slate-300/60 dark:border-slate-600/50 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800/40">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">得分汇总</h3>
              <ScoreChart scores={scores} />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-600 dark:text-slate-400">品行素质分</span>
                  <span className="font-mono font-semibold text-right">
                    <span className="text-slate-400 dark:text-slate-500 text-xs mr-1 hidden sm:inline">(70+{scores.conduct.collective.toFixed(1)}+{scores.conduct.political.toFixed(1)}+{scores.conduct.social.toFixed(1)}{scores.conduct.penalty > 0 ? `−${scores.conduct.penalty}` : ""})</span>
                    <span className="text-teal-600 dark:text-teal-400">{scores.conduct.total.toFixed(1)}</span>
                  </span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-600 dark:text-slate-400">能力拓展分</span>
                  <span className="font-mono font-semibold text-right">
                    <span className="text-slate-400 dark:text-slate-500 text-xs mr-1 hidden sm:inline">({scores.ability.academic.toFixed(1)}+{scores.ability.artSport.toFixed(1)}+{scores.ability.org.toFixed(1)})</span>
                    <span className="text-orange-600 dark:text-orange-400">{scores.ability.total.toFixed(1)}</span>
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">奖励分</span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{scores.reward.total.toFixed(1)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between border-slate-200 dark:border-slate-600">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">总分</span>
                  <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-100">{scores.total.toFixed(1)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-4 flex justify-center">
            <button onClick={() => setShowExport(true)}
              className="flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-md shadow-teal-500/20 dark:shadow-teal-500/10 active:scale-[0.97]">
              <IconShare />导出得分报告
            </button>
          </div>

          <p className="text-center text-xs mt-5 mb-4 text-slate-400 dark:text-slate-500">
            仅供参考，最终以学校/书院官方认定为准
          </p>
        </div>

        {showExport && <ExportModal scores={scores} isDark={dark} onClose={() => setShowExport(false)} />}
      </div>
    </div>
  );
}
