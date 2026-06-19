// 为动态列表项生成稳定唯一 id：优先 crypto.randomUUID，否则计数器兜底。
// 稳定 id 用作 React key，避免删除/重排时编辑态错挂到相邻行。
let _seq = 0;
export const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${_seq++}`;
