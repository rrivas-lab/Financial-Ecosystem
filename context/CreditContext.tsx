
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Credit } from '../types';

// Initial Mock Data from previous DesktopFinancing
const initialCredits: Credit[] = [
  { 
      id: 'CR-2025-001', producerName: 'Juan Pérez', farmName: 'La Esperanza', supportType: 'Apoyo Arroz', projectType: 'Consumo', 
      amountApproved: 5000, amountConsumed: 1500, amountAvailable: 3500, status: 'Activo', cycle: 'Invierno 2025',
      disbursements: [
          { id: 'g1', date: '2025-10-01', amount: 500, reference: 'TRF-1234', purpose: 'Preparación de Suelos', status: 'Procesado' }
      ],
      totalDisbursed: 500,
      totalDelivered: 1000
  },
  { 
      id: 'CR-2025-002', producerName: 'Agro El Sol', farmName: 'Hato Grande', supportType: 'Apoyo Maíz', projectType: 'Semilla', 
      amountApproved: 8000, amountConsumed: 8000, amountAvailable: 0, status: 'Liquidado', cycle: 'Invierno 2025',
      disbursements: [],
      totalDisbursed: 2000,
      totalDelivered: 6000
  }
];

interface CreditContextType {
  credits: Credit[];
  addCredit: (credit: Credit) => void;
  updateCredit: (id: string, updates: Partial<Credit>) => void;
  getCreditById: (id: string) => Credit | undefined;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [credits, setCredits] = useState<Credit[]>(initialCredits);

  const addCredit = (credit: Credit) => {
    setCredits(prev => [credit, ...prev]);
  };

  const updateCredit = (id: string, updates: Partial<Credit>) => {
    setCredits(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const getCreditById = (id: string) => {
    return credits.find(c => c.id === id);
  };

  return (
    <CreditContext.Provider value={{ credits, addCredit, updateCredit, getCreditById }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};
