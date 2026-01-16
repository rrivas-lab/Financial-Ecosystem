import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Producer, ChatMessage, DocStatus, ProducerDocument } from '../types';

const initialProducers: (Producer & { source?: 'Odoo' | 'WhatsApp' | 'Mobile' })[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    vat: 'V-12345678',
    type: 'Natural',
    email: 'juan.perez@email.com',
    phone: '0414-5555555',
    address: 'Sector El Cruce, Finca La Esperanza',
    region: 'Portuguesa - Santa Rosalía',
    status: 'Activo',
    source: 'Odoo',
    creditActive: true,
    filesStatus: 'Aprobado',
    hasSeedFields: true,
    mainTechnician: 'Ing. Carlos Mendez',
    lastVisit: '2025-10-22',
    nextVisit: '2025-10-29',
    activeAlertsCount: 2,
    farms: [
      // Added producerId and status to satify Farm interface
      { id: 'f1', name: 'Finca La Esperanza', location: 'Santa Rosalía', totalArea: 45, riceArea: 40, coordinates: 'N8.5 W67.2', operationalCapacity: 50, geofenceActive: true, fields: [], producerId: '1', status: 'Activa' }
    ],
    totalHectares: 45,
    activeCreditsCount: 1,
    stats: { seedHa: 20, consumptionHa: 25, visitsCycle: 5, deliveriesCount: 3, yieldAvg: 5500, routeCompliance: 90 },
    chatHistory: [],
    analyticalPlanId: 'PA-12345678',
    crediAgro: {
      isMember: true,
      score: 840,
      lastUpdate: '2025-10-01'
    },
    documents: [
        { id: 'd1', name: 'Cédula de Identidad', status: 'Validado_Fisico' },
        { id: 'd2', name: 'Registro de Tierras', status: 'Validado_Digital' }
    ]
  },
  {
    id: '2',
    name: 'Agropecuaria El Sol C.A.',
    vat: 'J-98765432-1',
    type: 'Juridica',
    email: 'contacto@elsol.com',
    phone: '0255-6666666',
    address: 'Av. Libertador, Edif. El Sol, Turén',
    region: 'Portuguesa - Turén',
    status: 'Pendiente',
    source: 'Odoo',
    creditActive: false,
    filesStatus: 'Incompleto',
    hasSeedFields: false,
    mainTechnician: 'Ing. Carlos Ruiz',
    activeAlertsCount: 0,
    farms: [
      // Added producerId and status to satisfy Farm interface
      { id: 'f2', name: 'Hato Grande', location: 'Turén', totalArea: 120, riceArea: 100, coordinates: 'N9.1 W68.1', operationalCapacity: 150, geofenceActive: false, fields: [], producerId: '2', status: 'Activa' }
    ],
    totalHectares: 120,
    activeCreditsCount: 0,
    chatHistory: [],
    crediAgro: {
      isMember: false
    },
    documents: []
  }
];

interface ProducerContextType {
  producers: (Producer & { source?: 'Odoo' | 'WhatsApp' | 'Mobile' })[];
  addProducer: (producer: Producer & { source?: 'Odoo' | 'WhatsApp' | 'Mobile' }) => void;
  updateProducer: (id: string, updates: Partial<Producer>) => void;
  getProducerByVat: (vat: string) => (Producer & { source?: 'Odoo' | 'WhatsApp' | 'Mobile' }) | undefined;
  sendMessageToProducer: (producerId: string, text: string) => void;
  updateProducerDocument: (producerId: string, docId: string, status: DocStatus, fileUrl?: string, rejectReason?: string) => void;
  syncRequiredDocuments: (producerId: string, docIds: string[], masterDocs: any[]) => void;
}

const ProducerContext = createContext<ProducerContextType | undefined>(undefined);

export const ProducerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [producers, setProducers] = useState(initialProducers);

  const addProducer = (newProducer: Producer & { source?: 'Odoo' | 'WhatsApp' | 'Mobile' }) => {
    // Mock simulation: If VAT ends in odd number, assign CrediAgro score
    const cleanVat = newProducer.vat.replace(/\D/g, '');
    const isOdd = parseInt(cleanVat.slice(-1)) % 2 !== 0;
    
    const enrichedProducer = {
      ...newProducer,
      crediAgro: isOdd ? {
        isMember: true,
        score: 650 + Math.floor(Math.random() * 300),
        lastUpdate: new Date().toISOString().split('T')[0]
      } : { isMember: false }
    };

    setProducers(prev => [enrichedProducer, ...prev]);
  };

  const updateProducer = (id: string, updates: Partial<Producer>) => {
    setProducers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const getProducerByVat = (vat: string) => {
    return producers.find(p => p.vat.replace(/[-.]/g, '') === vat.replace(/[-.]/g, ''));
  };

  const sendMessageToProducer = (producerId: string, text: string) => {
      const msg: ChatMessage = {
          id: Date.now().toString(),
          text,
          sender: 'bot', 
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setProducers(prev => prev.map(p => {
          if (p.id === producerId) {
              return { ...p, chatHistory: [...(p.chatHistory || []), msg] };
          }
          return p;
      }));
  };

  const updateProducerDocument = (producerId: string, docId: string, status: DocStatus, fileUrl?: string, rejectReason?: string) => {
      setProducers(prev => prev.map(p => {
          if (p.id === producerId) {
              const updatedDocs = (p.documents || []).map(d => 
                  d.id === docId ? { ...d, status, fileUrl: fileUrl || d.fileUrl, rejectionReason: rejectReason } : d
              );
              return { ...p, documents: updatedDocs };
          }
          return p;
      }));
  };

  const syncRequiredDocuments = (producerId: string, docIds: string[], masterDocs: any[]) => {
      setProducers(prev => prev.map(p => {
          if (p.id === producerId) {
              const currentDocs = p.documents || [];
              const newDocs: ProducerDocument[] = [...currentDocs];
              
              docIds.forEach(id => {
                  if (!newDocs.some(d => d.id === id)) {
                      const master = masterDocs.find(m => m.id === id);
                      newDocs.push({
                          id,
                          name: master?.name || id,
                          status: 'Pendiente'
                      });
                  }
              });
              return { ...p, documents: newDocs };
          }
          return p;
      }));
  };

  return (
    <ProducerContext.Provider value={{ 
        producers, addProducer, updateProducer, getProducerByVat,
        sendMessageToProducer, updateProducerDocument, syncRequiredDocuments
    }}>
      {children}
    </ProducerContext.Provider>
  );
};

export const useProducers = () => {
  const context = useContext(ProducerContext);
  if (context === undefined) throw new Error('useProducers must be used within a ProducerProvider');
  return context;
};