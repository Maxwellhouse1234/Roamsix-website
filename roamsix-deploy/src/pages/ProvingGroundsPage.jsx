import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ProvingGroundsPage() {
  const [showFAQ, setShowFAQ] = React.useState(null);

  const stations = [
    { name: 'Terrain', description: 'Load progression on natural elevation' },
    { name: 'Strength', description: 'Output measured against time' },
    { name: 'Engine', description: 'Conditioning and pacing under fatigue' },
    { name: 'Control', description: 'Movement quality when tired' },
    { name: 'Power', description: 'Load management in a fixed window' },
    { name: 'Grit', description: 'Surprise challenge revealed on event day (highest points)' }
  ];

  const pricing = [
    { weeks: '4 weeks out', price: 300 },
    { weeks: '3 weeks out', price: 350 },
    { weeks: '2 weeks out', price: 400 },
    { weeks: '1 week out', price: 450 },
    { weeks: 'Event week', price: 500 }
  ];

  const faqs = [
    {
      q: 'Who can compete?',
      a: 'Independent trainers, small gym owners, specialty coaches, and remote trainers with three clients willing to compete alongside them.'
    },
    {
      q: "What's Station 6?",
      a: 'The final challenge is revealed on event day. It tests adaptability and mental resilience. Carries the highest point value.'
    },
    {
      q: 'Is this event recurring?',
      a: "This is the inaugural Proving Grounds. If there's demand, we'll build a national tour. The first event sets the benchmark."
    },
    {
      q: "What if my clients aren't elite athletes?",
      a: "This event measures progress and capability. If you've trained your clients well, they're ready."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 opacity-5 fixed">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <Link to="/" className="absolute top-8 left-8 text-gray-400 hover:text-gray-300 transition-colors text-sm tracking-wider">
          ← ROAMSIX
        </Link>

        <div className="max-w-4xl text-center animate-fadeIn">
          <h1 className="text-5xl md:text-7xl font-light tracking-[0.25em] text-gray-200 mb-8 leading-tight" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            You've been transforming clients for years.<br/>
            Now compete in the arena that matters.
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
            One day. Six performance stations. 140 acres of California high desert.<br/>
            24 teams. Inaugural event.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/proving-grounds/register"
              className="bg-gray-200 hover:bg-white text-black py-4 px-10 text-sm tracking-[0.2em] uppercase transition-all duration-500"
            >
              Register Your Team
            </Link>
            <a 
              href="#format"
              className="text-gray-400 hover:text-gray-300 text-sm tracking-[0.15em] uppercase transition-colors flex items-center gap-2"
            >
              How it works
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* What This Is */}
      <section className="relative py-24 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-gray-200 mb-12" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            What This Is
          </h2>
          <div className="space-y-6 text-lg text-gray-300 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
            <p>
              Independent trainers build programs that change lives. Your clients invest in you because they know what real coaching delivers.
            </p>
            <p>
              This event measures that work. You and three of your clients compete together across six performance stations. Results are recorded and published.
            </p>
            <p className="text-gray-400">
              The first event sets the standard for everything that follows.
            </p>
          </div>
        </div>
      </section>

      {/* The Format */}
      <section id="format" className="relative py-24 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-gray-200 mb-12" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            The Format
          </h2>

          <div className="mb-12">
            <div className="inline-block bg-gray-900 border border-gray-700 px-6 py-3 mb-8">
              <p className="text-gray-300 text-lg">
                <strong>Teams of 4:</strong> 1 coach + 3 clients
              </p>
            </div>
          </div>

          <h3 className="text-2xl text-gray-300 mb-8 tracking-wide" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            Six Stations:
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {stations.map((station, index) => (
              <div 
                key={index}
                className="bg-gray-900 border border-gray-700 p-6 hover:border-gray-500 transition-colors duration-300"
              >
                <h4 className="text-xl text-gray-200 mb-2 font-light tracking-wide" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                  {station.name}
                </h4>
                <p className="text-gray-400 text-sm">{station.description}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-400 text-center italic">
            Results are scored by team and published after the event.
          </p>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="relative py-24 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-gray-200 mb-12" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            Why It Matters
          </h2>
          <div className="space-y-6 text-lg text-gray-300 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
            <p>
              Your clients chose you because they wanted programs built for them. They invested time and money into training that delivers real capability.
            </p>
            <p>
              This event measures that investment. You compete alongside them. The terrain and the clock reveal what you've built together.
            </p>
          </div>
        </div>
      </section>

      {/* Recovery Access */}
      <section className="relative py-24 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-gray-200 mb-12" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            Recovery Access
          </h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
            Between waves and during breaks, athletes have access to on-site recovery:
          </p>
          <div className="bg-gray-900 border border-gray-700 p-8">
            <p className="text-gray-300 text-base leading-relaxed">
              Massage, muscle activation, chiropractic, IV therapy, cold therapy, breathwork, stretching, hydration, performance nutrition.
            </p>
            <p className="text-gray-400 mt-4 text-sm">Included with registration.</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="relative py-24 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-gray-200 mb-12" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            What's Included
          </h2>

          <div className="mb-8">
            <h3 className="text-xl text-gray-300 mb-6">Registration covers:</h3>
            <ul className="space-y-3">
              {[
                'Entry for your team of 4',
                'Team performance results',
                'Recovery services access',
                'Athlete kits',
                'National leaderboard placement'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 bg-gray-500 mt-2.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-700 p-6 mt-8">
            <h3 className="text-lg text-gray-300 mb-3">Optional add-on:</h3>
            <p className="text-gray-400">
              Professional content package (photos and video across all stations)
            </p>
          </div>
        </div>
      </section>

      {/* Investment */}
      <section className="relative py-24 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-gray-200 mb-12 text-center" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            Investment
          </h2>

          <div className="max-w-2xl mx-auto space-y-4 mb-8">
            {pricing.map((tier, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-900 border border-gray-700 p-5">
                <span className="text-gray-300 tracking-wide">{tier.weeks}</span>
                <span className="text-gray-200 text-xl font-light">${tier.price} per team</span>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4 mb-12">
            <p className="text-gray-400 text-sm">
              Price increases $50 weekly. Early commitment gets rewarded.
            </p>
            <p className="text-gray-400 text-sm">
              <strong>Capacity:</strong> 24 teams. Registration closes when filled.
            </p>
          </div>

          <div className="text-center">
            <Link 
              to="/proving-grounds/register"
              className="inline-block bg-gray-200 hover:bg-white text-black py-5 px-12 text-sm tracking-[0.2em] uppercase transition-all duration-500"
            >
              Register Your Team
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-24 px-6 border-t border-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-gray-200 mb-12" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            FAQ
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-800">
                <button
                  onClick={() => setShowFAQ(showFAQ === i ? null : i)}
                  className="w-full text-left py-5 flex justify-between items-center group"
                >
                  <span className="text-lg text-gray-300 group-hover:text-gray-200 transition-colors">
                    {faq.q}
                  </span>
                  <span className="text-gray-500 text-2xl">{showFAQ === i ? '−' : '+'}</span>
                </button>
                {showFAQ === i && (
                  <div className="pb-6 text-gray-400 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-6 border-t border-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-2xl text-gray-300 mb-8 leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
            Inaugural event. Limited capacity. Early registration rewarded.
          </p>
          <Link 
            to="/proving-grounds/register"
            className="inline-block bg-gray-200 hover:bg-white text-black py-5 px-12 text-sm tracking-[0.2em] uppercase transition-all duration-500"
          >
            Register Your Team
          </Link>
        </div>
      </section>

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
