import { useMemo, useState } from "react";
import Calendar from "./components/Calendar";
import PresetManager from "./components/PresetManager";
import TrainingForm from "./components/TrainingForm";
import TrainingList from "./components/TrainingList";
import DateFilter from "./components/DateFilter";
import Header from "./components/Header";
import { useLocalStorage } from "./hooks/useLocalStorage";

const STORAGE_KEY = "trainings";
const EXERCISES_KEY = "exercises";
const WEIGHTS_KEY = "weights";
const PRESETS_KEY = "presets_v1";

function toDateString(year, monthIndex0, day) {
  return `${year}-${String(monthIndex0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function App() {
  // ✅ Safari等でも落ちないID生成（randomUUID未対応のフォールバック）
  function makeId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  // =========================
  // ① トレーニング
  // =========================
  const [trainings, setTrainings] = useLocalStorage(STORAGE_KEY, []);

  // =========================
  // ② 種目候補
  // =========================
  const [exercises, setExercises] = useLocalStorage(EXERCISES_KEY, [
    "ベンチプレス",
    "スクワット",
    "デッドリフト",
  ]);

  // 種目入力モード
  const [exerciseMode, setExerciseMode] = useState("select"); // "select" | "custom"

  // =========================
  // ③ 重さ候補
  // =========================
  const defaultWeights = () => {
    const initial = [];
    for (let w = 2.5; w <= 100; w += 2.5) initial.push(Number(w.toFixed(1)));
    return initial;
  };

  const [weights, setWeights] = useLocalStorage(WEIGHTS_KEY, defaultWeights());

  // 重さ自由入力用（selectが__custom__の時だけ使う）
  const [weightCustom, setWeightCustom] = useState("");

  // =========================
  // ④ プリセット（★Hooksは全部App内！）
  // =========================
  const [presets, setPresets] = useLocalStorage(PRESETS_KEY, []);

  const [presetDraft, setPresetDraft] = useState(() => ({
    id: `p_${Date.now()}`,
    name: "",
    items: [{ exercise: "", weight: 0, reps: 10, sets: 3 }],
  }));

  const [activePresetId, setActivePresetId] = useState(null);
  const [presetStatus, setPresetStatus] = useState("");

  // =========================
  // ⑤ 画面状態（絞り込み/フォーム）
  // =========================
  const [selectedDate, setSelectedDate] = useState("");

  // ===== カレンダー：表示している月（前月/次月で変える）=====
  const [calendarBaseDate, setCalendarBaseDate] = useState(() => new Date());

  const [form, setForm] = useState(() => {
    const now = new Date();
    const todayStr = toDateString(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      date: todayStr,
      name: "",
      weight: "",
      reps: "10",
      sets: "3",
    };
  });

  // ===== トレーニング追加フォーム：選択中プリセット =====
  const [trainingPresetId, setTrainingPresetId] = useState("");

  // =========================
  // ⑥ トレーニング操作
  // =========================
  function removeTraining(id) {
    setTrainings((prev) => prev.filter((t) => t.id !== id));
  }

  function addTraining(e) {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const date = form.date;

    // 重さ：selectが__custom__なら weightCustom を使う
    const weightValue =
      form.weight === "__custom__" ? Number(weightCustom) : Number(form.weight);

    if (!date || !trimmedName || !weightValue) {
      alert("日付・種目・重さを入力してください");
      return;
    }
    if (weightValue <= 0) {
      alert("重さを正しく入力してください");
      return;
    }

    // 新規種目は候補に追加
    if (!exercises.includes(trimmedName)) {
      setExercises((prev) => [...prev, trimmedName]);
    }

    // 新規重さは候補に追加
    if (!weights.includes(weightValue)) {
      setWeights((prev) => [...prev, weightValue].sort((a, b) => a - b));
    }

    const reps = Number(form.reps);
    const sets = Number(form.sets);

    const newTraining = {
      id: makeId(), // ✅ ここを修正
      date,
      name: trimmedName,
      weight: weightValue,
      reps,
      sets,
      totalReps: reps * sets,
    };

    setTrainings((prev) => [newTraining, ...prev]);
    setSelectedDate(date);

    // フォーム初期化（dateは残す）
    setForm({
      date,
      name: "",
      weight: "",
      reps: "10",
      sets: "3",
    });
    setWeightCustom("");
    setExerciseMode("select");
  }

  function registerPresetTraining() {
    if (!form.date) {
      alert("日付を選択してください");
      return;
    }
    if (!trainingPresetId) {
      alert("プリセットを選択してください");
      return;
    }

    const preset = presets.find((p) => p.id === trainingPresetId);
    if (!preset) {
      alert("プリセットが見つかりません");
      return;
    }

    const newTrainings = preset.items.map((item) => {
      const reps = Number(item.reps) || 10;
      const sets = Number(item.sets) || 3;
      const weight = Number(item.weight) || 0;

      return {
        id: makeId(), // ✅ ここを修正
        date: form.date,
        name: item.exercise,
        weight,
        reps,
        sets,
        totalReps: reps * sets,
      };
    });

    setTrainings((prev) => [...newTrainings, ...prev]);
    setSelectedDate(form.date);

    alert(`プリセット「${preset.name}」を登録しました`);
  }

  // =========================
  // ⑦ プリセット操作
  // =========================
  function presetNew() {
    setActivePresetId(null);
    setPresetDraft({
      id: `p_${Date.now()}`,
      name: "",
      items: [{ exercise: "", weight: 0, reps: 10, sets: 3 }],
    });
    setPresetStatus("新規プリセットを作成中");
  }

  function presetLoadToDraft(id) {
    const p = presets.find((x) => x.id === id);
    if (!p) return;

    setActivePresetId(p.id);
    setPresetDraft({
      id: p.id,
      name: p.name,
      items: p.items.map((it) => ({ ...it })),
    });
    setPresetStatus(`編集中：${p.name}`);
  }

  function presetAddRow() {
    setPresetDraft((prev) => ({
      ...prev,
      items: [...prev.items, { exercise: "", weight: 0, reps: 10, sets: 3 }],
    }));
  }

  function presetRemoveRow(index) {
    setPresetDraft((prev) => {
      const next = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: next.length ? next : [{ exercise: "", weight: 0, reps: 10, sets: 3 }],
      };
    });
  }

  function presetUpdateRow(index, key, value) {
    setPresetDraft((prev) => {
      const items = prev.items.map((row, i) => (i === index ? { ...row, [key]: value } : row));
      return { ...prev, items };
    });
  }

  function presetSaveDraft() {
    const name = presetDraft.name.trim();
    if (!name) return alert("プリセット名を入力してください");

    for (let i = 0; i < presetDraft.items.length; i++) {
      const r = presetDraft.items[i];
      if (!r.exercise.trim()) return alert(`種目名が空です（${i + 1}行目）`);
      if (!(Number(r.weight) >= 0)) return alert(`重さが不正です（${i + 1}行目）`);
      if (!(Number(r.reps) >= 1)) return alert(`回数が不正です（${i + 1}行目）`);
    }

    const nextPreset = {
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
      const idx = prev.findIndex((p) => p.id === nextPreset.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = nextPreset;
        return copy;
      }
      return [nextPreset, ...prev];
    });

    setActivePresetId(nextPreset.id);
    setPresetStatus(`保存しました：${name}`);
  }

  function presetDeleteDraft() {
    if (!activePresetId) {
      if (!confirm("入力中の内容をクリアしますか？")) return;
      presetNew();
      return;
    }

    const target = presets.find((p) => p.id === activePresetId);
    if (!target) return;

    if (!confirm(`「${target.name}」を削除しますか？`)) return;

    setPresets((prev) => prev.filter((p) => p.id !== activePresetId));
    setActivePresetId(null);
    presetNew();
    setPresetStatus("削除しました");
  }

  // =========================
  // ⑧ 一覧・カレンダー
  // =========================
  const trainingDateSet = useMemo(() => new Set(trainings.map((t) => t.date)), [trainings]);

  const calendarDays = useMemo(() => {
    const year = calendarBaseDate.getFullYear();
    const month = calendarBaseDate.getMonth(); // 0始まり
    const last = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: last }, (_, i) => {
      const day = i + 1;
      const dateStr = toDateString(year, month, day);
      return {
        day,
        dateStr,
        hasData: trainingDateSet.has(dateStr),
        isSelected: selectedDate === dateStr,
      };
    });
  }, [trainingDateSet, selectedDate, calendarBaseDate]);

  const groupedAll = useMemo(() => {
    const map = {};
    trainings.forEach((t) => {
      map[t.date] ??= [];
      map[t.date].push(t);
    });
    return Object.keys(map)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({ date, items: map[date] }));
  }, [trainings]);

  const filteredItems = useMemo(
    () => trainings.filter((t) => t.date === selectedDate),
    [trainings, selectedDate]
  );

  // =========================
  // 画面
  // =========================
  return (
    <div className="app">
      <Header />

      {/* 日付で表示 */}
      <DateFilter selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      {/* トレーニング追加 */}
      <TrainingForm
        form={form}
        setForm={setForm}
        addTraining={addTraining}
        exercises={exercises}
        exerciseMode={exerciseMode}
        setExerciseMode={setExerciseMode}
        weights={weights}
        weightCustom={weightCustom}
        setWeightCustom={setWeightCustom}
        presets={presets}
        trainingPresetId={trainingPresetId}
        setTrainingPresetId={setTrainingPresetId}
        onRegisterPreset={registerPresetTraining}
      />

      {/* プリセット管理 */}
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

      {/* 一覧 */}
      <TrainingList
        selectedDate={selectedDate}
        filteredItems={filteredItems}
        groupedAll={groupedAll}
        removeTraining={removeTraining}
      />

      {/* カレンダー */}
      <Calendar
        calendarBaseDate={calendarBaseDate}
        setCalendarBaseDate={setCalendarBaseDate}
        calendarDays={calendarDays}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </div>
  );
}
