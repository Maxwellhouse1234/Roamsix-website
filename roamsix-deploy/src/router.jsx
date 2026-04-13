import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProvingGroundsPage from './pages/ProvingGroundsPage';
import ProvingGroundsRegistration from './pages/ProvingGroundsRegistration';
import CoachRegistration from './pages/CoachRegistration';
import AthleteRegistration from './pages/AthleteRegistration';
import RetreatApplication from './pages/RetreatApplication';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/proving-grounds',
    element: <ProvingGroundsPage />
  },
  {
    path: '/proving-grounds/register',
    element: <ProvingGroundsRegistration />
  },
  {
    path: '/proving-grounds/coach-register',
    element: <CoachRegistration />
  },
  {
    path: '/proving-grounds/athlete-register',
    element: <AthleteRegistration />
  },
  {
    path: '/retreat',
    element: <RetreatApplication />
  }
]);
