import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import {
  LayoutGrid,
  Calendar,
  Layers,
  CreditCard,
  Bell,
  User,
  HelpCircle,
  LogOut,
  Check,
  Sprout,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string, params?: any) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  unreadNotificationsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  currentUser,
  onLogout,
  unreadNotificationsCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutGrid },
    { id: 'my-bookings', label: t('nav.my_bookings', 'My Bookings'), icon: Calendar },
    { id: 'live-queue', label: t('nav.live_queue', 'Live Queue'), icon: Layers },
    { id: 'my-transactions', label: t('nav.transactions', 'My Transactions'), icon: CreditCard },
    {
      id: 'notifications',
      label: t('nav.notifications', 'Notifications'),
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : 2,
    },
    { id: 'profile', label: t('nav.profile', 'Profile'), icon: User },
    { id: 'help', label: t('nav.about', 'Help & Support'), icon: HelpCircle },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'RM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = currentUser?.fullName ? currentUser.fullName : 'Raju Marisetti';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#081C15] text-white border-r border-emerald-950/40 w-64 select-none justify-between p-4">
      {/* Top User Status Card */}
      <div className="space-y-4">
        <div
          onClick={() => handleItemClick('profile')}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-900/30 cursor-pointer transition-colors duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-[#0F472D] text-emerald-300 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
            {getInitials(currentUser?.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-emerald-200/70">{t('dash.welcome_back', 'Welcome back,')}</p>
            <h4 className="text-sm font-bold text-white truncate font-['Public_Sans']">{displayName}</h4>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full bg-emerald-900/80 border border-emerald-600/40 text-[10px] font-semibold text-emerald-300">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              <span>{t('common.verified_farmer', 'Verified Farmer')}</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 pt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveBackground"
                    className="absolute inset-0 bg-[#184E33] rounded-xl shadow-inner z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${
                      isActive ? 'text-emerald-300' : 'text-emerald-300/70'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge ? (
                  <span className="relative z-10 w-5 h-5 flex items-center justify-center text-[11px] font-bold rounded-full bg-emerald-600 text-white shrink-0">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3 pt-4 border-t border-emerald-900/50">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-emerald-200/80 hover:text-rose-300 hover:bg-rose-950/30 transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{t('nav.logout', 'Logout')}</span>
        </button>

        {/* Empowering Farmers Promo Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950 to-[#0B2E1D] border border-emerald-800/40 text-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
            <Sprout className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-white text-[11px] leading-tight">
              {t('sidebar.empower_title', 'Empowering Farmers, Enriching Futures')}
            </p>
            <p className="text-[10px] text-emerald-200/70 mt-1 leading-snug">
              {t('sidebar.empower_desc', 'Digital tools for smarter procurement and better earnings.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col shrink-0 h-[calc(100vh-5rem)] sticky top-20 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={onCloseMobile}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="relative flex flex-col w-64 max-w-xs bg-[#081C15] h-full z-10 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
