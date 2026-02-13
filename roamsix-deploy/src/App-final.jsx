import React, { useState } from 'react';
import { Lock, ArrowRight, User, Users, Trophy, Home } from 'lucide-react';

// API Helper Functions - now calling our serverless functions instead of Airtable directly
const validateInvitationCode = async (code) => {
  try {
    const response = await fetch('/api/validate-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error validating code:', error);
    return { valid: false, error: true };
  }
};

const markCodeAsUsed = async (recordId, email) => {
  try {
    await fetch('/api/mark-code-used', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recordId, email })
    });
  } catch (error) {
    console.error('Error marking code as used:', error);
  }
};

const submitApplication = async (formData, pathway, invitationCode) => {
  try {
    const response = await fetch('/api/submit-application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData, pathway, invitationCode })
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error submitting application:', error);
    return false;
  }
};

const submitAlternativeInterests = async (email, fullName, interests) => {
  try {
    const response = await fetch('/api/submit-interests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, fullName, interests })
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error submitting interests:', error);
    return false;
  }
};

export default function RoamsixPrototype() {
  const [inviteCode, setInviteCode] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [codeError, setCodeError] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [interestsSubmitted, setInterestsSubmitted] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [codeRecordId, setCodeRecordId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    location: '',
    linkedin: '',
    phone: '',
    address: '',
    company: '',
    role: '',
    teamSize: '',
    website: '',
    organizationName: '',
    sport: '',
    participants: '',
    relationship: '',
    transition: '',
    whyNow: '',
    alternativeInterests: []
  });

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setValidationLoading(true);
    
    const validation = await validateInvitationCode(inviteCode);
    
    if (validation.valid) {
      setIsValidated(true);
      setCodeError(false);
      setCodeRecordId(validation.recordId);
    } else {
      setCodeError(true);
      setTimeout(() => setCodeError(false), 3000);
    }
    
    setValidationLoading(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (email.includes('@')) {
      // Mark code as used
      if (codeRecordId) {
        await markCodeAsUsed(codeRecordId, email);
      }
      setEmailCaptured(true);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const success = await submitApplication(formData, selectedPath, inviteCode.toUpperCase());
    
    if (success) {
      setFormSubmitted(true);
    } else {
      alert('There was an error submitting your application. Please try again.');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      alternativeInterests: prev.alternativeInterests.includes(interest)
        ? prev.alternativeInterests.filter(i => i !== interest)
        : [...prev.alternativeInterests, interest]
    }));
  };

  const handleInterestsSubmit = async () => {
    const success = await submitAlternativeInterests(
      email,
      formData.fullName,
      formData.alternativeInterests
    );
    
    if (success) {
      setInterestsSubmitted(true);
    }
  };

  const pathways = [
    {
      id: 'Individual',
      title: 'Individual',
      icon: User,
      description: 'Going through a major transition on your own',
      criteria: [
        'Recently achieved something significant',
        'Unclear what should come next',
        'Willing to do hard things for clarity'
      ]
    },
    {
      id: 'Corporate',
      title: 'Corporate',
      icon: Users,
      description: 'Leadership teams (12-24) navigating change together',
      criteria: [
        'Strategy or leadership misalignment',
        'Major transition ahead',
        'Decision-maker with budget authority'
      ]
    },
    {
      id: 'Athletics',
      title: 'Athletics',
      icon: Trophy,
      description: 'Teams or coaching staff at a critical moment',
      criteria: [
        'Performance plateaus or cohesion issues',
        'Preparing for an important season',
        'Looking for structured challenge'
      ]
    },
    {
      id: 'Family',
      title: 'Family',
      icon: Home,
      description: 'High-performing families reconnecting through change',
      criteria: [
        'Major life transition happening',
        'Relocation, career shift, or life stage change',
        'Groups of 8-12 people'
      ]
    }
  ];

  const currentPathway = pathways.find(p => p.id === selectedPath);

  // Legal Documents Content
  const termsContent = (
    <div className="space-y-4 text-sm text-gray-300 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
      <h3 className="text-xl text-gray-200 font-light mb-4" style={{fontFamily: 'Cormorant Garamond, serif'}}>Terms & Conditions</h3>
      
      <div>
        <h4 className="text-gray-200 font-medium mb-2">1. Invitation-Only Access</h4>
        <p>Roamsix experiences are available exclusively by invitation. Your invitation code grants you access to apply, not guaranteed participation. Final acceptance is at the sole discretion of Roamsix founders.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">2. Application Process</h4>
        <p>By submitting an application, you agree to provide accurate information. False or misleading information may result in immediate disqualification. We review all applications within 72 hours.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">3. Participant Obligations</h4>
        <p>Accepted participants must be physically capable of outdoor activities and agree to follow all safety protocols. You are responsible for disclosing any medical conditions that may affect your participation.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">4. Payment Terms</h4>
        <p>Pricing is disclosed during the founder conversation. Full payment is required to secure your spot. Payments are non-refundable within 14 days of the experience start date.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">5. Cancellation Policy</h4>
        <p>Cancellations more than 30 days before: full refund minus $250 processing fee. 15-30 days: 50% refund. Less than 14 days: no refund. Roamsix may cancel for weather, safety, or insufficient enrollment with full refunds.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">6. Liability Waiver</h4>
        <p>Participation involves physical activity in outdoor environments. You assume all risk. Roamsix is not liable for injuries, loss, or damages except in cases of gross negligence.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">7. Confidentiality</h4>
        <p>Conversations and activities within cohorts are confidential. Participants agree not to share personal information or discussions without explicit consent.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">8. Code of Conduct</h4>
        <p>We maintain a respectful, inclusive environment. Harassment, discrimination, or disruptive behavior will result in immediate removal without refund.</p>
      </div>
    </div>
  );

  const privacyContent = (
    <div className="space-y-4 text-sm text-gray-300 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
      <h3 className="text-xl text-gray-200 font-light mb-4" style={{fontFamily: 'Cormorant Garamond, serif'}}>Privacy Policy</h3>
      
      <div>
        <h4 className="text-gray-200 font-medium mb-2">1. Information We Collect</h4>
        <p>We collect: name, email, phone, location, LinkedIn profile, mailing address, professional information, and your written responses to application questions. For corporate/team applications, we also collect organization details.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">2. How We Use Your Information</h4>
        <p>Your information is used to: evaluate your application, communicate about your cohort, send acceptance letters, match you with appropriate experiences, and improve our programs. With your consent, we may contact you about alternative offerings.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">3. Data Storage & Security</h4>
        <p>We store your data securely using industry-standard encryption. Information is retained for up to 2 years after your last interaction with Roamsix. Accepted participants' records are kept for 5 years for program continuity.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">4. Sharing Your Information</h4>
        <p>We do not sell your data. We may share information with: payment processors (for transactions), insurance providers (for participant coverage), and emergency contacts (if provided). We will never share your application responses publicly.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">5. Marketing Communications</h4>
        <p>If you opt in to receive information about alternative offerings, we will email you about relevant programs. You can unsubscribe anytime. We send no more than 2 emails per month.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">6. Your Rights</h4>
        <p>You have the right to: access your data, request corrections, delete your information (except where required for legal/safety reasons), opt out of marketing, and receive a copy of your data. Contact us to exercise these rights.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">7. Cookies & Tracking</h4>
        <p>This website uses minimal tracking for basic analytics (page views, application completion rates). We do not use third-party advertising cookies.</p>
      </div>

      <div>
        <h4 className="text-gray-200 font-medium mb-2">8. Contact</h4>
        <p>For privacy questions or to exercise your rights, email: privacy@roamsix.com</p>
      </div>
    </div>
  );

  // Modal Component
  const Modal = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div className="absolute inset-0 bg-black opacity-80" />
        <div 
          className="relative bg-gray-900 border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {content}
        </div>
      </div>
    );
  };

  if (!isValidated) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
          <div className="mb-16 animate-fadeIn">
            <h1 className="text-6xl md:text-8xl font-light tracking-[0.3em] text-gray-200 mb-4" style={{fontFamily: 'Cormorant Garamond, serif'}}>
              ROAMSIX
            </h1>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-30" />
          </div>

          <div className="max-w-md text-center mb-12 animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <Lock className="w-8 h-8 mx-auto mb-6 text-gray-300 opacity-60" />
            <p className="text-sm tracking-[0.15em] text-gray-300 opacity-70 uppercase mb-4" style={{fontFamily: 'sans-serif', letterSpacing: '0.15em'}}>
              Invitation only
            </p>
            <p className="text-base text-gray-400 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
              Someone gave you this code because they thought you'd benefit from what happens here. Enter it to continue.
            </p>
          </div>

          <form onSubmit={handleCodeSubmit} className="w-full max-w-md animate-fadeIn" style={{animationDelay: '0.6s'}}>
            <div className="relative group">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="ENTER INVITATION CODE"
                disabled={validationLoading}
                className={`w-full bg-gray-900 border-b-2 ${
                  codeError ? 'border-red-500' : 'border-gray-600'
                } text-white text-center text-lg tracking-[0.2em] py-4 px-6 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-gray-800 transition-all duration-500 uppercase disabled:opacity-50`}
                style={{fontFamily: 'sans-serif', letterSpacing: '0.2em'}}
              />
              {codeError && (
                <p className="absolute -bottom-8 left-0 right-0 text-center text-sm text-red-400 animate-fadeIn">
                  Invalid code. Access denied.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={validationLoading}
              className="mt-12 w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-400 text-gray-200 py-4 px-8 tracking-[0.15em] text-sm uppercase transition-all duration-500 group disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-3">
                {validationLoading ? 'Validating...' : 'Validate Access'}
                {!validationLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />}
              </span>
            </button>
          </form>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Crimson+Text:wght@400;600&display=swap');
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    );
  }

  if (isValidated && !emailCaptured) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
          <div className="mb-12 text-center animate-fadeIn">
            <h2 className="text-5xl md:text-6xl font-light tracking-[0.2em] text-gray-200 mb-6" style={{fontFamily: 'Cormorant Garamond, serif'}}>
              You're In
            </h2>
            <div className="h-px w-24 bg-gray-400 opacity-30 mx-auto mb-8" />
            <p className="text-lg text-gray-400 max-w-md mx-auto leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
              Where should we reach you?
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="w-full max-w-md animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <div className="relative group mb-8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL"
                required
                className="w-full bg-gray-900 border-b-2 border-gray-600 text-white text-center text-lg tracking-[0.15em] py-4 px-6 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-gray-800 transition-all duration-500 uppercase"
                style={{fontFamily: 'sans-serif', letterSpacing: '0.15em'}}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-400 text-gray-200 py-4 px-8 tracking-[0.15em] text-sm uppercase transition-all duration-500 group"
            >
              <span className="flex items-center justify-center gap-3">
                Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
          </form>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Crimson+Text:wght@400;600&display=swap');
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    );
  }

  if (isValidated && emailCaptured && !selectedPath) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative min-h-screen px-6 py-12">
          <div className="max-w-6xl mx-auto mb-20 animate-fadeIn">
            <h2 className="text-5xl md:text-7xl font-light tracking-[0.2em] text-gray-200 mb-6" style={{fontFamily: 'Cormorant Garamond, serif'}}>
              Which Fits
            </h2>
            <div className="h-px w-32 bg-gray-400 opacity-30 mb-8" />
            <p className="text-lg text-gray-400 max-w-2xl leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
              We run four types of experiences. Tell us which transition you're in and we'll match you to the right cohort.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {pathways.map((pathway, index) => {
              const Icon = pathway.icon;
              return (
                <button
                  key={pathway.id}
                  onClick={() => {
                    setSelectedPath(pathway.id);
                    setShowForm(false);
                  }}
                  className="group text-left bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 p-8 md:p-10 transition-all duration-700 relative overflow-hidden animate-fadeIn"
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                  
                  <div className="relative z-10">
                    <div className="mb-6">
                      <Icon className="w-10 h-10 text-gray-400 group-hover:text-gray-300 transition-colors duration-500" />
                    </div>

                    <h3 className="text-3xl font-light tracking-[0.15em] text-gray-200 mb-3 group-hover:tracking-[0.2em] transition-all duration-500" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                      {pathway.title}
                    </h3>

                    <p className="text-gray-400 mb-6 text-sm leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
                      {pathway.description}
                    </p>

                    <div className="space-y-2">
                      {pathway.criteria.map((criterion, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-1 h-1 bg-gray-500 mt-2 flex-shrink-0" />
                          <p className="text-xs text-gray-500 tracking-wide" style={{fontFamily: 'sans-serif'}}>
                            {criterion}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-gray-400 group-hover:text-gray-300 group-hover:gap-4 transition-all duration-500">
                      <span className="text-xs tracking-[0.15em] uppercase">Proceed</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="max-w-6xl mx-auto mt-20 text-center">
            <p className="text-xs text-gray-600 tracking-[0.15em] uppercase">
              We'll confirm you're matched to the right experience during the founder conversation.
            </p>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Crimson+Text:wght@400;600&display=swap');
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    );
  }

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <Modal 
          isOpen={showModal !== null} 
          onClose={() => setShowModal(null)}
          content={showModal === 'terms' ? termsContent : privacyContent}
        />

        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-2xl text-center animate-fadeIn">
            <h1 className="text-6xl md:text-7xl font-light tracking-[0.25em] text-gray-200 mb-8" style={{fontFamily: 'Cormorant Garamond, serif'}}>
              Under Review
            </h1>
            
            <div className="h-px w-48 bg-gray-400 opacity-30 mx-auto mb-12" />

            <p className="text-xl text-gray-300 leading-relaxed mb-8" style={{fontFamily: 'Crimson Text, serif'}}>
              We've received your request. A founder will review your candidature and reach out within 72 hours.
            </p>

            <p className="text-base text-gray-400 leading-relaxed mb-8" style={{fontFamily: 'Crimson Text, serif'}}>
              If accepted, you'll receive next steps and details about your cohort.
            </p>

            <div className="bg-gray-900 border border-gray-700 p-6 mb-12 text-left">
              <p className="text-xs text-gray-400 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
                By submitting this request, you agree to our{' '}
                <button 
                  onClick={() => setShowModal('terms')}
                  className="text-gray-300 underline hover:text-white transition-colors"
                >
                  Terms & Conditions
                </button>
                {' '}and{' '}
                <button 
                  onClick={() => setShowModal('privacy')}
                  className="text-gray-300 underline hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
                . You consent to Roamsix contacting you regarding your application and related opportunities.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-700 p-8 md:p-10 text-left">
              <p className="text-sm tracking-[0.15em] text-gray-400 uppercase mb-4 text-center">
                While You Wait
              </p>
              <p className="text-sm text-gray-400 mb-2 text-center" style={{fontFamily: 'Crimson Text, serif'}}>
                If the 3-day format doesn't fit right now, we offer other ways to engage.
              </p>
              <p className="text-xs text-gray-500 mb-6 text-center italic" style={{fontFamily: 'Crimson Text, serif'}}>
                By selecting below, you agree to receive information about these offerings at {email}.
              </p>

              {!interestsSubmitted ? (
                <>
                  <div className="space-y-3 mb-6">
                    {[
                      { 
                        id: '1-Day Workshop', 
                        label: '1-Day Workshops',
                        description: 'Lower investment, single focus areas'
                      },
                      { 
                        id: '2-Day Intensive', 
                        label: '2-Day Intensives',
                        description: 'Weekend format for deeper work'
                      },
                      { 
                        id: 'Custom Event', 
                        label: 'Custom Event for My Organization',
                        description: 'Tailored experiences for teams'
                      },
                      { 
                        id: 'Speaker Series', 
                        label: 'Speaker Series / Group Discussions',
                        description: 'Ongoing community engagement'
                      },
                      { 
                        id: 'Waitlist', 
                        label: 'Waitlist for Future Cohorts',
                        description: 'Be notified when new dates open'
                      }
                    ].map(interest => (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`w-full text-left p-4 border transition-all duration-300 ${
                          formData.alternativeInterests.includes(interest.id)
                            ? 'bg-gray-800 border-gray-500'
                            : 'bg-transparent border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 border-2 flex-shrink-0 mt-0.5 transition-all ${
                            formData.alternativeInterests.includes(interest.id)
                              ? 'bg-gray-300 border-gray-300'
                              : 'border-gray-600'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-300 font-medium mb-1">{interest.label}</p>
                            <p className="text-xs text-gray-500">{interest.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {formData.alternativeInterests.length > 0 && (
                    <>
                      <div className="p-4 bg-gray-800 border border-gray-600 mb-4">
                        <p className="text-xs text-gray-400 mb-2">
                          <strong>Send information to:</strong>
                        </p>
                        <p className="text-sm text-gray-300 font-mono">{email}</p>
                        <p className="text-xs text-gray-500 mt-3 italic">
                          We'll include these preferences when we reach out. You can unsubscribe anytime.
                        </p>
                      </div>

                      <button
                        onClick={handleInterestsSubmit}
                        className="w-full bg-gray-200 hover:bg-white text-black py-4 px-8 text-sm tracking-[0.2em] uppercase transition-all duration-500"
                      >
                        Send Me Information
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="p-6 bg-gray-800 border border-gray-600 text-center">
                  <p className="text-base text-gray-300 mb-2" style={{fontFamily: 'Crimson Text, serif'}}>
                    ✓ Preferences Saved
                  </p>
                  <p className="text-sm text-gray-400">
                    We'll send information about {formData.alternativeInterests.length} offering{formData.alternativeInterests.length > 1 ? 's' : ''} to {email}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Crimson+Text:wght@400;600&display=swap');
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
            } else {
              setSelectedPath(null);
            }
          }}
          className="absolute top-8 left-8 text-gray-400 hover:text-gray-300 transition-colors duration-300 flex items-center gap-2 text-sm tracking-wider"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          BACK
        </button>

        {!showForm ? (
          <div className="max-w-3xl text-center animate-fadeIn">
            <h1 className="text-6xl md:text-8xl font-light tracking-[0.25em] text-gray-200 mb-8" style={{fontFamily: 'Cormorant Garamond, serif'}}>
              {currentPathway?.title}
            </h1>

            <div className="h-px w-48 bg-gray-400 opacity-30 mx-auto mb-12" />

            <div className="mb-16 space-y-6">
              <p className="text-xl text-gray-300 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
                Three days in unfamiliar terrain with a small group facing similar transitions. Structured challenges designed to surface clarity you can't access from your normal environment.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
                Physical demands, meaningful conversation, and enough discomfort to cut through whatever story you've been telling yourself.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-700 p-8 md:p-12 mb-12">
              <p className="text-sm tracking-[0.2em] text-gray-400 uppercase mb-4">Next Cohort</p>
              <p className="text-2xl font-light text-gray-200 mb-4" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                {selectedPath === 'Individual' ? 'March 15-18, 2026' : selectedPath === 'Corporate' ? 'Custom Scheduling' : selectedPath === 'Athletics' ? 'April 2026' : 'May 2026'}
              </p>
              <p className="text-sm text-gray-500">
                Limited to {selectedPath === 'Corporate' || selectedPath === 'Family' ? '12-24 participants' : selectedPath === 'Athletics' ? '15-20 participants' : '8-12 participants'}. Spots fill through referrals.
              </p>
            </div>

            <button 
              onClick={() => setShowForm(true)}
              className="group bg-gray-200 hover:bg-white text-black py-5 px-12 text-sm tracking-[0.2em] uppercase transition-all duration-500 relative overflow-hidden"
            >
              <span className="relative z-10">Request Conversation</span>
            </button>

            <p className="mt-8 text-xs text-gray-600 tracking-wide">
              A founder will reach out within 48 hours to discuss fit and answer questions.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl w-full animate-fadeIn">
            <div className="mb-12 text-center">
              <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-gray-200 mb-4" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                Tell Us More
              </h2>
              <div className="h-px w-32 bg-gray-400 opacity-30 mx-auto mb-6" />
              <p className="text-sm text-gray-400" style={{fontFamily: 'Crimson Text, serif'}}>
                This helps us understand if this experience is right for where you are.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="FULL NAME *"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleFormChange('fullName', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />

                <input
                  type="text"
                  placeholder="LOCATION (City, State/Country) *"
                  required
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />

                <input
                  type="email"
                  placeholder="EMAIL *"
                  value={email}
                  disabled
                  className="w-full bg-gray-800 border border-gray-700 text-gray-400 px-4 py-3 text-sm tracking-wide"
                />

                <input
                  type="tel"
                  placeholder="PHONE (Recommended)"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />

                <input
                  type="url"
                  placeholder="LINKEDIN URL *"
                  required
                  value={formData.linkedin}
                  onChange={(e) => handleFormChange('linkedin', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                />

                <textarea
                  placeholder="MAILING ADDRESS / PO BOX (For correspondence if accepted)"
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="border-t border-gray-800 pt-6 space-y-4">
                {selectedPath === 'Individual' && (
                  <>
                    <input
                      type="text"
                      placeholder="CURRENT ROLE & COMPANY *"
                      required
                      value={formData.role}
                      onChange={(e) => handleFormChange('role', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                    <input
                      type="url"
                      placeholder="PERSONAL WEBSITE OR PORTFOLIO (Optional)"
                      value={formData.website}
                      onChange={(e) => handleFormChange('website', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                  </>
                )}

                {selectedPath === 'Corporate' && (
                  <>
                    <input
                      type="text"
                      placeholder="COMPANY NAME *"
                      required
                      value={formData.company}
                      onChange={(e) => handleFormChange('company', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="YOUR ROLE *"
                      required
                      value={formData.role}
                      onChange={(e) => handleFormChange('role', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="TEAM SIZE (e.g., '18 people') *"
                      required
                      value={formData.teamSize}
                      onChange={(e) => handleFormChange('teamSize', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                    <input
                      type="url"
                      placeholder="COMPANY WEBSITE OR LINKEDIN *"
                      required
                      value={formData.website}
                      onChange={(e) => handleFormChange('website', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                  </>
                )}

                {selectedPath === 'Athletics' && (
                  <>
                    <input
                      type="text"
                      placeholder="TEAM / ORGANIZATION NAME *"
                      required
                      value={formData.organizationName}
                      onChange={(e) => handleFormChange('organizationName', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="YOUR ROLE (e.g., Head Coach, Athletic Director) *"
                      required
                      value={formData.role}
                      onChange={(e) => handleFormChange('role', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="SPORT & LEVEL (e.g., 'NCAA Division I Basketball') *"
                      required
                      value={formData.sport}
                      onChange={(e) => handleFormChange('sport', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                  </>
                )}

                {selectedPath === 'Family' && (
                  <>
                    <input
                      type="text"
                      placeholder="NUMBER OF PARTICIPANTS (e.g., '10') *"
                      required
                      value={formData.participants}
                      onChange={(e) => handleFormChange('participants', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="YOUR RELATIONSHIP TO GROUP (e.g., 'Parent organizing for family') *"
                      required
                      value={formData.relationship}
                      onChange={(e) => handleFormChange('relationship', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm tracking-wide placeholder-gray-600 focus:outline-none transition-colors"
                    />
                  </>
                )}
              </div>

              <div className="border-t border-gray-800 pt-6 space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 tracking-wide mb-2 uppercase">
                    What transition are you navigating right now? *
                  </label>
                  <textarea
                    required
                    value={formData.transition}
                    onChange={(e) => handleFormChange('transition', e.target.value)}
                    rows={4}
                    placeholder="Be specific. What's shifting in your life or work?"
                    className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm leading-relaxed placeholder-gray-600 focus:outline-none transition-colors resize-none"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 tracking-wide mb-2 uppercase">
                    Why are you saying yes to this invitation right now? *
                  </label>
                  <textarea
                    required
                    value={formData.whyNow}
                    onChange={(e) => handleFormChange('whyNow', e.target.value)}
                    rows={4}
                    placeholder="What makes this the right moment for structured challenge?"
                    className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 text-gray-200 px-4 py-3 text-sm leading-relaxed placeholder-gray-600 focus:outline-none transition-colors resize-none"
                    style={{fontFamily: 'Crimson Text, serif'}}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-200 hover:bg-white text-black py-4 px-8 text-sm tracking-[0.2em] uppercase transition-all duration-500 mt-8"
              >
                Submit for Review
              </button>

              <p className="text-xs text-gray-600 text-center">
                We review each candidature individually. You'll hear from a founder within 72 hours.
              </p>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Crimson+Text:wght@400;600&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
