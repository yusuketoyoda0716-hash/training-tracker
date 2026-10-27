import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, writeBatch, serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { DEFAULT_EXERCISES, defaultWeights } from "./defaults";

// Firestore のデータ構成（ユーザーごとに分ける）
//   users/{uid}/trainings/{id}   1件の記録（日付・種目・重さ・回数・セット）
//   users/{uid}/presets/{id}     メニュー
//   users/{uid}/meta/lists       種目と重さの候補
// セキュリティルールで「自分の uid 配下だけ読み書きできる」ようにしている（firestore.rules）

const BATCH_LIMIT = 450; // 1回のまとめ書きの上限（Firestore は500件まで）

const toTraining = (id, t) => ({
  id,
  date: t.date,
  name: t.name,
  weight: t.weight,
  reps: t.reps,
  sets: t.sets,
  totalReps: t.reps * t.sets,
  order: t.order ?? 0,
});

export function createFirestoreRepo(uid) {
  const col = (name) => collection(db, "users", uid, name);
  const listsRef = doc(db, "users", uid, "meta", "lists");

  async function writeInChunks(items, write) {
    for (let i = 0; i < items.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      items.slice(i, i + BATCH_LIMIT).forEach((item) => write(batch, item));
      await batch.commit();
    }
  }

  return {
    async load() {
      const [tSnap, pSnap, lists] = await Promise.all([
        getDocs(col("trainings")),
        getDocs(col("presets")),
        getDoc(listsRef),
      ]);
      const trainings = tSnap.docs
        .map((d) => toTraining(d.id, d.data()))
        // 同じ日は書き込んだ順に並べる
        .sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order);
      const presets = pSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0))
        .map((p) => ({ id: p.id, name: p.name, items: p.items }));
      const l = lists.exists() ? lists.data() : {};
      return {
        trainings,
        presets,
        exercises: l.exercises ?? DEFAULT_EXERCISES,
        weights: l.weights ?? defaultWeights(),
      };
    },

    // 記録をまとめて保存（id はアプリ側で作る。同じ id なら上書きなので二重登録にならない）
    async addTrainings(rows) {
      await writeInChunks(rows, (batch, t) => {
        batch.set(doc(col("trainings"), t.id), {
          date: t.date,
          name: t.name,
          weight: t.weight,
          reps: t.reps,
          sets: t.sets,
          order: t.order ?? Date.now(),
          createdAt: serverTimestamp(),
        });
      });
    },

    async removeTraining(id) {
      await deleteDoc(doc(col("trainings"), id));
    },

    async savePreset(p) {
      await setDoc(doc(col("presets"), p.id), {
        name: p.name,
        items: p.items,
        updatedAt: serverTimestamp(),
      });
    },

    async deletePreset(id) {
      await deleteDoc(doc(col("presets"), id));
    },

    async saveLists(lists) {
      await setDoc(listsRef, { exercises: lists.exercises, weights: lists.weights });
    },
  };
}
