import { createContext, useState, useEffect } from 'react';

let auth = null;
let firebaseAuth = null;
let db = null;
let firestoreFns = null;

try {
  const config = await import('../config/firebaseConfig');
  auth = config.auth;
  db = config.db;
  firebaseAuth = await import('firebase/auth');
  firestoreFns = await import('firebase/firestore');
} catch {
  console.warn('Firebase not configured — auth disabled');
}

export const AuthContext = createContext(null);

const DEFAULT_PROFILE = {
  name: '',
  lastName: '',
  country: '',
  profession: '',
  university: '',
  avatarColor: '#0552a0',
  profileCompleted: false,
  active: true,
  supervisorAccess: false,
};

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading]         = useState(!!auth);

  // Load profile from Firestore for a given uid
  async function loadProfile(uid) {
    if (!db || !firestoreFns) return;
    try {
      const { doc, getDoc } = firestoreFns;
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        setUserProfile({ ...DEFAULT_PROFILE, ...snap.data() });
      }
    } catch (err) {
      console.warn('Error loading profile:', err);
    }
  }

  useEffect(() => {
    if (!auth || !firebaseAuth) return;
    const unsubscribe = firebaseAuth.onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid:    firebaseUser.uid,
          email:  firebaseUser.email,
          nombre: firebaseUser.displayName || '',
        });
        await loadProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(DEFAULT_PROFILE);
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

  const register = async (email, password) => {
    if (!auth || !firebaseAuth) throw new Error('Firebase not configured');
    const result = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const logout = async () => {
    if (!auth || !firebaseAuth) return;
    await firebaseAuth.signOut(auth);
    setUserProfile(DEFAULT_PROFILE);
  };

  // Update profile in Firestore and local state
  const updateProfile = async (data) => {
    if (!db || !firestoreFns || !auth?.currentUser) return;
    const uid = auth.currentUser.uid;
    const { doc, setDoc } = firestoreFns;
    const updated = { ...userProfile, ...data };
    // Auto-set profileCompleted
    if (updated.name?.trim() && updated.lastName?.trim()) {
      updated.profileCompleted = true;
    } else {
      updated.profileCompleted = false;
    }
    await setDoc(doc(db, 'users', uid), updated, { merge: true });
    setUserProfile(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, userProfile, login, register, logout, updateProfile, loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
