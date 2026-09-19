import React, { useState, useEffect } from 'react';
import { ProcurementCentre } from '../types';
import { centreService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  MapPin,
  Clock,
  Phone,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Wheat,
} from 'lucide-react';

interface CentreDetailPageProps {
  centreId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const CentreDetailPage: React.FC<CentreDetailPageProps> = ({ centreId, onNavigate }) => {
  const [centre, setCentre] = useState<ProcurementCentre | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await centreService.getCentreById(centreId);
      setCentre(data);
      setLoading(false);
    };
    load();
  }, [centreId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 dark:text-emerald-300 animate-pulse">
        Loading procurement centre details...
      </div>
    );
  }

  if (!centre) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 space-y-4 max-w-lg mx-auto shadow-2xs">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Public_Sans']">Procurement Centre Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-emerald-200/70">
          The requested centre details could not be retrieved from the procurement database.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('centres')}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors"
        >
          Back to Centres
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate('centres')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-emerald-300/80 hover:text-emerald-700 dark:hover:text-emerald-200 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Procurement Centres</span>
      </button>

      {/* Main Detail Header Card */}
      <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-emerald-900/40">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {centre.code}
              </span>
              <StatusBadge status={centre.activeStatus} size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
              {centre.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/70 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{centre.address}, {centre.district}, {centre.state}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('book-slot', { centreId: centre.id })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Book Procurement Slot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-emerald-900/50 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-emerald-400/80 uppercase tracking-wider">
              Operating Hours
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {centre.operatingHours}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-emerald-900/50 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-emerald-400/80 uppercase tracking-wider">
              Daily Capacity
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {centre.dailyCapacityQuintals} Quintals / Day
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-emerald-900/50 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-emerald-400/80 uppercase tracking-wider">
              Direct Contact
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {centre.contactNumber}
            </p>
          </div>
        </div>

        {/* Accepted Crops Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-['Public_Sans']">
            <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Eligible Crops for MSP Procurement</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {centre.acceptedCrops.map((crop, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{crop}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities & Quality Control */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-['Public_Sans']">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Infrastructure & Weighbridge Facilities</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {centre.facilities.map((fac, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-[#07130E] rounded-lg border border-slate-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-emerald-100"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                <span>{fac}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
