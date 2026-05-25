import { useEffect, useRef } from "react";
import { IconX, IconCamera, IconPrinter } from "./icons";

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
    conduct: "#0284c7",  // sky-600
    ability: "#c026d3",  // fuchsia-600
    reward:  "#f59e0b",  // amber-500
    danger:  "#dc2626",  // red-600
    brand:   "#6366f1",  // indigo-500
    accent:  "#8b5cf6",  // violet-500
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
    conduct: "#38bdf8",  // sky-400
    ability: "#e879f9",  // fuchsia-400
    reward:  "#fcd34d",  // amber-300
    danger:  "#f87171",  // red-400
    brand:   "#818cf8",  // indigo-400
    accent:  "#a78bfa",  // violet-400
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

function drawExportImage(scores, isDark, logoImg) {
  const W = 900, H = 600, dpr = window.devicePixelRatio || 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const c = isDark ? EXPORT_COLORS.dark : EXPORT_COLORS.light;
  const font = "'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif";
  const mono = "'SF Mono','Menlo','Consolas',monospace";

  // 渐变背景
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  if (isDark) {
    bgGrad.addColorStop(0, "#020617");
    bgGrad.addColorStop(0.5, "#1e1b4b");
    bgGrad.addColorStop(1, "#020617");
  } else {
    bgGrad.addColorStop(0, "#f8fafc");
    bgGrad.addColorStop(0.5, "#eef2ff");
    bgGrad.addColorStop(1, "#f5f3ff");
  }
  ctx.fillStyle = bgGrad; roundRect(ctx, 0, 0, W, H, 16, true);

  ctx.fillStyle = c.cardBg; ctx.strokeStyle = c.bd; ctx.lineWidth = 1;
  roundRect(ctx, 24, 24, W - 48, H - 48, 12, true, true);

  const L = 56, R = W - 56;
  let y = 56;

  // Logo
  const titleOffsetX = logoImg ? 44 : 0;
  if (logoImg) {
    try { ctx.drawImage(logoImg, L, y - 12, 36, 36); } catch { /* ignore */ }
  }

  ctx.fillStyle = c.tp; ctx.font = `bold 18px ${font}`; ctx.textAlign = "left";
  ctx.fillText("西安交通大学 · 综合素质测评得分", L + titleOffsetX, y);
  y += 16; ctx.fillStyle = c.tm; ctx.font = `12px ${font}`;
  ctx.fillText("依据《本科生专业选择综合素质测评内容及评分标准》", L + titleOffsetX, y);

  // 总分 — 用 brand→accent 渐变文字
  const totalGrad = ctx.createLinearGradient(R - 120, 50, R, 90);
  totalGrad.addColorStop(0, c.brand);
  totalGrad.addColorStop(1, c.accent);
  ctx.fillStyle = totalGrad; ctx.font = `bold 48px ${mono}`; ctx.textAlign = "right";
  ctx.fillText(scores.total.toFixed(1), R, 82);
  ctx.fillStyle = c.tm; ctx.font = `14px ${font}`; ctx.fillText("/ 105", R, 100);

  y = 120; ctx.strokeStyle = c.bd; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();

  y = 140; const barW = R - L;
  ctx.fillStyle = c.track; roundRect(ctx, L, y, barW, 10, 5, true);
  const p1 = (scores.conduct.total / 105) * barW, p2 = (scores.ability.total / 105) * barW, p3 = (scores.reward.total / 105) * barW;
  ctx.fillStyle = c.conduct; roundRect(ctx, L, y, p1, 10, 5, true);
  ctx.fillStyle = c.ability; ctx.fillRect(L + p1, y, p2, 10);
  ctx.fillStyle = c.reward;  roundRect(ctx, L + p1 + p2, y, p3, 10, 5, true);

  y = 176; const colW = (barW - 32) / 3;
  const blocks = [
    { label: "品行素质分", score: scores.conduct.total, max: 80, color: c.conduct, items: [
      ["基准分", scores.conduct.base], ["集体活动", scores.conduct.collective], ["思政学习", scores.conduct.political],
      ["社会服务", scores.conduct.social], ...(scores.conduct.penalty > 0 ? [["扣分", -scores.conduct.penalty]] : [])] },
    { label: "能力拓展分", score: scores.ability.total, max: 20, color: c.ability, items: [
      ["学术科研", scores.ability.academic], ["文体竞赛", scores.ability.artSport], ["组织任职", scores.ability.org]] },
    { label: "奖励分", score: scores.reward.total, max: 5, color: c.reward, items: [
      ["荣誉表彰", scores.reward.honor], ["好人好事", scores.reward.deeds]] },
  ];

  blocks.forEach((b, i) => {
    const bx = L + i * (colW + 16);
    ctx.fillStyle = c.subBg; ctx.strokeStyle = c.bd; ctx.lineWidth = 0.5;
    roundRect(ctx, bx, y, colW, 340, 10, true, true);
    // Color indicator bar at top
    ctx.fillStyle = b.color;
    roundRect(ctx, bx, y, colW, 4, 10, true);
    ctx.fillStyle = b.color; ctx.font = `bold 13px ${font}`; ctx.textAlign = "left";
    ctx.fillText(b.label, bx + 16, y + 28);
    ctx.fillStyle = c.tp; ctx.font = `bold 28px ${mono}`; ctx.textAlign = "right";
    ctx.fillText(b.score.toFixed(1), bx + colW - 16, y + 30);
    ctx.fillStyle = c.tm; ctx.font = `12px ${font}`; ctx.fillText(`/${b.max}`, bx + colW - 16, y + 48);
    let iy = y + 72;
    b.items.forEach(([name, val]) => {
      ctx.textAlign = "left"; ctx.fillStyle = c.ts; ctx.font = `13px ${font}`; ctx.fillText(name, bx + 16, iy);
      const nameW = ctx.measureText(name).width;
      const valText = (val >= 0 ? "+" : "") + val.toFixed(1);
      ctx.font = `13px ${mono}`; const valW = ctx.measureText(valText).width;
      const dotsStart = bx + 16 + nameW + 4;
      const dotsEnd = bx + colW - 16 - valW - 4;
      if (dotsEnd > dotsStart) {
        ctx.fillStyle = c.dots;
        for (let dx = dotsStart; dx < dotsEnd; dx += 6) ctx.fillRect(dx, iy - 2, 2, 1);
      }
      ctx.fillStyle = val < 0 ? c.danger : c.tp; ctx.font = `13px ${mono}`; ctx.textAlign = "right";
      ctx.fillText(valText, bx + colW - 16, iy);
      iy += 28;
    });
  });

  // Timestamp
  const now = new Date();
  const ts2 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  ctx.fillStyle = c.tm; ctx.font = `10px ${font}`; ctx.textAlign = "right";
  ctx.fillText(`生成于 ${ts2}`, R, H - 36);

  // Disclaimer
  ctx.fillStyle = c.tm; ctx.font = `11px ${font}`; ctx.textAlign = "left";
  ctx.fillText("仅供参考，最终以学校/书院官方认定为准", L, H - 36);

  // Watermark stamp
  ctx.save();
  ctx.globalAlpha = isDark ? 0.10 : 0.08;
  ctx.translate(R - 60, H - 110);
  ctx.rotate(-Math.PI / 12);
  ctx.strokeStyle = c.danger;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = c.danger; ctx.font = `bold 11px ${font}`; ctx.textAlign = "center";
  ctx.fillText("仅供参考", 0, 4);
  ctx.restore();

  return canvas;
}

export function ExportModal({ scores, isDark, onClose }) {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "/hero.png";

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
      <div className="w-full sm:max-w-xl lg:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-white/10 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/60 dark:border-white/10 shrink-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="inline-flex w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white items-center justify-center text-xs">↗</span>
            导出得分
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"><IconX /></button>
        </div>
        <div className="p-4 overflow-auto">
          <div ref={previewRef} className="mb-4 rounded-lg overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-sm" />
          <div className="flex gap-3">
            <button onClick={saveImage}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98]">
              <IconCamera />保存图片
            </button>
            <button onClick={printPDF}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 active:scale-[0.98]">
              <IconPrinter />打印 / PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
