import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency } from '../types';
import { USD_TO_AED_RATE, formatPrice } from '../data/pricingData';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  format: (usdAmount: number) => string;
  usdToAed: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const saved = localStorage.getItem('rmast_currency') as Currency;
    if (saved === 'USD' || saved === 'AED') {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('rmast_currency', c);
  };

  const toggleCurrency = () => {
    const next = currency === 'USD' ? 'AED' : 'USD';
    setCurrency(next);
  };

  const format = (usdAmount: number): string => {
    return formatPrice(usdAmount, currency);
  };

  const usdToAed = (usdAmount: number): number => {
    return Math.round(usdAmount * USD_TO_AED_RATE);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency, format, usdToAed }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
