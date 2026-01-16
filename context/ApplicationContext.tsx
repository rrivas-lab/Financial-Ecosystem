
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { CreditApplication, CreditApplicationStatus } from '../types';

// Initial Mock Data moved from DesktopApplications
const initialApplications: CreditApplication[] = [
  { 
    id: '1', code: 'SOL-2025-001', producerName: 'Juan Pérez', farmName: 'La Esperanza', type: 'Consumo', amount: 4500, hectares: 20, status: 'Pre-Aprobada', date: '2025-10-25', projectType: 'Consumo', patternName: 'Arroz Consumo - Invierno 2025', patternId: 'p1',
    documents: [
        { id: 'd1', name: 'CI / RIF', required: true, status: 'Cargado' },
        { id: 'd2', name: 'Título Propiedad', required: true, status: 'Pendiente' }
    ]
  },
  { 
    id: '2', code: 'SOL-2025-005', producerName: 'Agropecuaria El Sol C.A.', farmName: 'Hato Grande', type: 'Consumo', amount: 12000, hectares: 50, status: 'Documentacion', date: '2025-10-20', projectType: 'Consumo', patternName: 'Arroz Consumo - Invierno 2025', patternId: 'p1',
    documents: [{ id: 'd1', name: 'Acta Constitutiva', required: true, status: 'Validado' }]
  },
  { 
    id: '3', code: 'SOL-2025-008', producerName: 'Maria Rodriguez', farmName: 'Parcela 45', type: 'Semilla', amount: 3000, hectares: 10, status: 'Visita_Evaluacion', date: '2025-10-22', projectType: 'Semilla', patternName: 'Arroz Semilla - Invierno 2025', patternId: 'p2',
    documents: [{ id: 'd1', name: 'CI', required: true, status: 'Validado' }]
  }
];

interface ApplicationContextType {
  applications: CreditApplication[];
  addApplication: (app: CreditApplication) => void;
  updateApplication: (id: string, updates: Partial<CreditApplication>) => void;
  getApplicationById: (id: string) => CreditApplication | undefined;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<CreditApplication[]>(initialApplications);

  const addApplication = (app: CreditApplication) => {
    setApplications(prev => [app, ...prev]);
  };

  const updateApplication = (id: string, updates: Partial<CreditApplication>) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, ...updates } : app));
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  return (
    <ApplicationContext.Provider value={{ applications, addApplication, updateApplication, getApplicationById }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within a ApplicationProvider');
  }
  return context;
};
