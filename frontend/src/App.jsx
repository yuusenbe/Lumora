import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './api/client';
import Navbar from './components/Navbar';
import SmartCaptureModal from './components/SmartCaptureModal';
import RebalanceModal from './components/RebalanceModal';
import WhatIfSidebarChat from './components/WhatIfSidebarChat';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AcademicPage from './pages/AcademicPage';
import MoodPage from './pages/MoodPage';
import PhysicalPage from './pages/PhysicalPage';
import SocialErrandsPage from './pages/SocialErrandsPage';
import AllTasksPage from './pages/AllTasksPage';
import RecoveryPage from './pages/RecoveryPage';
import WhatIfPage from './pages/WhatIfPage';

function MainApp() {
  const {
    user,
    currentView,
    smartCaptureOpen,
    setSmartCaptureOpen,
    rebalanceModalOpen,
    setRebalanceModalOpen,
    activeRebalancePlan,
    refreshKey,
    triggerRefresh
  } = useAuth();

  const [capacityData, setCapacityData] = useState(null);
  const [whatIfSidebarOpen, setWhatIfSidebarOpen] = useState(false);

  const fetchCapacity = async () => {
    try {
      const data = await api.getDashboard();
      if (data && data.capacity) {
        setCapacityData(data.capacity);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user && currentView !== 'landing' && currentView !== 'login' && currentView !== 'signup') {
      fetchCapacity();
    }
  }, [user, currentView, refreshKey]);

  const isPublicPage = currentView === 'landing' || currentView === 'login' || currentView === 'signup';

  return (
    <div className="min-h-screen bg-[#EBF7E9] flex flex-col selection:bg-[#E3F2E9] selection:text-[#152F26]">
      {/* Top Navigation */}
      {!isPublicPage && (
        <Navbar
          capacityData={capacityData}
          onRefresh={fetchCapacity}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'login' && <LoginPage />}
        {currentView === 'signup' && <SignupPage />}
        {currentView === 'dashboard' && <DashboardPage />}
        {currentView === 'academic' && <AcademicPage />}
        {currentView === 'mood' && <MoodPage />}
        {currentView === 'physical' && <PhysicalPage />}
        {currentView === 'social' && <SocialErrandsPage />}
        {currentView === 'tasks' && <AllTasksPage />}
        {currentView === 'recovery' && <RecoveryPage />}
        {currentView === 'whatif' && <WhatIfPage />}
      </main>

      {/* Floating What-If Chat Assistant & Slide-over for Website / Tab screen */}
      {!isPublicPage && (
        <WhatIfSidebarChat
          isOpen={whatIfSidebarOpen}
          onToggle={() => setWhatIfSidebarOpen(!whatIfSidebarOpen)}
          onClose={() => setWhatIfSidebarOpen(false)}
        />
      )}

      {/* Global Modals */}
      <SmartCaptureModal
        isOpen={smartCaptureOpen}
        onClose={() => setSmartCaptureOpen(false)}
        onTaskCreated={() => {
          fetchCapacity();
          triggerRefresh();
        }}
      />

      <RebalanceModal
        isOpen={rebalanceModalOpen}
        onClose={() => setRebalanceModalOpen(false)}
        plan={activeRebalancePlan}
        onApplied={() => {
          fetchCapacity();
          triggerRefresh();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
