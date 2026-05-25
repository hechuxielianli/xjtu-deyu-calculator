export function BackgroundDecoration({ dark }) {
  const o1 = dark ? 0.18 : 0.42;
  const o2 = dark ? 0.14 : 0.32;
  const o3 = dark ? 0.10 : 0.22;
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* 左上 indigo */}
      <div
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl motion-safe:animate-[auroraDrift_22s_ease-in-out_infinite]"
        style={{ backgroundColor: "rgb(99 102 241)", opacity: o1, "--blob-opacity": o1 }}
      />
      {/* 右下 violet */}
      <div
        className="absolute -bottom-40 -right-32 w-[560px] h-[560px] rounded-full blur-3xl motion-safe:animate-[auroraDrift_28s_ease-in-out_infinite_reverse]"
        style={{ backgroundColor: "rgb(139 92 246)", opacity: o2, "--blob-opacity": o2 }}
      />
      {/* 中偏左 fuchsia 辅助 */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-1/4 w-[360px] h-[360px] rounded-full blur-3xl motion-safe:animate-[auroraDrift_34s_ease-in-out_infinite]"
        style={{ backgroundColor: "rgb(217 70 239)", opacity: o3, "--blob-opacity": o3 }}
      />
    </div>
  );
}
