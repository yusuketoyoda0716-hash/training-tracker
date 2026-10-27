import { addDays, today } from "./dates";

// 初めて開いた人向けの見本データ（今日から数日さかのぼった記録）
export function makeSampleData() {
  const t = today();
  let n = 0;
  const row = (daysAgo, name, weight, reps, sets) => ({
    id: `sample_${++n}`,
    date: addDays(t, -daysAgo),
    name,
    weight,
    reps,
    sets,
    totalReps: reps * sets,
  });

  const trainings = [
    row(0, "ベンチプレス", 60, 10, 3),
    row(0, "インクラインダンベルプレス", 20, 10, 3),
    row(0, "ダンベルフライ", 12, 12, 3),
    row(2, "スクワット", 80, 8, 3),
    row(2, "レッグプレス", 120, 12, 3),
    row(2, "レッグカール", 35, 12, 3),
    row(4, "デッドリフト", 100, 5, 3),
    row(4, "ラットプルダウン", 45, 10, 3),
    row(4, "シーテッドロー", 40, 10, 3),
    row(7, "ベンチプレス", 57.5, 10, 3),
    row(7, "ダンベルフライ", 12, 12, 3),
    row(9, "スクワット", 77.5, 8, 3),
    row(11, "デッドリフト", 95, 5, 3),
    row(14, "ベンチプレス", 57.5, 8, 3),
    row(16, "スクワット", 75, 8, 3),
  ];

  const presets = [
    {
      id: "sample_p1",
      name: "胸の日",
      items: [
        { exercise: "ベンチプレス", weight: 60, reps: 10, sets: 3 },
        { exercise: "インクラインダンベルプレス", weight: 20, reps: 10, sets: 3 },
        { exercise: "ダンベルフライ", weight: 12, reps: 12, sets: 3 },
      ],
    },
    {
      id: "sample_p2",
      name: "脚の日",
      items: [
        { exercise: "スクワット", weight: 80, reps: 8, sets: 3 },
        { exercise: "レッグプレス", weight: 120, reps: 12, sets: 3 },
        { exercise: "レッグカール", weight: 35, reps: 12, sets: 3 },
      ],
    },
  ];

  const exercises = [...new Set(trainings.map((t) => t.name))];
  return { trainings, presets, exercises };
}
