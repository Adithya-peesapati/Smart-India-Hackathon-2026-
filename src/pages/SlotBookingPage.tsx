import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserProfile, ProcurementCentre, ProcurementSlot } from '../types';
import { centreService, bookingService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  getLocalDateString,
  getEffectiveNow,
  parseSlotDateTime,
  isSlotBookable,
} from '../utils/timeUtils';
import {
  getAllIndianStates,
  getDistrictsByState,
  getAllDistricts,
} from '../data/indiaLocations';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  MapPin,
  ArrowRight,
  Clock,
  RotateCcw,
  Sparkles,
  Radio,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SlotBookingPageProps {
  currentUser: UserProfile | null;
  initialCentreId?: string;
  onNavigate: (page: string, params?: any) => void;
  onProgressChange?: (hasUnsavedProgress: boolean) => void;
}

export const SlotBookingPage: React.FC<SlotBookingPageProps> = ({
  currentUser,
  initialCentreId,
  onNavigate,
  onProgressChange,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(initialCentreId ? 2 : 1);
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<ProcurementCentre | null>(null);

  // Interaction tracking for unsaved progress
  const [hasManuallySelectedCentre, setHasManuallySelectedCentre] = useState(false);
  const [hasChangedFilters, setHasChangedFilters] = useState(false);
  const [hasQuantityChanged, setHasQuantityChanged] = useState(false);

  const [filterState, setFilterState] = useState(currentUser?.address?.state || 'All States');
  const [filterDistrict, setFilterDistrict] = useState(currentUser?.address?.district || 'All Districts');

  const allStates = useMemo(() => getAllIndianStates(), []);
  const availableDistricts = useMemo(() => {
    if (filterState && filterState !== 'All States') {
      return getDistrictsByState(filterState);
    }
    return getAllDistricts();
  }, [filterState]);

  // Dynamic current date and live clock (based on procurement centre local time)
  const [liveNow, setLiveNow] = useState<Date>(() => getEffectiveNow());
  const todayStr = useMemo(() => getLocalDateString(liveNow), [liveNow]);

  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString(getEffectiveNow()));
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => getEffectiveNow());

  const [availableSlots, setAvailableSlots] = useState<ProcurementSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ProcurementSlot | null>(null);

  // Step 3 crop details
  const [selectedCrop, setSelectedCrop] = useState('');
  const [quantityQuintals, setQuantityQuintals] = useState<number | ''>(25);
  const [vehicleNumber, setVehicleNumber] = useState('');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Determine unsaved booking progress
  const hasUnsavedProgress = useMemo(() => {
    // Direct hub entry into step 2 constitutes an active booking session
    if (initialCentreId) return true;
    // Progressed into slot picking or review
    if (step > 1) return true;
    // Explicitly chose a centre card in step 1
    if (hasManuallySelectedCentre) return true;
    // Filtered by state or district
    if (hasChangedFilters) return true;
    // Harvest quantity was modified
    if (hasQuantityChanged) return true;
    // Entered vehicle number
    if (vehicleNumber.trim().length > 0) return true;
    return false;
  }, [initialCentreId, step, hasManuallySelectedCentre, hasChangedFilters, hasQuantityChanged, vehicleNumber]);

  // Sync unsaved progress state upstream to App layout
  useEffect(() => {
    onProgressChange?.(hasUnsavedProgress);
  }, [hasUnsavedProgress, onProgressChange]);

  // Warn on browser tab reload or close if unsaved progress exists
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedProgress) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedProgress]);

  // Fallback destination when cancelling or leaving
  const previousPage = initialCentreId ? 'centre-details' : currentUser ? 'dashboard' : 'centres';
  const previousParams = initialCentreId ? { centreId: initialCentreId } : {};

  const handleCancelOrLeave = (targetPage = previousPage, targetParams = previousParams) => {
    onNavigate(targetPage, targetParams);
  };

  // Live ticking clock effect (updates every second)
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setLiveNow(getEffectiveNow());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Load centres
  useEffect(() => {
    const fetchCentresList = async () => {
      const data = await centreService.getCentres({
        state: filterState,
        district: filterDistrict,
      });
      setCentres(data);
      if (initialCentreId) {
        const found = data.find((c) => c.id === initialCentreId);
        if (found) {
          setSelectedCentre(found);
          if (found.acceptedCrops.length > 0) setSelectedCrop(found.acceptedCrops[0]);
          setStep(2);
        }
      } else if (data.length > 0 && (!selectedCentre || !data.some((c) => c.id === selectedCentre.id))) {
        setSelectedCentre(data[0]);
        if (data[0].acceptedCrops.length > 0) setSelectedCrop(data[0].acceptedCrops[0]);
      }
    };
    fetchCentresList();
  }, [initialCentreId, filterState, filterDistrict]);

  // Load and refresh slots dynamically
  const reloadSlots = useCallback(async (isSilent = false) => {
    if (!selectedCentre || !selectedDate) return;
    if (!isSilent) setLoadingSlots(true);
    try {
      const slots = await centreService.getAvailableSlots(selectedCentre.id, selectedDate);
      setAvailableSlots(slots);

      // Verify currently selected slot is still bookable
      setSelectedSlot((prev) => {
        if (!prev) {
          // Auto-select first bookable (available, filling_fast, or ongoing)
          const firstOpen = slots.find((s) => isSlotBookable(s.status));
          return firstOpen || null;
        }
        const updated = slots.find((s) => s.id === prev.id);
        if (!updated || !isSlotBookable(updated.status)) {
          // Selected slot has expired or become full; find new open slot
          const nextOpen = slots.find((s) => isSlotBookable(s.status));
          return nextOpen || null;
        }
        return updated;
      });
    } catch (err) {
      console.error('Error fetching available slots:', err);
    } finally {
      if (!isSilent) setLoadingSlots(false);
    }
  }, [selectedCentre, selectedDate]);

  // Initial fetch when centre or date changes
  useEffect(() => {
    reloadSlots(false);
  }, [reloadSlots]);

  // Periodic dynamic status update every 10 seconds without requiring page refresh
  useEffect(() => {
    const autoRefresh = setInterval(() => {
      reloadSlots(true);
    }, 10000);
    return () => clearInterval(autoRefresh);
  }, [reloadSlots]);

  // Quick simulation helper for verification (e.g. 10:16 AM, 10:30 AM, actual)
  const handleSetSimulatedTime = (timeStr?: string) => {
    if (!timeStr) {
      localStorage.removeItem('farmlink_simulated_now');
    } else {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const targetDate = new Date();
      targetDate.setHours(hours, minutes, 0, 0);
      localStorage.setItem('farmlink_simulated_now', targetDate.toISOString());
    }
    setLiveNow(getEffectiveNow());
    reloadSlots(true);
    window.dispatchEvent(new Event('farmlink_storage_update'));
  };

  // Calendar Helpers
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const prevMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonthDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonthDate(d);
  };

  const getDaysInMonthMatrix = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Adjust for Monday start: 0->6, 1->0, etc.
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  };

  const handleDaySelect = (day: number) => {
    const year = currentMonthDate.getFullYear();
    const month = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const newDateStr = `${year}-${month}-${dayStr}`;
    const today = getLocalDateString(getEffectiveNow());
    if (newDateStr < today) {
      return;
    }
    setSelectedDate(newDateStr);
  };

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    if (!selectedCentre) {
      setError(t('booking.err_select_slot', 'Please select a procurement centre.'));
      return;
    }
    if (!selectedSlot) {
      setError(t('booking.err_select_slot', 'Please select a time slot.'));
      return;
    }
    if (!isSlotBookable(selectedSlot.status)) {
      setError('The selected slot is either expired or full. Please choose an available or ongoing slot.');
      return;
    }

    // Dynamic verification against current clock
    const timing = parseSlotDateTime(selectedDate, selectedSlot.timeRange);
    const now = getEffectiveNow();
    if (timing.endTimeDate && now.getTime() >= timing.endTimeDate.getTime()) {
      setError('This procurement slot has expired and can no longer be booked. Please select an active or upcoming slot.');
      return;
    }

    if (!quantityQuintals || Number(quantityQuintals) <= 0) {
      setError(t('booking.err_quantity', 'Please enter a valid quantity in quintals.'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const newBooking = await bookingService.createBooking({
        farmerId: currentUser.id,
        farmerName: currentUser.fullName || 'Farmer',
        farmerPhone: currentUser.mobileNumber || '',
        centreId: selectedCentre.id,
        centreName: selectedCentre.name,
        centreAddress: selectedCentre.address,
        date: selectedDate,
        slotId: selectedSlot.id,
        slotTime: selectedSlot.timeRange,
        cropType: selectedCrop,
        estimatedQuantityQuintals: Number(quantityQuintals),
        vehicleNumber: vehicleNumber.trim() || undefined,
      });

      onNavigate('booking-confirmation', { bookingId: newBooking.id });
    } catch (err: any) {
      setError(err.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-5xl mx-auto">
      {/* Top Header & Step Progress Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
            {t('booking.title', 'Book Your Slot')}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => handleCancelOrLeave()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-emerald-300 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
          <span>{t('booking.back_btn', 'Cancel Booking')}</span>
        </button>
      </div>

      {/* 3-Step Wizard Bar */}
      <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-4 shadow-2xs">
        <div className="grid grid-cols-3 gap-2">
          {/* Step 1 */}
          <div
            onClick={() => setStep(1)}
            className={`cursor-pointer pb-2 border-b-2 transition-all ${
              step === 1
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : step > 1
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-slate-200 dark:border-emerald-900 text-slate-400 dark:text-emerald-700'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {step > 1 ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
              )}
              <span>Step 1</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {t('booking.step1', 'Select Centre')}
            </p>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => {
              if (selectedCentre) setStep(2);
            }}
            className={`cursor-pointer pb-2 border-b-2 transition-all ${
              step === 2
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : step > 2
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-slate-200 dark:border-emerald-900 text-slate-400 dark:text-emerald-700'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {step > 2 ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-emerald-950 text-slate-600 dark:text-emerald-400'
                  }`}
                >
                  2
                </span>
              )}
              <span>Step 2</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {t('booking.step2', 'Choose Date & Slot')}
            </p>
          </div>

          {/* Step 3 */}
          <div
            className={`pb-2 border-b-2 transition-all ${
              step === 3
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-slate-200 dark:border-emerald-900 text-slate-400 dark:text-emerald-700'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-emerald-950 text-slate-600 dark:text-emerald-400'
                }`}
              >
                3
              </span>
              <span>Step 3</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {t('booking.step3', 'Confirm Booking')}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Select Centre */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                  {t('booking.search_centres', 'Select a Government Procurement Centre')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-200/70 mt-0.5">
                  Filter by State and District to find nearby procurement centres across India.
                </p>
              </div>

              {/* State & District Selectors */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-emerald-900 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-emerald-300/70">
                    {t('booking.filter_state', 'State')}:
                  </span>
                  <select
                    value={filterState}
                    onChange={(e) => {
                      const st = e.target.value;
                      setFilterState(st);
                      setFilterDistrict('All Districts');
                      setHasChangedFilters(true);
                    }}
                    className="text-xs font-semibold bg-transparent text-slate-800 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="All States" className="dark:bg-[#091C13]">All States</option>
                    {allStates.map((st) => (
                      <option key={st} value={st} className="dark:bg-[#091C13]">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-emerald-900 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-emerald-300/70">
                    {t('booking.filter_district', 'District')}:
                  </span>
                  <select
                    value={filterDistrict}
                    onChange={(e) => {
                      setFilterDistrict(e.target.value);
                      setHasChangedFilters(true);
                    }}
                    className="text-xs font-semibold bg-transparent text-slate-800 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="All Districts" className="dark:bg-[#091C13]">All Districts</option>
                    {availableDistricts.map((dist) => (
                      <option key={dist} value={dist} className="dark:bg-[#091C13]">
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {centres.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-[#07130E] rounded-xl border border-dashed border-slate-200 dark:border-emerald-900 space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No centres found matching this location</p>
                <p className="text-xs text-slate-400">Try selecting "All States" or another district.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {centres.map((c) => {
                  const isSelected = selectedCentre?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCentre(c);
                        setHasManuallySelectedCentre(true);
                        if (c.acceptedCrops.length > 0) setSelectedCrop(c.acceptedCrops[0]);
                      }}
                      className={`p-5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/60 ring-2 ring-emerald-600/30'
                          : 'border-slate-200 dark:border-emerald-900/60 bg-white dark:bg-[#091C13] hover:border-slate-300 dark:hover:border-emerald-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {c.code}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Public_Sans']">{c.name}</h4>
                      <p className="text-xs text-slate-600 dark:text-emerald-100/70 mt-1">{c.district}</p>
                      <p className="text-[11px] text-slate-400 dark:text-emerald-400/60 mt-2">
                        Daily Quota: {c.dailyCapacityQuintals} Qtl
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={() => handleCancelOrLeave()}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-900 rounded-lg hover:bg-slate-50 dark:hover:bg-[#143224] cursor-pointer transition-colors"
              >
                {t('booking.cancel_btn', 'Cancel')}
              </button>

              <button
                type="button"
                disabled={!selectedCentre}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('booking.next_btn', 'Continue to Date & Slot')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Choose Date & Slot */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in-50">
          {/* Selected centre banner */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#091C13] border border-slate-200 dark:border-emerald-900/60 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-emerald-300/70">
                  {t('booking.centre_selected', 'Selected Procurement Hub')}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCentre?.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {t('booking.change_centre', 'Change Centre')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Card: Interactive Calendar */}
            <div className="md:col-span-5 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                  {t('booking.select_date', 'Select Date')}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#143224] text-slate-600 dark:text-emerald-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatMonthYear(currentMonthDate)}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#143224] text-slate-600 dark:text-emerald-300 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Header */}
              <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 dark:text-emerald-400/60 uppercase">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
              </div>

              {/* Days Matrix */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {getDaysInMonthMatrix().map((day, idx) => {
                  if (!day) return <div key={idx} className="h-8" />;

                  const year = currentMonthDate.getFullYear();
                  const month = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(day).padStart(2, '0');
                  const formattedDate = `${year}-${month}-${dayStr}`;
                  const isSelected = selectedDate === formattedDate;
                  const isPast = formattedDate < todayStr;
                  const isToday = formattedDate === todayStr;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleDaySelect(day)}
                      className={`h-9 w-9 mx-auto rounded-lg flex flex-col items-center justify-center font-medium transition-all ${
                        isPast
                          ? 'opacity-30 cursor-not-allowed text-slate-400 line-through'
                          : isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-xs cursor-pointer'
                          : 'text-slate-800 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-[#143224] hover:text-emerald-700 cursor-pointer'
                      }`}
                    >
                      <span>{day}</span>
                      {isToday && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/60 text-xs flex items-center justify-between text-slate-500 dark:text-emerald-300/70">
                <span>
                  Selected Date: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{selectedDate}</strong>
                </span>
                {selectedDate === todayStr && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
            </div>

            {/* Right Card: Available Slots */}
            <div className="md:col-span-7 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-6 shadow-2xs space-y-4">
              {/* Dynamic Time Status Bar */}
              <div className="p-3 bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-emerald-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <Clock className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-400/80">
                        Centre Time:
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {liveNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Simulation Pills for Testing Exact User Scenarios */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Simulate:</span>
                  <button
                    type="button"
                    onClick={() => handleSetSimulatedTime()}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-emerald-900 bg-white dark:bg-[#0E2419] text-slate-700 dark:text-emerald-200 hover:bg-slate-100 cursor-pointer"
                    title="Restore actual device clock"
                  >
                    Real
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSimulatedTime('10:16')}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 hover:bg-amber-100 cursor-pointer"
                    title="User scenario: 10:16 AM (9-10 AM Expired, 10-11 AM Ongoing)"
                  >
                    10:16 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSimulatedTime('10:30')}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 hover:bg-blue-100 cursor-pointer"
                    title="User scenario: 10:30 AM (During 10-11 AM Ongoing)"
                  >
                    10:30 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSimulatedTime('14:30')}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-emerald-900 bg-white dark:bg-[#0E2419] text-slate-700 dark:text-emerald-200 hover:bg-slate-100 cursor-pointer"
                    title="Test afternoon 2:30 PM slot"
                  >
                    2:30 PM
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                  {t('booking.select_slot', 'Available Slots')}
                </h3>
                {/* Comprehensive Legend */}
                <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500 dark:text-emerald-300/70 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Ongoing
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Full
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Expired
                  </span>
                </div>
              </div>

              {loadingSlots ? (
                <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                  Checking real-time slot availability...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No slots available for this date.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isExpired = slot.status === 'expired';
                    const isFull = slot.status === 'full';
                    const isOngoing = slot.status === 'ongoing';
                    const isBookable = isSlotBookable(slot.status);

                    if (isExpired) {
                      return (
                        <div
                          key={slot.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 opacity-60 cursor-not-allowed select-none transition-all"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 line-through">
                              {slot.timeRange}
                            </p>
                            <StatusBadge status="expired" size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <X className="w-3 h-3 text-slate-400" /> Slot ended • Not bookable
                          </p>
                        </div>
                      );
                    }

                    if (isFull) {
                      return (
                        <div
                          key={slot.id}
                          className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/30 opacity-60 cursor-not-allowed select-none transition-all"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {slot.timeRange}
                            </p>
                            <StatusBadge status="full" size="sm" />
                          </div>
                          <p className="text-[11px] text-rose-600 dark:text-rose-400">
                            Capacity full ({slot.totalCapacity}/{slot.totalCapacity})
                          </p>
                        </div>
                      );
                    }

                    if (isOngoing) {
                      return (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/70 ring-2 ring-blue-600/30'
                              : 'border-blue-300 dark:border-blue-800/80 bg-blue-50/30 dark:bg-blue-950/20 hover:border-blue-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                              <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                                {slot.timeRange}
                              </p>
                            </div>
                            <StatusBadge status="ongoing" size="sm" />
                          </div>
                          <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1">
                            <Radio className="w-3 h-3 text-blue-500" /> Active Now • Immediate Queue Token
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/60 ring-2 ring-emerald-600/30'
                            : 'border-slate-200 dark:border-emerald-900/60 bg-white dark:bg-[#091C13] hover:border-slate-300 dark:hover:border-emerald-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            {slot.timeRange}
                          </p>
                          <StatusBadge status={slot.status} size="sm" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-emerald-300/70">
                          {slot.totalCapacity - slot.bookedCount} of {slot.totalCapacity} slots open
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Back & Continue Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-emerald-900/60">
                <button
                  type="button"
                  onClick={() => {
                    if (initialCentreId) {
                      handleCancelOrLeave('centre-details', { centreId: initialCentreId });
                    } else {
                      setStep(1);
                    }
                  }}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-900 rounded-lg hover:bg-slate-50 dark:hover:bg-[#143224] cursor-pointer transition-colors"
                >
                  {initialCentreId ? t('booking.back_to_hub', 'Back to Centre Details') : t('booking.back_to_centres', 'Back to Centre Selection')}
                </button>

                <button
                  type="button"
                  disabled={!selectedSlot || !isSlotBookable(selectedSlot.status)}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('booking.next_btn', 'Continue')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Confirm Booking */}
      {step === 3 && (
        <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in-50">
          <div className="border-b border-slate-200 dark:border-emerald-900/60 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Public_Sans']">
              {t('booking.review_title', 'Review & Confirm Booking')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-200/70 mt-0.5">
              Enter your harvest details to generate your digital Mandi token.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider">
                  {t('booking.crop_type', 'Crop Type')} *
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#07130E] hover:bg-slate-100/70 dark:hover:bg-[#0B1E16] focus:bg-white dark:focus:bg-[#0E2419] border border-slate-200 dark:border-emerald-900 focus:border-emerald-600 rounded-lg outline-none text-slate-800 dark:text-white transition-all cursor-pointer"
                >
                  {selectedCentre?.acceptedCrops.map((c) => (
                    <option key={c} value={c} className="dark:bg-[#091C13]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider">
                  {t('booking.quantity', 'Estimated Harvest Quantity (in Quintals)')} *
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={quantityQuintals}
                  onChange={(e) => {
                    setQuantityQuintals(Number(e.target.value));
                    setHasQuantityChanged(true);
                  }}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#07130E] hover:bg-slate-100/70 dark:hover:bg-[#0B1E16] focus:bg-white dark:focus:bg-[#0E2419] border border-slate-200 dark:border-emerald-900 focus:border-emerald-600 rounded-lg outline-none text-slate-800 dark:text-white transition-all"
                  placeholder="e.g. 25"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider">
                  {t('booking.vehicle_no', 'Vehicle Number (Optional / Tractor Trolley)')}
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#07130E] hover:bg-slate-100/70 dark:hover:bg-[#0B1E16] focus:bg-white dark:focus:bg-[#0E2419] border border-slate-200 dark:border-emerald-900 focus:border-emerald-600 rounded-lg outline-none uppercase font-mono text-slate-800 dark:text-white transition-all placeholder:text-slate-400"
                  placeholder={t('booking.vehicle_placeholder', 'e.g. AP-31-AB-1234')}
                />
              </div>
            </div>

            {/* Summary Ticket Preview */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-emerald-900/60 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/70">
                {t('booking.review_title', 'Booking Summary')}
              </span>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-emerald-300/70">{t('dash.centre', 'Procurement Centre')}:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedCentre?.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-400/60">{selectedCentre?.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-emerald-900/60">
                  <div>
                    <span className="text-slate-500 dark:text-emerald-300/70">{t('dash.date', 'Scheduled Date')}:</span>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">{selectedDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-emerald-300/70">{t('booking.select_slot', 'Time Slot')}:</span>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">{selectedSlot?.timeRange}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-emerald-900/60">
                  <div>
                    <span className="text-slate-500 dark:text-emerald-300/70">Farmer Name:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {currentUser?.fullName || 'Farmer'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-emerald-300/70">Phone:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {currentUser?.mobileNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-emerald-900/60">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-900 rounded-lg hover:bg-slate-50 dark:hover:bg-[#143224] cursor-pointer transition-colors"
              >
                {t('booking.back_btn', 'Back to Slots')}
              </button>
              <button
                type="button"
                onClick={() => handleCancelOrLeave()}
                className="text-xs font-semibold text-slate-500 dark:text-emerald-300/80 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer px-2 py-1"
              >
                {t('booking.cancel_btn', 'Cancel Booking')}
              </button>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmBooking}
              className="px-8 py-3 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('booking.confirm_btn', 'Confirm & Generate Token')}</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
