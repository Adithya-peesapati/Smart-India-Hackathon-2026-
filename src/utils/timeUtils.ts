import { SlotStatus } from '../types';

/**
 * Formats a Date object into a local 'YYYY-MM-DD' string based on the user/centre timezone.
 * Avoids UTC shifting issues inherent in toISOString().
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the effective current time, taking into account any dynamic test simulations
 * or falling back to the local device/browser clock.
 */
export function getEffectiveNow(): Date {
  try {
    const simTimeStr = localStorage.getItem('farmlink_simulated_now');
    if (simTimeStr) {
      const d = new Date(simTimeStr);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }
  } catch (err) {
    // Ignore storage errors in restricted contexts
  }
  return new Date();
}

export interface ParsedSlotTime {
  startTimeDate: Date | null;
  endTimeDate: Date | null;
  formattedStartTime: string;
  formattedEndTime: string;
  formattedSlot: string;
  isValid: boolean;
}

/**
 * Parses a slot date string (e.g. "2026-09-01") and a time string (e.g. "09:00 AM - 10:00 AM")
 * into concrete JavaScript Date objects in the local timezone.
 */
export function parseSlotDateTime(dateStr?: string, slotTimeStr?: string): ParsedSlotTime {
  if (!dateStr || !slotTimeStr) {
    return {
      startTimeDate: null,
      endTimeDate: null,
      formattedStartTime: '',
      formattedEndTime: '',
      formattedSlot: '',
      isValid: false,
    };
  }

  let year = NaN;
  let month = NaN; // 0-indexed
  let day = NaN;

  const cleanDate = dateStr.trim();
  const dateParts = cleanDate.split(/[-/]/);
  if (dateParts.length === 3) {
    if (dateParts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10) - 1;
      day = parseInt(dateParts[2], 10);
    } else if (dateParts[2].length === 4) {
      // DD-MM-YYYY
      year = parseInt(dateParts[2], 10);
      month = parseInt(dateParts[1], 10) - 1;
      day = parseInt(dateParts[0], 10);
    }
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    const d = new Date(cleanDate);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth();
      day = d.getDate();
    } else {
      return {
        startTimeDate: null,
        endTimeDate: null,
        formattedStartTime: '',
        formattedEndTime: '',
        formattedSlot: slotTimeStr,
        isValid: false,
      };
    }
  }

  // Split slot time into start & end parts
  // Handles: "09:00 AM - 10:00 AM", "9:00 AM–10:00 AM", "09:00 AM to 10:00 AM", "09:00 AM"
  const rangeParts = slotTimeStr.split(/[-–—]|(?:\s+to\s+)/i);
  const startRaw = rangeParts[0]?.trim() || '';
  const endRaw = rangeParts[1]?.trim() || '';

  const parseTime = (timeStr: string): { hours: number; minutes: number; formatted: string } | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = match[3] ? match[3].toUpperCase() : null;

    if (meridiem === 'PM' && hours < 12) {
      hours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }

    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const displayMeridiem = hours >= 12 ? 'PM' : 'AM';
    const formatted = `${displayHours}:${displayMinutes} ${displayMeridiem}`;

    return { hours, minutes, formatted };
  };

  const startParsed = parseTime(startRaw);
  if (!startParsed) {
    return {
      startTimeDate: null,
      endTimeDate: null,
      formattedStartTime: '',
      formattedEndTime: '',
      formattedSlot: slotTimeStr,
      isValid: false,
    };
  }

  const startTimeDate = new Date(year, month, day, startParsed.hours, startParsed.minutes, 0, 0);

  let endTimeDate: Date;
  let formattedEndTime = '';
  const endParsed = parseTime(endRaw);
  if (endParsed) {
    endTimeDate = new Date(year, month, day, endParsed.hours, endParsed.minutes, 0, 0);
    formattedEndTime = endParsed.formatted;
  } else {
    // Default to 1 hour window if no end time specified
    endTimeDate = new Date(year, month, day, startParsed.hours + 1, startParsed.minutes, 0, 0);
    const endH = (startParsed.hours + 1) % 24;
    const dispH = endH % 12 === 0 ? 12 : endH % 12;
    const dispM = startParsed.minutes.toString().padStart(2, '0');
    const dispMeridiem = endH >= 12 ? 'PM' : 'AM';
    formattedEndTime = `${dispH}:${dispM} ${dispMeridiem}`;
  }

  return {
    startTimeDate,
    endTimeDate,
    formattedStartTime: startParsed.formatted,
    formattedEndTime,
    formattedSlot: slotTimeStr,
    isValid: !isNaN(startTimeDate.getTime()) && !isNaN(endTimeDate.getTime()),
  };
}

/**
 * Computes slot status according to strict business logic priority:
 * 1. Expired  -> current time is after the slot's end time.
 * 2. Ongoing  -> current time is between the slot's start and end time.
 *                (If capacity reached during ongoing slot, shows 'full').
 * 3. Full     -> future slot whose capacity has been reached.
 * 4. Available-> future slot with available capacity (or 'filling_fast').
 */
export function computeSlotStatus(
  slotTiming: { startTimeDate: Date | null; endTimeDate: Date | null; isValid: boolean },
  bookedCount: number,
  totalCapacity: number,
  now: Date = getEffectiveNow()
): SlotStatus {
  if (!slotTiming.isValid || !slotTiming.startTimeDate || !slotTiming.endTimeDate) {
    return 'available';
  }

  const nowMs = now.getTime();
  const startMs = slotTiming.startTimeDate.getTime();
  const endMs = slotTiming.endTimeDate.getTime();

  // 1. Expired: Current time is at or after the slot's end time
  if (nowMs >= endMs) {
    return 'expired';
  }

  // 2. Ongoing: Current time is between slot's start and end time
  if (nowMs >= startMs && nowMs < endMs) {
    if (bookedCount >= totalCapacity) {
      return 'full';
    }
    return 'ongoing';
  }

  // 3 & 4. Future slot (nowMs < startMs)
  // Full if capacity reached
  if (bookedCount >= totalCapacity) {
    return 'full';
  }

  // Filling fast if 70% or more capacity is reserved
  if (bookedCount >= totalCapacity * 0.7) {
    return 'filling_fast';
  }

  // Available
  return 'available';
}

/**
 * Checks if a slot can be booked by a farmer.
 * Expired and Full slots can NEVER be selected or booked.
 */
export function isSlotBookable(status: SlotStatus): boolean {
  return status === 'available' || status === 'filling_fast' || status === 'ongoing';
}
