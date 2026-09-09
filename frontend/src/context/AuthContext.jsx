import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lumora_user');
      return saved ? JSON.parse(saved) : {
        id: 'demo-alex-student-001',
        name: 'Alex Chen',
        email: 'alex@lumora.edu',
        token: 'lumora-token-demo-alex-student-001'
      };
    } catch (e) {
      console.warn('Failed to parse lumora_user from localStorage, resetting:', e);
      return {
        id: 'demo-alex-student-001',
        name: 'Alex Chen',
        email: 'alex@lumora.edu',
        token: 'lumora-token-demo-alex-student-001'
      };
    }
  });
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); // landing, dashboard, academic, mood, physical, social, tasks, recovery, whatif, login, signup
  const [rebalanceModalOpen, setRebalanceModalOpen] = useState(false);
  const [smartCaptureOpen, setSmartCaptureOpen] = useState(false);
  const [activeRebalancePlan, setActiveRebalancePlan] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lumora_user', JSON.stringify(user));
      localStorage.setItem('lumora_token', user.token || `lumora-token-${user.id}`);
    } else {
      localStorage.removeItem('lumora_user');
      localStorage.removeItem('lumora_token');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setUser(data);
      setCurrentView('dashboard');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await api.signup(name, email, password);
      setUser(data);
      setCurrentView('dashboard');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      const data = await api.demoLogin();
      setUser(data);
      setCurrentView('dashboard');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const [captureInitialDate, setCaptureInitialDate] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const openCaptureWithDate = (dateStr) => {
    setCaptureInitialDate(dateStr || null);
    setSmartCaptureOpen(true);
  };

  const logout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      demoLogin,
      logout,
      currentView,
      setCurrentView,
      rebalanceModalOpen,
      setRebalanceModalOpen,
      smartCaptureOpen,
      setSmartCaptureOpen,
      activeRebalancePlan,
      setActiveRebalancePlan,
      refreshKey,
      triggerRefresh,
      captureInitialDate,
      setCaptureInitialDate,
      openCaptureWithDate,
      editingTask,
      setEditingTask
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
