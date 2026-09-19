import React from 'react';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-10 shadow-2xs max-w-4xl mx-auto my-6 space-y-6 animate-in fade-in-50 text-xs sm:text-sm text-slate-600 dark:text-emerald-100/70 leading-relaxed">
      <div className="border-b border-slate-200 dark:border-emerald-900/60 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
          <FileText className="w-4 h-4" />
          <span>Procurement Regulations</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400 dark:text-emerald-300/60">Effective Date: Rabi & Kharif 2025</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">1. Mandi Slot Booking & Fair Queuing</h3>
        <p>
          Each digital slot reservation represents an allocated window for electronic weighbridge processing. Farmers are requested to arrive within 30 minutes of their assigned slot window with their QR pass.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">2. Quality Standards (Moisture & Foreign Matter)</h3>
        <p>
          All grain deliveries are subject to standard Fair Average Quality (FAQ) norms. Crops exceeding statutory moisture limits (e.g. &gt;12% for wheat) may require pre-cleaning/drying before final weighment.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">3. Electronic J-Form & Direct Benefit Transfer</h3>
        <p>
          Electronic weighbridge logs are instantly converted into verified J-Form receipts. Payouts are directly credited via PFMS to the registered bank account.
        </p>
      </div>
    </div>
  );
};
