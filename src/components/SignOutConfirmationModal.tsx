import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SignOutConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SignOutConfirmationModal: React.FC<SignOutConfirmationModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const { t } = useLanguage();

  // Handle escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="signout-modal-container"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs z-0"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#0C2218] rounded-2xl border border-slate-200/90 dark:border-emerald-800/80 shadow-2xl overflow-hidden p-6 sm:p-7"
          >
            {/* Top Close Button */}
            <button
              id="signout-modal-close-btn"
              type="button"
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 text-slate-400 dark:text-emerald-400/60 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col items-center text-center space-y-4 pt-1">
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                <LogOut className="w-6 h-6 ml-0.5" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3
                  id="signout-modal-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Public_Sans']"
                >
                  {t('signout.title', 'Are you sure you want to sign out?')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-100/70 leading-relaxed px-2">
                  {t(
                    'signout.desc',
                    'You will be logged out of your active farmer session. You can sign back in at any time to manage your slot bookings, live mandi queue, and transaction receipts.'
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full pt-3">
                <button
                  id="signout-cancel-btn"
                  type="button"
                  onClick={onCancel}
                  className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-emerald-200 bg-slate-100 dark:bg-[#153424] hover:bg-slate-200 dark:hover:bg-[#1c4530] border border-slate-200 dark:border-emerald-800 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  {t('signout.cancel_btn', 'Cancel')}
                </button>
                <button
                  id="signout-confirm-btn"
                  type="button"
                  onClick={onConfirm}
                  className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 rounded-xl shadow-xs transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('signout.confirm_btn', 'Sign Out')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
