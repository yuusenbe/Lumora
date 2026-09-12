import React, { useState, useEffect } from 'react';
import { BookOpen, Shield, Clock, Plus, CheckCircle2, Circle, AlertCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import TaskEditModal from '../components/TaskEditModal';

export default function AcademicPage() {
  const { setSmartCaptureOpen, refreshKey, triggerRefresh, editingTask, setEditingTask } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAcademicTasks = async () => {
    try {
      const data = await api.getTasks('academic');
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademicTasks();
  }, [refreshKey]);

  const toggleComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    await api.updateTask(task.id, {
      status: nextStatus,
      progress: nextStatus === 'completed' ? 100 : 40
    });
    triggerRefresh();
  };

  const toggleShield = async (task) => {
    await api.updateTask(task.id, {
      is_protected: !task.is_protected
    });
    triggerRefresh();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D2E2D8] pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF4FB] text-[#2B6CB0] border border-[#BFDBFE] flex items-center justify-center shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#152F26] tracking-tight font-display">Academic Responsibilities</h1>
            <p className="text-xs text-[#4A675E]">Milestones, focus blocks, and coursework progression</p>
          </div>
        </div>

        <button
          onClick={() => setSmartCaptureOpen(true)}
          className="btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Task</span>
        </button>
      </div>

      {/* Deep Work Protection Notice */}
      <div
        style={{
          background: '#FFFFFF',
          borderColor: '#D2E2D8'
        }}
        className="lumora-card p-5 flex items-start space-x-3.5 shadow-xs border"
      >
        <Shield className="w-5 h-5 text-[#2B6CB0] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-[#152F26] uppercase tracking-wider">Protected Focus Shielding</h3>
          <p className="text-xs text-[#4A675E] leading-relaxed">
            High-cognitive tasks like your FYP methodology require uninterrupted flow. When an academic task is shielded, Lumora will decline automated shifts and protect evening buffer slots around it.
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#4A675E] uppercase tracking-wider">Coursework & Assignments</h3>

        {loading ? (
          <p className="text-xs text-[#638379]">Loading academic tasks...</p>
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  style={{
                    background: '#FFFFFF',
                    borderColor: '#D2E2D8'
                  }}
                  className={`lumora-card p-5 flex items-start justify-between gap-4 transition-all shadow-xs border ${
                    isDone ? 'opacity-60 bg-[#F4F8F5]' : 'hover:border-[#1F6B4F]/60'
                  }`}
                >
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleComplete(task)}
                      className="mt-0.5 text-[#638379]/50 hover:text-[#1F6B4F] transition-colors cursor-pointer"
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5 text-[#1F6B4F] fill-[#E3F2E9]" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold truncate ${isDone ? 'line-through text-[#638379]' : 'text-[#152F26]'}`}>
                          {task.title}
                        </span>
                        {task.is_protected ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                            Shielded Focus
                          </span>
                        ) : null}
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 h-2 bg-[#EDF3EE] rounded-full overflow-hidden p-0.5">
                          <div
                            style={{ width: `${task.progress || 0}%` }}
                            className="h-full bg-[#2B6CB0] rounded-full transition-all duration-500"
                          />
                        </div>
                        <span className="text-xs text-[#4A675E] font-semibold whitespace-nowrap">
                          {task.progress || 0}% complete
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-[#638379] pt-1">
                        <span className="flex items-center space-x-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#638379]" />
                          <span>~{task.estimated_hours}h focus</span>
                        </span>
                        {task.deadline && (
                          <span>Due: {task.deadline}</span>
                        )}
                        <span className="capitalize">{task.priority} Priority</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1.5 text-[#638379] hover:text-[#152F26] hover:bg-[#EDF3EE] rounded-lg transition-colors cursor-pointer"
                      title="Edit Activity"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleShield(task)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        task.is_protected
                          ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                          : 'bg-[#EDF3EE] text-[#152F26] border-[#D2E2D8] hover:bg-[#E3F2E9]'
                      }`}
                    >
                      {task.is_protected ? 'Protected' : 'Protect Slot'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#638379]">No academic tasks pending.</p>
        )}
      </div>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
      />
    </div>
  );
}
