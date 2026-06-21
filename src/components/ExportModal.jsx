import { useEffect, useRef } from "react";
// 嵌入精致中文字体（自托管，随 Vite 打包到同源，规避 Google 字体 CDN 国内不可达）
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";
import { IconX, IconCamera, IconPrinter, IconArrowUpRight } from "./icons";
import { ACADEMIC_COMP, PAPER_SCORES, ART_COMP, SPORT_COMP, ORG_LEVELS, HONOR_LEVELS, PENALTY_TYPES } from "../data/constants";
import { getAcademicCompScore, getPaperScore, getArtScore, getSportScore } from "../hooks/useScoreCalculator";

// Canvas 用字体栈（Noto Sans SC 就绪后生效，未就绪回退系统黑体）
const FONT = "'Noto Sans SC','Microsoft YaHei',sans-serif";

// 枚举文案映射（与各 Tab 下拉选项一致）
const AWARD_LABEL = { special: "特等奖", first: "一等奖", second: "二等奖", third: "三等奖", excellence: "优秀奖" };
const RANK_LABEL = { r1: "第1名", r2: "第2名", r3: "第3名", r48: "4-8名" };
const RATING_LABEL = { excellent: "优", good: "良", pass: "合格" };

// 绘制前用它预载对应字形切片（@fontsource 按 unicode-range 切片，需覆盖全部可能字符）
const FONT_SAMPLE = [
  "西安交通大学综合素质测评得分依据本科生专业选择内容及评分标准",
  "总分得分明细每一项逐条列示仅供参考最终以学校书院官方认定为准生成于距满分",
  "品行素质能力拓展奖励分基准集体活动突出贡献手动项思政基础培训省级优秀学员",
  "志愿服务社会实践政府实习市先进个人荣誉表彰好人好事破纪录组织任职文艺体育学科竞赛",
  Object.values(ACADEMIC_COMP).map((v) => v.label).join(""),
  Object.values(PAPER_SCORES).map((v) => v.label).join(""),
  Object.values(ART_COMP).map((v) => v.label).join(""),
  Object.values(SPORT_COMP).map((v) => v.label).join(""),
  ORG_LEVELS.map((v) => v.label).join(""),
  HONOR_LEVELS.map((v) => v.label).join(""),
  PENALTY_TYPES.map((v) => v.label).join(""),
  Object.values(AWARD_LABEL).join(""), Object.values(RANK_LABEL).join(""), Object.values(RATING_LABEL).join(""),
  "0123456789+-.×/h第作者级名党委副书记院团支社长班干事甲乙",
].join("");

