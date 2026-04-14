import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CoachRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    coachName: '',
    coachEmail: '',
    coachPhone: '',
    coachShirtSize: 'L',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [mediaReleaseAccepted, setMediaReleaseAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const [pricePaid, setPricePaid] = useState(0);
  const [copied, setCopied] = useState(false);

  const calculatePrice = () => {
    const eventDate = new Date('2026-05-17');
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilEvent > 21) return 300;
    if (daysUntilEvent > 14) return 350;
    if (daysUntilEvent > 7) return 400;
    if (daysUntilEvent > 3) return 450;
    return 500;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateTeamCode = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `ROAM-${randomNum}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep('waiver');
  };

  const handleFinalSubmit = async () => {
    if (!waiverAccepted || !mediaReleaseAccepted) {
      alert('You must accept both waivers to complete registration');
      return;
    }

    setIsSubmitting(true);

    const code = generateTeamCode();
    const price = calculatePrice();

    try {
      const response = await fetch('/api/coach-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teamCode: code,
          pricePaid: price,
          waiverAccepted: true,
          mediaReleaseAccepted: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTeamCode(code);
        setPricePaid(price);
        setStep('complete');
      } else {
        alert('There was an error submitting your registration. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('There was an error submitting your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`Your ROAMSIX Proving Grounds Team Code is: ${teamCode}\n\nRegister at: https://roamsix.com/proving-grounds/athlete-register`);
    window.open(`sms:?&body=${message}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`Your ROAMSIX Proving Grounds Team Code is: ${teamCode}\n\nRegister at: https://roamsix.com/proving-grounds/athlete-register`);
    window.open(`https://wa.me/?text=${message}`);
  };

  if (step === 'complete') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#f3f4f6', padding: '80px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#c6a463', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', margin: '0 auto 20px' }}>
              <span style={{ fontSize: '32px' }}>✓</span>
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#f3f4f6', margin: '0 0 16px 0' }}>
              Registration Complete
            </h1>
            <p style={{ fontSize: '20px', color: '#9ca3af' }}>
              Your team has been registered and your spot is reserved pending payment.
            </p>
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '48px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '24px', textAlign: 'center' }}>
              Your Team Code
            </h2>
            
            <div style={{ backgroundColor: '#000000', border: '3px solid #c6a463', borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#c6a463', letterSpacing: '4px', margin: '0', fontFamily: 'monospace' }}>
                {teamCode}
              </p>
            </div>

            <p style={{ fontSize: '18px', color: '#9ca3af', textAlign: 'center', marginBottom: '32px' }}>
              Share this code with your 3 athletes so they can complete their individual registration.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={copyToClipboard}
                style={{
                  backgroundColor: copied ? '#10b981' : '#c6a463',
                  color: '#000000',
                  border: 'none',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                {copied ? '✓ Copied!' : '📋 Copy Code'}
              </button>

              <button
                onClick={shareViaSMS}
                style={{
                  backgroundColor: '#111827',
                  color: '#c6a463',
                  border: '2px solid #c6a463',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                💬 Share via SMS
              </button>

              <button
                onClick={shareViaWhatsApp}
                style={{
                  backgroundColor: '#111827',
                  color: '#c6a463',
                  border: '2px solid #c6a463',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                📱 Share via WhatsApp
              </button>
            </div>

            <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '24px' }}>
                Next Step: Complete payment to confirm your team
              </h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#c6a463', textAlign: 'center', margin: '24px 0' }}>
                Total Investment: ${pricePaid}
              </p>
              <a
                href="https://buy.stripe.com/test_4gM6oJ8QveS43MU0ol73G00"
                style={{
                  display: 'block',
                  backgroundColor: '#c6a463',
                  color: '#000000',
                  textDecoration: 'none',
                  padding: '20px 48px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                COMPLETE PAYMENT
              </a>
            </div>
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '48px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '32px' }}>
              What Happens Next?
            </h3>
            
            <div style={{ display: 'grid', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#c6a463', margin: '0 0 8px 0' }}>
                  1. Complete payment using the link above
                </p>
                <p style={{ color: '#9ca3af', margin: 0 }}>
                  Secure your team's spot with payment confirmation
                </p>
              </div>

              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#c6a463', margin: '0 0 8px 0' }}>
                  2. Share your team code with your 3 athletes
                </p>
                <p style={{ color: '#9ca3af', margin: 0 }}>
                  Use the share buttons above to send via SMS or WhatsApp
                </p>
              </div>

              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#c6a463', margin: '0 0 8px 0' }}>
                  3. Athletes register individually using the team code
                </p>
                <p style={{ color: '#9ca3af', margin: 0 }}>
                  Each athlete will complete their registration and sign their waiver
                </p>
              </div>

              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#c6a463', margin: '0 0 8px 0' }}>
                  4. Your team is confirmed when all 4 registrations are complete
                </p>
                <p style={{ color: '#9ca3af', margin: 0 }}>
                  You'll receive confirmation once your full team is registered
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'waiver') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#f3f4f6', padding: '80px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#f3f4f6', margin: '0 0 16px 0' }}>
              Liability Waiver & Release
            </h1>
            <p style={{ fontSize: '18px', color: '#9ca3af' }}>
              Please review and accept to complete registration
            </p>
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '40px', marginBottom: '24px', maxHeight: '400px', overflowY: 'scroll', border: '2px solid #9ca3af' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#c6a463', marginBottom: '24px' }}>
              Participant Liability Waiver & Assumption of Risk
            </h2>
            
            <div style={{ color: '#9ca3af', lineHeight: '1.8', fontSize: '14px' }}>
              <p style={{ marginBottom: '16px', fontWeight: 'bold', color: '#f3f4f6' }}>
                READ CAREFULLY. BY ACCEPTING, YOU ARE GIVING UP CERTAIN LEGAL RIGHTS INCLUDING THE RIGHT TO SUE.
              </p>

              <p style={{ marginBottom: '16px' }}>
                This Agreement is entered into between Reciprofy Inc. DBA Roamsix ("Company") and the participant named above ("Participant") for the ROAMSIX Proving Grounds event on May 17, 2026, at Chihuahua Valley, CA.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c6a463', marginTop: '24px', marginBottom: '12px' }}>EVENT ACTIVITIES & RISKS</h3>
              <p style={{ marginBottom: '12px' }}>The following activities involve inherent risks:</p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li>Terrain Challenge: Escalating sandbag carry over varied terrain</li>
                <li>Strength Testing: Maximum effort lifts and carries</li>
                <li>Engine Work: High-intensity cardiovascular challenges</li>
                <li>Control Under Fatigue: Skill execution while exhausted</li>
                <li>Power Testing: Pull-up ladder with voluntary bonus rounds</li>
                <li>Grit Challenge: Classified event revealed day-of</li>
              </ul>

              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c6a463', marginTop: '24px', marginBottom: '12px' }}>ASSUMPTION OF RISK</h3>
              <p style={{ marginBottom: '16px' }}>
                Participant voluntarily assumes all risks including: physical injury, sprains, strains, fractures, cardiovascular stress, heat exhaustion, dehydration, equipment failure, terrain hazards, and actions of other participants. THE COMPANY PERFORMS NO FITNESS ASSESSMENT. Participant is solely responsible for knowing their physical limits and stopping any activity that exceeds those limits.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c6a463', marginTop: '24px', marginBottom: '12px' }}>RELEASE OF LIABILITY</h3>
              <p style={{ marginBottom: '16px' }}>
                Participant RELEASES Reciprofy Inc. DBA Roamsix, its officers, employees, contractors, and agents from ANY liability for injury, loss, or death arising from participation, whether from ordinary negligence or otherwise. This does NOT apply to gross negligence or willful misconduct (prohibited by California law).
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c6a463', marginTop: '24px', marginBottom: '12px' }}>CONDUCT REQUIREMENTS</h3>
              <p style={{ marginBottom: '16px' }}>
                Participant agrees to: (1) comply immediately with all safety instructions, (2) communicate if feeling at risk or unable to continue, (3) not participate in physical activities after consuming alcohol, (4) maintain respectful conduct. Removal for safety violations forfeits all participation without refund.
              </p>

              <p style={{ marginBottom: '16px', fontWeight: 'bold', color: '#f3f4f6' }}>
                NO INSURANCE PROVIDED. Participant is responsible for maintaining their own health/accident insurance and all medical expenses.
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '40px', marginBottom: '32px', maxHeight: '400px', overflowY: 'scroll', border: '2px solid #9ca3af' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#c6a463', marginBottom: '24px' }}>
              Media Release & Likeness Authorization
            </h2>
            
            <div style={{ color: '#9ca3af', lineHeight: '1.8', fontSize: '14px' }}>
              <p style={{ marginBottom: '16px', fontWeight: 'bold', color: '#f3f4f6' }}>
                THIS GRANTS PERPETUAL, WORLDWIDE RIGHTS TO USE YOUR PHOTOGRAPH, VIDEO, AND LIKENESS FOR COMMERCIAL PURPOSES WITHOUT COMPENSATION.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c6a463', marginTop: '24px', marginBottom: '12px' }}>GRANT OF RIGHTS</h3>
              <p style={{ marginBottom: '12px' }}>Participant irrevocably grants Reciprofy Inc. DBA Roamsix the right to:</p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li>Use name, face, voice, image, photograph, and video in any media format</li>
                <li>Publish on social media (Instagram, TikTok, YouTube, Facebook, LinkedIn, X)</li>
                <li>Use in promotional materials, advertisements, marketing campaigns</li>
                <li>Include in press releases, media kits, testimonials</li>
                <li>Edit, crop, enhance, or modify content at Company's discretion</li>
              </ul>

              <p style={{ marginBottom: '16px', fontWeight: 'bold', color: '#f3f4f6' }}>
                Duration: Perpetual | Territory: Worldwide | Compensation: None
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#c6a463', marginTop: '24px', marginBottom: '12px' }}>WAIVER OF APPROVAL</h3>
              <p style={{ marginBottom: '16px' }}>
                Participant waives any right to review, approve, or reject content before publication. Company retains full editorial control. Company has no obligation to use any captured content.
              </p>

              <p style={{ marginBottom: '16px', fontSize: '12px' }}>
                California Civil Code § 3344 Compliance: By signing, Participant provides required written consent for commercial use of name, voice, photograph, and likeness.
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '40px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={waiverAccepted}
                  onChange={(e) => setWaiverAccepted(e.target.checked)}
                  style={{ marginRight: '12px', marginTop: '4px', width: '20px', height: '20px' }}
                />
                <span style={{ color: '#f3f4f6', fontSize: '16px', lineHeight: '1.6' }}>
                  I have read and understand the Liability Waiver & Assumption of Risk. I voluntarily agree to all terms and release Reciprofy Inc. DBA Roamsix from liability as described above.
                </span>
              </label>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={mediaReleaseAccepted}
                  onChange={(e) => setMediaReleaseAccepted(e.target.checked)}
                  style={{ marginRight: '12px', marginTop: '4px', width: '20px', height: '20px' }}
                />
                <span style={{ color: '#f3f4f6', fontSize: '16px', lineHeight: '1.6' }}>
                  I grant Reciprofy Inc. DBA Roamsix perpetual, worldwide rights to use my likeness for commercial purposes without compensation as described in the Media Release.
                </span>
              </label>
            </div>

            <button
              onClick={handleFinalSubmit}
              disabled={!waiverAccepted || !mediaReleaseAccepted || isSubmitting}
              style={{
                width: '100%',
                backgroundColor: (!waiverAccepted || !mediaReleaseAccepted || isSubmitting) ? '#9ca3af' : '#c6a463',
                color: '#000000',
                border: 'none',
                padding: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: (!waiverAccepted || !mediaReleaseAccepted || isSubmitting) ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              {isSubmitting ? 'SUBMITTING...' : 'COMPLETE REGISTRATION'}
            </button>
          </div>

          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            By completing registration, you affirm you are 18 years of age or older and legally competent to execute this agreement.
          </p>
        </div>
      </div>
    );
  }

  const currentPrice = calculatePrice();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#f3f4f6', padding: '80px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#f3f4f6', margin: '0 0 16px 0' }}>
            Coach Registration
          </h1>
          <p style={{ fontSize: '20px', color: '#9ca3af' }}>
            ROAMSIX Proving Grounds
          </p>
          <p style={{ fontSize: '18px', color: '#9ca3af', marginTop: '16px' }}>
            Register your team and secure your spot
          </p>
        </div>

        <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '48px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#000000', borderLeft: '4px solid #c6a463', padding: '16px 24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#c6a463', margin: '0 0 8px 0' }}>
              Current Team Price: ${currentPrice}
            </p>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
              Price increases weekly as event approaches
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '8px' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="coachName"
                value={formData.coachName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  backgroundColor: '#000000',
                  border: '2px solid #9ca3af',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '8px' }}>
                Email *
              </label>
              <input
                type="email"
                name="coachEmail"
                value={formData.coachEmail}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  backgroundColor: '#000000',
                  border: '2px solid #9ca3af',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '8px' }}>
                Phone *
              </label>
              <input
                type="tel"
                name="coachPhone"
                value={formData.coachPhone}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  backgroundColor: '#000000',
                  border: '2px solid #9ca3af',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '8px' }}>
                Shirt Size *
              </label>
              <select
                name="coachShirtSize"
                value={formData.coachShirtSize}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  backgroundColor: '#000000',
                  border: '2px solid #9ca3af',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '8px' }}>
                Emergency Contact Name *
              </label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  backgroundColor: '#000000',
                  border: '2px solid #9ca3af',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '8px' }}>
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  backgroundColor: '#000000',
                  border: '2px solid #9ca3af',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: isSubmitting ? '#9ca3af' : '#c6a463',
                color: '#000000',
                border: 'none',
                padding: '18px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              CONTINUE TO WAIVER
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
          You'll receive your team code and payment link after registration
        </p>
      </div>
    </div>
  );
}
