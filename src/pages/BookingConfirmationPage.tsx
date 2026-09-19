import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { bookingService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Layers,
  Printer,
  ArrowRight,
  ShieldCheck,
  Wheat,
  User,
} from 'lucide-react';

interface BookingConfirmationPageProps {
  bookingId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({
  bookingId,
  onNavigate,
}) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      const b = await bookingService.getBookingById(bookingId);
      setBooking(b);
      setLoading(false);
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#707973] animate-pulse">
        Generating booking confirmation & Mandi token...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-4 max-w-lg mx-auto shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 font-['Public_Sans']">Booking Not Found</h3>
        <p className="text-xs text-slate-500">
          The booking reference could not be located in the current session.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50 py-4">
      {/* Confirmation Success Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Public_Sans']">
          Booking Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Your slot has been successfully scheduled. Please show your queue token and QR pass upon arrival at the gate.
        </p>
      </div>

      {/* Ticket Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-[#0F291B] p-6 text-white flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Token Allocation
            </span>
            <h3 className="text-2xl font-bold font-mono">Queue #{booking.queueNumber}</h3>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">
              Reference
            </span>
            <span className="text-xs font-mono font-bold bg-white/15 px-2.5 py-1 rounded-md border border-white/10">
              {booking.bookingReference}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Procurement Centre
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 font-['Public_Sans']">{booking.centreName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{booking.centreAddress}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Scheduled Slot
              </span>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {booking.date} • {booking.slotTime}
              </p>
              <div className="mt-1">
                <StatusBadge status={booking.status} size="sm" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Farmer Name</span>
              <p className="font-semibold text-slate-900 mt-0.5">{booking.farmerName}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Crop & Quantity</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {booking.cropType} ({booking.estimatedQuantityQuintals} Qtl)
              </p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Vehicle No.</span>
              <p className="font-mono font-semibold text-slate-900 mt-0.5">
                {booking.vehicleNumber || 'Standard Entry'}
              </p>
            </div>
          </div>

          {/* QR Code Pass Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-slate-900 font-['Public_Sans']">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Mandi Security Pass</span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Scan this electronic code at the check-in weighbridge terminal for automatic gate clearance.
              </p>
            </div>

            {/* Visual SVG QR Code */}
            <div className="w-24 h-24 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <QrCode className="w-20 h-20 text-slate-900" />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => onNavigate('live-queue', { bookingId: booking.id })}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Track Live Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
