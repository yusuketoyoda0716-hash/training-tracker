import { useState } from "react";
import { readLocalData, isImportDone, markImportDone } from "../data/localData";

// ログインなしの頃にこの端末へ保存していた記録があれば、アカウントに移すか聞く
export default function ImportBanner({ uid, onImport }) {
  const [local] = useState(() => (isImportDone(uid) ? null : readLocalData()));
  const [state, setState] = useState("ask"); // ask | working | done | hidden
  const [message, setMessage] = useState("");

  if (!local || local.trainings.length === 0 || state === "hidden") return null;

  const doImport = async () => {
    setState("working");
    try {
      const n = await onImport(local);
      markImportDone(uid);
      setMessage(n > 0 ? `${n}件の記録をアカウントに移しました。` : "移す記録はありませんでした（すでに移してあります）。");
      setState("done");
    } catch (e) {
      console.error(e);
      setMessage("移せませんでした。通信状況を確認して、もう一度お試しください。");
      setState("ask");
    }
  };

  const skip = () => {
    markImportDone(uid);
    setState("hidden");
  };

  return (
    <div className="notice notice--action" role="status">
      {state === "done" ? (
        <>
          <span>{message}</span>
          <button type="button" className="btn btn--small btn--quiet" onClick={() => setState("hidden")}>閉じる</button>
        </>
      ) : (
        <>
          <span>
            この端末に、ログインなしで保存した記録が {local.trainings.length} 件あります。アカウントに移すと、ほかの端末からも見られます。
            {message && <strong className="notice__error"> {message}</strong>}
          </span>
          <span className="notice__actions">
            <button type="button" className="btn btn--small btn--quiet" onClick={skip} disabled={state === "working"}>移さない</button>
            <button type="button" className="btn btn--small btn--pen" onClick={doImport} disabled={state === "working"}>
              {state === "working" ? "移しています…" : "アカウントに移す"}
            </button>
          </span>
        </>
      )}
    </div>
  );
}
