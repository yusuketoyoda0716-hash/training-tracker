import { useMemo, useState } from "react";
import { LogOut } from "lucide-react";
import DayPage from "./components/DayPage";
import EntryForm from "./components/EntryForm";
import MonthCalendar from "./components/MonthCalendar";
import RecentDays from "./components/RecentDays";
import PresetManager from "./components/PresetManager";
import ImportBanner from "./components/ImportBanner";
import { useAuth } from "./auth/AuthContext";
import { useNotebook } from "./hooks/useNotebook";
import { addDays, parseDate, today } from "./lib/dates";

// ユニークIDを生成する（Safari等 randomUUID 未対応環境に対応）
function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const emptyRow = () => ({ exercise: "", weight: 0, reps: 10, sets: 3 });
const newDraft = () => ({ id: `p_${Date.now()}`, name: "", items: [emptyRow()] });

export default function Notebook() {
  const { user, isGuest, repo, signOut } = useAuth();
  const { data, error, addTrainings, removeTraining, savePreset, deletePreset, importLocal } = useNotebook(repo);

  // ── 画面の状態 ──────────────────────────────
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [presetDraft, setPresetDraft] = useState(newDraft);
  const [activePresetId, setActivePresetId] = useState(null);
  const [presetStatus, setPresetStatus] = useState("");

  const trainings = useMemo(() => data?.trainings ?? [], [data]);
  const presets = data?.presets ?? [];

  // 表示する日を変える（カレンダーの月も合わせる）
  function goTo(date) {
    setSelectedDate(date);
    const d = parseDate(date);
    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  // ── 記録の操作 ─────────────────────────────

  function addEntries(rows) {
    const base = Date.now();
    addTrainings(
      rows.map((r, i) => ({
        id: makeId(),
        date: selectedDate,
        name: r.name,
        weight: r.weight,
        reps: r.reps,
        sets: r.sets,
        totalReps: r.reps * r.sets,
        order: base + i,
      }))
    );
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
    savePreset(next);
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
    deletePreset(activePresetId);
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

  const header = (
    <header className="masthead">
      <h1 className="masthead__title">トレーニングノート</h1>
      <div className="masthead__account">
        <span className="masthead__meta">
          {isGuest ? "ゲストモード（見本の記録・保存されません）" : user?.email}
        </span>
        <button type="button" className="btn btn--small btn--quiet" onClick={signOut}>
          <LogOut size={15} aria-hidden="true" />
          {isGuest ? "ゲストモードを終了" : "ログアウト"}
        </button>
      </div>
    </header>
  );

  if (!data) {
    return (
      <div className="desk">
        {header}
        <p className={error ? "notice notice--error" : "notice"} role="status">
          {error || "ノートを開いています…"}
        </p>
      </div>
    );
  }

  return (
    <div className="desk">
      {header}

      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {!isGuest && user && <ImportBanner uid={user.uid} onImport={importLocal} />}

      <p className="masthead__count">
        {recordedDates.length > 0 ? `これまでに ${recordedDates.length} 日分を記録` : "まだ記録がありません。今日のページから書き始めましょう。"}
      </p>

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
          >
            <EntryForm
              exercises={data.exercises}
              weights={data.weights}
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
