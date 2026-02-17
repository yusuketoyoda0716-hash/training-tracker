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
          className="btn"
          onClick={() => setSelectedDate(selectedDate)}
        >
          この日だけ表示
        </button>

        <button
          type="button"
          className="btn btn--sub"
          onClick={() => setSelectedDate("")}
        >
          クリア
        </button>
      </div>

      <p className="hint">※ 日付未選択なら全件表示</p>
    </section>
  );
}
