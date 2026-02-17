import { useEffect, useState } from "react";

/**
 * useLocalStorage
 * - React state を localStorage と同期するカスタムフック
 * - 初回は localStorage を読み、以降は state 変更時に自動保存する
 *
 * @param {string} key localStorage のキー
 * @param {any} initialValue 初期値（localStorage に無い/壊れている場合に使う）
 * @returns {[any, Function]} [value, setValue]
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      // JSONが壊れている等のケースは初期値に戻す
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 例: 容量上限超えなど。基本は握りつぶしてUIを落とさない
    }
  }, [key, value]);

  return [value, setValue];
}
