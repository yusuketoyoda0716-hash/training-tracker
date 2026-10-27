export default function DateFilter({ selectedDate, setSelectedDate }) {
  return (
    <section className="panel">
      <h2 className="panel__title">日付で表示</h2>

      <div className="filter">
        <input
          type="date"
          className="input"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <button
          type="button"
          className="btn btn--sub"
          onClick={() => setSelectedDate("")}
        >
          クリア
        </button>
      </div>

      <p className="hint">※ 日付を選ぶとその日の記録だけ表示（未選択なら全件）</p>
    </section>
  );
}
