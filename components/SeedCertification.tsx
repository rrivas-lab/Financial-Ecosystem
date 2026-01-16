import React from 'react';
import { SeedField, SeedFieldStatus } from '../types';
import { Sprout, FileCheck, AlertOctagon, CheckSquare } from 'lucide-react';

const mockSeedFields: SeedField[] = [
  {
    id: 's1',
    producerName: 'Juan Pérez',
    farmName: 'Finca La Esperanza',
    variety: 'SD20A',
    category: 'Certificada',
    area: 40,
    cycle: 'Invierno 2025',
    status: SeedFieldStatus.APROBADO_CONASEM,
    inspectionDate: '2025-09-15'
  },
  {
    id: 's2',
    producerName: 'Maria Rodriguez',
    farmName: 'Parcela 45',
    variety: 'SD20A',
    category: 'Registrada',
    area: 25,
    cycle: 'Invierno 2025',
    status: SeedFieldStatus.PROPUESTO
  },
  {
    id: 's3',
    producerName: 'Agropecuaria El Sol',
    farmName: 'Lote Norte',
    variety: 'Matias',
    category: 'Fundación',
    area: 12,
    cycle: 'Invierno 2025',
    status: SeedFieldStatus.CERTIFICADO,
    inspectionDate: '2025-08-10'
  }
];

const SeedCertification: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Certificación de Semillas (CONASEM)</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700">
            Exportar Reporte
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            + Inscribir Campo
          </button>
        </div>
      </div>

      {/* Kanban-like Status Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        
        {/* Column 1: Propuesto */}
        <div className="bg-slate-100 rounded-xl p-4 min-w-[280px]">
          <div className="flex items-center mb-4 text-slate-500 font-semibold text-sm uppercase tracking-wide">
            <Sprout className="h-4 w-4 mr-2" />
            Propuesto
            <span className="ml-auto bg-slate-200 px-2 py-0.5 rounded-full text-xs text-slate-600">1</span>
          </div>
          <div className="space-y-3">
             {mockSeedFields.filter(f => f.status === SeedFieldStatus.PROPUESTO).map(field => (
               <SeedCard key={field.id} field={field} />
             ))}
          </div>
        </div>

        {/* Column 2: Aprobado CONASEM (En inspección) */}
        <div className="bg-blue-50 rounded-xl p-4 min-w-[280px]">
          <div className="flex items-center mb-4 text-blue-600 font-semibold text-sm uppercase tracking-wide">
            <CheckSquare className="h-4 w-4 mr-2" />
            Inspección CONASEM
            <span className="ml-auto bg-blue-100 px-2 py-0.5 rounded-full text-xs text-blue-700">1</span>
          </div>
          <div className="space-y-3">
            {mockSeedFields.filter(f => f.status === SeedFieldStatus.APROBADO_CONASEM).map(field => (
               <SeedCard key={field.id} field={field} />
             ))}
          </div>
        </div>

        {/* Column 3: Rechazado */}
        <div className="bg-red-50 rounded-xl p-4 min-w-[280px]">
          <div className="flex items-center mb-4 text-red-600 font-semibold text-sm uppercase tracking-wide">
            <AlertOctagon className="h-4 w-4 mr-2" />
            Rechazado
            <span className="ml-auto bg-red-100 px-2 py-0.5 rounded-full text-xs text-red-700">0</span>
          </div>
          <div className="space-y-3">
            {mockSeedFields.filter(f => f.status === SeedFieldStatus.RECHAZADO).map(field => (
               <SeedCard key={field.id} field={field} />
             ))}
          </div>
        </div>

        {/* Column 4: Certificado */}
        <div className="bg-emerald-50 rounded-xl p-4 min-w-[280px]">
          <div className="flex items-center mb-4 text-emerald-600 font-semibold text-sm uppercase tracking-wide">
            <FileCheck className="h-4 w-4 mr-2" />
            Certificado
            <span className="ml-auto bg-emerald-100 px-2 py-0.5 rounded-full text-xs text-emerald-700">1</span>
          </div>
          <div className="space-y-3">
            {mockSeedFields.filter(f => f.status === SeedFieldStatus.CERTIFICADO).map(field => (
               <SeedCard key={field.id} field={field} />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SeedCard: React.FC<{field: SeedField}> = ({ field }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold text-slate-400">{field.variety}</span>
      <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{field.category}</span>
    </div>
    <h4 className="font-semibold text-slate-800 text-sm">{field.producerName}</h4>
    <p className="text-xs text-slate-500 mb-3">{field.farmName}</p>
    
    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
      <span className="font-medium text-emerald-600">{field.area} ha</span>
      {field.inspectionDate && (
        <span className="text-slate-400">{field.inspectionDate}</span>
      )}
    </div>
  </div>
);

export default SeedCertification;