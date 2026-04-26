import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as fbSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUser({ id: firebaseUser.uid, ...docSnap.data() });
        } else {
          // If the document doesn't exist, wait for signup to create it
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const docSnap = await getDoc(doc(db, 'users', cred.user.uid));
    if (docSnap.exists()) {
      setUser({ id: cred.user.uid, ...docSnap.data() });
    }
  };

  const signUp = async (email, password, displayName, username) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    
    // Generate initials from displayName
    const trimmedName = displayName.trim();
    const parts = trimmedName.split(/\\s+/);
    const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];

    const userData = {
      email,
      displayName,
      username,
      initials: initials.toUpperCase(),
      createdAt: serverTimestamp(),
      leagues: [],
      status: 'pending',
      isAdmin: false
    };

    await setDoc(doc(db, 'users', uid), userData);
    setUser({ id: uid, ...userData });
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
  };

  const isDemoMode = false;

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
