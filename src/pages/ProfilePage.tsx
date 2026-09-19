import React, { useState, useMemo } from 'react';
import { UserProfile, FarmerDocument } from '../types';
import { authService } from '../services/api';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import {
  getAllIndianStates,
  getDistrictsByState,
} from '../data/indiaLocations';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Wheat,
  CreditCard,
  ShieldCheck,
  Check,
  AlertCircle,
  FileText,
  Pencil,
  CheckCircle2,
  Calendar,
  Zap,
  Download,
  Share2,
  MoreHorizontal,
  ChevronRight,
  Upload,
  Globe,
  Bell,
  MessageSquare,
  X,
  Building,
  QrCode,
  Printer,
  Sparkles,
  Tractor,
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUpdateUser,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'personal' | 'farm' | 'bank' | 'documents' | 'preferences'
  >('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewDoc, setPreviewDoc] = useState<FarmerDocument | null>(null);

  const allStates = useMemo(() => getAllIndianStates(), []);

  // Form Fields State
  const [fullName, setFullName] = useState(currentUser?.fullName || 'Raju Marisetti');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobileNumber || '9885177289');
  const [alternateNumber, setAlternateNumber] = useState(
    currentUser?.alternateNumber || '+91 9000000000'
  );
  const [email, setEmail] = useState(currentUser?.email || 'adi@gmail.com');
  const [dateOfBirth, setDateOfBirth] = useState(
    currentUser?.dateOfBirth || '15 Jan 1998'
  );
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  const [villageStreet, setVillageStreet] = useState(
    currentUser?.address?.villageStreet || 'Village Rampur, GT Road'
  );
  const [state, setState] = useState(currentUser?.address?.state || 'Andhra Pradesh');
  const [district, setDistrict] = useState(
    currentUser?.address?.district || 'Visakhapatnam'
  );
  const [pincode, setPincode] = useState(currentUser?.address?.pincode || '530001');

  // Farm Details State
  const [landSizeAcres, setLandSizeAcres] = useState<number>(
    currentUser?.farmDetails?.landSizeAcres || 5
  );
  const [landOwnership, setLandOwnership] = useState(
    currentUser?.farmDetails?.landOwnership || 'Owner (Pattadar)'
  );
  const [surveyNumber, setSurveyNumber] = useState(
    currentUser?.farmDetails?.surveyNumber || 'KH-884/21'
  );
  const [primaryCrops, setPrimaryCrops] = useState<string[]>(
    currentUser?.farmDetails?.primaryCrops || ['Wheat', 'Paddy', 'Soybean']
  );
  const [soilType, setSoilType] = useState(
    currentUser?.farmDetails?.soilType || 'Alluvial Black Soil'
  );
  const [irrigationType, setIrrigationType] = useState(
    currentUser?.farmDetails?.irrigationType || 'Canal & Borewell'
  );

  // Bank Details State
  const [bankName, setBankName] = useState(
    currentUser?.bankDetails?.bankName || 'State Bank of India'
  );
  const [accountNumber, setAccountNumber] = useState(
    currentUser?.bankDetails?.accountNumberFull || '3899201048821'
  );
  const [ifscCode, setIfscCode] = useState(
    currentUser?.bankDetails?.ifscCode || 'SBIN0002100'
  );
  const [upiId, setUpiId] = useState(currentUser?.bankDetails?.upiId || 'farmer@upi');

  // Preferences State
  const [smsAlerts, setSmsAlerts] = useState(
    currentUser?.preferences?.smsAlerts ?? true
  );
  const [whatsappAlerts, setWhatsappAlerts] = useState(
    currentUser?.preferences?.whatsappAlerts ?? true
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    currentUser?.preferences?.preferredLanguage || 'English'
  );
  const [autoSlotConfirmation, setAutoSlotConfirmation] = useState(
    currentUser?.preferences?.autoSlotConfirmation ?? true
  );

  // Documents List
  const [documents, setDocuments] = useState<FarmerDocument[]>(() => {
    return (
      currentUser?.documents || [
        {
          id: 'doc-001',
          title: 'National Farmer ID / Aadhaar Card',
          type: 'Identity Proof',
          documentNumber: currentUser?.farmerIdNumber || 'XXXX-XXXX-3518',
          status: 'Verified',
          uploadDate: '30 Aug 2026',
        },
        {
          id: 'doc-002',
          title: 'Agricultural Land Title Record (Khatauni)',
          type: 'Land Ownership',
          documentNumber: currentUser?.farmDetails?.surveyNumber || 'KH-884/21',
          status: 'Verified',
          uploadDate: '30 Aug 2026',
        },
        {
          id: 'doc-003',
          title: 'Bank DBT Linked Passbook / PFMS Mandate',
          type: 'Bank & DBT',
          documentNumber:
            currentUser?.bankDetails?.accountNumberMasked || 'XXXX-XXXX-8821',
          status: 'Verified',
          uploadDate: '30 Aug 2026',
        },
        {
          id: 'doc-004',
          title: 'PM Kisan Samman Nidhi Registration Certificate',
          type: 'Government Scheme',
          documentNumber: 'PMK-2026-99218',
          status: 'Verified',
          uploadDate: '30 Aug 2026',
        },
      ]
    );
  });

  const availableDistricts = useMemo(() => {
    return getDistrictsByState(state);
  }, [state]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const newDistricts = getDistrictsByState(newState);
    setDistrict(newDistricts.length > 0 ? newDistricts[0] : '');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'RM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (!currentUser) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4 max-w-md mx-auto shadow-sm my-12">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <User className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-['Public_Sans']">
          Not Logged In
        </h3>
        <p className="text-xs text-slate-500">
          Please log in or register your farmer account to view and manage your profile.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer transition-colors shadow-xs"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleOpenEdit = (_fieldKey?: string) => {
    setIsEditModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('Personal Details: Please enter a valid full name (minimum 3 characters).');
      setSaving(false);
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg('Contact Details: Please enter a valid 10-digit mobile number.');
      setSaving(false);
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Contact Details: Please enter a valid email address.');
      setSaving(false);
      return;
    }

    try {
      const updated = await authService.updateProfile(currentUser.id, {
        fullName: fullName.trim(),
        mobileNumber: cleanMobile,
        alternateNumber: alternateNumber.trim() || undefined,
        email: email.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || '15 Jan 1998',
        gender: gender || 'Male',
        accountStatus: 'Active',
        verificationStatus: {
          aadhaarVerified: true,
          mobileVerified: true,
          emailVerified: !!email.trim(),
          bankVerified: true,
        },
        address: {
          villageStreet: villageStreet.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim() || undefined,
        },
        farmDetails: {
          ...currentUser.farmDetails,
          landSizeAcres: Number(landSizeAcres) || 5,
          landOwnership,
          surveyNumber: surveyNumber.trim(),
          primaryCrops,
          soilType,
          irrigationType,
        },
        bankDetails: {
          ...currentUser.bankDetails,
          bankName,
          accountNumberFull: accountNumber,
          accountNumberMasked: accountNumber
            ? `XXXX-XXXX-${accountNumber.slice(-4)}`
            : 'XXXX-XXXX-8821',
          ifscCode: ifscCode.toUpperCase(),
          upiId: upiId.trim() || undefined,
          dbtLinked: true,
        },
        documents,
        preferences: {
          smsAlerts,
          whatsappAlerts,
          preferredLanguage,
          autoSlotConfirmation,
        },
      });

      onUpdateUser(updated);
      setIsEditModalOpen(false);
      setSuccessMsg('Farmer profile details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewDocument = () => {
    const newDoc: FarmerDocument = {
      id: `doc-${Date.now()}`,
      title: 'State Krishi Mandi Procurement Pass',
      type: 'Procurement License',
      documentNumber: `MP-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Verified',
      uploadDate: '30 Aug 2026',
    };
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    authService.updateProfile(currentUser.id, { documents: updatedDocs }).then((u) => {
      onUpdateUser(u);
      setSuccessMsg('New document uploaded and verified successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    });
  };

  const farmerIdFormatted =
    currentUser.farmerIdNumber || 'FRM-AN-2025-3518';
  const memberSinceDate = '30 Aug 2026';

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-6xl mx-auto pb-12">
      {/* Top Banner with Hero Landscape & Glass Badge */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#E6F4EA] via-[#EDF7EE] to-[#E3F2E6] border border-emerald-100/80 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Title & Subtitle */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Public_Sans'] tracking-tight">
                Farmer Profile
              </h1>
              <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse hidden sm:block" />
            </div>
            {/* Green horizontal underline bar */}
            <div className="w-12 h-1 bg-emerald-600 rounded-full" />
            <p className="text-xs sm:text-sm text-slate-600 max-w-md pt-1 leading-relaxed">
              Manage your verified farmer identity, farm details, and DBT bank credentials.
            </p>
          </div>

          {/* Right Hero Agricultural Banner Card with Glassmorphism Badge */}
          <div className="lg:col-span-6 relative h-40 sm:h-48 rounded-2xl overflow-hidden shadow-md border border-emerald-200/60 bg-gradient-to-tr from-emerald-900 via-emerald-800 to-amber-700">
            {/* Background Agricultural Visual */}
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
              alt="Lush Agricultural Crop Fields at Sunrise"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-90 mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

            {/* Floating Glassmorphism Badge */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/80 shadow-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                  <span>Verified Farmer</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Member since <span className="font-semibold text-slate-700">{memberSinceDate}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Farmer Header Card (White Card with Avatar, ID, Statuses, and Edit Button) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Name/ID */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100/80 text-emerald-800 border-3 border-emerald-500/80 flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-xs">
                {getInitials(currentUser.fullName)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-slate-900 font-['Public_Sans']">
                {currentUser.fullName || 'Raju Marisetti'}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50/80 border border-emerald-200 text-xs font-mono font-bold text-emerald-800">
                <span>FARMER ID</span>
                <span>•</span>
                <span>{farmerIdFormatted}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Columns (Member Since, Account Status, Verification) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            {/* Member Since */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium leading-none">Member since</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{memberSinceDate}</p>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium leading-none">Account Status</p>
                <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-1">Active</p>
              </div>
            </div>

            {/* Verification */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium leading-none">Verification</p>
                <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-1">Completed</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 lg:pt-0 justify-end">
            <button
              type="button"
              onClick={() => handleOpenEdit()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0F291B] hover:bg-[#184E33] rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                aria-label="More options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-30 p-1.5 text-xs animate-in fade-in-50 slide-in-from-top-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsIdCardModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 font-medium text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    Download Farmer ID Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setActiveTab('documents');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 font-medium text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Manage Documents
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onNavigate('help');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 font-medium text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Farmer Support Desk
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="border-b border-slate-200">
        <div className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'personal', label: t('profile.personal_info', 'Personal Information') },
            { id: 'farm', label: t('profile.farm_details', 'Farm Information') },
            { id: 'bank', label: t('profile.bank_details', 'Bank Details (DBT)') },
            { id: 'documents', label: t('profile.documents', 'Documents') },
            { id: 'preferences', label: t('profile.preferences', 'Preferences') },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm font-semibold whitespace-nowrap relative transition-colors cursor-pointer ${
                  isActive
                    ? 'text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PERSONAL INFORMATION (Faithful to uploaded design) */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8-cols): Personal Info Card + Address Card */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Information Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Public_Sans']">
                  Personal Information
                </h3>
              </div>

              {/* 2-Column Editable Fields Grid with Pencil Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Full Name */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between group hover:border-emerald-300 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-400 font-medium">Full Name</p>
                    <p className="text-sm font-bold text-slate-900">{fullName || 'Raju Marisetti'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('fullName')}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    aria-label="Edit Full Name"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. Mobile Number */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between group hover:border-emerald-300 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-400 font-medium">Mobile Number</p>
                    <p className="text-sm font-bold text-slate-900">{mobileNumber || '9885177289'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('mobileNumber')}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    aria-label="Edit Mobile Number"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3. Email Address */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between group hover:border-emerald-300 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-400 font-medium">Email Address</p>
                    <p className="text-sm font-bold text-slate-900">{email || 'adi@gmail.com'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('email')}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    aria-label="Edit Email Address"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4. Alternate Number */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between group hover:border-emerald-300 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-400 font-medium">Alternate Number</p>
                    <p className="text-sm font-bold text-slate-900">{alternateNumber || '+91 9000000000'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('alternateNumber')}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    aria-label="Edit Alternate Number"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 5. Date of Birth */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between group hover:border-emerald-300 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-400 font-medium">Date of Birth</p>
                    <p className="text-sm font-bold text-slate-900">{dateOfBirth || '15 Jan 1998'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('dateOfBirth')}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    aria-label="Edit Date of Birth"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 6. Gender */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between group hover:border-emerald-300 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-400 font-medium">Gender</p>
                    <p className="text-sm font-bold text-slate-900">{gender || 'Male'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('gender')}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    aria-label="Edit Gender"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Farm & Residential Address Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-['Public_Sans']">
                    Farm & Residential Address
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEdit('address')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-0.5 sm:col-span-2">
                  <p className="text-[11px] text-slate-400 font-medium">Village / Street / Town</p>
                  <p className="text-sm font-bold text-slate-900">{villageStreet || 'Village Rampur, GT Road'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-0.5">
                  <p className="text-[11px] text-slate-400 font-medium">District</p>
                  <p className="text-sm font-bold text-slate-900">{district || 'Visakhapatnam'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-0.5">
                  <p className="text-[11px] text-slate-400 font-medium">State / UT</p>
                  <p className="text-sm font-bold text-slate-900">{state || 'Andhra Pradesh'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-0.5">
                  <p className="text-[11px] text-slate-400 font-medium">Postal Pincode</p>
                  <p className="text-sm font-mono font-bold text-slate-900">{pincode || '530001'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-0.5">
                  <p className="text-[11px] text-slate-400 font-medium">Assigned Agriculture Zone</p>
                  <p className="text-sm font-bold text-emerald-800">Zone-A (Coastal AP Region)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4-cols): Verification Status + Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Verification Status Card */}
            <div className="bg-[#EBF7F0] rounded-2xl border border-emerald-200 p-6 sm:p-7 shadow-xs relative overflow-hidden space-y-6">
              {/* Decorative background leaf illustration watermark */}
              <div className="absolute -bottom-6 -right-6 text-emerald-600/10 pointer-events-none">
                <Wheat className="w-36 h-36" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Verification Status
                </h4>
              </div>

              {/* Big circular checkmark badge banner */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-600 flex items-center justify-center text-emerald-700 bg-white shadow-xs shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900">Your profile is verified</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All your details have been verified and approved.
                  </p>
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Aadhaar Verified</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Mobile Verified</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Email Verified</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Bank Details Verified</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900 font-['Public_Sans']">
                  Quick Actions
                </h4>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('farm')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 hover:border-emerald-300 transition-all text-xs font-semibold text-slate-800 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Tractor className="w-4 h-4 text-emerald-600" />
                    <span>Update Farm Details</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bank')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 hover:border-emerald-300 transition-all text-xs font-semibold text-slate-800 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Manage DBT Bank Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 hover:border-emerald-300 transition-all text-xs font-semibold text-slate-800 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Upload & View Documents</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsIdCardModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 hover:border-emerald-300 transition-all text-xs font-semibold text-slate-800 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Farmer ID Card</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FARM INFORMATION */}
      {activeTab === 'farm' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Public_Sans'] flex items-center gap-2">
                <Wheat className="w-5 h-5 text-emerald-600" />
                <span>Agricultural Farm & Land Holdings</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Verified records linked with National Land Registry & Department of Agriculture.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenEdit('farm')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Farm Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Cultivated Land Size</span>
              <p className="text-lg font-bold text-slate-900">{landSizeAcres} Acres</p>
              <span className="text-[10px] text-emerald-700 font-semibold">Registered & Verified</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Land Ownership Status</span>
              <p className="text-sm font-bold text-slate-900">{landOwnership}</p>
              <span className="text-[10px] text-slate-500">Khatauni Record 7/12 Attached</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Survey / Dag / Khata No.</span>
              <p className="text-sm font-mono font-bold text-slate-900">{surveyNumber}</p>
              <span className="text-[10px] text-emerald-700 font-semibold">Geo-tagged Land Parcel</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1 sm:col-span-2">
              <span className="text-[11px] text-slate-400 font-medium">Primary Cultivated Crops</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {primaryCrops.map((crop) => (
                  <span
                    key={crop}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                  >
                    {crop}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Soil & Irrigation Type</span>
              <p className="text-xs font-bold text-slate-800">{soilType}</p>
              <p className="text-xs text-slate-500">{irrigationType}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BANK DETAILS (DBT) */}
      {activeTab === 'bank' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Public_Sans'] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Direct Benefit Transfer (DBT) Bank Account</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Linked for automatic MSP settlements directly from FCI / State Procurement agencies.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              PFMS Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Bank Name</span>
              <p className="text-sm font-bold text-slate-900">{bankName}</p>
              <p className="text-[10px] text-emerald-700 font-semibold">Active Savings Account</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Account Number</span>
              <p className="text-sm font-mono font-bold text-slate-900">
                {currentUser.bankDetails?.accountNumberMasked || 'XXXX-XXXX-8821'}
              </p>
              <p className="text-[10px] text-slate-400">Aadhaar Seeded & Active</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">IFSC Code</span>
              <p className="text-sm font-mono font-bold text-slate-900">{ifscCode}</p>
              <p className="text-[10px] text-slate-400">Main District Branch</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1 sm:col-span-2">
              <span className="text-[11px] text-slate-400 font-medium">UPI ID for Quick Payout Alerts</span>
              <p className="text-sm font-mono font-semibold text-slate-900">{upiId}</p>
              <p className="text-[10px] text-emerald-700">Instant payout notification enabled</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-950">Next MSP Settlement</p>
                <p className="text-[10px] text-emerald-800">Auto-credited within 48h of weighment</p>
              </div>
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Public_Sans'] flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Uploaded Documents & Certificates</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Official documents submitted for farmer registration and APMC verification.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddNewDocument}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Document</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{doc.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doc.type} • Reference: <span className="font-mono">{doc.documentNumber || 'N/A'}</span> • Uploaded on {doc.uploadDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    {doc.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                  >
                    View Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-['Public_Sans'] flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>Language & Notification Preferences</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Customize alerts for slot booking confirmations, queue notifications, and MSP price announcements.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            {/* Preferred Language */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Preferred Language</h4>
                <p className="text-xs text-slate-500">
                  Select language for SMS updates and Mandi voice announcements
                </p>
              </div>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.name}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* SMS Alerts */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">SMS Alerts</h4>
                <p className="text-xs text-slate-500">
                  Receive SMS messages for booking confirmations and gate-in passes
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer accent-emerald-600"
              />
            </div>

            {/* WhatsApp Alerts */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">WhatsApp Procurement Updates</h4>
                <p className="text-xs text-slate-500">
                  Live queue numbers, digital receipts, and bank credit advice on WhatsApp
                </p>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Auto-Confirm Slot */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Auto-Confirm Booking Slot</h4>
                <p className="text-xs text-slate-500">
                  Automatically verify booking receipt upon slot availability
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoSlotConfirmation}
                onChange={(e) => setAutoSlotConfirmation(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 font-['Public_Sans'] flex items-center gap-2">
                <Pencil className="w-5 h-5 text-emerald-600" />
                <span>Edit Farmer Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-6">
              {/* Section 1: Personal Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  1. Personal & Contact Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Alternate Number</label>
                    <input
                      type="tel"
                      value={alternateNumber}
                      onChange={(e) => setAlternateNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Date of Birth</label>
                    <input
                      type="text"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      placeholder="15 Jan 1998"
                      className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Address */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  2. Farm & Residential Address
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Village / Street
                    </label>
                    <input
                      type="text"
                      value={villageStreet}
                      onChange={(e) => setVillageStreet(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">State</label>
                    <select
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none cursor-pointer"
                    >
                      {allStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none cursor-pointer"
                    >
                      {availableDistricts.map((dst) => (
                        <option key={dst} value={dst}>
                          {dst}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL FARMER ID CARD MODAL */}
      {isIdCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-['Public_Sans'] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span>National Farmer Identity Card</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsIdCardModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official ID Card Visual */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F291B] to-[#081C15] text-white space-y-5 border border-emerald-500/30 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                    <Wheat className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                      AgriSetu
                    </h4>
                    <p className="text-[9px] text-emerald-100/70">National Procurement ID</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[10px] font-bold border border-emerald-700">
                  Govt. Verified
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-emerald-800/80 border-2 border-emerald-400 flex items-center justify-center font-bold text-xl text-emerald-200 shrink-0">
                  {getInitials(fullName)}
                </div>

                <div className="space-y-1 min-w-0">
                  <h4 className="text-base font-bold text-white truncate font-['Public_Sans']">
                    {fullName}
                  </h4>
                  <p className="text-xs font-mono font-bold text-emerald-300">
                    {farmerIdFormatted}
                  </p>
                  <p className="text-[11px] text-slate-300 truncate">
                    {villageStreet}, {district}, {state}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-800/60 text-[10px]">
                <div>
                  <span className="text-emerald-400/80 block">DOB / Gender</span>
                  <span className="font-bold text-white">{dateOfBirth} • {gender}</span>
                </div>
                <div>
                  <span className="text-emerald-400/80 block">Land Size</span>
                  <span className="font-bold text-white">{landSizeAcres} Acres</span>
                </div>
                <div>
                  <span className="text-emerald-400/80 block">DBT Status</span>
                  <span className="font-bold text-emerald-300">PFMS Linked</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Card</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessMsg('Farmer ID card downloaded to device.');
                  setIsIdCardModalOpen(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Save Digital Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-['Public_Sans']">
                {previewDoc.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <FileText className="w-12 h-12 text-emerald-700 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-900">{previewDoc.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Document ID: {previewDoc.documentNumber || 'VERIFIED-DOC-001'}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  ✓ Digitally Verified by Ministry of Agriculture
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
