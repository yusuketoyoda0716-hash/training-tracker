import { useMemo, useState } from "react";
import DayPage from "./components/DayPage";
import EntryForm from "./components/EntryForm";
import MonthCalendar from "./components/MonthCalendar";
import RecentDays from "./components/RecentDays";
import PresetManager from "./components/PresetManager";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { addDays, parseDate, today } from "./lib/dates";
import { makeSampleData } from "./lib/sample";

// localStorage のキー（以前のバージョンと同じ。保存済みの記録はそのまま読み込める）
const STORAGE_KEY = "trainings";
const EXERCISES_KEY = "exercises";
const WEIGHTS_KEY = "weights";
const PRESETS_KEY = "presets_v1";

// ユニークIDを生成する（Safari等 randomUUID 未対応環境に対応）
function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// 重さの初期選択肢（2.5kg 刻みで 100kg まで）
function defaultWeights() {
  const list = [];
  for (let w = 2.5; w <= 100; w += 2.5) list.push(Number(w.toFixed(1)));
  return list;
}

const emptyRow = () => ({ exercise: "", weight: 0, reps: 10, sets: 3 });
const newDraft = () => ({ id: `p_${Date.now()}`, name: "", items: [emptyRow()] });

export default function App() {
  // ── 保存するデータ ─────────────────────────
  const [trainings, setTrainings] = useLocalStorage(STORAGE_KEY, []);
  const [exercises, setExercises] = useLocalStorage(EXERCISES_KEY, ["ベンチプレス", "スクワット", "デッドリフト"]);
  const [weights, setWeights] = useLocalStorage(WEIGHTS_KEY, defaultWeights());
  const [presets, setPresets] = useLocalStorage(PRESETS_KEY, []);

  // ── 画面の状態 ──────────────────────────────
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [presetDraft, setPresetDraft] = useState(newDraft);
  const [activePresetId, setActivePresetId] = useState(null);
  const [presetStatus, setPresetStatus] = useState("");

  // 表示する日を変える（カレンダーの月も合わせる）
  function goTo(date) {
    setSelectedDate(date);
    const d = parseDate(date);
    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  // ── 記録の操作 ─────────────────────────────

  function addEntries(rows) {
    const newOnes = rows.map((r) => ({
      id: makeId(),
      date: selectedDate,
      name: r.name,
      weight: r.weight,
      reps: r.reps,
      sets: r.sets,
      totalReps: r.reps * r.sets,
    }));
    setTrainings((prev) => [...prev, ...newOnes]);

    // 新しい種目・重さは次から選べるように候補へ追加
    const names = newOnes.map((t) => t.name).filter((n) => !exercises.includes(n));
    if (names.length) setExercises((prev) => [...new Set([...prev, ...names])]);
    const ws = newOnes.map((t) => t.weight).filter((w) => w > 0 && !weights.includes(w));
    if (ws.length) setWeights((prev) => [...new Set([...prev, ...ws])].sort((a, b) => a - b));
  }

  function addFromPreset(presetId) {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    addEntries(
      preset.items.map((it) => ({
        name: it.exercise,
        weight: Number(it.weight) || 0,
        reps: Number(it.reps) || 10,
        sets: Number(it.sets) || 3,
      }))
    );
  }

  function removeTraining(id) {
    setTrainings((prev) => prev.filter((t) => t.id !== id));
  }

  function loadSample() {
    const sample = makeSampleData();
    setTrainings(sample.trainings);
    setPresets(sample.presets);
    setExercises((prev) => [...new Set([...prev, ...sample.exercises])]);
  }

  // ── メニュー（プリセット）の操作 ────────────────

  function presetNew() {
    setActivePresetId(null);
    setPresetDraft(newDraft());
    setPresetStatus("");
  }

  function presetLoadToDraft(id) {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setActivePresetId(p.id);
    setPresetDraft({ id: p.id, name: p.name, items: p.items.map((it) => ({ ...it })) });
    setPresetStatus("");
  }

  function presetAddRow() {
    setPresetDraft((prev) => ({ ...prev, items: [...prev.items, emptyRow()] }));
  }

  function presetRemoveRow(index) {
    setPresetDraft((prev) => {
      const next = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: next.length ? next : [emptyRow()] };
    });
  }

  function presetUpdateRow(index, key, value) {
    setPresetDraft((prev) => ({
      ...prev,
      items: prev.items.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    }));
  }

  function presetSaveDraft() {
    const name = presetDraft.name.trim();
    if (!name) return setPresetStatus("メニュー名を入力してください");

    for (let i = 0; i < presetDraft.items.length; i++) {
      const r = presetDraft.items[i];
      if (!r.exercise.trim()) return setPresetStatus(`${i + 1}行目の種目名を入力してください`);
      if (!(Number(r.weight) >= 0)) return setPresetStatus(`${i + 1}行目の重さを確認してください`);
      if (!(Number(r.reps) >= 1)) return setPresetStatus(`${i + 1}行目の回数は1以上にしてください`);
      if (!(Number(r.sets) >= 1)) return setPresetStatus(`${i + 1}行目のセット数は1以上にしてください`);
    }

    const next = {
      id: presetDraft.id,
      name,
      items: presetDraft.items.map((x) => ({
        exercise: x.exercise.trim(),
        weight: Number(x.weight) || 0,
        reps: Number(x.reps) || 10,
        sets: Number(x.sets) || 3,
      })),
    };

    setPresets((prev) => {
      const idx = prev.findIndex((p) => p.id === next.id);
      if (idx < 0) return [next, ...prev];
      const copy = [...prev];
      copy[idx] = next;
      return copy;
    });
    setActivePresetId(next.id);
    setPresetStatus(`「${name}」を保存しました`);
  }

  function presetDeleteDraft() {
    if (!activePresetId) {
      presetNew();
      return;
    }
    const target = presets.find((p) => p.id === activePresetId);
    if (!target || !confirm(`メニュー「${target.name}」を削除しますか？`)) return;
    setPresets((prev) => prev.filter((p) => p.id !== activePresetId));
    presetNew();
    setPresetStatus(`「${target.name}」を削除しました`);
  }

  // ── 表示用に計算する値 ───────────────────────

  // 日付ごとにまとめた記録（新しい日が先）
  const byDate = useMemo(() => {
    const map = new Map();
    for (const t of trainings) {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date).push(t);
    }
    return map;
  }, [trainings]);

  const recordedDates = useMemo(() => [...byDate.keys()].sort((a, b) => b.localeCompare(a)), [byDate]);
  const dayEntries = byDate.get(selectedDate) ?? [];
  const isEmptyNotebook = trainings.length === 0 && presets.length === 0;

  return (
    <div className="desk">
      <header className="masthead">
        <h1 className="masthead__title">トレーニングノート</h1>
        <p className="masthead__meta">
          {recordedDates.length > 0 ? `これまでに ${recordedDates.length} 日分を記録` : "まだ記録がありません"}
        </p>
      </header>

      <div className="spread">
        <main className="spread__main">
          <DayPage
            date={selectedDate}
            entries={dayEntries}
            onPrev={() => goTo(addDays(selectedDate, -1))}
            onNext={() => goTo(addDays(selectedDate, 1))}
            onToday={() => goTo(today())}
            isToday={selectedDate === today()}
            onDelete={removeTraining}
            emptyAction={
              isEmptyNotebook && (
                <button type="button" className="btn" onClick={loadSample}>
                  見本の記録を入れる
                </button>
              )
            }
          >
            <EntryForm
              exercises={exercises}
              weights={weights}
              presets={presets}
              onAdd={(row) => addEntries([row])}
              onAddPreset={addFromPreset}
            />
          </DayPage>
        </main>

        <aside className="spread__side">
          <MonthCalendar
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            selectedDate={selectedDate}
            todayDate={today()}
            recorded={byDate}
            onSelect={goTo}
          />

          <RecentDays dates={recordedDates.slice(0, 7)} byDate={byDate} selectedDate={selectedDate} onSelect={goTo} />
        </aside>
      </div>

      <PresetManager
        presets={presets}
        presetDraft={presetDraft}
        activePresetId={activePresetId}
        presetStatus={presetStatus}
        presetNew={presetNew}
        presetLoadToDraft={presetLoadToDraft}
        presetAddRow={presetAddRow}
        presetRemoveRow={presetRemoveRow}
        presetUpdateRow={presetUpdateRow}
        presetSaveDraft={presetSaveDraft}
        presetDeleteDraft={presetDeleteDraft}
        setPresetDraft={setPresetDraft}
      />
    </div>
  );
}
