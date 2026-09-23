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
      className={`inline-flex items-center p-1 rounded-sm border border-[#27272a] bg-[#111114] text-xs font-mono tracking-wider ${className}`}
    >
      <button
        type="button"
        onClick={() => setCurrency('USD')}
        className={`px-2.5 py-1 transition-all duration-200 cursor-pointer ${
          currency === 'USD'
            ? 'bg-[#C9A96E] text-[#0A0A0C] font-semibold'
            : 'text-[#9A9892] hover:text-[#FAF8F5]'
        }`}
        aria-pressed={currency === 'USD'}
      >
        USD
      </button>
      <button
        type="button"
        onClick={() => setCurrency('AED')}
        className={`px-2.5 py-1 transition-all duration-200 cursor-pointer ${
          currency === 'AED'
            ? 'bg-[#C9A96E] text-[#0A0A0C] font-semibold'
            : 'text-[#9A9892] hover:text-[#FAF8F5]'
        }`}
        aria-pressed={currency === 'AED'}
      >
        AED
      </button>
    </div>
  );
};
