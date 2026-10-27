import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

// ログインに失敗したときの理由（設定ミスのときは原因が分かるように表示する）
function loginErrorMessage(code) {
  switch (code) {
    case "auth/popup-blocked":
      return "ポップアップがブロックされました。ブラウザでこのサイトのポップアップを許可してください。";
    case "auth/network-request-failed":
      return "通信できませんでした。ネットワークを確認して、もう一度お試しください。";
    case "auth/unauthorized-domain":
      return "このアドレスからのログインが許可されていません（Firebase の承認済みドメインを確認してください）。";
    case "auth/operation-not-allowed":
      return "Googleログインが有効になっていません（Firebase の設定を確認してください）。";
    default:
      return `ログインできませんでした。時間をおいてもう一度お試しください。${code ? `（${code}）` : ""}`;
  }
}

// ノートの表紙のようなログイン画面
export default function LoginPage() {
  const { signInWithGoogle, signInAsGuest, canUseGoogle } = useAuth();
  const [error, setError] = useState("");

  const onGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (e) {
      if (e?.code === "auth/popup-closed-by-user" || e?.code === "auth/cancelled-popup-request") return;
      console.error(e);
      setError(loginErrorMessage(e?.code));
    }
  };

  return (
    <div className="login">
      <div className="notecover">
        <div className="notecover__label">
          <h1 className="notecover__title">トレーニングノート</h1>
          <div className="notecover__lines" aria-hidden="true" />
        </div>

        <p className="notecover__lead">筋トレの記録を、1日1ページでつけられます。</p>

        <div className="notecover__actions">
          <button type="button" className="btn btn--pen" onClick={onGoogle} disabled={!canUseGoogle}>
            Googleでログイン
          </button>
          {!canUseGoogle && <p className="notecover__note">Firebase が未設定のため、ゲストモードのみ使えます</p>}
          {error && <p className="notecover__error" role="alert">{error}</p>}
          <button type="button" className="btn" onClick={signInAsGuest}>
            ゲストで試す
          </button>
          <p className="notecover__note">見本の記録で全機能を試せます（保存はされません）</p>
        </div>
      </div>
    </div>
  );
}
