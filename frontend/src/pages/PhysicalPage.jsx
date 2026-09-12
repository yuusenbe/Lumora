import React, { useState, useEffect } from 'react';
import { Activity, Moon, BatteryCharging, Dumbbell, AlertCircle, Save, Edit3, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import TaskEditModal from '../components/TaskEditModal';

export default function PhysicalPage() {
  const { refreshKey, triggerRefresh, editingTask, setEditingTask } = useAuth();
  const [sleepHours, setSleepHours] = useState(6.8);
  const [physicalFatigue, setPhysicalFatigue] = useState(3);
  const [tasks, setTasks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadData = async () => {
    try {
      const latest = await api.getLatestCheckin();
      if (latest) {
        setSleepHours(latest.sleep_hours || 6.8);
        setPhysicalFatigue(latest.physical_fatigue || 3);
      }
      const physTasks = await api.getTasks('physical');
      setTasks(physTasks);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleUpdateSleep = async () => {
    setSaving(true);
    try {
      await api.createCheckin({
        stress: 3,
        mood: 3,
        mental_fatigue: 3,
        physical_fatigue: physicalFatigue,
        sleep_hours: parseFloat(sleepHours) || 7.0,
        notes: 'Sleep hours updated'
      });
      setSavedSuccess(true);
      triggerRefresh();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const sleepDeficit = Math.max(0, 7.5 - sleepHours);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3.5 border-b border-[#D2E2D8] pb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#E3F2E9] text-[#1F6B4F] border border-[#C2E2D0] flex items-center justify-center shadow-2xs">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#152F26] tracking-tight font-display">Physical Energy & Sleep</h1>
          <p className="text-xs text-[#638379]">Sleep reserve, physical recovery, and training intensity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sleep Tracker Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderColor: '#D2E2D8'
          }}
          className="lumora-card p-6 sm:p-7 space-y-5 shadow-xs border"
        >
          <div className="flex items-center space-x-2 border-b border-[#D2E2D8] pb-3">
            <Moon className="w-4 h-4 text-[#1F6B4F]" />
            <h3 className="text-base font-bold text-[#152F26] font-display">Sleep Duration Last Night</h3>
          </div>

          <div className="flex items-baseline space-x-3">
            <input
              type="number"
              step="0.1"
              min="0"
              max="16"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
              className="text-4xl font-extrabold text-[#152F26] w-28 border-b-2 border-[#1F6B4F] focus:outline-none bg-transparent font-display"
            />
            <span className="text-[#638379] text-sm font-semibold">hours of sleep</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#638379] font-medium">
              <span>Your sleep: {sleepHours}h</span>
              <span>Target: 7.5h</span>
            </div>
            <div className="w-full h-2 bg-[#E4ECE7] rounded-full overflow-hidden p-0.5">
              <div
                style={{ width: `${Math.min(100, (sleepHours / 8) * 100)}%` }}
                className={`h-full rounded-full transition-all ${
                  sleepHours >= 7.0 ? 'bg-[#1F6B4F]' : 'bg-[#D97706]'
                }`}
              />
            </div>
          </div>

          {sleepDeficit > 0 ? (
            <div className="p-3.5 rounded-xl bg-[#FAF6EC] border border-[#DFD6C3] text-xs text-[#645233] leading-relaxed">
              <span className="font-bold">Sleep Buffer Deficit:</span> You are ~{sleepDeficit.toFixed(1)}h below restorative baseline. Lumora will recommend shortening high-intensity workouts to light mobility today.
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#E3F2E9] border border-[#C2E2D0] text-xs text-[#152F26]">
              <span className="font-bold">Restored:</span> Sleep duration meets cognitive consolidation standards.
            </div>
          )}

          <button
            onClick={handleUpdateSleep}
            disabled={saving}
            className="btn-primary w-full py-3 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Updating...' : 'Save Sleep Data'}</span>
          </button>
        </div>

        {/* Physical Exercise & Fatigue */}
        <div
          style={{
            background: '#FFFFFF',
            borderColor: '#D2E2D8'
          }}
          className="lumora-card p-6 sm:p-7 space-y-5 shadow-xs border"
        >
          <div className="flex items-center space-x-2 border-b border-[#D2E2D8] pb-3">
            <Dumbbell className="w-4 h-4 text-[#1F6B4F]" />
            <h3 className="text-base font-bold text-[#152F26] font-display">Physical Activities</h3>
          </div>

          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setEditingTask(t)}
                  className="p-3.5 rounded-xl bg-[#EDF3EE] hover:bg-[#E3F2E9] border border-[#D2E2D8] space-y-1.5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#152F26]">{t.title}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C2E2D0] text-[#152F26] border border-[#A5D4BA]">
                        {t.flexibility === 'high' ? 'High Flexibility' : 'Fixed'}
                      </span>
                      <Edit3 className="w-3 h-3 text-[#638379]" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-[#638379]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{t.estimated_hours}h</span>
                    </span>
                    <span className="capitalize">{t.priority} Priority</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#638379] italic p-4 text-center">
                No physical workouts scheduled this week.
              </p>
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
