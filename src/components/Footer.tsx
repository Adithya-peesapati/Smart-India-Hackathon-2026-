import React from 'react';
import { Logo } from './Logo';
import { UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigate: (page: string) => void;
  currentUser?: UserProfile | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentUser }) => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-slate-100/80 dark:bg-[#06120C] border-t border-slate-200 dark:border-emerald-950 text-slate-600 dark:text-emerald-200/70 text-xs py-8 mt-auto transition-colors duration-200">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <div className="cursor-pointer" onClick={() => onNavigate(currentUser ? 'dashboard' : 'home')}>
              <Logo size="sm" showText={true} />
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-emerald-900">|</span>
            <p className="text-slate-500 dark:text-emerald-300/60">
              © {new Date().getFullYear()} AgriSetu. Smart India Hackathon PS 26032.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-slate-600 dark:text-emerald-200/80 font-medium">
            <button
              type="button"
              onClick={() => onNavigate('privacy-policy')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {t('footer.privacy', 'Privacy Policy')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('terms-of-service')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {t('footer.terms', 'Terms of Service')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('help')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {t('footer.support', 'Support Center')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {t('footer.partner', 'Partner Portal')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
