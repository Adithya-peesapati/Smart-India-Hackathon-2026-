import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { Check, Search, ChevronDown } from 'lucide-react';

const LanguageBubbleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <path d="M9.5 14l2.5-6 2.5 6" />
    <path d="M10.3 12.2h3.4" />
  </svg>
);

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { currentLanguage, setLanguage, activeLanguageInfo, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-slate-200/90 dark:border-emerald-800/70 bg-white dark:bg-[#0E2419] text-slate-800 dark:text-emerald-100 hover:bg-slate-50 dark:hover:bg-[#143224] hover:border-emerald-500/40 text-xs font-semibold shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
        aria-label={t('language.select_title', 'Select Language')}
        title={t('language.select_title', 'Select Language')}
      >
        <LanguageBubbleIcon className="w-4 h-4 text-[#0D6832] dark:text-emerald-400 shrink-0" />
        <span className="font-bold tracking-tight">{activeLanguageInfo.nativeName}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold uppercase">
          {activeLanguageInfo.code}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-emerald-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Language Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0B1E16] border border-slate-200 dark:border-emerald-800/80 shadow-2xl z-50 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Search */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-emerald-900/60">
            <div className="flex items-center gap-1.5">
              <LanguageBubbleIcon className="w-4 h-4 text-[#0D6832] dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('language.select_title', 'Select Language')}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              {SUPPORTED_LANGUAGES.length} {t('language.languages_count', 'Languages')}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('language.search_placeholder', 'Search language (e.g. Telugu, हिन्दी)...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-emerald-900 bg-slate-50 dark:bg-[#07130E] text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0D6832]"
              autoFocus
            />
          </div>

          {/* Languages List */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredLanguages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#EAF7EE] dark:bg-emerald-950/90 text-[#0D6832] dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700 shadow-2xs'
                      : 'hover:bg-slate-100 dark:hover:bg-[#143224] text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>{lang.nativeName}</span>
                        <span className="text-[10px] opacity-60">({lang.name})</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#0D6832] dark:text-emerald-400 shrink-0" />}
                </button>
              );
            })}
            {filteredLanguages.length === 0 && (
              <p className="text-xs text-center py-4 text-slate-400">{t('language.no_matches', 'No language matches found.')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
