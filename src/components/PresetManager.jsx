import { Plus, X } from "lucide-react";

// メニュー（よくやる種目の組み合わせ）を作る・直す
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
    <section className="menus" aria-labelledby="menus-title">
      <div className="menus__head">
        <h2 id="menus-title" className="menus__title">メニュー</h2>
        <p className="muted small">よくやる種目の組み合わせを登録しておくと、ページにまとめて書き込めます</p>
      </div>

      <div className="menus__body">
        <div className="menus__list">
          <button type="button" className={`menuTab${activePresetId ? "" : " is-active"}`} onClick={presetNew}>
            <Plus size={16} aria-hidden="true" />
            新しいメニュー
          </button>
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`menuTab${p.id === activePresetId ? " is-active" : ""}`}
              onClick={() => presetLoadToDraft(p.id)}
            >
              {p.name}
              <span className="menuTab__count">{p.items.length}種目</span>
            </button>
          ))}
        </div>

        <div className="menus__editor">
          <label className="field">
            <span className="field__label">メニュー名</span>
            <input
              type="text"
              className="input"
              placeholder="例：胸の日"
              value={presetDraft.name}
              onChange={(e) => setPresetDraft({ ...presetDraft, name: e.target.value })}
            />
          </label>

          <div className="menuRows" role="table" aria-label="メニューの種目">
            <div className="menuRow menuRow--head" role="row">
              <span role="columnheader">種目</span>
              <span role="columnheader">重さ(kg)</span>
              <span role="columnheader">回数</span>
              <span role="columnheader">セット</span>
              <span role="columnheader" />
            </div>
            {presetDraft.items.map((row, idx) => (
              <div className="menuRow" role="row" key={idx}>
                <input
                  className="input"
                  type="text"
                  placeholder="例：ベンチプレス"
                  value={row.exercise}
                  onChange={(e) => presetUpdateRow(idx, "exercise", e.target.value)}
                  aria-label={`${idx + 1}行目の種目`}
                />
                <label className="menuCell">
                  <span className="menuCell__label">重さ(kg)</span>
                  <input
                    className="input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={row.weight}
                    onChange={(e) => presetUpdateRow(idx, "weight", Number(e.target.value))}
                    aria-label={`${idx + 1}行目の重さ（kg）`}
                  />
                </label>
                <label className="menuCell">
                  <span className="menuCell__label">回数</span>
                  <input
                    className="input"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={row.reps}
                    onChange={(e) => presetUpdateRow(idx, "reps", Number(e.target.value))}
                    aria-label={`${idx + 1}行目の回数`}
                  />
                </label>
                <label className="menuCell">
                  <span className="menuCell__label">セット</span>
                  <input
                    className="input"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={row.sets}
                    onChange={(e) => presetUpdateRow(idx, "sets", Number(e.target.value))}
                    aria-label={`${idx + 1}行目のセット数`}
                  />
                </label>
                <button type="button" className="iconBtn" onClick={() => presetRemoveRow(idx)} aria-label={`${idx + 1}行目を消す`}>
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <div className="menus__actions">
            <button type="button" className="btn btn--quiet" onClick={presetAddRow}>
              <Plus size={16} aria-hidden="true" />
              種目を追加
            </button>
            <span className="menus__spacer" />
            {activePresetId && (
              <button type="button" className="btn btn--dangerText" onClick={presetDeleteDraft}>
                このメニューを削除
              </button>
            )}
            <button type="button" className="btn btn--pen" onClick={presetSaveDraft}>
              保存する
            </button>
          </div>

          <p className="write__msg" role="status">{presetStatus}</p>
        </div>
      </div>
    </section>
  );
}
