import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserDoc } from './types';

interface AuthContextValue {
  user: User | null;
  userDoc: UserDoc | null;
  initializing: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setUserDoc(null);
        setInitializing(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setUserDoc(
          snapshot.exists() ? (snapshot.data() as UserDoc) : null
        );
        setInitializing(false);
      },
      () => setInitializing(false)
    );
    return unsubscribe;
  }, [user]);

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    await updateProfile(credential.user, { displayName: displayName.trim() });
    const newUserDoc: UserDoc = {
      uid: credential.user.uid,
      displayName: displayName.trim(),
      email: email.trim(),
      householdId: null,
    };
    await setDoc(doc(db, 'users', credential.user.uid), newUserDoc);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, userDoc, initializing, signUp, signIn, signOut }),
    [user, userDoc, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
