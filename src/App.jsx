import { AuthProvider, useAuth } from "./auth/AuthContext";
import LoginPage from "./components/LoginPage";
import Notebook from "./Notebook";

// ログイン（またはゲスト）するまではログイン画面、したらノートを表示
function Gate() {
  const { loading, repo, user, isGuest } = useAuth();
  if (loading) return null; // ログイン状態を確認している間は何も出さない（チラつき防止）
  if (!repo) return <LoginPage />;
  // 使う人が変わったら（ゲスト⇔ログイン、別のアカウント）ノートを作り直す
  return <Notebook key={isGuest ? "guest" : user.uid} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
