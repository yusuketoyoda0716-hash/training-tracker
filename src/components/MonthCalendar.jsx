import { ChevronLeft, ChevronRight } from "lucide-react";
import { WEEKDAYS, toDateString } from "../lib/dates";

// 月のカレンダー。記録がある日に印、表示中の日にペンの丸
export default function MonthCalendar({ month, onMonthChange, selectedDate, todayDate, recorded, onSelect }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = new Date(year, m, 1).getDay();
  const lastDay = new Date(year, m + 1, 0).getDate();
  const recordedThisMonth = [...recorded.keys()].filter((d) => d.startsWith(toDateString(month).slice(0, 7))).length;

  return (
    <section className="card" aria-labelledby="cal-title">
      <div className="card__head">
        <button type="button" className="iconBtn" onClick={() => onMonthChange(new Date(year, m - 1, 1))} aria-label="前の月">
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <h2 id="cal-title" className="card__title">{year}年{m + 1}月</h2>
        <button type="button" className="iconBtn" onClick={() => onMonthChange(new Date(year, m + 1, 1))} aria-label="次の月">
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="cal" role="grid">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className={`cal__wd${i === 0 ? " is-sun" : i === 6 ? " is-sat" : ""}`} role="columnheader">{w}</span>
        ))}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <span key={`b${i}`} aria-hidden="true" />
        ))}
        {Array.from({ length: lastDay }, (_, i) => {
          const day = i + 1;
          const date = toDateString(new Date(year, m, day));
          const count = recorded.get(date)?.length ?? 0;
          const wd = (firstWeekday + i) % 7;
          return (
            <button
              key={date}
              type="button"
              className={[
                "cal__day",
                wd === 0 && "is-sun",
                wd === 6 && "is-sat",
                count > 0 && "has-record",
                date === selectedDate && "is-selected",
                date === todayDate && "is-today",
              ].filter(Boolean).join(" ")}
              onClick={() => onSelect(date)}
              aria-label={`${m + 1}月${day}日${count ? `（${count}種目）` : ""}`}
              aria-current={date === selectedDate ? "date" : undefined}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="card__foot">この月は {recordedThisMonth} 日トレーニング</p>
    </section>
  );
}
