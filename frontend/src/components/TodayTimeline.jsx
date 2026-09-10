import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  Briefcase,
  Users,
  Activity,
  ShoppingCart,
  ChevronRight,
  Shield,
  Edit3,
  CalendarClock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import TaskEditModal from './TaskEditModal';

export default function TodayTimeline({ tasks, totalCount, onTaskUpdated }) {
  const { setCurrentView, triggerRefresh, editingTask, setEditingTask } = useAuth();
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

  const handleToggleComplete = async (task, e) => {
    e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const newProgress = newStatus === 'completed' ? 100 : 50;

    if (newStatus === 'completed') {
      // Gentle subtle celebratory confetti
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#88A788', '#B3E8C0', '#F4F1E5']
      });
    }

    try {
      await api.updateTask(task.id, {
        status: newStatus,
        progress: newProgress
      });
      triggerRefresh();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostpone = async (task, e) => {
    e.stopPropagation();
    try {
      const res = await api.postponeTask(task.id, 1);
      setPostponeMessage(res.message || `Moved '${task.title}' to tomorrow. Energy preserved!`);
      setTimeout(() => setPostponeMessage(''), 4000);
      triggerRefresh();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="lumora-card p-6 sm:p-7 space-y-4">
      <div className="flex items-center justify-between border-b border-[#EEF2EC] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-[#354546] tracking-tight">
              Today's Focus
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#F0F5EF] text-[#557755] border border-[#DEE7DD]">
              Rule of 3
            </span>
          </div>
          <p className="text-xs text-[#798990]">
            Guarding your attention against cognitive fragmentation
          </p>
        </div>

        <button
          onClick={() => setCurrentView('tasks')}
          className="text-xs font-semibold text-[#6E8E6E] hover:text-[#557755] flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Guilt-Free Postpone Positive Toast */}
      {postponeMessage && (
        <div className="p-3 rounded-xl bg-[#F0F6EF] border border-[#D0E2CF] text-[#335533] text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#88A788]" />
            <span>{postponeMessage}</span>
          </div>
          <button onClick={() => setPostponeMessage('')} className="text-[#557755] text-[11px] hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {tasks && tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.slice(0, 3).map((task, index) => {
            const Icon = getCategoryIcon(task.category);
            const isDone = task.status === 'completed';
            const progress = task.progress || (isDone ? 100 : 30);

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-[#F8FAF6] border-[#E8ECE6] opacity-60'
                    : 'bg-white border-[#E2E8DF] shadow-2xs hover:border-[#D0DAD0]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Complete Checkbox button */}
                  <button
                    onClick={(e) => handleToggleComplete(task, e)}
                    className="mt-0.5 text-[#A0AEB0] hover:text-[#88A788] transition-colors cursor-pointer"
                    title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#88A788] fill-[#F0F7F1]" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 truncate min-w-0">
                        <span className="text-xs font-mono text-[#8A9B9D] font-semibold">
                          0{index + 1}.
                        </span>
                        <p
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-[#8A9B9D]' : 'text-[#354546]'
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.is_protected ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF7EE] text-[#8C6D3A] border border-[#EBE4D0] shrink-0">
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
                        className="p-1 text-[#8A9B9D] hover:text-[#88A788] hover:bg-[#E8EFE8] rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Edit Activity"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress over Deadlines indicator in Soft Sage */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-1.5 bg-[#EBF0E9] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${progress}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDone ? 'bg-[#88A788]' : 'bg-[#7A987A]'
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-[#798990] whitespace-nowrap">
                        {progress}% done
                      </span>
                    </div>

                    {/* Meta info: duration & category & Guilt-Free Postpone Action */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center space-x-3 text-[11px] text-[#798990]">
                        <span className="flex items-center space-x-1">
                          <Icon className="w-3 h-3 text-[#8A9B9D]" />
                          <span className="capitalize">{task.category}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-[#88A788]" />
                          <span>
                            {(task.start_time || task.scheduled_start) && (task.end_time || task.scheduled_end)
                              ? `${task.start_time || task.scheduled_start} - ${task.end_time || task.scheduled_end} (~${task.estimated_hours}h)`
                              : `~${task.estimated_hours}h`}
                          </span>
                        </span>
                        {task.flexibility === 'high' && (
                          <span className="text-[#557755] font-semibold">Flexible</span>
                        )}
                      </div>

                      {!isDone && (
                        <button
                          onClick={(e) => handlePostpone(task, e)}
                          className="text-[10.5px] font-bold text-[#688868] hover:text-[#425E42] bg-[#F2F7F1] hover:bg-[#E5F0E3] px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer shrink-0 border border-[#DCE8DB]"
                          title="Safely reschedule to tomorrow without overdue penalties"
                        >
                          <CalendarClock className="w-3 h-3 text-[#88A788]" />
                          <span>Push to Tomorrow</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-[#8A9B9D] space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-[#88A788] opacity-60" />
          <p className="text-sm font-medium">Your week is still open.</p>
          <p className="text-xs">Add something you're carrying using Smart Capture.</p>
        </div>
      )}

      {totalCount > 3 && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setCurrentView('tasks')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            + {totalCount - 3} more scheduled responsibilities hidden to protect focus
          </button>
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
