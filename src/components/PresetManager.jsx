export default function PresetManager({
  presets,
  presetDraft,
  activePresetId,
  presetStatus,
  presetNew,
  presetLoadToDraft,
  presetAddRow,
  presetRemoveRow,
  presetUpdateRow,
  presetSaveDraft,
  presetDeleteDraft,
  setPresetDraft,
}) {
  return (
    <details className="panel">
      <summary className="panel__summary">プリセット管理（作成・編集）</summary>

      <div className="preset-panel__body">
        {/* 左：プリセット一覧 */}
        <section className="preset-list">
          <div className="preset-list__header">
            <h3>プリセット一覧</h3>
            <button type="button" className="btn" onClick={presetNew}>
              ＋ 新規
            </button>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {presets.length === 0 ? (
              <li style={{ color: "#666" }}>（まだプリセットがありません）</li>
            ) : (
              presets.map((p) => (
                <li key={p.id} style={{ marginBottom: 8 }}>
                  <button
                    type="button"
                    className={`preset-list__btn ${
                      p.id === activePresetId ? "is-active" : ""
                    }`}
                    onClick={() => presetLoadToDraft(p.id)}
                  >
                    <div className="preset-list__name">{p.name}</div>
                    <div className="preset-list__meta">{p.items.length}種目</div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* 右：編集エリア */}
        <section className="preset-editor">
          <h3>編集</h3>

          <label>
            <span className="field__label">プリセット名</span>
            <input
              type="text"
              className="input"
              placeholder="例：胸の日"
              value={presetDraft.name}
              onChange={(e) =>
                setPresetDraft({ ...presetDraft, name: e.target.value })
              }
            />
          </label>

          <div className="preset-editor__rows-head">
            <span>種目名</span>
            <span>重さ</span>
            <span>回数</span>
            <span></span>
          </div>

          <div>
            {presetDraft.items.map((row, idx) => (
              <div className="preset-row" key={idx}>
                <input
                  className="input"
                  type="text"
                  placeholder="例：ベンチプレス"
                  value={row.exercise}
                  onChange={(e) => presetUpdateRow(idx, "exercise", e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={row.weight}
                  onChange={(e) =>
                    presetUpdateRow(idx, "weight", Number(e.target.value))
                  }
                />
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  value={row.reps}
                  onChange={(e) =>
                    presetUpdateRow(idx, "reps", Number(e.target.value))
                  }
                />
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => presetRemoveRow(idx)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="preset-editor__actions">
            <button type="button" className="btn btn--sub" onClick={presetAddRow}>
              ＋ 種目追加
            </button>

            <div>
              <button
                type="button"
                className="btn btn--danger"
                onClick={presetDeleteDraft}
              >
                削除
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={presetSaveDraft}
              >
                保存
              </button>
            </div>
          </div>

          <p className="preset-status">{presetStatus}</p>
        </section>
      </div>
    </details>
  );
}
