import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mountain, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-20 text-center animate-fadeIn">
          <h1 className="text-7xl md:text-9xl font-light tracking-[0.3em] text-gray-200 mb-6" style={{fontFamily: 'Cormorant Garamond, serif'}}>
            ROAMSIX
          </h1>
          <div className="h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-30 mb-8" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
            Experiences built for moments of redirection
          </p>
        </div>

        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 animate-fadeIn" style={{animationDelay: '0.3s'}}>
          <Link 
            to="/retreat"
            className="group relative bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 p-12 md:p-16 transition-all duration-700 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="mb-8">
                <Mountain className="w-12 h-12 text-gray-400 group-hover:text-gray-300 transition-colors duration-500" />
              </div>

              <h2 className="text-4xl font-light tracking-[0.15em] text-gray-200 mb-4 group-hover:tracking-[0.2em] transition-all duration-500" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                3-Day Retreat
              </h2>

              <p className="text-gray-400 mb-8 text-base leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
                High desert. Small cohorts. Structured challenge for individuals, teams, and families navigating significant transitions.
              </p>

              <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 group-hover:gap-4 transition-all duration-500">
                <span className="text-xs tracking-[0.15em] uppercase">Apply Now</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link 
            to="/proving-grounds"
            className="group relative bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 p-12 md:p-16 transition-all duration-700 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="mb-8">
                <Trophy className="w-12 h-12 text-gray-400 group-hover:text-gray-300 transition-colors duration-500" />
              </div>

              <h2 className="text-4xl font-light tracking-[0.15em] text-gray-200 mb-4 group-hover:tracking-[0.2em] transition-all duration-500" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                Proving Grounds
              </h2>

              <p className="text-gray-400 mb-8 text-base leading-relaxed" style={{fontFamily: 'Crimson Text, serif'}}>
                One day. Six stations. Coaches compete alongside their clients. The inaugural competition that measures what you've built together.
              </p>

              <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 group-hover:gap-4 transition-all duration-500">
                <span className="text-xs tracking-[0.15em] uppercase">Register Team</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center text-xs text-gray-600 tracking-wide animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <p>Both experiences powered by ROAMSIX</p>
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