// 由原始输入数据构造三模块的逐项明细（复用计算器导出的单项助手与常量标签）
function buildBreakdown(scores, data) {
  const d = data || {};

  // 品行素质
  const conduct = [];
  conduct.push({ label: "基准分", value: d.basePass ? 70 : 0 });
  if (scores.conduct.collective > 0) {
    let cl = "集体活动";
    if (d.collectiveOutstanding) cl = "集体活动 · 突出贡献";
    else if (d.collectiveMode === "count") cl = `集体活动 · ${d.collectiveCount || 0} 项`;
    else cl = "集体活动 · 手动";
    conduct.push({ label: cl, value: scores.conduct.collective });
  }
  const ps = d.politicalStudy || {};
  if (ps.basic) conduct.push({ label: "思政 · 基础培训", value: 1 });
  if (ps.provincial) conduct.push({ label: "思政 · 省级培训", value: 2 });
  if (ps.outstanding && (ps.basic || ps.provincial)) conduct.push({ label: "思政 · 优秀学员", value: 1 });
  const ss = d.socialService || {};
  const vh = ss.volunteerHours || 0;
  if (vh > 0) conduct.push({ label: `志愿服务 · ${vh}h`, value: Math.min(1, vh / 32) });
  if (ss.socialPractice) conduct.push({ label: "社会实践", value: 1 });
  if (ss.internLevel === "city") conduct.push({ label: "政府实习 · 市级", value: 1 });
  if (ss.internLevel === "province") conduct.push({ label: "政府实习 · 省级", value: 2 });
  const hasAnyService = vh > 0 || ss.socialPractice || (ss.internLevel && ss.internLevel !== "none");
  if (ss.advancedIndividual && hasAnyService) conduct.push({ label: "社会服务 · 先进个人", value: 1 });
  (d.penalties || []).forEach((p) => {
    const t = PENALTY_TYPES[p.type];
    if (!t) return;
    const cnt = p.count || 1;
    conduct.push({ label: `${t.label}${cnt > 1 ? ` ×${cnt}` : ""}`, value: -(t.score * cnt) });
  });

  // 能力拓展
  const ability = [];
  (d.academicComps || []).forEach((c) => {
    ability.push({ label: `学科竞赛 · ${ACADEMIC_COMP[c.level]?.label || ""} ${AWARD_LABEL[c.award] || ""}`.trim(), value: getAcademicCompScore(c) });
  });
  (d.papers || []).forEach((p) => {
    const t = PAPER_SCORES[p.type];
    ability.push({ label: `${t?.label || "论文"} · 第${p.authorRank}作者${p.outstandingPaper ? " · 优秀" : ""}`, value: getPaperScore(p) });
  });
  (d.artComps || []).forEach((c) => {
    ability.push({ label: `文艺 · ${ART_COMP[c.level]?.label || ""} ${AWARD_LABEL[c.award] || ""}`.trim(), value: getArtScore(c) });
  });
  (d.sportComps || []).forEach((c) => {
    ability.push({ label: `体育 · ${SPORT_COMP[c.level]?.label || ""} ${RANK_LABEL[c.rank] || ""}`.trim(), value: getSportScore(c) });
  });
  if (d.recordBreak === "provincial") ability.push({ label: "破纪录 · 省级", value: 5 });
  else if (d.recordBreak === "school") ability.push({ label: "破纪录 · 校级", value: 3 });
  const op = d.orgPosition || {};
  if (op.level >= 0 && op.rating && op.rating !== "none") {
    const lvl = ORG_LEVELS[op.level];
    if (lvl) ability.push({ label: `组织任职 · ${lvl.label.split("（")[0]} · ${RATING_LABEL[op.rating] || op.rating}`, value: lvl.scores?.[op.rating] || 0 });
  }

  // 奖励分
  const reward = [];
  (d.honors || []).forEach((h) => {
    const lvl = HONOR_LEVELS[h.level];
    if (lvl) reward.push({ label: `${lvl.label}荣誉`, value: lvl.score });
  });
  if ((d.goodDeeds || 0) > 0) reward.push({ label: `好人好事 ×${d.goodDeeds}`, value: d.goodDeeds });

  return [
    { name: "品行素质", colorKey: "conduct", subtotal: scores.conduct.total, max: 80, rows: conduct },
    { name: "能力拓展", colorKey: "ability", subtotal: scores.ability.total, max: 20, rows: ability },
    { name: "奖励分", colorKey: "reward", subtotal: scores.reward.total, max: 5, rows: reward },
  ];
}

// 一个明细模块段的高度（顶端 topY 起算，与 drawSection 严格一致）
// 段头到首行留白 60、行高 30、段底留白 16 → sectionHeight(1)=76
const SECTION_ROW = 30, SECTION_FIRST_ROW = 60, SECTION_PAD_BOTTOM = 16;
const sectionHeight = (n) => SECTION_FIRST_ROW + (Math.max(n, 1) - 1) * SECTION_ROW + SECTION_PAD_BOTTOM;

