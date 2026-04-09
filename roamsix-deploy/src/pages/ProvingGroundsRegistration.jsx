import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ProvingGroundsRegistration() {
  const [formData, setFormData] = useState({
    teamName: '',
    coachName: '',
    coachCertification: '',
    athlete1Name: '',
    athlete2Name: '',
    athlete3Name: '',
    email: '',
    phone: '',
    coachShirtSize: '',
    athlete1ShirtSize: '',
    athlete2ShirtSize: '',
    athlete3ShirtSize: '',
    coachEmergencyName: '',
    coachEmergencyPhone: '',
    athlete1EmergencyName: '',
    athlete1EmergencyPhone: '',
    athlete2EmergencyName: '',
    athlete2EmergencyPhone: '',
    athlete3EmergencyName: '',
    athlete3EmergencyPhone: '',
    waiverAccepted: false
  });

  const [currentPrice, setCurrentPrice] = useState(300);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.waiverAccepted) {
      alert('Please accept the waiver to continue.');
      return;
    }

    try {
      const response = await fetch('/api/submit-proving-grounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, priceTier: currentPrice })
      });

      if (response.ok) {
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
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center px-6">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative max-w-2xl text-center">
          <h1 className="text-6xl md:text-7xl font-light tracking-wider text-gray-200 mb-8">
            Registration Received
          </h1>

          <div className="h-px w-48 bg-gray-400 opacity-30 mx-auto mb-12" />

          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            Your team registration for <strong>{formData.teamName}</strong> has been submitted.
          </p>

          <div className="bg-gray-900 border border-gray-700 p-8 mb-8">
            <p className="text-base text-gray-300 mb-4">
              <strong>Next Step:</strong> Complete payment to secure your spot.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Total Investment: <strong className="text-gray-200 text-lg">${currentPrice}</strong>
            </p>
            
              href="#payment"
              className="inline-block bg-gray-200 hover:bg-white text-black py-4 px-10 text-sm tracking-wider uppercase transition-all duration-500"
            >
              Complete Payment
            </a>
          </div>

          <p className="text-xs text-gray-500">
            Payment link will be sent to {formData.email} shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 fixed">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

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
              Team Registration
            </h1>
            <div className="h-px w-32 bg-gray-400 opacity-30 mx-auto mb-6" />
            <div className="bg-gray-900 border border-gray-700 inline-block px-6 py-3">
              <p className="text-gray-300">
                Current Price: <strong className="text-gray-200 text-xl">${currentPrice}</strong> per team
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3">
                Team Information
              </h2>
              
              <input
                type="text"
                placeholder="TEAM NAME *"
                required
                value={formData.teamName}
                onChange={(e) => handleChange('teamName', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3">
                Coach Information
              </h2>
              
              <input
                type="text"
                placeholder="COACH NAME *"
                required
                value={formData.coachName}
                onChange={(e) => handleChange('coachName', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <input
                type="text"
                placeholder="CERTIFICATIONS (e.g., NASM-CPT, CrossFit L2) *"
                required
                value={formData.coachCertification}
                onChange={(e) => handleChange('coachCertification', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <select
                required
                value={formData.coachShirtSize}
                onChange={(e) => handleChange('coachShirtSize', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide focus:outline-none transition-colors"
              >
                <option value="">COACH T-SHIRT SIZE *</option>
                {shirtSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3">
                Athletes (3 Clients)
              </h2>
              
              {[1, 2, 3].map(num => (
                <div key={num} className="space-y-3 bg-gray-900 border border-gray-800 p-4">
                  <p className="text-xs text-gray-500 tracking-wider">ATHLETE {num}</p>
                  <input
                    type="text"
                    placeholder={`ATHLETE ${num} NAME *`}
                    required
                    value={formData[`athlete${num}Name`]}
                    onChange={(e) => handleChange(`athlete${num}Name`, e.target.value)}
                    className="w-full bg-black border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                  />
                  <select
                    required
                    value={formData[`athlete${num}ShirtSize`]}
                    onChange={(e) => handleChange(`athlete${num}ShirtSize`, e.target.value)}
                    className="w-full bg-black border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide focus:outline-none transition-colors"
                  >
                    <option value="">T-SHIRT SIZE *</option>
                    {shirtSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              ))}
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3">
                Contact Information
              </h2>
              
              <input
                type="email"
                placeholder="EMAIL *"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />

              <input
                type="tel"
                placeholder="PHONE *"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-light tracking-wide text-gray-300 border-b border-gray-800 pb-3">
                Emergency Contacts
              </h2>
              
              <div className="space-y-3 bg-gray-900 border border-gray-800 p-4">
                <p className="text-xs text-gray-500 tracking-wider">COACH EMERGENCY CONTACT</p>
                <input
                  type="text"
                  placeholder="NAME *"
                  required
                  value={formData.coachEmergencyName}
                  onChange={(e) => handleChange('coachEmergencyName', e.target.value)}
                  className="w-full bg-black border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />
                <input
                  type="tel"
                  placeholder="PHONE *"
                  required
                  value={formData.coachEmergencyPhone}
                  onChange={(e) => handleChange('coachEmergencyPhone', e.target.value)}
                  className="w-full bg-black border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>

              {[1, 2, 3].map(num => (
                <div key={num} className="space-y-3 bg-gray-900 border border-gray-800 p-4">
                  <p className="text-xs text-gray-500 tracking-wider">ATHLETE {num} EMERGENCY CONTACT</p>
                  <input
                    type="text"
                    placeholder="NAME *"
                    required
                    value={formData[`athlete${num}EmergencyName`]}
                    onChange={(e) => handleChange(`athlete${num}EmergencyName`, e.target.value)}
                    className="w-full bg-black border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="PHONE *"
                    required
                    value={formData[`athlete${num}EmergencyPhone`]}
                    onChange={(e) => handleChange(`athlete${num}EmergencyPhone`, e.target.value)}
                    className="w-full bg-black border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                  />
                </div>
              ))}
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
                  I certify that I and my team members are physically fit and have no medical conditions that would prevent safe participation. I agree to follow all safety protocols and instructions provided by event staff.
                </p>
                <p>
                  By checking the box below, I acknowledge that I have read, understood, and agree to this waiver on behalf of my entire team.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.waiverAccepted}
                  onChange={(e) => handleChange('waiverAccepted', e.target.checked)}
                  className="mt-1 w-5 h-5 border-2 border-gray-600 bg-transparent checked:bg-gray-300 transition-colors"
                />
                <span className="text-gray-300 group-hover:text-gray-200 transition-colors">
                  I accept the liability waiver and release on behalf of my team *
                </span>
              </label>
            </section>

            <div className="pt-8 text-center">
              <button
                type="submit"
                className="bg-gray-200 hover:bg-white text-black py-5 px-12 text-sm tracking-wider uppercase transition-all duration-500"
              >
                Complete Registration
              </button>
              <p className="text-xs text-gray-600 mt-4">
                After registration, you'll be redirected to payment.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
