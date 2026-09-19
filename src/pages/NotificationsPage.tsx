import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, NotificationItem } from '../types';
import { notificationService } from '../services/api';
import {
  Bell,
  CheckCheck,
  Calendar,
  Layers,
  CreditCard,
  Info,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';

interface NotificationsPageProps {
  currentUser: UserProfile | null;
  onNavigate: (page: string, params?: any) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await notificationService.getFarmerNotifications(currentUser.id);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const handleUpdate = () => fetchNotifs();
    window.addEventListener('farmlink_storage_update', handleUpdate);
    return () => window.removeEventListener('farmlink_storage_update', handleUpdate);
  }, [currentUser]);

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await notificationService.markAllAsRead(currentUser.id);
    fetchNotifs();
  };

  const handleItemClick = async (notif: NotificationItem) => {
    await notificationService.markAsRead(notif.id);
    if (notif.link) {
      onNavigate(notif.link.replace('/', ''));
    } else {
      fetchNotifs();
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType === 'queue') return n.type === 'queue_update';
    if (filterType === 'payment') return n.type === 'payment';
    if (filterType === 'booking') return n.type === 'booking';
    return true;
  });

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'queue_update':
        return <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'booking':
        return <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/70">
            Real-time procurement alerts, queue status updates, and payment confirmations.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all duration-200 active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'queue', label: 'Queue Alerts' },
          { id: 'payment', label: 'Payments' },
          { id: 'booking', label: 'Bookings' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer ${
              filterType === tab.id
                ? 'bg-[#0D6832] text-white shadow-xs'
                : 'bg-white dark:bg-[#091C13] text-slate-600 dark:text-emerald-100/70 border border-slate-200 dark:border-emerald-900/60 hover:bg-slate-50 dark:hover:bg-[#122A1F]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 dark:text-emerald-400/60 animate-pulse">
          Loading alerts...
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="py-16 px-4 bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200 dark:border-emerald-900/60 text-center flex flex-col items-center justify-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-emerald-950/50 border border-slate-200 dark:border-emerald-800 flex items-center justify-center text-slate-400 dark:text-emerald-400 mb-3">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">No notifications</h3>
          <p className="text-xs text-slate-500 dark:text-emerald-200/70 max-w-xs mt-1">
            You're all caught up! Procurement schedule notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#091C13] rounded-2xl border border-slate-200/80 dark:border-emerald-900/60 shadow-2xs overflow-hidden divide-y divide-slate-100 dark:divide-emerald-900/40">
          <AnimatePresence initial={false}>
            {filteredNotifs.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, delay: idx * 0.03 }}
                onClick={() => handleItemClick(n)}
                className={`p-4 sm:p-5 flex items-start gap-3.5 cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-[#122A1F] ${
                  !n.isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/30' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getIconForType(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate font-['Public_Sans']">
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 dark:text-emerald-300/60 shrink-0 font-medium">
                      {new Date(n.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-emerald-100/70 leading-relaxed">{n.message}</p>
                </div>

                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0 self-center animate-pulse" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
