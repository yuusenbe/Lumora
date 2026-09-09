import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Shield,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  ArrowLeft,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TaskEditModal from './TaskEditModal';

const CATEGORY_STYLES = {
  academic: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    label: 'Academic'
  },
  work: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    label: 'Work'
  },
  physical: {
    bg: 'bg-[#E8EFE8]',
    text: 'text-[#354546]',
    border: 'border-[#C2E6CB]',
    dot: 'bg-[#88A788]',
    label: 'Physical'
  },
  social: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    dot: 'bg-pink-500',
    label: 'Social'
  },
  errand: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'Errands'
  }
};

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarView({
  tasks,
  selectedCategory,
  toggleComplete,
  handleDelete,
  onAddTask
}) {
  const { openCaptureWithDate, editingTask, setEditingTask } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'day'
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Format YYYY-MM-DD
  const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = useMemo(() => formatDateKey(new Date()), []);

  // Group tasks by date with fallback parsing so no activity is ever hidden
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

      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(t);
    });
    return map;
  }, [tasks]);

  // Generate calendar cells for Month View (Monday as first day of week)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Days from previous month to fill first row
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dateKey: formatDateKey(d),
        isCurrentMonth: false
      });
    }

    // Days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        dateKey: formatDateKey(d),
        isCurrentMonth: true
      });
    }

    // Days of next month to complete the grid (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dateKey: formatDateKey(d),
        isCurrentMonth: false
      });
    }

    return days;
  }, [year, month]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateKey(today));
  };

  // Day navigation handlers
  const handlePrevDay = () => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    setSelectedDateStr(formatDateKey(prev));
    if (prev.getMonth() !== month) {
      setCurrentDate(prev);
    }
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    setSelectedDateStr(formatDateKey(next));
    if (next.getMonth() !== month) {
      setCurrentDate(next);
    }
  };

  const handleSelectDayCell = (dayObj) => {
    setSelectedDateStr(dayObj.dateKey);
    setViewMode('day');
  };

  // Tasks for the active Day View (chronologically sorted: anchors first, then floating tasks)
  const selectedDayTasks = useMemo(() => {
    const raw = tasksByDate[selectedDateStr] || [];
    return [...raw].sort((a, b) => {
      const aStart = a.start_time || a.scheduled_start;
      const bStart = b.start_time || b.scheduled_start;
      if (aStart && bStart) return aStart.localeCompare(bStart);
      if (aStart) return -1;
      if (bStart) return 1;
      return 0;
    });
  }, [tasksByDate, selectedDateStr]);

  // Selected day human-readable string
  const selectedDayFormatted = useMemo(() => {
    if (!selectedDateStr) return '';
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDateStr]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Calendar Toolbar */}
      <div className="lumora-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation & Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={viewMode === 'month' ? handlePrevMonth : handlePrevDay}
              className="p-2 rounded-xl hover:bg-[#F4F1E5] text-[#354546] transition-colors cursor-pointer border border-[#E5EAE3]"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={viewMode === 'month' ? handleNextMonth : handleNextDay}
              className="p-2 rounded-xl hover:bg-[#F4F1E5] text-[#354546] transition-colors cursor-pointer border border-[#E5EAE3]"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#354546]">
            {viewMode === 'month' ? monthName : selectedDayFormatted}
          </h2>

          <button
            onClick={handleToday}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F4F1E5] text-[#354546] hover:bg-[#E8EFE8] transition-colors border border-[#E2DEC9] cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* View Mode Toggle (Month vs Day) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#F8F9F3] p-1 rounded-xl border border-[#E5EAE3]">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-[#88A788] text-white shadow-xs'
                  : 'text-[#798990] hover:text-[#354546]'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-[#88A788] text-white shadow-xs'
                  : 'text-[#798990] hover:text-[#354546]'
              }`}
            >
              Day View
            </button>
          </div>
        </div>
      </div>

      {/* Category Color Legend */}
      <div className="flex items-center flex-wrap gap-3 text-xs text-[#798990] px-1">
        <span className="font-bold text-[#354546] text-[11px] uppercase tracking-wider">Categories:</span>
        {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
          <span key={key} className="inline-flex items-center space-x-1.5 font-medium">
            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
            <span>{style.label}</span>
          </span>
        ))}
      </div>

      {/* VIEW MODE: MONTH */}
      {viewMode === 'month' && (
        <div className="lumora-card overflow-hidden border border-[#E5EAE3] shadow-xs">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-[#E5EAE3] bg-[#F8F9F3] text-center text-xs font-bold text-[#798990] py-2.5">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="tracking-wider">{day}</div>
            ))}
          </div>

          {/* Month Day Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E5EAE3]">
            {calendarDays.map((dayObj, index) => {
              const dayTasks = tasksByDate[dayObj.dateKey] || [];
              const isToday = dayObj.dateKey === todayStr;
              const isSelected = dayObj.dateKey === selectedDateStr;

              return (
                <div
                  key={index}
                  onClick={() => handleSelectDayCell(dayObj)}
                  className={`min-h-[105px] sm:min-h-[125px] p-2 sm:p-2.5 transition-colors cursor-pointer flex flex-col justify-between ${
                    dayObj.isCurrentMonth
                      ? isToday
                        ? 'bg-[#E8EFE8]/40 hover:bg-[#E8EFE8]/70'
                        : 'bg-white hover:bg-[#F8F9F3]'
                      : 'bg-slate-50/50 text-slate-400 opacity-60 hover:opacity-90'
                  } ${isSelected ? 'ring-2 ring-inset ring-[#88A788]' : ''}`}
                >
                  {/* Date Header inside cell */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isToday
                          ? 'bg-[#88A788] text-white shadow-xs font-extrabold'
                          : dayObj.isCurrentMonth
                          ? 'text-[#354546]'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayObj.date.getDate()}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-semibold text-[#798990]">
                        {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>

                  {/* Task Chips preview */}
                  <div className="space-y-1 overflow-hidden flex-1">
                    {dayTasks.slice(0, 3).map((task) => {
                      const catStyle = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.academic;
                      const isDone = task.status === 'completed';

                      const startTimeVal = task.start_time || task.scheduled_start;
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask(task);
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium flex items-center space-x-1 border cursor-pointer hover:scale-[1.02] active:scale-98 transition-all ${
                            catStyle.bg
                          } ${catStyle.text} ${catStyle.border} ${
                            isDone ? 'opacity-50 line-through' : ''
                          }`}
                          title={`${task.title} (Click to edit)`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${catStyle.dot}`} />
                          {startTimeVal && (
                            <span className="font-bold opacity-80 shrink-0">{startTimeVal}</span>
                          )}
                          <span className="truncate">{task.title}</span>
                          {Boolean(task.is_protected) && (
                            <Shield className="w-2.5 h-2.5 text-[#88A788] shrink-0" />
                          )}
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <p className="text-[10px] font-bold text-[#88A788] pl-1 pt-0.5">
                        +{dayTasks.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE: DAY */}
      {viewMode === 'day' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('month')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#88A788] hover:text-[#759475] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Month View</span>
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-[#798990] font-medium hidden sm:inline">
                {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'commitment' : 'commitments'} scheduled
              </span>
              <button
                onClick={() => openCaptureWithDate(selectedDateStr)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#88A788] hover:bg-[#759475] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Activity</span>
              </button>
            </div>
          </div>

          {selectedDayTasks.length > 0 ? (
            <div className="space-y-3">
              {selectedDayTasks.map((task) => {
                const isDone = task.status === 'completed';
                const catStyle = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.academic;

                return (
                  <div
                    key={task.id}
                    className={`lumora-card p-4 sm:p-5 flex items-start justify-between gap-4 transition-all ${
                      isDone ? 'opacity-55 bg-[#F8F9F3]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleComplete(task)}
                        className="mt-0.5 text-[#798990] hover:text-[#88A788] transition-colors cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[#88A788] fill-[#E8EFE8]" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm font-bold truncate ${
                              isDone ? 'line-through text-slate-400' : 'text-[#354546]'
                            }`}
                          >
                            {task.title}
                          </span>

                          {Boolean(task.is_protected) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#B3E8C0] text-[#354546] border border-[#94B094]">
                              Shielded Focus
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#798990]">
                          <span
                            className={`capitalize px-2 py-0.5 rounded-md font-medium border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          >
                            {task.category}
                          </span>

                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[#88A788]" />
                            <span>
                              {(task.start_time || task.scheduled_start) && (task.end_time || task.scheduled_end)
                                ? `${task.start_time || task.scheduled_start} - ${task.end_time || task.scheduled_end} (~${task.estimated_hours}h anchor)`
                                : `~${task.estimated_hours}h (flexible window)`}
                            </span>
                          </span>

                          <span className="capitalize">{task.priority} Priority</span>

                          {task.flexibility === 'high' && (
                            <span className="text-[#88A788] font-semibold">High Flexibility</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(task);
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#88A788] hover:bg-[#E8EFE8] rounded-lg transition-colors cursor-pointer"
                        title="Edit Activity"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="lumora-card p-12 text-center text-slate-400 space-y-3">
              <CalendarIcon className="w-8 h-8 mx-auto text-[#88A788]/60" />
              <p className="text-sm font-semibold text-[#354546]">No tasks scheduled for this day.</p>
              <p className="text-xs text-[#798990]">
                {selectedCategory !== 'all'
                  ? `No ${selectedCategory} tasks found for ${selectedDayFormatted}.`
                  : 'Your capacity is clear for this date.'}
              </p>
              <button
                onClick={() => openCaptureWithDate(selectedDateStr)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#88A788] hover:bg-[#759475] text-white text-xs font-bold transition-all shadow-xs cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule a Task</span>
              </button>
            </div>
          )}
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
