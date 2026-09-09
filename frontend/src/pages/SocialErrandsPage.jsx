import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, Plus, Calendar, Clock, Sparkles, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import TaskEditModal from '../components/TaskEditModal';

export default function SocialErrandsPage() {
  const { setSmartCaptureOpen, refreshKey, editingTask, setEditingTask } = useAuth();
  const [socialTasks, setSocialTasks] = useState([]);
  const [errandTasks, setErrandTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const socials = await api.getTasks('social');
      const errands = await api.getTasks('errand');
      setSocialTasks(socials);
      setErrandTasks(errands);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [refreshKey]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAE3] pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8EFE8] text-[#88A788] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#354546] tracking-tight">Social Commitments & Errands</h1>
            <p className="text-xs text-[#798990]">Managing everyday life demands and social battery</p>
          </div>
        </div>

        <button
          onClick={() => setSmartCaptureOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#88A788] hover:bg-[#759475] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Commitment</span>
        </button>
      </div>

      {/* Autopilot Principle Note */}
      <div className="lumora-card p-5 bg-[#F4F1E5] border-[#E2DEC9] flex items-start space-x-3">
        <Sparkles className="w-5 h-5 text-[#88A788] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-[#354546] uppercase tracking-wider">Flexible Load Buffer</h3>
          <p className="text-xs text-[#354546] leading-relaxed">
            Errands like grocery shopping and flexible social hangouts are the primary lever for stress reduction. When your FYP or exam deadlines peak, Lumora moves these to your low-stress Sunday buffer rather than letting you burn out midweek.
          </p>
        </div>
      </div>

      {/* Two columns: Social and Errands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Social commitments */}
        <div className="lumora-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5EAE3] pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#88A788]" />
              <h3 className="text-sm font-bold text-[#354546]">Social Commitments</h3>
            </div>
            <span className="text-xs text-[#798990] font-medium">{socialTasks.length} events</span>
          </div>

          <div className="space-y-3">
            {socialTasks.length > 0 ? (
              socialTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setEditingTask(t)}
                  className="p-3.5 rounded-xl bg-[#F8F9F3] hover:bg-[#EEF2EC] border border-[#E5EAE3] space-y-1.5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#354546]">{t.title}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8EFE8] text-[#354546] border border-[#D3DCD0]">
                        {t.flexibility} flexibility
                      </span>
                      <Edit3 className="w-3 h-3 text-[#8A9B9D]" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[#798990]">
                    <span>~{t.estimated_hours}h duration</span>
                    <span>{t.deadline || t.scheduled_date || 'Upcoming'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#798990]">No social commitments recorded.</p>
            )}
          </div>
        </div>

        {/* Errands & Household */}
        <div className="lumora-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5EAE3] pb-3">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-[#88A788]" />
              <h3 className="text-sm font-bold text-[#354546]">Errands & Household</h3>
            </div>
            <span className="text-xs text-[#798990] font-medium">{errandTasks.length} tasks</span>
          </div>

          <div className="space-y-3">
            {errandTasks.length > 0 ? (
              errandTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setEditingTask(t)}
                  className="p-3.5 rounded-xl bg-[#F8F9F3] hover:bg-[#EEF2EC] border border-[#E5EAE3] space-y-1.5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#354546]">{t.title}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#B3E8C0] text-[#354546]">
                        High Flexibility
                      </span>
                      <Edit3 className="w-3 h-3 text-[#8A9B9D]" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[#798990]">
                    <span>~{t.estimated_hours}h</span>
                    <span>Scheduled: {t.scheduled_date || 'Midweek'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#798990]">No errands pending.</p>
            )}
          </div>
        </div>
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
