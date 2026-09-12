import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  Shield,
  Filter,
  LayoutList,
  Calendar as CalendarIcon,
  Edit3,
  CalendarClock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import WeeklyTimelineCalendar from '../components/WeeklyTimelineCalendar';
import TaskEditModal from '../components/TaskEditModal';

export default function AllTasksPage() {
  const { setSmartCaptureOpen, refreshKey, triggerRefresh, editingTask, setEditingTask } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewType, setViewType] = useState('list'); // 'list' | 'calendar'
  const [postponeToast, setPostponeToast] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks(selectedCategory === 'all' ? null : selectedCategory);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [selectedCategory, refreshKey]);

  const toggleComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    const nextProgress = nextStatus === 'completed' ? 100 : 50;

    if (nextStatus === 'completed') {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#0D9488', '#34D399', '#A7F3D0']
      });
    }

    await api.updateTask(task.id, {
      status: nextStatus,
      progress: nextProgress
    });
    triggerRefresh();
  };

  const handlePostpone = async (task) => {
    try {
      const res = await api.postponeTask(task.id, 1);
      setPostponeToast(res.message || `Rescheduled '${task.title}' to tomorrow.`);
      setTimeout(() => setPostponeToast(''), 4000);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    await api.deleteTask(id);
    triggerRefresh();
  };

  const categories = [
    { id: 'all', label: 'All Tasks' },
    { id: 'academic', label: 'Academic' },
    { id: 'work', label: 'Work' },
    { id: 'physical', label: 'Physical' },
    { id: 'social', label: 'Social' },
    { id: 'errand', label: 'Errands' }
  ];

  return (
    <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 lg:px-7 py-6 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D2E2D8] pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E3F2E9] border border-[#C2E2D0] text-[#1F6B4F] flex items-center justify-center shadow-xs">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#152F26] tracking-tight font-display">Full Schedule & Tasks</h1>
            <p className="text-xs text-[#4A675E]">Every commitment contributing to your capacity score</p>
          </div>
        </div>

        <button
          onClick={() => setSmartCaptureOpen(true)}
          className="btn-primary text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Capture New Task</span>
        </button>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category filter pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#152F26] text-white shadow-xs'
                  : 'bg-white text-[#4A675E] border border-[#D2E2D8] hover:bg-[#EDF3EE] hover:text-[#152F26]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* View Switcher: List vs Calendar */}
        <div className="flex items-center self-start sm:self-auto bg-[#EDF3EE] p-1 rounded-xl border border-[#D2E2D8] shadow-xs shrink-0">
          <button
            onClick={() => setViewType('list')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewType === 'list'
                ? 'bg-white text-[#152F26] shadow-xs'
                : 'text-[#4A675E] hover:text-[#152F26]'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewType('calendar')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewType === 'calendar'
                ? 'bg-white text-[#152F26] shadow-xs'
                : 'text-[#4A675E] hover:text-[#152F26]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Guilt-Free Postpone Positive Toast */}
      {postponeToast && (
        <div className="p-3.5 rounded-2xl bg-[#E3F2E9] border border-[#C2E2D0] text-[#152F26] text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#1F6B4F]" />
            <span>{postponeToast}</span>
          </span>
          <button onClick={() => setPostponeToast('')} className="text-[#1F6B4F] text-xs font-semibold hover:underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Content: List View vs Calendar View */}
      {loading ? (
        <div className="lumora-card p-12 text-center text-[#638379]">
          <p className="text-xs font-medium">Loading schedule...</p>
        </div>
      ) : viewType === 'calendar' ? (
        <WeeklyTimelineCalendar
          tasks={tasks}
          selectedCategory={selectedCategory}
          selectedDateStr={selectedDateStr}
          onSelectDate={(d) => setSelectedDateStr(d)}
          toggleComplete={toggleComplete}
          handleDelete={handleDelete}
          onAddTask={() => setSmartCaptureOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  style={{
                    background: '#FFFFFF',
                    borderColor: '#D2E2D8'
                  }}
                  className={`lumora-card p-4 sm:p-5 flex items-start justify-between gap-4 transition-all duration-200 shadow-xs border ${
                    isDone ? 'opacity-60 bg-[#F4F8F5]' : 'hover:border-[#1F6B4F]/60'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleComplete(task)}
                      className="mt-0.5 text-[#638379]/50 hover:text-[#1F6B4F] transition-colors cursor-pointer shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-[#1F6B4F] fill-[#E3F2E9]" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold truncate ${isDone ? 'line-through text-[#638379]' : 'text-[#152F26]'}`}>
                          {task.title}
                        </span>
                        {task.is_protected ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                            Shielded
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#638379]">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-[#EDF3EE] text-[#152F26] font-medium border border-[#D2E2D8]">
                          {task.category}
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-[#638379]" />
                          <span>
                            {(task.start_time || task.scheduled_start) && (task.end_time || task.scheduled_end)
                              ? `${task.start_time || task.scheduled_start} - ${task.end_time || task.scheduled_end} (~${task.estimated_hours}h)`
                              : `~${task.estimated_hours}h`}
                          </span>
                        </span>
                        {task.deadline && (
                          <span>Due: {task.deadline}</span>
                        )}
                        <span className="capitalize">{task.priority} Priority</span>
                        {task.flexibility === 'high' && (
                          <span className="text-[#1F6B4F] font-semibold">High Flexibility</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {!isDone && (
                      <button
                        onClick={() => handlePostpone(task)}
                        className="text-[11px] font-medium text-[#152F26] hover:text-[#0D211A] bg-[#EDF3EE] hover:bg-[#E3F2E9] px-2.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer border border-[#D2E2D8]"
                        title="Safely postpone to tomorrow without overdue penalties"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-[#638379]" />
                        <span>Push to Tomorrow</span>
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1.5 text-[#638379] hover:text-[#152F26] hover:bg-[#EDF3EE] rounded-lg transition-colors cursor-pointer"
                      title="Edit activity"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 text-[#638379]/50 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="lumora-card p-12 text-center text-[#638379] space-y-2">
              <p className="text-sm font-semibold">No tasks in this category.</p>
              <p className="text-xs">Add one using Smart Capture.</p>
            </div>
          )}
        </div>
      )}

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      />
    </div>
  );
}
