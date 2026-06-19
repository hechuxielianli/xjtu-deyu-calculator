// 不可变数组重排：交换相邻元素，返回新数组（越界则原样返回）。
export const moveUp = (arr, i) => { if (i <= 0) return arr; const n = [...arr]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; };
export const moveDown = (arr, i) => { if (i >= arr.length - 1) return arr; const n = [...arr]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n; };
