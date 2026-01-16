
import React, { useState } from 'react';
import { SeedField, SeedFieldStatus, NavigationProps, SeedLot, LabAnalysis } from '../types';
import { Sprout, Search, Filter, Plus, ChevronRight, Save, AlertTriangle, ArrowDownRight, FileText, Microscope, Truck, Beaker, ClipboardCheck, FileCheck, Ban, X } from 'lucide-react';

const mockSeedFieldsData: SeedField[] = [
  { id: 's1', producerName: 'Juan Pérez', farmName: 'La Esperanza', variety: 'SD20A', category: 'Certificada', area: 40, cycle: 'Invierno 2025', status: SeedFieldStatus.APROBADO_CONASEM, inspectionDate: '2025-09-15', parentLotId: 'S-2024-REG-001', conasemRegistryId: 'CON-25-001' },
  { id: 's2', producerName: 'Maria Rodriguez', farmName: 'Parcela 45', variety: 'SD20A', category: 'Registrada', area: 25, cycle: 'Invierno 2025', status: SeedFieldStatus.PROPUESTO },
  { id: 's3', producerName: 'Agropecuaria El Sol', farmName: 'Lote Norte', variety: 'Matias', category: 'Fundación', area: 12, cycle: 'Invierno 2025', status: SeedFieldStatus.COSECHADO, inspectionDate: '2025-08-10', conasemRegistryId: 'CON-25-005' },
];

const mockSeedLots: SeedLot[] = [
  { id: 'lot1', seedFieldId: 's3', variety: 'Matias', harvestDate: '2025-10-10', kgClean: 50000, currentCategory: 'Fundación', status: 'En Proceso' }
];

const mockAnalysis: LabAnalysis[] = [
    { id: 'lab1', seedLotId: 'lot1', date: '2025-10-12', germination: 95, purity: 99, moisture: 12, status: 'Aprobado', type: 'Interno' }
];

