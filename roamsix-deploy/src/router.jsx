import { createBrowserRouter, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import OrganizationsPage from './pages/OrganizationsPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import WaiverPage from './pages/WaiverPage';
import MediaReleasePage from './pages/MediaReleasePage';
import EventIntakePage from './pages/EventIntakePage';
import FieldworkPage from './pages/FieldworkPage';
import FieldworkQuarterPage from './pages/FieldworkQuarterPage';
import ExperiencesPage from './pages/ExperiencesPage';
import EmailPreferencesPage from './pages/EmailPreferencesPage';
import ExperienceFinderPage from './pages/ExperienceFinderPage';
import MembershipPage from './pages/MembershipPage';
import MembershipCheckoutPage from './pages/MembershipCheckoutPage';
import MembershipSuccessPage from './pages/MembershipSuccessPage';
import CollaboratePage from './pages/CollaboratePage';
import MembershipManagePage from './pages/MembershipManagePage';
import MemberLoginPage from './pages/MemberLoginPage';
import MemberDashboardPage from './pages/MemberDashboardPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/first-retreat', element: <Navigate to="/events/q1" replace /> },
  { path: '/first-retreat/interest', element: <Navigate to="/events/q1#interest" replace /> },
  { path: '/first-retreat/apply', element: <Navigate to="/events/q1#interest" replace /> },
  { path: '/first-retreat/confirmation', element: <Navigate to="/events/q1" replace /> },
  { path: '/how-it-works', element: <HowItWorksPage /> },
  { path: '/organizations', element: <OrganizationsPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/experiences', element: <ExperiencesPage /> },
  { path: '/find-your-experience', element: <ExperienceFinderPage /> },
  { path: '/membership', element: <MembershipPage /> },
  { path: '/membership/checkout/:tier', element: <MembershipCheckoutPage /> },
  { path: '/membership/success', element: <MembershipSuccessPage /> },
  { path: '/membership/manage', element: <MembershipManagePage /> },
  { path: '/member/login', element: <MemberLoginPage /> },
  { path: '/member', element: <MemberDashboardPage /> },
  { path: '/collaborate', element: <CollaboratePage /> },

  { path: '/events', element: <FieldworkPage /> },
  { path: '/events/q1', element: <FieldworkQuarterPage quarterSlug="q1" /> },
  { path: '/events/q2', element: <FieldworkQuarterPage quarterSlug="q2" /> },
  { path: '/events/q3', element: <FieldworkQuarterPage quarterSlug="q3" /> },
  { path: '/events/q4', element: <FieldworkQuarterPage quarterSlug="q4" /> },
  { path: '/dinner', element: <Navigate to="/experiences" replace /> },
  { path: '/dinner/invite', element: <Navigate to="/experiences" replace /> },
  { path: '/events/olive-grove-dinner', element: <Navigate to="/experiences" replace /> },
  { path: '/why', element: <Navigate to="/about" replace /> },
  { path: '/corporate', element: <Navigate to="/organizations" replace /> },
  { path: '/priority-access', element: <Navigate to="/first-retreat#interest" replace /> },
  { path: '/approach', element: <Navigate to="/how-it-works" replace /> },

  { path: '/events/:eventId/success', element: <Navigate to="/experiences" replace /> },
  { path: '/events/:eventId', element: <Navigate to="/experiences" replace /> },
  { path: '/terms', element: <TermsPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/email-preferences', element: <EmailPreferencesPage /> },
  { path: '/waiver', element: <WaiverPage /> },
  { path: '/media-release', element: <MediaReleasePage /> },
  { path: '/event-intake', element: <EventIntakePage /> },

  { path: '/proving-grounds', element: <Navigate to="/organizations" replace /> },
  { path: '/proving-grounds/register', element: <Navigate to="/organizations" replace /> },
  { path: '/proving-grounds/coach-register', element: <Navigate to="/organizations" replace /> },
  { path: '/proving-grounds/athlete-register', element: <Navigate to="/organizations" replace /> },
  { path: '/retreat', element: <Navigate to="/events" replace /> },
  { path: '/partners', element: <Navigate to="/collaborate" replace /> },
]);
