import { useState } from "react";

const CUSTOM = "__custom__";

// ページの下の「書き込み欄」。種目と重さは一覧から選ぶか自由に入力する
export default function EntryForm({ exercises, weights, presets, onAdd, onAddPreset }) {
  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [weight, setWeight] = useState("");
  const [customWeight, setCustomWeight] = useState("");
  const [reps, setReps] = useState("10");
  const [sets, setSets] = useState("3");
  const [presetId, setPresetId] = useState("");
  const [message, setMessage] = useState({ text: "", error: false });

  const submit = (e) => {
    e.preventDefault();
    const exercise = (name === CUSTOM ? customName : name).trim();
    const w = Number(weight === CUSTOM ? customWeight : weight);
    const r = Number(reps);
    const s = Number(sets);

    if (!exercise) return setMessage({ text: "種目を選ぶか入力してください", error: true });
    if (weight === "" || !(w >= 0)) return setMessage({ text: "重さを選んでください（自重なら0kg）", error: true });
    if (!(r >= 1) || !(s >= 1)) return setMessage({ text: "回数とセット数は1以上にしてください", error: true });

    onAdd({ name: exercise, weight: w, reps: r, sets: s });
    setMessage({ text: `${exercise}を書き込みました`, error: false });
    setName(name === CUSTOM ? exercise : name);
    setCustomName("");
  };

  const addPreset = () => {
    const p = presets.find((x) => x.id === presetId);
    if (!p) return;
    onAddPreset(presetId);
    setMessage({ text: `メニュー「${p.name}」の${p.items.length}種目を書き込みました`, error: false });
  };

  // 自由入力した種目は一覧に追加されるので、選択状態をその名前に切り替える
  const nameOptions = name && name !== CUSTOM && !exercises.includes(name) ? [...exercises, name] : exercises;

  return (
    <div className="write">
      <form className="write__form" onSubmit={submit}>
        <label className="field write__name">
          <span className="field__label">種目</span>
          <select className="input" value={name} onChange={(e) => setName(e.target.value)}>
            <option value="" disabled>種目を選ぶ</option>
            {nameOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
            <option value={CUSTOM}>新しい種目を入力…</option>
          </select>
          {name === CUSTOM && (
            <input
              className="input"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="例：ショルダープレス"
              aria-label="新しい種目名"
              autoFocus
            />
          )}
        </label>

        <label className="field">
          <span className="field__label">重さ</span>
          <select className="input" value={weight} onChange={(e) => setWeight(e.target.value)}>
            <option value="" disabled>kg</option>
            <option value="0">自重（0kg）</option>
            {weights.map((w) => (
              <option key={w} value={w}>{w} kg</option>
            ))}
            <option value={CUSTOM}>その他…</option>
          </select>
          {weight === CUSTOM && (
            <input
              className="input"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              value={customWeight}
              onChange={(e) => setCustomWeight(e.target.value)}
              placeholder="102.5"
              aria-label="重さ（kg）"
            />
          )}
        </label>

        <label className="field">
          <span className="field__label">回数</span>
          <input className="input" type="number" inputMode="numeric" min="1" value={reps} onChange={(e) => setReps(e.target.value)} />
        </label>

        <label className="field">
          <span className="field__label">セット</span>
          <input className="input" type="number" inputMode="numeric" min="1" value={sets} onChange={(e) => setSets(e.target.value)} />
        </label>

        <button type="submit" className="btn btn--pen write__submit">書き込む</button>
      </form>

      {presets.length > 0 && (
        <div className="write__preset">
          <select className="input" value={presetId} onChange={(e) => setPresetId(e.target.value)} aria-label="メニュー">
            <option value="">メニューからまとめて書き込む</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}（{p.items.length}種目）</option>
            ))}
          </select>
          <button type="button" className="btn" onClick={addPreset} disabled={!presetId}>
            まとめて書き込む
          </button>
        </div>
      )}

      <p className={`write__msg${message.error ? " is-error" : ""}`} role="status">{message.text}</p>
    </div>
  );
}
