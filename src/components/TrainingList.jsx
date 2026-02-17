export default function TrainingList({
  selectedDate,
  filteredItems,
  groupedAll,
  removeTraining,
}) {
  // 表示する配列（今の仕様そのまま）
  const itemsToShow = selectedDate
    ? filteredItems
    : groupedAll.flatMap((g) => g.items);

  return (
    <section className="panel">
      <h2 className="panel__title">トレーニング一覧</h2>

      <ul className="list">
        {itemsToShow.map((t) => (
          <li key={t.id}>
            <span className="training-text">
              <span className="training-date">{t.date}</span>
              <span className="training-main">
                {t.name}：{t.weight}kg × {t.reps}回 × {t.sets}セット
              </span>
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
  );
}
