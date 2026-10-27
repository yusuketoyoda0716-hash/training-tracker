// 種目と重さの初期候補
export const DEFAULT_EXERCISES = ["ベンチプレス", "スクワット", "デッドリフト"];

export function defaultWeights() {
  const list = [];
  for (let w = 2.5; w <= 100; w += 2.5) list.push(Number(w.toFixed(1)));
  return list;
}