// ── Canvas 用色镜像（与 src/index.css 的 @theme 保持一致） ──
// Tailwind class 在 Canvas 中无效，所以单独维护一份十六进制色镜像
const EXPORT_COLORS = {
  light: {
    bg:      "#f8fafc",  // slate-50
    cardBg:  "#ffffff",
    tp:      "#0f172a",  // slate-900
    ts:      "#475569",  // slate-600
    tm:      "#94a3b8",  // slate-400
    bd:      "#e2e8f0",  // slate-200
    track:   "#e2e8f0",  // 进度条底色
    dots:    "#cbd5e1",  // slate-300
    subBg:   "#f8fafc",
    conduct: "#2e6fb7",  // 靖蓝 conduct-600
    ability: "#2f8f9d",  // 青 teal ability-600
    reward:  "#c99a2e",  // 暖金 reward-500
    danger:  "#c0504d",  // 暗红 danger-500（语义：负分）
    brand:   "#1f4e79",  // 交大蓝 brand-600
    accent:  "#c99a2e",  // 暖金 accent-500（总分蓝→金渐变）
  },
  dark: {
    bg:      "#020617",  // slate-950
    cardBg:  "#0f172a",  // slate-900
    tp:      "#f1f5f9",  // slate-100
    ts:      "#94a3b8",  // slate-400
    tm:      "#64748b",  // slate-500
    bd:      "#334155",  // slate-700
    track:   "#334155",
    dots:    "#475569",  // slate-600
    subBg:   "#0f172a",
    conduct: "#88aed6",  // 靖蓝 conduct-300
    ability: "#66bfc8",  // 青 teal ability-300
    reward:  "#e0c074",  // 暖金 reward-300
    danger:  "#e29b98",  // 暗红 danger-300（语义：负分）
    brand:   "#8fb0ce",  // 交大蓝 brand-300
    accent:  "#e0c074",  // 暖金 accent-300（总分蓝→金渐变）
  },
};

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

// 画一段圆弧（环形仪表的彩色分段，圆角端点）
function arcSegment(ctx, cx, cy, r, startA, endA, width, color) {
  if (endA <= startA) return;
  ctx.beginPath();
  ctx.arc(cx, cy, r, startA, endA);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.stroke();
}

