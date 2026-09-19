import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { UserProfile } from './types';
import { authService, notificationService } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Menu } from 'lucide-react';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { SignOutConfirmationModal } from './components/SignOutConfirmationModal';
import { CancelBookingConfirmationModal } from './components/CancelBookingConfirmationModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CentresDiscoveryPage } from './pages/CentresDiscoveryPage';
import { CentreDetailPage } from './pages/CentreDetailPage';
import { SlotBookingPage } from './pages/SlotBookingPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { LiveQueuePage } from './pages/LiveQueuePage';
import { MyTransactionsPage } from './pages/MyTransactionsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HelpPage } from './pages/HelpPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [activePage, setActivePage] = useState<string>(() => {
    const user = authService.getCurrentUser();
    return user ? 'dashboard' : 'home';
  });
  const [pageParams, setPageParams] = useState<any>({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // Initialize current user on mount and redirect if logged in
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user && (activePage === 'home' || activePage === 'how-it-works')) {
      setActivePage('dashboard');
    }
  }, []);

  // Update notifications count
  const updateNotifCount = async () => {
    if (currentUser) {
      const list = await notificationService.getFarmerNotifications(currentUser.id);
      setUnreadNotifsCount(list.filter((n) => !n.isRead).length);
    } else {
      setUnreadNotifsCount(0);
    }
  };

  useEffect(() => {
    updateNotifCount();
    const handleUpdate = () => updateNotifCount();
    window.addEventListener('farmlink_storage_update', handleUpdate);
    return () => window.removeEventListener('farmlink_storage_update', handleUpdate);
  }, [currentUser]);

  // Unsaved booking session state & confirmation dialog
  const [bookingHasUnsavedProgress, setBookingHasUnsavedProgress] = useState(false);
  const [showCancelBookingModal, setShowCancelBookingModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ page: string; params?: any } | null>(null);

  const handleNavigate = (page: string, params: any = {}) => {
    // If farmer has an active unfinished booking and takes any action to leave/cancel,
    // intercept and show confirmation dialog with Continue Booking & Yes, Cancel
    if (
      activePage === 'book-slot' &&
      bookingHasUnsavedProgress &&
      page !== 'book-slot' &&
      page !== 'booking-confirmation'
    ) {
      setPendingNavigation({ page, params });
      setShowCancelBookingModal(true);
      return;
    }

    executeNavigation(page, params);
  };

  const executeNavigation = (page: string, params: any = {}) => {
    // If user is logged in, prevent navigating to Home / Landing view
    if ((page === 'home' || page === 'how-it-works') && currentUser) {
      setActivePage('dashboard');
      setPageParams({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page === 'how-it-works') {
      setActivePage(currentUser ? 'dashboard' : 'home');
      setPageParams({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (activePage === 'book-slot' && page !== 'book-slot') {
      setBookingHasUnsavedProgress(false);
    }
    setActivePage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueBooking = () => {
    // Primary safe action: dismisses modal and keeps farmer on the booking page
    setShowCancelBookingModal(false);
    setPendingNavigation(null);
  };

  const handleConfirmCancelBooking = () => {
    // Secondary/destructive action: clears progress and navigates to the target/previous page
    setShowCancelBookingModal(false);
    setBookingHasUnsavedProgress(false);

    const target = pendingNavigation || {
      page: pageParams?.centreId ? 'centre-details' : currentUser ? 'dashboard' : 'centres',
      params: pageParams?.centreId ? { centreId: pageParams.centreId } : {},
    };
    setPendingNavigation(null);

    if (target.page === '__sign_out__') {
      setIsSignOutModalOpen(true);
      return;
    }

    executeNavigation(target.page, target.params);
  };

  const handleRequestSignOut = () => {
    if (activePage === 'book-slot' && bookingHasUnsavedProgress) {
      setPendingNavigation({ page: '__sign_out__', params: {} });
      setShowCancelBookingModal(true);
      return;
    }
    setIsSignOutModalOpen(true);
  };

  const handleConfirmSignOut = async () => {
    setIsSignOutModalOpen(false);
    await authService.logout();
    setCurrentUser(null);
    setActivePage('home');
  };

  const handleCancelSignOut = () => {
    setIsSignOutModalOpen(false);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  const handleRegisterSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  // Determine if the current view should be displayed within the Dashboard Layout (with persistent Sidebar & Dashboard Header)
  const isDashboardLayout = [
    'dashboard',
    'my-bookings',
    'live-queue',
    'my-transactions',
    'notifications',
    'profile',
  ].includes(activePage);

  return (
    <div className="min-h-screen bg-[#F3F5F2] dark:bg-[#07130E] text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleRequestSignOut}
      />

      {/* Main Layout Area */}
      {isDashboardLayout ? (
        <div className="flex-1 flex w-full min-h-[calc(100vh-5rem)]">
          {/* Dashboard Sidebar */}
          <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onLogout={handleRequestSignOut}
            unreadNotificationsCount={unreadNotifsCount}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Dashboard Content Container */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F3F5F2] dark:bg-[#07130E] transition-colors duration-200">
            {/* Mobile Header Toggle */}
            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#091C13] border-b border-slate-200/80 dark:border-emerald-900/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0D6832] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                aria-label="Open navigation sidebar"
              >
                <Menu className="w-4 h-4" />
                <span>Dashboard Menu</span>
              </button>
              <span className="text-xs font-semibold text-slate-600 dark:text-emerald-300/80 capitalize">
                {activePage.replace('-', ' ')}
              </span>
            </div>

            <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full max-w-[1920px] mx-auto">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activePage}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                  className="w-full"
                >
                  {activePage === 'dashboard' && (
                    <DashboardPage
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                    />
                  )}
                  {activePage === 'my-bookings' && (
                    <MyBookingsPage
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                    />
                  )}
                  {activePage === 'live-queue' && (
                    <LiveQueuePage
                      currentUser={currentUser}
                      bookingId={pageParams?.bookingId}
                      onNavigate={handleNavigate}
                    />
                  )}
                  {activePage === 'my-transactions' && (
                    <MyTransactionsPage
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                    />
                  )}
                  {activePage === 'notifications' && (
                    <NotificationsPage
                      currentUser={currentUser}
                      onNavigate={handleNavigate}
                    />
                  )}
                  {activePage === 'profile' && (
                    <ProfilePage
                      currentUser={currentUser}
                      onUpdateUser={(u) => setCurrentUser(u)}
                      onNavigate={handleNavigate}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      ) : activePage === 'home' && !currentUser ? (
        /* Full-screen Edge-to-Edge Landing Page */
        <main className="flex-1 w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
              className="w-full"
            >
              <LandingPage onNavigate={handleNavigate} />
            </motion.div>
          </AnimatePresence>
        </main>
      ) : (
        /* Standalone View Layout (Auth, Discovery, Booking, Support) */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
              className="w-full"
            >
              {activePage === 'login' && (
                <LoginPage
                  onNavigate={handleNavigate}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}
              {activePage === 'forgot-password' && (
                <LoginPage
                  onNavigate={handleNavigate}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}
              {activePage === 'register' && (
                <RegisterPage
                  onNavigate={handleNavigate}
                  onRegisterSuccess={handleRegisterSuccess}
                />
              )}
              {activePage === 'centres' && (
                <CentresDiscoveryPage
                  onNavigate={handleNavigate}
                  initialQuery={pageParams?.query || ''}
                />
              )}
              {activePage === 'centre-details' && (
                <CentreDetailPage
                  centreId={pageParams?.centreId || 'centre-north-01'}
                  onNavigate={handleNavigate}
                />
              )}
              {activePage === 'book-slot' && (
                <SlotBookingPage
                  currentUser={currentUser}
                  initialCentreId={pageParams?.centreId}
                  onNavigate={handleNavigate}
                  onProgressChange={setBookingHasUnsavedProgress}
                />
              )}
              {activePage === 'booking-confirmation' && (
                <BookingConfirmationPage
                  bookingId={pageParams?.bookingId || ''}
                  onNavigate={handleNavigate}
                />
              )}
              {activePage === 'help' && <HelpPage />}
              {activePage === 'about' && <AboutPage onNavigate={handleNavigate} />}
              {activePage === 'contact' && <ContactPage />}
              {activePage === 'privacy-policy' && <PrivacyPolicyPage />}
              {activePage === 'terms-of-service' && <TermsPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} currentUser={currentUser} />

      {/* Sign-Out Confirmation Modal */}
      <SignOutConfirmationModal
        isOpen={isSignOutModalOpen}
        onCancel={handleCancelSignOut}
        onConfirm={handleConfirmSignOut}
      />

      {/* Slot Booking Cancellation Confirmation Modal */}
      <CancelBookingConfirmationModal
        isOpen={showCancelBookingModal}
        onContinueBooking={handleContinueBooking}
        onConfirmCancel={handleConfirmCancelBooking}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
