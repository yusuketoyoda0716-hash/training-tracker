import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebase";
import { createFirestoreRepo } from "../data/firestoreRepo";
import { createGuestRepo } from "../data/guestRepo";

const AuthContext = createContext(null);

// ログイン状態と「データの保存先（repo）」をアプリ全体に配る
//   Googleログイン → Firestore（どの端末からでも同じ記録）
//   ゲスト         → メモリ上の見本データ（保存しない）
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [guestRepo, setGuestRepo] = useState(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const repo = useMemo(() => {
    if (guestRepo) return guestRepo;
    if (user) return createFirestoreRepo(user.uid);
    return null;
  }, [guestRepo, user]);

  const value = {
    user,
    loading,
    repo,
    isGuest: Boolean(guestRepo),
    canUseGoogle: isFirebaseConfigured,
    signInWithGoogle: () => signInWithPopup(auth, googleProvider),
    signInAsGuest: () => setGuestRepo(createGuestRepo()),
    signOut: () => (guestRepo ? setGuestRepo(null) : fbSignOut(auth)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
