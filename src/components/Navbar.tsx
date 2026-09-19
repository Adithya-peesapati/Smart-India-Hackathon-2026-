import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { UserProfile, NotificationItem } from '../types';
import {
  Menu,
  X,
  LayoutDashboard,
  Home,
  Building2,
  Info,
  PhoneCall,
  UserCircle,
  LogIn,
  UserPlus,
  Bell,
  CheckCheck,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  LogOut,
  User,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext';
import { notificationService } from '../services/api';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string, params?: any) => void;
  currentUser: UserProfile | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, currentUser, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const fetchNotifs = async () => {
    if (currentUser) {
      const list = await notificationService.getFarmerNotifications(currentUser.id);
      setNotifications(list);
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const handleStorage = () => fetchNotifs();
    window.addEventListener('farmlink_storage_update', handleStorage);
    return () => window.removeEventListener('farmlink_storage_update', handleStorage);
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (currentUser) {
      await notificationService.markAllAsRead(currentUser.id);
      fetchNotifs();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'FM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const navLinks = [
    {
      id: currentUser ? 'dashboard' : 'home',
      label: currentUser ? t('nav.dashboard', 'Dashboard') : t('nav.home', 'Home'),
      icon: currentUser ? LayoutDashboard : Home,
    },
    {
      id: 'centres',
      label: t('nav.centres', 'Centres'),
      icon: Building2,
    },
    {
      id: 'about',
      label: t('nav.about', 'About Us'),
      icon: Info,
    },
    {
      id: 'contact',
      label: t('nav.contact', 'Contact'),
      icon: PhoneCall,
    },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#07170F]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-emerald-900/60 shadow-xs transition-colors duration-200 w-full">
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 max-w-[1920px] mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Far Left: AgriSetu Brand Logo */}
          <div className="flex items-center min-w-[180px] shrink-0">
            <div
              onClick={() => handleNavClick(currentUser ? 'dashboard' : 'home')}
              className="cursor-pointer transition-transform duration-200 hover:scale-[1.02] flex items-center"
            >
              <Logo size="md" />
            </div>
          </div>

          {/* Center: Redesigned Navigation Buttons with Icons, Spacing, and Active Indicators */}
          <nav className="hidden lg:flex items-center justify-center gap-2 xl:gap-3 flex-1 px-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                activePage === link.id ||
                (link.id === 'home' && activePage === '') ||
                (link.id === 'dashboard' &&
                  ['dashboard', 'my-bookings', 'live-queue', 'transactions'].includes(activePage));

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'text-[#0D6832] dark:text-emerald-300'
                      : 'text-slate-700 dark:text-emerald-100/80 hover:text-[#0D6832] dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#132D20]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbarActivePill"
                      className="absolute inset-0 bg-[#EAF7EE] dark:bg-[#113322] border border-emerald-300/80 dark:border-emerald-700/80 rounded-xl shadow-2xs z-0"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 relative z-10 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? 'text-[#0D6832] dark:text-emerald-400'
                        : 'text-slate-500 dark:text-emerald-300/70 group-hover:text-[#0D6832] dark:group-hover:text-emerald-300'
                    }`}
                  />
                  <span className="relative z-10 font-bold">{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Far Right: Unified Modern Utility Controls & Actions */}
          <div className="hidden lg:flex items-center justify-end gap-2.5 min-w-[200px] shrink-0">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-2.5 ml-1">
                {/* Notifications Trigger with Badge & Popover */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative flex items-center justify-center h-10 w-10 rounded-xl text-slate-700 dark:text-emerald-200 hover:text-[#0D6832] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#143224] hover:border-emerald-500/40 border border-slate-200/90 dark:border-emerald-800/70 bg-white dark:bg-[#0E2419] transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer"
                    aria-label="View notifications"
                    title="Notifications"
                  >
                    <Bell className="w-4.5 h-4.5 text-slate-700 dark:text-emerald-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#0D6832] dark:bg-emerald-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-[#07170F] animate-pulse shadow-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover Dropdown */}
                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0B1E16] rounded-2xl border border-slate-200 dark:border-emerald-800 shadow-2xl overflow-hidden z-50 origin-top-right"
                      >
                        <div className="p-3.5 border-b border-slate-200 dark:border-emerald-900/60 flex items-center justify-between bg-slate-50 dark:bg-[#07130E]">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllRead}
                              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-emerald-900/40">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400 dark:text-emerald-300/60">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  if (n.link) onNavigate(n.link.replace('/', ''));
                                  setIsNotifOpen(false);
                                }}
                                className={`p-3.5 text-left cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#143224] ${
                                  !n.isRead ? 'bg-emerald-50/50 dark:bg-emerald-950/40' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                                  <span className="text-[10px] text-slate-400 dark:text-emerald-300/60">
                                    {new Date(n.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-emerald-100/70 line-clamp-2">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="p-2.5 border-t border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-[#07130E] text-center">
                          <button
                            type="button"
                            onClick={() => {
                              onNavigate('notifications');
                              setIsNotifOpen(false);
                            }}
                            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            View All Notifications <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Farmer Profile Pill & Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2.5 h-10 pl-2 pr-3.5 rounded-xl border border-slate-200/90 dark:border-emerald-800/70 bg-white dark:bg-[#0E2419] hover:bg-slate-50 dark:hover:bg-[#143224] hover:border-emerald-500/40 text-xs font-semibold text-slate-800 dark:text-emerald-100 transition-all duration-200 shadow-2xs active:scale-95 cursor-pointer"
                    title="View Profile Menu"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#0D6832] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                      {getInitials(currentUser.fullName)}
                    </div>
                    <div className="text-left leading-none">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                        {currentUser.fullName || 'Farmer'}
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 inline" /> Verified
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 dark:text-emerald-400 shrink-0 transition-transform duration-200 ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown Popover */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0B1E16] rounded-2xl border border-slate-200 dark:border-emerald-800 shadow-2xl overflow-hidden z-50 origin-top-right p-1.5 text-xs"
                      >
                        <div className="px-3 py-2.5 border-b border-slate-100 dark:border-emerald-900/60 mb-1">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {currentUser.fullName || 'Farmer'}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-emerald-300/70 font-mono">
                            +91 {currentUser.mobileNumber || ''}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('profile');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#143224] font-semibold text-slate-700 dark:text-emerald-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Farmer Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('my-bookings');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#143224] font-semibold text-slate-700 dark:text-emerald-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>My Bookings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('help');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#143224] font-semibold text-slate-700 dark:text-emerald-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Help & Support</span>
                        </button>

                        {onLogout && (
                          <div className="pt-1 mt-1 border-t border-slate-100 dark:border-emerald-900/60">
                            <button
                              type="button"
                              onClick={() => {
                                setIsProfileMenuOpen(false);
                                onLogout();
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2.5 cursor-pointer transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* Prominent "Register as Farmer" Button */}
                <button
                  type="button"
                  onClick={() => handleNavClick('register')}
                  className="inline-flex items-center gap-2 h-10 px-5 text-sm font-bold text-white bg-[#0D6832] hover:bg-[#0B5428] rounded-xl shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('nav.register', 'Register as Farmer')}</span>
                </button>

                {/* "Login" Button */}
                <button
                  type="button"
                  onClick={() => handleNavClick('login')}
                  className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-bold text-slate-800 dark:text-emerald-100 border border-slate-200/90 dark:border-emerald-800/70 bg-white dark:bg-[#0E2419] hover:bg-slate-50 dark:hover:bg-[#143224] hover:border-emerald-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 text-[#0D6832] dark:text-emerald-400" />
                  <span>{t('nav.login', 'Login')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Toggle Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-xl text-slate-700 dark:text-emerald-200 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-[#143224] border border-slate-200/90 dark:border-emerald-800/70 bg-white dark:bg-[#0E2419] focus:outline-none transition-all active:scale-95 cursor-pointer shadow-2xs"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="lg:hidden border-b border-slate-200 dark:border-emerald-900 bg-white dark:bg-[#07170F] px-4 pt-3 pb-6 space-y-2 shadow-xl overflow-hidden"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                activePage === link.id ||
                (link.id === 'home' && activePage === '') ||
                (link.id === 'dashboard' &&
                  ['dashboard', 'my-bookings', 'live-queue', 'transactions'].includes(activePage));

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-base rounded-xl font-bold cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-[#EAF7EE] dark:bg-emerald-950/80 text-[#0D6832] dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/80 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#143224]'
                  }`}
                >
                  <Icon
                    className={`w-4.5 h-4.5 ${
                      isActive ? 'text-[#0D6832] dark:text-emerald-400' : 'text-slate-400 dark:text-emerald-400/60'
                    }`}
                  />
                  <span>{link.label}</span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-slate-200 dark:border-emerald-900/60 space-y-2">
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick('dashboard')}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[#0D6832] hover:bg-[#0B5428] rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('nav.dashboard', 'Go to Dashboard')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('profile')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-[#122A1F] hover:bg-slate-200 dark:hover:bg-[#143224] rounded-xl cursor-pointer transition-colors"
                  >
                    <UserCircle className="w-4 h-4 text-slate-600 dark:text-emerald-400" />
                    Farmer Profile ({currentUser.fullName || 'Farmer'})
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleNavClick('register')}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[#0D6832] rounded-xl shadow-xs cursor-pointer hover:bg-[#0B5428] transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('nav.register', 'Register as Farmer')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('login')}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-slate-800 dark:text-white border border-slate-300 dark:border-emerald-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#143224] transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('nav.login', 'Login')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


