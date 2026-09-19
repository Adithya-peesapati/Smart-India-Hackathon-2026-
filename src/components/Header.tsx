import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, NotificationItem } from '../types';
import { Search, Bell, CheckCheck, Menu, ArrowRight, ChevronDown } from 'lucide-react';
import { notificationService } from '../services/api';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentUser: UserProfile | null;
  onNavigate: (page: string, params?: any) => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onNavigate,
  onToggleMobileSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
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

  // Click outside to close notification popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length || 2;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('centres', { query: searchQuery.trim() });
    }
  };

  const handleMarkAllRead = async () => {
    if (currentUser) {
      await notificationService.markAllAsRead(currentUser.id);
      fetchNotifs();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'RM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = currentUser?.fullName ? currentUser.fullName : 'Raju Marisetti';

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#091C13] border-b border-slate-200/80 dark:border-emerald-900/60 px-4 sm:px-6 py-2.5 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-lg text-slate-600 dark:text-emerald-200 hover:bg-slate-100 dark:hover:bg-[#143224] cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-xl relative hidden sm:block"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search_placeholder', 'Search centres, bookings, crops...')}
              className="w-full pl-4 pr-10 py-2 text-sm bg-slate-50/80 dark:bg-[#07130E] hover:bg-slate-100/80 dark:hover:bg-[#0C1E15] focus:bg-white dark:focus:bg-[#0E2419] border border-slate-200 dark:border-emerald-900 focus:border-emerald-600 dark:focus:border-emerald-400 rounded-full outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-emerald-400/50 text-slate-800 dark:text-white shadow-2xs"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer"
              aria-label={t('common.search', 'Search')}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Right Tools (Language Selector, Dark Mode Theme Toggle, Notifications, Profile) */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme Mode Toggle */}
          <ThemeToggle />

          {/* Notifications Trigger with badge */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-emerald-200 hover:text-emerald-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#143224] border border-slate-200 dark:border-emerald-800/80 transition-colors cursor-pointer"
              aria-label={t('common.notifications', 'View notifications')}
            >
              <Bell className="w-4 h-4 text-slate-700 dark:text-emerald-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#091C13]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0B1E16] rounded-2xl border border-slate-200 dark:border-emerald-800 shadow-2xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2">
                <div className="p-3.5 border-b border-slate-200 dark:border-emerald-900/60 flex items-center justify-between bg-slate-50 dark:bg-[#07130E]">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{t('common.notifications', 'Notifications')}</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
                        {t('common.new_count', '{count} new', { count: unreadCount })}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      {t('common.mark_all_read', 'Mark all read')}
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-emerald-900/40">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      {t('common.no_notifications', 'No notifications yet')}
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
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                          <span className="text-[10px] text-slate-400">
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
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {t('common.view_all_notifications', 'View All Notifications')} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill Avatar Dropdown */}
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#0E2419] hover:bg-slate-50 dark:hover:bg-[#143224] text-xs font-medium text-slate-800 dark:text-emerald-100 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              {getInitials(currentUser?.fullName)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{displayName}</p>
              <p className="text-[10px] text-slate-500 dark:text-emerald-400/80 leading-none">{t('common.farmer', 'Farmer')}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
