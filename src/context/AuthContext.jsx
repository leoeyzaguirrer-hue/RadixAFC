import { createContext, useState, useEffect } from 'react';

let auth = null;
let firebaseAuth = null;

try {
  const config = await import('../config/firebaseConfig');
  auth = config.auth;
  firebaseAuth = await import('firebase/auth');
} catch {
  console.warn('Firebase not configured — auth disabled');
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!auth);

  useEffect(() => {
    if (!auth || !firebaseAuth) return;
    const unsubscribe = firebaseAuth.onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          nombre: firebaseUser.displayName || '',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (!auth || !firebaseAuth) throw new Error('Firebase not configured');
    const result = await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const register = async (email, password, codigo) => {
    if (!auth || !firebaseAuth) throw new Error('Firebase not configured');
    // TODO: Validate invitation code in Firestore before creating user
    const result = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const logout = async () => {
    if (!auth || !firebaseAuth) return;
    await firebaseAuth.signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
