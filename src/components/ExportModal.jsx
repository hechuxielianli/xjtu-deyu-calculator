import { useState, useEffect, useRef } from "react";
import { IconX, IconCamera, IconPrinter } from "./icons";

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

  // Logo
  const titleOffsetX = logoImg ? 44 : 0;
  if (logoImg) {
    try { ctx.drawImage(logoImg, L, y - 12, 36, 36); } catch {}
  }

  ctx.fillStyle = tp; ctx.font = `bold 18px ${font}`; ctx.textAlign = "left";
  ctx.fillText("西安交通大学 · 综合素质测评得分", L + titleOffsetX, y);
  y += 16; ctx.fillStyle = tm; ctx.font = `12px ${font}`;
  ctx.fillText("依据《本科生专业选择综合素质测评内容及评分标准》", L + titleOffsetX, y);

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
    { label: "品行素质分", score: scores.conduct.total, max: 80, color: teal, accent: teal, items: [
      ["基准分", scores.conduct.base], ["集体活动", scores.conduct.collective], ["思政学习", scores.conduct.political],
      ["社会服务", scores.conduct.social], ...(scores.conduct.penalty > 0 ? [["扣分", -scores.conduct.penalty]] : [])] },
    { label: "能力拓展分", score: scores.ability.total, max: 20, color: orange, accent: orange, items: [
      ["学术科研", scores.ability.academic], ["文体竞赛", scores.ability.artSport], ["组织任职", scores.ability.org]] },
    { label: "奖励分", score: scores.reward.total, max: 5, color: amber, accent: amber, items: [
      ["荣誉表彰", scores.reward.honor], ["好人好事", scores.reward.deeds]] },
  ];

  blocks.forEach((b, i) => {
    const bx = L + i * (colW + 16);
    ctx.fillStyle = subBg; ctx.strokeStyle = bd; ctx.lineWidth = 0.5;
    roundRect(ctx, bx, y, colW, 340, 10, true, true);
    // Color indicator bar at top
    ctx.fillStyle = b.accent;
    roundRect(ctx, bx, y, colW, 4, 10, true);
    ctx.fillStyle = b.color; ctx.font = `bold 13px ${font}`; ctx.textAlign = "left";
    ctx.fillText(b.label, bx + 16, y + 28);
    ctx.fillStyle = tp; ctx.font = `bold 28px ${mono}`; ctx.textAlign = "right";
    ctx.fillText(b.score.toFixed(1), bx + colW - 16, y + 30);
    ctx.fillStyle = tm; ctx.font = `12px ${font}`; ctx.fillText(`/${b.max}`, bx + colW - 16, y + 48);
    let iy = y + 72;
    b.items.forEach(([name, val]) => {
      ctx.textAlign = "left"; ctx.fillStyle = ts; ctx.font = `13px ${font}`; ctx.fillText(name, bx + 16, iy);
      // Dotted leader
      const nameW = ctx.measureText(name).width;
      const valText = (val >= 0 ? "+" : "") + val.toFixed(1);
      ctx.font = `13px ${mono}`; const valW = ctx.measureText(valText).width;
      const dotsStart = bx + 16 + nameW + 4;
      const dotsEnd = bx + colW - 16 - valW - 4;
      if (dotsEnd > dotsStart) {
        ctx.fillStyle = isDark ? "#44403c" : "#d4d4d8";
        for (let dx = dotsStart; dx < dotsEnd; dx += 6) ctx.fillRect(dx, iy - 2, 2, 1);
      }
      ctx.fillStyle = val < 0 ? red : tp; ctx.font = `13px ${mono}`; ctx.textAlign = "right";
      ctx.fillText(valText, bx + colW - 16, iy);
      iy += 28;
    });
  });

  // Timestamp
  const now = new Date();
  const ts2 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  ctx.fillStyle = tm; ctx.font = `10px ${font}`; ctx.textAlign = "right";
  ctx.fillText(`生成于 ${ts2}`, R, H - 36);

  // Disclaimer
  ctx.fillStyle = tm; ctx.font = `11px ${font}`; ctx.textAlign = "left";
  ctx.fillText("仅供参考，最终以学校/书院官方认定为准", L, H - 36);

  // Watermark stamp
  ctx.save();
  ctx.globalAlpha = isDark ? 0.08 : 0.06;
  ctx.translate(R - 60, H - 110);
  ctx.rotate(-Math.PI / 12);
  ctx.strokeStyle = red;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = red; ctx.font = `bold 11px ${font}`; ctx.textAlign = "center";
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
