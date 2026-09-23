import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="pt-40 pb-24 px-6 md:px-10 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8 text-center">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E]">Error 404</span>
        <h1 className="font-serif text-5xl sm:text-7xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight">
          This page <span className="italic font-light text-[#C9A96E]">doesn't exist.</span>
        </h1>
        <p className="text-lg text-[#A1A1AA] leading-relaxed font-light">
          The link may be outdated or mistyped. Head back to the studio or browse our services.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#D9B97E] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <button
            onClick={() => navigate('/services')}
            className="w-full sm:w-auto px-8 py-4 border border-[#27272A] text-[#FAF8F5] hover:border-[#C9A96E] text-xs font-semibold uppercase tracking-[0.18em] transition-all cursor-pointer"
          >
            Browse Services
          </button>
        </div>
      </div>
    </div>
  );
};
