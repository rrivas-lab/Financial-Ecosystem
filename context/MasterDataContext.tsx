
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Crop, InputProduct, DocumentRequirement, AgroIndustry, Technician, MasterStage, CommitteeMember } from '../types';

const initialCrops: Crop[] = [
    { id: 'c1', name: 'Arroz', variety: 'SD20A', type: 'Semilla', cycleDurationDays: 135, status: 'Activo' },
    { id: 'c2', name: 'Arroz', variety: 'Matias', type: 'Consumo', cycleDurationDays: 120, status: 'Activo' },
    { id: 'c3', name: 'Maíz', variety: 'Híbrido Blanco', type: 'Consumo', cycleDurationDays: 110, status: 'Activo' },
];

const initialInputs: InputProduct[] = [
    { id: 'i1', name: 'Urea Granulada', category: 'Fertilizante', activeIngredient: 'Nitrógeno 46%', presentation: 'Saco 50kg', unit: 'kg', price: 0.8, stockLevel: 5000, warehouseId: 'wh1', status: 'Activo' },
    { id: 'i2', name: 'NPK 12-24-12', category: 'Fertilizante', activeIngredient: 'N-P-K', presentation: 'Saco 50kg', unit: 'kg', price: 1.2, stockLevel: 2500, warehouseId: 'wh1', status: 'Activo' },
    { id: 'i3', name: 'Glifosato 480', category: 'Herbicida', activeIngredient: 'Glifosato', presentation: 'Litro', unit: 'lt', price: 12.5, stockLevel: 1200, warehouseId: 'wh2', status: 'Activo' },
    { id: 'i4', name: 'Beam 75 WP', category: 'Fungicida', activeIngredient: 'Triciclazol', presentation: 'Sobres 500g', unit: 'kg', price: 45.0, stockLevel: 800, warehouseId: 'wh2', status: 'Activo' },
    { id: 'i5', name: 'Engeo', category: 'Insecticida', activeIngredient: 'Tiametoxam + Lambda-cialotrina', presentation: 'Litro', unit: 'lt', price: 32.0, stockLevel: 400, warehouseId: 'wh2', status: 'Activo' }
];

const initialPartners: AgroIndustry[] = [
    { 
      id: 'p1', 
      name: 'Aproscello Central', 
      type: 'Aproscello', 
      vat: 'J-30001234-0',
      isComercioAgro: true, 
      warehouses: [{ id: 'wh1', name: 'Silo Principal', location: 'Acarigua' }] 
    },
    { 
      id: 'p2', 
      name: 'AgroInsumos del Llano', 
      type: 'Aliado', 
      vat: 'J-40005678-9',
      isComercioAgro: false,
      warehouses: [{ id: 'wh2', name: 'Tienda Turén', location: 'Turén' }] 
    },
];

const initialDocuments: DocumentRequirement[] = [
    { id: 'd1', name: 'Cédula de Identidad / RIF', description: 'Documento de identidad vigente', requiredFor: 'Ambos', stage: 'Solicitud' },
    { id: 'd2', name: 'Registro de Tierras (INTI)', description: 'Título de propiedad o carta agraria', requiredFor: 'Ambos', stage: 'Solicitud' },
    { id: 'd3', name: 'Acta Constitutiva', description: 'Registro mercantil actualizado', requiredFor: 'Juridica', stage: 'Solicitud' },
    { id: 'd4', name: 'Contrato de Apoyo', description: 'Firmado y huella', requiredFor: 'Ambos', stage: 'Contrato' },
];

const initialTechs: Technician[] = [
    { id: 't1', name: 'Ing. Carlos Mendez', phone: '0414-1234567', zone: 'Santa Rosalía', active: true, vehicleInfo: 'Hilux A12B34', coverageRadius: 20, assignedFarmIds: ['f1'], role: 'Jefe', odooUser: 'carlos.mendez', subordinateIds: ['t2', 't3'] },
    { id: 't2', name: 'Téc. Maria Ruiz', phone: '0412-7654321', zone: 'Turén', active: true, vehicleInfo: 'Moto Empire', coverageRadius: 15, assignedFarmIds: [], role: 'Tecnico', supervisorId: 't1', odooUser: 'maria.ruiz' },
    { id: 't3', name: 'Ing. Juan Martinez', phone: '0416-5555555', zone: 'Esteller', active: true, vehicleInfo: 'Jeep CJ5', coverageRadius: 25, assignedFarmIds: ['f2'], role: 'Tecnico', supervisorId: 't1', odooUser: 'juan.martinez' },
];

