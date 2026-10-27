import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatDay } from "../lib/dates";

const fmtKg = (n) => new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 }).format(n);

// ノートの1ページ（1日分）。罫線の上に記録を書き、下に合計を出す
export default function DayPage({
  date, entries, onPrev, onNext, onToday, isToday, onDelete, emptyAction, children,
}) {
  const totalSets = entries.reduce((s, t) => s + t.sets, 0);
  const volume = entries.reduce((s, t) => s + t.weight * t.reps * t.sets, 0);

  return (
    <article className="page" aria-labelledby="page-date">
      <div className="page__head">
        <button type="button" className="iconBtn" onClick={onPrev} aria-label="前の日">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h2 id="page-date" className="page__date" aria-live="polite">
          {formatDay(date)}
        </h2>
        <button type="button" className="iconBtn" onClick={onNext} aria-label="次の日">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
        {!isToday && (
          <button type="button" className="btn btn--small btn--quiet page__today" onClick={onToday}>
            今日へ
          </button>
        )}
      </div>

      <div className="page__lines">
        {entries.length === 0 ? (
          <div className="page__empty">
            <p>この日の記録はまだありません。下の欄から書き込めます。</p>
            {emptyAction}
          </div>
        ) : (
          <ol className="entries">
            {entries.map((t) => (
              <li key={t.id} className="entry">
                <span className="entry__name">{t.name}</span>
                <span className="entry__load">
                  {t.weight > 0 ? `${fmtKg(t.weight)}kg` : "自重"}
                </span>
                <span className="entry__reps">
                  {t.reps}回 × {t.sets}セット
                </span>
                <button
                  type="button"
                  className="iconBtn iconBtn--small entry__del"
                  onClick={() => onDelete(t.id)}
                  aria-label={`${t.name}の記録を消す`}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        )}

        {entries.length > 0 && (
          <p className="page__total">
            {entries.length}種目・{totalSets}セット
            {volume > 0 && <span>総重量 {fmtKg(volume)}kg</span>}
          </p>
        )}
      </div>

      <div className="page__write">{children}</div>
    </article>
  );
}
