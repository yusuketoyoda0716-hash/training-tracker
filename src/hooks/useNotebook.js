import { useEffect, useState } from "react";

// ノートのデータ（記録・メニュー・種目と重さの候補）を読み込み、変更を保存先へ書き込む
// 画面はすぐ更新し（楽観的更新）、保存は裏で行う
export function useNotebook(repo) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    repo
      .load()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError("記録を読み込めませんでした。通信状況を確認して、ページを再読み込みしてください。");
      });
    return () => { cancelled = true; };
  }, [repo]);

  const persist = (promise) =>
    promise.catch((e) => {
      console.error(e);
      setError("保存できませんでした。通信状況を確認して、もう一度お試しください。");
    });

  function addTrainings(rows) {
    // 新しい種目・重さは次から選べるように候補へ追加
    const exercises = [...new Set([...data.exercises, ...rows.map((r) => r.name)])];
    const weights = [...new Set([...data.weights, ...rows.map((r) => r.weight).filter((w) => w > 0)])].sort((a, b) => a - b);
    const listsChanged = exercises.length !== data.exercises.length || weights.length !== data.weights.length;

    setData((d) => ({ ...d, trainings: [...d.trainings, ...rows], exercises, weights }));
    persist(repo.addTrainings(rows));
    if (listsChanged) persist(repo.saveLists({ exercises, weights }));
  }

  function removeTraining(id) {
    setData((d) => ({ ...d, trainings: d.trainings.filter((t) => t.id !== id) }));
    persist(repo.removeTraining(id));
  }

  function savePreset(p) {
    setData((d) => {
      const exists = d.presets.some((x) => x.id === p.id);
      return { ...d, presets: exists ? d.presets.map((x) => (x.id === p.id ? p : x)) : [p, ...d.presets] };
    });
    persist(repo.savePreset(p));
  }

  function deletePreset(id) {
    setData((d) => ({ ...d, presets: d.presets.filter((x) => x.id !== id) }));
    persist(repo.deletePreset(id));
  }

  // この端末に保存されていた記録をまとめて取り込む（同じ id は上書きなので二重にならない）
  async function importLocal(local) {
    const ids = new Set(data.trainings.map((t) => t.id));
    const rows = local.trainings
      .filter((t) => t && t.date && t.name && !ids.has(t.id))
      .map((t, i) => ({
        id: t.id,
        date: t.date,
        name: t.name,
        weight: Number(t.weight) || 0,
        reps: Number(t.reps) || 1,
        sets: Number(t.sets) || 1,
        totalReps: (Number(t.reps) || 1) * (Number(t.sets) || 1),
        order: i,
      }));
    const presets = (local.presets || []).filter((p) => !data.presets.some((x) => x.id === p.id));
    const exercises = [...new Set([...data.exercises, ...(local.exercises || [])])];
    const weights = [...new Set([...data.weights, ...(local.weights || [])])].sort((a, b) => a - b);

    await repo.addTrainings(rows);
    await Promise.all(presets.map((p) => repo.savePreset(p)));
    await repo.saveLists({ exercises, weights });
    setData((d) => ({
      ...d,
      trainings: [...d.trainings, ...rows],
      presets: [...presets, ...d.presets],
      exercises,
      weights,
    }));
    return rows.length;
  }

  return { data, error, addTrainings, removeTraining, savePreset, deletePreset, importLocal };
}
