export default function TrainingForm({
  form,
  setForm,
  addTraining,

  // 種目
  exercises,
  exerciseMode,
  setExerciseMode,

  // 重さ
  weights,
  weightCustom,
  setWeightCustom,

  // プリセット（一括登録ボタンを付けてる場合）
  presets,
  trainingPresetId,
  setTrainingPresetId,
  onRegisterPreset, // まとめて登録（optional）
}) {
  return (
    <details className="panel" open>
      <summary className="panel__summary">トレーニング追加</summary>

      <form className="form" onSubmit={addTraining}>
        {/* 日付 */}
        <label>
          <span className="field__label">日付</span>
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>

        {/* プリセットで一括登録 */}
        <label>
          <span className="field__label">プリセット</span>

          <select
            className="input"
            value={trainingPresetId}
            onChange={(e) => setTrainingPresetId(e.target.value)}
          >
            <option value="">プリセットを選択</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="btn btn--preset"
          onClick={onRegisterPreset}
          disabled={!trainingPresetId}
        >
          プリセットで登録
        </button>




        {/* 種目 */}
        <label>
          <span className="field__label">種目</span>

          <select
            className="input"
            value={exerciseMode === "select" ? form.name : "__custom__"}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__custom__") {
                setExerciseMode("custom");
                setForm({ ...form, name: "" });
              } else {
                setExerciseMode("select");
                setForm({ ...form, name: v });
              }
            }}
          >
            <option value="" disabled>
              種目を選択
            </option>

            {exercises.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}

            <option value="__custom__">その他（自由入力）</option>
          </select>

          {exerciseMode === "custom" && (
            <input
              type="text"
              className="input"
              placeholder="種目名を自由入力"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ marginTop: 8 }}
            />
          )}
        </label>

        {/* 重さ */}
        <label>
          <span className="field__label">重さ</span>

          <select
            className="input"
            value={form.weight}
            onChange={(e) => {
              const v = e.target.value;
              setForm({ ...form, weight: v });
              if (v !== "__custom__") setWeightCustom("");
            }}
          >
            <option value="" disabled>
              重さを選択
            </option>

            {weights.map((w) => (
              <option key={w} value={w}>
                {w} kg
              </option>
            ))}

            <option value="__custom__">その他（自由入力）</option>
          </select>

          {form.weight === "__custom__" && (
            <input
              type="number"
              className="input"
              placeholder="例：102.5"
              step="0.5"
              value={weightCustom}
              onChange={(e) => setWeightCustom(e.target.value)}
              style={{ marginTop: 8 }}
            />
          )}
        </label>

        {/* 回数 / セット */}
        <div className="grid2">
          <label>
            <span className="field__label">回数</span>
            <input
              type="number"
              className="input"
              value={form.reps}
              onChange={(e) => setForm({ ...form, reps: e.target.value })}
            />
          </label>

          <label>
            <span className="field__label">セット数</span>
            <input
              type="number"
              className="input"
              value={form.sets}
              onChange={(e) => setForm({ ...form, sets: e.target.value })}
            />
          </label>
        </div>

        <button className="btn btn--primary" type="submit">
          追加
        </button>
      </form>
    </details>
  );


}


