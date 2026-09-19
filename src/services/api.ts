import {
  UserProfile,
  ProcurementCentre,
  ProcurementSlot,
  Booking,
  BookingStatus,
  QueueEntry,
  QueueState,
  Transaction,
  LiveQueueStatus,
  NotificationItem,
  SupportTicket,
} from '../types';
import { getStateForDistrict } from '../data/indiaLocations';
import {
  getLocalDateString,
  getEffectiveNow,
  parseSlotDateTime,
  computeSlotStatus,
  isSlotBookable,
  ParsedSlotTime,
} from '../utils/timeUtils';

const STORAGE_KEYS = {
  CURRENT_USER: 'farmlink_current_user',
  USERS: 'farmlink_registered_users',
  CENTRES: 'farmlink_procurement_centres_v2',
  BOOKINGS: 'farmlink_bookings',
  TRANSACTIONS: 'farmlink_transactions',
  NOTIFICATIONS: 'farmlink_notifications',
  SUPPORT_TICKETS: 'farmlink_support_tickets',
  CURRENT_SERVING_TOKEN: 'farmlink_current_serving_token_',
};

export const INITIAL_PROCUREMENT_CENTRES: ProcurementCentre[] = [
  {
    id: 'pc-001',
    name: 'District Agricultural APMC Procurement Hub',
    code: 'APMC-LDH-01',
    district: 'Ludhiana',
    state: 'Punjab',
    address: 'Grand Trunk Road, Grain Market Complex, Gate 2',
    contactNumber: '+91 1800-180-1551',
    operatingHours: '08:00 AM - 05:00 PM (Mon - Sat)',
    dailyCapacityQuintals: 3500,
    activeStatus: 'active',
    distanceKm: 4.8,
    acceptedCrops: ['Wheat', 'Paddy', 'Mustard', 'Barley', 'Maize'],
    facilities: ['Automated Moisture Meter', 'Electronic Weighbridge (50 Ton)', 'Covered Shed', 'Farmer Rest Room', 'Direct DBT Counter'],
  },
  {
    id: 'pc-002',
    name: 'Central Krishi Mandi Procurement Centre',
    code: 'KRN-AGR-04',
    district: 'Karnal',
    state: 'Haryana',
    address: 'National Highway 44, New Anaj Mandi Yard',
    contactNumber: '+91 1800-180-2060',
    operatingHours: '08:30 AM - 04:30 PM (Mon - Sat)',
    dailyCapacityQuintals: 4200,
    activeStatus: 'active',
    distanceKm: 7.2,
    acceptedCrops: ['Paddy', 'Basmati Rice', 'Wheat', 'Mustard', 'Sugarcane'],
    facilities: ['Electronic Weighbridge', 'Direct DBT Counter', 'Quality Testing Lab', 'Soil Health Kiosk'],
  },
  {
    id: 'pc-003',
    name: 'Regional Kisan Seva Mandi & Logistics Hub',
    code: 'VNS-PAC-07',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    address: 'Rohania Mandi Complex, Raja Talab Road',
    contactNumber: '+91 1800-180-3344',
    operatingHours: '08:00 AM - 05:00 PM (Mon - Sat)',
    dailyCapacityQuintals: 2800,
    activeStatus: 'active',
    distanceKm: 11.5,
    acceptedCrops: ['Paddy', 'Wheat', 'Pulses', 'Mustard', 'Gram'],
    facilities: ['Covered Storage', 'Rapid Moisture Testing', 'Farmer Helpdesk', 'Kisan Canteen'],
  },
  {
    id: 'pc-004',
    name: 'Malwa Agro Procurement Hub',
    code: 'IND-AGR-12',
    district: 'Indore',
    state: 'Madhya Pradesh',
    address: 'Laxmibai Nagar Mandi, Sanwer Road',
    contactNumber: '+91 1800-233-4035',
    operatingHours: '08:30 AM - 05:30 PM (Mon - Sat)',
    dailyCapacityQuintals: 5000,
    activeStatus: 'active',
    distanceKm: 6.4,
    acceptedCrops: ['Soybean', 'Wheat', 'Gram', 'Maize', 'Cotton'],
    facilities: ['Electronic Weighbridge (60 Ton)', 'Moisture Testing Lab', 'Direct DBT Kiosk', 'Rest Lounge'],
  },
  {
    id: 'pc-005',
    name: 'Godavari Delta Paddy Procurement Centre',
    code: 'GNT-APMC-03',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    address: 'Mirchi Yard Road, Nallapadu Mandi Zone',
    contactNumber: '+91 1800-425-3434',
    operatingHours: '08:00 AM - 05:00 PM (Mon - Sat)',
    dailyCapacityQuintals: 3800,
    activeStatus: 'active',
    distanceKm: 8.9,
    acceptedCrops: ['Paddy', 'Cotton', 'Chilli', 'Maize', 'Pulses'],
    facilities: ['Electronic Weighbridge', 'Seed & Grain Quality Analyzer', 'e-NAM Counter'],
  },
  {
    id: 'pc-006',
    name: 'Telangana State Co-operative Marketing Hub',
    code: 'WGL-MARK-08',
    district: 'Warangal',
    state: 'Telangana',
    address: 'Enumamula Agriculture Market Yard, Hunter Road',
    contactNumber: '+91 1800-425-3333',
    operatingHours: '08:30 AM - 04:30 PM (Mon - Sat)',
    dailyCapacityQuintals: 4600,
    activeStatus: 'active',
    distanceKm: 5.5,
    acceptedCrops: ['Paddy', 'Cotton', 'Maize', 'Turmeric', 'Chilli'],
    facilities: ['Automated Grain Grader', 'Electronic Weighbridge', 'Farmer Rest House', 'DBT Counter'],
  },
  {
    id: 'pc-007',
    name: 'Nashik District Agro & Onion Procurement Mandi',
    code: 'NSK-MANDI-15',
    district: 'Nashik',
    state: 'Maharashtra',
    address: 'Lasalgaon Market Yard, Niphad Taluka',
    contactNumber: '+91 1800-222-345',
    operatingHours: '08:00 AM - 05:00 PM (Mon - Sat)',
    dailyCapacityQuintals: 6000,
    activeStatus: 'active',
    distanceKm: 14.2,
    acceptedCrops: ['Soybean', 'Onion', 'Cotton', 'Maize', 'Wheat'],
    facilities: ['Cold Storage Warehouse', 'Electronic Weighbridge', 'Agri-Advisory Center'],
  },
  {
    id: 'pc-008',
    name: 'Hadoti Agro Procurement & Grain Terminal',
    code: 'KOT-HAD-21',
    district: 'Kota',
    state: 'Rajasthan',
    address: 'Bhamashah Mandi, Anantpura Industrial Area',
    contactNumber: '+91 1800-180-6127',
    operatingHours: '08:00 AM - 05:00 PM (Mon - Sat)',
    dailyCapacityQuintals: 4500,
    activeStatus: 'active',
    distanceKm: 9.3,
    acceptedCrops: ['Soybean', 'Wheat', 'Mustard', 'Coriander', 'Paddy'],
    facilities: ['Automated Quality Grading Lab', 'Direct DBT Counter', 'Covered Bins'],
  },
  {
    id: 'pc-009',
    name: 'Kaveri Basin Rice Procurement Center',
    code: 'TNJ-DPC-02',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    address: 'Direct Purchase Centre Complex, Old Bus Stand Road',
    contactNumber: '+91 1800-425-5901',
    operatingHours: '08:30 AM - 04:30 PM (Mon - Sat)',
    dailyCapacityQuintals: 3000,
    activeStatus: 'active',
    distanceKm: 6.8,
    acceptedCrops: ['Paddy', 'Pulses', 'Groundnut', 'Sugarcane'],
    facilities: ['Moisture Meter', 'Weighment Platform', 'Kisan DBT Counter'],
  },
  {
    id: 'pc-010',
    name: 'Mysuru District Krishi Utpanna Marata Samithi',
    code: 'MYS-APMC-06',
    district: 'Mysuru',
    state: 'Karnataka',
    address: 'APMC Yard, Bandipalya, Ooty Road',
    contactNumber: '+91 1800-425-3553',
    operatingHours: '08:30 AM - 05:00 PM (Mon - Sat)',
    dailyCapacityQuintals: 3200,
    activeStatus: 'active',
    distanceKm: 8.1,
    acceptedCrops: ['Paddy', 'Ragi', 'Maize', 'Pulses', 'Sugarcane'],
    facilities: ['Electronic Weighbridge', 'Farmer Rest Rooms', 'CCTV Security Surveillance'],
  },
  {
    id: 'pc-011',
    name: 'Saurashtra Groundnut & Cotton Procurement Hub',
    code: 'RJK-APMC-09',
    district: 'Rajkot',
    state: 'Gujarat',
    address: 'Bedipara APMC Market Yard, Morbi Road',
    contactNumber: '+91 1800-233-0222',
    operatingHours: '08:00 AM - 05:00 PM (Mon - Sat)',
    dailyCapacityQuintals: 4800,
    activeStatus: 'active',
    distanceKm: 7.7,
    acceptedCrops: ['Groundnut', 'Cotton', 'Wheat', 'Sesame', 'Cumin'],
    facilities: ['Automated Grain Sampling', '50T Electronic Weighbridge', 'Farmer DBT Center'],
  },
  {
    id: 'pc-012',
    name: 'Patna Krishi Utpadan Mandi Samiti',
    code: 'PAT-APMC-05',
    district: 'Patna',
    state: 'Bihar',
    address: 'Bazar Samiti Complex, Musallahpur',
    contactNumber: '+91 1800-345-6222',
    operatingHours: '08:30 AM - 04:30 PM (Mon - Sat)',
    dailyCapacityQuintals: 3400,
    activeStatus: 'active',
    distanceKm: 5.2,
    acceptedCrops: ['Paddy', 'Wheat', 'Maize', 'Pulses', 'Mustard'],
    facilities: ['Electronic Weighbridge', 'Kisan Rest Shelter', 'Quality Assessor'],
  },
  {
    id: 'pc-013',
    name: 'Bengal Agro & Paddy Procurement Centre',
    code: 'HGH-KMS-11',
    district: 'Hooghly',
    state: 'West Bengal',
    address: 'Kisan Mandi Yard, Singur Main Road',
    contactNumber: '+91 1800-345-5505',
    operatingHours: '08:00 AM - 04:30 PM (Mon - Sat)',
    dailyCapacityQuintals: 2900,
    activeStatus: 'active',
    distanceKm: 9.8,
    acceptedCrops: ['Paddy', 'Potato', 'Jute', 'Mustard', 'Sesame'],
    facilities: ['Moisture Testing Unit', 'Electronic Weighment Scales', 'PFMS Direct Pay Counter'],
  },
];

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading localStorage key ${key}:`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('farmlink_storage_update'));
  } catch (err) {
    console.warn(`Error writing localStorage key ${key}:`, err);
  }
}

// Clean up any legacy demo users from localStorage
try {
  const existingUsers = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
  const sanitizedUsers = existingUsers.filter(
    (u) =>
      u &&
      !u.id?.startsWith('usr-demo') &&
      u.mobileNumber !== '9876543210' &&
      u.mobileNumber !== '9123456780' &&
      u.email !== 'rameshwar.patel@kisan.in' &&
      u.email !== 'sita.sharma@kisan.in'
  );
  if (sanitizedUsers.length !== existingUsers.length) {
    setStored(STORAGE_KEYS.USERS, sanitizedUsers);
  }

  const currentUser = getStored<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  if (
    currentUser &&
    (currentUser.id?.startsWith('usr-demo') ||
      currentUser.mobileNumber === '9876543210' ||
      currentUser.mobileNumber === '9123456780' ||
      currentUser.email === 'rameshwar.patel@kisan.in' ||
      currentUser.email === 'sita.sharma@kisan.in' ||
      !sanitizedUsers.some((u) => u.id === currentUser.id))
  ) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
} catch (err) {
  console.warn('User storage cleanup failed:', err);
}

// ----------------------------------------------------
// Authentication Service
// ----------------------------------------------------
export const authService = {
  getCurrentUser(): UserProfile | null {
    return getStored<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  getAllRegisteredUsers(): UserProfile[] {
    return getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
  },

  async checkProfileExists(mobileOrEmail: string): Promise<{ exists: boolean; user?: UserProfile }> {
    await new Promise((res) => setTimeout(res, 100));
    const cleanInput = mobileOrEmail.trim();
    if (!cleanInput) return { exists: false };

    const users = this.getAllRegisteredUsers();
    const cleanDigits = cleanInput.replace(/\D/g, '');
    
    const found = users.find((u) => {
      const uPhoneDigits = (u.mobileNumber || '').replace(/\D/g, '');
      const phoneMatch = cleanDigits.length === 10 && uPhoneDigits === cleanDigits;
      const emailMatch = !!u.email && cleanInput.includes('@') && u.email.trim().toLowerCase() === cleanInput.toLowerCase();
      const cleanAadhaar = cleanInput.replace(/\s|-/g, '');
      const aadhaarMatch = cleanAadhaar.length === 12 && /^\d{12}$/.test(cleanAadhaar) && (u.farmerIdNumber || '').replace(/\s|-/g, '') === cleanAadhaar;
      const farmerIdMatch = !!u.farmerIdNumber && u.farmerIdNumber.trim().toUpperCase() === cleanInput.toUpperCase();
      return phoneMatch || emailMatch || aadhaarMatch || farmerIdMatch;
    });

    return { exists: !!found, user: found };
  },

  async login(
    mobileOrEmail: string,
    password?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string; notFound?: boolean }> {
    await new Promise((res) => setTimeout(res, 350));
    
    const cleanInput = mobileOrEmail.trim();
    if (!cleanInput) {
      return { success: false, error: 'Please enter your registered mobile number or email.' };
    }

    const { exists, user } = await this.checkProfileExists(cleanInput);

    if (!exists || !user) {
      return {
        success: false,
        notFound: true,
        error: 'User does not exist. Please register an account first.',
      };
    }

    // Verify Password strictly against registered password
    if (!password) {
      return {
        success: false,
        error: 'Please enter your password.',
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        error: 'Incorrect password entered. Please check your credentials.',
      };
    }

    setStored(STORAGE_KEYS.CURRENT_USER, user);
    return { success: true, user };
  },

  async register(profileData: Omit<UserProfile, 'id' | 'createdAt'>): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    await new Promise((res) => setTimeout(res, 350));
    
    // 1. Full Name Validation
    const trimmedName = (profileData.fullName || '').trim();
    if (!trimmedName || trimmedName.length < 3) {
      return { success: false, error: 'Full legal name is required and must be at least 3 characters long.' };
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      return { success: false, error: 'Full name can only contain letters, spaces, dots, and hyphens.' };
    }

    // 2. Mobile Number Validation
    const cleanMobile = (profileData.mobileNumber || '').replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' };
    }

    // Check duplicate mobile
    const users = this.getAllRegisteredUsers();
    const existingMobile = users.find((u) => (u.mobileNumber || '').replace(/\D/g, '') === cleanMobile);
    if (existingMobile) {
      return {
        success: false,
        error: `A farmer profile with mobile number (+91 ${cleanMobile}) is already registered. Please log in instead.`,
      };
    }

    // 3. Alternate Mobile Number Validation (if provided)
    if (profileData.alternateNumber && profileData.alternateNumber.trim()) {
      const cleanAlt = profileData.alternateNumber.replace(/\D/g, '');
      if (cleanAlt.length !== 10 || !/^[6-9]\d{9}$/.test(cleanAlt)) {
        return { success: false, error: 'Alternate contact number must be a valid 10-digit Indian mobile number.' };
      }
      if (cleanAlt === cleanMobile) {
        return { success: false, error: 'Alternate contact number cannot be identical to your primary mobile number.' };
      }
    }

    // 4. Email Address Validation (if provided)
    if (profileData.email && profileData.email.trim()) {
      const emailTrimmed = profileData.email.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailTrimmed)) {
        return { success: false, error: 'Please provide a valid email address (e.g. name@domain.com).' };
      }

      const existingEmail = users.find(
        (u) => u.email && u.email.toLowerCase() === emailTrimmed
      );
      if (existingEmail) {
        return {
          success: false,
          error: `A farmer profile with email (${profileData.email}) is already registered. Please log in instead.`,
        };
      }
    }

    // 5. Password Validation & Strength
    const password = profileData.password || '';
    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return { success: false, error: 'Password must contain both letters and numbers for account security.' };
    }

    // 6. Date of Birth Validation (Age constraint >= 18)
    if (!profileData.dateOfBirth) {
      return { success: false, error: 'Date of birth is required for KYC verification.' };
    }
    const dob = new Date(profileData.dateOfBirth);
    if (isNaN(dob.getTime())) {
      return { success: false, error: 'Please provide a valid date of birth.' };
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      return { success: false, error: 'Applicant must be at least 18 years old to register as a farmer on AgriSetu.' };
    }
    if (age > 120 || dob > today) {
      return { success: false, error: 'Please enter a valid realistic date of birth.' };
    }

    // 7. National Farmer ID / Aadhaar Format Check (Compulsory)
    const farmerIdRaw = (profileData.farmerIdNumber || '').trim();
    if (!farmerIdRaw) {
      return { success: false, error: 'Aadhaar Number or Farmer ID is compulsory for government procurement registration.' };
    }
    const cleanFarmerId = farmerIdRaw.replace(/\s/g, '');
    const is12DigitAadhaar = /^\d{12}$/.test(cleanFarmerId);
    const isFarmerIdPattern = /^[A-Z0-9/-]{6,25}$/i.test(farmerIdRaw);
    if (!is12DigitAadhaar && !isFarmerIdPattern) {
      return { success: false, error: 'Aadhaar Number or Farmer ID must be a valid 12-digit Aadhaar number (e.g. 1234 5678 9012) or government Farmer ID (e.g. FRM-PB-2025-8841).' };
    }

    // Check duplicate Aadhaar or Farmer ID
    const cleanComp = cleanFarmerId.toUpperCase();
    const existingFarmer = users.find((u) => {
      const existingClean = (u.farmerIdNumber || '').trim().replace(/\s/g, '').toUpperCase();
      return existingClean && existingClean === cleanComp;
    });
    if (existingFarmer) {
      return {
        success: false,
        error: `A farmer profile with this Aadhaar / Farmer ID (${farmerIdRaw}) is already registered. Please log in instead.`,
      };
    }

    // 8. Primary Address Validation
    if (!profileData.address || !profileData.address.villageStreet?.trim() || profileData.address.villageStreet.trim().length < 3) {
      return { success: false, error: 'Village, town, or street address must be at least 3 characters.' };
    }
    if (!profileData.address.state?.trim()) {
      return { success: false, error: 'State / Union Territory selection is required.' };
    }
    if (!profileData.address.district?.trim()) {
      return { success: false, error: 'District selection is required.' };
    }
    const pincode = (profileData.address.pincode || '').replace(/\D/g, '');
    if (!pincode || pincode.length !== 6) {
      return { success: false, error: 'PIN Code must be exactly 6 digits.' };
    }

    // 9. Agricultural & Farm Details Validation
    if (!profileData.farmDetails) {
      return { success: false, error: 'Agricultural holdings details are required.' };
    }
    const landSize = Number(profileData.farmDetails.landSizeAcres);
    if (isNaN(landSize) || landSize <= 0 || landSize > 1000) {
      return { success: false, error: 'Please enter a valid land holding size between 0.1 and 1000 acres.' };
    }
    if (!profileData.farmDetails.surveyNumber || profileData.farmDetails.surveyNumber.trim().length < 2) {
      return { success: false, error: 'Survey / Khata / Dag number is required (at least 2 characters).' };
    }
    if (!profileData.farmDetails.primaryCrops || profileData.farmDetails.primaryCrops.length === 0) {
      return { success: false, error: 'Please select at least one primary cultivated crop.' };
    }

    // 10. Bank & Direct Benefit Transfer Validation
    if (!profileData.bankDetails) {
      return { success: false, error: 'Bank account and DBT details are required for procurement settlements.' };
    }
    if (!profileData.bankDetails.bankName || profileData.bankDetails.bankName.trim().length < 3) {
      return { success: false, error: 'Bank name is required (minimum 3 characters).' };
    }
    const accNumber = (profileData.bankDetails.accountNumberFull || profileData.bankDetails.accountNumberMasked || '').replace(/\D/g, '');
    if (!accNumber || accNumber.length < 9 || accNumber.length > 18) {
      return { success: false, error: 'Bank account number must be between 9 and 18 numeric digits.' };
    }
    const ifsc = (profileData.bankDetails.ifscCode || '').trim().toUpperCase();
    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      return { success: false, error: 'Invalid IFSC code format (e.g. SBIN0001234, HDFC0000053).' };
    }
    if (profileData.bankDetails.upiId && profileData.bankDetails.upiId.trim()) {
      const upi = profileData.bankDetails.upiId.trim();
      if (!/^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,49}$/.test(upi)) {
        return { success: false, error: 'Invalid UPI ID format (e.g. farmer@okhdfcbank or 9876543210@paytm).' };
      }
    }

    const newUser: UserProfile = {
      ...profileData,
      fullName: trimmedName,
      mobileNumber: cleanMobile,
      email: profileData.email?.trim() || undefined,
      id: 'usr-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      accountStatus: profileData.accountStatus || 'Active',
      gender: profileData.gender || 'Male',
      dateOfBirth: profileData.dateOfBirth,
      alternateNumber: profileData.alternateNumber ? profileData.alternateNumber.trim() : undefined,
      verificationStatus: profileData.verificationStatus || {
        aadhaarVerified: true,
        mobileVerified: true,
        emailVerified: !!profileData.email,
        bankVerified: true,
      },
      documents: profileData.documents || [
        {
          id: 'doc-001',
          title: 'National Farmer ID / Aadhaar Card',
          type: 'Identity Proof',
          documentNumber: profileData.farmerIdNumber || 'XXXX-XXXX-3518',
          status: 'Verified',
          uploadDate: new Date().toISOString(),
        },
        {
          id: 'doc-002',
          title: 'Agricultural Land Title Record (Khatauni)',
          type: 'Land Ownership',
          documentNumber: profileData.farmDetails?.surveyNumber || 'KH-884/21',
          status: 'Verified',
          uploadDate: new Date().toISOString(),
        },
        {
          id: 'doc-003',
          title: 'Bank DBT Linked Passbook / PFMS Mandate',
          type: 'Bank & DBT',
          documentNumber: profileData.bankDetails?.accountNumberMasked || 'XXXX-XXXX-8821',
          status: 'Verified',
          uploadDate: new Date().toISOString(),
        },
      ],
      preferences: profileData.preferences || {
        smsAlerts: true,
        whatsappAlerts: true,
        preferredLanguage: 'English',
        autoSlotConfirmation: true,
      },
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    setStored(STORAGE_KEYS.CURRENT_USER, newUser);

    await notificationService.addNotification({
      farmerId: newUser.id,
      title: 'Farmer Registration Successful',
      message: `Welcome to AgriSetu! Your National Farmer profile has been initialized. You can now browse procurement centres and reserve your slot.`,
      category: 'system',
      type: 'system',
      link: '/dashboard',
    });

    return { success: true, user: newUser };
  },

  async updateProfile(userIdOrData: string | Partial<UserProfile>, updateData?: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Not authenticated');

    const patch = typeof userIdOrData === 'string' ? (updateData || {}) : userIdOrData;
    const merged: UserProfile = { ...current, ...patch };
    setStored(STORAGE_KEYS.CURRENT_USER, merged);

    const users = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx !== -1) {
      users[idx] = merged;
      setStored(STORAGE_KEYS.USERS, users);
    }

    return merged;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.dispatchEvent(new Event('farmlink_storage_update'));
  },
};

// ----------------------------------------------------
// Centre Service
// ----------------------------------------------------
export const centreService = {
  async getCentres(filter?: {
    query?: string;
    state?: string;
    district?: string;
    status?: string;
  }): Promise<ProcurementCentre[]> {
    await new Promise((res) => setTimeout(res, 150));
    let centres = getStored<ProcurementCentre[]>(STORAGE_KEYS.CENTRES, INITIAL_PROCUREMENT_CENTRES);

    // If a specific state and/or district is selected that has no centres yet, generate authentic centres
    if (filter?.district && filter.district !== 'All Districts') {
      const distLower = filter.district.toLowerCase();
      const existingInDistrict = centres.filter((c) => c.district.toLowerCase() === distLower);
      if (existingInDistrict.length === 0) {
        const detectedState = filter.state && filter.state !== 'All States' 
          ? filter.state 
          : (getStateForDistrict(filter.district) || 'State Agriculture Dept');
        
        const cleanDist = filter.district;
        const codePrefix = cleanDist.substring(0, 3).toUpperCase();
        const genCentres: ProcurementCentre[] = [
          {
            id: `pc-${cleanDist.toLowerCase().replace(/[^a-z0-9]/g, '-')}-01`,
            name: `${cleanDist} District APMC Main Procurement Yard`,
            code: `${codePrefix}-APMC-01`,
            district: cleanDist,
            state: detectedState,
            address: `Main Market Yard, APMC Complex, ${cleanDist}`,
            contactNumber: '+91 1800-180-' + Math.floor(1000 + Math.random() * 9000),
            operatingHours: '08:30 AM - 05:00 PM (Mon - Sat)',
            dailyCapacityQuintals: 3000 + Math.floor(Math.random() * 2000),
            activeStatus: 'active',
            distanceKm: +(3 + Math.random() * 10).toFixed(1),
            acceptedCrops: ['Paddy', 'Wheat', 'Mustard', 'Maize', 'Pulses', 'Soybean', 'Cotton'],
            facilities: ['Electronic Weighbridge', 'Automated Moisture Meter', 'Covered Grain Shed', 'Direct DBT Payment Kiosk'],
          },
          {
            id: `pc-${cleanDist.toLowerCase().replace(/[^a-z0-9]/g, '-')}-02`,
            name: `${cleanDist} Kisan PACS Co-operative Procurement Centre`,
            code: `${codePrefix}-PACS-02`,
            district: cleanDist,
            state: detectedState,
            address: `Kisan Seva Kendra, Tehsil Road, ${cleanDist}`,
            contactNumber: '+91 1800-425-' + Math.floor(1000 + Math.random() * 9000),
            operatingHours: '09:00 AM - 04:30 PM (Mon - Sat)',
            dailyCapacityQuintals: 2200 + Math.floor(Math.random() * 1500),
            activeStatus: 'active',
            distanceKm: +(8 + Math.random() * 12).toFixed(1),
            acceptedCrops: ['Wheat', 'Paddy', 'Gram', 'Oilseeds', 'Coarse Grains'],
            facilities: ['Quality Grain Assay Lab', 'Electronic Scales', 'Farmer Rest Room'],
          },
        ];

        centres = [...centres, ...genCentres];
        setStored(STORAGE_KEYS.CENTRES, centres);
      }
    } else if (filter?.state && filter.state !== 'All States') {
      const stateLower = filter.state.toLowerCase();
      const existingInState = centres.filter((c) => c.state.toLowerCase() === stateLower);
      if (existingInState.length === 0) {
        const stateName = filter.state;
        const codePrefix = stateName.substring(0, 3).toUpperCase();
        const genCentre: ProcurementCentre = {
          id: `pc-${stateName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-central-01`,
          name: `${stateName} State Central Krishi Mandi Hub`,
          code: `${codePrefix}-CKM-01`,
          district: `${stateName} Central`,
          state: stateName,
          address: `State Agricultural Marketing Board Complex, Sector 4`,
          contactNumber: '+91 1800-180-' + Math.floor(1000 + Math.random() * 9000),
          operatingHours: '08:30 AM - 05:00 PM (Mon - Sat)',
          dailyCapacityQuintals: 4500,
          activeStatus: 'active',
          distanceKm: 6.5,
          acceptedCrops: ['Paddy', 'Wheat', 'Maize', 'Mustard', 'Pulses', 'Cotton'],
          facilities: ['50T Electronic Weighbridge', 'Automated Moisture Meter', 'Direct DBT Counter', 'Farmer Lounge'],
        };
        centres = [...centres, genCentre];
        setStored(STORAGE_KEYS.CENTRES, centres);
      }
    }
    
    if (filter) {
      if (filter.query && filter.query.trim() !== '') {
        const q = filter.query.toLowerCase();
        centres = centres.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.district.toLowerCase().includes(q) ||
            c.state.toLowerCase().includes(q) ||
            c.address.toLowerCase().includes(q) ||
            c.acceptedCrops.some((crop) => crop.toLowerCase().includes(q))
        );
      }
      if (filter.state && filter.state !== 'All States') {
        centres = centres.filter((c) => c.state.toLowerCase() === filter.state?.toLowerCase());
      }
      if (filter.district && filter.district !== 'All Districts') {
        centres = centres.filter((c) => c.district.toLowerCase() === filter.district?.toLowerCase());
      }
      if (filter.status && filter.status !== 'Any Status') {
        centres = centres.filter((c) => c.activeStatus === filter.status);
      }
    }
    return centres;
  },

  async getCentreById(id: string): Promise<ProcurementCentre | null> {
    const centres = await this.getCentres();
    return centres.find((c) => c.id === id) || null;
  },

  async getAvailableSlots(centreId: string, dateStr: string): Promise<ProcurementSlot[]> {
    await new Promise((res) => setTimeout(res, 150));

    const slotTemplates = [
      { startTime: '09:00 AM', endTime: '10:00 AM', timeRange: '09:00 AM - 10:00 AM', total: 20 },
      { startTime: '10:00 AM', endTime: '11:00 AM', timeRange: '10:00 AM - 11:00 AM', total: 20 },
      { startTime: '11:00 AM', endTime: '12:00 PM', timeRange: '11:00 AM - 12:00 PM', total: 20 },
      { startTime: '12:00 PM', endTime: '01:00 PM', timeRange: '12:00 PM - 01:00 PM', total: 15 },
      { startTime: '02:00 PM', endTime: '03:00 PM', timeRange: '02:00 PM - 03:00 PM', total: 20 },
      { startTime: '03:00 PM', endTime: '04:00 PM', timeRange: '03:00 PM - 04:00 PM', total: 20 },
    ];

    const bookings = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const now = getEffectiveNow();

    return slotTemplates.map((template, idx) => {
      const slotBookings = bookings.filter(
        (b) => b.centreId === centreId && b.date === dateStr && b.slotTime === template.timeRange && b.status !== 'cancelled'
      );
      const bookedCount = slotBookings.length;

      const slotTiming = parseSlotDateTime(dateStr, template.timeRange);
      const status = computeSlotStatus(slotTiming, bookedCount, template.total, now);

      return {
        id: `slot-${centreId}-${dateStr}-${idx}`,
        centreId,
        date: dateStr,
        startTime: template.startTime,
        endTime: template.endTime,
        timeRange: template.timeRange,
        totalCapacity: template.total,
        bookedCount,
        status,
      };
    });
  },
};

// ----------------------------------------------------
// Booking Service
// ----------------------------------------------------
export const bookingService = {
  async getFarmerBookings(farmerId: string): Promise<Booking[]> {
    await new Promise((res) => setTimeout(res, 150));
    if (!farmerId) return [];
    const all = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    return all.filter((b) => b.farmerId === farmerId).reverse();
  },

  async getBookingById(bookingId: string): Promise<Booking | null> {
    const all = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    return all.find((b) => b.id === bookingId || b.bookingReference === bookingId) || null;
  },

  async createBooking(params: {
    farmerId: string;
    farmerName: string;
    farmerPhone: string;
    centreId: string;
    centreName: string;
    centreAddress: string;
    date: string;
    slotId: string;
    slotTime: string;
    cropType: string;
    estimatedQuantityQuintals: number;
    vehicleNumber?: string;
  }): Promise<Booking> {
    await new Promise((res) => setTimeout(res, 350));

    const allBookings = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);

    // Strict time validation: Reject expired slots
    const parsed = parseSlotDateTime(params.date, params.slotTime);
    if (!parsed.isValid || !parsed.endTimeDate) {
      throw new Error('Invalid slot date or time specified.');
    }
    const now = getEffectiveNow();
    if (now.getTime() >= parsed.endTimeDate.getTime()) {
      throw new Error('This procurement slot has expired and can no longer be booked. Please select an active or upcoming slot.');
    }

    // Strict capacity validation: Reject full slots
    const sameSlotBookings = allBookings.filter(
      (b) => b.centreId === params.centreId && b.date === params.date && b.slotTime === params.slotTime && b.status !== 'cancelled'
    );
    if (sameSlotBookings.length >= 20) {
      throw new Error('This procurement slot is fully booked. Please choose another time slot.');
    }
    
    const sameDateBookings = allBookings.filter(
      (b) => b.centreId === params.centreId && b.date === params.date && b.status !== 'cancelled'
    );
    const queueNumber = sameDateBookings.length + 1;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = params.date.replace(/-/g, '').slice(2);
    const bookingReference = `FLC-${dateFormatted}-${randomSuffix}`;

    const newBooking: Booking = {
      id: 'bkg-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      bookingReference,
      farmerId: params.farmerId,
      farmerName: params.farmerName,
      farmerPhone: params.farmerPhone,
      centreId: params.centreId,
      centreName: params.centreName,
      centreAddress: params.centreAddress,
      date: params.date,
      slotId: params.slotId,
      slotTime: params.slotTime,
      cropType: params.cropType,
      estimatedQuantityQuintals: params.estimatedQuantityQuintals,
      vehicleNumber: params.vehicleNumber,
      queueNumber,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    allBookings.push(newBooking);
    setStored(STORAGE_KEYS.BOOKINGS, allBookings);

    // Clear any previous simulation flag for this booking id
    localStorage.removeItem(`farmlink_simulated_slot_active_${newBooking.id}`);

    await notificationService.addNotification({
      farmerId: params.farmerId,
      title: 'Slot Booking Confirmed',
      message: `Your procurement slot for ${params.cropType} (${params.estimatedQuantityQuintals} Qtl) is confirmed at ${params.centreName} on ${params.date} (${params.slotTime}). Assigned Queue Token: #${queueNumber}.`,
      category: 'booking',
      type: 'booking',
      link: `/booking-confirmation/${newBooking.id}`,
    });

    return newBooking;
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking | null> {
    const all = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const idx = all.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    all[idx].status = status;
    setStored(STORAGE_KEYS.BOOKINGS, all);

    if (status === 'completed') {
      // Auto generate transaction record for DBT
      const b = all[idx];
      const mspRate = b.cropType.toLowerCase().includes('wheat') ? 2275 : b.cropType.toLowerCase().includes('paddy') ? 2183 : 2450;
      const totalAmount = b.estimatedQuantityQuintals * mspRate;

      const newTxn: Transaction = {
        id: 'txn-' + Date.now().toString(36),
        transactionReference: `TRX-${b.bookingReference.replace('FLC-', '')}`,
        bookingId: b.id,
        farmerId: b.farmerId,
        farmerName: b.farmerName,
        centreName: b.centreName,
        cropType: b.cropType,
        quantityQuintals: b.estimatedQuantityQuintals,
        ratePerQuintal: mspRate,
        totalAmount,
        paymentStatus: 'completed',
        paymentMethod: 'Direct Benefit Transfer (DBT)',
        utrNumber: `DBT${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
      };

      const txns = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
      txns.unshift(newTxn);
      setStored(STORAGE_KEYS.TRANSACTIONS, txns);

      await notificationService.addNotification({
        farmerId: b.farmerId,
        title: 'DBT Payment Disbursed',
        message: `₹${totalAmount.toLocaleString('en-IN')} has been initiated via Direct Benefit Transfer for ${b.cropType} weighment receipt ${b.bookingReference}.`,
        category: 'payment',
        type: 'payment',
        link: '/my-transactions',
      });
    }

    return all[idx];
  },

  async cancelBooking(bookingId: string, farmerId?: string): Promise<boolean> {
    const all = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const idx = all.findIndex((b) => b.id === bookingId && (!farmerId || b.farmerId === farmerId));
    if (idx === -1) return false;

    all[idx].status = 'cancelled';
    setStored(STORAGE_KEYS.BOOKINGS, all);

    await notificationService.addNotification({
      farmerId: all[idx].farmerId,
      title: 'Booking Cancelled',
      message: `Your booking (${all[idx].bookingReference}) for ${all[idx].cropType} on ${all[idx].date} has been cancelled.`,
      category: 'booking',
      type: 'booking',
    });

    return true;
  },
};

// ----------------------------------------------------
// Re-export time utilities for backward compatibility
// ----------------------------------------------------
export {
  getLocalDateString,
  getEffectiveNow,
  parseSlotDateTime,
  computeSlotStatus,
  isSlotBookable,
};
export type { ParsedSlotTime };

// ----------------------------------------------------
// Live Queue Service
// ----------------------------------------------------
export const queueService = {
  async getLiveQueueStatus(farmerId: string, bookingId?: string): Promise<LiveQueueStatus> {
    await new Promise((res) => setTimeout(res, 150));

    if (!farmerId) {
      return {
        activeBooking: null,
        queueState: 'invalid',
        isQueueActive: false,
        statusMessage: 'No farmer ID provided',
        slotStartTimeFormatted: '',
        currentServingNumber: null,
        userQueuePosition: null,
        totalInQueue: 0,
        completedCount: 0,
        inProgressCount: 0,
        remainingCount: 0,
        queueAheadCount: null,
        estimatedWaitMinutes: null,
        centreName: '',
        queueEntries: [],
      };
    }

    const allBookings = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    
    let activeBooking: Booking | null = null;
    if (bookingId) {
      activeBooking = allBookings.find((b) => b.id === bookingId || b.bookingReference === bookingId) || null;
    } else {
      const farmerBookings = allBookings.filter((b) => b.farmerId === farmerId);
      // Prioritize checked-in or in-inspection
      const activeNow = farmerBookings.find((b) => b.status === 'checked_in' || b.status === 'in_inspection');
      if (activeNow) {
        activeBooking = activeNow;
      } else {
        // Find confirmed bookings
        const confirmedBookings = farmerBookings.filter((b) => b.status === 'confirmed');
        confirmedBookings.sort((a, b) => {
          const aTime = parseSlotDateTime(a.date, a.slotTime).startTimeDate?.getTime() || 0;
          const bTime = parseSlotDateTime(b.date, b.slotTime).startTimeDate?.getTime() || 0;
          return aTime - bTime;
        });
        activeBooking = confirmedBookings[0] || null;
      }
    }

    if (!activeBooking) {
      return {
        activeBooking: null,
        queueState: 'invalid',
        isQueueActive: false,
        statusMessage: 'No active or scheduled booking found',
        slotStartTimeFormatted: '',
        currentServingNumber: null,
        userQueuePosition: null,
        totalInQueue: 0,
        completedCount: 0,
        inProgressCount: 0,
        remainingCount: 0,
        queueAheadCount: null,
        estimatedWaitMinutes: null,
        centreName: '',
        queueEntries: [],
      };
    }

    // 1. Edge Case: Cancelled Booking
    if (activeBooking.status === 'cancelled') {
      const parsedTime = parseSlotDateTime(activeBooking.date, activeBooking.slotTime);
      return {
        activeBooking,
        queueState: 'cancelled',
        isQueueActive: false,
        statusMessage: 'This scheduled procurement slot has been cancelled.',
        slotStartTimeFormatted: parsedTime.formattedStartTime,
        currentServingNumber: null,
        userQueuePosition: activeBooking.queueNumber,
        totalInQueue: 0,
        completedCount: 0,
        inProgressCount: 0,
        remainingCount: 0,
        queueAheadCount: null,
        estimatedWaitMinutes: null,
        centreName: activeBooking.centreName,
        queueEntries: [],
      };
    }

    // 2. Edge Case: Completed / Procured Booking
    if (activeBooking.status === 'completed' || activeBooking.status === 'procured') {
      const parsedTime = parseSlotDateTime(activeBooking.date, activeBooking.slotTime);
      return {
        activeBooking,
        queueState: 'completed',
        isQueueActive: false,
        statusMessage: 'Procurement and weighment completed.',
        slotStartTimeFormatted: parsedTime.formattedStartTime,
        currentServingNumber: activeBooking.queueNumber,
        userQueuePosition: activeBooking.queueNumber,
        totalInQueue: 1,
        completedCount: 1,
        inProgressCount: 0,
        remainingCount: 0,
        queueAheadCount: 0,
        estimatedWaitMinutes: 0,
        centreName: activeBooking.centreName,
        queueEntries: [],
      };
    }

    // 3. Edge Case: Invalid or missing booking time
    const parsedTime = parseSlotDateTime(activeBooking.date, activeBooking.slotTime);
    if (!parsedTime.isValid || !parsedTime.startTimeDate) {
      return {
        activeBooking,
        queueState: 'invalid',
        isQueueActive: false,
        statusMessage: 'Scheduled slot time could not be verified.',
        slotStartTimeFormatted: '',
        currentServingNumber: null,
        userQueuePosition: activeBooking.queueNumber,
        totalInQueue: 0,
        completedCount: 0,
        inProgressCount: 0,
        remainingCount: 0,
        queueAheadCount: null,
        estimatedWaitMinutes: null,
        centreName: activeBooking.centreName,
        queueEntries: [],
      };
    }

    // Same-day centre bookings
    const centreBookings = allBookings
      .filter((b) => b.centreId === activeBooking.centreId && b.date === activeBooking.date && b.status !== 'cancelled')
      .sort((a, b) => a.queueNumber - b.queueNumber);

    const totalInQueue = centreBookings.length;
    const completedCount = centreBookings.filter((b) => b.status === 'completed' || b.status === 'procured').length;
    const inProgressCount = centreBookings.filter((b) => b.status === 'in_inspection' || b.status === 'checked_in').length;
    const remainingCount = Math.max(0, totalInQueue - completedCount - inProgressCount);

    // 4. Time Check: Compare effective current local time with slot timing
    const effectiveNow = getEffectiveNow();
    const simActive = localStorage.getItem(`farmlink_simulated_slot_active_${activeBooking.id}`) === 'true';

    const isSlotStarted = effectiveNow.getTime() >= parsedTime.startTimeDate.getTime();
    const isSlotEnded = parsedTime.endTimeDate ? effectiveNow.getTime() >= parsedTime.endTimeDate.getTime() : false;
    const isExplicitlyActive =
      activeBooking.status === 'checked_in' ||
      activeBooking.status === 'in_inspection' ||
      activeBooking.status === 'weighment_done';

    // 5. EXPIRED SLOT: Slot end time has passed and farmer did not check in
    if (!isExplicitlyActive && isSlotEnded && !simActive && activeBooking.status === 'confirmed') {
      return {
        activeBooking,
        queueState: 'expired',
        isQueueActive: false,
        statusMessage: `This procurement slot has expired. It was scheduled for ${parsedTime.formattedSlot} on ${activeBooking.date}.`,
        slotStartTimeFormatted: parsedTime.formattedStartTime,
        currentServingNumber: null,
        userQueuePosition: activeBooking.queueNumber,
        totalInQueue,
        completedCount,
        inProgressCount,
        remainingCount,
        queueAheadCount: null,
        estimatedWaitMinutes: null,
        centreName: activeBooking.centreName,
        queueEntries: [],
      };
    }

    const isQueueActive = isExplicitlyActive || isSlotStarted || simActive;

    // 6. BEFORE SLOT START TIME -> Upcoming Slot State
    if (!isQueueActive) {
      const queueEntries: QueueEntry[] = centreBookings.map((b) => ({
        id: b.id,
        bookingId: b.id,
        queueNumber: b.queueNumber,
        farmerName: b.farmerId === farmerId ? `${b.farmerName} (You)` : `Farmer Token #${b.queueNumber}`,
        cropType: b.cropType,
        bookedTime: b.slotTime,
        status: 'waiting',
        checkInTime: 'Scheduled',
      }));

      return {
        activeBooking,
        queueState: 'upcoming',
        isQueueActive: false,
        statusMessage: `Your queue will become active at ${parsedTime.formattedStartTime}.`,
        slotStartTimeFormatted: parsedTime.formattedStartTime,
        currentServingNumber: null, // Do NOT show farmer as currently being served
        userQueuePosition: activeBooking.queueNumber,
        totalInQueue,
        completedCount,
        inProgressCount,
        remainingCount,
        queueAheadCount: null, // Do NOT show Farmers Ahead as 0
        estimatedWaitMinutes: null, // Do NOT show Estimated Wait as 0m
        centreName: activeBooking.centreName,
        queueEntries,
      };
    }

    // 7. AT OR AFTER SLOT START TIME -> Queue Active State
    const centreKey = STORAGE_KEYS.CURRENT_SERVING_TOKEN + activeBooking.centreId;
    let currentServingNumber = Number(localStorage.getItem(centreKey)) || 1;
    if (currentServingNumber < 1) currentServingNumber = 1;

    const queueAheadCount = Math.max(0, activeBooking.queueNumber - currentServingNumber);
    const estimatedWaitMinutes = queueAheadCount * 12;

    const queueEntries: QueueEntry[] = centreBookings.map((b) => ({
      id: b.id,
      bookingId: b.id,
      queueNumber: b.queueNumber,
      farmerName: b.farmerId === farmerId ? `${b.farmerName} (You)` : `Farmer Token #${b.queueNumber}`,
      cropType: b.cropType,
      bookedTime: b.slotTime,
      status:
        b.queueNumber < currentServingNumber
          ? 'completed'
          : b.queueNumber === currentServingNumber
          ? 'in_progress'
          : 'waiting',
      checkInTime: b.status !== 'confirmed' ? 'Checked-In' : 'Scheduled',
    }));

    return {
      activeBooking,
      queueState: 'active',
      isQueueActive: true,
      statusMessage: !isSlotEnded
        ? 'Your slot is ongoing. Weighbridge and queue are active.'
        : 'Queue is currently active for this slot.',
      slotStartTimeFormatted: parsedTime.formattedStartTime,
      currentServingNumber,
      userQueuePosition: activeBooking.queueNumber,
      totalInQueue,
      completedCount,
      inProgressCount,
      remainingCount,
      queueAheadCount,
      estimatedWaitMinutes,
      centreName: activeBooking.centreName,
      queueEntries,
    };
  },

  async advanceQueue(centreId: string): Promise<number> {
    const centreKey = STORAGE_KEYS.CURRENT_SERVING_TOKEN + centreId;
    const current = Number(localStorage.getItem(centreKey)) || 1;
    const nextVal = current + 1;
    localStorage.setItem(centreKey, String(nextVal));
    window.dispatchEvent(new Event('farmlink_storage_update'));
    return nextVal;
  },

  async toggleSimulateSlotStart(bookingId: string): Promise<boolean> {
    const key = `farmlink_simulated_slot_active_${bookingId}`;
    const current = localStorage.getItem(key) === 'true';
    const all = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const b = all.find((item) => item.id === bookingId);

    if (current) {
      localStorage.removeItem(key);
      if (b) {
        const parsed = parseSlotDateTime(b.date, b.slotTime);
        if (parsed.startTimeDate) {
          const beforeTime = new Date(parsed.startTimeDate.getTime() - 30 * 60 * 1000);
          localStorage.setItem('farmlink_simulated_now', beforeTime.toISOString());
        }
      }
    } else {
      localStorage.setItem(key, 'true');
      if (b) {
        const parsed = parseSlotDateTime(b.date, b.slotTime);
        if (parsed.startTimeDate) {
          localStorage.setItem('farmlink_simulated_now', parsed.startTimeDate.toISOString());
        }
      }
    }
    window.dispatchEvent(new Event('farmlink_storage_update'));
    return !current;
  },

  async simulateSlotStart(bookingId: string): Promise<boolean> {
    const key = `farmlink_simulated_slot_active_${bookingId}`;
    localStorage.setItem(key, 'true');
    const all = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const b = all.find((item) => item.id === bookingId);
    if (b) {
      const parsed = parseSlotDateTime(b.date, b.slotTime);
      if (parsed.startTimeDate) {
        localStorage.setItem('farmlink_simulated_now', parsed.startTimeDate.toISOString());
      }
    }
    window.dispatchEvent(new Event('farmlink_storage_update'));
    return true;
  },

  async simulateBeforeSlot(bookingId: string): Promise<boolean> {
    const key = `farmlink_simulated_slot_active_${bookingId}`;
    localStorage.removeItem(key);
    const all = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
    const b = all.find((item) => item.id === bookingId);
    if (b) {
      const parsed = parseSlotDateTime(b.date, b.slotTime);
      if (parsed.startTimeDate) {
        const beforeTime = new Date(parsed.startTimeDate.getTime() - 30 * 60 * 1000);
        localStorage.setItem('farmlink_simulated_now', beforeTime.toISOString());
      }
    }
    window.dispatchEvent(new Event('farmlink_storage_update'));
    return false;
  },
};

