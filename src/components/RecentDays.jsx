import { formatDay } from "../lib/dates";

// 最近記録した日の目次。押すとその日のページを開く
export default function RecentDays({ dates, byDate, selectedDate, onSelect }) {
  if (dates.length === 0) return null;

  return (
    <section className="card" aria-labelledby="recent-title">
      <h2 id="recent-title" className="card__title card__title--plain">最近の記録</h2>
      <ul className="toc">
        {dates.map((d) => {
          const names = [...new Set(byDate.get(d).map((t) => t.name))];
          return (
            <li key={d}>
              <button
                type="button"
                className={`toc__item${d === selectedDate ? " is-current" : ""}`}
                onClick={() => onSelect(d)}
              >
                <span className="toc__date">{formatDay(d)}</span>
                <span className="toc__names">{names.join("、")}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
