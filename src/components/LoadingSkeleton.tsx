import React from 'react';

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 bg-white rounded-xl border border-slate-200 animate-pulse space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-16" />
          </div>
          <div className="h-3 bg-slate-100 rounded w-2/3" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 bg-slate-200 rounded-full w-20" />
            <div className="h-6 bg-slate-200 rounded-full w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-50 border-b border-slate-200" />
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-100 rounded w-32 hidden sm:block" />
            <div className="h-4 bg-slate-100 rounded w-28" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
            <div className="h-4 bg-slate-200 rounded w-12" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const StatGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="h-3 bg-slate-100 rounded w-20" />
          <div className="h-7 bg-slate-200 rounded w-14" />
        </div>
      ))}
    </div>
  );
};
