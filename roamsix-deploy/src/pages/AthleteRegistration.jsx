import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function AthleteRegistration() {
  const [formData, setFormData] = useState({
    teamCode: '',
    athleteName: '',
    athleteEmail: '',
    athletePhone: '',
    shirtSize: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    waiverAccepted: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [teamCodeValid, setTeamCodeValid] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateTeamCode = async () => {
    if (!formData.teamCode) return;

    try {
      const response = await fetch(`/api/validate-team-code?code=${formData.teamCode}`);
      const data = await response.json();
      
      if (data.valid) {
        setTeamCodeValid(true);
      } else {
        setTeamCodeValid(false);
        alert('Invalid team code. Please check with your coach and try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error validating team code. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.waiverAccepted) {
      alert('Please accept the waiver to continue.');
      return;
    }

    try {
      const response = await fetch('/api/athlete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.message || 'There was an error submitting your registration. Please try again.');
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
            You've successfully registered for Proving Grounds!
          </p>

          <div className="bg-gray-900 border border-gray-700 p-8 mb-8">
            <p className="text-base text-gray-300 mb-4">
              Team Code: <strong className="text-gray-100 text-xl">{formData.teamCode}</strong>
            </p>
            <p className="text-sm text-gray-400">
              Your team will be confirmed once all 4 members (1 coach + 3 athletes) have registered and payment is complete.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-700 p-6 mb-8">
            <h3 className="text-lg text-gray-300 mb-3">What Happens Next?</h3>
            <ul className="text-left text-sm text-gray-400 space-y-2">
              <li>• You'll receive a confirmation email at {formData.athleteEmail}</li>
              <li>• Your coach will complete payment for the team</li>
              <li>• All team members must register to confirm your spot</li>
              <li>• Event details will be sent once your team is complete</li>
            </ul>
          </div>

          <Link
            to="/proving-grounds"
            className="inline-block bg-gray-200 hover:bg-white text-black py-4 px-10 text-sm tracking-wider uppercase transition-all duration-500"
          >
            Back to Proving Grounds
          </Link>
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
              Athlete Registration
            </h1>
            <div className="h-px w-32 bg-gray-400 opacity-30 mx-auto mb-6" />
            <p className="text-lg text-gray-400">
              Complete your individual registration using your coach's team code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3">
                Team Code
              </h2>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="ENTER TEAM CODE (e.g., ROAM-123456) *"
                  required
                  value={formData.teamCode}
                  onChange={(e) => handleChange('teamCode', e.target.value.toUpperCase())}
                  className="flex-1 bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={validateTeamCode}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-6 py-3 text-sm tracking-wider uppercase transition-colors"
                >
                  Validate
                </button>
              </div>

              {teamCodeValid === true && (
                <p className="text-sm text-green-500">✓ Team code verified</p>
              )}
              {teamCodeValid === false && (
                <p className="text-sm text-red-500">✗ Invalid team code</p>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3">
                Your Information
              </h2>
              
              <input
                type="text"
                placeholder="YOUR NAME *"
                required
                value={formData.athleteName}
                onChange={(e) => handleChange('athleteName', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <input
                type="email"
                placeholder="EMAIL *"
                required
                value={formData.athleteEmail}
                onChange={(e) => handleChange('athleteEmail', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <input
                type="tel"
                placeholder="PHONE *"
                required
                value={formData.athletePhone}
                onChange={(e) => handleChange('athletePhone', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <select
                required
                value={formData.shirtSize}
                onChange={(e) => handleChange('shirtSize', e.target.value)}
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

            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3">
                Waiver & Agreement
              </h2>
              
              <div className="bg-gray-900 border border-gray-700 p-6 max-h-64 overflow-y-auto text-sm text-gray-400 leading-relaxed">
                <h3 className="text-gray-300 font-medium mb-3">LIABILITY WAIVER & RELEASE</h3>
                <p className="mb-3">
                  I acknowledge that participating in Proving Grounds involves inherent risks including physical injury, and I voluntarily assume all such risks. I agree to release, waive, discharge, and hold harmless ROAMSIX, its founders, employees, and affiliates from any and all liability, claims, demands, or causes of action arising out of participation in this event.
                </p>
                <p className="mb-3">
                  I certify that I am physically fit and have no medical conditions that would prevent safe participation. I agree to follow all safety protocols and instructions provided by event staff.
                </p>
                <p>
                  By checking the box below, I acknowledge that I have read, understood, and agree to this waiver.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.waiverAccepted}
                  onChange={(e) => handleChange('waiverAccepted', e.target.checked)}
                  className="mt-1 w-5 h-5"
                />
                <span className="text-gray-300 group-hover:text-gray-200 transition-colors">
                  I accept the liability waiver and release *
                </span>
              </label>
            </section>

            <div className="pt-8 text-center">
              <button
                type="submit"
                className="bg-gray-200 hover:bg-white text-black py-5 px-12 text-sm tracking-wider uppercase transition-all duration-500"
                disabled={teamCodeValid !== true}
              >
                Complete Registration
              </button>
              {teamCodeValid !== true && (
                <p className="text-xs text-gray-600 mt-4">
                  Please validate your team code first
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
