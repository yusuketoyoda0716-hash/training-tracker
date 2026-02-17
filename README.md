# Training Tracker

トレーニングを記録・管理できるWebアプリです。

 公開URL  
https://training-tracker-three.vercel.app

---

##  使用技術

- React (Vite)
- JavaScript (ES6+)
- CSS（レスポンシブ対応）
- localStorage
- Git / GitHub
- Vercel（デプロイ）

---

##  主な機能

- トレーニング追加 / 削除
- 日付フィルター表示
- カレンダー表示（月切替）
- プリセット作成 / 編集 / 一括登録
- データの自動保存（localStorage）
- スマホ対応レスポンシブUI

---

## 工夫したポイント

- コンポーネント分割による責務分離
- useMemoによるパフォーマンス最適化
- カスタムHook（useLocalStorage）作成
- モバイルUI最適化

---

## ローカル起動方法

```bash
npm install
npm run dev
