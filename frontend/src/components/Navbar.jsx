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
  AlertTriangle
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

  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [lifeAreasOpen, setLifeAreasOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const score = capacityData?.capacity_score || 65;
  const status = capacityData?.status || 'Moderate load';

  // Soft Sage / Mint / Ivory brand status colors
  const getCapacityColor = (s) => {
    if (s < 40) return '#88A788'; // soft sage
    if (s < 70) return '#7E9F7E'; // calm muted green
    if (s < 85) return '#C89B6D'; // warm sand amber
    return '#C86D6D'; // muted rose
  };
  const color = getCapacityColor(score);

  const lifeCategories = [
    { id: 'academic', label: 'Academic & Focus', icon: BookOpen, desc: 'FYP thesis, coursework, focus blocks' },
    { id: 'mood', label: 'Mood & Stress', icon: Smile, desc: 'Daily bandwidth check-in & trend' },
    { id: 'physical', label: 'Physical & Sleep', icon: Activity, desc: 'Sleep debt & workout intensity' },
    { id: 'social', label: 'Social & Errands', icon: Users, desc: 'Everyday chores & social commitments' },
  ];

  const isLifeAreaActive = ['academic', 'mood', 'physical', 'social'].includes(currentView);

  const handleTriggerOverload = async () => {
    setDemoLoading(true);
    try {
      await api.triggerDemoOverload();
      setDemoMenuOpen(false);
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
      if (onRefresh) await onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFF7]/95 backdrop-blur-md border-b border-[#E5EAE3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo with User's Uploaded Symbol */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer shrink-0"
            onClick={() => {
              setCurrentView('dashboard');
              setLifeAreasOpen(false);
            }}
          >
            <img
              src="/logo_symbol_transparent.png"
              alt="Lumora Logo"
              className="h-10 w-auto object-contain transition-transform hover:scale-105"
            />
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black text-[#354546] tracking-tight">LUMORA</span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-[#E8EFE8] text-[#557755] border border-[#D5E2D5]">
                  Autopilot
                </span>
              </div>
              <span className="text-[8.5px] uppercase tracking-widest text-[#798990] font-bold hidden sm:block">
                Workload & Recovery Autopilot
              </span>
            </div>
          </div>

          {/* Streamlined Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-2">
            {/* Dashboard */}
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setLifeAreasOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentView === 'dashboard'
                  ? 'bg-[#E8EFE8] text-[#354546] font-bold border border-[#D3DDD0] shadow-2xs'
                  : 'text-[#55696B] hover:text-[#354546] hover:bg-[#F2F6F1]'
                }`}
            >
              <Compass className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-[#6E8E6E]' : 'text-[#8A9B9D]'}`} />
              <span>Dashboard</span>
            </button>

            {/* Life Areas Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLifeAreasOpen(!lifeAreasOpen)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isLifeAreaActive
                    ? 'bg-[#E8EFE8] text-[#354546] font-bold border border-[#D3DDD0] shadow-2xs'
                    : 'text-[#55696B] hover:text-[#354546] hover:bg-[#F2F6F1]'
                  }`}
              >
                <SlidersHorizontal className={`w-4 h-4 ${isLifeAreaActive ? 'text-[#6E8E6E]' : 'text-[#8A9B9D]'}`} />
                <span>Life Areas</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8A9B9D] transition-transform ${lifeAreasOpen ? 'rotate-180' : ''}`} />
              </button>

              {lifeAreasOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E5EAE3] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Categories
                  </div>
                  <div className="p-1 space-y-1">
                    {lifeCategories.map((cat) => {
                      const Icon = cat.icon;
                      const isCatActive = currentView === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setCurrentView(cat.id);
                            setLifeAreasOpen(false);
                          }}
                          className={`w-full text-left flex items-start space-x-2.5 p-2 rounded-xl transition-all cursor-pointer ${isCatActive ? 'bg-[#E8EFE8] text-[#354546]' : 'hover:bg-[#F4F8F3] text-slate-700'
                            }`}
                        >
                          <div className="p-1.5 rounded-lg bg-[#F0F5EF] text-[#6E8E6E] shrink-0 mt-0.5">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">{cat.label}</p>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{cat.desc}</p>
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
              onClick={() => {
                setCurrentView('tasks');
                setLifeAreasOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentView === 'tasks'
                  ? 'bg-[#E8EFE8] text-[#354546] font-bold border border-[#D3DDD0] shadow-2xs'
                  : 'text-[#55696B] hover:text-[#354546] hover:bg-[#F2F6F1]'
                }`}
            >
              <CheckSquare className={`w-4 h-4 ${currentView === 'tasks' ? 'text-[#6E8E6E]' : 'text-[#8A9B9D]'}`} />
              <span>All Tasks</span>
            </button>

            {/* Recovery */}
            <button
              onClick={() => {
                setCurrentView('recovery');
                setLifeAreasOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentView === 'recovery'
                  ? 'bg-[#E8EFE8] text-[#354546] font-bold border border-[#D3DDD0] shadow-2xs'
                  : 'text-[#55696B] hover:text-[#354546] hover:bg-[#F2F6F1]'
                }`}
            >
              <HeartHandshake className={`w-4 h-4 ${currentView === 'recovery' ? 'text-[#6E8E6E]' : 'text-[#8A9B9D]'}`} />
              <span>Recovery</span>
            </button>

            {/* What-If */}
            <button
              onClick={() => {
                setCurrentView('whatif');
                setLifeAreasOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentView === 'whatif'
                  ? 'bg-[#E8EFE8] text-[#354546] font-bold border border-[#D3DDD0] shadow-2xs'
                  : 'text-[#55696B] hover:text-[#354546] hover:bg-[#F2F6F1]'
                }`}
            >
              <HelpCircle className={`w-4 h-4 ${currentView === 'whatif' ? 'text-[#6E8E6E]' : 'text-[#8A9B9D]'}`} />
              <span>What-If</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Anti-Streak Sanctuary Badge */}


            {/* Live Capacity Pill in New Sage Style */}
            <div
              onClick={() => setCurrentView('dashboard')}
              className="cursor-pointer flex items-center space-x-2 px-3 py-1.5 rounded-full border border-[#DFE5DC] bg-[#F8FAF6] hover:bg-[#EEF4EC] transition-all text-xs shadow-2xs"
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
              <span className="font-bold text-[#354546]">{score}%</span>
              <span className="text-[#6C7E80] text-[11px] font-medium hidden sm:inline">{status}</span>
            </div>

            {/* Smart Capture Button in Soft Sage Green */}
            <button
              onClick={() => setSmartCaptureOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#88A788] hover:bg-[#759475] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#EBF4EB]" />
              <span className="hidden sm:inline">Smart Capture</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Demo Script Dropdown in Ivory White */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-[#DFD9C0] bg-[#F4F1E5] hover:bg-[#ECE7D6] text-[#354546] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Hackathon Demo Script"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#798990]" />
                <span className="hidden xl:inline">Demo Script</span>
                <ChevronDown className="w-3 h-3 text-[#798990]" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E5EAE3] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">Demo Flow Triggers</p>
                    <p className="text-[11px] text-slate-500">Jump between the 7-step story</p>
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      onClick={handleTriggerOverload}
                      disabled={demoLoading}
                      className="w-full text-left flex items-start space-x-2.5 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer group"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">1. Simulate 91% Overload</p>
                        <p className="text-[11px] text-slate-500">Adds FYP, shift, birthday & groceries</p>
                      </div>
                    </button>

                    <button
                      onClick={handleResetBaseline}
                      disabled={demoLoading}
                      className="w-full text-left flex items-start space-x-2.5 p-2 rounded-xl hover:bg-[#F0F5EF] transition-colors cursor-pointer group"
                    >
                      <RotateCcw className="w-4 h-4 text-[#88A788] mt-0.5 shrink-0 group-hover:-rotate-45 transition-transform" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">2. Reset to Monday (68%)</p>
                        <p className="text-[11px] text-slate-500">Restores Alex's manageable baseline</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="lg:hidden flex items-center space-x-1 py-2 overflow-x-auto no-scrollbar border-t border-[#E5EAE3] text-xs">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Compass },
            { id: 'academic', label: 'Academic', icon: BookOpen },
            { id: 'mood', label: 'Mood', icon: Smile },
            { id: 'physical', label: 'Physical', icon: Activity },
            { id: 'social', label: 'Social', icon: Users },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'recovery', label: 'Recovery', icon: HeartHandshake },
            { id: 'whatif', label: 'What-If', icon: HelpCircle },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${isActive
                    ? 'bg-[#88A788] text-white font-bold shadow-2xs'
                    : 'text-[#55696B] hover:bg-[#F2F6F1] font-medium'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
