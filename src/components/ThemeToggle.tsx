import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200/90 dark:border-emerald-800/70 bg-white dark:bg-[#0E2419] text-slate-700 dark:text-emerald-300 hover:bg-slate-50 dark:hover:bg-[#143224] hover:border-emerald-500/40 transition-all duration-200 shadow-2xs active:scale-95 cursor-pointer ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4.5 h-4.5 text-emerald-400 transform rotate-0 transition-transform duration-300" />
        ) : (
          <Sun className="w-4.5 h-4.5 text-amber-500 transform rotate-0 transition-transform duration-300" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold ml-2">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
      )}
    </button>
  );
};
