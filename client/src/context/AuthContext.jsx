import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import api from '../utils/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const saveUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const { data } = await api.post('/auth/firebase', { idToken });
    saveUser(data.user, data.token);
    return data;
  };

  const loginWithEmail = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveUser(data.user, data.token);
    return data;
  };

  const registerWithEmail = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    saveUser(data.user, data.token);
    return data;
  };

  const logout = async () => {
    await signOut(auth).catch(() => {});
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateUserState,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
