import React, { useState, useEffect } from 'react';
import { Field, NavigationProps, FieldStatus } from '../types';
import { useProducers } from '../context/ProducerContext';
import { 
  Search, Grid, Plus, Filter, ChevronRight, 
  Leaf, AlertTriangle, ClipboardCheck, ArrowRight,
  Save, X, Brain, MapPin, Mountain, ArrowUpRight
} from 'lucide-react';

type FieldTab = 'agronomic' | 'alerts' | 'visits';

const DesktopFields: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const { producers, updateProducer } = useProducers();
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [activeTab, setActiveTab] = useState<FieldTab>('agronomic');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
      farmId: '', name: '', area: '', operationalArea: '', crop: '', use: 'Consumo', status: 'Activo'
  });

  // Flatten Fields from Producers Context
  const allFields: Field[] = producers.flatMap(p => 
    p.farms.flatMap(f => 
      (f.fields || []).map(l => ({
        ...l,
        farmName: f.name,
        producerName: p.name
      }))
    )
  );

  // Effect to handle navigation from other components (like DesktopFarms)
  useEffect(() => {
    if (params?.fieldId) {
        const field = allFields.find(f => f.id === params.fieldId);
        if (field) {
            setSelectedField(field);
            setViewMode('detail');
        }
    } else if (params?.createForFarm) {
        setFormData(prev => ({ ...prev, farmId: params.createForFarm }));
        setViewMode('create');
    }
  }, [params, producers]);

  // Helper to get farms for dropdown in create form
  const availableFarms = producers.flatMap(p => 
    p.farms.map(f => ({ id: f.id, name: f.name, producerName: p.name, producerId: p.id }))
  );

  const handleSelectField = (field: Field) => {
      setSelectedField(field);
      setViewMode('detail');
      setActiveTab('agronomic');
  };

  const handleCreate = () => {
      if (!formData.farmId || !formData.name) {
          alert("Por favor seleccione una finca y un nombre para el lote.");
          return;
      }

      const selectedFarmRef = availableFarms.find(f => f.id === formData.farmId);
      if (!selectedFarmRef) return;

      const producer = producers.find(p => p.id === selectedFarmRef.producerId);
      if (!producer) return;

      const farm = producer.farms.find(f => f.id === formData.farmId);
      if (!farm) return;

      const newField: Field = {
          id: `l-${Date.now()}`,
          farmId: farm.id,
          farmName: farm.name,
          producerName: producer.name,
          name: formData.name,
          code: `L-${Math.floor(Math.random() * 1000)}`,
          area: parseFloat(formData.area) || 0,
          crop: formData.crop,
          use: formData.use as 'Consumo' | 'Semilla',
          status: 'Planificado',
          geofenceActive: false,
          planCompliance: 0,
          currentStage: 'Preparación'
      };

      // Update the producer's farm with the new field
      const updatedFarms = producer.farms.map(f => {
          if (f.id === farm.id) {
              return { ...f, fields: [...(f.fields || []), newField] };
          }
          return f;
      });

      updateProducer(producer.id, { farms: updatedFarms });

      alert("Lote creado y vinculado exitosamente.");
      setViewMode('list');
      setFormData({ farmId: '', name: '', area: '', operationalArea: '', crop: '', use: 'Consumo', status: 'Activo' });
  };

  const filteredFields = allFields.filter(f => 
      (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (f.producerName && f.producerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.farmName && f.farmName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status?: FieldStatus) => {
      switch(status) {
          case 'Planificado': return 'bg-blue-100 text-blue-700';
          case 'En Producción': return 'bg-emerald-100 text-emerald-700';
          case 'En Cosecha': return 'bg-amber-100 text-amber-700';
          case 'Cerrado': return 'bg-slate-100 text-slate-600';
          default: return 'bg-slate-100';
      }
  };

  // --- RENDERERS ---

  const renderCreateForm = () => (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold text-slate-800">Registrar Nuevo Lote</h1>
              <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                  <X className="h-6 w-6" />
              </button>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Finca Asociada</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        value={formData.farmId}
                        onChange={(e) => setFormData({...formData, farmId: e.target.value})}
                      >
                          <option value="">Seleccione Finca...</option>
                          {availableFarms.map(f => (
                              <option key={f.id} value={f.id}>{f.name} - {f.producerName}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Lote</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ej. Lote Norte"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Hectáreas Totales</label>
                      <input 
                        type="number" 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0.00"
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Cultivo</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        value={formData.crop}
                        onChange={(e) => setFormData({...formData, crop: e.target.value})}
                      >
                          <option value="">Sin Asignar</option>
                          <option value="Arroz">Arroz</option>
                          <option value="Maíz">Maíz</option>
                          <option value="Café">Café</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Uso</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        value={formData.use}
                        onChange={(e) => setFormData({...formData, use: e.target.value})}
                      >
                          <option value="Consumo">Consumo</option>
                          <option value="Semilla">Semilla</option>
                      </select>
                  </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
                  <button onClick={() => setViewMode('list')} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200">Cancelar</button>
                  <button onClick={handleCreate} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm flex items-center">
                      <Save className="h-5 w-5 mr-2" /> Crear Lote
                  </button>
              </div>
          </div>
      </div>
  );

  const renderAgronomicTab = (f: Field) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-emerald-500" /> Información Agronómica
              </h3>
              <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-bold">Cultivo</span>
                      <span className="font-medium text-slate-800">{f.crop || 'Sin asignar'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-bold">Etapa Actual</span>
                      <span className="font-medium text-emerald-700">{f.currentStage || 'No iniciada'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold">Cumplimiento Plan</span>
                      <div className="flex items-center w-1/2">
                          <div className="w-full bg-slate-200 rounded-full h-2 mr-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${f.planCompliance || 0}%`}}></div>
                          </div>
                          <span className="text-xs font-bold">{f.planCompliance}%</span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Mountain className="h-5 w-5 mr-2 text-amber-600" /> Suelo y Condiciones
              </h3>
              <div className="space-y-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Suelo</p>
                      <p className="font-medium text-slate-800">Franco-Arcilloso</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Nivelación</p>
                      <p className="font-medium text-slate-800">Laser</p>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderVisitsTab = (f: Field) => (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-700">Visitas Técnicas Realizadas</h3>
              <button onClick={() => onNavigate('visits', {filter: 'producer'})} className="text-emerald-600 text-sm font-bold hover:underline">
                  Ver todas
              </button>
          </div>
          <table className="w-full text-left text-sm">
              <thead className="text-slate-500 uppercase text-xs bg-white border-b border-slate-100">
                  <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Técnico</th>
                      <th className="px-4 py-3 text-center">Diagnóstico IA</th>
                      <th className="px-4 py-3 text-center">Receta</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {/* Removed invalid Property lastVisit check, replaced with generic fallback since Field does not have lastVisit property */}
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Sin visitas registradas recientemente</td></tr>
              </tbody>
          </table>
      </div>
  );

  const renderAlertsTab = (f: Field) => (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
          <h3 className="font-bold text-red-700 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2" /> Diagnósticos IA & Alertas
          </h3>
          {(f.alertsCount || 0) > 0 ? (
              <div className="space-y-3">
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                      <div>
                          <h4 className="font-bold text-red-800 text-sm">Posible Pyricularia</h4>
                          <p className="text-xs text-red-700 mt-1">Detectado en visita reciente. Severidad Media.</p>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="text-center py-8 text-emerald-600 font-medium">
                  <span className="flex items-center justify-center mb-2"><ClipboardCheck className="h-8 w-8"/></span>
                  Sin alertas activas. Cultivo sano.
              </div>
          )}
      </div>
  );

  // --- DETAIL VIEW ---
  if (viewMode === 'detail' && selectedField) {
      const tabs: {id: FieldTab, label: string, icon: any}[] = [
          { id: 'agronomic', label: 'Info Agronómica', icon: Leaf },
          { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
          { id: 'visits', label: 'Visitas Técnicas', icon: ClipboardCheck },
      ];

      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Operaciones</span>
                      <ChevronRight className="h-4 w-4" />
                      <span className="cursor-pointer hover:text-emerald-700" onClick={() => setViewMode('list')}>Lotes</span>
                      <ChevronRight className="h-4 w-4" />
                      <span className="text-slate-800 font-bold">{selectedField.name}</span>
                  </div>
                  <button onClick={() => setViewMode('list')} className="px-3 py-1.5 border border-slate-300 bg-white rounded text-sm text-slate-700 font-medium hover:bg-slate-50">
                      Volver
                  </button>
              </div>

              {/* Header Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="h-16 w-16 bg-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center">
                      <Grid className="h-8 w-8 text-slate-300" />
                  </div>
                  <div className="flex-1">
                      <h1 className="text-2xl font-bold text-slate-900">{selectedField.name}</h1>
                      <p className="text-slate-500 text-sm mb-1">{selectedField.farmName} • {selectedField.producerName}</p>
                      <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(selectedField.status)}`}>
                              {selectedField.status}
                          </span>
                      </div>
                  </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-slate-200 overflow-x-auto">
                  <div className="flex space-x-1 min-w-max">
                      {tabs.map(tab => (
                          <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                  activeTab === tab.id 
                                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50' 
                                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                              }`}
                          >
                              <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                              {tab.label}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Content Area */}
              <div className="min-h-[400px]">
                  {activeTab === 'agronomic' && renderAgronomicTab(selectedField)}
                  {activeTab === 'alerts' && renderAlertsTab(selectedField)}
                  {activeTab === 'visits' && renderVisitsTab(selectedField)}
              </div>
          </div>
      );
  }

  // --- CREATE VIEW ---
  if (viewMode === 'create') {
      return renderCreateForm();
  }

  // --- LIST VIEW ---
  if (viewMode === 'list') {
      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Operaciones</span>
                      <ChevronRight className="h-4 w-4" />
                      <span className="text-slate-800 font-bold">Lotes Productivos</span>
                  </div>
                  <button onClick={() => setViewMode('create')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-bold hover:bg-emerald-700 flex items-center transition-colors">
                      <Plus className="h-4 w-4 mr-1" /> Nuevo Lote
                  </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 shadow-sm">
                  <div className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 flex items-center shadow-inner">
                      <Search className="h-4 w-4 text-slate-400 mr-2" />
                      <input 
                          type="text" 
                          placeholder="Buscar lote, finca o productor..." 
                          className="flex-1 bg-transparent outline-none text-sm"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                      />
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center shadow-sm transition-colors">
                      <Filter className="h-4 w-4 mr-2" /> Filtros
                  </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                          <tr>
                              <th className="px-4 py-3">Lote / Código</th>
                              <th className="px-4 py-3">Ubicación</th>
                              <th className="px-4 py-3">Cultivo</th>
                              <th className="px-4 py-3">Etapa</th>
                              <th className="px-4 py-3 text-center">Estado</th>
                              <th className="px-4 py-3 text-center">Uso</th>
                              <th className="px-4 py-3 text-center">Geocerca</th>
                              <th className="px-4 py-3 text-center">Alertas</th>
                              <th className="px-4 py-3 text-center">Acción</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {filteredFields.map(f => (
                              <tr key={f.id} onClick={() => handleSelectField(f)} className="hover:bg-slate-50 cursor-pointer group transition-colors">
                                  <td className="px-4 py-3">
                                      <div className="font-bold text-slate-800">{f.name}</div>
                                      <div className="text-xs text-slate-500 font-mono">{f.code}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                      <div className="text-slate-700 font-medium">{f.farmName}</div>
                                      <div className="text-xs text-slate-500">{f.producerName}</div>
                                  </td>
                                  <td className="px-4 py-3 text-slate-600">{f.crop}</td>
                                  <td className="px-4 py-3">
                                      {f.currentStage ? (
                                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-medium">
                                              {f.currentStage}
                                          </span>
                                      ) : (
                                          <span className="text-xs text-slate-400">-</span>
                                      )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${getStatusColor(f.status)}`}>
                                          {f.status}
                                      </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${f.use === 'Semilla' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                          {f.use}
                                      </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      {f.geofenceActive ? (
                                          <span className="text-emerald-600"><MapPin className="h-4 w-4 mx-auto"/></span>
                                      ) : (
                                          <span className="text-slate-300">-</span>
                                      )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      {(f.alertsCount || 0) > 0 && (
                                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                                              {f.alertsCount}
                                          </span>
                                      )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      <button className="text-slate-400 group-hover:text-emerald-600">
                                          <ChevronRight className="h-5 w-5" />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                          {filteredFields.length === 0 && (
                              <tr><td colSpan={9} className="text-center py-8 text-slate-400">No hay lotes registrados que coincidan con la búsqueda.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  }
};

export default DesktopFields;