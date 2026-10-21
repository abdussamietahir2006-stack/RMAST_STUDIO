import React, { createContext, useContext, useState } from 'react';
import { InquiryTarget } from '../types';

interface InquiryContextType {
  isInquiryOpen: boolean;
  activeTarget: InquiryTarget | null;
  openInquiry: (target: InquiryTarget) => void;
  closeInquiry: () => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export const InquiryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState<InquiryTarget | null>(null);

  const openInquiry = (target: InquiryTarget) => {
    setActiveTarget(target);
    setIsInquiryOpen(true);
  };

  const closeInquiry = () => {
    setIsInquiryOpen(false);
  };

  return (
    <InquiryContext.Provider value={{ isInquiryOpen, activeTarget, openInquiry, closeInquiry }}>
      {children}
    </InquiryContext.Provider>
  );
};

export const useInquiry = () => {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
};
