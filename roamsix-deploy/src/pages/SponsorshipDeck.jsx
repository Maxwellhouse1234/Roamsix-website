import { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Users,
  Zap,
  ShieldCheck,
  Target,
  TrendingUp,
  BarChart3,
  Mic,
  Monitor,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Key,
  Mail,
  Smartphone,
  Building2,
  Loader2
} from 'lucide-react';

export default function SponsorshipDeck() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [accessCode, setAccessCode]     = useState('');
  const [email, setEmail]               = useState('');
  const [company, setCompany]           = useState('');
  const [error, setError]               = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile]         = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('roamsixSponsorAuthorized') === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setCurrentSlide(p => Math.min(p + 1, slides.length - 1));
      if (e.key === 'ArrowLeft')  setCurrentSlide(p => Math.max(p - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile]);

  const validateAccess = async (e) => {
    e.preventDefault();
    if (!email || !company || !accessCode) {
      setError('Please fill in all fields to access the partnership deck.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res    = await fetch('/api/validate-sponsor-code', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, company, accessCode }),
      });
      const result = await res.json();
      if (!res.ok || !result.valid) {
        setError(result.error || 'Invalid access code. Please request a valid code via the link below.');
        return;
      }
      sessionStorage.setItem('roamsixSponsorAuthorized', 'true');
      sessionStorage.setItem('roamsixSponsorEmail',      email);
      sessionStorage.setItem('roamsixSponsorCompany',    company);
      setIsAuthorized(true);
    } catch {
      setError('System error. Please try again or contact info@roamsix.com.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('roamsixSponsorAuthorized');
    sessionStorage.removeItem('roamsixSponsorEmail');
    sessionStorage.removeItem('roamsixSponsorCompany');
    setIsAuthorized(false);
    setCurrentSlide(0);
  };

  const slides = [
    {
      id: 'title', type: 'title',
      content: {
        title:    'ROAMSIX',
        subtitle: 'Partnership & Sponsorship Opportunities 2026',
        tagline:  'Where high-performance meets community.',
        footer:   'PROVING GROUNDS | REDIRECTION POINT | CORPORATE RETREATS',
        url:      'roamsix.com',
      },
    },
    {
      id: 'shift', type: 'comparison',
      title:       'The Shift',
      subtitle:    'Why traditional sponsorship is losing efficiency.',
      description: 'The people in our environment are not browsing. They are deciding what they keep, what they change, and what they commit to next.',
      left:  { label: 'The Old Model', items: ['Paying for impressions', 'Passive audiences scrolling past', 'One-time, one-directional exposure', 'Interruption-based reach'] },
      right: { label: 'The ROAMSIX Model', items: ['Access during active decision-making', 'Trust-based placement in context', 'Multi-touch ecosystem that compounds', 'Brand integration inside moments of clarity'] },
    },
    {
      id: 'model', type: 'grid',
      title:    'The ROAMSIX Model',
      subtitle: 'A decision-point access platform.',
      items: [
        { icon: <Monitor className="w-8 h-8 text-white" />, label: 'Controlled Environments',       text: 'Physical and environmental conditions where clarity surfaces through movement, challenge, and recovery.' },
        { icon: <Users   className="w-8 h-8 text-white" />, label: 'High-Performers in Transition', text: 'Founders, executives, and athletes navigating high-consequence growth phases.' },
        { icon: <Zap     className="w-8 h-8 text-white" />, label: 'Active Re-evaluation',          text: 'Participants are actively replacing systems, habits, and vendors. Your brand enters that conversation.' },
        { icon: <TrendingUp className="w-8 h-8 text-white" />, label: 'Multi-Touch Ecosystem',      text: 'Proving Grounds events, monthly retreats, the Redirection Point podcast, and digital — all connected.' },
      ],
    },
    {
      id: 'audience', type: 'stats',
      title:    'The Audience',
      subtitle: 'Commercially valuable influence and intent.',
      points: [
        { label: 'Budget Control',     text: 'Participants control personal spend, departmental allocation, and organizational procurement.' },
        { label: 'Active Replacement', text: 'In transition phases, participants evaluate new systems and services.' },
        { label: 'Influence',          text: 'Teams, clients, and organizations follow the decisions made by these leaders.' },
      ],
      stats: [
        { value: '94',    label: 'Participants / Proving Grounds' },
        { value: '12+',   label: 'Corporate Retreats / Year' },
        { value: '4,546', label: 'Social Followers (IG / LI / FB)' },
      ],
    },
    {
      id: 'ecosystem', type: 'ecosystem',
      title:    'The Ecosystem',
      subtitle: 'A controlled loop, not just one touchpoint.',
      channels: [
        { icon: <Target      className="w-6 h-6" />, label: 'Proving Grounds',   desc: 'Flagship event with direct physical product trial and branded recovery stations.' },
        { icon: <ShieldCheck className="w-6 h-6" />, label: 'Corporate Retreats', desc: 'Monthly programming for executive teams and departmental budget holders.' },
        { icon: <Mic         className="w-6 h-6" />, label: 'Redirection Point', desc: 'Long-form conversations and host-read integrations in a trusted voice.' },
        { icon: <Monitor     className="w-6 h-6" />, label: 'Digital',           desc: 'Dedicated partner features and ongoing amplification across all platforms.' },
      ],
    },
    {
      id: 'decision', type: 'process',
      title:    'The Decision Point',
      subtitle: 'Inserting brands at the exact moment that matters.',
      steps: [
        { id: '01', label: 'Physical Challenge', desc: 'Activates awareness of what the body and mind need.' },
        { id: '02', label: 'Need Surfaces',      desc: 'The participant identifies what is missing or underperforming.' },
        { id: '03', label: 'Clarity Arrives',    desc: 'Recovery and reflection create genuine openness to change.' },
        { id: '04', label: 'Decision Forms',     desc: 'New systems, habits, and vendors are evaluated and chosen.' },
        { id: '05', label: 'Brand Trusted',      desc: 'Your brand is positioned as the answer at the critical moment.' },
      ],
    },
    {
      id: 'outcomes', type: 'outcomes',
      title:    'Commercial Outcomes',
      subtitle: 'Measurable results, not just features.',
      items: [
        { title: 'Trial at Behavior Change',  desc: 'Direct product engagement when participants are physically and mentally primed for new systems.' },
        { title: 'Trust Conversion',          desc: 'Credible placement in a high-intensity environment builds brand association paid media cannot replicate.' },
        { title: 'Multi-Touch Reinforcement', desc: 'Your brand compounds from recovery station to podcast episode to social feed.' },
        { title: 'Enterprise Pipeline',       desc: 'Direct access to executive spend. One enterprise contract often covers the full partnership cost.' },
      ],
    },
    {
      id: 'roi', type: 'roi',
      title:    'Illustrative ROI Model',
      subtitle: 'A plausible path to partner break-even.',
      data: [
        { label: 'Participants per event',          value: '94' },
        { label: 'Estimated product trials (60%)',  value: '~56' },
        { label: 'Estimated customers (25%)',        value: '~14' },
        { label: 'Revenue per event ($500 LTV)',     value: '$7,000', highlight: true },
      ],
      outcome: '~$28,000 in participant value over 4 events per year. Enterprise conversion excluded — one corporate adoption can exceed the full annual investment.',
    },
    {
      id: 'structure', type: 'pricing',
      title:    'Partnership Structure',
      subtitle: 'Anchor pricing based on integration depth.',
      tiers: [
        { level: '01', name: 'Founding Partner',  price: '$50,000 / yr+', highlight: true, desc: 'Exclusive category ownership and full ecosystem activation.' },
        { level: '02', name: 'Premier Sponsor',   price: '$20,000 / yr+', desc: 'Multi-channel presence — events plus podcast or digital.' },
        { level: '03', name: 'Event Sponsor',     price: '$5,000 – $10K', desc: 'Single on-site activation at Proving Grounds.' },
        { level: '04', name: 'Podcast Sponsor',   price: '$1,000 – $5K',  desc: 'Host-read narrative integration in Redirection Point.' },
        { level: '05', name: 'Community Partner', price: 'By inquiry',    desc: 'On-site wellness integration — massage, IV, chiropractic, nutrition.' },
      ],
    },
    {
      id: 'lockout', type: 'lockout',
      title:    'Category Lockout',
      subtitle: 'Exclusive category ownership.',
      warning:  'Once a category is assigned, it is removed from the 2026 market across every ROAMSIX channel.',
      categories: ['Performance Nutrition', 'Recovery Technology', 'IV & Clinical Wellness', 'Athletic Apparel', 'HR & Leadership Tech', 'Fuel & Hydration'],
    },
    {
      id: 'final', type: 'final',
      title:    'Strategic Fit Call',
      subtitle: '20 minutes. Three outcomes.',
      steps: [
        { id: '01', label: 'Define', text: 'Identify the decision point and the audience you are targeting.' },
        { id: '02', label: 'Map',    text: 'Design your integration into events, retreats, and the podcast.' },
        { id: '03', label: 'Lock',   text: 'Category assigned. Competitors removed from the 2026 market.' },
      ],
      contact: { name: 'Max Ouellette, Founder', email: 'info@roamsix.com', url: 'roamsix.com' },
    },
  ];

  const renderSlide = (slide, idx) => (
    <div key={idx} id={slide.id} className={isMobile ? 'min-h-[80vh] py-16 border-b border-white/10 last:border-0' : 'h-full flex flex-col justify-center'}>

      {slide.type === 'title' && (
        <div className="text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase">{slide.content.title}</h1>
          <div className="space-y-3">
            <p className="text-xl md:text-2xl font-bold text-white/80">{slide.content.subtitle}</p>
            <p className="text-lg text-white/50 italic">{slide.content.tagline}</p>
          </div>
          <div className="pt-10 border-t border-white/20">
            <p className="text-xs tracking-widest uppercase opacity-40 mb-2">{slide.content.footer}</p>
            <p className="text-base font-mono text-white/80">{slide.content.url}</p>
          </div>
        </div>
      )}

      {slide.type === 'comparison' && (
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
            <p className="text-lg text-white/50 mt-1">{slide.subtitle}</p>
            <p className="mt-4 text-base md:text-lg text-white/80 max-w-2xl">{slide.description}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-5">
              <h3 className="text-xs uppercase tracking-widest opacity-40 font-bold">{slide.left.label}</h3>
              <ul className="space-y-3">
                {slide.left.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/50 text-sm md:text-base">
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 bg-white/10 rounded-2xl border border-white/20 space-y-5">
              <h3 className="text-xs uppercase tracking-widest font-bold">{slide.right.label}</h3>
              <ul className="space-y-3">
                {slide.right.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium text-sm md:text-base">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {slide.type === 'grid' && (
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
            <p className="text-lg text-white/50 mt-1">{slide.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {slide.items.map((item, i) => (
              <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-xl">
                <div className="mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold mb-1">{item.label}</h3>
                <p className="text-sm text-white/60">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'stats' && (
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
            <p className="text-lg text-white/50 mt-1">{slide.subtitle}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {slide.stats.map((s, i) => (
              <div key={i} className="text-center p-6 bg-white/5 rounded-3xl">
                <div className="text-5xl font-black mb-1">{s.value}</div>
                <div className="text-xs uppercase tracking-widest opacity-50 font-bold">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-5">
            {slide.points.map((pt, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="bg-white/10 p-2 rounded-lg shrink-0"><Target className="w-4 h-4" /></div>
                <div>
                  <span className="font-bold block text-lg">{pt.label}</span>
                  <span className="text-sm text-white/60">{pt.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'ecosystem' && (
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
            <p className="text-lg text-white/50 mt-1">{slide.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {slide.channels.map((ch, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-white/10 rounded-full">{ch.icon}</div>
                <h3 className="text-lg font-bold">{ch.label}</h3>
                <p className="text-xs text-white/60">{ch.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'process' && (
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
            <p className="text-lg text-white/50 mt-1">{slide.subtitle}</p>
          </div>
          <div className="flex flex-col gap-3">
            {slide.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-6 p-5 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-3xl font-black opacity-20 w-12 shrink-0">{step.id}</div>
                <div>
                  <h3 className="text-lg font-bold">{step.label}</h3>
                  <p className="text-sm text-white/60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'outcomes' && (
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
            <p className="text-lg text-white/50 mt-1">{slide.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {slide.items.map((item, i) => (
              <div key={i} className="p-6 border-l-2 border-white/20 bg-white/5 hover:border-white transition-all">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/60 text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'roi' && (
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
            <p className="text-lg text-white/50 mt-1">{slide.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-3">
              {slide.data.map((d, i) => (
                <div key={i} className={`flex justify-between p-4 rounded-xl border ${d.highlight ? 'bg-white text-black border-white' : 'border-white/10'}`}>
                  <span className={d.highlight ? 'font-bold' : 'text-white/60 text-sm'}>{d.label}</span>
                  <span className="font-bold text-sm">{d.value}</span>
                </div>
              ))}
            </div>
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <BarChart3 className="w-10 h-10 mb-5 opacity-40" />
              <p className="text-xl font-medium leading-snug italic text-white/80">"{slide.outcome}"</p>
            </div>
          </div>
        </div>
      )}

      {slide.type === 'pricing' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
            <p className="text-lg text-white/50 mt-1">{slide.subtitle}</p>
          </div>
          <div className="grid gap-3">
            {slide.tiers.map((tier, i) => (
              <div key={i} className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${tier.highlight ? 'bg-white text-black border-white md:scale-[1.02]' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-5">
                  <span className={`text-xs font-bold opacity-40 ${tier.highlight ? 'text-black' : ''}`}>{tier.level}</span>
                  <div>
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                    <p className={`text-xs ${tier.highlight ? 'text-black/60' : 'text-white/40'}`}>{tier.desc}</p>
                  </div>
                </div>
                <div className="text-xl font-black tracking-tight shrink-0">{tier.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'lockout' && (
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
            <p className="text-lg text-white/50 mt-1">{slide.subtitle}</p>
          </div>
          <div className="p-5 bg-amber-900/20 border border-amber-500/40 rounded-2xl flex items-center gap-4 text-amber-200">
            <AlertCircle className="shrink-0" />
            <p className="text-sm font-medium">{slide.warning}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {slide.categories.map((cat, i) => (
              <div key={i} className="p-6 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-white transition-all">
                <span className="font-bold text-base">{cat}</span>
                <Lock className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.type === 'final' && (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-10">
            <div>
              <h2 className="text-5xl font-black tracking-tight">{slide.title}</h2>
              <p className="text-xl text-white/50 mt-1">{slide.subtitle}</p>
            </div>
            <div className="space-y-6">
              {slide.steps.map((step, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="text-2xl font-black text-white/20">{step.id}</div>
                  <div>
                    <h3 className="text-lg font-bold">{step.label}</h3>
                    <p className="text-sm text-white/60">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-10 bg-white/5 border border-white/10 rounded-[2rem] space-y-8">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-40 font-bold mb-2">Contact</p>
              <h3 className="text-2xl font-bold">{slide.contact.name}</h3>
            </div>
            <div className="space-y-4">
              <a href={`mailto:${slide.contact.email}`} className="flex items-center gap-3 text-lg hover:translate-x-1 transition-transform">
                <Mail className="shrink-0" />{slide.contact.email}
              </a>
              <a href={`https://${slide.contact.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-lg hover:translate-x-1 transition-transform">
                <Monitor className="shrink-0" />{slide.contact.url}
              </a>
            </div>
            
              href="mailto:info@roamsix.com?subject=Partnership Fit Call Request"
              className="w-full bg-white text-black py-4 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all"
            >
              Request a Fit Call <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/10 rounded-full"><ShieldCheck className="w-10 h-10" /></div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">ROAMSIX</h1>
            <p className="text-white/40 font-medium">Partnership Ecosystem 2026</p>
          </div>
          <form onSubmit={validateAccess} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" required placeholder="Work Email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 py-3.5 px-11 rounded-xl focus:outline-none focus:border-white transition-all text-sm" />
              </div>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" required placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 py-3.5 px-11 rounded-xl focus:outline-none focus:border-white transition-all text-sm" />
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" required placeholder="Access Code" value={accessCode}
                  onChange={(e) => { setAccessCode(e.target.value); setError(''); }}
                  className="w-full bg-white/5 border border-white/10 py-3.5 px-11 rounded-xl focus:outline-none focus:border-white transition-all uppercase tracking-widest text-sm" />
              </div>
            </div>
            {error && (
              <p className="text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />{error}
              </p>
            )}
            <button type="submit" disabled={isLoading}
              className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Enter Deck <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>
          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-white/30 text-xs mb-3">No access code?</p>
            <a href="mailto:info@roamsix.com?subject=Requesting Partnership Access Code"
              className="inline-flex items-center gap-2 text-xs font-bold border border-white/20 py-3 px-6 rounded-full hover:bg-white/5 transition-all">
              Request Strategic Access
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {!isMobile && (
        <div className="w-full h-1 bg-white/10">
          <div className="h-full bg-white transition-all duration-500"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }} />
        </div>
      )}
      <div className={`flex-1 flex flex-col ${isMobile ? 'overflow-y-auto px-6' : 'justify-center px-8 md:px-24 py-12 max-w-7xl mx-auto w-full relative overflow-hidden'}`}>
        {isMobile ? (
          <div className="space-y-4">
            <div className="pt-8 pb-4 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-50">
              <span className="font-black tracking-tighter">ROAMSIX '26</span>
              <div className="flex items-center gap-4">
                <button onClick={handleLogout} className="text-[10px] uppercase tracking-widest opacity-40">Exit</button>
                <div className="p-2 bg-white/10 rounded-lg"><Smartphone className="w-4 h-4" /></div>
              </div>
            </div>
            {slides.map((s, i) => renderSlide(s, i))}
            <div className="py-12 text-center opacity-20 text-xs tracking-widest">END OF PRESENTATION</div>
          </div>
        ) : (
          <>
            {renderSlide(slides[currentSlide], currentSlide)}
            <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-0">
              <div className="flex gap-3">
                <button onClick={() => setCurrentSlide(p => Math.max(p - 1, 0))} disabled={currentSlide === 0}
                  className={`p-4 rounded-full border transition-all ${currentSlide === 0 ? 'opacity-10 cursor-not-allowed' : 'hover:bg-white/10 border-white/20'}`}>
                  <ChevronLeft />
                </button>
                <button onClick={() => setCurrentSlide(p => Math.min(p + 1, slides.length - 1))} disabled={currentSlide === slides.length - 1}
                  className={`p-4 rounded-full border transition-all ${currentSlide === slides.length - 1 ? 'opacity-10 cursor-not-allowed' : 'hover:bg-white/10 border-white/20'}`}>
                  <ChevronRight />
                </button>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-sm font-mono opacity-30">{currentSlide + 1} / {slides.length}</span>
                <div className="h-4 w-px bg-white/20" />
                <button onClick={handleLogout} className="text-xs uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity font-bold">Exit</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
