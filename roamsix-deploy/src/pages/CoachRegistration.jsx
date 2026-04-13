import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CoachRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    coachName: '',
    coachEmail: '',
    coachPhone: '',
    coachShirtSize: 'L',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
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
          pricePaid: price
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTeamCode(code);
        setPricePaid(price);
        setIsComplete(true);
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

  if (isComplete) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#f5f3f0', padding: '80px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '32px' }}>✓</span>
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#f5f3f0', margin: '0 0 16px 0' }}>
              Registration Complete
            </h1>
            <p style={{ fontSize: '20px', color: '#cbd5e1' }}>
              Your team has been registered and your spot is reserved pending payment.
            </p>
          </div>

          <div style={{ backgroundColor: '#152238', borderRadius: '12px', padding: '48px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5f3f0', marginBottom: '24px', textAlign: 'center' }}>
              Your Team Code
            </h2>
            
            <div style={{ backgroundColor: '#0a1628', border: '3px solid #d4af37', borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#d4af37', letterSpacing: '4px', margin: '0' }}>
                {teamCode}
              </p>
            </div>

            <p style={{ fontSize: '18px', color: '#cbd5e1', textAlign: 'center', marginBottom: '32px' }}>
              Share this code with your 3 athletes so they can complete their individual registration.
            </p>

            {/* Share Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={copyToClipboard}
                style={{
                  backgroundColor: copied ? '#10b981' : '#5eead4',
                  color: '#0a1628',
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
                  backgroundColor: '#1e293b',
                  color: '#5eead4',
                  border: '2px solid #5eead4',
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
                  backgroundColor: '#1e293b',
                  color: '#5eead4',
                  border: '2px solid #5eead4',
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

            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f5f3f0', marginBottom: '24px' }}>
                Next Step: Complete payment to confirm your team
              </h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#d4af37', textAlign: 'center', margin: '24px 0' }}>
                Total Investment: ${pricePaid}
              </p>
              <a
                href="https://buy.stripe.com/test_4gM6oJ8QveS43MU0ol73G00"
                style={{
                  display: 'block',
                  backgroundColor: '#d4af37',
                  color: '#0a1628',
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

          <div style={{ backgroundColor: '#152238', borderRadius: '12px', padding: '48px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#5eead4', marginBottom: '32px' }}>
              What Happens Next?
            </h3>
            
            <div style={{ display: 'grid', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#d4af37', margin: '0 0 8px 0' }}>
                  1. Complete payment using the link above
                </p>
                <p style={{ color: '#cbd5e1', margin: 0 }}>
                  Secure your team's spot with payment confirmation
                </p>
              </div>

              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#d4af37', margin: '0 0 8px 0' }}>
                  2. Share your team code with your 3 athletes
                </p>
                <p style={{ color: '#cbd5e1', margin: 0 }}>
                  Use the share buttons above to send via SMS or WhatsApp
                </p>
              </div>

              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#d4af37', margin: '0 0 8px 0' }}>
                  3. Athletes register individually using the team code
                </p>
                <p style={{ color: '#cbd5e1', margin: 0 }}>
                  Each athlete will complete their registration and sign their waiver
                </p>
              </div>

              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#d4af37', margin: '0 0 8px 0' }}>
                  4. Your team is confirmed when all 4 registrations are complete
                </p>
                <p style={{ color: '#cbd5e1', margin: 0 }}>
                  You'll receive confirmation once your full team is registered
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = calculatePrice();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#f5f3f0', padding: '80px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#f5f3f0', margin: '0 0 16px 0' }}>
            Coach Registration
          </h1>
          <p style={{ fontSize: '20px', color: '#5eead4' }}>
            ROAMSIX Proving Grounds
          </p>
          <p style={{ fontSize: '18px', color: '#cbd5e1', marginTop: '16px' }}>
            Register your team and secure your spot
          </p>
        </div>

        <div style={{ backgroundColor: '#152238', borderRadius: '12px', padding: '48px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#0a1628', borderLeft: '4px solid #d4af37', padding: '16px 24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37', margin: '0 0 8px 0' }}>
              Current Team Price: ${currentPrice}
            </p>
            <p style={{ color: '#cbd5e1', margin: 0, fontSize: '14px' }}>
              Price increases weekly as event approaches
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f5f3f0', marginBottom: '8px' }}>
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
                  backgroundColor: '#0a1628',
                  border: '2px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f5f3f0'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f5f3f0', marginBottom: '8px' }}>
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
                  backgroundColor: '#0a1628',
                  border: '2px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f5f3f0'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f5f3f0', marginBottom: '8px' }}>
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
                  backgroundColor: '#0a1628',
                  border: '2px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f5f3f0'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f5f3f0', marginBottom: '8px' }}>
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
                  backgroundColor: '#0a1628',
                  border: '2px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f5f3f0'
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
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f5f3f0', marginBottom: '8px' }}>
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
                  backgroundColor: '#0a1628',
                  border: '2px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f5f3f0'
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f5f3f0', marginBottom: '8px' }}>
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
                  backgroundColor: '#0a1628',
                  border: '2px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f5f3f0'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: isSubmitting ? '#64748b' : '#d4af37',
                color: '#0a1628',
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
              {isSubmitting ? 'SUBMITTING...' : 'REGISTER MY TEAM'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          You'll receive your team code and payment link after registration
        </p>
      </div>
    </div>
  );
}
