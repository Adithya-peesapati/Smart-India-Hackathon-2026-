import React from 'react';
import { BookingStatus, SlotStatus, QueueStatus, PaymentStatus } from '../types';

interface StatusBadgeProps {
  status: BookingStatus | SlotStatus | QueueStatus | PaymentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-semibold';

  let config = {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: status,
  };

  switch (status) {
    // Slot statuses
    case 'expired':
      config = {
        bg: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800',
        dot: 'bg-slate-400',
        label: 'Expired',
      };
      break;
    case 'ongoing':
    case 'active_slot':
      config = {
        bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
        dot: 'bg-blue-500 animate-pulse',
        label: 'Ongoing',
      };
      break;
    case 'available':
      config = {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Available',
      };
      break;
    case 'filling_fast':
      config = {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Few Slots Left',
      };
      break;
    case 'full':
      config = {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Full',
      };
      break;

    // Booking & Queue statuses
    case 'confirmed':
      config = {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
        label: 'Confirmed',
      };
      break;
    case 'checked_in':
      config = {
        bg: 'bg-sky-50 text-sky-800 border-sky-200',
        dot: 'bg-sky-600',
        label: 'Checked-In',
      };
      break;
    case 'in_inspection':
    case 'in_progress':
      config = {
        bg: 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse',
        dot: 'bg-amber-600',
        label: 'In Progress',
      };
      break;
    case 'weighment_done':
    case 'procured':
    case 'completed':
      config = {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
        label: 'Completed',
      };
      break;
    case 'waiting':
      config = {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-500',
        label: 'Waiting',
      };
      break;
    case 'cancelled':
    case 'failed':
      config = {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Cancelled',
      };
      break;

    // Payment statuses
    case 'processing':
      config = {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Processing DBT',
      };
      break;
    case 'pending':
      config = {
        bg: 'bg-sky-50 text-sky-800 border-sky-200',
        dot: 'bg-sky-500',
        label: 'Pending Approval',
      };
      break;
    case 'active':
      config = {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Operational',
      };
      break;
    default:
      config = {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: String(status).replace(/_/g, ' '),
      };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses} whitespace-nowrap capitalize shadow-2xs font-medium`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
