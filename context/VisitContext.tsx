import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Visit, VisitStatus, VisitType } from '../types';

// Initial Mock Data - Expanded to have a pool of pending visits, including assignments for the Mobile User (Ing. Juan Martinez)
const initialVisits: Visit[] = [
  { 
      id: 'v1', code: 'VIS-25-101', producerId: '1', producerName: 'Juan Pérez', farmName: 'La Esperanza', date: '2025-10-27', 
      type: VisitType.PRE_CREDITO, status: VisitStatus.PENDIENTE_GESTION, technician: 'Ing. Mendez',
      visitSource: 'Solicitud', visitMode: 'Presencial', recommendedInputs: [],
      relatedCode: 'SOL-2025-001', relatedType: 'Solicitud'
  },
  { 
      id: 'v2', code: 'VIS-25-098', producerId: '2', producerName: 'Agro El Sol', farmName: 'Hato Grande', date: '2025-10-26', 
      type: VisitType.SEGUIMIENTO, status: VisitStatus.PENDIENTE_GESTION, technician: 'Ing. Mendez', 
      authorizeDelivery: false, authorizeLabor: true, creditId: 'cr2', visitMode: 'Presencial', visitSource: 'Ruta',
      terrainStatus: 'Preparado',
      aiDiagnosis: {
          condition: 'Pyricularia', confidence: 88, severity: 'Media', priority: 'Alta', 
          estimatedCost: '$45/ha', recommendation: 'Aplicar fungicida sistémico.'
      },
      recommendedInputs: [
          // Added missing required property category
          { id: 'ri1', product: 'Urea', category: 'Fertilizante', quantity: 400, unit: 'kg', source: 'Aproscello', status: 'Pendiente' },
          { id: 'ri2', product: 'Fungicida X', category: 'Fungicida', quantity: 5, unit: 'lt', source: 'Alianza', status: 'Aprobado' },
          { id: 'ri3', product: 'Herbicida Z', category: 'Herbicida', quantity: 10, unit: 'lt', source: 'Propio', status: 'Aprobado' }
      ],
      relatedCode: 'CR-2025-882', relatedType: 'Apoyo'
  },
  {
      id: 'v3', code: 'VIS-25-102', producerId: '3', producerName: 'Maria Rodriguez', farmName: 'Parcela 45', date: '2025-10-27',
      type: VisitType.CAMPO_SEMILLA, status: VisitStatus.EN_PROCESO, technician: 'Ing. Ruiz',
      visitMode: 'Presencial', visitSource: 'Plan', recommendedInputs: [],
      relatedCode: 'SEM-2025-012', relatedType: 'Plan'
  },
  // Visits for "Ing. Juan Martinez" (Mobile User)
  { id: 'v4', code: 'VIS-25-103', producerId: '4', producerName: 'Pedro Sanchez', farmName: 'Los Andes', date: '2025-10-28', type: VisitType.SEGUIMIENTO, status: VisitStatus.PLANIFICADA, technician: 'Ing. Juan Martinez', visitMode: 'Presencial', relatedCode: 'SOL-25-004' },
  { id: 'v5', code: 'VIS-25-104', producerId: '5', producerName: 'Luisa M.', farmName: 'El Recreo', date: '2025-10-29', type: VisitType.EVALUACION_INICIAL, status: VisitStatus.PLANIFICADA, technician: 'Ing. Juan Martinez', visitMode: 'Presencial', relatedCode: 'SOL-25-009' },
  { id: 'v6', code: 'VIS-25-105', producerId: '6', producerName: 'Carlos T.', farmName: 'La Veguita', date: '2025-10-29', type: VisitType.PRE_CREDITO, status: VisitStatus.PENDIENTE_GESTION, technician: 'Ing. Juan Martinez', visitMode: 'Presencial' },
  { id: 'v7', code: 'VIS-25-106', producerId: '7', producerName: 'Ana G.', farmName: 'Santa Inés', date: '2025-10-30', type: VisitType.SEGUIMIENTO, status: VisitStatus.PENDIENTE_GESTION, technician: 'Ing. Juan Martinez', visitMode: 'Presencial' },
  { id: 'v8', code: 'VIS-25-107', producerId: '8', producerName: 'Roberto B.', farmName: 'Las Majaguas', date: '2025-10-30', type: VisitType.CAMPO_SEMILLA, status: VisitStatus.PLANIFICADA, technician: 'Ing. Juan Martinez', visitMode: 'Presencial' },
];

interface VisitContextType {
  visits: Visit[];
  addVisit: (visit: Visit) => void;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  getVisitById: (id: string) => Visit | undefined;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

export const VisitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visits, setVisits] = useState<Visit[]>(initialVisits);

  const addVisit = (visit: Visit) => {
    setVisits(prev => [visit, ...prev]);
  };

  const updateVisit = (id: string, updates: Partial<Visit>) => {
    setVisits(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const getVisitById = (id: string) => {
    return visits.find(v => v.id === id);
  };

  return (
    <VisitContext.Provider value={{ visits, addVisit, updateVisit, getVisitById }}>
      {children}
    </VisitContext.Provider>
  );
};

export const useVisits = () => {
  const context = useContext(VisitContext);
  if (context === undefined) {
    throw new Error('useVisits must be used within a VisitProvider');
  }
  return context;
};