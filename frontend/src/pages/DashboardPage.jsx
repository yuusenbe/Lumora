import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  Smile,
  Activity,
  Users,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Filter,
  Clock,
  Shield,
  Calendar as CalendarIcon,
  PieChart,
  X,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import CapacityCard from '../components/CapacityCard';
import LoadBreakdown from '../components/LoadBreakdown';
import CategoryCard from '../components/CategoryCard';
import MiniMonthCalendar from '../components/MiniMonthCalendar';
import WeeklyTimelineCalendar from '../components/WeeklyTimelineCalendar';

export default function DashboardPage() {
  const {
    setSmartCaptureOpen,
    setRebalanceModalOpen,
    setActiveRebalancePlan,
    openCaptureWithDate,
    refreshKey,
    triggerRefresh,
    setEditingTask
  } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [isLoadBreakdownModalOpen, setIsLoadBreakdownModalOpen] = useState(false);

  // Calendar State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [calendarMonthDate, setCalendarMonthDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

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
        colors: ['#1F6B4F', '#2E855F', '#BCE7CD']
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

  // Group tasks by date for calendar dot indicators
  const tasksByDate = useMemo(() => {
    const map = {};
    const now = new Date();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    allTasks.forEach((t) => {
      let dateKey = t.scheduled_date;
      if (!dateKey && t.deadline) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(t.deadline)) {
          dateKey = t.deadline;
        } else {
          const dl = t.deadline.trim().toLowerCase();
          if (dl === 'today' || dl === 'tonight') {
            dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          } else if (dl === 'tomorrow') {
            const tom = new Date(now);
            tom.setDate(tom.getDate() + 1);
            dateKey = `${tom.getFullYear()}-${String(tom.getMonth() + 1).padStart(2, '0')}-${String(tom.getDate()).padStart(2, '0')}`;
          } else {
            const currentDow = now.getDay();
            daysOfWeek.forEach((dayName, idx) => {
              if (dl.includes(dayName)) {
                let delta = (idx - currentDow + 7) % 7;
                if (delta === 0 && dl.includes('next')) delta = 7;
                const d = new Date(now);
                d.setDate(d.getDate() + delta);
                dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              }
            });
          }
        }
      }
      if (!dateKey) {
        dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      }
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(t);
    });
    return map;
  }, [allTasks]);

  // Next upcoming or active focus task for the highlight reminder card
  const nextFocusTask = useMemo(() => {
    const todayList = tasksByDate[selectedDateStr] || allTasks;
    const pending = todayList.filter(t => t.status !== 'completed');
    return pending[0] || allTasks.find(t => t.status !== 'completed') || null;
  }, [tasksByDate, selectedDateStr, allTasks]);

  if (loading || !dashboardData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#1F6B4F] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#638379]">Measuring your workload capacity...</p>
      </div>
    );
  }

  const studentName = dashboardData.student_name || 'Alex Chen';
  const firstName = studentName.split(' ')[0] || 'Alex';
  const capacity = dashboardData.capacity;
  const todayTasks = dashboardData.today_tasks || [];
  const totalPending = dashboardData.total_pending_count || 0;
  const suggestedAction = dashboardData.suggested_action;
  const latestCheckin = dashboardData.latest_checkin;

  return (
    <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 lg:px-7 py-6 space-y-6 animate-in fade-in">
      {/* 1. Bento Top Header: Hi Alex + 4 Category Cards + View More Load Breakdown Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 items-stretch">
        {/* Container 1: Hi Alex Greeting & Smart Capture */}
        <div
          style={{
            background: 'linear-gradient(135deg, #185A41 0%, #1F6B4F 50%, #124835 100%)',
            borderColor: '#17553E'
          }}
          className="relative overflow-hidden p-4 sm:p-4.5 rounded-2xl text-white border flex flex-col justify-between space-y-3 shadow-xs"
        >
          {/* Aurora Aura Glowing Background Effects */}
          <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-[#86EFAC]/25 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-[#38BDF8]/20 blur-lg pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-[#FACC15]/15 blur-md pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
              Hi {firstName} 👋
            </h1>
            <p className="text-[11px] text-[#D1F0DE] mt-0.5 line-clamp-2">
              Real-time cognitive energy envelope.
            </p>
          </div>
          <button
            onClick={() => setSmartCaptureOpen(true)}
            className="relative z-10 bg-white hover:bg-[#EDF3EE] active:scale-98 text-[#152F26] px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer w-full"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1F6B4F]" />
            <span>Capture Task</span>
          </button>
        </div>

        {/* Container 2: Academic */}
        <CategoryCard
          id="academic"
          title="Academic"
          subtitle="FYP thesis, quiz, labs"
          icon={BookOpen}
          color="#2B6CB0"
          bgLight="#EBF4FB"
          metric={`${Math.round(capacity.breakdown?.academic || 42)}% load`}
          badge="High Focus"
        />

        {/* Container 3: Mood & Stress */}
        <CategoryCard
          id="mood"
          title="Mood & Stress"
          subtitle={`Stress ${latestCheckin?.stress || 3}/5, stable`}
          icon={Smile}
          color="#705898"
          bgLight="#F3EFF9"
          metric={`Level ${latestCheckin?.stress || 3}/5`}
          badge="Steady"
        />

        {/* Container 4: Physical & Sleep */}
        <CategoryCard
          id="physical"
          title="Physical & Sleep"
          subtitle={`${latestCheckin?.sleep_hours || 6.8}h sleep, gym`}
          icon={Activity}
          color="#1F6B4F"
          bgLight="#E3F2E9"
          metric={`${latestCheckin?.sleep_hours || 6.8} hrs`}
          badge={latestCheckin?.sleep_hours < 7 ? 'Slight Deficit' : 'Optimal'}
        />

        {/* Container 5: Social & Errands */}
        <CategoryCard
          id="social"
          title="Social & Errands"
          subtitle="Groceries, meetup"
          icon={Users}
          color="#B85D6F"
          bgLight="#FCEEF0"
          metric={`${Math.round((capacity.breakdown?.social || 12) + (capacity.breakdown?.errands || 8))}% load`}
          badge="Flexible"
        />

        {/* Container 6: Combined Capacity & Load Sources Card */}
        <div
          onClick={() => setIsLoadBreakdownModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #185A41 0%, #1F6B4F 50%, #124835 100%)',
            borderColor: '#17553E'
          }}
          className="relative overflow-hidden p-4 sm:p-4.5 rounded-2xl text-white border hover:border-[#86EFAC]/60 cursor-pointer transition-all flex flex-col justify-between space-y-2.5 group shadow-xs hover:shadow-md"
        >
          {/* Aurora Aura Glowing Background Effects */}
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#86EFAC]/25 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-[#38BDF8]/20 blur-lg pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-[#FACC15]/15 blur-md pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-[#D1F0DE] flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 shadow-2xs">
                <PieChart className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-white transition-colors font-display truncate">
                  {capacity?.percentage || 71}%
                </h4>
                <p className="text-[11px] text-[#D1F0DE] truncate">Capacity</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1 ${(capacity?.percentage || 71) >= 85
                ? 'bg-[#FEE2E2] text-[#DC2626]'
                : (capacity?.percentage || 71) >= 70
                  ? 'bg-[#FEF3C7] text-[#92400E]'
                  : 'bg-white/20 text-[#D1F0DE]'
                }`}
            >
              {(capacity?.percentage || 71) >= 85 ? 'Overload' : (capacity?.percentage || 71) >= 70 ? 'High load' : 'Balanced'}
            </span>
          </div>

          <div className="relative z-10 pt-2 border-t border-white/20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerRebalance();
              }}
              className="w-full py-1.5 px-2 rounded-xl bg-white hover:bg-[#EDF3EE] active:scale-98 text-[#152F26] text-[11px] font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-all shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-[#1F6B4F]" />
              <span className="truncate">Rebalance Week</span>
            </button>
          </div>
        </div>
      </div>

      {/* Temporary Success Toast */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#E3F2E9] border border-[#C2E2D0] text-[#152F26] text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F6B4F]" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-[#1F6B4F] hover:underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Suggested Rebalancing Banner (If overloaded or high) */}
      {suggestedAction && !suggestedAction.is_applied && (
        <div className="p-5 rounded-3xl bg-[#FEF3C7]/40 border border-[#FDE68A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                Suggested Action
              </span>
              <span className="text-xs font-bold text-[#152F26]">
                {suggestedAction.headline}
              </span>
            </div>
            <p className="text-xs text-[#4A675E] leading-relaxed">
              {suggestedAction.detail}
            </p>
            <p className="text-[11px] font-semibold text-[#1F6B4F]">
              {suggestedAction.impact}
            </p>
          </div>

          <button
            onClick={handleTriggerRebalance}
            className="whitespace-nowrap px-5 py-2.5 rounded-2xl bg-[#1F6B4F] hover:bg-[#16533D] active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-[#1F6B4F]/20 flex items-center space-x-2 cursor-pointer"
          >
            <span>Rebalance My Week</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN BENTO GRID: Left Sidebar (Monthly Calendar + Reminder Card + Filters) + Right (Weekly Timeline Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Mini Monthly Calendar, Reminder Card, and Filters */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Small Monthly Calendar View */}
          <MiniMonthCalendar
            currentDate={calendarMonthDate}
            selectedDate={selectedDateStr}
            onSelectDate={(newDate) => {
              setSelectedDateStr(newDate);
            }}
            onPrevMonth={() => {
              setCalendarMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
            }}
            onNextMonth={() => {
              setCalendarMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
            }}
            tasksByDate={tasksByDate}
          />

          {/* Upcoming Focus / Meeting Reminder Card (matching dark teal card) */}
          {nextFocusTask && (
            <div
              style={{ backgroundColor: '#152F26', borderColor: '#0D211A' }}
              className="p-4 text-white rounded-2xl shadow-sm border space-y-2.5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#4ADE80] uppercase tracking-wider">
                  Upcoming Focus
                </span>
                <span className="text-[10px] font-bold bg-white/15 text-[#E3F2E9] px-2 py-0.5 rounded-full capitalize">
                  {nextFocusTask.category}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white truncate font-display">
                  {nextFocusTask.title}
                </h4>
                <div className="flex items-center space-x-1.5 text-xs text-[#D1F0DE] mt-0.5 font-medium">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-[#86EFAC]" />
                  <span>
                    {(nextFocusTask.start_time || nextFocusTask.scheduled_start) && (nextFocusTask.end_time || nextFocusTask.scheduled_end)
                      ? `${nextFocusTask.start_time || nextFocusTask.scheduled_start} - ${nextFocusTask.end_time || nextFocusTask.scheduled_end}`
                      : `~${nextFocusTask.estimated_hours}h focus window`}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => setEditingTask(nextFocusTask)}
                  className="text-[11px] text-[#86EFAC] hover:text-[#BBF7D0] hover:underline font-bold cursor-pointer transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => toggleComplete(nextFocusTask)}
                  className="px-3 py-1 rounded-lg bg-[#1F6B4F] hover:bg-[#2E855F] text-white text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

          {/* Category Filters (matching mockup filter checklist) */}
          <div className="lumora-card p-4 bg-white border border-[#D2E2D8] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#152F26] uppercase tracking-wider flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-[#1F6B4F]" />
                <span>Filters</span>
              </span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`text-[11px] font-semibold transition-colors cursor-pointer ${selectedCategory === 'all' ? 'text-[#1F6B4F]' : 'text-[#638379] hover:text-[#152F26]'
                  }`}
              >
                Show All
              </button>
            </div>

            <div className="space-y-1 text-xs">
              {[
                { id: 'academic', label: 'Academic Coursework', dot: 'bg-[#2B6CB0]' },
                { id: 'work', label: 'Work & Projects', dot: 'bg-[#705898]' },
                { id: 'physical', label: 'Physical & Health', dot: 'bg-[#1F6B4F]' },
                { id: 'social', label: 'Social Hangouts', dot: 'bg-[#B85D6F]' },
                { id: 'errand', label: 'Errands & Tasks', dot: 'bg-[#D97706]' }
              ].map((cat) => {
                const isChecked = selectedCategory === 'all' || selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${selectedCategory === cat.id
                      ? 'bg-[#E3F2E9] text-[#152F26] font-bold'
                      : 'hover:bg-[#EDF3EE] text-[#4A675E]'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[10px] text-[#638379] font-semibold">
                      {allTasks.filter(t => t.category === cat.id).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bigger Weekly Timeline Calendar matching mockup */}
        <div className="lg:col-span-8 xl:col-span-9">
          <WeeklyTimelineCalendar
            tasks={allTasks}
            selectedCategory={selectedCategory}
            selectedDateStr={selectedDateStr}
            onSelectDate={(d) => setSelectedDateStr(d)}
            toggleComplete={toggleComplete}
            handleDelete={handleDelete}
            onAddTask={() => setSmartCaptureOpen(true)}
          />
        </div>
      </div>

      {/* 4. LOWER SECTION: Demo Controls & Load Breakdown Modal */}
      <div className="space-y-4 pt-2">
        {/* Demo Scenario Shortcuts Bar for Judges */}
        <div className="p-4 rounded-2xl bg-[#E4ECE7] border border-[#D2E2D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-[#4A675E]">
            <span className="font-bold text-[#152F26]">Hackathon Demo Controls:</span>
            <span>Quickly walk through the full narrative flow</span>
          </div>

        </div>
      </div>

      {/* Where Your Load Comes From Modal */}
      {isLoadBreakdownModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsLoadBreakdownModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-[#D2E2D8] shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D2E2D8] pb-3.5">
              <div>
                <h3 className="text-lg font-bold text-[#152F26] tracking-tight font-display">
                  Where Your Load Comes From
                </h3>
                <p className="text-xs text-[#638379] mt-0.5">
                  Combined cognitive, physical, and time commitments
                </p>
              </div>
              <button
                onClick={() => setIsLoadBreakdownModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#EDF3EE] text-[#638379] hover:text-[#152F26] transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <LoadBreakdown
              breakdown={capacity.breakdown}
              percentage={capacity.percentage}
              onRebalance={() => {
                setIsLoadBreakdownModalOpen(false);
                handleTriggerRebalance();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


