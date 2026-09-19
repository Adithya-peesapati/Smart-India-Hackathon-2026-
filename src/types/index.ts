export interface FarmerDocument {
  id: string;
  title: string;
  type: string;
  documentNumber?: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  uploadDate: string;
  fileUrl?: string;
}

export interface FarmerPreferences {
  smsAlerts: boolean;
  whatsappAlerts: boolean;
  preferredLanguage: string;
  autoSlotConfirmation: boolean;
  preferredMandiId?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  mobileNumber: string;
  alternateNumber?: string;
  email?: string;
  dateOfBirth?: string; // e.g. "15 Jan 1998" or "1998-01-15"
  gender?: 'Male' | 'Female' | 'Other' | string;
  password?: string;
  farmerIdNumber?: string; // National Farmer ID / Aadhaar
  accountStatus?: 'Active' | 'Under Review' | 'Pending Verification' | 'Suspended';
  verificationStatus?: {
    aadhaarVerified: boolean;
    mobileVerified: boolean;
    emailVerified: boolean;
    bankVerified: boolean;
  };
  address: {
    villageStreet: string;
    district: string;
    state: string;
    pincode?: string;
  };
  farmDetails?: {
    landSizeAcres: number;
    landOwnership?: string;
    surveyNumber?: string;
    primaryCrops: string[];
    soilType?: string;
    irrigationType?: string;
  };
  bankDetails?: {
    accountNumberMasked?: string;
    accountNumberFull?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
    dbtLinked: boolean;
  };
  documents?: FarmerDocument[];
  preferences?: FarmerPreferences;
  createdAt: string;
}

export type SlotStatus = 'expired' | 'ongoing' | 'available' | 'filling_fast' | 'full';

export interface ProcurementSlot {
  id: string;
  centreId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "09:00 AM"
  endTime: string; // "10:00 AM"
  timeRange: string; // "09:00 AM - 10:00 AM"
  totalCapacity: number;
  bookedCount: number;
  status: SlotStatus;
}

export interface ProcurementCentre {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  address: string;
  contactNumber: string;
  operatingHours: string;
  dailyCapacityQuintals: number;
  activeStatus: 'active' | 'seasonal_closed' | 'full';
  distanceKm?: number;
  acceptedCrops: string[];
  facilities: string[];
}

export type BookingStatus =
  | 'confirmed'
  | 'checked_in'
  | 'in_inspection'
  | 'weighment_done'
  | 'procured'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  bookingReference: string; // e.g. "FLC-202509-8472"
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  centreId: string;
  centreName: string;
  centreAddress: string;
  date: string;
  slotTime: string;
  slotId: string;
  cropType: string;
  estimatedQuantityQuintals: number;
  vehicleNumber?: string;
  queueNumber: number;
  status: BookingStatus;
  createdAt: string;
}

export type QueueStatus = 'waiting' | 'in_progress' | 'completed' | 'skipped';

export interface QueueEntry {
  id: string;
  bookingId: string;
  queueNumber: number;
  farmerName: string;
  cropType: string;
  bookedTime: string;
  status: QueueStatus;
  checkInTime?: string;
}

export type QueueState = 'upcoming' | 'active' | 'completed' | 'cancelled' | 'expired' | 'invalid';

export interface LiveQueueStatus {
  activeBooking: Booking | null;
  queueState?: QueueState;
  isQueueActive?: boolean;
  statusMessage?: string;
  slotStartTimeFormatted?: string;
  currentServingNumber: number | null;
  userQueuePosition: number | null;
  totalInQueue: number;
  completedCount: number;
  inProgressCount: number;
  remainingCount: number;
  queueAheadCount: number | null;
  estimatedWaitMinutes: number | null;
  centreName: string;
  queueEntries: QueueEntry[];
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  transactionReference: string;
  bookingId: string;
  farmerId: string;
  farmerName: string;
  centreName: string;
  cropType: string;
  quantityQuintals: number;
  ratePerQuintal: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  utrNumber?: string;
  date: string;
}

// Backward compatibility alias
export type PaymentTransaction = Transaction;

export type NotificationCategory =
  | 'booking'
  | 'queue'
  | 'queue_update'
  | 'procurement'
  | 'payment'
  | 'system';

export interface NotificationItem {
  id: string;
  farmerId: string;
  title: string;
  message: string;
  category?: NotificationCategory;
  type?: NotificationCategory;
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface SupportTicket {
  id: string;
  farmerId?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}
