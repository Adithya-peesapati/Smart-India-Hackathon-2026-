import React, { useState, useMemo } from 'react';
import { authService } from '../services/api';
import { UserProfile } from '../types';
import { Logo } from '../components/Logo';
import {
  ArrowRight,
  Lock,
  Phone,
  AlertCircle,
  CheckCircle2,
  UserX,
  UserCheck,
  UserPlus,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string, params?: any) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [mobileOrEmail, setMobileOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [validationWarning, setValidationWarning] = useState('');

  // Validate format of mobile, email, Aadhaar, or Farmer ID
  const inputValidation = useMemo(() => {
    const trimmed = mobileOrEmail.trim();
    if (!trimmed) return { isValid: false, type: 'empty', message: '' };

    const digitsOnly = trimmed.replace(/\D/g, '');
    const isPhoneLike = /^[0-9+\s()-]+$/.test(trimmed);

    // 12-digit Aadhaar check
    if (digitsOnly.length === 12 && isPhoneLike) {
      return { isValid: true, type: 'aadhaar', message: 'Valid 12-digit Aadhaar UID' };
    }

    if (isPhoneLike) {
      if (digitsOnly.length === 10) {
        if (/^[6-9]\d{9}$/.test(digitsOnly)) {
          return { isValid: true, type: 'mobile', message: 'Valid 10-digit Indian Mobile (+91)' };
        } else {
          return {
            isValid: false,
            type: 'mobile',
            message: 'Mobile number should start with 6, 7, 8, or 9',
          };
        }
      } else if (digitsOnly.length < 10) {
        return {
          isValid: false,
          type: 'mobile',
          message: `Enter complete 10-digit mobile (${digitsOnly.length}/10) or 12-digit Aadhaar`,
        };
      } else if (digitsOnly.length !== 12) {
        return {
          isValid: false,
          type: 'mobile',
          message: 'Mobile must be 10 digits or Aadhaar must be 12 digits',
        };
      }
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(trimmed)) {
      return { isValid: true, type: 'email', message: 'Valid email address format' };
    }

    // Gov Farmer ID check (e.g. FRM-PB-2025-1234 or alphanumeric)
    if (/^[A-Z0-9/-]{6,25}$/i.test(trimmed)) {
      return { isValid: true, type: 'farmerId', message: 'Valid Gov Farmer ID format' };
    }

    return {
      isValid: false,
      type: 'invalid',
      message: 'Please enter valid Mobile, Email, Aadhaar, or Farmer ID',
    };
  }, [mobileOrEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setProfileNotFound(false);
    setValidationWarning('');

    const cleanInput = mobileOrEmail.trim();
    if (!cleanInput) {
      setErrorMessage('Please enter your registered mobile number or email address.');
      return;
    }

    if (!inputValidation.isValid) {
      setErrorMessage(inputValidation.message || 'Please enter a valid 10-digit mobile or email.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Please enter your valid password (minimum 6 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(cleanInput, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onNavigate('dashboard');
      } else {
        if (res.notFound) {
          setProfileNotFound(true);
        }
        setErrorMessage(res.error || 'User does not exist or invalid credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Green Agricultural Hero Panel */}
        <div className="lg:col-span-5 bg-[#0F291B] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 space-y-6">
            <div className="inline-block">
              <Logo size="md" variant="white" />
            </div>

            <div className="pt-4 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug font-['Public_Sans']">
                Smart Procurement.
                <span className="block text-emerald-400">Zero Wait Time.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Log in to manage your MSP procurement slots, monitor live mandi gate queues, and track direct DBT bank disbursements.
              </p>
            </div>

            {/* Farmer Registry Notice */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Farmer Registry Verification</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Access is restricted to pre-registered farmer accounts. If you are registering for the first time, complete your profile with land holdings and bank details.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-300">New farmer?</span>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="font-semibold text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
                >
                  Create New Account →
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/10 mt-6">
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>National Agricultural Mandi Queue & Slot Portal</span>
            </p>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Public_Sans']">
                Farmer Login
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Sign in with your registered 10-digit mobile number or email
              </p>
            </div>

            {/* User Not Exists / Profile Not Found Alert */}
            {profileNotFound && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3 animate-in fade-in-50">
                <div className="flex items-start gap-2.5">
                  <UserX className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm">User Does Not Exist</h4>
                    <p className="mt-1 text-amber-800 leading-relaxed">
                      No registered farmer account was found for <strong>{mobileOrEmail}</strong>. Only previously registered farmers can log in.
                    </p>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-amber-200/70 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register New Farmer Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileNotFound(false);
                      setErrorMessage('');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100/70 rounded-lg transition-colors cursor-pointer"
                  >
                    Re-enter Details
                  </button>
                </div>
              </div>
            )}

            {/* General Error Alert (e.g. incorrect password) */}
            {errorMessage && !profileNotFound && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mobile / Email Input Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mobile / Aadhaar / Farmer ID / Email *
                  </label>
                  {mobileOrEmail.trim() && (
                    <span
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        inputValidation.isValid ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {inputValidation.isValid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {inputValidation.type === 'mobile'
                              ? 'Valid Phone (+91)'
                              : inputValidation.type === 'aadhaar'
                              ? 'Valid 12-Digit Aadhaar'
                              : inputValidation.type === 'farmerId'
                              ? 'Valid Farmer ID'
                              : 'Valid Email'}
                          </span>
                        </>
                      ) : (
                        <span>{inputValidation.message}</span>
                      )}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={mobileOrEmail}
                    onChange={(e) => {
                      setMobileOrEmail(e.target.value);
                      if (profileNotFound) setProfileNotFound(false);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Mobile, 12-digit Aadhaar, Farmer ID, or Email"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  {password && password.length < 6 && (
                    <span className="text-[11px] text-amber-600 font-medium">
                      Min 6 characters ({password.length}/6)
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter your registered password"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg outline-none transition-all placeholder:text-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 border-slate-300"
                  />
                  <span className="text-xs text-slate-600 font-medium">Remember credentials</span>
                </label>

                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Verify & Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Don't have a registered account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Register New Farmer Profile
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

