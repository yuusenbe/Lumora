import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  CheckCircle2,
  Circle,
  Edit3,
  Calendar as CalendarIcon,
  Sparkles,
  BookOpen,
  Briefcase,
  Users,
  Activity,
  ShoppingCart,
  CalendarClock,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import TaskEditModal from './TaskEditModal';

const CATEGORY_STYLES = {
  academic: {
    bg: 'bg-[#EBF4FB]',
    border: 'border-[#BFDBFE]',
    cardBg: 'bg-[#F0F7FF]',
    cardBorder: 'border-[#BFDBFE]',
    text: 'text-[#2B6CB0]',
    title: 'text-[#1E40AF]',
    dot: 'bg-[#2B6CB0]',
    accent: '#2B6CB0',
    progressBg: 'bg-[#2B6CB0]',
    label: 'Academic'
  },
  work: {
    bg: 'bg-[#F3EFF9]',
    border: 'border-[#DDD6FE]',
    cardBg: 'bg-[#F8F5FC]',
    cardBorder: 'border-[#DDD6FE]',
    text: 'text-[#705898]',
    title: 'text-[#5B21B6]',
    dot: 'bg-[#705898]',
    accent: '#705898',
    progressBg: 'bg-[#705898]',
    label: 'Work'
  },
  physical: {
    bg: 'bg-[#E3F2E9]',
    border: 'border-[#C2E2D0]',
    cardBg: 'bg-[#F0F9F4]',
    cardBorder: 'border-[#C2E2D0]',
    text: 'text-[#1F6B4F]',
    title: 'text-[#152F26]',
    dot: 'bg-[#1F6B4F]',
    accent: '#1F6B4F',
    progressBg: 'bg-[#1F6B4F]',
    label: 'Physical'
  },
  social: {
    bg: 'bg-[#FCEEF0]',
    border: 'border-[#FECDD3]',
    cardBg: 'bg-[#FFF1F3]',
    cardBorder: 'border-[#FECDD3]',
    text: 'text-[#B85D6F]',
    title: 'text-[#9F1239]',
    dot: 'bg-[#B85D6F]',
    accent: '#B85D6F',
    progressBg: 'bg-[#B85D6F]',
    label: 'Social'
  },
  errand: {
    bg: 'bg-[#FEF3C7]',
    border: 'border-[#FDE68A]',
    cardBg: 'bg-[#FEFCE8]',
    cardBorder: 'border-[#FDE68A]',
    text: 'text-[#D97706]',
    title: 'text-[#92400E]',
    dot: 'bg-[#D97706]',
    accent: '#D97706',
    progressBg: 'bg-[#D97706]',
    label: 'Errands'
  }
};

const HOURS = [
  { hour: 8, label: '08 AM' },
  { hour: 9, label: '09 AM' },
  { hour: 10, label: '10 AM' },
  { hour: 11, label: '11 AM' },
  { hour: 12, label: '12 PM' },
  { hour: 13, label: '01 PM' },
  { hour: 14, label: '02 PM' },
  { hour: 15, label: '03 PM' },
  { hour: 16, label: '04 PM' },
  { hour: 17, label: '05 PM' },
  { hour: 18, label: '06 PM' },
  { hour: 19, label: '07 PM' },
  { hour: 20, label: '08 PM' }
];

