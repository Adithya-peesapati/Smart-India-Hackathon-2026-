import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X, ArrowLeft, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CancelBookingConfirmationModalProps {
  isOpen: boolean;
  onContinueBooking: () => void;
  onConfirmCancel: () => void;
}

export const CancelBookingConfirmationModal: React.FC<CancelBookingConfirmationModalProps> = ({
  isOpen,
  onContinueBooking,
  onConfirmCancel,
}) => {
  const { t } = useLanguage();

  // Pressing Escape key safely keeps the user on the booking page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onContinueBooking();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onContinueBooking]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="cancel-booking-modal-container"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
          aria-describedby="cancel-booking-desc"
        >
          {/* Backdrop (clicking safely dismisses popup and continues booking) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onContinueBooking}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs z-0"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#0C2218] rounded-2xl border border-slate-200/90 dark:border-emerald-800/80 shadow-2xl overflow-hidden p-6 sm:p-7"
          >
            {/* Top Close Button (acts as safe Continue Booking) */}
            <button
              id="cancel-booking-close-btn"
              type="button"
              onClick={onContinueBooking}
              className="absolute top-4 right-4 p-1.5 text-slate-400 dark:text-emerald-400/60 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
              aria-label="Close dialog and continue booking"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Body */}
            <div className="flex flex-col items-center text-center space-y-4 pt-1">
              {/* Alert Warning Icon */}
              <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/90 dark:border-amber-900/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <AlertCircle className="w-7 h-7" />
              </div>

              {/* Title & Description as explicitly required */}
              <div className="space-y-2">
                <h3
                  id="cancel-booking-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Public_Sans']"
                >
                  {t('booking.cancel_modal_title', 'Are you sure you want to cancel?')}
                </h3>
                <p
                  id="cancel-booking-desc"
                  className="text-xs sm:text-sm text-slate-500 dark:text-emerald-100/70 leading-relaxed px-2"
                >
                  {t('booking.cancel_modal_desc', 'Your current booking progress will be lost.')}
                </p>
              </div>

              {/* Action Buttons: Continue Booking is primary safe action, Yes, Cancel is secondary/destructive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-3">
                {/* Secondary / Destructive Action: Yes, Cancel */}
                <button
                  id="cancel-booking-confirm-btn"
                  type="button"
                  onClick={onConfirmCancel}
                  className="order-2 sm:order-1 w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100/80 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-900/70 rounded-xl transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('booking.yes_cancel_btn', 'Yes, Cancel')}</span>
                </button>

                {/* Primary Safe Action: Continue Booking */}
                <button
                  id="cancel-booking-continue-btn"
                  type="button"
                  autoFocus
                  onClick={onContinueBooking}
                  className="order-1 sm:order-2 w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ring-2 ring-emerald-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('booking.continue_booking_btn', 'Continue Booking')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
