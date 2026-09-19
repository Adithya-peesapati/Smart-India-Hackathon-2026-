import React, { useState, useMemo } from 'react';
import { authService } from '../services/api';
import { UserProfile } from '../types';
import { Logo } from '../components/Logo';
import {
  getAllIndianStates,
  getDistrictsByState,
} from '../data/indiaLocations';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Wheat,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  BadgeCheck,
  LandPlot,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string, params?: any) => void;
  onRegisterSuccess: (user: UserProfile) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  onRegisterSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const allStates = useMemo(() => getAllIndianStates(), []);

  // Step 1: Personal & Location Details
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternateNumber, setAlternateNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [farmerIdNumber, setFarmerIdNumber] = useState('');
  const [villageStreet, setVillageStreet] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');

  const availableDistricts = useMemo(() => {
    return state ? getDistrictsByState(state) : [];
  }, [state]);

  const handleStateSelect = (newState: string) => {
    setState(newState);
    setDistrict('');
  };

  // Step 2: Farm Details
  const [landSizeAcres, setLandSizeAcres] = useState<number | ''>('');
  const [landOwnership, setLandOwnership] = useState('owner');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [primaryCrops, setPrimaryCrops] = useState<string[]>([]);
  const [soilType, setSoilType] = useState('Alluvial Soil');
  const [irrigationType, setIrrigationType] = useState('Canal / Tube Well');

  // Step 3: Contact & DBT Details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [dbtLinked, setDbtLinked] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const availableCropsList = [
    'Wheat',
    'Paddy',
    'Soybean',
    'Cotton',
    'Mustard',
    'Maize',
    'Pulses (Gram/Arhar)',
    'Groundnut',
    'Sugarcane',
    'Millet (Bajra/Jowar)',
  ];

  const toggleCrop = (crop: string) => {
    if (primaryCrops.includes(crop)) {
      setPrimaryCrops(primaryCrops.filter((c) => c !== crop));
    } else {
      setPrimaryCrops([...primaryCrops, crop]);
    }
  };

  // --- PASSWORD STRENGTH CALCULATION ---
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: 'bg-slate-200', text: 'text-slate-400' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-zA-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600', percent: 25 };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600', percent: 50 };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-600', percent: 75 };
    return { score: 4, label: 'Strong', color: 'bg-emerald-600', text: 'text-emerald-700', percent: 100 };
  }, [password]);

  // --- SECTION VALIDATION ENGINES ---
  const step1Validation = useMemo(() => {
    const errors: Record<string, string> = {};
    const cleanDigits = mobileNumber.replace(/\D/g, '');

    // 1. Full Name
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errors.fullName = 'Full legal name is required';
    } else if (trimmedName.length < 3) {
      errors.fullName = 'Name must be at least 3 characters long';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      errors.fullName = 'Name can only contain letters, spaces, dots, and hyphens';
    }

    // 2. Mobile Number
    if (!mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required';
    } else if (cleanDigits.length !== 10) {
      errors.mobileNumber = `Enter 10-digit mobile number (${cleanDigits.length}/10)`;
    } else if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
      errors.mobileNumber = 'Mobile number must start with 6, 7, 8, or 9';
    }

    // 3. Alternate Number (Optional, but if filled, must be valid & different)
    if (alternateNumber.trim()) {
      const cleanAlt = alternateNumber.replace(/\D/g, '');
      if (cleanAlt.length !== 10 || !/^[6-9]\d{9}$/.test(cleanAlt)) {
        errors.alternateNumber = 'Alternate contact must be a valid 10-digit mobile number';
      } else if (cleanAlt === cleanDigits) {
        errors.alternateNumber = 'Alternate number cannot be identical to primary mobile';
      }
    }

    // 4. Email (Optional, but if entered must be valid format)
    if (email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address (e.g. name@domain.com)';
      }
    }

    // 5. Date of Birth (Required, must be at least 18 years old)
    if (!dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required for KYC';
    } else {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      if (isNaN(dob.getTime())) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      } else {
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (dob > today) {
          errors.dateOfBirth = 'Date of birth cannot be in the future';
        } else if (age < 18) {
          errors.dateOfBirth = `Applicant must be at least 18 years old (Current: ${Math.max(0, age)} yrs)`;
        } else if (age > 115) {
          errors.dateOfBirth = 'Please enter a valid realistic birth year';
        }
      }
    }

    // 6. Gender
    if (!gender) {
      errors.gender = 'Please select a gender';
    }

    // 7. Password
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = `Password must be at least 8 characters (${password.length}/8)`;
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'Password must include both letters and numbers';
    }

    // 8. Confirm Password
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // 9. Aadhaar Number or Farmer ID (Compulsory)
    const cleanId = farmerIdNumber.trim();
    if (!cleanId) {
      errors.farmerIdNumber = 'Aadhaar Number or Farmer ID is compulsory';
    } else {
      const digitsOnly = cleanId.replace(/\s/g, '');
      const is12Aadhaar = /^\d{12}$/.test(digitsOnly);
      const isGovId = /^[A-Z0-9/-]{6,25}$/i.test(cleanId);
      if (!is12Aadhaar && !isGovId) {
        errors.farmerIdNumber = 'Enter a valid 12-digit Aadhaar (e.g. 1234 5678 9012) or Gov Farmer ID (e.g. FRM-PB-2025-8841)';
      }
    }

    // 10. Address
    if (!villageStreet.trim()) {
      errors.villageStreet = 'Village / town or street address is required';
    } else if (villageStreet.trim().length < 3) {
      errors.villageStreet = 'Address must be at least 3 characters long';
    }

    if (!state) errors.state = 'Please select a state';
    if (!district) errors.district = 'Please select a district';

    // 11. PIN Code
    const cleanPin = pincode.replace(/\D/g, '');
    if (!cleanPin) {
      errors.pincode = 'PIN Code is required';
    } else if (cleanPin.length !== 6) {
      errors.pincode = 'PIN Code must be exactly 6 digits';
    }

    const isValid = Object.keys(errors).length === 0;
    return { isValid, errors };
  }, [
    fullName,
    mobileNumber,
    alternateNumber,
    email,
    dateOfBirth,
    gender,
    password,
    confirmPassword,
    farmerIdNumber,
    villageStreet,
    state,
    district,
    pincode,
  ]);

  const step2Validation = useMemo(() => {
    const errors: Record<string, string> = {};

    const landNum = Number(landSizeAcres);
    if (!landSizeAcres || isNaN(landNum) || landNum <= 0) {
      errors.landSizeAcres = 'Enter a valid land size in acres (> 0)';
    } else if (landNum > 1000) {
      errors.landSizeAcres = 'Land size exceeds maximum allowed (1000 acres)';
    }

    if (!surveyNumber.trim()) {
      errors.surveyNumber = 'Survey / Khata / Dag number is required for verification';
    } else if (surveyNumber.trim().length < 2) {
      errors.surveyNumber = 'Survey number must be at least 2 characters';
    }

    if (primaryCrops.length === 0) {
      errors.primaryCrops = 'Select at least one crop cultivated on your land';
    }

    const isValid = Object.keys(errors).length === 0;
    return { isValid, errors };
  }, [landSizeAcres, surveyNumber, primaryCrops]);

  const step3Validation = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!bankName.trim()) {
      errors.bankName = 'Bank name is required';
    } else if (bankName.trim().length < 3) {
      errors.bankName = 'Bank name must be at least 3 characters';
    }

    const cleanAcc = accountNumber.replace(/\D/g, '');
    if (!accountNumber.trim()) {
      errors.accountNumber = 'Bank account number is required';
    } else if (cleanAcc.length < 9 || cleanAcc.length > 18) {
      errors.accountNumber = 'Account number must be between 9 and 18 digits';
    }

    if (!confirmAccountNumber.trim()) {
      errors.confirmAccountNumber = 'Please confirm your account number';
    } else if (confirmAccountNumber !== accountNumber) {
      errors.confirmAccountNumber = 'Account numbers do not match';
    }

    const cleanIfsc = ifscCode.trim().toUpperCase();
    if (!cleanIfsc) {
      errors.ifscCode = 'Bank IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      errors.ifscCode = 'Invalid IFSC format (Expected 4 letters + 0 + 6 alphanumeric e.g. SBIN0001234)';
    }

    if (upiId.trim() && !/^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,49}$/.test(upiId.trim())) {
      errors.upiId = 'Invalid UPI ID format (e.g. farmer@bank or 9876543210@paytm)';
    }

    if (!dbtLinked) {
      errors.dbtLinked = 'DBT Aadhaar-seeding confirmation is required for payouts';
    }

    const isValid = Object.keys(errors).length === 0;
    return { isValid, errors };
  }, [bankName, accountNumber, confirmAccountNumber, ifscCode, upiId, dbtLinked]);

  const handleNext = () => {
    setError('');
    if (step === 1) {
      setTouched((prev) => ({
        ...prev,
        fullName: true,
        mobileNumber: true,
        alternateNumber: true,
        email: true,
        dateOfBirth: true,
        password: true,
        confirmPassword: true,
        farmerIdNumber: true,
        villageStreet: true,
        state: true,
        district: true,
        pincode: true,
      }));

      if (!step1Validation.isValid) {
        const firstErr = Object.values(step1Validation.errors)[0];
        setError(`Please correct the section details: ${firstErr}`);
        return;
      }

      // Check if mobile already exists in registered users
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      const existing = authService.getAllRegisteredUsers().find(
        (u) => (u.mobileNumber || '').replace(/\D/g, '') === cleanMobile
      );
      if (existing) {
        setError(`A farmer profile is already registered with mobile (+91 ${cleanMobile}). Please login instead.`);
        return;
      }

      // Check if email already exists
      if (email.trim()) {
        const existingEmail = authService.getAllRegisteredUsers().find(
          (u) => u.email && u.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (existingEmail) {
          setError(`A farmer profile is already registered with email (${email.trim()}). Please login instead.`);
          return;
        }
      }

      // Check if Aadhaar / Farmer ID already exists in registered users
      const cleanInputId = farmerIdNumber.trim().replace(/\s/g, '').toUpperCase();
      const existingId = authService.getAllRegisteredUsers().find((u) => {
        const uClean = (u.farmerIdNumber || '').trim().replace(/\s/g, '').toUpperCase();
        return uClean && uClean === cleanInputId;
      });
      if (existingId) {
        setError(`A farmer profile is already registered with this Aadhaar / Farmer ID (${farmerIdNumber.trim()}). Please login instead.`);
        return;
      }

      setStep(2);
    } else if (step === 2) {
      setTouched((prev) => ({
        ...prev,
        landSizeAcres: true,
        surveyNumber: true,
        primaryCrops: true,
      }));

      if (!step2Validation.isValid) {
        const firstErr = Object.values(step2Validation.errors)[0];
        setError(`Please complete agricultural details: ${firstErr}`);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setTouched((prev) => ({
        ...prev,
        bankName: true,
        accountNumber: true,
        confirmAccountNumber: true,
        ifscCode: true,
        upiId: true,
        dbtLinked: true,
      }));

      if (!step3Validation.isValid) {
        const firstErr = Object.values(step3Validation.errors)[0];
        setError(`Please correct bank details: ${firstErr}`);
        return;
      }
      setStep(4);
    }
  };

  const handleFinalSubmit = async () => {
    // Check all section validations before final submit
    if (!step1Validation.isValid) {
      setStep(1);
      setError('Please resolve all validation errors in Personal & Location section.');
      return;
    }
    if (!step2Validation.isValid) {
      setStep(2);
      setError('Please resolve all validation errors in Farm & Crops section.');
      return;
    }
    if (!step3Validation.isValid) {
      setStep(3);
      setError('Please resolve all validation errors in Bank & DBT section.');
      return;
    }
    if (!agreeTerms) {
      setError('Please acknowledge the procurement and land verification declaration.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const profileData: Omit<UserProfile, 'id' | 'createdAt'> = {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.replace(/\D/g, ''),
        alternateNumber: alternateNumber.trim() || undefined,
        email: email.trim() || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Jan 1998',
        gender: gender,
        password: password.trim(),
        farmerIdNumber: farmerIdNumber.trim(),
        address: {
          villageStreet: villageStreet.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
        farmDetails: {
          landSizeAcres: Number(landSizeAcres) || 1,
          landOwnership,
          surveyNumber: surveyNumber.trim(),
          primaryCrops,
          soilType,
          irrigationType,
        },
        bankDetails: {
          accountNumberMasked: accountNumber ? `XXXX-XXXX-${accountNumber.slice(-4)}` : 'XXXX-XXXX-8821',
          accountNumberFull: accountNumber,
          ifscCode: ifscCode.toUpperCase() || 'SBIN0001234',
          bankName: bankName || 'State Bank of India',
          upiId: upiId || undefined,
          dbtLinked,
        },
      };

      const res = await authService.register(profileData);
      if (res.success && res.user) {
        onRegisterSuccess(res.user);
        onNavigate('dashboard');
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Personal & Location', valid: step1Validation.isValid },
    { num: 2, label: 'Farm & Crops', valid: step2Validation.isValid },
    { num: 3, label: 'Bank & DBT Details', valid: step3Validation.isValid },
    { num: 4, label: 'Review & Verify', valid: agreeTerms },
  ];

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white dark:bg-[#0C2218] rounded-2xl border border-slate-200 dark:border-emerald-800/70 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors duration-200">
        {/* Left Green Hero Panel */}
        <div className="lg:col-span-4 bg-[#0A2216] dark:bg-[#071910] p-7 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-emerald-900/60">
          <div className="relative z-10 space-y-6">
            <div className="space-y-1">
              <Logo size="md" variant="white" />
              <p className="text-xs text-emerald-400 font-medium pt-1">
                National Farmer Procurement Portal
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <h3 className="text-xl font-bold font-['Public_Sans'] text-white">
                Farmer Verification & Registry
              </h3>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                Ensure all details entered under each section are accurate and strictly compliant to avoid delays during mandi weighbridge and PFMS DBT disbursements.
              </p>
            </div>

            {/* Section Verification Checklist Card */}
            <div className="p-4 rounded-xl bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-emerald-800/40 space-y-3 mt-4">
              <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4" />
                <span>Section Verification Status</span>
              </p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 dark:text-emerald-200/80">1. Personal & Location:</span>
                  {step1Validation.isValid ? (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Apt
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Incomplete
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 dark:text-emerald-200/80">2. Farm & Acreage:</span>
                  {step2Validation.isValid ? (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Apt
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Incomplete
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 dark:text-emerald-200/80">3. Bank & DBT Payouts:</span>
                  {step3Validation.isValid ? (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Apt
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Incomplete
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800/50 text-xs text-emerald-200 mt-6 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Secured with 256-bit encryption & Public Financial Management System (PFMS) verification.
            </p>
          </div>
        </div>

        {/* Right Multi-Step Wizard Panel */}
        <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between bg-white dark:bg-[#0C2218] transition-colors duration-200">
          <div>
            {/* Header & Step Wizard Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                  Farmer Registration
                </h1>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Step {step} of 4
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-100/60 mt-1">
                Verify each section carefully to ensure your national agricultural identity is approved.
              </p>

              {/* Step indicator bar */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-6 pt-2">
                {stepsList.map((s) => {
                  const isCompleted = step > s.num;
                  const isCurrent = step === s.num;

                  return (
                    <div
                      key={s.num}
                      onClick={() => {
                        if (s.num < step) setStep(s.num);
                      }}
                      className={`flex flex-col items-center sm:items-start text-center sm:text-left ${
                        s.num < step ? 'cursor-pointer' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                              : 'bg-slate-100 dark:bg-[#153424] text-slate-500 dark:text-emerald-400/60'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-medium hidden sm:inline truncate max-w-full ${
                          isCurrent
                            ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                            : isCompleted
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-emerald-200/50'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in-50">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Step 1: Personal & Address Details */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-emerald-900/50">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                    Section 1: Personal & Residential Information
                  </h3>
                  {step1Validation.isValid ? (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Section Details Apt
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 dark:text-emerald-300/60">
                      Fill mandatory fields (*)
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                      Full Legal Name *
                    </label>
                    {touched.fullName && step1Validation.errors.fullName ? (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {step1Validation.errors.fullName}
                      </span>
                    ) : fullName.trim().length >= 3 && !step1Validation.errors.fullName ? (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    ) : null}
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onBlur={() => markTouched('fullName')}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rameshwar Singh Patel"
                      className={`w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white transition-all ${
                        touched.fullName && step1Validation.errors.fullName
                          ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                          : fullName.trim().length >= 3
                          ? 'border-emerald-400/80 focus:border-emerald-600'
                          : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                      }`}
                    />
                    {fullName.trim().length >= 3 && !step1Validation.errors.fullName && (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>

                {/* Mobile & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                        Primary Mobile (10-Digit) *
                      </label>
                      {touched.mobileNumber && step1Validation.errors.mobileNumber ? (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {step1Validation.errors.mobileNumber}
                        </span>
                      ) : mobileNumber.replace(/\D/g, '').length === 10 && !step1Validation.errors.mobileNumber ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Valid +91
                        </span>
                      ) : null}
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobileNumber}
                        onBlur={() => markTouched('mobileNumber')}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className={`w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white transition-all font-mono ${
                          touched.mobileNumber && step1Validation.errors.mobileNumber
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                            : mobileNumber.replace(/\D/g, '').length === 10 && !step1Validation.errors.mobileNumber
                            ? 'border-emerald-400/80 focus:border-emerald-600'
                            : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                        }`}
                      />
                      {mobileNumber.replace(/\D/g, '').length === 10 && !step1Validation.errors.mobileNumber && (
                        <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                        Email Address (Optional)
                      </label>
                      {touched.email && step1Validation.errors.email ? (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {step1Validation.errors.email}
                        </span>
                      ) : email.trim() && !step1Validation.errors.email ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      ) : null}
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onBlur={() => markTouched('email')}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="farmer@kisan.in"
                        className={`w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white transition-all ${
                          touched.email && step1Validation.errors.email
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                            : email.trim() && !step1Validation.errors.email
                            ? 'border-emerald-400/80 focus:border-emerald-600'
                            : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                        }`}
                      />
                      {email.trim() && !step1Validation.errors.email && (
                        <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Alternate Number, DOB & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                        Alternate Mobile (Optional)
                      </label>
                      {touched.alternateNumber && step1Validation.errors.alternateNumber && (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          Invalid
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={alternateNumber}
                        onBlur={() => markTouched('alternateNumber')}
                        onChange={(e) => setAlternateNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="9000000000"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white font-mono ${
                          touched.alternateNumber && step1Validation.errors.alternateNumber
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                        }`}
                      />
                    </div>
                    {touched.alternateNumber && step1Validation.errors.alternateNumber && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                        {step1Validation.errors.alternateNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                        Date of Birth (Min 18 Yrs) *
                      </label>
                      {touched.dateOfBirth && step1Validation.errors.dateOfBirth ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          Age &ge; 18 Req
                        </span>
                      ) : dateOfBirth && !step1Validation.errors.dateOfBirth ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Verified
                        </span>
                      ) : null}
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={dateOfBirth}
                        max={new Date().toISOString().split('T')[0]}
                        onBlur={() => markTouched('dateOfBirth')}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className={`w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white ${
                          touched.dateOfBirth && step1Validation.errors.dateOfBirth
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                        }`}
                      />
                    </div>
                    {touched.dateOfBirth && step1Validation.errors.dateOfBirth && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                        {step1Validation.errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                      Gender *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border border-slate-200 dark:border-emerald-800 focus:border-emerald-600 rounded-lg outline-none text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Password & Confirm Password with Strength Meter */}
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-[#10241B] border border-slate-200 dark:border-emerald-800/60">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                          Account Password (Min 8 Chars) *
                        </label>
                        {touched.password && step1Validation.errors.password ? (
                          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                            {step1Validation.errors.password}
                          </span>
                        ) : password && !step1Validation.errors.password ? (
                          <span className={`text-[11px] font-bold ${passwordStrength.text}`}>
                            {passwordStrength.label}
                          </span>
                        ) : null}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onBlur={() => markTouched('password')}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 8 chars, letters & numbers"
                          className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white transition-all ${
                            touched.password && step1Validation.errors.password
                              ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                              : password.length >= 8 && !step1Validation.errors.password
                              ? 'border-emerald-400/80 focus:border-emerald-600'
                              : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                          Confirm Password *
                        </label>
                        {touched.confirmPassword && step1Validation.errors.confirmPassword ? (
                          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                            {step1Validation.errors.confirmPassword}
                          </span>
                        ) : confirmPassword && confirmPassword === password ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Match
                          </span>
                        ) : null}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onBlur={() => markTouched('confirmPassword')}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white transition-all ${
                            touched.confirmPassword && step1Validation.errors.confirmPassword
                              ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                              : confirmPassword && confirmPassword === password
                              ? 'border-emerald-400/80 focus:border-emerald-600'
                              : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter Bar */}
                  {password && (
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-emerald-300/70">Password Strength:</span>
                        <span className={`font-bold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.percent}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-emerald-300/60 pt-0.5">
                        <span className={password.length >= 8 ? 'text-emerald-600 font-bold' : ''}>
                          ✓ 8+ Characters
                        </span>
                        <span className={/[a-zA-Z]/.test(password) ? 'text-emerald-600 font-bold' : ''}>
                          ✓ Letter
                        </span>
                        <span className={/[0-9]/.test(password) ? 'text-emerald-600 font-bold' : ''}>
                          ✓ Number
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Farmer ID / Aadhaar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                      Aadhaar Number or Farmer ID *
                    </label>
                    {touched.farmerIdNumber && step1Validation.errors.farmerIdNumber ? (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {step1Validation.errors.farmerIdNumber}
                      </span>
                    ) : farmerIdNumber.trim() && !step1Validation.errors.farmerIdNumber ? (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {/^\d{12}$/.test(farmerIdNumber.trim().replace(/\s/g, ''))
                          ? '12-Digit Aadhaar UID Verified'
                          : 'Gov Farmer ID Verified'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Compulsory for procurement
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={farmerIdNumber}
                      onBlur={() => markTouched('farmerIdNumber')}
                      onChange={(e) => setFarmerIdNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 12-Digit Aadhaar (9876 5432 1098) or FRM-PB-2025-8841"
                      className={`w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white font-mono transition-all ${
                        touched.farmerIdNumber && step1Validation.errors.farmerIdNumber
                          ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                          : farmerIdNumber.trim() && !step1Validation.errors.farmerIdNumber
                          ? 'border-emerald-400/80 focus:border-emerald-600'
                          : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                      }`}
                    />
                    {farmerIdNumber.trim() && !step1Validation.errors.farmerIdNumber && (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>

                {/* Primary Address Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#10241B] border border-slate-200 dark:border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Farm & Residence Location</span>
                    </div>
                    {villageStreet && district && state && pincode.length === 6 && (
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Location Complete
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-emerald-100">
                        Village / Town / Street Details *
                      </label>
                      {touched.villageStreet && step1Validation.errors.villageStreet && (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          {step1Validation.errors.villageStreet}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={villageStreet}
                      onBlur={() => markTouched('villageStreet')}
                      onChange={(e) => setVillageStreet(e.target.value)}
                      placeholder="e.g. Village Badowal, GT Road"
                      className={`w-full px-3 py-2 text-sm bg-white dark:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white ${
                        touched.villageStreet && step1Validation.errors.villageStreet
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-emerald-100">
                          State / UT *
                        </label>
                        {touched.state && step1Validation.errors.state && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                            Required
                          </span>
                        )}
                      </div>
                      <select
                        required
                        value={state}
                        onBlur={() => markTouched('state')}
                        onChange={(e) => handleStateSelect(e.target.value)}
                        className={`w-full px-3 py-2 text-sm bg-white dark:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white cursor-pointer ${
                          touched.state && step1Validation.errors.state
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                            : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                        }`}
                      >
                        <option value="">-- Select State / UT --</option>
                        {allStates.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-emerald-100 flex items-center gap-1">
                          <span>District *</span>
                          {availableDistricts.length > 0 && (
                            <span className="text-[10px] text-slate-400 dark:text-emerald-300/60 font-normal">
                              ({availableDistricts.length})
                            </span>
                          )}
                        </label>
                        {touched.district && step1Validation.errors.district && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                            Required
                          </span>
                        )}
                      </div>
                      <select
                        required
                        disabled={!state}
                        value={district}
                        onBlur={() => markTouched('district')}
                        onChange={(e) => setDistrict(e.target.value)}
                        className={`w-full px-3 py-2 text-sm bg-white dark:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                          touched.district && step1Validation.errors.district
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                            : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                        }`}
                      >
                        <option value="">{state ? '-- Select District --' : '-- Select State First --'}</option>
                        {availableDistricts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-emerald-100">
                          PIN Code (6-Digits) *
                        </label>
                        {touched.pincode && step1Validation.errors.pincode && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                            6-Digits
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onBlur={() => markTouched('pincode')}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 500001"
                        className={`w-full px-3 py-2 text-sm bg-white dark:bg-[#153424] border rounded-lg outline-none font-mono text-slate-900 dark:text-white ${
                          touched.pincode && step1Validation.errors.pincode
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                            : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Farm & Crop Details */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-emerald-900/50">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                    Section 2: Agricultural & Land Holdings
                  </h3>
                  {step2Validation.isValid ? (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Section Details Apt
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 dark:text-emerald-300/60">
                      Verify land & crop entries
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                        Land Size (in Acres) *
                      </label>
                      {touched.landSizeAcres && step2Validation.errors.landSizeAcres ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          {step2Validation.errors.landSizeAcres}
                        </span>
                      ) : landSizeAcres && !step2Validation.errors.landSizeAcres ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Valid
                        </span>
                      ) : null}
                    </div>
                    <input
                      type="number"
                      min={0.1}
                      max={1000}
                      step={0.1}
                      value={landSizeAcres}
                      onBlur={() => markTouched('landSizeAcres')}
                      onChange={(e) => setLandSizeAcres(e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white font-semibold ${
                        touched.landSizeAcres && step2Validation.errors.landSizeAcres
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                      }`}
                      placeholder="e.g. 5.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                      Land Ownership Type *
                    </label>
                    <select
                      value={landOwnership}
                      onChange={(e) => setLandOwnership(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border border-slate-200 dark:border-emerald-800 focus:border-emerald-600 rounded-lg outline-none text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="owner">Direct Land Owner</option>
                      <option value="tenant">Tenant Cultivator</option>
                      <option value="sharecropper">Sharecropper (Bataidar)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                        Survey / Khata No. *
                      </label>
                      {touched.surveyNumber && step2Validation.errors.surveyNumber ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          {step2Validation.errors.surveyNumber}
                        </span>
                      ) : surveyNumber.trim() && !step2Validation.errors.surveyNumber ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Valid
                        </span>
                      ) : null}
                    </div>
                    <input
                      type="text"
                      required
                      value={surveyNumber}
                      onBlur={() => markTouched('surveyNumber')}
                      onChange={(e) => setSurveyNumber(e.target.value)}
                      placeholder="e.g. KH-884/21"
                      className={`w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white ${
                        touched.surveyNumber && step2Validation.errors.surveyNumber
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                      Primary Crops Cultivated * (Select all that apply)
                    </label>
                    {primaryCrops.length > 0 ? (
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        {primaryCrops.length} selected
                      </span>
                    ) : touched.primaryCrops ? (
                      <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                        Select at least 1 crop
                      </span>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableCropsList.map((crop) => {
                      const isSelected = primaryCrops.includes(crop);
                      return (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => toggleCrop(crop)}
                          className={`p-2.5 text-xs rounded-lg border font-medium text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-[#153424] text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-600 ring-1 ring-emerald-500/20'
                              : 'bg-white dark:bg-[#10241B] text-slate-700 dark:text-emerald-100 border-slate-200 dark:border-emerald-800 hover:bg-slate-50 dark:hover:bg-[#153424]'
                          }`}
                        >
                          <span className="truncate">{crop}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                      Soil Characterization
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border border-slate-200 dark:border-emerald-800 focus:border-emerald-600 rounded-lg outline-none text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Alluvial Soil">Alluvial Soil</option>
                      <option value="Black Cotton Soil">Black Cotton Soil</option>
                      <option value="Red & Yellow Soil">Red & Yellow Soil</option>
                      <option value="Loamy Soil">Loamy Soil</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                      Irrigation Source
                    </label>
                    <select
                      value={irrigationType}
                      onChange={(e) => setIrrigationType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border border-slate-200 dark:border-emerald-800 focus:border-emerald-600 rounded-lg outline-none text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Canal / Tube Well">Canal / Tube Well</option>
                      <option value="Drip Irrigation">Drip Irrigation</option>
                      <option value="Sprinkler System">Sprinkler System</option>
                      <option value="Rainfed (Monsoon)">Rainfed (Monsoon)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: DBT & Bank Information */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-emerald-900/50">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                    Section 3: Bank & Direct Benefit Transfer (DBT)
                  </h3>
                  {step3Validation.isValid ? (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Section Details Apt
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 dark:text-emerald-300/60">
                      Mandatory bank verification
                    </span>
                  )}
                </div>

                <div className="p-3.5 bg-emerald-50 dark:bg-[#10241B] border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">PFMS Automated Direct Benefit Transfer</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                      Government MSP procurement settlements will be routed straight to this verified account without intermediary cuts.
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                      Bank Name *
                    </label>
                    {touched.bankName && step3Validation.errors.bankName ? (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                        {step3Validation.errors.bankName}
                      </span>
                    ) : bankName.trim().length >= 3 && !step3Validation.errors.bankName ? (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    ) : null}
                  </div>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onBlur={() => markTouched('bankName')}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India"
                    className={`w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white ${
                      touched.bankName && step3Validation.errors.bankName
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                        Account Number *
                      </label>
                      {touched.accountNumber && step3Validation.errors.accountNumber ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          {step3Validation.errors.accountNumber}
                        </span>
                      ) : accountNumber.replace(/\D/g, '').length >= 9 && !step3Validation.errors.accountNumber ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Valid Digits
                        </span>
                      ) : null}
                    </div>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onBlur={() => markTouched('accountNumber')}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 9-18 digit account number"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none font-mono text-slate-900 dark:text-white ${
                          touched.accountNumber && step3Validation.errors.accountNumber
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                            : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                        Confirm Account Number *
                      </label>
                      {touched.confirmAccountNumber && step3Validation.errors.confirmAccountNumber ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          {step3Validation.errors.confirmAccountNumber}
                        </span>
                      ) : confirmAccountNumber && confirmAccountNumber === accountNumber ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Matched
                        </span>
                      ) : null}
                    </div>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={confirmAccountNumber}
                        onBlur={() => markTouched('confirmAccountNumber')}
                        onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Re-enter bank account number"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none font-mono text-slate-900 dark:text-white ${
                          touched.confirmAccountNumber && step3Validation.errors.confirmAccountNumber
                            ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                            : confirmAccountNumber && confirmAccountNumber === accountNumber
                            ? 'border-emerald-400/80 focus:border-emerald-600'
                            : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                        Bank IFSC Code (11-Digits) *
                      </label>
                      {touched.ifscCode && step3Validation.errors.ifscCode ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          {step3Validation.errors.ifscCode}
                        </span>
                      ) : ifscCode.length === 11 && !step3Validation.errors.ifscCode ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Valid IFSC
                        </span>
                      ) : null}
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={ifscCode}
                      onBlur={() => markTouched('ifscCode')}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SBIN0001509"
                      className={`w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none uppercase font-mono text-slate-900 dark:text-white ${
                        touched.ifscCode && step3Validation.errors.ifscCode
                          ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                          : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-100">
                        UPI ID / VPA (Optional)
                      </label>
                      {touched.upiId && step3Validation.errors.upiId ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          {step3Validation.errors.upiId}
                        </span>
                      ) : upiId.trim() && !step3Validation.errors.upiId ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Valid UPI
                        </span>
                      ) : null}
                    </div>
                    <input
                      type="text"
                      value={upiId}
                      onBlur={() => markTouched('upiId')}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. farmer@sbi"
                      className={`w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-[#122A1F] focus:bg-white dark:focus:bg-[#153424] border rounded-lg outline-none text-slate-900 dark:text-white ${
                        touched.upiId && step3Validation.errors.upiId
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 dark:border-emerald-800 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={dbtLinked}
                      onChange={(e) => setDbtLinked(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 border-slate-300 mt-0.5"
                    />
                    <span className="text-xs text-slate-800 dark:text-emerald-100 font-medium">
                      I confirm this bank account is seeded with my Aadhaar for direct DBT MSP disbursement. *
                    </span>
                  </label>
                  {touched.dbtLinked && step3Validation.errors.dbtLinked && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 pl-6">
                      {step3Validation.errors.dbtLinked}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Summary & Confirmation */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#10241B] border border-slate-200 dark:border-emerald-800/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-['Public_Sans']">
                      Complete Profile Verification Review
                    </h4>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All 3 Sections Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-emerald-300/60">Full Legal Name:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">{fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-emerald-300/60">Registered Mobile:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">+91 {mobileNumber.replace(/\D/g, '')}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-emerald-300/60">Date of Birth & Gender:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {dateOfBirth} • {gender}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-emerald-300/60">Aadhaar / Farmer ID:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {farmerIdNumber}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 dark:text-emerald-300/60">Location:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {villageStreet}, {district}, {state} {pincode ? `(${pincode})` : ''}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-emerald-300/60">Land & Holdings:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {landSizeAcres} Acres ({landOwnership}) • Survey #{surveyNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-emerald-300/60">Soil & Irrigation:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {soilType} • {irrigationType}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 dark:text-emerald-300/60">Registered Crops:</span>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">{primaryCrops.join(', ')}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-emerald-900/60">
                      <span className="text-slate-400 dark:text-emerald-300/60">Bank & DBT Account:</span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {bankName} • Acc: XXXX-XXXX-{accountNumber.slice(-4)} • IFSC: {ifscCode.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 border-slate-300 mt-0.5"
                  />
                  <span className="text-xs text-slate-600 dark:text-emerald-200/80 leading-relaxed">
                    I solemnly declare that all agricultural, location, and banking details entered across all sections are accurate, verified, and correspond to my actual agricultural holdings for government MSP procurement under AgriSetu.
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-emerald-900/50 mt-6">
            <button
              type="button"
              onClick={() => {
                if (step > 1) setStep(step - 1);
                else onNavigate('login');
              }}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-emerald-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-emerald-800 rounded-lg hover:bg-slate-50 dark:hover:bg-[#153424] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{step === 1 ? 'Back to Login' : 'Previous Section'}</span>
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading || !agreeTerms || !step1Validation.isValid || !step2Validation.isValid || !step3Validation.isValid}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit & Register Profile</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
