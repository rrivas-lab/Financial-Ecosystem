
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { RoutePlan, RouteDay } from '../types';

// Moved Mock Data here to be shared globally
const initialPlans: RoutePlan[] = [
    {
        id: 'PLAN-2025-080',
        startDate: '2025-10-20',
        endDate: '2025-10-24',
        technicianId: 'Ing. Mendez',
        status: 'Finalizado',
        days: [
            { id: 'd1', date: '2025-10-20', status: 'Finalizada', technicianId: 't1', totalKm: 120, stops: [] },
            { id: 'd2', date: '2025-10-21', status: 'Finalizada', technicianId: 't1', totalKm: 95, stops: [] },
        ]
    },
    {
        id: 'PLAN-2025-081',
        startDate: '2025-10-27',
        endDate: '2025-10-31',
        technicianId: 'Ing. Ruiz',
        status: 'Activo',
        days: [
            { 
                id: 'd3', date: '2025-10-27', status: 'En Curso', technicianId: 't2', totalKm: 45, 
                stops: [
                    { id: 's1', visitCode: 'VIS-25-881', sequence: 1, farmName: 'Finca La Esperanza', producerName: 'Juan Pérez', fieldId: 'f1', fieldName: 'Lote A', lat: 0, lng: 0, priorityLevel: 'Alta', status: 'Completada', estimatedTime: '45 min', reason: 'Inspección' },
                    { id: 's2', visitCode: 'VIS-25-882', sequence: 2, farmName: 'Hato Grande', producerName: 'Agro El Sol', fieldId: 'f2', fieldName: 'Lote 4', lat: 0, lng: 0, priorityLevel: 'Alta', status: 'Pendiente', estimatedTime: '30 min', reason: 'Pre-Crédito' }
                ]
            }
        ]
    }
];

interface RouteContextType {
  activePlan: RoutePlan | null;
  plans: RoutePlan[]; // New: List of all plans
  setActivePlan: (plan: RoutePlan | null) => void;
  addPlan: (plan: RoutePlan) => void; // New: Method to add plan
  updateRouteDay: (dayId: string, updates: Partial<RouteDay>) => void;
  completeStop: (dayId: string, stopId: string) => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const RouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePlan, setActivePlanState] = useState<RoutePlan | null>(null);
  const [plans, setPlans] = useState<RoutePlan[]>(initialPlans);

  const setActivePlan = (plan: RoutePlan | null) => {
      setActivePlanState(plan);
  };

  const addPlan = (plan: RoutePlan) => {
      setPlans(prev => [plan, ...prev]);
  };

  const updateRouteDay = (dayId: string, updates: Partial<RouteDay>) => {
      if (!activePlan) return;
      
      const updatedDays = activePlan.days.map(day => 
          day.id === dayId ? { ...day, ...updates } : day
      );
      
      // Update active plan state
      const updatedActivePlan = { ...activePlan, days: updatedDays };
      setActivePlanState(updatedActivePlan);

      // Also update the plan in the main list to keep sync
      setPlans(prev => prev.map(p => p.id === activePlan.id ? updatedActivePlan : p));
  };

  const completeStop = (dayId: string, stopId: string) => {
      if (!activePlan) return;

      const updatedDays = activePlan.days.map(day => {
          if (day.id === dayId) {
              const updatedStops = day.stops.map(stop => 
                  stop.id === stopId ? { ...stop, status: 'Completada' as const } : stop
              );
              return { ...day, stops: updatedStops };
          }
          return day;
      });

      const updatedActivePlan = { ...activePlan, days: updatedDays };
      setActivePlanState(updatedActivePlan);
      
      // Sync list
      setPlans(prev => prev.map(p => p.id === activePlan.id ? updatedActivePlan : p));
  };

  return (
    <RouteContext.Provider value={{ activePlan, plans, setActivePlan, addPlan, updateRouteDay, completeStop }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRoutes = () => {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRoutes must be used within a RouteProvider');
  }
  return context;
};
