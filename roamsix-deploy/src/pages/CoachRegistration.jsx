import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CoachRegistration() {
  const [formData, setFormData] = useState({
    coachName: '',
    coachEmail: '',
    coachPhone: '',
    coachShirtSize: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [currentPrice, setCurrentPrice] = useState(300);
  const [submitted, setSubmitted] = useState(false);
  const [teamCode, setTeamCode] = useState('');

  useEffect(() => {
    const eventDate = new Date('2026-06-01');
    const today = new Date();
    const daysUntilEvent = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24));
    const weeksUntilEvent = Math.floor(daysUntilEvent / 7);

    if (weeksUntilEvent >= 4) setCurrentPrice(300);
    else if (weeksUntilEvent === 3) setCurrentPrice(350);
    else if (weeksUntilEvent === 2) setCurrentPrice(400);
    else if (weeksUntilEvent === 1) setCurrentPrice(450);
    else setCurrentPrice(500);
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateTeamCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `ROAM-${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const generatedTeamCode = generateTeamCode();

    try {
      const response = await fetch('/api/coach-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teamCode: generatedTeamCode,
          pricePaid: currentPrice
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTeamCode(data.teamCode);
        setSubmitted(true);
      } else {
        alert('There was an error submitting your registration. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error submitting your registration. Please try again.');
    }
  };

  const shirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-6xl md:text-7xl font-light tracking-wider text-gray-200 mb-8">
            Registration Complete
          </h1>

          <div className="h-px w-48 bg-gray-400 opacity-30 mx-auto mb-12" />

          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            Your team has been registered and your spot is reserved pending payment.
          </p>

          <div className="bg-gray-900 border border-gray-700 p-8 mb-8">
            <p className="text-base text-gray-300 mb-6">
              Your Team Code:
            </p>
            <p className="text-5xl font-light text-gray-100 tracking-wider mb-6">
              {teamCode}
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Share this code with your 3 athletes so they can complete their individual registration.
            </p>

            <div className="border-t border-gray-800 pt-6 mb-6">
              <p className="text-base text-gray-300 mb-4">
                <strong>Next Step:</strong> Complete payment to confirm your team.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Total Investment: <strong className="text-gray-200 text-lg">${currentPrice}</strong>
              </p>
            </div>

            <a
              href="https://your-payment-link.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gray-200 hover:bg-white text-black py-4 px-10 text-sm tracking-wider uppercase transition-all duration-500"
            >
              Complete Payment
            </a>
          </div>

          <div className="bg-gray-900 border border-gray-700 p-6 mb-8">
            <h3 className="text-lg text-gray-300 mb-3">What Happens Next?</h3>
            <ul className="text-left text-sm text-gray-400 space-y-2">
              <li>1. Complete payment using the link above</li>
              <li>2. Share your team code with your 3 athletes</li>
              <li>3. Athletes register individually using the team code</li>
              <li>4. Your team is confirmed when all 4 registrations are complete</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500">
            Confirmation email sent to {formData.coachEmail}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative min-h-screen px-6 py-12">
        <Link 
          to="/proving-grounds"
          className="absolute top-8 left-8 text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-2 text-sm tracking-wider"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          BACK
        </Link>

        <div className="max-w-3xl mx-auto pt-20">
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-light tracking-wider text-gray-200 mb-4">
              Coach Registration
            </h1>
            <div className="h-px w-32 bg-gray-400 opacity-30 mx-auto mb-6" />
            <p className="text-lg text-gray-400 mb-6">
              Register your team and secure your spot
            </p>
            <div className="bg-gray-900 border border-gray-700 inline-block px-6 py-3">
              <p className="text-gray-300">
                Current Price: <strong className="text-gray-200 text-xl">${currentPrice}</strong> per team
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3">
                Coach Information
              </h2>
              
              <input
                type="text"
                placeholder="YOUR NAME *"
                required
                value={formData.coachName}
                onChange={(e) => handleChange('coachName', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <input
                type="email"
                placeholder="EMAIL *"
                required
                value={formData.coachEmail}
                onChange={(e) => handleChange('coachEmail', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <input
                type="tel"
                placeholder="PHONE *"
                required
                value={formData.coachPhone}
                onChange={(e) => handleChange('coachPhone', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <select
                required
                value={formData.coachShirtSize}
                onChange={(e) => handleChange('coachShirtSize', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide focus:outline-none transition-colors"
              >
                <option value="">T-SHIRT SIZE *</option>
                {shirtSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3">
                Emergency Contact
              </h2>
              
              <input
                type="text"
                placeholder="EMERGENCY CONTACT NAME *"
                required
                value={formData.emergencyContactName}
                onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <input
                type="tel"
                placeholder="EMERGENCY CONTACT PHONE *"
                required
                value={formData.emergencyContactPhone}
                onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />
            </section>

            <section className="bg-gray-900 border border-gray-700 p-6">
              <h3 className="text-lg text-gray-300 mb-3">What Happens Next?</h3>
              <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                <li>You'll receive a unique team code</li>
                <li>Share the code with your 3 athletes</li>
                <li>They'll register individually using your code</li>
                <li>Complete payment to confirm your team</li>
              </ul>
            </section>

            <div className="pt-8 text-center">
              <button
                type="submit"
                className="bg-gray-200 hover:bg-white text-black py-5 px-12 text-sm tracking-wider uppercase transition-all duration-500"
              >
                Register & Get Team Code
              </button>
              <p className="text-xs text-gray-600 mt-4">
                Price: ${currentPrice} per team (increases weekly)
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
