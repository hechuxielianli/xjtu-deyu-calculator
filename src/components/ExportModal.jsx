import { useEffect, useRef } from "react";
import { IconX, IconCamera, IconPrinter, IconArrowUpRight } from "./icons";

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

function drawExportImage(scores, isDark, logoImg) {
  const W = 920, H = 640, dpr = window.devicePixelRatio || 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const c = isDark ? EXPORT_COLORS.dark : EXPORT_COLORS.light;
  const font = "'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif";
  const mono = "'SF Mono','Menlo','Consolas',monospace";
  const TAU = Math.PI * 2;

  // 纯纸面背景
  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);

  // 卡片：柔和投影 + 描边 + 顶部交大蓝压条（证书质感）
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

  const L = 56, R = W - 56;

  // ── 页眉 ──
  if (logoImg) { try { ctx.drawImage(logoImg, L, 40, 44, 44); } catch { /* ignore */ } }
  const tx = logoImg ? L + 58 : L;
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.fillStyle = c.tp; ctx.font = `bold 20px ${font}`;
  ctx.fillText("西安交通大学 · 综合素质测评得分", tx, 60);
  ctx.fillStyle = c.tm; ctx.font = `12px ${font}`;
  ctx.fillText("依据《本科生专业选择综合素质测评内容及评分标准》", tx, 82);
  const hd = new Date();
  const dateStr = `${hd.getFullYear()}-${String(hd.getMonth() + 1).padStart(2, "0")}-${String(hd.getDate()).padStart(2, "0")}`;
  ctx.fillStyle = c.tm; ctx.font = `12px ${font}`; ctx.textAlign = "right";
  ctx.fillText(dateStr, R, 60);
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(L, 104); ctx.lineTo(R, 104); ctx.stroke();

  // ── 左·环形仪表（三段彩环 + 环心大号总分）──
  const cx = 204, cy = 292, rr = 124, rw = 22;
  ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU);
  ctx.strokeStyle = c.track; ctx.lineWidth = rw; ctx.lineCap = "butt"; ctx.stroke();
  const segs = [
    { v: scores.conduct.total, color: c.conduct },
    { v: scores.ability.total, color: c.ability },
    { v: scores.reward.total, color: c.reward },
  ];
  let a0 = -Math.PI / 2;
  segs.forEach((s) => {
    const frac = Math.max(0, s.v) / 105;
    if (frac <= 0.0008) return;
    const a1 = a0 + frac * TAU;
    arcSegment(ctx, cx, cy, rr, a0, a1, rw, s.color);
    a0 = a1;
  });
  ctx.textAlign = "center";
  ctx.fillStyle = c.tm; ctx.font = `14px ${font}`;
  ctx.fillText("总分", cx, cy - 38);
  const totalGrad = ctx.createLinearGradient(cx - 72, cy, cx + 72, cy);
  totalGrad.addColorStop(0, c.brand); totalGrad.addColorStop(1, c.accent);
  ctx.fillStyle = totalGrad; ctx.font = `bold 60px ${mono}`;
  ctx.fillText(scores.total.toFixed(1), cx, cy + 18);
  ctx.fillStyle = c.tm; ctx.font = `15px ${font}`;
  ctx.fillText("/ 105", cx, cy + 44);

  // 图例（环下，横排居中）
  const legend = [
    { label: "品行", v: scores.conduct.total, color: c.conduct },
    { label: "能力", v: scores.ability.total, color: c.ability },
    { label: "奖励", v: scores.reward.total, color: c.reward },
  ];
  ctx.font = `12px ${font}`;
  const lgGap = 18;
  const lgW = legend.map((e) => 14 + ctx.measureText(`${e.label} ${e.v.toFixed(1)}`).width);
  let lx = cx - (lgW.reduce((s, w) => s + w, 0) + lgGap * (legend.length - 1)) / 2;
  legend.forEach((e, i) => {
    ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(lx + 4, 456, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = c.ts; ctx.textAlign = "left"; ctx.fillText(`${e.label} ${e.v.toFixed(1)}`, lx + 14, 460);
    lx += lgW[i] + lgGap;
  });

  // 总分进度条 + 距满分（填充左下、补充信息）
  const remain = Math.max(0, 105 - scores.total);
  const pbX = 86, pbW = 236, pbY = 506;
  ctx.textAlign = "left"; ctx.fillStyle = c.ts; ctx.font = `12px ${font}`;
  ctx.fillText("距满分", pbX, pbY - 8);
  ctx.textAlign = "right"; ctx.fillStyle = c.tp; ctx.font = `bold 13px ${mono}`;
  ctx.fillText(`${remain.toFixed(1)} 分`, pbX + pbW, pbY - 8);
  ctx.fillStyle = c.track; roundRect(ctx, pbX, pbY, pbW, 8, 4, true);
  const tpw = Math.min(1, scores.total / 105) * pbW;
  if (tpw > 1) {
    const pg = ctx.createLinearGradient(pbX, 0, pbX + pbW, 0);
    pg.addColorStop(0, c.brand); pg.addColorStop(1, c.accent);
    ctx.fillStyle = pg; roundRect(ctx, pbX, pbY, Math.max(tpw, 8), 8, 4, true);
  }

  // 竖向分隔线
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(356, 116); ctx.lineTo(356, H - 64); ctx.stroke();

  // ── 右·模块明细（三模块色淡底卡片 + 迷你进度条）──
  const modules = [
    { name: "品行素质", color: c.conduct, score: scores.conduct.total, max: 80, items: [
      ["基准分", scores.conduct.base], ["集体活动", scores.conduct.collective], ["思政学习", scores.conduct.political],
      ["社会服务", scores.conduct.social], ...(scores.conduct.penalty > 0 ? [["扣分", -scores.conduct.penalty]] : [])] },
    { name: "能力拓展", color: c.ability, score: scores.ability.total, max: 20, items: [
      ["学术科研", scores.ability.academic], ["文体竞赛", scores.ability.artSport], ["组织任职", scores.ability.org]] },
    { name: "奖励分", color: c.reward, score: scores.reward.total, max: 5, items: [
      ["荣誉表彰", scores.reward.honor], ["好人好事", scores.reward.deeds]] },
  ];
  const cardX = 376, cardIW = R - cardX, pad = 16;
  let cardY = 118;
  modules.forEach((m) => {
    const ih = m.items.length;
    const cardH = 64 + ih * 21;
    const ix = cardX + pad, iw = cardIW - pad * 2, ixr = cardX + cardIW - pad;
    // 淡色底 + 同色描边
    ctx.fillStyle = hexA(m.color, isDark ? 0.13 : 0.06);
    roundRect(ctx, cardX, cardY, cardIW, cardH, 12, true);
    ctx.strokeStyle = hexA(m.color, isDark ? 0.34 : 0.22); ctx.lineWidth = 1;
    roundRect(ctx, cardX, cardY, cardIW, cardH, 12, false, true);
    // 头部：色点 + 模块名（着模块色）+ 得分 / 上限
    const hy = cardY + 30;
    ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(ix + 5, hy - 4, 5, 0, TAU); ctx.fill();
    ctx.fillStyle = m.color; ctx.font = `bold 15px ${font}`; ctx.textAlign = "left";
    ctx.fillText(m.name, ix + 18, hy);
    ctx.font = `12px ${mono}`; ctx.fillStyle = c.tm; ctx.textAlign = "right";
    const maxText = `/${m.max}`, maxW = ctx.measureText(maxText).width;
    ctx.fillText(maxText, ixr, hy);
    ctx.font = `bold 19px ${mono}`; ctx.fillStyle = c.tp;
    ctx.fillText(m.score.toFixed(1), ixr - maxW - 3, hy);
    // 迷你进度条（轨道为模块色淡底）
    const by = cardY + 44;
    ctx.fillStyle = hexA(m.color, isDark ? 0.22 : 0.16); roundRect(ctx, ix, by, iw, 6, 3, true);
    const pw = Math.min(1, m.max > 0 ? m.score / m.max : 0) * iw;
    if (pw > 0.5) { ctx.fillStyle = m.color; roundRect(ctx, ix, by, Math.max(pw, 6), 6, 3, true); }
    // 明细行
    let iy = cardY + 68;
    m.items.forEach(([name, val]) => {
      ctx.textAlign = "left"; ctx.fillStyle = c.ts; ctx.font = `13px ${font}`;
      ctx.fillText(name, ix, iy);
      const nameW = ctx.measureText(name).width;
      const valText = (val >= 0 ? "+" : "") + val.toFixed(1);
      ctx.font = `13px ${mono}`; const valW = ctx.measureText(valText).width;
      const ds = ix + nameW + 6, de = ixr - valW - 6;
      if (de > ds) { ctx.fillStyle = c.dots; for (let dx = ds; dx < de; dx += 6) ctx.fillRect(dx, iy - 4, 2, 1); }
      ctx.textAlign = "right"; ctx.fillStyle = val < 0 ? c.danger : c.tp; ctx.font = `13px ${mono}`;
      ctx.fillText(valText, ixr, iy);
      iy += 21;
    });
    cardY += cardH + 20;
  });

  // ── 页脚 ──
  ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(L, H - 54); ctx.lineTo(R, H - 54); ctx.stroke();
  const now = new Date();
  const ts2 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  ctx.fillStyle = c.tm; ctx.font = `11px ${font}`; ctx.textAlign = "left";
  ctx.fillText("仅供参考，最终以学校 / 书院官方认定为准", L, H - 32);
  ctx.font = `10px ${font}`; ctx.textAlign = "right";
  ctx.fillText(`生成于 ${ts2}`, R, H - 32);

  return canvas;
}

export function ExportModal({ scores, isDark, onClose }) {
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
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "/xjtublue.png";

    const render = (img) => {
      const c = drawExportImage(scores, isDark, img);
      canvasRef.current = c;
      if (previewRef.current) { previewRef.current.innerHTML = ""; c.style.width = "100%"; c.style.height = "auto"; c.style.borderRadius = "8px"; previewRef.current.appendChild(c); }
    };

    logoImg.onload = () => render(logoImg);
    logoImg.onerror = () => render(null);
  }, [scores, isDark]);

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
