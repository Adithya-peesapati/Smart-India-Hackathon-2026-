import React, { useState, useEffect } from 'react';
import { UserProfile, Booking } from '../types';
import { bookingService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  parseSlotDateTime,
  getEffectiveNow,
} from '../utils/timeUtils';
import {
  Calendar,
  Search,
  Plus,
  XCircle,
  FolderOpen,
  Eye,
  Clock,
  Layers,
  Radio,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MyBookingsPageProps {
  currentUser: UserProfile | null;
  onNavigate: (page: string, params?: any) => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async (isSilent = false) => {
    if (!currentUser) {
      setBookings([]);
      setLoading(false);
      return;
    }
    if (!isSilent) setLoading(true);
    try {
      const data = await bookingService.getFarmerBookings(currentUser.id);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const handleUpdate = () => fetchBookings(true);
    window.addEventListener('farmlink_storage_update', handleUpdate);
    
    // Auto-update every 10s as time passes
    const timer = setInterval(() => {
      fetchBookings(true);
    }, 10000);

    return () => {
      window.removeEventListener('farmlink_storage_update', handleUpdate);
      clearInterval(timer);
    };
  }, [currentUser]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this procurement slot?')) return;
    setCancellingId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.centreName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.cropType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
            {t('nav.my_bookings', 'My Bookings')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/70">
            Track, manage, and verify all your scheduled procurement appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('book-slot')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('dash.book_slot', 'Book New Slot')}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, centre, crop..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#07130E] hover:bg-slate-100/60 dark:hover:bg-[#0B1E16] focus:bg-white dark:focus:bg-[#0E2419] border border-slate-200 dark:border-emerald-900 focus:border-emerald-600 rounded-lg outline-none text-slate-800 dark:text-white transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'checked_in', label: 'In Mandi' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-[#122A1F] text-slate-600 dark:text-emerald-200 hover:bg-slate-200/70 dark:hover:bg-[#1A3B2C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Loading your bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 px-4 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 text-center flex flex-col items-center justify-center shadow-2xs">
          <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 flex items-center justify-center text-slate-400 mb-3">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">
            {t('dash.no_bookings', 'No bookings found')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-emerald-200/70 max-w-xs mt-1 mb-4">
            {searchQuery
              ? 'No scheduled slots match your search query.'
              : 'You have not scheduled any procurement slots yet.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('book-slot')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            {t('dash.book_slot', 'Schedule Slot')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const timing = parseSlotDateTime(b.date, b.slotTime);
            const now = getEffectiveNow();
            const isSlotExpired = b.status === 'confirmed' && timing.isValid && timing.endTimeDate && now.getTime() >= timing.endTimeDate.getTime();
            const isSlotOngoing = (b.status === 'confirmed' || b.status === 'checked_in') && timing.isValid && timing.startTimeDate && timing.endTimeDate && now.getTime() >= timing.startTimeDate.getTime() && now.getTime() < timing.endTimeDate.getTime();

            // Expired slots cannot be cancelled because the window has already passed
            const isCancellable = b.status === 'confirmed' && !isSlotExpired;

            return (
              <div
                key={b.id}
                className={`p-5 rounded-xl border transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSlotExpired
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
                    : isSlotOngoing
                    ? 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/70 ring-1 ring-blue-500/20'
                    : 'bg-white dark:bg-[#091C13] border-slate-200 dark:border-emerald-900/60 hover:border-slate-300 dark:hover:border-emerald-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {b.bookingReference}
                    </span>

                    {/* Dynamic time-aware status badge */}
                    {isSlotExpired ? (
                      <StatusBadge status="expired" size="sm" />
                    ) : isSlotOngoing ? (
                      <StatusBadge status="ongoing" size="sm" />
                    ) : (
                      <StatusBadge status={b.status} size="sm" />
                    )}

                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      Token #{b.queueNumber}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                    {b.centreName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-emerald-100/70">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {b.date}
                    </span>
                    <span className={`flex items-center gap-1 ${isSlotExpired ? 'line-through text-slate-400' : ''}`}>
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {b.slotTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {b.cropType} ({b.estimatedQuantityQuintals} Qtl)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-emerald-900/60 self-end md:self-center">
                  {isSlotOngoing ? (
                    <button
                      type="button"
                      onClick={() => onNavigate('live-queue', { bookingId: b.id })}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 animate-pulse transition-colors cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>{t('queue.live_status', 'Track Queue (Live)')}</span>
                    </button>
                  ) : b.status === 'confirmed' || b.status === 'checked_in' ? (
                    <button
                      type="button"
                      onClick={() => onNavigate('live-queue', { bookingId: b.id })}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                    >
                      {t('queue.live_status', 'Track Queue')}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onNavigate('booking-confirmation', { bookingId: b.id })}
                    className="p-2 text-slate-600 dark:text-emerald-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#143224] rounded-lg transition-colors cursor-pointer"
                    title="View Ticket / Pass"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {isCancellable && (
                    <button
                      type="button"
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancel(b.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      title="Cancel Slot"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
