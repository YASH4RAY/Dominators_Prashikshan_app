import React, { createContext, useState, useEffect } from 'react';
import {onAuthStateChanged, signOut} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            setRole(snap.data().role || null);
          } else {
            setRole(null);
          }
        } catch (err) {
          console.warn('AuthContext: error fetching user doc', err.message);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      if (initializing) setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Logout error:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, initializing, setRole, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

