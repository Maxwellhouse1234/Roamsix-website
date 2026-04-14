import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AthleteRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState('teamCode');
  const [teamCode, setTeamCode] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const [coachName, setCoachName] = useState('');
  
  const [formData, setFormData] = useState({
    athleteName: '',
    athleteEmail: '',
    athletePhone: '',
    athleteShirtSize: 'L',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [mediaReleaseAccepted, setMediaReleaseAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateTeamCode = async () => {
    if (!teamCode.trim()) {
      alert('Please enter a team code');
      return;
    }

    setValidatingCode(true);
    try {
      const response = await fetch(`/api/validate-team-code?code=${teamCode}`);
      const data = await response.json();

      if (data.valid) {
        setCodeValid(true);
        setCoachName(data.coachName);
        setStep('form');
      } else {
        alert('Invalid team code. Please check with your coach and try again.');
      }
    } catch (error) {
      console.error('Validation error:', error);
      alert('Error validating team code. Please try again.');
    } finally {
      setValidatingCode(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setStep('waiver');
  };

  const handleFinalSubmit = async () => {
    if (!waiverAccepted || !mediaReleaseAccepted) {
      alert('You must accept both waivers to complete registration');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/athlete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teamCode,
          waiverAccepted: true,
          mediaReleaseAccepted: true
        }),
      });

      const data = await response.json();

      if (data.success) {
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

  if (step === 'teamCode') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#f3f4f6', padding: '80px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#f3f4f6', margin: '0 0 16px 0' }}>
              Athlete Registration
            </h1>
            <p style={{ fontSize: '20px', color: '#9ca3af' }}>
              ROAMSIX Proving Grounds
            </p>
            <p style={{ fontSize: '18px', color: '#9ca3af', marginTop: '16px' }}>
              Enter the team code provided by your coach
            </p>
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '48px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '8px' }}>
                Team Code
              </label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                placeholder="ROAM-XXXXXX"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '20px',
                  backgroundColor: '#000000',
                  border: '2px solid #9ca3af',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  letterSpacing: '2px'
                }}
              />
            </div>

            <button
              onClick={validateTeamCode}
              disabled={validatingCode}
              style={{
                width: '100%',
                backgroundColor: validatingCode ? '#9ca3af' : '#c6a463',
                color: '#000000',
                border: 'none',
                padding: '18px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: validatingCode ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              {validatingCode ? 'VALIDATING...' : 'CONTINUE'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#f3f4f6', padding: '80px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#f3f4f6', margin: '0 0 16px 0' }}>
              Athlete Registration
            </h1>
            <p style={{ fontSize: '18px', color: '#9ca3af' }}>
              Team: {teamCode} | Coach: {coachName}
            </p>
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '48px' }}>
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '8px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="athleteName"
                  value={formData.athleteName}
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
                  name="athleteEmail"
                  value={formData.athleteEmail}
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
                  name="athletePhone"
                  value={formData.athletePhone}
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
                  name="athleteShirtSize"
                  value={formData.athleteShirtSize}
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
                style={{
                  width: '100%',
                  backgroundColor: '#c6a463',
                  color: '#000000',
                  border: 'none',
                  padding: '18px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                CONTINUE TO WAIVER
              </button>
            </form>
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
                Participant RELEASES Reciprofy Inc. DBA Roamsix, its officers (Maxime Ouellette, CEO; Kyle Fujino, COO), employees, contractors, and agents from ANY liability for injury, loss, or death arising from participation, whether from ordinary negligence or otherwise. This does NOT apply to gross negligence or willful misconduct (prohibited by California law).
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#f3f4f6', padding: '80px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#c6a463', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', margin: '0 auto 32px' }}>
          <span style={{ fontSize: '48px' }}>✓</span>
        </div>
        
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#f3f4f6', margin: '0 0 24px 0' }}>
          Registration Complete!
        </h1>
        
        <p style={{ fontSize: '20px', color: '#9ca3af', marginBottom: '32px' }}>
          Welcome to Team {teamCode}
        </p>

        <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '40px', marginBottom: '32px' }}>
          <p style={{ fontSize: '18px', color: '#9ca3af', lineHeight: '1.8' }}>
            You're all set! Your coach has been notified. When all 4 team members complete registration and payment is confirmed, your team will be locked in for Proving Grounds.
          </p>
        </div>

        <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#c6a463', marginBottom: '24px' }}>
            What's Next
          </h2>
          
          <div style={{ textAlign: 'left', color: '#9ca3af', fontSize: '16px', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#f3f4f6' }}>May 17, 2026</strong><br />
              Chihuahua Valley, CA
            </p>
            <p style={{ marginBottom: '16px' }}>
              You'll receive event details, schedule, and logistics information closer to the event date.
            </p>
            <p style={{ fontSize: '14px' }}>
              Questions? Contact your coach or reach out to info@roamsix.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
