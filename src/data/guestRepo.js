import { makeSampleData } from "../lib/sample";
import { defaultWeights } from "./defaults";

// ゲストモード用：Firestore と同じ形の API を持ち、データはメモリ上だけに置く
// （見本の記録から始まり、リロードすると見本に戻る）
export function createGuestRepo() {
  const sample = makeSampleData();
  const data = {
    trainings: sample.trainings,
    presets: sample.presets,
    exercises: sample.exercises,
    weights: defaultWeights(),
  };

  return {
    async load() {
      return structuredClone(data);
    },
    async addTrainings(rows) {
      data.trainings = [...data.trainings, ...rows];
    },
    async removeTraining(id) {
      data.trainings = data.trainings.filter((t) => t.id !== id);
    },
    async savePreset(p) {
      data.presets = [p, ...data.presets.filter((x) => x.id !== p.id)];
    },
    async deletePreset(id) {
      data.presets = data.presets.filter((x) => x.id !== id);
    },
    async saveLists(lists) {
      data.exercises = lists.exercises;
      data.weights = lists.weights;
    },
  };
}
