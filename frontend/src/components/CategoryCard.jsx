import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CategoryCard({ id, title, subtitle, icon: Icon, color, bgLight, badge, metric, onClick }) {
  const { setCurrentView } = useAuth();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      setCurrentView(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: '#FFFFFF',
        borderColor: '#D2E2D8'
      }}
      className="lumora-card p-4 sm:p-4.5 cursor-pointer hover:border-[#1F6B4F]/60 transition-all flex flex-col justify-between space-y-3 group shadow-xs hover:shadow-md border rounded-2xl"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div
            style={{ backgroundColor: bgLight || '#E3F2E9', color: color }}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#152F26] group-hover:text-[#1F6B4F] transition-colors font-display truncate">
              {title}
            </h4>
            <p className="text-[11px] text-[#638379] truncate">{subtitle}</p>
          </div>
        </div>
        <ArrowUpRight
          style={{ color: '#638379' }}
          className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#152F26] transition-all shrink-0 ml-1"
        />
      </div>

      <div
        className="flex items-center justify-between pt-2.5 border-t border-[#D2E2D8] text-xs"
      >
        <span className="font-bold text-[#152F26] text-xs truncate">{metric}</span>
        {badge && (
          <span
            style={{ backgroundColor: bgLight || '#E3F2E9', color: color }}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1"
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