// 十六进制 → rgba（带透明度），用于模块卡片的淡色底/边
function hexA(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function drawExportImage(scores, data, isDark, logoImg) {
  const c = isDark ? EXPORT_COLORS.dark : EXPORT_COLORS.light;
  const font = FONT;
  const TAU = Math.PI * 2;
  const W = 920, L = 56, R = W - 56;

  // ── 逐项明细 + 动态高度测算 ──
  const sections = buildBreakdown(scores, data);
  const [secC, secA, secR] = sections;
  const colTop = 436;                       // 明细双栏起点
  const leftH = sectionHeight(secC.rows.length);
  const rightH = sectionHeight(secA.rows.length) + 26 + sectionHeight(secR.rows.length);
  const contentBottom = colTop + Math.max(leftH, rightH);
  const footerDivY = contentBottom + 30;
  const footerY = footerDivY + 26;
  const H = footerY + 38;

  const dpr = window.devicePixelRatio || 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  // 纯纸面背景
  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);

  // 卡片：柔和投影 + 描边 + 顶部交大蓝→金压条（证书质感）
  ctx.save();
  ctx.shadowColor = isDark ? "rgba(0,0,0,0.55)" : "rgba(15,23,42,0.12)";
  ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
  ctx.fillStyle = c.cardBg;
  roundRect(ctx, 24, 24, W - 48, H - 48, 18, true);
  ctx.restore();
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  roundRect(ctx, 24, 24, W - 48, H - 48, 18, false, true);
  ctx.save();
  roundRect(ctx, 24, 24, W - 48, H - 48, 18, false, false);
  ctx.clip();
  const topBar = ctx.createLinearGradient(24, 0, W - 24, 0);
  topBar.addColorStop(0, c.brand); topBar.addColorStop(1, c.accent);
  ctx.fillStyle = topBar; ctx.fillRect(24, 24, W - 48, 4);
  ctx.restore();

  // ── 页眉（横幅 logo + 精简标题）──
  const bw = logoImg && logoImg.naturalHeight ? 44 * (logoImg.naturalWidth / logoImg.naturalHeight) : 0;
  if (logoImg && bw) {
    try {
      if (isDark) ctx.filter = "brightness(1.7)";   // 蓝色横幅在暗底上提亮以保证可读
      ctx.drawImage(logoImg, L, 38, bw, 44);
      ctx.filter = "none";
    } catch { ctx.filter = "none"; }
  }
  const tx = logoImg && bw ? L + bw + 20 : L;
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.fillStyle = c.tp; ctx.font = `bold 22px ${font}`;
  ctx.fillText("综合素质测评得分", tx, 58);
  ctx.fillStyle = c.tm; ctx.font = `13px ${font}`;
  ctx.fillText("依据《本科生专业选择综合素质测评内容及评分标准》", tx, 80);
  const hd = new Date();
  const dateStr = `${hd.getFullYear()}-${String(hd.getMonth() + 1).padStart(2, "0")}-${String(hd.getDate()).padStart(2, "0")}`;
  ctx.fillStyle = c.tm; ctx.font = `13px ${font}`; ctx.textAlign = "right";
  ctx.fillText(dateStr, R, 56);
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(L, 106); ctx.lineTo(R, 106); ctx.stroke();

  // ══ 汇总带 ══
  // 左·环形仪表（三段彩环 + 环心蓝→金总分）
  const cx = 204, cy = 248, rr = 96, rw = 22;
  ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU);
  ctx.strokeStyle = c.track; ctx.lineWidth = rw; ctx.lineCap = "butt"; ctx.stroke();
  let a0 = -Math.PI / 2;
  sections.forEach((s) => {
    const frac = Math.max(0, s.subtotal) / 105;
    if (frac <= 0.0008) return;
    const a1 = a0 + frac * TAU;
    arcSegment(ctx, cx, cy, rr, a0, a1, rw, c[s.colorKey]);
    a0 = a1;
  });
  ctx.textAlign = "center";
  ctx.fillStyle = c.tm; ctx.font = `14px ${font}`;
  ctx.fillText("总分", cx, cy - 34);
  const totalGrad = ctx.createLinearGradient(cx - 70, cy, cx + 70, cy);
  totalGrad.addColorStop(0, c.brand); totalGrad.addColorStop(1, c.accent);
  ctx.fillStyle = totalGrad; ctx.font = `bold 54px ${font}`;
  ctx.fillText(scores.total.toFixed(1), cx, cy + 16);
  ctx.fillStyle = c.tm; ctx.font = `15px ${font}`;
  ctx.fillText("/ 105", cx, cy + 40);

  // 竖向分隔线（环与右侧 tile 间）
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(360, 150); ctx.lineTo(360, 348); ctx.stroke();

  // 右·三模块小计 tile（汇总）
  const tileX = 392, tileXR = R, tileTops = [162, 228, 294];
  sections.forEach((s, i) => {
    const tY = tileTops[i], col = c[s.colorKey];
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tileX + 6, tY + 13, 5.5, 0, TAU); ctx.fill();
    ctx.fillStyle = col; ctx.font = `bold 16px ${font}`; ctx.textAlign = "left";
    ctx.fillText(s.name, tileX + 20, tY + 18);
    ctx.font = `13px ${font}`; ctx.fillStyle = c.tm; ctx.textAlign = "right";
    const mx = `/${s.max}`, mxW = ctx.measureText(mx).width;
    ctx.fillText(mx, tileXR, tY + 18);
    ctx.font = `bold 21px ${font}`; ctx.fillStyle = c.tp;
    ctx.fillText(s.subtotal.toFixed(1), tileXR - mxW - 4, tY + 18);
    const tbY = tY + 30, tbW = tileXR - tileX;
    ctx.fillStyle = hexA(col, isDark ? 0.22 : 0.16); roundRect(ctx, tileX, tbY, tbW, 7, 3.5, true);
    const pw = Math.min(1, s.max > 0 ? s.subtotal / s.max : 0) * tbW;
    if (pw > 0.5) { ctx.fillStyle = col; roundRect(ctx, tileX, tbY, Math.max(pw, 7), 7, 3.5, true); }
  });

  // ══ 明细带 ══
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(L, 366); ctx.lineTo(R, 366); ctx.stroke();
  ctx.fillStyle = c.brand; roundRect(ctx, L, 384, 4, 18, 2, true);
  ctx.fillStyle = c.tp; ctx.font = `bold 18px ${font}`; ctx.textAlign = "left";
  ctx.fillText("得分明细", L + 14, 400);
  const dtW = ctx.measureText("得分明细").width;
  ctx.fillStyle = c.tm; ctx.font = `13px ${font}`;
  ctx.fillText("每一项得分逐条列示", L + 14 + dtW + 12, 400);
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(L, 412); ctx.lineTo(R, 412); ctx.stroke();

  // 一个模块段：色条 + 模块名 + 小计 + 下划线 + 逐项行；返回段底部 y
  const drawSection = (topY, x0, x1, s) => {
    const col = c[s.colorKey];
    ctx.fillStyle = col; roundRect(ctx, x0, topY + 4, 4, 18, 2, true);
    ctx.fillStyle = col; ctx.font = `bold 16px ${font}`; ctx.textAlign = "left";
    ctx.fillText(s.name, x0 + 14, topY + 18);
    ctx.font = `13px ${font}`; ctx.fillStyle = c.tm; ctx.textAlign = "right";
    const mt = ` / ${s.max}`, mtW = ctx.measureText(mt).width;
    ctx.fillText(mt, x1, topY + 18);
    ctx.font = `bold 15px ${font}`; ctx.fillStyle = c.tp;
    ctx.fillText(s.subtotal.toFixed(1), x1 - mtW - 2, topY + 18);
    ctx.strokeStyle = hexA(col, isDark ? 0.45 : 0.32); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, topY + 30); ctx.lineTo(x1, topY + 30); ctx.stroke();
    const rows = s.rows;
    if (rows.length === 0) {
      ctx.textAlign = "left"; ctx.fillStyle = c.tm; ctx.font = `15px ${font}`;
      ctx.fillText("暂无得分项", x0, topY + SECTION_FIRST_ROW);
    }
    rows.forEach((row, i) => {
      const ry = topY + SECTION_FIRST_ROW + i * SECTION_ROW;
      ctx.textAlign = "left"; ctx.fillStyle = c.ts; ctx.font = `15px ${font}`;
      ctx.fillText(row.label, x0, ry);
      const nameW = ctx.measureText(row.label).width;
      const valText = (row.value >= 0 ? "+" : "") + row.value.toFixed(1);
      ctx.font = `15px ${font}`; const valW = ctx.measureText(valText).width;
      const ds = x0 + nameW + 8, de = x1 - valW - 8;
      if (de > ds) { ctx.fillStyle = c.dots; for (let dx = ds; dx < de; dx += 6) ctx.fillRect(dx, ry - 5, 2, 1); }
      ctx.textAlign = "right"; ctx.fillStyle = row.value < 0 ? c.danger : c.tp;
      ctx.fillText(valText, x1, ry);
    });
    return topY + sectionHeight(rows.length);
  };

  const lX0 = L, lX1 = 452, rX0 = 484, rX1 = R, divX = 468;
  // 竖向发丝线分两栏
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(divX, 426); ctx.lineTo(divX, contentBottom); ctx.stroke();
  drawSection(colTop, lX0, lX1, secC);                          // 左栏：品行
  const aBottom = drawSection(colTop, rX0, rX1, secA);          // 右栏：能力
  drawSection(aBottom + 26, rX0, rX1, secR);                    //       奖励

  // ── 页脚 ──
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(L, footerDivY); ctx.lineTo(R, footerDivY); ctx.stroke();
  const now = new Date();
  const ts2 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  ctx.fillStyle = c.tm; ctx.font = `12px ${font}`; ctx.textAlign = "left";
  ctx.fillText("仅供参考，最终以学校 / 书院官方认定为准", L, footerY);
  ctx.font = `12px ${font}`; ctx.textAlign = "right";
  ctx.fillText(`生成于 ${ts2}`, R, footerY);

  return canvas;
}

