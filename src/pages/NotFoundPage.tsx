import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="pt-30 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8 text-center">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">Error 404</span>
        <h1 className="type-h1 text-fg">
          This page <span className="italic font-light text-brand">doesn't exist.</span>
        </h1>
        <p className="text-lg text-muted leading-relaxed font-light">
          The link may be outdated or mistyped. Head back to the studio or browse our services.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <button
            onClick={() => navigate('/services')}
            className="btn btn-secondary w-full sm:w-auto cursor-pointer"
          >
            Browse Services
          </button>
        </div>
      </div>
    </div>
  );
};
