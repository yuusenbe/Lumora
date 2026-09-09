import React from 'react';
import { BookOpen, Briefcase, Users, Activity, ShoppingCart, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoadBreakdown({ breakdown }) {
  const { setCurrentView } = useAuth();

  if (!breakdown) return null;

  const categories = [
    {
      id: 'academic',
      name: 'Academic',
      percent: breakdown.academic || 40,
      color: '#3B82F6', // calm blue
      bgColor: 'bg-blue-50',
      icon: BookOpen,
      desc: 'FYP methodology, lectures & study'
    },
    {
      id: 'academic', // routes to academic/work
      name: 'Work',
      percent: breakdown.work || 20,
      color: '#8B5CF6', // violet
      bgColor: 'bg-purple-50',
      icon: Briefcase,
      desc: 'Campus library shifts & part-time hours'
    },
    {
      id: 'social',
      name: 'Social',
      percent: breakdown.social || 12,
      color: '#EC4899', // rose pink
      bgColor: 'bg-pink-50',
      icon: Users,
      desc: 'Group meetings, dinners & hangouts'
    },
    {
      id: 'physical',
      name: 'Physical',
      percent: breakdown.physical || 15,
      color: '#10B981', // emerald
      bgColor: 'bg-emerald-50',
      icon: Activity,
      desc: 'Gym training, sleep debt & stamina'
    },
    {
      id: 'social',
      name: 'Errands',
      percent: breakdown.errands || 8,
      color: '#F59E0B', // amber
      bgColor: 'bg-amber-50',
      icon: ShoppingCart,
      desc: 'Groceries, meal prep & household chores'
    }
  ];

  return (
    <div className="lumora-card p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            Where Your Load Comes From
          </h3>
          <p className="text-xs text-slate-500">
            Combined cognitive, physical, and time commitments
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">100% Total Life Load</span>
      </div>

      <div className="space-y-4">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              onClick={() => setCurrentView(cat.id)}
              className="group cursor-pointer p-2 rounded-xl hover:bg-slate-50/80 transition-all"
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <div className="flex items-center space-x-2">
                  <div
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    className="p-1 rounded-lg"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-800 group-hover:text-[#88A788] transition-colors font-bold">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                    — {cat.desc}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-700 font-bold">{cat.percent}%</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(100, Math.max(2, cat.percent))}%`,
                    backgroundColor: cat.color
                  }}
                  className="h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
