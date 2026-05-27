import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProvingGroundsPage from './pages/ProvingGroundsPage';
import ProvingGroundsRegistration from './pages/ProvingGroundsRegistration';
import CoachRegistration from './pages/CoachRegistration';
import AthleteRegistration from './pages/AthleteRegistration';
import RetreatApplication from './pages/RetreatApplication';
import SponsorshipDeck from './pages/SponsorshipDeck';
import TeamPage from './pages/TeamPage';
import ApproachPage from './pages/ApproachPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import EventSuccessPage from './pages/EventSuccessPage';
import ExperiencesPage from './pages/ExperiencesPage';

export const router = createBrowserRouter([
  { path: '/',                                 element: <HomePage /> },
  { path: '/experiences',                      element: <ExperiencesPage /> },
  { path: '/proving-grounds',                  element: <ProvingGroundsPage /> },
  { path: '/proving-grounds/register',         element: <ProvingGroundsRegistration /> },
  { path: '/proving-grounds/coach-register',   element: <CoachRegistration /> },
  { path: '/proving-grounds/athlete-register', element: <AthleteRegistration /> },
  { path: '/retreat',                          element: <RetreatApplication /> },
  { path: '/partners',                         element: <SponsorshipDeck /> },
  { path: '/team',                             element: <TeamPage /> },
  { path: '/approach',                         element: <ApproachPage /> },
  { path: '/events',                           element: <EventsPage /> },
  { path: '/events/:eventId',                  element: <EventDetailPage /> },
  { path: '/events/:eventId/success',          element: <EventSuccessPage /> },
]);
