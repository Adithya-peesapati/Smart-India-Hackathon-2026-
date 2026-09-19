import React, { useState, useEffect } from 'react';
import { UserProfile, Booking } from '../types';
import { bookingService, queueService, transactionService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  parseSlotDateTime,
  getEffectiveNow,
} from '../utils/timeUtils';
import {
  Calendar,
  Layers,
  CreditCard,
  Building,
  Plus,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DashboardPageProps {
  currentUser: UserProfile | null;
  onNavigate: (page: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, onNavigate }) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeQueuePos, setActiveQueuePos] = useState<number | null>(null);
  const [isQueueUpcoming, setIsQueueUpcoming] = useState(false);
  const [totalTxnsCount, setTotalTxnsCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (isSilent = false) => {
    if (!currentUser) {
      setBookings([]);
      setActiveQueuePos(null);
      setTotalTxnsCount(0);
      setTotalEarnings(0);
      setLoading(false);
      return;
    }

    if (!isSilent) setLoading(true);
    try {
      const [userBookings, queueStatus, transactions] = await Promise.all([
        bookingService.getFarmerBookings(currentUser.id),
        queueService.getLiveQueueStatus(currentUser.id),
        transactionService.getFarmerTransactions(currentUser.id),
      ]);

      setBookings(userBookings);
      if (queueStatus.activeBooking && queueStatus.isQueueActive) {
        setActiveQueuePos(queueStatus.userQueuePosition);
        setIsQueueUpcoming(false);
      } else if (queueStatus.activeBooking && queueStatus.queueState === 'upcoming') {
        setActiveQueuePos(null);
        setIsQueueUpcoming(true);
      } else {
        setActiveQueuePos(null);
        setIsQueueUpcoming(false);
      }

      setTotalTxnsCount(transactions.length);
      const sum = transactions.reduce((acc, t) => acc + (t.paymentStatus === 'completed' ? t.totalAmount : 0), 0);
      setTotalEarnings(sum);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const handleUpdate = () => fetchDashboardData(true);
    window.addEventListener('farmlink_storage_update', handleUpdate);

    // Auto-update every 10s as time passes
    const timer = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => {
      window.removeEventListener('farmlink_storage_update', handleUpdate);
      clearInterval(timer);
    };
  }, [currentUser]);

  const now = getEffectiveNow();

  const nextBooking = bookings.find((b) => {
    if (b.status === 'checked_in' || b.status === 'in_inspection') return true;
    if (b.status === 'confirmed') {
      const timing = parseSlotDateTime(b.date, b.slotTime);
      if (timing.isValid && timing.endTimeDate && now.getTime() >= timing.endTimeDate.getTime()) {
        return false; // Skip expired slots
      }
      return true;
    }
    return false;
  });

  const isNextBookingOngoing = nextBooking
    ? (() => {
        const timing = parseSlotDateTime(nextBooking.date, nextBooking.slotTime);
        return (
          timing.isValid &&
          timing.startTimeDate &&
          timing.endTimeDate &&
          now.getTime() >= timing.startTimeDate.getTime() &&
          now.getTime() < timing.endTimeDate.getTime()
        );
      })()
    : false;

  const upcomingBookingsCount = bookings.filter((b) => {
    if (b.status === 'checked_in' || b.status === 'in_inspection') return true;
    if (b.status === 'confirmed') {
      const timing = parseSlotDateTime(b.date, b.slotTime);
      if (timing.isValid && timing.endTimeDate && now.getTime() >= timing.endTimeDate.getTime()) {
        return false;
      }
      return true;
    }
    return false;
  }).length;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header / Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('dash.season_active', 'Procurement Season 2026-27 Active')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Public_Sans'] tracking-tight flex items-center gap-2">
            <span>
              {currentUser?.fullName
                ? `${t('dash.welcome_back', 'Welcome back,')} ${currentUser.fullName.split(' ')[0]}!`
                : t('dash.welcome_default', 'Welcome to AgriSetu')}
            </span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/70">
            {t('dash.subtitle', "Here's what's happening with your crops, queue schedules, and direct DBT payments today.")}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('book-slot')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0D6832] hover:bg-[#0B5428] rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('dash.book_slot', 'Book Procurement Slot')}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Upcoming Booking */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200/80 dark:border-emerald-900/60 shadow-2xs flex flex-col justify-between transition-all hover:border-emerald-600/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/70">
              {t('dash.upcoming_booking', 'Upcoming Booking')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-mono">
              {upcomingBookingsCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {upcomingBookingsCount > 0 ? t('dash.active_schedule', 'Active schedule') : t('dash.no_pending', 'No pending')}
            </span>
          </div>
        </div>

        {/* Card 2: Live Queue Pos */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200/80 dark:border-emerald-900/60 shadow-2xs flex flex-col justify-between transition-all hover:border-emerald-600/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/70">
              {t('dash.live_queue_pos', 'Live Queue Pos')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-mono">
              {activeQueuePos !== null ? `#${activeQueuePos}` : '--'}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-emerald-300/70">
              {activeQueuePos !== null
                ? t('dash.live_tracking', 'Live tracking')
                : isQueueUpcoming
                ? t('queue.upcoming_badge', 'Upcoming slot')
                : t('dash.not_in_queue', 'Not in queue')}
            </span>
          </div>
        </div>

        {/* Card 3: Total Txns */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200/80 dark:border-emerald-900/60 shadow-2xs flex flex-col justify-between transition-all hover:border-emerald-600/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/70">
              {t('dash.completed_txns', 'Completed Txns')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#122A1F] text-slate-600 dark:text-emerald-300 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-mono">
              {totalTxnsCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {totalTxnsCount} {t('dash.delivered', 'delivered')}
            </span>
          </div>
        </div>

        {/* Card 4: Total Earnings */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200/80 dark:border-emerald-900/60 shadow-2xs flex flex-col justify-between transition-all hover:border-emerald-600/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/70">
              {t('dash.total_payments', 'Direct DBT Payouts')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <span className="text-sm font-bold font-mono">₹</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {t('dash.dbt_credited', '100% DBT credited')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Recent Bookings & Right Forest Green Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Bookings */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-emerald-900/60 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                {t('dash.recent_bookings', 'Recent Bookings')}
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('my-bookings')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t('dash.view_all', 'View All')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                {t('common.loading', 'Loading bookings...')}
              </div>
            ) : bookings.length === 0 ? (
              /* Empty State */
              <div className="py-12 sm:py-16 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 flex items-center justify-center text-slate-400 mb-3">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{t('dash.no_bookings', 'No recent bookings found')}</p>
                <p className="text-xs text-slate-500 dark:text-emerald-200/70 mt-1 max-w-xs">
                  {t('dash.no_bookings_desc', 'Schedule your harvest delivery today to view token passes and live queue tracking here.')}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('book-slot')}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {t('dash.book_slot', 'Book a Slot')}
                </button>
              </div>
            ) : (
              /* Bookings Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-[#07130E] text-slate-500 dark:text-emerald-300/80 font-semibold border-b border-slate-200 dark:border-emerald-900/60">
                    <tr>
                      <th className="py-3 px-4">{t('dash.token', 'Booking Ref')}</th>
                      <th className="py-3 px-4">{t('dash.centre', 'Centre Name')}</th>
                      <th className="py-3 px-4">{t('dash.date', 'Date & Time Slot')}</th>
                      <th className="py-3 px-4">{t('dash.status', 'Status')}</th>
                      <th className="py-3 px-4 text-right">{t('dash.queue_no', 'Queue No.')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
                    {bookings.slice(0, 5).map((b) => {
                      const timing = parseSlotDateTime(b.date, b.slotTime);
                      const isExpired = b.status === 'confirmed' && timing.isValid && timing.endTimeDate && now.getTime() >= timing.endTimeDate.getTime();
                      const isOngoing = (b.status === 'confirmed' || b.status === 'checked_in') && timing.isValid && timing.startTimeDate && timing.endTimeDate && now.getTime() >= timing.startTimeDate.getTime() && now.getTime() < timing.endTimeDate.getTime();
                      const effectiveStatus = isExpired ? 'expired' : isOngoing ? 'ongoing' : b.status;

                      return (
                        <tr
                          key={b.id}
                          onClick={() => onNavigate('booking-confirmation', { bookingId: b.id })}
                          className="hover:bg-slate-50/80 dark:hover:bg-[#143224] cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {b.bookingReference}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white max-w-[160px] truncate">
                            {b.centreName}
                          </td>
                          <td className={`py-3.5 px-4 ${isExpired ? 'line-through text-slate-400' : 'text-slate-600 dark:text-emerald-100/70'}`}>
                            {b.date} • {b.slotTime}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={effectiveStatus} size="sm" />
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            #{b.queueNumber}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Forest Green Action Card & Quick Nav */}
        <div className="lg:col-span-4 space-y-4">
          {/* Forest Green Card */}
          <div className="p-6 rounded-xl bg-[#1B3022] text-white shadow-sm flex flex-col justify-between space-y-5">
            <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>

            {nextBooking ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                    {t('dash.active_booking', 'Next Scheduled Slot')}
                  </span>
                  {isNextBookingOngoing && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" /> Active Window
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold font-['Public_Sans']">{nextBooking.cropType}</h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  {nextBooking.centreName} <br />
                  {nextBooking.date} • {nextBooking.slotTime}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="inline-block text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full text-white">
                    {t('dash.queue_token_num', 'Queue Token #{num}', { num: nextBooking.queueNumber })}
                  </span>
                  {isNextBookingOngoing && (
                    <button
                      type="button"
                      onClick={() => onNavigate('live-queue', { bookingId: nextBooking.id })}
                      className="text-xs font-bold bg-white text-[#1B3022] hover:bg-emerald-50 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                    >
                      Track Live
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className="text-base font-bold font-['Public_Sans']">
                  {t('dash.active_booking', 'Active Booking & Pass')}
                </h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  {t('dash.schedule_visit', 'Schedule your next visit to a procurement centre.')}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('book-slot')}
              className="w-full py-2.5 px-4 text-xs font-bold text-[#1B3022] bg-white hover:bg-emerald-50 rounded-lg shadow-sm transition-all active:scale-95 text-center cursor-pointer"
            >
              {nextBooking ? t('dash.book_slot', 'Book Another Slot') : t('dash.book_slot', 'Book a Slot')}
            </button>
          </div>

          {/* Quick Action 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigate('book-slot')}
              className="p-4 bg-white dark:bg-[#091C13] hover:bg-slate-50 dark:hover:bg-[#143224] rounded-xl border border-slate-200 dark:border-emerald-900/60 text-center space-y-2 transition-all hover:border-emerald-600 group cursor-pointer shadow-2xs"
            >
              <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span className="block text-xs font-bold text-slate-800 dark:text-emerald-100">
                {t('dash.book_slot', 'Book a Slot')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('live-queue')}
              className="p-4 bg-white dark:bg-[#091C13] hover:bg-slate-50 dark:hover:bg-[#143224] rounded-xl border border-slate-200 dark:border-emerald-900/60 text-center space-y-2 transition-all hover:border-emerald-600 group cursor-pointer shadow-2xs"
            >
              <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <span className="block text-xs font-bold text-slate-800 dark:text-emerald-100">
                {t('dash.track_queue', 'Track Live Queue')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('my-transactions')}
              className="p-4 bg-white dark:bg-[#091C13] hover:bg-slate-50 dark:hover:bg-[#143224] rounded-xl border border-slate-200 dark:border-emerald-900/60 text-center space-y-2 transition-all hover:border-emerald-600 group cursor-pointer shadow-2xs"
            >
              <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="block text-xs font-bold text-slate-800 dark:text-emerald-100">
                {t('dash.view_txns', 'View Payments')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('centres')}
              className="p-4 bg-white dark:bg-[#091C13] hover:bg-slate-50 dark:hover:bg-[#143224] rounded-xl border border-slate-200 dark:border-emerald-900/60 text-center space-y-2 transition-all hover:border-emerald-600 group cursor-pointer shadow-2xs"
            >
              <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building className="w-4 h-4" />
              </div>
              <span className="block text-xs font-bold text-slate-800 dark:text-emerald-100">
                {t('dash.find_centres', 'Find Centres')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
