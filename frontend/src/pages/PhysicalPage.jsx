import React, { useState, useEffect } from 'react';
import { Activity, Moon, BatteryCharging, Dumbbell, AlertCircle, Save, Edit3 } from 'lucide-react';
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
      <div className="flex items-center space-x-3 border-b border-[#E5EAE3] pb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#E8EFE8] text-[#88A788] flex items-center justify-center">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[#354546] tracking-tight">Physical Energy & Sleep</h1>
          <p className="text-xs text-[#798990]">Sleep reserve, physical recovery, and training intensity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sleep Tracker Card */}
        <div className="lumora-card p-6 sm:p-7 space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#E5EAE3] pb-3">
            <Moon className="w-4 h-4 text-[#88A788]" />
            <h3 className="text-sm font-bold text-[#354546]">Sleep Duration Last Night</h3>
          </div>

          <div className="flex items-baseline space-x-3">
            <input
              type="number"
              step="0.1"
              min="0"
              max="16"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
              className="text-4xl font-extrabold text-[#354546] w-28 border-b-2 border-[#88A788] focus:outline-none bg-transparent"
            />
            <span className="text-[#798990] text-sm font-semibold">hours of sleep</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#798990] font-medium">
              <span>Your sleep: {sleepHours}h</span>
              <span>Target: 7.5h</span>
            </div>
            <div className="w-full h-2 bg-[#E8EFE8] rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (sleepHours / 8) * 100)}%` }}
                className={`h-full rounded-full transition-all ${
                  sleepHours >= 7.0 ? 'bg-[#88A788]' : 'bg-[#C89B6D]'
                }`}
              />
            </div>
          </div>

          {sleepDeficit > 0 ? (
            <div className="p-3 rounded-xl bg-[#F4F1E5] border border-[#E2DEC9] text-xs text-[#354546] leading-relaxed">
              <span className="font-bold">Sleep Buffer Deficit:</span> You are ~{sleepDeficit.toFixed(1)}h below restorative baseline. Lumora will recommend shortening high-intensity workouts to light mobility today.
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#E8EFE8] border border-[#D3DCD0] text-xs text-[#354546]">
              <span className="font-bold">Restored:</span> Sleep duration meets cognitive consolidation standards.
            </div>
          )}

          <button
            onClick={handleUpdateSleep}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-[#88A788] hover:bg-[#759475] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Updating...' : 'Save Sleep Data'}</span>
          </button>
        </div>

        {/* Physical Exercise & Fatigue */}
        <div className="lumora-card p-6 sm:p-7 space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#E5EAE3] pb-3">
            <Dumbbell className="w-4 h-4 text-[#88A788]" />
            <h3 className="text-sm font-bold text-[#354546]">Physical Activities</h3>
          </div>

          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setEditingTask(t)}
                  className="p-3.5 rounded-xl bg-[#F8F9F3] hover:bg-[#EEF2EC] border border-[#E5EAE3] space-y-1.5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#354546]">{t.title}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#B3E8C0] text-[#354546]">
                        {t.flexibility === 'high' ? 'High Flexibility' : 'Fixed'}
                      </span>
                      <Edit3 className="w-3 h-3 text-[#8A9B9D]" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[#798990]">
                    <span>Duration: ~{t.estimated_hours}h</span>
                    <span>{t.scheduled_date || 'Midweek'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#798990]">No strenuous workouts scheduled.</p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[#F4F1E5] text-xs text-[#354546] border border-[#E2DEC9] leading-relaxed">
            <strong className="text-[#354546]">Autopilot Rule:</strong> Workouts marked with <em>high flexibility</em> are automatically suggested for duration trimming (e.g. 60m → 30m) when academic load peaks.
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
