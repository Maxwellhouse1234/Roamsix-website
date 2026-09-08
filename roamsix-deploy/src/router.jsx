import { createBrowserRouter, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FirstRetreatPage from './pages/FirstRetreatPage';
import HowItWorksPage from './pages/HowItWorksPage';
import OrganizationsPage from './pages/OrganizationsPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import WaiverPage from './pages/WaiverPage';
import MediaReleasePage from './pages/MediaReleasePage';
import EventDetailPage from './pages/EventDetailPage';
import EventSuccessPage from './pages/EventSuccessPage';
import EventIntakePage from './pages/EventIntakePage';
import ProvingGroundsPage from './pages/ProvingGroundsPage';
import ProvingGroundsRegistration from './pages/ProvingGroundsRegistration';
import CoachRegistration from './pages/CoachRegistration';
import AthleteRegistration from './pages/AthleteRegistration';
import RetreatApplication from './pages/RetreatApplication';
import SponsorshipDeck from './pages/SponsorshipDeck';
import FieldworkPage from './pages/FieldworkPage';
import FieldworkQuarterPage from './pages/FieldworkQuarterPage';
import OliveGroveDinnerPage from './pages/OliveGroveDinnerPage';
import ExperiencesPage from './pages/ExperiencesPage';
import EmailPreferencesPage from './pages/EmailPreferencesPage';
import FounderFriendInvitePage from './pages/FounderFriendInvitePage';
import ExperienceFinderPage from './pages/ExperienceFinderPage';
import MembershipPage from './pages/MembershipPage';
import MembershipSuccessPage from './pages/MembershipSuccessPage';
import CollaboratePage from './pages/CollaboratePage';
import MembershipManagePage from './pages/MembershipManagePage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/first-retreat', element: <FirstRetreatPage /> },
  { path: '/first-retreat/interest', element: <Navigate to="/first-retreat#interest" replace /> },
  { path: '/first-retreat/apply', element: <RetreatApplication /> },
  { path: '/first-retreat/confirmation', element: <Navigate to="/first-retreat" replace /> },
  { path: '/how-it-works', element: <HowItWorksPage /> },
  { path: '/organizations', element: <OrganizationsPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/experiences', element: <ExperiencesPage /> },
  { path: '/find-your-experience', element: <ExperienceFinderPage /> },
  { path: '/membership', element: <MembershipPage /> },
  { path: '/membership/success', element: <MembershipSuccessPage /> },
  { path: '/membership/manage', element: <MembershipManagePage /> },
  { path: '/collaborate', element: <CollaboratePage /> },

  { path: '/events', element: <FieldworkPage /> },
  { path: '/events/q1', element: <FieldworkQuarterPage quarterSlug="q1" /> },
  { path: '/events/q2', element: <FieldworkQuarterPage quarterSlug="q2" /> },
  { path: '/events/q3', element: <FieldworkQuarterPage quarterSlug="q3" /> },
  { path: '/events/q4', element: <FieldworkQuarterPage quarterSlug="q4" /> },
  { path: '/dinner', element: <OliveGroveDinnerPage /> },
  { path: '/dinner/invite', element: <FounderFriendInvitePage /> },
  { path: '/events/olive-grove-dinner', element: <OliveGroveDinnerPage /> },
  { path: '/why', element: <Navigate to="/about" replace /> },
  { path: '/corporate', element: <Navigate to="/organizations" replace /> },
  { path: '/priority-access', element: <Navigate to="/first-retreat#interest" replace /> },
  { path: '/approach', element: <Navigate to="/how-it-works" replace /> },

  { path: '/events/:eventId', element: <EventDetailPage /> },
  { path: '/events/:eventId/success', element: <EventSuccessPage /> },
  { path: '/terms', element: <TermsPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/email-preferences', element: <EmailPreferencesPage /> },
  { path: '/waiver', element: <WaiverPage /> },
  { path: '/media-release', element: <MediaReleasePage /> },
  { path: '/event-intake', element: <EventIntakePage /> },

  { path: '/proving-grounds', element: <ProvingGroundsPage /> },
  { path: '/proving-grounds/register', element: <ProvingGroundsRegistration /> },
  { path: '/proving-grounds/coach-register', element: <CoachRegistration /> },
  { path: '/proving-grounds/athlete-register', element: <AthleteRegistration /> },
  { path: '/retreat', element: <RetreatApplication /> },
  { path: '/partners', element: <SponsorshipDeck /> },
]);