export default function WeeklyTimelineCalendar({
  tasks = [],
  selectedCategory = 'all',
  selectedDateStr,
  onSelectDate,
  toggleComplete,
  handleDelete,
  onAddTask
}) {
  const { openCaptureWithDate, editingTask, setEditingTask, triggerRefresh } = useAuth();
  const [viewMode, setViewMode] = useState('daily'); // default to 'daily' or 'weekly'
  const [showAllDailyTasks, setShowAllDailyTasks] = useState(true);
  const [postponeMessage, setPostponeMessage] = useState('');

  const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'academic': return BookOpen;
      case 'work': return Briefcase;
      case 'social': return Users;
      case 'physical': return Activity;
      case 'errand': return ShoppingCart;
      default: return BookOpen;
    }
  };

  // Current active date object
  const activeDate = useMemo(() => {
    if (!selectedDateStr) return new Date();
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDateStr]);

  const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  // Compute 7 days of the current week (Monday to Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(activeDate);
    const dayOfWeek = curr.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - distanceToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = formatDateKey(d);
      days.push({
        date: d,
        dateKey: key,
        dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
        shortName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: key === todayKey,
        isSelected: key === selectedDateStr
      });
    }
    return days;
  }, [activeDate, selectedDateStr, todayKey]);

  // Compute month days grid for Monthly view (Monday to Sunday)
  const monthDays = useMemo(() => {
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDow = firstDay.getDay() - 1; // Monday = 0
    if (startDow === -1) startDow = 6;

    const days = [];
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLast - i);
      const key = formatDateKey(d);
      days.push({
        date: d,
        dateKey: key,
        dayNum: d.getDate(),
        isCurrentMonth: false,
        isToday: key === todayKey,
        isSelected: key === selectedDateStr
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const key = formatDateKey(d);
      days.push({
        date: d,
        dateKey: key,
        dayNum: i,
        isCurrentMonth: true,
        isToday: key === todayKey,
        isSelected: key === selectedDateStr
      });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const key = formatDateKey(d);
      days.push({
        date: d,
        dateKey: key,
        dayNum: i,
        isCurrentMonth: false,
        isToday: key === todayKey,
        isSelected: key === selectedDateStr
      });
    }

    return days;
  }, [activeDate, todayKey, selectedDateStr]);

  // Navigate forward / backward
  const handlePrev = () => {
    const d = new Date(activeDate);
    if (viewMode === 'monthly') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'weekly') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    onSelectDate(formatDateKey(d));
  };

  const handleNext = () => {
    const d = new Date(activeDate);
    if (viewMode === 'monthly') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    onSelectDate(formatDateKey(d));
  };

  const handleToday = () => {
    onSelectDate(todayKey);
  };

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map = {};
    const now = new Date();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    tasks.forEach((t) => {
      let dateKey = t.scheduled_date;
      if (!dateKey && t.deadline) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(t.deadline)) {
          dateKey = t.deadline;
        } else {
          const dl = t.deadline.trim().toLowerCase();
          if (dl === 'today' || dl === 'tonight') {
            dateKey = formatDateKey(now);
          } else if (dl === 'tomorrow') {
            const tom = new Date(now);
            tom.setDate(tom.getDate() + 1);
            dateKey = formatDateKey(tom);
          } else {
            const currentDow = now.getDay();
            daysOfWeek.forEach((dayName, idx) => {
              if (dl.includes(dayName)) {
                let delta = (idx - currentDow + 7) % 7;
                if (delta === 0 && dl.includes('next')) delta = 7;
                const d = new Date(now);
                d.setDate(d.getDate() + delta);
                dateKey = formatDateKey(d);
              }
            });
          }
        }
      }
      if (!dateKey) dateKey = formatDateKey(now);

      if (selectedCategory !== 'all' && t.category !== selectedCategory) return;

      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(t);
    });
    return map;
  }, [tasks, selectedCategory]);

  const handleLocalToggleComplete = async (task, e) => {
    if (e) e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const newProgress = newStatus === 'completed' ? 100 : 50;

    if (newStatus === 'completed') {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#1F6B4F', '#2E855F', '#BCE7CD']
      });
    }

    try {
      await api.updateTask(task.id, {
        status: newStatus,
        progress: newProgress
      });
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostpone = async (task, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.postponeTask(task.id, 1);
      setPostponeMessage(res.message || `Moved '${task.title}' to tomorrow. Energy preserved!`);
      setTimeout(() => setPostponeMessage(''), 4000);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Extract start hour helper
  const getTaskHourSlot = (task, index, totalFloating) => {
    const timeStr = task.start_time || task.scheduled_start;
    if (timeStr) {
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        let hour = parseInt(match[1], 10);
        if (timeStr.toLowerCase().includes('pm') && hour < 12) hour += 12;
        if (timeStr.toLowerCase().includes('am') && hour === 12) hour = 0;
        return Math.min(20, Math.max(8, hour));
      }
    }
    if (task.category === 'academic') return 9 + (index % 3);
    if (task.category === 'work') return 14 + (index % 3);
    if (task.category === 'physical') return 17;
    if (task.category === 'social') return 19;
    return 11 + (index % 4);
  };

  // Header date title
  const headerDateTitle = useMemo(() => {
    if (viewMode === 'monthly') {
      return activeDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }
    if (viewMode === 'daily') {
      return activeDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    if (weekDays.length > 0) {
      const startMonth = weekDays[0].date.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = weekDays[6].date.toLocaleDateString('en-US', { month: 'short' });
      const year = weekDays[6].date.getFullYear();
      if (startMonth === endMonth) {
        return `${startMonth} ${weekDays[0].dayNum} – ${weekDays[6].dayNum}, ${year}`;
      }
      return `${startMonth} ${weekDays[0].dayNum} – ${endMonth} ${weekDays[6].dayNum}, ${year}`;
    }
    return '';
  }, [viewMode, activeDate, weekDays]);

  const dailyTasks = tasksByDate[selectedDateStr] || [];
  const visibleDailyTasks = showAllDailyTasks ? dailyTasks : dailyTasks.slice(0, 3);

  return (
    <div className="lumora-card bg-white border border-[#D2E2D8] shadow-xs overflow-hidden flex flex-col">
      {/* Top Bar Header */}
      <div className="p-4 sm:p-5 border-b border-[#D2E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        {/* Navigation with < Date Range > */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl hover:bg-[#EDF3EE] text-[#152F26] transition-colors cursor-pointer border border-[#D2E2D8]"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl hover:bg-[#EDF3EE] text-[#152F26] transition-colors cursor-pointer border border-[#D2E2D8]"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#152F26] tracking-tight font-display">
            {headerDateTitle}
          </h2>

          <button
            onClick={handleToday}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#EDF3EE] text-[#152F26] hover:bg-[#E3F2E9] transition-colors border border-[#D2E2D8] cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#EDF3EE] p-1 rounded-xl border border-[#D2E2D8]">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white text-[#152F26] shadow-xs'
                  : 'text-[#638379] hover:text-[#152F26]'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-white text-[#152F26] shadow-xs'
                  : 'text-[#638379] hover:text-[#152F26]'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-white text-[#152F26] shadow-xs'
                  : 'text-[#638379] hover:text-[#152F26]'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE: DAILY DETAILED VIEW (MATCHING TODAY'S FOCUS SECTION) */}
      {viewMode === 'daily' && (
        <div className="p-5 sm:p-7 space-y-4">
          {/* Header row with Rule of 3 framing */}
          <div className="flex items-center justify-between border-b border-[#D2E2D8] pb-3.5">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#152F26] tracking-tight font-display">
                  {activeDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E3F2E9] text-[#1F6B4F] border border-[#C2E2D0]">
                  Rule of 3
                </span>
              </div>
              <p className="text-xs text-[#638379] mt-0.5">
                Guarding your attention against cognitive fragmentation
              </p>
            </div>

            {dailyTasks.length > 3 && (
              <button
                onClick={() => setShowAllDailyTasks(!showAllDailyTasks)}
                className="text-xs font-semibold text-[#1F6B4F] hover:text-[#16533D] flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>{showAllDailyTasks ? 'Show Top 3' : 'View All'}</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Guilt-Free Postpone Positive Toast */}
          {postponeMessage && (
            <div className="p-3.5 rounded-xl bg-[#E3F2E9] border border-[#C2E2D0] text-[#152F26] text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#1F6B4F]" />
                <span>{postponeMessage}</span>
              </div>
              <button onClick={() => setPostponeMessage('')} className="text-[#1F6B4F] text-[11px] hover:underline font-bold cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {/* Daily Focus Task Cards */}
          {dailyTasks.length > 0 ? (
            <div className="space-y-3">
              {visibleDailyTasks.map((task, index) => {
                const catStyle = CATEGORY_STYLES[task.category?.toLowerCase()] || CATEGORY_STYLES.academic;
                const Icon = getCategoryIcon(task.category);
                const isDone = task.status === 'completed';
                const progress = task.progress || (isDone ? 100 : 30);

                return (
                  <div
                    key={task.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-[#EDF3EE]/60 border-[#D2E2D8] opacity-65'
                        : `${catStyle.cardBg} ${catStyle.cardBorder} shadow-xs hover:border-[#1F6B4F]/60`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Complete Checkbox button */}
                      <button
                        onClick={(e) => handleLocalToggleComplete(task, e)}
                        className="mt-0.5 text-[#638379]/50 hover:text-[#1F6B4F] transition-colors cursor-pointer shrink-0"
                        title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[#1F6B4F] fill-[#E3F2E9]" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 truncate min-w-0">
                            <span className="text-xs font-mono text-[#638379] font-bold shrink-0">
                              0{index + 1}.
                            </span>
                            <p
                              className={`text-sm font-bold truncate ${
                                isDone ? 'line-through text-[#638379]' : 'text-[#152F26]'
                              }`}
                            >
                              {task.title}
                            </p>
                            <span
                              className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text} border ${catStyle.border} shrink-0`}
                            >
                              <Icon className="w-2.5 h-2.5" />
                              <span>{catStyle.label || task.category}</span>
                            </span>
                            {task.is_protected ? (
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6EC] text-[#645233] border border-[#DFD6C3] shrink-0">
                                <Shield className="w-2.5 h-2.5" />
                                <span>Shielded</span>
                              </span>
                            ) : null}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                            className="p-1 text-[#638379] hover:text-[#152F26] hover:bg-[#EDF3EE] rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Edit Activity"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Progress over Deadlines indicator */}
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 h-1.5 bg-[#E4ECE7] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${progress}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                isDone ? 'bg-[#1F6B4F]/60' : catStyle.progressBg
                              }`}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-[#638379] whitespace-nowrap">
                            {progress}% done
                          </span>
                        </div>

                        {/* Meta info: duration & category & Guilt-Free Postpone Action */}
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <div className="flex items-center space-x-3 text-xs text-[#638379]">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-[#638379]" />
                              <span>
                                {(task.start_time || task.scheduled_start) && (task.end_time || task.scheduled_end)
                                  ? `${task.start_time || task.scheduled_start} - ${task.end_time || task.scheduled_end} (~${task.estimated_hours}h)`
                                  : `~${task.estimated_hours}h focus`}
                              </span>
                            </span>
                            {task.flexibility === 'high' && (
                              <span className="text-[#1F6B4F] font-semibold text-[11px]">Flexible</span>
                            )}
                          </div>

                          {!isDone && (
                            <button
                              onClick={(e) => handlePostpone(task, e)}
                              className="text-[11px] font-bold text-[#152F26] hover:text-[#0C1F19] bg-[#F4EFE6] hover:bg-[#E3F2E9] px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer shrink-0 border border-[#DFD6C3]"
                              title="Safely reschedule to tomorrow without overdue penalties"
                            >
                              <CalendarClock className="w-3 h-3 text-[#638379]" />
                              <span>Push to Tomorrow</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!showAllDailyTasks && dailyTasks.length > 3 && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setShowAllDailyTasks(true)}
                    className="text-xs font-semibold text-[#638379] hover:text-[#152F26] transition-colors cursor-pointer"
                  >
                    + {dailyTasks.length - 3} more scheduled responsibilities hidden to protect focus
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-[#638379] space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-[#1F6B4F]/60" />
              <div>
                <p className="text-sm font-semibold text-[#152F26]">Your day is clear and restful.</p>
                <p className="text-xs text-[#638379]">No commitments scheduled for this date.</p>
              </div>
              <button
                onClick={() => openCaptureWithDate ? openCaptureWithDate(selectedDateStr) : onAddTask && onAddTask()}
                className="px-3.5 py-1.5 rounded-xl bg-[#EDF3EE] hover:bg-[#E3F2E9] border border-[#D2E2D8] text-[#152F26] text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#1F6B4F]" />
                <span>Add Task to This Day</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE: WEEKLY TIMELINE GRID */}
      {viewMode === 'weekly' && (
        <div className="overflow-x-auto overflow-y-visible">
          <div className="min-w-[760px] divide-y divide-[#D2E2D8]">
            {/* Days Column Headers */}
            <div className="grid grid-cols-8 bg-[#EDF3EE]/60 border-b border-[#D2E2D8]">
              {/* Timezone header column */}
              <div className="p-3 text-[11px] font-bold text-[#638379] flex items-center justify-center border-r border-[#D2E2D8]">
                GMT+08
              </div>

              {/* 7 Days Headers */}
              {weekDays.map((day) => (
                <div
                  key={day.dateKey}
                  onClick={() => {
                    onSelectDate(day.dateKey);
                    setViewMode('daily');
                  }}
                  className={`p-3 text-center cursor-pointer transition-colors border-r border-[#D2E2D8] last:border-r-0 ${
                    day.isSelected
                      ? 'bg-[#E3F2E9]/80'
                      : 'hover:bg-[#E3F2E9]/40'
                  }`}
                >
                  <p className="text-[11px] font-medium text-[#638379] capitalize">{day.dayName}</p>
                  <p
                    className={`text-xl sm:text-2xl font-black mt-0.5 ${
                      day.isToday ? 'text-[#1F6B4F]' : 'text-[#152F26]'
                    }`}
                  >
                    {day.dayNum}
                  </p>
                </div>
              ))}
            </div>

            {/* Timeline Rows (08 AM to 08 PM) */}
            <div className="relative">
              {HOURS.map(({ hour, label }) => (
                <div key={hour} className="grid grid-cols-8 min-h-[90px] border-b border-[#D2E2D8]/60 last:border-b-0">
                  {/* Hour label column */}
                  <div className="p-2.5 text-[11px] font-bold text-[#638379] text-center border-r border-[#D2E2D8] bg-[#EDF3EE]/30 select-none">
                    {label}
                  </div>

                  {/* 7 Day Slot Cells */}
                  {weekDays.map((day) => {
                    const dayTasks = tasksByDate[day.dateKey] || [];
                    const slotTasks = dayTasks.filter((t, idx) => {
                      const h = getTaskHourSlot(t, idx, dayTasks.length);
                      return h === hour;
                    });

                    return (
                      <div
                        key={day.dateKey}
                        onClick={() => openCaptureWithDate(day.dateKey)}
                        className={`p-1.5 border-r border-[#D2E2D8]/60 last:border-r-0 transition-colors group relative cursor-pointer ${
                          day.isSelected ? 'bg-[#E3F2E9]/20' : 'hover:bg-[#EDF3EE]/40'
                        }`}
                      >
                        {slotTasks.map((task) => {
                          const catStyle = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.academic;
                          const isDone = task.status === 'completed';
                          const timeDisplay = (task.start_time || task.scheduled_start) && (task.end_time || task.scheduled_end)
                            ? `${task.start_time || task.scheduled_start} - ${task.end_time || task.scheduled_end}`
                            : (task.start_time || task.scheduled_start) || `~${task.estimated_hours}h focus`;

                          return (
                            <div
                              key={task.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTask(task);
                              }}
                              className={`p-2 rounded-xl border transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer mb-1.5 ${
                                catStyle.bg
                              } ${catStyle.border} ${isDone ? 'opacity-50 line-through' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className={`text-xs font-bold leading-snug truncate ${catStyle.title}`}>
                                  {task.title}
                                </span>
                                <button
                                  onClick={(e) => handleLocalToggleComplete(task, e)}
                                  className="text-[#638379] hover:text-[#1F6B4F] shrink-0"
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6B4F] fill-[#E3F2E9]" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              <div className="flex items-center space-x-1 text-[10px] text-[#4A675E] font-medium mt-1">
                                <Clock className="w-3 h-3 text-[#638379] shrink-0" />
                                <span className="truncate">{timeDisplay}</span>
                              </div>

                              {Boolean(task.is_protected) && (
                                <div className="mt-1 flex items-center space-x-1 text-[9px] font-bold text-[#92400E] bg-[#FEF3C7] px-1.5 py-0.5 rounded-md border border-[#FDE68A] w-fit">
                                  <Shield className="w-2.5 h-2.5 shrink-0 text-[#D97706]" />
                                  <span>Shielded</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE: MONTHLY GRID */}
      {viewMode === 'monthly' && (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-[#D2E2D8] bg-[#EDF3EE] text-center text-xs font-bold text-[#152F26] py-2.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="tracking-wider uppercase text-[11px] font-bold text-[#638379]">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid of days */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#D2E2D8] border-b border-[#D2E2D8]">
              {monthDays.map((dayObj, idx) => {
                const dayTasks = tasksByDate[dayObj.dateKey] || [];
                const visibleTasks = dayTasks.slice(0, 3);
                const remainingCount = dayTasks.length - 3;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectDate(dayObj.dateKey);
                      setViewMode('daily');
                    }}
                    className={`min-h-[110px] sm:min-h-[125px] p-2 sm:p-2.5 transition-colors cursor-pointer flex flex-col justify-between ${
                      dayObj.isCurrentMonth
                        ? dayObj.isToday
                          ? 'bg-[#E3F2E9]/60 hover:bg-[#E3F2E9]'
                          : 'bg-white hover:bg-[#EDF3EE]/70'
                        : 'bg-[#EDF3EE]/30 text-[#638379]/50 opacity-60 hover:opacity-90'
                    } ${dayObj.isSelected ? 'ring-2 ring-inset ring-[#1F6B4F]' : ''}`}
                  >
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          dayObj.isToday
                            ? 'bg-[#1F6B4F] text-white shadow-xs font-extrabold'
                            : dayObj.isCurrentMonth
                            ? 'text-[#152F26]'
                            : 'text-[#638379]'
                        }`}
                      >
                        {dayObj.dayNum}
                      </span>

                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-bold text-[#638379] bg-[#EDF3EE] px-1.5 py-0.5 rounded-full">
                          {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                      )}
                    </div>

                    {/* Tasks preview in cell */}
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {visibleTasks.map((t) => {
                        const catStyle = CATEGORY_STYLES[t.category?.toLowerCase()] || CATEGORY_STYLES.academic;
                        const isDone = t.status === 'completed';

                        return (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(t);
                            }}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate flex items-center space-x-1 border ${
                              catStyle.bg
                            } ${catStyle.border} ${catStyle.text} ${isDone ? 'line-through opacity-50' : ''}`}
                            title={t.title}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${catStyle.dot}`} />
                            <span className="truncate">{t.title}</span>
                          </div>
                        );
                      })}

                      {remainingCount > 0 && (
                        <span className="text-[9px] text-[#1F6B4F] font-bold pl-1 block">
                          +{remainingCount} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Live Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      />
    </div>
  );
}