const DesktopSeeds: React.FC<NavigationProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'fields' | 'requests' | 'inspections' | 'lots' | 'lab'>('fields');
  const [detailTab, setDetailTab] = useState<'general' | 'inspections' | 'lab' >('general');
  const [fields, setFields] = useState(mockSeedFieldsData);
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'create'>('list');
  const [selectedField, setSelectedField] = useState<SeedField | null>(null);

  // Form State
  const [createForm, setCreateForm] = useState({ producer: '', variety: '', category: 'Certificada', area: '' });

  const handleCreate = () => {
      alert("Campo inscrito en el programa de semillas.");
      setViewMode('list');
  };

  // --- RENDERERS ---

  const renderCreateForm = () => (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold text-slate-800">Inscribir Nuevo Campo de Semilla</h1>
              <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                  <X className="h-6 w-6" />
              </button>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Productor</label>
                      <select className="w-full p-3 border border-slate-300 rounded-lg outline-none">
                          <option>Juan Pérez</option>
                          <option>Agro El Sol</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Lote</label>
                      <select className="w-full p-3 border border-slate-300 rounded-lg outline-none">
                          <option>Lote Semilla Norte</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Variedad a Sembrar</label>
                      <input className="w-full p-3 border border-slate-300 rounded-lg outline-none" placeholder="Ej. SD20A" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Categoría Objetivo</label>
                      <select className="w-full p-3 border border-slate-300 rounded-lg outline-none">
                          <option>Certificada</option>
                          <option>Registrada</option>
                          <option>Fundación</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Superficie (ha)</label>
                      <input type="number" className="w-full p-3 border border-slate-300 rounded-lg outline-none" placeholder="0.00" />
                  </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button onClick={() => setViewMode('list')} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg mr-2">Cancelar</button>
                  <button onClick={handleCreate} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm flex items-center">
                      <Save className="h-5 w-5 mr-2" /> Inscribir
                  </button>
              </div>
          </div>
      </div>
  );

  const renderInspectionsTab = () => (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in">
          <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Tipo Inspección</th>
                      <th className="px-4 py-3">Técnico</th>
                      <th className="px-4 py-3 text-center">Estatus</th>
                      <th className="px-4 py-3 text-center">Informe</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">2025-09-15</td>
                      <td className="px-4 py-3 font-bold text-slate-700">Floración (CONASEM)</td>
                      <td className="px-4 py-3 text-slate-600">Ing. Mendez</td>
                      <td className="px-4 py-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">Aprobado</span></td>
                      <td className="px-4 py-3 text-center"><button className="text-blue-600 hover:underline text-xs">Ver PDF</button></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">2025-08-10</td>
                      <td className="px-4 py-3 font-bold text-slate-700">Pre-Siembra</td>
                      <td className="px-4 py-3 text-slate-600">Ing. Ruiz</td>
                      <td className="px-4 py-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">Aprobado</span></td>
                      <td className="px-4 py-3 text-center"><button className="text-blue-600 hover:underline text-xs">Ver PDF</button></td>
                  </tr>
              </tbody>
          </table>
      </div>
  );

  const renderLabTab = () => (
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-in fade-in">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center">
              <Microscope className="h-5 w-5 mr-2 text-purple-600" /> Resultados de Laboratorio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockAnalysis.map(a => (
                  <div key={a.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-800">Análisis {a.type}</span>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">{a.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Fecha: {a.date}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white p-2 rounded border">
                              <p className="text-xs text-slate-400">Germinación</p>
                              <p className="font-bold text-slate-800">{a.germination}%</p>
                          </div>
                          <div className="bg-white p-2 rounded border">
                              <p className="text-xs text-slate-400">Pureza</p>
                              <p className="font-bold text-slate-800">{a.purity}%</p>
                          </div>
                          <div className="bg-white p-2 rounded border">
                              <p className="text-xs text-slate-400">Humedad</p>
                              <p className="font-bold text-slate-800">{a.moisture}%</p>
                          </div>
                      </div>
                  </div>
              ))}
              {mockAnalysis.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-slate-400">No hay análisis registrados aún.</div>
              )}
          </div>
      </div>
  );

  // --- VIEWS ---

  if (viewMode === 'create') {
      return renderCreateForm();
  }

  if (viewMode === 'form' && selectedField) {
      // FIELD DETAIL VIEW
      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                 <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Semillas</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="cursor-pointer hover:text-emerald-700" onClick={() => { setViewMode('list'); setSelectedField(null); }}>Gestión</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-800 font-bold">{selectedField.producerName}</span>
                 </div>
                 <button onClick={() => { setViewMode('list'); setSelectedField(null); }} className="px-3 py-1.5 border border-slate-300 bg-white rounded text-sm text-slate-700 font-medium hover:bg-slate-50">
                    Volver
                 </button>
             </div>
             
             {/* Header */}
             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <Sprout className="h-6 w-6 mr-2 text-emerald-600" /> 
                            Campo de Semilla: {selectedField.variety}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Ciclo {selectedField.cycle} • {selectedField.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
                         selectedField.status === SeedFieldStatus.APROBADO_CONASEM ? 'bg-emerald-100 text-emerald-800' : 
                         selectedField.status === SeedFieldStatus.PROPUESTO ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {selectedField.status}
                    </span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                     <div><span className="font-bold text-slate-600">Registro CONASEM:</span> {selectedField.conasemRegistryId || 'En trámite'}</div>
                     <div><span className="font-bold text-slate-600">Superficie:</span> {selectedField.area} ha</div>
                     <div><span className="font-bold text-slate-600">Lote Origen:</span> {selectedField.parentLotId || 'N/A'}</div>
                     <div><span className="font-bold text-slate-600">Finca:</span> {selectedField.farmName}</div>
                 </div>
             </div>

             {/* Detail Tabs */}
             <div className="flex border-b border-slate-200">
                 {[
                     { id: 'general', label: 'General', icon: FileText },
                     { id: 'inspections', label: 'Inspecciones', icon: ClipboardCheck },
                     { id: 'lab', label: 'Laboratorio', icon: Microscope }
                 ].map(tab => (
                     <button
                         key={tab.id}
                         onClick={() => setDetailTab(tab.id as any)}
                         className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                             detailTab === tab.id 
                             ? 'border-emerald-600 text-emerald-600' 
                             : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                         }`}
                     >
                         <tab.icon className="h-4 w-4 mr-2" />
                         {tab.label}
                     </button>
                 ))}
             </div>

             <div className="min-h-[300px]">
                 {detailTab === 'general' && (
                     <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                         Detalles generales y trazabilidad genealógica.
                     </div>
                 )}
                 {detailTab === 'inspections' && renderInspectionsTab()}
                 {detailTab === 'lab' && renderLabTab()}
             </div>
          </div>
      );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Semillas (CONASEM)</h1>
        <div className="flex gap-2">
            <button className="bg-slate-800 text-white px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-slate-900 flex items-center">
              <FileText className="h-4 w-4 mr-2" /> Reporte General
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
         <div className="flex space-x-6 min-w-max">
            {/* ... tabs ... */}
            <button 
                onClick={() => setActiveTab('fields')} 
                className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center ${activeTab === 'fields' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Sprout className="h-4 w-4 mr-2" /> Campos Inscritos
            </button>
            <button 
                onClick={() => setActiveTab('requests')} 
                className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center ${activeTab === 'requests' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <FileText className="h-4 w-4 mr-2" /> Solicitudes CONASEM
            </button>
            {/* ... other tabs ... */}
         </div>
      </div>

      {/* CONTENT: FIELDS */}
      {activeTab === 'fields' && (
         <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-700">Registro de Campos</h3>
               <button 
                 onClick={() => setViewMode('create')}
                 className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-emerald-700 flex items-center"
               >
                  <Plus className="h-3 w-3 mr-1" /> Nuevo Campo
               </button>
            </div>
            <table className="w-full text-left">
               <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                     <th className="px-4 py-3">Productor</th>
                     <th className="px-4 py-3">Variedad</th>
                     <th className="px-4 py-3">Categoría</th>
                     <th className="px-4 py-3 text-right">Área (ha)</th>
                     <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-sm">
                  {fields.map(f => (
                     <tr key={f.id} onClick={() => { setSelectedField(f); setViewMode('form'); }} className="hover:bg-slate-50 cursor-pointer">
                        <td className="px-4 py-3 font-medium text-slate-800">{f.producerName}</td>
                        <td className="px-4 py-3 text-slate-600">{f.variety}</td>
                        <td className="px-4 py-3 text-slate-600">{f.category}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{f.area}</td>
                        <td className="px-4 py-3 text-center">
                           <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                              f.status === SeedFieldStatus.APROBADO_CONASEM ? 'bg-emerald-100 text-emerald-700' :
                              f.status === SeedFieldStatus.COSECHADO ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                           }`}>{f.status}</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      )}
      {/* ... Other tabs ... */}
    </div>
  );
};

export default DesktopSeeds;
