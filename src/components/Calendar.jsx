const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function Calendar({
  calendarBaseDate,
  setCalendarBaseDate,
  calendarDays,
  selectedDate,
  setSelectedDate,
}) {
  return (
    <section className="panel">
      <h2 className="panel__title">カレンダー</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "6px 0 10px",
        }}
      >
        <button
          type="button"
          className="btn btn--sub"
          onClick={() => {
            setSelectedDate("");
            setCalendarBaseDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
          }}
        >
          ◀ 前月
        </button>

        <div style={{ fontWeight: 800 }}>
          {calendarBaseDate.getFullYear()}年 {calendarBaseDate.getMonth() + 1}月
        </div>

        <button
          type="button"
          className="btn btn--sub"
          onClick={() => {
            setSelectedDate("");
            setCalendarBaseDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
          }}
        >
          次月 ▶
        </button>
      </div>

      {/* 曜日 */}
      <div className="calendar" style={{ marginBottom: 6 }}>
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={[
              "calendar__weekday",
              i === 0 && "calendar__weekday--sun",
              i === 6 && "calendar__weekday--sat",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 日付マス */}
      <div className="calendar">
        {calendarDays.map((d) => (
          <div
            key={d.dateStr}
            className={[
              "calendar__day",
              d.hasData && "calendar__day--has-data",
              d.isSelected && "calendar__day--selected",
              new Date(d.dateStr).getDay() === 0 && "calendar__day--sun",
              new Date(d.dateStr).getDay() === 6 && "calendar__day--sat",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSelectedDate(d.dateStr)}
          >
            {d.day}
          </div>
        ))}
      </div>
    </section>
  );
}
