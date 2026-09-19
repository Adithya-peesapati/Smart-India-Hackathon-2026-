import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-10 shadow-2xs max-w-4xl mx-auto my-6 space-y-6 animate-in fade-in-50 text-xs sm:text-sm text-slate-600 dark:text-emerald-100/70 leading-relaxed">
      <div className="border-b border-slate-200 dark:border-emerald-900/60 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Agricultural Data Governance</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400 dark:text-emerald-300/60">Last Updated: Public Procurement Season 2025</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">1. Data Collection & Purpose</h3>
        <p>
          AgriSetu collects necessary farmer identification records (Farmer Registration Number, Aadhaar-linked DBT account, Contact number, land acreage, and crop harvest volume) exclusively for authenticating procurement slot allocations, electronic weighbridge verification, and direct bank settlement.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">2. Storage & Security</h3>
        <p>
          Farmer records are securely maintained in accordance with national digital data protection standards. Bank account and identification records are encrypted at rest and in transit.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">3. Sharing with Mandi & Government Agencies</h3>
        <p>
          Procurement logs, weighbridge weights, and settlement vouchers are synchronized with the Public Financial Management System (PFMS) and the relevant State Mandi Board for audit and MSP subsidy disbursements.
        </p>
      </div>
    </div>
  );
};
