import { DEFAULT_EXERCISES, defaultWeights } from "./defaults";

// 以前のバージョン（ログインなし）が localStorage に保存していたデータを読む
// ログイン後に「この端末の記録をアカウントに移す」ときに使う
const KEYS = { trainings: "trainings", exercises: "exercises", weights: "weights", presets: "presets_v1" };

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function readLocalData() {
  const trainings = read(KEYS.trainings, []);
  return {
    trainings: Array.isArray(trainings) ? trainings : [],
    presets: read(KEYS.presets, []),
    exercises: read(KEYS.exercises, DEFAULT_EXERCISES),
    weights: read(KEYS.weights, defaultWeights()),
  };
}

// アカウントに移したか（または「移さない」を選んだか）をユーザーごとに覚えておく
const doneKey = (uid) => `tt:localImportDone:${uid}`;

export function isImportDone(uid) {
  try {
    return localStorage.getItem(doneKey(uid)) === "1";
  } catch {
    return true;
  }
}

export function markImportDone(uid) {
  try {
    localStorage.setItem(doneKey(uid), "1");
  } catch {
    // 保存できなくても動作には影響しない
  }
}
