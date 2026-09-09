import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Smile,
  Activity,
  Users,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import CapacityCard from '../components/CapacityCard';
import LoadBreakdown from '../components/LoadBreakdown';
import TodayTimeline from '../components/TodayTimeline';
import CategoryCard from '../components/CategoryCard';
import CalendarView from '../components/CalendarView';

export default function DashboardPage() {
  const {
    setSmartCaptureOpen,
    setRebalanceModalOpen,
    setActiveRebalancePlan,
    refreshKey,
    triggerRefresh
  } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadDashboard = async () => {
    try {
      const [data, tasks] = await Promise.all([
        api.getDashboard(),
        api.getTasks()
      ]);
      setDashboardData(data);
      setAllTasks(tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    const nextProgress = nextStatus === 'completed' ? 100 : 50;

    if (nextStatus === 'completed') {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#88A788', '#B3E8C0', '#F4F1E5']
      });
    }

    try {
      await api.updateTask(task.id, {
        status: nextStatus,
        progress: nextProgress
      });
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [refreshKey]);

  const handleTriggerRebalance = async () => {
    try {
      const plan = await api.simulateRebalance();
      setActiveRebalancePlan(plan);
      setRebalanceModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickOverload = async () => {
    try {
      await api.triggerDemoOverload();
      await loadDashboard();
      const plan = await api.simulateRebalance();
      setActiveRebalancePlan(plan);
      setRebalanceModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickReset = async () => {
    try {
      await api.resetDemoBaseline();
      await loadDashboard();
      setActionSuccess('Restored Alex to Monday baseline (68% capacity)');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#88A788] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#67787A]">Measuring your workload capacity...</p>
      </div>
    );
  }

  const studentName = dashboardData.student_name || 'Alex Chen';
  const capacity = dashboardData.capacity;
  const todayTasks = dashboardData.today_tasks || [];
  const totalPending = dashboardData.total_pending_count || 0;
  const suggestedAction = dashboardData.suggested_action;
  const latestCheckin = dashboardData.latest_checkin;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Top Greeting & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#354546] tracking-tight">
            Good day, {studentName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#798990] mt-0.5">
            Here is your combined cognitive, academic, and physical capacity.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setSmartCaptureOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#88A788] hover:bg-[#759475] active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-[#88A788]/20 flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EDFFEE]" />
            <span>Smart Capture Task</span>
          </button>
        </div>
      </div>

      {/* Temporary Success Toast */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0F6EF] border border-[#D5E4D4] text-[#335533] text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#88A788]" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-[#557755] hover:underline">Dismiss</button>
        </div>
      )}

      {/* Hero Workload Capacity Card */}
      <CapacityCard
        capacity={capacity}
        onRebalanceTrigger={() => loadDashboard()}
      />

      {/* Suggested Rebalancing Banner (If overloaded or high) in Warm Ivory */}
      {suggestedAction && !suggestedAction.is_applied && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF7EE] border border-[#E8E2CF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#F0EAD6] text-[#635536] border border-[#E2D9C0]">
                Suggested Action
              </span>
              <span className="text-xs font-bold text-[#354546]">
                {suggestedAction.headline}
              </span>
            </div>
            <p className="text-xs text-[#5D6B6D] leading-relaxed">
              {suggestedAction.detail}
            </p>
            <p className="text-[11px] font-semibold text-[#5F825F]">
              {suggestedAction.impact}
            </p>
          </div>

          <button
            onClick={handleTriggerRebalance}
            className="whitespace-nowrap px-5 py-3 rounded-2xl bg-[#88A788] hover:bg-[#759475] active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-[#88A788]/20 flex items-center space-x-2 cursor-pointer"
          >
            <span>Rebalance My Week</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rebalanced Confirmation Banner */}
      {suggestedAction && suggestedAction.is_applied && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#F0F6EF] border border-[#D5E4D4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E8EFE8] text-[#557755] flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#E2ECE0] text-[#3E5C3E] border border-[#CADBC9]">
                  Schedule Protected
                </span>
                <span className="text-xs font-bold text-[#354546]">
                  {suggestedAction.headline}
                </span>
              </div>
              <p className="text-xs text-[#5D6B6D]">
                {suggestedAction.detail}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#557755] whitespace-nowrap bg-white/90 px-3 py-1.5 rounded-xl border border-[#D5E4D4] shadow-2xs">
            {suggestedAction.impact}
          </span>
        </div>
      )}

      {/* Calendar View Module */}
      <CalendarView
        tasks={allTasks}
        selectedCategory="all"
        toggleComplete={toggleComplete}
        handleDelete={handleDelete}
        onAddTask={() => setSmartCaptureOpen(true)}
      />

      {/* Category Navigation Cards in Soft Harmonious Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CategoryCard
          id="academic"
          title="Academic"
          subtitle="FYP thesis, quiz, labs"
          icon={BookOpen}
          color="#5B7B88"
          bgLight="#EFF4F6"
          metric={`${Math.round(capacity.breakdown?.academic || 42)}% load`}
          badge="High Focus"
        />

        <CategoryCard
          id="mood"
          title="Mood & Stress"
          subtitle="Stress 3/5, mood stable"
          icon={Smile}
          color="#88A788"
          bgLight="#F0F6EF"
          metric={`Level ${latestCheckin?.stress || 3}/5`}
          badge="Steady"
        />

        <CategoryCard
          id="physical"
          title="Physical & Sleep"
          subtitle={`${latestCheckin?.sleep_hours || 6.8}h sleep, workouts`}
          icon={Activity}
          color="#6E9A75"
          bgLight="#F0F7F1"
          metric={`${latestCheckin?.sleep_hours || 6.8} hrs`}
          badge={latestCheckin?.sleep_hours < 7 ? 'Slight Deficit' : 'Optimal'}
        />

        <CategoryCard
          id="social"
          title="Social & Errands"
          subtitle="Groceries, apartment, meetup"
          icon={Users}
          color="#B88A58"
          bgLight="#FAF6EE"
          metric={`${Math.round((capacity.breakdown?.social || 12) + (capacity.breakdown?.errands || 8))}% load`}
          badge="Flexible"
        />
      </div>

      {/* Mid Section: Today Timeline (Rule of 3) and Load Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <TodayTimeline
            tasks={todayTasks}
            totalCount={totalPending}
            onTaskUpdated={() => loadDashboard()}
          />
        </div>

        <div className="lg:col-span-5">
          <LoadBreakdown
            breakdown={capacity.breakdown}
          />
        </div>
      </div>

      {/* Demo Scenario Shortcuts Bar for Judges */}
      <div className="p-4 rounded-2xl bg-[#F4F6F2] border border-[#E0E6DE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-[#5D6F71]">
          <span className="font-bold text-[#354546]">Hackathon Demo Controls:</span>
          <span>Quickly walk through the full narrative flow</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleQuickOverload}
            className="px-3 py-1.5 rounded-xl bg-[#C87E60] hover:bg-[#B57053] text-white font-semibold transition-all cursor-pointer shadow-2xs flex items-center space-x-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate 91% Overload</span>
          </button>
          <button
            onClick={handleQuickReset}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8FAF6] border border-[#D8DFD6] text-[#354546] font-semibold transition-all cursor-pointer flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#88A788]" />
            <span>Reset to Baseline (68%)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
