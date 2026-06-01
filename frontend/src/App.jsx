import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore.js';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import PageLoader from './components/ui/PageLoader.jsx';
import ServerWakeBanner from './components/ui/ServerWakeBanner.jsx';

// Lazy-loaded pages for code splitting
const LandingPage        = lazy(() => import('./pages/LandingPage.jsx'));
const LoginPage          = lazy(() => import('./pages/auth/LoginPage.jsx'));
const RegisterPage       = lazy(() => import('./pages/auth/RegisterPage.jsx'));
const EventsPage         = lazy(() => import('./pages/events/EventsPage.jsx'));
const EventDetailPage    = lazy(() => import('./pages/events/EventDetailPage.jsx'));
const BookingPage        = lazy(() => import('./pages/events/BookingPage.jsx'));
const BookingSuccessPage = lazy(() => import('./pages/events/BookingSuccessPage.jsx'));

// Attendee
const AttendeeDashboard  = lazy(() => import('./pages/attendee/AttendeeDashboard.jsx'));
const MyTicketsPage      = lazy(() => import('./pages/attendee/MyTicketsPage.jsx'));
const TicketDetailPage   = lazy(() => import('./pages/attendee/TicketDetailPage.jsx'));
const MyEventsPage       = lazy(() => import('./pages/attendee/MyEventsPage.jsx'));
const NetworkingPage     = lazy(() => import('./pages/attendee/NetworkingPage.jsx'));
const ProfilePage        = lazy(() => import('./pages/attendee/ProfilePage.jsx'));
const CertificatesPage   = lazy(() => import('./pages/attendee/CertificatesPage.jsx'));
const SavedEventsPage    = lazy(() => import('./pages/attendee/SavedEventsPage.jsx'));

// Organizer
const OrganizerDashboard = lazy(() => import('./pages/organizer/OrganizerDashboard.jsx'));
const CreateEventPage    = lazy(() => import('./pages/organizer/CreateEventPage.jsx'));
const EditEventPage      = lazy(() => import('./pages/organizer/EditEventPage.jsx'));
const ManageEventsPage   = lazy(() => import('./pages/organizer/ManageEventsPage.jsx'));
const ManageAttendeesPage = lazy(() => import('./pages/organizer/ManageAttendeesPage.jsx'));
const OrganizerAnalytics = lazy(() => import('./pages/organizer/OrganizerAnalytics.jsx'));
const QRScannerPage      = lazy(() => import('./pages/organizer/QRScannerPage.jsx'));

// Admin
const AdminDashboard     = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminUsersPage     = lazy(() => import('./pages/admin/AdminUsersPage.jsx'));
const AdminEventsPage    = lazy(() => import('./pages/admin/AdminEventsPage.jsx'));
const AdminAnalytics     = lazy(() => import('./pages/admin/AdminAnalytics.jsx'));

// Staff
const StaffDashboard     = lazy(() => import('./pages/staff/StaffDashboard.jsx'));

const NotFoundPage       = lazy(() => import('./pages/NotFoundPage.jsx'));

export default function App() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    const handleExpired = () => { useAuthStore.getState().logout(); };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  if (!isInitialized) return <PageLoader />;

  return (
    <BrowserRouter>
      <ServerWakeBanner />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"           element={<LandingPage />} />
            <Route path="/events"     element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/login"      element={<LoginPage />} />
            <Route path="/register"   element={<RegisterPage />} />

            {/* Authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route path="/events/:slug/book" element={<BookingPage />} />
              <Route path="/booking/success/:bookingId" element={<BookingSuccessPage />} />
              <Route path="/profile"       element={<ProfilePage />} />

              {/* Attendee */}
              <Route path="/dashboard"        element={<AttendeeDashboard />} />
              <Route path="/my-tickets"       element={<MyTicketsPage />} />
              <Route path="/my-tickets/:id"   element={<TicketDetailPage />} />
              <Route path="/my-events"        element={<MyEventsPage />} />
              <Route path="/networking"       element={<NetworkingPage />} />
              <Route path="/certificates"     element={<CertificatesPage />} />
              <Route path="/saved-events"     element={<SavedEventsPage />} />

              {/* Organizer */}
              <Route element={<ProtectedRoute roles={['organizer', 'admin']} />}>
                <Route path="/organizer"                    element={<OrganizerDashboard />} />
                <Route path="/organizer/events"             element={<ManageEventsPage />} />
                <Route path="/organizer/events/create"      element={<CreateEventPage />} />
                <Route path="/organizer/events/:id/edit"    element={<EditEventPage />} />
                <Route path="/organizer/events/:id/attendees" element={<ManageAttendeesPage />} />
                <Route path="/organizer/analytics"          element={<OrganizerAnalytics />} />
                <Route path="/organizer/qr-scanner"         element={<QRScannerPage />} />
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/admin"           element={<AdminDashboard />} />
                <Route path="/admin/users"     element={<AdminUsersPage />} />
                <Route path="/admin/events"    element={<AdminEventsPage />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
              </Route>

              {/* Staff */}
              <Route element={<ProtectedRoute roles={['staff', 'admin']} />}>
                <Route path="/staff" element={<StaffDashboard />} />
              </Route>
            </Route>

            <Route path="/404"  element={<NotFoundPage />} />
            <Route path="*"     element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </BrowserRouter>
  );
}
