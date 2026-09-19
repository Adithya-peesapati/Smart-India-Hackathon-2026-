import React from 'react';
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  Building2,
  Users,
  MapPin,
  TrendingUp,
  UserPlus,
  Bell,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import farmerHeroImage from '../assets/images/farmer_hero_banner_1788084665779.jpg';
import farmerIllustration from '../assets/images/farmer_illustration_1788084683299.jpg';
import { useLanguage } from '../context/LanguageContext';

interface LandingPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full flex flex-col animate-in fade-in duration-300 overflow-x-hidden">
      {/* 1. Hero Section (Full width & viewport height on desktop) */}
      <section className="w-full min-h-[calc(100vh-5rem)] bg-white dark:bg-[#091C13] border-b border-slate-200/80 dark:border-emerald-900/50 flex items-center transition-colors duration-200 relative overflow-hidden py-10 lg:py-12">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF7EE] dark:bg-emerald-950/80 border border-[#C7E9D2] dark:border-emerald-800 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0D6832] dark:text-emerald-300">
                <span className="text-sm">🌱</span>
                <span>{t('platform.title', 'Public Agricultural Procurement Platform')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Public_Sans'] leading-[1.12]">
                {t('hero.headline', 'Smart Procurement. Less Waiting.')}
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-emerald-100/80 leading-relaxed max-w-xl font-normal">
                {t(
                  'hero.subheadline',
                  'Book your procurement slot, track your live queue, and follow every step from check-in to payment — without crowding the counter.'
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-white bg-[#0D6832] hover:bg-[#0B5428] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>{t('hero.register', 'Register as Farmer')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('centres')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-slate-800 dark:text-emerald-100 bg-white dark:bg-[#0E2419] border border-slate-300 dark:border-emerald-800 hover:bg-slate-50 dark:hover:bg-[#143224] rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#0D6832] dark:text-emerald-400" />
                  <span>{t('hero.find_centres', 'Find a Procurement Centre')}</span>
                </button>
              </div>

              {/* Trust Badge Strip */}
              <div className="pt-3 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-500 dark:text-emerald-300/70 border-t border-slate-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0D6832] dark:text-emerald-400" />
                  <span>Govt-Verified MSP Guaranteed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-[#0D6832] dark:text-emerald-400" />
                  <span>Instant Weighbridge Token Pass</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#0D6832] dark:text-emerald-400" />
                  <span>Direct Bank Transfer (DBT)</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image & Feature Pills */}
            <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-emerald-800/80 bg-emerald-900/10 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/11] xl:aspect-[16/10] max-h-[580px]">
                <img
                  src={farmerHeroImage}
                  alt="Indian farmer in agricultural field with smartphone"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

                {/* Feature Pills (Top Right) */}
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-[#0B1E16]/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/60 dark:border-emerald-700/60 space-y-3 max-w-[220px] hidden sm:block">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-white">
                    <div className="w-6 h-6 rounded-lg bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('hero.easy_booking', 'Easy Slot Booking')}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-white">
                    <div className="w-6 h-6 rounded-lg bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('hero.live_queue', 'Live Queue Tracking')}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-white">
                    <div className="w-6 h-6 rounded-lg bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('hero.transparent_payments', 'Transparent Payments')}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-white">
                    <div className="w-6 h-6 rounded-lg bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('hero.realtime_notifications', 'Real-time Notifications')}</span>
                  </div>
                </div>

                {/* Social Proof (Bottom Right) */}
                <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-[#0B1E16]/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-white/60 dark:border-emerald-700/60 space-y-2 max-w-[250px]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <div className="w-5 h-5 rounded-full bg-[#0D6832] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('hero.trusted_farmers', 'Trusted by Farmers Across India')}</span>
                  </div>

                  <div className="flex items-center -space-x-2 pt-0.5">
                    <img
                      className="w-7 h-7 rounded-full border-2 border-white dark:border-emerald-900 object-cover"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Farmer"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      className="w-7 h-7 rounded-full border-2 border-white dark:border-emerald-900 object-cover"
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                      alt="Farmer"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      className="w-7 h-7 rounded-full border-2 border-white dark:border-emerald-900 object-cover"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                      alt="Farmer"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      className="w-7 h-7 rounded-full border-2 border-white dark:border-emerald-900 object-cover"
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                      alt="Farmer"
                      referrerPolicy="no-referrer"
                    />
                    <div className="w-7 h-7 rounded-full border-2 border-white dark:border-emerald-900 bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center">
                      +50K
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Ribbon (Full-width band) */}
      <section className="w-full bg-[#F8FAF7] dark:bg-[#07130E] border-b border-slate-200/80 dark:border-emerald-900/50 py-12 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 transition-colors duration-200">
        <div className="w-full max-w-[1920px] mx-auto">
          <div className="bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200/80 dark:border-emerald-900/60 shadow-xs p-6 sm:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x-0 lg:divide-x divide-slate-100 dark:divide-emerald-900/60">
              {/* Metric 1 */}
              <div className="flex items-center gap-4 pt-4 sm:pt-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wide">
                    {t('stats.centres', 'Procurement Centres')}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Public_Sans'] leading-tight">
                    250+
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-emerald-400/60">{t('stats.centres_sub', 'Across India')}</p>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex items-center gap-4 pt-4 sm:pt-0 lg:pl-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wide">
                    {t('stats.farmers', 'Farmers Registered')}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Public_Sans'] leading-tight">
                    50K+
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-emerald-400/60">{t('stats.farmers_sub', 'Growing Community')}</p>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex items-center gap-4 pt-4 sm:pt-0 lg:pl-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wide">
                    {t('stats.transactions', 'Transactions Completed')}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Public_Sans'] leading-tight">
                    1.2M+
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-emerald-400/60">{t('stats.transactions_sub', 'Successful Procurements')}</p>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="flex items-center gap-4 pt-4 sm:pt-0 lg:pl-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wide">
                    {t('stats.satisfaction', 'Farmer Satisfaction')}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Public_Sans'] leading-tight">
                    98%
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-emerald-400/60">{t('stats.satisfaction_sub', 'Happy Farmers')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bottom Dual Cards: How It Works & CTA Banner */}
      <section className="w-full bg-[#F3F5F2] dark:bg-[#050E0A] py-12 lg:py-16 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 transition-colors duration-200">
        <div className="w-full max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Card: How It Works */}
          <div className="lg:col-span-7 bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200/80 dark:border-emerald-900/60 shadow-xs p-6 sm:p-10 flex flex-col justify-between transition-colors duration-200">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Public_Sans'] mb-6">
                {t('how_it_works.title', 'How It Works')}
              </h3>

              {/* 4 Connected Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 relative">
                {/* Step 1 */}
                <div className="space-y-2 text-center sm:text-left flex flex-col items-center sm:items-start">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center mb-1">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('step1.title', 'Register')}</h4>
                  <p className="text-xs text-slate-500 dark:text-emerald-200/70 leading-relaxed">
                    {t('step1.desc', 'Create your account in just a few minutes')}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="space-y-2 text-center sm:text-left flex flex-col items-center sm:items-start">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center mb-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('step2.title', 'Find a Centre')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-emerald-200/70 leading-relaxed">
                    {t('step2.desc', 'Search and choose a nearby procurement centre')}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="space-y-2 text-center sm:text-left flex flex-col items-center sm:items-start">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center mb-1">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('step3.title', 'Book a Slot')}</h4>
                  <p className="text-xs text-slate-500 dark:text-emerald-200/70 leading-relaxed">
                    {t('step3.desc', 'Select date and time slot that suits you')}
                  </p>
                </div>

                {/* Step 4 */}
                <div className="space-y-2 text-center sm:text-left flex flex-col items-center sm:items-start">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF7EE] dark:bg-emerald-950 text-[#0D6832] dark:text-emerald-300 flex items-center justify-center mb-1">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('step4.title', 'Track & Get Paid')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-emerald-200/70 leading-relaxed">
                    {t(
                      'step4.desc',
                      'Track your queue in real-time and get paid directly to your bank account'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Skip the waiting. Plan your procurement. */}
          <div className="lg:col-span-5 bg-[#0D6832] dark:bg-[#0B4A24] text-white rounded-2xl p-6 sm:p-10 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shrink-0 shadow-lg border-2 border-white/20 bg-emerald-800">
              <img
                src={farmerIllustration}
                alt="Farmer Illustration"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-3 text-center sm:text-left z-10 flex-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-['Public_Sans'] leading-tight">
                {t('cta.banner_title', 'Skip the waiting. Plan your procurement.')}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                {t(
                  'cta.banner_subtitle',
                  'A smarter way to sell your produce with transparency and convenience.'
                )}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('centres')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-[#0D6832] bg-white hover:bg-emerald-50 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>{t('cta.banner_button', 'Book Your Slot Now')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
