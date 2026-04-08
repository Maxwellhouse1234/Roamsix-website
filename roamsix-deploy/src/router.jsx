import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProvingGroundsPage from './pages/ProvingGroundsPage';
import ProvingGroundsRegistration from './pages/ProvingGroundsRegistration';
import RetreatApplication from './pages/RetreatApplication';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/proving-grounds" element={<ProvingGroundsPage />} />
        <Route path="/proving-grounds/register" element={<ProvingGroundsRegistration />} />
        <Route path="/retreat" element={<RetreatApplication />} />
      </Routes>
    </Router>
  );
}
