import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, LiveQueueStatus } from '../types';
import { queueService, bookingService } from '../services/api';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  RefreshCw,
  Play,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LiveQueuePageProps {
  currentUser: UserProfile | null;
  bookingId?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const LiveQueuePage: React.FC<LiveQueuePageProps> = ({
  currentUser,
  bookingId,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [queueData, setQueueData] = useState<LiveQueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const fetchQueue = async () => {
    if (!currentUser) {
      setQueueData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await queueService.getLiveQueueStatus(currentUser.id, bookingId);
      setQueueData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const handleUpdate = () => fetchQueue();
    window.addEventListener('farmlink_storage_update', handleUpdate);
    const timer = setInterval(() => {
      fetchQueue();
    }, 15000);
    return () => {
      window.removeEventListener('farmlink_storage_update', handleUpdate);
      clearInterval(timer);
    };
  }, [currentUser, bookingId]);

  const handleAdvanceSimulation = async () => {
    if (!queueData?.activeBooking) return;
    setAdvancing(true);
    try {
      if (!queueData.isQueueActive && queueData.queueState === 'upcoming') {
        await queueService.toggleSimulateSlotStart(queueData.activeBooking.id);
      } else {
        await queueService.advanceQueue(queueData.activeBooking.centreId);
      }
      fetchQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setAdvancing(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!queueData?.activeBooking) return;
    try {
      await bookingService.updateBookingStatus(queueData.activeBooking.id, 'checked_in');
      fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 dark:text-emerald-400/60 animate-pulse">
        {t('queue.live_status', 'Loading live queue data...')}
      </div>
    );
  }

  if (!queueData || !queueData.activeBooking) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200 dark:border-emerald-900/60 space-y-4 max-w-md mx-auto shadow-sm my-12">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 flex items-center justify-center text-slate-400 mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">
          {t('queue.no_active_title', 'No Active Queue Token Found')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-emerald-200/70">
          You don't have an active or scheduled booking for today. Book a slot at your nearest procurement centre.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('book-slot')}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0D6832] hover:bg-[#0B5428] rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {t('dash.book_slot', 'Book a Slot')}
        </button>
      </div>
    );
  }

  const {
    activeBooking,
    queueState = 'active',
    isQueueActive = false,
    statusMessage,
    slotStartTimeFormatted,
    currentServingNumber,
    userQueuePosition,
    estimatedWaitMinutes,
    queueAheadCount,
  } = queueData;

  const isCurrentTurn =
    isQueueActive &&
    userQueuePosition !== null &&
    currentServingNumber !== null &&
    currentServingNumber >= activeBooking.queueNumber;

  const stages = [
    { num: 1, label: t('queue.stage_1', 'Gate Check-In'), desc: 'Scan pass & barcode verify' },
    { num: 2, label: t('queue.stage_2', 'Quality & Moisture'), desc: 'Lab analysis (≤ 12% moisture)' },
    { num: 3, label: t('queue.stage_3', 'Weighbridge Weighment'), desc: 'Gross & tare electronic log' },
    { num: 4, label: t('queue.stage_4', 'Settlement & DBT Receipt'), desc: 'Direct bank payout record' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
              {t('queue.live_status', 'Live Queue Status')}
            </h1>
            {isQueueActive ? (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </span>
            ) : queueState === 'upcoming' ? (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> UPCOMING
              </span>
            ) : queueState === 'expired' ? (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-2.5 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3 text-slate-500" /> EXPIRED
              </span>
            ) : queueState === 'completed' ? (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> COMPLETED
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" /> CANCELLED
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/70">
            {activeBooking.centreName} • {activeBooking.date}
          </p>
        </div>

        {/* Real-time simulation controller */}
        <div className="flex flex-wrap items-center gap-2">
          {!isQueueActive && queueState === 'upcoming' ? (
            <button
              type="button"
              disabled={advancing}
              onClick={handleAdvanceSimulation}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all duration-200 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs hover:shadow-xs"
              title={`Simulate Slot Start (Advance Time to ${slotStartTimeFormatted || '9:00 AM'})`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {advancing
                  ? t('common.updating', 'Updating...')
                  : `Simulate Slot Start (Advance Time to ${slotStartTimeFormatted || '9:00 AM'})`}
              </span>
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={advancing}
                onClick={handleAdvanceSimulation}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all duration-200 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs hover:shadow-xs"
                title="Simulate next farmer token advancing"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {advancing ? t('common.updating', 'Updating...') : 'Advance Queue'}
                </span>
              </button>

              <button
                type="button"
                disabled={advancing}
                onClick={async () => {
                  if (!queueData?.activeBooking) return;
                  setAdvancing(true);
                  try {
                    await queueService.simulateBeforeSlot(queueData.activeBooking.id);
                    fetchQueue();
                  } finally {
                    setAdvancing(false);
                  }
                }}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#122e1f] hover:bg-slate-200 dark:hover:bg-[#1a402c] rounded-xl border border-slate-200 dark:border-emerald-800 transition-all duration-200 cursor-pointer"
                title="Reset simulation to test before slot state (e.g. 8:30 AM)"
              >
                Test Before Slot (8:30 AM)
              </button>
            </>
          )}

          <button
            type="button"
            onClick={fetchQueue}
            className="p-2 rounded-xl border border-slate-200 dark:border-emerald-900 bg-white dark:bg-[#091C13] hover:bg-slate-50 dark:hover:bg-[#143224] text-slate-600 dark:text-emerald-300 cursor-pointer transition-all duration-200 active:scale-95 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expired Slot Warning Notice */}
      {queueState === 'expired' && (
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800 dark:text-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold">This procurement slot has expired</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                The scheduled window ({activeBooking.slotTime} on {activeBooking.date}) has passed. Token #{activeBooking.queueNumber} is no longer eligible for entry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('book-slot')}
            className="px-3.5 py-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shrink-0 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
          >
            Book New Slot
          </button>
        </div>
      )}

      {/* 4 Top Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Your Queue Token */}
        <div className="p-5 bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-1 transition-all duration-200 hover:shadow-xs hover:border-emerald-600/40">
          <span className="text-xs font-bold text-slate-400 dark:text-emerald-400/70 uppercase tracking-wider">
            {t('queue.your_token', 'Your Queue Token')}
          </span>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
            #{activeBooking.queueNumber}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-emerald-200/60 font-medium block truncate">
            {isQueueActive ? activeBooking.bookingReference : t('queue.scheduled_token', 'Scheduled Token')}
          </span>
        </div>

        {/* Currently Serving */}
        <div className="p-5 bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-1 transition-all duration-200 hover:shadow-xs hover:border-emerald-600/40">
          <span className="text-xs font-bold text-slate-400 dark:text-emerald-400/70 uppercase tracking-wider">
            {t('queue.current_serving', 'Currently Serving')}
          </span>
          {isQueueActive && currentServingNumber !== null ? (
            <motion.p
              key={currentServingNumber}
              initial={{ scale: 1.1, color: '#10B981' }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.25 }}
              className="text-3xl font-bold text-slate-900 dark:text-white font-mono"
            >
              #{currentServingNumber}
            </motion.p>
          ) : (
            <p className="text-lg sm:text-xl font-bold text-slate-400 dark:text-emerald-400/50">
              {slotStartTimeFormatted ? `Starts at ${slotStartTimeFormatted}` : 'Queue pending activation'}
            </p>
          )}
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium block truncate">
            {isQueueActive
              ? t('queue.weighbridge_active', 'Weighbridge Active')
              : t('queue.pending_activation', 'Queue pending activation')}
          </span>
        </div>

        {/* Farmers Ahead */}
        <div className="p-5 bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-1 transition-all duration-200 hover:shadow-xs hover:border-emerald-600/40">
          <span className="text-xs font-bold text-slate-400 dark:text-emerald-400/70 uppercase tracking-wider">
            {t('queue.ahead', 'Farmers Ahead')}
          </span>
          {isQueueActive && queueAheadCount !== null ? (
            <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              {queueAheadCount > 0 ? queueAheadCount : 0}
            </p>
          ) : (
            <p className="text-lg sm:text-xl font-bold text-slate-400 dark:text-emerald-400/50">
              {t('queue.queue_pending', 'Queue pending')}
            </p>
          )}
          <span className="text-[11px] text-slate-500 dark:text-emerald-200/60 font-medium block truncate">
            {isQueueActive
              ? (queueAheadCount === 0 ? t('queue.next_in_line', 'You are next in line!') : t('queue.tractors_in_buffer', 'Tractors in buffer'))
              : t('queue.queue_pending', 'Queue pending')}
          </span>
        </div>

        {/* Estimated Wait */}
        <div className="p-5 bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-1 transition-all duration-200 hover:shadow-xs hover:border-emerald-600/40">
          <span className="text-xs font-bold text-slate-400 dark:text-emerald-400/70 uppercase tracking-wider">
            {t('queue.est_wait', 'Estimated Wait')}
          </span>
          {isQueueActive && estimatedWaitMinutes !== null ? (
            <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              ~{estimatedWaitMinutes}m
            </p>
          ) : (
            <p className="text-base sm:text-lg font-bold text-slate-400 dark:text-emerald-400/50">
              Available at {slotStartTimeFormatted || '9:00 AM'}
            </p>
          )}
          <span className="text-[11px] text-slate-500 dark:text-emerald-200/60 font-medium block truncate">
            {isQueueActive
              ? t('queue.based_on_avg', 'Based on average weighment')
              : (slotStartTimeFormatted ? `Available at ${slotStartTimeFormatted}` : t('queue.awaiting_slot', 'Awaiting slot start'))}
          </span>
        </div>
      </div>

      {/* Upcoming Slot State Banner */}
      {queueState === 'upcoming' && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-[#152718] border border-amber-200 dark:border-amber-800/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t('queue.upcoming_title', 'Upcoming Slot')}
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  {t('queue.upcoming_badge', 'Upcoming')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/80">
                {statusMessage ||
                  t('queue.upcoming_msg', 'Your queue will become active at {time}.', {
                    time: slotStartTimeFormatted || '9:00 AM',
                  })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-emerald-200/80 bg-white/70 dark:bg-[#091C13]/70 px-3.5 py-2 rounded-xl border border-amber-200/60 dark:border-amber-800/40 shrink-0 self-start sm:self-auto">
            <span className="text-slate-400 dark:text-emerald-400/60">{t('queue.slot_label', 'Slot')}:</span>
            <span className="font-bold text-slate-900 dark:text-white">{activeBooking.slotTime}</span>
          </div>
        </div>
      )}

      {/* Completed State Banner */}
      {queueState === 'completed' && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-[#092215] border border-emerald-200 dark:border-emerald-800/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t('queue.procurement_completed', 'Procurement Completed')}
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  {t('queue.completed', 'Completed')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/80 mt-0.5">
                {t('queue.completed_desc', 'Your weighment and crop delivery for this slot have been successfully completed.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('my-transactions')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0D6832] rounded-xl shadow-xs hover:bg-[#0B5428] transition-all cursor-pointer shrink-0"
          >
            {t('queue.view_receipt', 'View Payment Receipt')}
          </button>
        </div>
      )}

      {/* Cancelled State Banner */}
      {queueState === 'cancelled' && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-[#251010] border border-rose-200 dark:border-rose-900/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0 text-rose-700 dark:text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t('queue.booking_cancelled', 'Booking Cancelled')}
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                  {t('queue.cancelled', 'Cancelled')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-rose-200/80 mt-0.5">
                {t('queue.cancelled_desc', 'This scheduled procurement slot has been cancelled.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('book-slot')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0D6832] rounded-xl shadow-xs hover:bg-[#0B5428] transition-all cursor-pointer shrink-0"
          >
            {t('dash.book_slot', 'Book New Slot')}
          </button>
        </div>
      )}

      {/* Real-time Stage Stepper & Mandi Arrival Alert */}
      <AnimatePresence>
        {isCurrentTurn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            className="p-5 rounded-2xl bg-[#0D6832] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold">
                  {t('queue.your_turn_msg', 'It is your turn! Proceed to Gate 1')}
                </h4>
                <p className="text-xs text-emerald-100/90">
                  {t('queue.present_qr_msg', 'Please present your QR security code at the weighbridge counter.')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleManualCheckIn}
              className="px-4 py-2.5 text-xs font-bold text-[#0D6832] bg-white rounded-xl shadow-xs hover:bg-slate-100 transition-all duration-200 active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              {t('queue.check_in_gate', 'Check In at Gate')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Procurement Stages Stepper */}
      <div className="bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-8 shadow-2xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">
          {t('queue.pipeline_progress', 'Procurement Pipeline Progress')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage) => {
            const isDone =
              (stage.num === 1 && (activeBooking.status === 'checked_in' || activeBooking.status === 'in_inspection' || activeBooking.status === 'completed' || activeBooking.status === 'procured')) ||
              (stage.num === 2 && (activeBooking.status === 'in_inspection' || activeBooking.status === 'completed' || activeBooking.status === 'procured')) ||
              (stage.num === 3 && (activeBooking.status === 'completed' || activeBooking.status === 'procured')) ||
              (stage.num === 4 && (activeBooking.status === 'completed' || activeBooking.status === 'procured'));

            const isCurrent =
              isQueueActive &&
              ((stage.num === 1 && activeBooking.status === 'confirmed') ||
              (stage.num === 2 && activeBooking.status === 'checked_in') ||
              (stage.num === 3 && activeBooking.status === 'in_inspection'));

            return (
              <div
                key={stage.num}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  isDone
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                    : isCurrent
                    ? 'bg-white dark:bg-[#091C13] border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-[#07130E] border-slate-200 dark:border-emerald-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-emerald-900 text-slate-500 dark:text-emerald-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : stage.num}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/60">
                    {t('queue.stage', 'Stage')} {stage.num}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-['Public_Sans']">{stage.label}</h4>
                <p className="text-[11px] text-slate-500 dark:text-emerald-200/70 mt-0.5">
                  {!isQueueActive && stage.num === 1
                    ? t('queue.awaiting_slot', 'Awaiting slot start')
                    : stage.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
