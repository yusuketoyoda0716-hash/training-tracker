// 日付はすべて「YYYY-MM-DD」の文字列で扱い、計算は端末のローカル時刻で行う

const pad = (n) => String(n).padStart(2, "0");
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function toDateString(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function today() {
  return toDateString(new Date());
}

/** "2026-10-27" に n 日足す */
export function addDays(str, n) {
  const d = parseDate(str);
  d.setDate(d.getDate() + n);
  return toDateString(d);
}

/** "2026-10-27" → "10月27日（火）" */
export function formatDay(str) {
  const d = parseDate(str);
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`;
}

/** "2026-10-27" → "火" */
export function weekdayOf(str) {
  return WEEKDAYS[parseDate(str).getDay()];
}

export { WEEKDAYS };
