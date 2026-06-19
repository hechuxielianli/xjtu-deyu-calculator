// 合并 className 的小工具：过滤假值后用空格拼接。
export const cn = (...a) => a.filter(Boolean).join(" ");
