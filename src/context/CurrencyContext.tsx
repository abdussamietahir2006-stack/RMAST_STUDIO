import React, { createContext, useContext, useState } from 'react';
import { Currency } from '../types';
import { USD_TO_AED_RATE, formatPrice, formatHourlyRate } from '../data/pricingData';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  format: (usdAmount: number) => string;
  formatHourly: (rate: { min: number; max: number }) => string;
  usdToAed: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always USD: the site no longer has a currency switch, so an AED choice saved by an older version is ignored
  const [currency, setCurrencyState] = useState<Currency>('USD');

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

  const formatHourly = (rate: { min: number; max: number }): string => formatHourlyRate(rate, currency);

  const usdToAed = (usdAmount: number): number => {
    return Math.round(usdAmount * USD_TO_AED_RATE);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency, format, formatHourly, usdToAed }}>
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
