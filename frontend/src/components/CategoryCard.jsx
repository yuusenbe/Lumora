import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CategoryCard({ id, title, subtitle, icon: Icon, color, bgLight, badge, metric }) {
  const { setCurrentView } = useAuth();

  return (
    <div
      onClick={() => setCurrentView(id)}
      className="lumora-card p-5 sm:p-6 cursor-pointer hover:scale-[1.01] transition-all flex flex-col justify-between space-y-4 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            style={{ backgroundColor: bgLight, color: color }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#88A788] transition-colors">
              {title}
            </h4>
            <p className="text-xs text-slate-500 line-clamp-1">{subtitle}</p>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <span className="font-semibold text-slate-700">{metric}</span>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
