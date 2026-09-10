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
import CalendarView from '../components/CalendarView';
import TaskEditModal from '../components/TaskEditModal';

export default function AllTasksPage() {
  const { setSmartCaptureOpen, refreshKey, triggerRefresh, editingTask, setEditingTask } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewType, setViewType] = useState('list'); // 'list' | 'calendar'
  const [postponeToast, setPostponeToast] = useState('');

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
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#88A788', '#B3E8C0', '#F4F1E5']
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAE3] pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8EFE8] text-[#88A788] flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#354546] tracking-tight">Full Schedule & Tasks</h1>
            <p className="text-xs text-[#798990]">Every commitment contributing to your capacity score</p>
          </div>
        </div>

        <button
          onClick={() => setSmartCaptureOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#88A788] hover:bg-[#759475] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Capture New Task</span>
        </button>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category filter pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#88A788] text-white shadow-xs'
                  : 'bg-white text-[#354546] border border-[#E5EAE3] hover:bg-[#F8F9F3]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* View Switcher: List vs Calendar */}
        <div className="flex items-center self-start sm:self-auto bg-white p-1 rounded-xl border border-[#E5EAE3] shadow-xs shrink-0">
          <button
            onClick={() => setViewType('list')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewType === 'list'
                ? 'bg-[#88A788] text-white shadow-xs'
                : 'text-[#798990] hover:text-[#354546]'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewType('calendar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewType === 'calendar'
                ? 'bg-[#88A788] text-white shadow-xs'
                : 'text-[#798990] hover:text-[#354546]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Guilt-Free Postpone Positive Toast */}
      {postponeToast && (
        <div className="p-3.5 rounded-2xl bg-[#F0F6EF] border border-[#D0E2CF] text-[#335533] text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{postponeToast}</span>
          <button onClick={() => setPostponeToast('')} className="text-[#557755] text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Content: List View vs Calendar View */}
      {loading ? (
        <div className="lumora-card p-12 text-center text-[#798990]">
          <p className="text-xs font-semibold">Loading schedule...</p>
        </div>
      ) : viewType === 'calendar' ? (
        <CalendarView
          tasks={tasks}
          selectedCategory={selectedCategory}
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
                        <span className={`text-sm font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-[#354546]'}`}>
                          {task.title}
                        </span>
                        {task.is_protected ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#B3E8C0] text-[#354546] border border-[#94B094]">
                            Shielded
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#798990]">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-[#F4F1E5] text-[#354546] font-medium border border-[#E2DEC9]">
                          {task.category}
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-[#88A788]" />
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
                          <span className="text-[#88A788] font-semibold">High Flexibility</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {!isDone && (
                      <button
                        onClick={() => handlePostpone(task)}
                        className="text-[11px] font-bold text-[#557755] hover:text-[#385538] bg-[#F2F7F1] hover:bg-[#E2EEE1] px-2.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1 cursor-pointer border border-[#D5E5D4]"
                        title="Safely postpone to tomorrow without overdue penalties"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-[#88A788]" />
                        <span>Push to Tomorrow</span>
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1.5 text-slate-400 hover:text-[#88A788] hover:bg-[#E8EFE8] rounded-lg transition-colors cursor-pointer"
                      title="Edit activity"
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
            })
          ) : (
            <div className="lumora-card p-12 text-center text-slate-400 space-y-2">
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