const initialStages: MasterStage[] = [
    { id: 'st1', name: 'Recepción de Solicitudes', description: 'Entrada de documentación inicial', defaultDuration: 10, requiresVisit: false, status: 'Activo' },
    { id: 'st2', name: 'Inspección Técnica Inicial', description: 'Evaluación de finca y aptitud', defaultDuration: 5, requiresVisit: true, status: 'Activo' },
    { id: 'st3', name: 'Aprobación Comité', description: 'Evaluación financiera y legal', defaultDuration: 5, requiresVisit: false, status: 'Activo' },
    { id: 'st4', name: 'Ejecución (Siembra)', description: 'Fase de desarrollo del cultivo', defaultDuration: 120, requiresVisit: true, status: 'Activo' },
    { id: 'st5', name: 'Cierre y Cosecha', description: 'Recepción de cosecha y liquidación', defaultDuration: 30, requiresVisit: false, status: 'Activo' },
];

const initialCommittee: CommitteeMember[] = [
    { id: 'cm1', name: 'Dr. Roberto Gomez', role: 'Presidente', agroIndustry: 'Aproscello Central' },
    { id: 'cm2', name: 'Lic. Ana Suarez', role: 'Gerente Finanzas', agroIndustry: 'Aproscello Central' },
    { id: 'cm3', name: 'Ing. Pedro Perez', role: 'Asesor Externo', agroIndustry: 'AgroInsumos del Llano' },
];

interface MasterDataContextType {
  crops: Crop[];
  addCrop: (crop: Crop) => void;
  updateCrop: (id: string, updates: Partial<Crop>) => void;
  inputs: InputProduct[];
  addInput: (input: InputProduct) => void;
  updateInput: (id: string, updates: Partial<InputProduct>) => void;
  partners: AgroIndustry[];
  addPartner: (partner: AgroIndustry) => void;
  updatePartner: (id: string, updates: Partial<AgroIndustry>) => void;
  documents: DocumentRequirement[];
  addDocument: (doc: DocumentRequirement) => void;
  updateDocument: (id: string, updates: Partial<DocumentRequirement>) => void;
  technicians: Technician[];
  addTechnician: (tech: Technician) => void;
  updateTechnician: (id: string, updates: Partial<Technician>) => void;
  stages: MasterStage[];
  addStage: (stage: MasterStage) => void;
  updateStage: (id: string, updates: Partial<MasterStage>) => void;
  committee: CommitteeMember[];
  addCommitteeMember: (member: CommitteeMember) => void;
  updateCommitteeMember: (id: string, updates: Partial<CommitteeMember>) => void;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [inputs, setInputs] = useState<InputProduct[]>(initialInputs);
  const [partners, setPartners] = useState<AgroIndustry[]>(initialPartners);
  const [documents, setDocuments] = useState<DocumentRequirement[]>(initialDocuments);
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechs);
  const [stages, setStages] = useState<MasterStage[]>(initialStages);
  const [committee, setCommittee] = useState<CommitteeMember[]>(initialCommittee);

  const addCrop = (newCrop: Crop) => setCrops(prev => [...prev, newCrop]);
  const updateCrop = (id: string, updates: Partial<Crop>) => setCrops(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const addInput = (newInput: InputProduct) => setInputs(prev => [...prev, newInput]);
  const updateInput = (id: string, updates: Partial<InputProduct>) => setInputs(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const addPartner = (newPartner: AgroIndustry) => setPartners(prev => [...prev, newPartner]);
  const updatePartner = (id: string, updates: Partial<AgroIndustry>) => setPartners(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const addDocument = (newDoc: DocumentRequirement) => setDocuments(prev => [...prev, newDoc]);
  const updateDocument = (id: string, updates: Partial<DocumentRequirement>) => setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  const addTechnician = (newTech: Technician) => setTechnicians(prev => [...prev, newTech]);
  const updateTechnician = (id: string, updates: Partial<Technician>) => setTechnicians(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const addStage = (newStage: MasterStage) => setStages(prev => [...prev, newStage]);
  const updateStage = (id: string, updates: Partial<MasterStage>) => setStages(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  const addCommitteeMember = (newMember: CommitteeMember) => setCommittee(prev => [...prev, newMember]);
  const updateCommitteeMember = (id: string, updates: Partial<CommitteeMember>) => setCommittee(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

  return (
    <MasterDataContext.Provider value={{ 
        crops, addCrop, updateCrop, 
        inputs, addInput, updateInput,
        partners, addPartner, updatePartner,
        documents, addDocument, updateDocument,
        technicians, addTechnician, updateTechnician,
        stages, addStage, updateStage,
        committee, addCommitteeMember, updateCommitteeMember
    }}>
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (context === undefined) throw new Error('useMasterData must be used within a MasterDataProvider');
  return context;
};
