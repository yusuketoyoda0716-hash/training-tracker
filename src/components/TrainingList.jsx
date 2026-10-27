const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// "2026-10-27" → "2026-10-27（火）"
function formatDateHeading(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${dateStr}（${WEEKDAYS[new Date(y, m - 1, d).getDay()]}）`;
}

export default function TrainingList({
  selectedDate,
  filteredItems,
  groupedAll,
  removeTraining,
}) {
  // 日付ごとのグループ（日付を選んでいるときはその日だけ）
  const groups = selectedDate
    ? filteredItems.length > 0
      ? [{ date: selectedDate, items: filteredItems }]
      : []
    : groupedAll;

  return (
    <section className="panel">
      <h2 className="panel__title">トレーニング一覧</h2>

      {groups.length === 0 ? (
        <p className="hint">
          {selectedDate ? "この日の記録はありません" : "まだ記録がありません"}
        </p>
      ) : (
        <div className="list">
          {groups.map((g) => (
            <section key={g.date}>
              {/* 日付は見出しにまとめて表示する */}
              <h3>{formatDateHeading(g.date)}</h3>
              <ul className="list">
                {g.items.map((t) => (
                  <li key={t.id}>
                    <span className="training-main">
                      {t.name}：{t.weight}kg × {t.reps}回 × {t.sets}セット
                    </span>

                    <button
                      className="btn btn--danger"
                      type="button"
                      onClick={() => removeTraining(t.id)}
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
