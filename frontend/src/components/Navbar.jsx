import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Compass,
  BookOpen,
  Smile,
  Activity,
  Users,
  CheckSquare,
  HeartHandshake,
  HelpCircle,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  Menu,
  X,
  Plus,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';

export default function Navbar({ capacityData, onRefresh }) {
  const {
    currentView,
    setCurrentView,
    logout,
    setSmartCaptureOpen,
    setRebalanceModalOpen,
    setActiveRebalancePlan
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [lifeAreasOpen, setLifeAreasOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const score = capacityData?.capacity_score || 65;
  const status = capacityData?.status || 'Moderate load';

  // Fresh Botanical Forest & Amber status colors
  const getCapacityColor = (s) => {
    if (s < 40) return '#1F6B4F'; // fresh forest
    if (s < 70) return '#2E855F'; // vibrant emerald
    if (s < 85) return '#D97706'; // honey amber
    return '#DC2626'; // clear coral rose
  };
  const color = getCapacityColor(score);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass, group: 'main' },
    { id: 'academic', label: 'Academic & Focus', icon: BookOpen, desc: 'FYP thesis, coursework, focus blocks', group: 'life' },
    { id: 'mood', label: 'Mood & Stress', icon: Smile, desc: 'Daily bandwidth check-in & trend', group: 'life' },
    { id: 'physical', label: 'Physical & Sleep', icon: Activity, desc: 'Sleep debt & workout intensity', group: 'life' },
    { id: 'social', label: 'Social & Errands', icon: Users, desc: 'Everyday chores & social commitments', group: 'life' },
    { id: 'tasks', label: 'All Tasks', icon: CheckSquare, group: 'main' },
    { id: 'recovery', label: 'Recovery', icon: HeartHandshake, group: 'main' },
    { id: 'whatif', label: 'What-If', icon: HelpCircle, group: 'main' },
  ];

  const isLifeAreaActive = ['academic', 'mood', 'physical', 'social'].includes(currentView);

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    setLifeAreasOpen(false);
  };

  const handleTriggerOverload = async () => {
    setDemoLoading(true);
    try {
      await api.triggerDemoOverload();
      setDemoMenuOpen(false);
      setMobileMenuOpen(false);
      if (onRefresh) await onRefresh();
      const plan = await api.simulateRebalance();
      setActiveRebalancePlan(plan);
      setRebalanceModalOpen(true);
    } catch (e) {
      console.error(e);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleResetBaseline = async () => {
    setDemoLoading(true);
    try {
      await api.resetDemoBaseline();
      setDemoMenuOpen(false);
      setMobileMenuOpen(false);
      if (onRefresh) await onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#D2E2D8] transition-all">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center space-x-3">
              {/* Mobile Sidebar Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[#4A675E] hover:text-[#152F26] hover:bg-[#EDF3EE] transition-colors cursor-pointer border border-[#D2E2D8]"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div
                className="flex items-center space-x-2.5 cursor-pointer shrink-0 group"
                onClick={() => handleNavigate('dashboard')}
              >
                <div className="relative">
                  <img
                    src="/logo_symbol_transparent.png"
                    alt="Lumora Logo"
                    className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base font-black text-[#152F26] tracking-tight">LUMORA</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-[#E3F2E9] text-[#1F6B4F] border border-[#C2E2D0] shadow-2xs">
                      Autopilot
                    </span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-[#638379] font-semibold hidden sm:block">
                    Workload & Recovery
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-1 bg-[#E4ECE7] p-1 rounded-2xl border border-[#D2E2D8]">
              {/* Dashboard */}
              <button
                onClick={() => handleNavigate('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentView === 'dashboard'
                    ? 'bg-white text-[#152F26] font-bold shadow-xs border border-[#C2E2D0]'
                    : 'text-[#4A675E] hover:text-[#152F26] hover:bg-white/60'
                  }`}
              >
                <Compass className={`w-3.5 h-3.5 ${currentView === 'dashboard' ? 'text-[#1F6B4F]' : 'text-[#638379]'}`} />
                <span>Dashboard</span>
              </button>

              {/* Life Areas Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLifeAreasOpen(!lifeAreasOpen)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isLifeAreaActive
                      ? 'bg-white text-[#152F26] font-bold shadow-xs border border-[#C2E2D0]'
                      : 'text-[#4A675E] hover:text-[#152F26] hover:bg-white/60'
                    }`}
                >
                  <SlidersHorizontal className={`w-3.5 h-3.5 ${isLifeAreaActive ? 'text-[#1F6B4F]' : 'text-[#638379]'}`} />
                  <span>Life Areas</span>
                  <ChevronDown className={`w-3 h-3 text-[#638379] transition-transform ${lifeAreasOpen ? 'rotate-180' : ''}`} />
                </button>

                {lifeAreasOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#D2E2D8] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-1.5 border-b border-[#EDF3EE] text-[10px] font-bold text-[#638379] uppercase tracking-wider">
                      Categories
                    </div>
                    <div className="p-1 space-y-1">
                      {navItems.filter(i => i.group === 'life').map((cat) => {
                        const Icon = cat.icon;
                        const isCatActive = currentView === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => handleNavigate(cat.id)}
                            className={`w-full text-left flex items-start space-x-2.5 p-2 rounded-xl transition-all cursor-pointer ${isCatActive ? 'bg-[#E3F2E9] text-[#152F26] border border-[#C2E2D0]' : 'hover:bg-[#EDF3EE] text-[#152F26]'
                              }`}
                          >
                            <div className="p-1.5 rounded-lg bg-white border border-[#D2E2D8] text-[#1F6B4F] shrink-0 mt-0.5 shadow-2xs">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-tight">{cat.label}</p>
                              <p className="text-[10px] text-[#638379] leading-tight mt-0.5">{cat.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Tasks */}
              <button
                onClick={() => handleNavigate('tasks')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentView === 'tasks'
                    ? 'bg-white text-[#152F26] font-bold shadow-xs border border-[#C2E2D0]'
                    : 'text-[#4A675E] hover:text-[#152F26] hover:bg-white/60'
                  }`}
              >
                <CheckSquare className={`w-3.5 h-3.5 ${currentView === 'tasks' ? 'text-[#1F6B4F]' : 'text-[#638379]'}`} />
                <span>All Tasks</span>
              </button>

              {/* Recovery */}
              <button
                onClick={() => handleNavigate('recovery')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentView === 'recovery'
                    ? 'bg-white text-[#152F26] font-bold shadow-xs border border-[#C2E2D0]'
                    : 'text-[#4A675E] hover:text-[#152F26] hover:bg-white/60'
                  }`}
              >
                <HeartHandshake className={`w-3.5 h-3.5 ${currentView === 'recovery' ? 'text-[#1F6B4F]' : 'text-[#638379]'}`} />
                <span>Recovery</span>
              </button>
            </nav>

            {/* Right Action Area */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Live Capacity Pill */}
              <div
                onClick={() => handleNavigate('dashboard')}
                className="cursor-pointer flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#D2E2D8] bg-white hover:border-[#ABC8B7] transition-all text-xs shadow-2xs group"
              >
                <span className="relative flex h-2 w-2">
                  <span
                    style={{ backgroundColor: color }}
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  />
                  <span
                    style={{ backgroundColor: color }}
                    className="relative inline-flex rounded-full h-2 w-2"
                  />
                </span>
                <span className="font-bold text-[#152F26]">{score}%</span>
                <span className="text-[#638379] text-[11px] font-medium hidden sm:inline">{status}</span>
              </div>

              {/* Smart Capture Button */}
              <button
                onClick={() => setSmartCaptureOpen(true)}
                className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#1F6B4F] hover:bg-[#16533D] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D1F0DE]" />
                <span className="hidden sm:inline">Capture Task</span>
                <span className="sm:hidden text-xs">Capture</span>
              </button>

              {/* Desktop Demo Script Dropdown */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-[#D2E2D8] bg-white hover:bg-[#EDF3EE] text-[#152F26] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  title="Hackathon Demo Script"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#638379]" />
                  <span className="hidden xl:inline">Demo Script</span>
                  <ChevronDown className="w-3 h-3 text-[#638379]" />
                </button>

                {demoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#D2E2D8] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-[#EDF3EE]">
                      <p className="text-xs font-bold text-[#152F26]">Demo Flow Triggers</p>
                      <p className="text-[11px] text-[#638379]">Jump between the 7-step story</p>
                    </div>
                    <div className="p-1 space-y-1">
                      <button
                        onClick={handleTriggerOverload}
                        disabled={demoLoading}
                        className="w-full text-left flex items-start space-x-2.5 p-2 rounded-xl hover:bg-[#FDF2F0] transition-colors cursor-pointer group"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#DC2626] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-xs font-bold text-[#152F26]">1. Simulate 91% Overload</p>
                          <p className="text-[11px] text-[#638379]">Adds FYP, shift, birthday & groceries</p>
                        </div>
                      </button>

                      <button
                        onClick={handleResetBaseline}
                        disabled={demoLoading}
                        className="w-full text-left flex items-start space-x-2.5 p-2 rounded-xl hover:bg-[#E3F2E9] transition-colors cursor-pointer group"
                      >
                        <RotateCcw className="w-4 h-4 text-[#1F6B4F] mt-0.5 shrink-0 group-hover:-rotate-45 transition-transform" />
                        <div>
                          <p className="text-xs font-bold text-[#152F26]">2. Reset to Monday (68%)</p>
                          <p className="text-[11px] text-[#638379]">Restores Alex's manageable baseline</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-1.5 rounded-xl text-[#638379] hover:text-[#152F26] hover:bg-[#EDF3EE] transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Collapsible Sidebar Drawer in Fresh Botanical Palette */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-[#152F26]/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Sidebar Content */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            {/* Sidebar Header */}
            <div className="p-5 border-b border-[#D2E2D8] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img
                  src="/logo_symbol_transparent.png"
                  alt="Lumora"
                  className="h-8 w-auto object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-base font-black text-[#152F26] tracking-tight">LUMORA</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#1F6B4F]">
                    Burnout Autopilot
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-[#638379] hover:text-[#152F26] hover:bg-[#EDF3EE] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Capacity Mini-Card in Mobile Sidebar */}
            <div className="px-5 py-3 bg-[#EDF3EE] border-b border-[#D2E2D8]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#152F26]">Alex Chen</p>
                  <p className="text-[10px] text-[#638379]">Weekly Energy Budget</p>
                </div>
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white border border-[#D2E2D8] shadow-2xs">
                  <span style={{ backgroundColor: color }} className="w-2 h-2 rounded-full" />
                  <span className="text-xs font-bold text-[#152F26]">{score}%</span>
                </div>
              </div>
            </div>

            {/* Navigation Links Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Core Navigation */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#638379] px-3 block mb-1">
                  Main Views
                </span>
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Compass },
                  { id: 'tasks', label: 'All Tasks & Schedule', icon: CheckSquare },
                  { id: 'recovery', label: 'Recovery', icon: HeartHandshake },
                  { id: 'whatif', label: 'What-If Simulator', icon: HelpCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                          ? 'bg-[#E3F2E9] text-[#152F26] font-bold border border-[#C2E2D0]'
                          : 'text-[#4A675E] hover:bg-[#EDF3EE] hover:text-[#152F26]'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#1F6B4F]' : 'text-[#638379]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-[#1F6B4F]" />}
                    </button>
                  );
                })}
              </div>

              {/* Life Areas Navigation */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#638379] px-3 block mb-1">
                  Life Areas
                </span>
                {navItems.filter(i => i.group === 'life').map((cat) => {
                  const Icon = cat.icon;
                  const isActive = currentView === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleNavigate(cat.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                          ? 'bg-[#E3F2E9] text-[#152F26] font-bold border border-[#C2E2D0]'
                          : 'text-[#4A675E] hover:bg-[#EDF3EE] hover:text-[#152F26]'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#1F6B4F]' : 'text-[#638379]'}`} />
                        <span>{cat.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-[#1F6B4F]" />}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Quick Demo Triggers */}
              <div className="pt-2 border-t border-[#D2E2D8] space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#638379] px-3 block">
                  Demo Shortcuts
                </span>
                <button
                  onClick={handleTriggerOverload}
                  disabled={demoLoading}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-[#FDF2F0] text-[#DC2626] text-xs font-semibold hover:bg-[#FCE6E2] transition-colors cursor-pointer border border-[#F5D0CA]"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                  <span>Simulate 91% Overload</span>
                </button>
                <button
                  onClick={handleResetBaseline}
                  disabled={demoLoading}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-[#EDF3EE] text-[#152F26] text-xs font-semibold hover:bg-[#E3F2E9] transition-colors cursor-pointer border border-[#D2E2D8]"
                >
                  <RotateCcw className="w-4 h-4 shrink-0 text-[#1F6B4F]" />
                  <span>Reset to Monday (68%)</span>
                </button>
              </div>
            </div>

            {/* Sidebar Bottom Footer */}
            <div className="p-4 border-t border-[#D2E2D8] space-y-2.5 bg-[#EDF3EE]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSmartCaptureOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-[#1F6B4F] hover:bg-[#16533D] text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D1F0DE]" />
                <span>Smart Capture Task</span>
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-[#638379] hover:text-[#DC2626] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

