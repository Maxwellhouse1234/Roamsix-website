import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ProvingGroundsPage() {
  const stations = [
    { name: 'Terrain', description: 'Load progression on natural elevation' },
    { name: 'Strength', description: 'Output measured against time' },
    { name: 'Engine', description: 'Conditioning and pacing under fatigue' },
    { name: 'Control', description: 'Movement quality when tired' },
    { name: 'Power', description: 'Load management in a fixed window' },
    { name: 'Grit', description: 'Surprise challenge revealed on event day (highest points)' }
  ];

  const recoveryServices = [
    'Massage therapy',
    'Chiropractic care', 
    'IV therapy',
    'Cold therapy',
    'Breathwork sessions',
    'Nutrition consultation'
  ];

  const faqs = [
    {
      question: 'When and where is the event?',
      answer: 'The inaugural Proving Grounds will be held on 140 acres of California high desert. Specific date and location details will be provided upon registration.'
    },
    {
      question: 'What level of fitness is required?',
      answer: 'Teams should be prepared for a full day of varied physical challenges. Coaches should assess their clients\' readiness and ensure all team members can safely participate in demanding outdoor activities.'
    },
    {
      question: 'What is included in the registration fee?',
      answer: 'Registration includes team entry for all six stations, recovery access throughout the day, athlete welcome kits, results tracking, and post-event leaderboard publication.'
    },
    {
      question: 'How does team scoring work?',
      answer: 'Results are scored by team and published after the event. Each station contributes to your team\'s overall performance, with the Grit station offering the highest point value.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-wide leading-tight mb-8 text-gray-100">
            You've been transforming clients for years. Now compete in the arena that matters.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-6 max-w-4xl mx-auto leading-relaxed">
            One day. Six performance stations. 140 acres of California high desert.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/proving-grounds/coach-register"
              className="bg-gray-100 hover:bg-white text-black px-10 py-5 text-lg tracking-wider uppercase transition-all duration-300"
            >
              Register Your Team
            </Link>
            
              href="#format"
              className="text-gray-300 hover:text-white flex items-center gap-2 text-lg tracking-wider uppercase transition-colors"
            >
              How It Works
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* The Format Section */}
      <section id="format" className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-6 text-gray-100">
            The Format
          </h2>
          
          <div className="bg-gray-900 border border-gray-800 inline-block px-8 py-4 mb-16">
            <p className="text-xl md:text-2xl text-gray-300">
              Teams of 4: <span className="text-gray-100">1 coach + 3 clients</span>
            </p>
          </div>

          {/* Image Placeholder - Desert Landscape */}
          <div className="mb-16 aspect-video bg-gray-900 border border-gray-800 flex items-center justify-center">
            <p className="text-gray-600 text-lg">[ Desert Landscape Image ]</p>
          </div>

          <h3 className="text-3xl md:text-4xl font-light tracking-wide mb-10 text-gray-200">
            Six Stations:
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {stations.map((station, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 p-8">
                <h4 className="text-2xl md:text-3xl font-light mb-3 text-gray-100">
                  {station.name}
                </h4>
                <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                  {station.description}
                </p>
              </div>
            ))}
          </div>

          {/* Image Placeholder - Training/Competition */}
          <div className="mb-10 aspect-video bg-gray-900 border border-gray-800 flex items-center justify-center">
            <p className="text-gray-600 text-lg">[ Competition Action Image ]</p>
          </div>

          <p className="text-lg md:text-xl text-gray-400 italic text-center leading-relaxed">
            Results are scored by team and published after the event.
          </p>
        </div>
      </section>

      {/* The Reality Section (formerly Why It Matters) */}
      <section className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-12 text-gray-100">
            The Reality
          </h2>

          {/* Image Placeholder - Coaches/Athletes */}
          <div className="mb-12 aspect-video bg-gray-900 border border-gray-800 flex items-center justify-center">
            <p className="text-gray-600 text-lg">[ Coach/Team Image ]</p>
          </div>

          <div className="space-y-8 text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl">
            <p>
              Your clients chose you because they wanted programs built for them. They invested time and money into training that delivers real capability.
            </p>
            <p>
              This event measures that investment. You compete alongside them. The terrain and the clock reveal what you've built together.
            </p>
          </div>
        </div>
      </section>

      {/* Recovery Access Section */}
      <section className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-12 text-gray-100">
            Recovery Access
          </h2>

          {/* Image Placeholder - Recovery Services */}
          <div className="mb-12 aspect-video bg-gray-900 border border-gray-800 flex items-center justify-center">
            <p className="text-gray-600 text-lg">[ Recovery/Wellness Image ]</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {recoveryServices.map((service, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 p-6">
                <p className="text-xl md:text-2xl text-gray-200">
                  {service}
                </p>
              </div>
            ))}
          </div>

          <p className="text-lg md:text-xl text-gray-400 text-center leading-relaxed">
            Available throughout the day for all participants
          </p>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-12 text-gray-100">
            What's Included
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gray-900 border border-gray-800 p-8">
              <h3 className="text-2xl md:text-3xl font-light mb-4 text-gray-100">
                Team Entry
              </h3>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Full access to all six performance stations for your team of four
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-8">
              <h3 className="text-2xl md:text-3xl font-light mb-4 text-gray-100">
                Results & Leaderboard
              </h3>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Team scoring tracked throughout the day, published after the event
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-8">
              <h3 className="text-2xl md:text-3xl font-light mb-4 text-gray-100">
                Recovery Services
              </h3>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Full-day access to massage, chiropractic, IV therapy, and more
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-8">
              <h3 className="text-2xl md:text-3xl font-light mb-4 text-gray-100">
                Athlete Kits
              </h3>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Welcome package for each team member
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-12 text-gray-100">
            Investment
          </h2>

          <div className="bg-gray-900 border border-gray-800 p-10 mb-8 max-w-3xl mx-auto">
            <div className="space-y-6 text-xl md:text-2xl text-gray-300">
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <span>4+ weeks out</span>
                <span className="text-gray-100 font-light">$300</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <span>3 weeks out</span>
                <span className="text-gray-100 font-light">$350</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <span>2 weeks out</span>
                <span className="text-gray-100 font-light">$400</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <span>1 week out</span>
                <span className="text-gray-100 font-light">$450</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Event week</span>
                <span className="text-gray-100 font-light">$500</span>
              </div>
            </div>
          </div>

          <p className="text-lg md:text-xl text-gray-400 text-center mb-12 leading-relaxed">
            Price increases $50 per team each week as the event approaches
          </p>

          <div className="text-center">
            <Link
              to="/proving-grounds/coach-register"
              className="inline-block bg-gray-100 hover:bg-white text-black px-12 py-6 text-xl tracking-wider uppercase transition-all duration-300"
            >
              Register Your Team
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-light tracking-wide mb-16 text-gray-100">
            Questions
          </h2>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-800 pb-8">
                <h3 className="text-2xl md:text-3xl font-light mb-4 text-gray-100">
                  {faq.question}
                </h3>
                <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-light tracking-wide mb-12 text-gray-100 leading-tight">
            Ready to compete?
          </h2>
          <Link
            to="/proving-grounds/coach-register"
            className="inline-block bg-gray-100 hover:bg-white text-black px-12 py-6 text-xl tracking-wider uppercase transition-all duration-300"
          >
            Register Your Team
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800 text-center">
        <p className="text-base md:text-lg text-gray-600">
          Powered by ROAMSIX
        </p>
      </footer>
    </div>
  );
}
