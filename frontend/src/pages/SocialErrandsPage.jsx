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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D2E2D8] pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FCEEF0] text-[#B85D6F] border border-[#FECDD3] flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#152F26] tracking-tight font-display">Social Commitments & Errands</h1>
            <p className="text-xs text-[#4A675E]">Managing everyday life demands and social battery</p>
          </div>
        </div>

        <button
          onClick={() => setSmartCaptureOpen(true)}
          className="btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Commitment</span>
        </button>
      </div>

      {/* Autopilot Principle Note */}
      <div className="lumora-card p-5 bg-[#FEF3C7]/40 border border-[#FDE68A] flex items-start space-x-3.5 shadow-xs">
        <Sparkles className="w-5 h-5 text-[#D97706] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-[#92400E] uppercase tracking-wider">Flexible Load Buffer</h3>
          <p className="text-xs text-[#4A675E] leading-relaxed">
            Errands like grocery shopping and flexible social hangouts are the primary lever for stress reduction. When your FYP or exam deadlines peak, Lumora moves these to your low-stress Sunday buffer rather than letting you burn out midweek.
          </p>
        </div>
      </div>

      {/* Two columns: Social and Errands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Social commitments */}
        <div
          style={{
            background: '#FFFFFF',
            borderColor: '#D2E2D8'
          }}
          className="lumora-card p-6 sm:p-7 space-y-4 shadow-xs border"
        >
          <div className="flex items-center justify-between border-b border-[#D2E2D8] pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#B85D6F]" />
              <h3 className="text-base font-bold text-[#152F26] font-display">Social Commitments</h3>
            </div>
            <span className="text-xs text-[#4A675E] font-medium">{socialTasks.length} events</span>
          </div>

          <div className="space-y-3">
            {socialTasks.length > 0 ? (
              socialTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setEditingTask(t)}
                  className="p-3.5 rounded-xl bg-[#EDF3EE] hover:bg-[#FCEEF0]/60 border border-[#D2E2D8] space-y-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#152F26]">{t.title}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCEEF0] text-[#B85D6F] border border-[#FECDD3]">
                        {t.flexibility} flexibility
                      </span>
                      <Edit3 className="w-3 h-3 text-[#638379]" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[#638379]">
                    <span>~{t.estimated_hours}h duration</span>
                    <span>{t.deadline || t.scheduled_date || 'Upcoming'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#638379]">No social commitments recorded.</p>
            )}
          </div>
        </div>

        {/* Errands & Household */}
        <div
          style={{
            background: '#FFFFFF',
            borderColor: '#D2E2D8'
          }}
          className="lumora-card p-6 sm:p-7 space-y-4 shadow-xs border"
        >
          <div className="flex items-center justify-between border-b border-[#D2E2D8] pb-3">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-[#D97706]" />
              <h3 className="text-base font-bold text-[#152F26] font-display">Errands & Household</h3>
            </div>
            <span className="text-xs text-[#4A675E] font-medium">{errandTasks.length} tasks</span>
          </div>

          <div className="space-y-3">
            {errandTasks.length > 0 ? (
              errandTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setEditingTask(t)}
                  className="p-3.5 rounded-xl bg-[#EDF3EE] hover:bg-[#FEF3C7]/60 border border-[#D2E2D8] space-y-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#152F26]">{t.title}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                        High Flexibility
                      </span>
                      <Edit3 className="w-3 h-3 text-[#638379]" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[#638379]">
                    <span>~{t.estimated_hours}h</span>
                    <span>Scheduled: {t.scheduled_date || 'Midweek'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#638379]">No errands pending.</p>
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
