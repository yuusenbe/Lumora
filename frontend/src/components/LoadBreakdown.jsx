import React from 'react';
import { BookOpen, Briefcase, Users, Activity, ShoppingCart, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoadBreakdown({ breakdown, percentage, onRebalance }) {
  const { setCurrentView } = useAuth();

  if (!breakdown) return null;

  const categories = [
    {
      id: 'academic',
      name: 'Academic Coursework',
      percent: Math.round(breakdown.academic || 40),
      color: '#2B6CB0', // crisp slate blue
      bgColor: 'bg-[#EBF4FB]',
      icon: BookOpen,
      desc: 'FYP methodology, lectures & study'
    },
    {
      id: 'academic', // routes to academic/work
      name: 'Work & Projects',
      percent: Math.round(breakdown.work || 20),
      color: '#705898', // fresh purple
      bgColor: 'bg-[#F3EFF9]',
      icon: Briefcase,
      desc: 'Campus library shifts & part-time hours'
    },
    {
      id: 'physical',
      name: 'Physical & Health',
      percent: Math.round(breakdown.physical || 15),
      color: '#1F6B4F', // lush forest green
      bgColor: 'bg-[#E3F2E9]',
      icon: Activity,
      desc: 'Gym training, sleep debt & stamina'
    },
    {
      id: 'social',
      name: 'Social Hangouts',
      percent: Math.round(breakdown.social || 12),
      color: '#B85D6F', // berry rose
      bgColor: 'bg-[#FCEEF0]',
      icon: Users,
      desc: 'Group meetings, dinners & hangouts'
    },
    {
      id: 'social',
      name: 'Errands & Tasks',
      percent: Math.round(breakdown.errands || 8),
      color: '#D97706', // warm golden amber
      bgColor: 'bg-[#FEF3C7]',
      icon: ShoppingCart,
      desc: 'Groceries, meal prep & household chores'
    }
  ];

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderColor: '#D2E2D8'
      }}
      className="lumora-card p-6 sm:p-7 space-y-5 shadow-xs hover:shadow-md transition-all border"
    >
      <div className="flex items-center justify-between border-b border-[#D2E2D8] pb-3.5">
        <div>
          <h3 className="text-base font-bold text-[#152F26] tracking-tight font-display">
            Where Your Load Comes From
          </h3>
          <p className="text-xs text-[#638379] mt-0.5">
            Combined cognitive, physical, and time commitments
          </p>
        </div>
        <span className="text-[11px] font-bold text-[#1F6B4F] bg-[#E3F2E9] px-2.5 py-1 rounded-full border border-[#C2E2D0]">
          {percentage ? `${percentage}% Total Capacity` : '100% Life Load'}
        </span>
      </div>

      <div className="space-y-3.5">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              onClick={() => setCurrentView(cat.id)}
              className="group cursor-pointer p-2.5 rounded-xl hover:bg-[#EDF3EE] transition-all border border-transparent hover:border-[#D2E2D8]"
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <div className="flex items-center space-x-2.5">
                  <div
                    style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                    className="p-1.5 rounded-lg shrink-0"
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[#152F26] group-hover:text-[#1F6B4F] transition-colors font-bold text-sm">
                    {cat.name}
                  </span>
                  <span className="text-xs text-[#638379] font-normal hidden sm:inline">
                    — {cat.desc}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#152F26] font-extrabold text-sm">{cat.percent}%</span>
                  <ChevronRight className="w-4 h-4 text-[#638379]/60 group-hover:text-[#152F26] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#E4ECE7] rounded-full overflow-hidden p-0.5">
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

      {onRebalance && (
        <div className="pt-2 border-t border-[#D2E2D8]">
          <button
            onClick={onRebalance}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1F6B4F] hover:bg-[#16533D] text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-md shadow-[#1F6B4F]/20 active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D1F0DE]" />
            <span>Rebalance My Week</span>
          </button>
        </div>
      )}
    </div>
  );
}