export function ExportModal({ scores, data, isDark, onClose }) {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const dialogRef = useRef(null);

  // ── 模态可访问性：Esc 关闭、焦点移入/归还、Tab 焦点陷阱、锁定背景滚动 ──
  useEffect(() => {
    const prevActive = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const list = Array.from(
        dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.disabled && el.offsetParent !== null);
      if (list.length === 0) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      if (prevActive instanceof HTMLElement) prevActive.focus();
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    const render = (img) => {
      if (cancelled) return;
      const c = drawExportImage(scores, data, isDark, img);
      canvasRef.current = c;
      if (previewRef.current) { previewRef.current.innerHTML = ""; c.style.width = "100%"; c.style.height = "auto"; c.style.borderRadius = "8px"; previewRef.current.appendChild(c); }
    };

    const loadLogo = () => new Promise((res) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = "/blue-banner-logo.png";
    });

    const start = async () => {
      const img = await loadLogo();
      if (cancelled) return;
      // 首帧：尽量等 Noto Sans SC 字形切片就绪，但最多等 2.8s，避免预览卡白
      try {
        if (document.fonts && document.fonts.load) {
          await Promise.race([
            Promise.all([
              document.fonts.load("400 16px 'Noto Sans SC'", FONT_SAMPLE),
              document.fonts.load("700 16px 'Noto Sans SC'", FONT_SAMPLE),
            ]),
            new Promise((r) => setTimeout(r, 2800)),
          ]);
        }
      } catch { /* ignore — fallback font */ }
      render(img);
      // 若首帧时字体尚未就绪，待全部就绪后再重绘一次，确保最终图用 Noto
      try {
        if (document.fonts && document.fonts.ready) { await document.fonts.ready; render(img); }
      } catch { /* ignore */ }
    };
    start();

    return () => { cancelled = true; };
  }, [scores, data, isDark]);

  const saveImage = () => {
    if (!canvasRef.current) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const a = document.createElement("a");
    a.download = `xjtu-score-${scores.total.toFixed(1)}-${dateStr}.png`;
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="export-modal-title"
        className="w-full sm:max-w-xl lg:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 max-h-[90vh] flex flex-col outline-none motion-safe:animate-[fadeInUp_0.24s_ease-out]"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/60 dark:border-white/10 shrink-0">
          <h3 id="export-modal-title" className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="inline-flex w-6 h-6 rounded-lg bg-brand-600 text-white dark:bg-brand-400 dark:text-slate-950 items-center justify-center"><IconArrowUpRight className="w-3.5 h-3.5" /></span>
            导出得分
          </h3>
          <button type="button" onClick={onClose} aria-label="关闭" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"><IconX /></button>
        </div>
        <div className="p-4 overflow-auto">
          <div ref={previewRef} className="mb-4 rounded-lg overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-sm" />
          <div className="flex gap-3">
            <button onClick={saveImage}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors bg-brand-700 text-white hover:bg-brand-800 dark:bg-brand-400 dark:text-slate-950 dark:hover:bg-brand-300 active:scale-[0.98]">
              <IconCamera />保存图片
            </button>
            <button onClick={printPDF}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border border-slate-300 dark:border-white/15 bg-transparent text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-white/30 active:scale-[0.98]">
              <IconPrinter />打印 / PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
