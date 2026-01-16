import React, { createContext, useState, useContext, ReactNode } from 'react';
import { SupportPattern } from '../types';

// Initial Mock Data (Robust structure used in DesktopConfig)
const initialPatterns: SupportPattern[] = [
    { 
        id: 'p1', name: 'Arroz Consumo - Invierno 2025', cycle: 'Invierno 2025', cropName: 'Arroz', cropIds: ['c2'], projectType: 'Consumo', adminFeePercent: 10, status: 'Activo',
        financingCap: 1500, globalBudget: 100000,
        stages: [
            { id: 'st1', name: 'Recepción Solicitudes', order: 1, deadlineDays: 10, requiresVisit: false },
            { id: 'st2', name: 'Validación Documentos', order: 2, deadlineDays: 5, requiresVisit: false },
            { id: 'st3', name: 'Visita Evaluación', order: 3, deadlineDays: 7, requiresVisit: true, visitCount: 1, visitFrequency: 'Unica' },
            { id: 'st4', name: 'Comité de Crédito', order: 4, deadlineDays: 5, requiresVisit: false },
            { id: 'st5', name: 'Formalización', order: 5, deadlineDays: 5, requiresVisit: false },
            { id: 'st6', name: 'Ejecución (Siembra)', order: 6, deadlineDays: 120, requiresVisit: true, visitCount: 12, visitFrequency: 'Semanal' },
            { id: 'st7', name: 'Cierre y Cobranza', order: 7, deadlineDays: 30, requiresVisit: false },
        ],
        lines: [
            { id: 'l1', product: 'Urea Granulada', category: 'Insumo', standardQty: 250, unit: 'kg', unitCost: 0.8, totalCost: 200, type: 'Fertilizante', inputId: 'i1' },
            { id: 'l2', product: 'Semilla Arroz', category: 'Insumo', standardQty: 120, unit: 'kg', unitCost: 1.5, totalCost: 180, type: 'Semilla' }
        ],
        subTypes: [
            { id: 'stype1', name: 'Paquete Completo', description: 'Incluye Semilla y Fertilizantes', includedLineIds: ['l1', 'l2'], calculatedCostPerHa: 418 },
            { id: 'stype2', name: 'Solo Fertilizantes', description: 'Solo Urea', includedLineIds: ['l1'], calculatedCostPerHa: 220 }
        ],
        committeeIds: ['cm1', 'cm2'],
        requiredDocumentIds: ['d1', 'd2', 'd4'],
        associatedPartners: [
            { partnerId: 'p2', stageId: 'st6' }
        ],
        validityStart: '2025-09-01',
        validityEnd: '2026-03-02',
        plannedVisitsCount: 4
    },
    { 
        id: 'p2', name: 'Arroz Semilla - Invierno 2025', cycle: 'Invierno 2025', cropName: 'Arroz', cropIds: ['c1'], projectType: 'Semilla', adminFeePercent: 12, status: 'Activo',
        financingCap: 1800, globalBudget: 50000,
        stages: [],
        lines: [],
        subTypes: [
             { id: 'stype3', name: 'Fundación', description: 'Alta pureza', includedLineIds: [], calculatedCostPerHa: 600 }
        ],
        committeeIds: [],
        requiredDocumentIds: [],
        // Fix: Added missing associatedPartners property
        associatedPartners: []
    }
];

interface PatternContextType {
  patterns: SupportPattern[];
  addPattern: (pattern: SupportPattern) => void;
  updatePattern: (id: string, updates: Partial<SupportPattern>) => void;
  getPatternById: (id: string) => SupportPattern | undefined;
}

const PatternContext = createContext<PatternContextType | undefined>(undefined);

export const PatternProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patterns, setPatterns] = useState<SupportPattern[]>(initialPatterns);

  const addPattern = (pattern: SupportPattern) => {
    setPatterns(prev => [...prev, pattern]);
  };

  const updatePattern = (id: string, updates: Partial<SupportPattern>) => {
    setPatterns(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const getPatternById = (id: string) => {
    return patterns.find(p => p.id === id);
  };

  return (
    <PatternContext.Provider value={{ patterns, addPattern, updatePattern, getPatternById }}>
      {children}
    </PatternContext.Provider>
  );
};

export const usePatterns = () => {
  const context = useContext(PatternContext);
  if (context === undefined) {
    throw new Error('usePatterns must be used within a PatternProvider');
  }
  return context;
};