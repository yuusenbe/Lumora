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
    bg: 'bg-[#EBF4FB]',
    text: 'text-[#2B6CB0]',
    border: 'border-[#2B6CB0]/30',
    dot: 'bg-[#2B6CB0]',
    label: 'Academic'
  },
  work: {
    bg: 'bg-[#F3EFF9]',
    text: 'text-[#705898]',
    border: 'border-[#705898]/30',
    dot: 'bg-[#705898]',
    label: 'Work'
  },
  physical: {
    bg: 'bg-[#E3F2E9]',
    text: 'text-[#1F6B4F]',
    border: 'border-[#1F6B4F]/30',
    dot: 'bg-[#1F6B4F]',
    label: 'Physical'
  },
  social: {
    bg: 'bg-[#FCEEF0]',
    text: 'text-[#B85D6F]',
    border: 'border-[#B85D6F]/30',
    dot: 'bg-[#B85D6F]',
    label: 'Social'
  },
  errand: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#D97706]',
    border: 'border-[#D97706]/30',
    dot: 'bg-[#D97706]',
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
      const bStart = b.start_time || b.scheduled_end;
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
      <div
        style={{
          background: '#FFFFFF',
          borderColor: '#D2E2D8'
        }}
        className="lumora-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs border"
      >
        {/* Navigation & Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={viewMode === 'month' ? handlePrevMonth : handlePrevDay}
              className="p-2 rounded-xl hover:bg-[#EDF3EE] text-[#152F26] transition-colors cursor-pointer border border-[#D2E2D8]"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={viewMode === 'month' ? handleNextMonth : handleNextDay}
              className="p-2 rounded-xl hover:bg-[#EDF3EE] text-[#152F26] transition-colors cursor-pointer border border-[#D2E2D8]"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#152F26] font-display">
            {viewMode === 'month' ? monthName : selectedDayFormatted}
          </h2>

          <button
            onClick={handleToday}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#EDF3EE] text-[#152F26] hover:bg-[#E3F2E9] transition-colors border border-[#D2E2D8] cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* View Mode Toggle (Month vs Day) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#EDF3EE] p-1 rounded-xl border border-[#D2E2D8]">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-[#152F26] shadow-xs'
                  : 'text-[#638379] hover:text-[#152F26]'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-white text-[#152F26] shadow-xs'
                  : 'text-[#638379] hover:text-[#152F26]'
              }`}
            >
              Day View
            </button>
          </div>
        </div>
      </div>

      {/* Category Color Legend */}
      <div className="flex items-center flex-wrap gap-3 text-xs text-[#638379] px-1">
        <span className="font-bold text-[#152F26] text-[11px] uppercase tracking-wider">Categories:</span>
        {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
          <span key={key} className="inline-flex items-center space-x-1.5 font-medium">
            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
            <span>{style.label}</span>
          </span>
        ))}
      </div>

      {/* VIEW MODE: MONTH */}
      {viewMode === 'month' && (
        <div
          style={{
            background: '#FFFFFF',
            borderColor: '#D2E2D8'
          }}
          className="lumora-card overflow-hidden shadow-xs border"
        >
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-[#D2E2D8] bg-[#EDF3EE] text-center text-xs font-bold text-[#152F26] py-2.5">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="tracking-wider">{day}</div>
            ))}
          </div>

          {/* Month Day Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#D2E2D8]">
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
                        ? 'bg-[#E3F2E9]/60 hover:bg-[#E3F2E9]'
                        : 'bg-white hover:bg-[#EDF3EE]/70'
                      : 'bg-[#EDF3EE]/50 text-[#638379]/60 opacity-60 hover:opacity-90'
                  } ${isSelected ? 'ring-2 ring-inset ring-[#1F6B4F]' : ''}`}
                >
                  {/* Date Header inside cell */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isToday
                          ? 'bg-[#1F6B4F] text-white shadow-xs font-extrabold'
                          : dayObj.isCurrentMonth
                          ? 'text-[#152F26]'
                          : 'text-[#638379]/70'
                      }`}
                    >
                      {dayObj.date.getDate()}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-semibold text-[#638379]">
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
                            <Shield className="w-2.5 h-2.5 text-[#D97706] shrink-0" />
                          )}
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <p className="text-[10px] font-bold text-[#1F6B4F] pl-1 pt-0.5">
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
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1F6B4F] hover:text-[#16533D] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Month View</span>
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-[#638379] font-medium hidden sm:inline">
                {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'commitment' : 'commitments'} scheduled
              </span>
              <button
                onClick={() => openCaptureWithDate(selectedDateStr)}
                className="btn-primary flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
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
                    className={`lumora-card p-4 sm:p-5 flex items-start justify-between gap-4 transition-all bg-white border border-[#D2E2D8] shadow-xs ${
                      isDone ? 'opacity-55 bg-[#EDF3EE]/60' : 'hover:border-[#1F6B4F]/60'
                    }`}
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleComplete(task)}
                        className="mt-0.5 text-[#638379]/50 hover:text-[#1F6B4F] transition-colors cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[#1F6B4F] fill-[#E3F2E9]" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm font-bold truncate ${
                              isDone ? 'line-through text-[#638379]' : 'text-[#152F26]'
                            }`}
                          >
                            {task.title}
                          </span>

                          {Boolean(task.is_protected) && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6EC] text-[#645233] border border-[#DFD6C3]">
                              Shielded Focus
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#638379]">
                          <span
                            className={`capitalize px-2 py-0.5 rounded-md font-medium border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          >
                            {task.category}
                          </span>

                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[#638379]" />
                            <span>
                              {(task.start_time || task.scheduled_start) && (task.end_time || task.scheduled_end)
                                ? `${task.start_time || task.scheduled_start} - ${task.end_time || task.scheduled_end} (~${task.estimated_hours}h anchor)`
                                : `~${task.estimated_hours}h (flexible window)`}
                            </span>
                          </span>

                          <span className="capitalize">{task.priority} Priority</span>

                          {task.flexibility === 'high' && (
                            <span className="text-[#1F6B4F] font-semibold">High Flexibility</span>
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
                        className="p-1.5 text-[#638379] hover:text-[#152F26] hover:bg-[#EDF3EE] rounded-lg transition-colors cursor-pointer"
                        title="Edit Activity"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-[#638379]/50 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
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
            <div className="lumora-card p-12 text-center text-[#638379] space-y-3 bg-white border border-[#D2E2D8]">
              <CalendarIcon className="w-8 h-8 mx-auto text-[#1F6B4F]/60" />
              <p className="text-sm font-semibold text-[#152F26]">No tasks scheduled for this day.</p>
              <p className="text-xs text-[#638379]">
                {selectedCategory !== 'all'
                  ? `No ${selectedCategory} tasks found for ${selectedDayFormatted}.`
                  : 'Your capacity is clear for this date.'}
              </p>
              <button
                onClick={() => openCaptureWithDate(selectedDateStr)}
                className="btn-primary inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer mt-2"
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
