import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-slate-200 shadow-2xs ${className}`}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-4 border border-slate-200">
        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 font-['Public_Sans']">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all rounded-lg shadow-xs cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