// ----------------------------------------------------
// Transactions Service
// ----------------------------------------------------
export const transactionService = {
  async getFarmerTransactions(farmerId: string): Promise<Transaction[]> {
    await new Promise((res) => setTimeout(res, 150));
    if (!farmerId) return [];
    const all = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    return all.filter((t) => t.farmerId === farmerId);
  },
};

// ----------------------------------------------------
// Notifications Service
// ----------------------------------------------------
export const notificationService = {
  async getFarmerNotifications(farmerId: string): Promise<NotificationItem[]> {
    await new Promise((res) => setTimeout(res, 100));
    if (!farmerId) return [];
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return all.filter((n) => n.farmerId === farmerId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): Promise<NotificationItem> {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newItem: NotificationItem = {
      ...notif,
      type: notif.type || notif.category || 'system',
      id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      isRead: false,
      timestamp: new Date().toISOString(),
    };
    all.unshift(newItem);
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    return newItem;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const item = all.find((n) => n.id === notificationId);
    if (item) {
      item.isRead = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  },

  async markAllAsRead(farmerId: string): Promise<void> {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    all.forEach((n) => {
      if (n.farmerId === farmerId) n.isRead = true;
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
  },
};

// ----------------------------------------------------
// Support Service
// ----------------------------------------------------
export const supportService = {
  async submitTicket(ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>): Promise<SupportTicket> {
    await new Promise((res) => setTimeout(res, 350));
    const all = getStored<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, []);
    const newTicket: SupportTicket = {
      ...ticket,
      id: 'TCK-' + Math.floor(100000 + Math.random() * 900000),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    all.unshift(newTicket);
    setStored(STORAGE_KEYS.SUPPORT_TICKETS, all);
    return newTicket;
  },
};
