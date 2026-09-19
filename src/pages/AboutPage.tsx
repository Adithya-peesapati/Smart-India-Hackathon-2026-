import React from 'react';
import { Logo } from '../components/Logo';
import { CheckCircle2, ShieldCheck, Layers, Wheat, Building2, Users } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 animate-in fade-in-50 max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-block">
          <Logo size="lg" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
          About AgriSetu
        </h1>
        <p className="text-sm text-slate-600 dark:text-emerald-200/70 max-w-2xl mx-auto leading-relaxed">
          Smart India Hackathon Problem Statement 26032: Transforming public agricultural procurement through algorithmic scheduling, live queue tracking, and direct benefit transparency.
        </p>
      </div>

      {/* Problem Statement 26032 Overview */}
      <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-8 shadow-2xs space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/80">
          The Challenge (SIH PS 26032)
        </span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
          Eliminating Mandi Congestion & Promoting Transparent MSP Operations
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-100/70 leading-relaxed">
          During peak agricultural harvest seasons (Rabi & Kharif), millions of quintals of grain arrive at public procurement centres simultaneously. Without dynamic scheduling, thousands of farmers endure 6 to 12 hours of idling tractor queues, leading to spoilage risk, traffic disruption, and lack of clarity on daily quotas.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-100/70 leading-relaxed">
          <strong>AgriSetu</strong> resolves this challenge by providing an end-to-end digital coordination platform between state agriculture departments, Mandi boards, certified weighbridges, and farmers.
        </p>
      </div>

      {/* Key Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-2">
          <Layers className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">Dynamic Slot Allocation</h4>
          <p className="text-xs text-slate-500 dark:text-emerald-200/70 leading-relaxed">
            Matches farmer harvest volume with available daily weighbridge and warehouse capacities, guaranteeing zero queue overflows.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">Live Telemetry & Token Queues</h4>
          <p className="text-xs text-slate-500 dark:text-emerald-200/70 leading-relaxed">
            Real-time digital token issuance with mobile notifications allows farmers to leave home only when their turn is near.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-2">
          <Wheat className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">Fair Quality & Moisture Logging</h4>
          <p className="text-xs text-slate-500 dark:text-emerald-200/70 leading-relaxed">
            Transparent recording of moisture testing (≤ 12%) and dockage checks to prevent arbitrary deductions.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-2">
          <Building2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">Direct Benefit Transfer (DBT)</h4>
          <p className="text-xs text-slate-500 dark:text-emerald-200/70 leading-relaxed">
            Automatic J-Form invoice generation and direct electronic settlement into the farmer's verified bank account.
          </p>
        </div>
      </div>
    </div>
  );
};
