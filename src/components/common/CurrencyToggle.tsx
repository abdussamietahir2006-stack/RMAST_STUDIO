import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

interface CurrencyToggleProps {
  className?: string;
}

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ className = '' }) => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      role="group"
      aria-label="Currency selector"
      className={`inline-flex items-center p-1 rounded-sm border border-line bg-surface text-xs font-mono tracking-wider ${className}`}
    >
      <button
        type="button"
        onClick={() => setCurrency('USD')}
        className={`px-3 py-1 transition-all duration-200 cursor-pointer ${
          currency === 'USD'
            ? 'bg-primary text-on-primary font-semibold'
            : 'text-muted hover:text-fg'
        }`}
        aria-pressed={currency === 'USD'}
      >
        USD
      </button>
      <button
        type="button"
        onClick={() => setCurrency('AED')}
        className={`px-3 py-1 transition-all duration-200 cursor-pointer ${
          currency === 'AED'
            ? 'bg-primary text-on-primary font-semibold'
            : 'text-muted hover:text-fg'
        }`}
        aria-pressed={currency === 'AED'}
      >
        AED
      </button>
    </div>
  );
};
