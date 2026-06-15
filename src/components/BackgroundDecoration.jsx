export function BackgroundDecoration({ dark }) {
  const o1 = dark ? 0.12 : 0.30;
  const o2 = dark ? 0.10 : 0.22;
  const o3 = dark ? 0.07 : 0.14;
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* 左上 交大蓝 */}
      <div
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl motion-safe:animate-[auroraDrift_30s_ease-in-out_infinite]"
        style={{ backgroundColor: "rgb(92 135 178)", opacity: o1, "--blob-opacity": o1 }}
      />
      {/* 右下 青 teal */}
      <div
        className="absolute -bottom-40 -right-32 w-[560px] h-[560px] rounded-full blur-3xl motion-safe:animate-[auroraDrift_38s_ease-in-out_infinite_reverse]"
        style={{ backgroundColor: "rgb(77 178 191)", opacity: o2, "--blob-opacity": o2 }}
      />
      {/* 中偏左 暖金 辅助 */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-1/4 w-[360px] h-[360px] rounded-full blur-3xl motion-safe:animate-[auroraDrift_46s_ease-in-out_infinite]"
        style={{ backgroundColor: "rgb(224 192 116)", opacity: o3, "--blob-opacity": o3 }}
      />
    </div>
  );
}
