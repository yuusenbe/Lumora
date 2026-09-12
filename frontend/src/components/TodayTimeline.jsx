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
        colors: ['#1F6B4F', '#2E855F', '#BCE7CD']
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
    <div
      style={{
        background: '#FFFFFF',
        borderColor: '#D2E2D8'
      }}
      className="lumora-card p-6 sm:p-7 space-y-4 shadow-xs hover:shadow-md transition-all border"
    >
      <div className="flex items-center justify-between border-b border-[#D2E2D8] pb-3.5">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-[#152F26] tracking-tight font-display">
              Today's Focus
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E3F2E9] text-[#1F6B4F] border border-[#C2E2D0]">
              Rule of 3
            </span>
          </div>
          <p className="text-xs text-[#638379] mt-0.5">
            Guarding your attention against cognitive fragmentation
          </p>
        </div>

        <button
          onClick={() => setCurrentView('tasks')}
          className="text-xs font-semibold text-[#1F6B4F] hover:text-[#16533D] flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Guilt-Free Postpone Positive Toast */}
      {postponeMessage && (
        <div className="p-3.5 rounded-xl bg-[#E3F2E9] border border-[#C2E2D0] text-[#152F26] text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#1F6B4F]" />
            <span>{postponeMessage}</span>
          </div>
          <button onClick={() => setPostponeMessage('')} className="text-[#1F6B4F] text-[11px] hover:underline font-bold">
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
                className={`p-4 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-[#EDF3EE]/60 border-[#D2E2D8] opacity-60'
                    : 'bg-white border-[#D2E2D8] shadow-xs hover:border-[#1F6B4F]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Complete Checkbox button */}
                  <button
                    onClick={(e) => handleToggleComplete(task, e)}
                    className="mt-0.5 text-[#638379]/50 hover:text-[#1F6B4F] transition-colors cursor-pointer"
                    title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#1F6B4F] fill-[#E3F2E9]" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 truncate min-w-0">
                        <span className="text-xs font-mono text-[#638379] font-bold">
                          0{index + 1}.
                        </span>
                        <p
                          className={`text-sm font-bold truncate ${
                            isDone ? 'line-through text-[#638379]' : 'text-[#152F26]'
                          }`}
                        >
                          {task.title}
                        </p>
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
                            isDone ? 'bg-[#1F6B4F]/60' : 'bg-[#1F6B4F]'
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
                        <span className="flex items-center space-x-1 font-medium">
                          <Icon className="w-3.5 h-3.5 text-[#638379]" />
                          <span className="capitalize">{task.category}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-[#638379]" />
                          <span>
                            {(task.start_time || task.scheduled_start) && (task.end_time || task.scheduled_end)
                              ? `${task.start_time || task.scheduled_start} - ${task.end_time || task.scheduled_end} (~${task.estimated_hours}h)`
                              : `~${task.estimated_hours}h`}
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
        </div>
      ) : (
        <div className="p-8 text-center text-[#638379] space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-[#1F6B4F]/60" />
          <p className="text-sm font-semibold text-[#152F26]">Your week is still open.</p>
          <p className="text-xs text-[#638379]">Add something you're carrying using Smart Capture.</p>
        </div>
      )}

      {totalCount > 3 && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setCurrentView('tasks')}
            className="text-xs font-semibold text-[#638379] hover:text-[#152F26] transition-colors"
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
