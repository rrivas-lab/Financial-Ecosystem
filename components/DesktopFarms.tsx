
import React, { useState } from 'react';
import { Farm, NavigationProps, Field } from '../types';
import { useProducers } from '../context/ProducerContext';
import { 
  Search, MapPin, Grid, Plus, Filter, ChevronRight, Map, 
  FileText, Truck, Building, Mountain,
  Save, X, User,
  PenTool, MousePointer2, ArrowUpRight, Shield, Zap
} from 'lucide-react';

type FarmTab = 'general' | 'geo' | 'lots' | 'inputs' | 'agronomic';

const DesktopFarms: React.FC<NavigationProps> = ({ onNavigate }) => {
  const { producers, updateProducer } = useProducers();
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [activeTab, setActiveTab] = useState<FarmTab>('general');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
      name: '', producerId: '', location: '', totalArea: '', operationalArea: '', coordinates: '', state: 'Portuguesa', mainCrop: 'Arroz', status: 'Activa'
  });

  // Flatten Farms from Producers Context
  const allFarms: Farm[] = producers.flatMap(p => 
    p.farms.map(f => ({
      ...f,
      producerName: p.name, // Ensure producer name is attached for display
      producerId: p.id
    }))
  );

  const handleSelectFarm = (farm: Farm) => {
      setSelectedFarm(farm);
      setViewMode('detail');
      setActiveTab('general');
  };

  const handleCreate = () => {
      if (!formData.producerId || !formData.name) {
          alert("Por favor seleccione un productor y nombre de finca.");
          return;
      }

      const selectedProducer = producers.find(p => p.id === formData.producerId);
      if (!selectedProducer) return;

      const newFarm: Farm = {
          id: `f-${Date.now()}`,
          name: formData.name,
          producerId: selectedProducer.id,
          producerName: selectedProducer.name,
          location: formData.location,
          state: formData.state,
          coordinates: formData.coordinates,
          totalArea: parseFloat(formData.totalArea) || 0,
          riceArea: parseFloat(formData.operationalArea) || 0,
          status: formData.status as 'Activa' | 'Inactiva',
          geofenceActive: false,
          lastVisit: '-',
          fields: []
      };

      const updatedFarms = [...selectedProducer.farms, newFarm];
      updateProducer(selectedProducer.id, { farms: updatedFarms });

      alert("Finca registrada y sincronizada exitosamente.");
      setViewMode('list');
      setFormData({ name: '', producerId: '', location: '', totalArea: '', operationalArea: '', coordinates: '', state: 'Portuguesa', mainCrop: 'Arroz', status: 'Activa' });
  };

  const filteredFarms = allFarms.filter(f => 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (f.producerName && f.producerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- RENDERERS ---

  const renderCreateForm = () => (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold text-slate-800">Registrar Nueva Finca</h1>
              <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                  <X className="h-6 w-6" />
              </button>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Propietario / Productor</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        value={formData.producerId}
                        onChange={(e) => setFormData({...formData, producerId: e.target.value})}
                      >
                          <option value="">Seleccione Productor...</option>
                          {producers.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.vat})</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Finca</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ej. Hato La Virgen"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Ubicación Geográfica (Coords)</label>
                      <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="flex-1 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Ej. 8.1234, -69.1234"
                            value={formData.coordinates}
                            onChange={(e) => setFormData({...formData, coordinates: e.target.value})}
                          />
                          <button className="px-4 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-200">
                              <MapPin className="h-5 w-5" />
                          </button>
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Área Total (ha)</label>
                      <input 
                        type="number" 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0.00"
                        value={formData.totalArea}
                        onChange={(e) => setFormData({...formData, totalArea: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Área Operativa (ha)</label>
                      <input 
                        type="number" 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0.00"
                        value={formData.operationalArea}
                        onChange={(e) => setFormData({...formData, operationalArea: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Cultivo Principal</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        value={formData.mainCrop}
                        onChange={(e) => setFormData({...formData, mainCrop: e.target.value})}
                      >
                          <option value="Arroz">Arroz</option>
                          <option value="Maíz">Maíz</option>
                          <option value="Café">Café</option>
                          <option value="Frijol">Frijol</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Estado</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                          <option value="Activa">Activa</option>
                          <option value="Inactiva">Inactiva</option>
                      </select>
                  </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
                  <button onClick={() => setViewMode('list')} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200">Cancelar</button>
                  <button onClick={handleCreate} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm flex items-center">
                      <Save className="h-5 w-5 mr-2" /> Guardar Finca
                  </button>
              </div>
          </div>
      </div>
  );

  const renderGeneralTab = (f: Farm) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-slate-400" /> Información Principal
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Finca</label>
                          <p className="font-medium text-slate-900">{f.name}</p>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Productor</label>
                          <p className="font-medium text-emerald-700 cursor-pointer hover:underline" onClick={() => onNavigate('ops-producers')}>{f.producerName}</p>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ubicación</label>
                          <p className="text-slate-700">{f.location}, {f.state}</p>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${f.status === 'Activa' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              {f.status}
                          </span>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                      <Map className="h-5 w-5 mr-2 text-slate-400" /> Superficies
                  </h3>
                  <div className="flex gap-4">
                      <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                          <p className="text-xs text-slate-500 font-bold uppercase">Total Propiedad</p>
                          <p className="text-2xl font-bold text-slate-800">{f.totalArea} ha</p>
                      </div>
                      <div className={`flex-1 p-3 rounded-lg border text-center ${f.overOccupied ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>
                          <p className={`text-xs font-bold uppercase ${f.overOccupied ? 'text-red-600' : 'text-blue-600'}`}>Área Operativa</p>
                          <p className={`text-2xl font-bold ${f.overOccupied ? 'text-red-700' : 'text-blue-700'}`}>{f.riceArea} ha</p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-slate-400" /> Datos Regulatorios
                  </h3>
                  <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-slate-500">Tenencia</span>
                          <span className="font-medium text-slate-800">{f.regulatory?.ownershipType || 'No registrado'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-slate-500">RIF / Identidad Finca</span>
                          <span className="font-medium text-slate-800">{f.regulatory?.taxId || 'Igual al Productor'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-slate-500">Código SUNAGRO</span>
                          <span className="font-mono text-slate-600 bg-slate-100 px-2 rounded">{f.regulatory?.sunagroCode || 'Pendiente'}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderGeoTab = (f: Farm) => (
      <div className="flex flex-col h-[600px] bg-slate-100 rounded-xl border border-slate-300 overflow-hidden relative animate-in fade-in">
          {/* Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg max-w-xs border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-emerald-600" /> Trazado de Geocerca
              </h4>
              <div className="flex items-center gap-1.5 mb-3">
                  <Shield className="h-3 w-3 text-blue-600" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Tecnología por <span className="text-blue-600">Agrocognitive</span></p>
              </div>
              <p className="text-xs text-slate-500 mb-3">Utilice el mapa para dibujar los polígonos que delimitan la finca y sus lotes.</p>
              
              <div className="space-y-2">
                  <button className="w-full flex items-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs font-bold transition-colors">
                      <PenTool className="h-3 w-3 mr-2" /> Dibujar Polígono Finca
                  </button>
                  <button className="w-full flex items-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs font-bold transition-colors">
                      <Plus className="h-3 w-3 mr-2" /> Agregar Lote Interno
                  </button>
                  <button className="w-full flex items-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors shadow-sm">
                      <Save className="h-3 w-3 mr-2" /> Guardar Geometría
                  </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs">Perímetro Total</span>
                      <span className="font-bold text-slate-800">{f.totalArea} ha</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs">Lotes Definidos</span>
                      <span className="font-bold text-slate-800">{f.fields?.length || 0}</span>
                  </div>
              </div>
          </div>
          
          {/* Mock Interactive Map */}
          <div className="flex-1 flex items-center justify-center bg-[#e5e7eb] relative cursor-crosshair group">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10" 
                   style={{backgroundImage: 'linear-gradient(#9ca3af 1px, transparent 1px), linear-gradient(90deg, #9ca3af 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
              </div>

              {/* Simulation of Satellite Map & Drawn Polygons */}
              <svg width="100%" height="100%" viewBox="0 0 800 600" className="drop-shadow-xl">
                  {/* Farm Boundary */}
                  <path 
                    d="M 150 150 L 350 100 L 650 150 L 600 400 L 200 400 Z" 
                    fill="rgba(59, 130, 246, 0.1)" 
                    stroke="#2563eb" 
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    className="hover:stroke-blue-600"
                  />
                  {/* Vertices */}
                  <circle cx="150" cy="150" r="5" fill="white" stroke="#2563eb" strokeWidth="2" />
                  <circle cx="350" cy="100" r="5" fill="white" stroke="#2563eb" strokeWidth="2" />
                  <circle cx="650" cy="150" r="5" fill="white" stroke="#2563eb" strokeWidth="2" />
                  <circle cx="600" cy="400" r="5" fill="white" stroke="#2563eb" strokeWidth="2" />
                  <circle cx="200" cy="400" r="5" fill="white" stroke="#2563eb" strokeWidth="2" />

                  <text x="350" y="300" fill="#2563eb" fontSize="20" fontWeight="bold" opacity="0.5">Área Finca</text>
              </svg>
              
              <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Haga clic para agregar punto
              </div>
          </div>
          
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] text-slate-500 shadow-sm flex items-center">
              <MousePointer2 className="h-3 w-3 mr-1" />
              Lat: {f.coordinates?.split(',')[0] || '8.000'} | Lng: {f.coordinates?.split(',')[1] || '-69.000'}
          </div>
      </div>
  );

  const renderLotsTab = (f: Farm) => (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Lotes de Producción</h3>
              <button onClick={() => onNavigate('ops-fields', { createForFarm: f.id })} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-emerald-700 flex items-center">
                  <Plus className="h-4 w-4 mr-1"/> Nuevo Lote
              </button>
          </div>
          <table className="w-full text-left text-sm">
              <thead className="bg-white text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                  <tr>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Uso</th>
                      <th className="px-4 py-3 text-right">Hectáreas</th>
                      <th className="px-4 py-3 text-center">Geocerca</th>
                      <th className="px-4 py-3 text-center">Cumplimiento Plan</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {f.fields?.map(lot => (
                      <tr key={lot.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{lot.code}</td>
                          <td className="px-4 py-3 text-slate-600">{lot.name}</td>
                          <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${lot.use === 'Semilla' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {lot.use}
                              </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">{lot.area}</td>
                          <td className="px-4 py-3 text-center">
                              {lot.geofenceActive ? (
                                  <span className="text-emerald-600"><MapPin className="h-4 w-4 mx-auto"/></span>
                              ) : (
                                  <span className="text-slate-300">-</span>
                              )}
                          </td>
                          <td className="px-4 py-3 text-center">
                              <div className="w-full bg-slate-200 rounded-full h-2 max-w-[80px] mx-auto">
                                  <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${lot.planCompliance || 0}%`}}></div>
                              </div>
                              <span className="text-xs text-slate-500 mt-1 block">{lot.planCompliance || 0}%</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => onNavigate('ops-fields', { fieldId: lot.id })}
                                className="text-emerald-600 hover:text-emerald-800 font-bold text-xs flex items-center justify-end w-full"
                              >
                                  Ver Plan <ArrowUpRight className="h-3 w-3 ml-1"/>
                              </button>
                          </td>
                      </tr>
                  ))}
                  {(!f.fields || f.fields.length === 0) && (
                      <tr><td colSpan={7} className="text-center py-8 text-slate-400">No hay lotes registrados en esta finca</td></tr>
                  )}
              </tbody>
          </table>
      </div>
  );

  const renderInputsTab = (f: Farm) => (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-600" /> Insumos en Finca (Stock Local)
          </h3>
          <p className="text-sm text-slate-500 mb-4">Inventario disponible en los almacenes de la finca reportado en las entregas.</p>
          
          <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                  <tr>
                      <th className="px-4 py-2">Producto</th>
                      <th className="px-4 py-2">Categoría</th>
                      <th className="px-4 py-2 text-right">Cantidad</th>
                      <th className="px-4 py-2 text-center">Estado</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  <tr>
                      <td className="px-4 py-3 font-medium">Urea</td>
                      <td className="px-4 py-3 text-slate-500">Fertilizante</td>
                      <td className="px-4 py-3 text-right font-bold">50 Sacos</td>
                      <td className="px-4 py-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">Disponible</span></td>
                  </tr>
              </tbody>
          </table>
      </div>
  );

  // --- VIEW LOGIC ---

  if (viewMode === 'create') {
      return renderCreateForm();
  }

  if (viewMode === 'list') {
      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Operaciones</span>
                      <ChevronRight className="h-4 w-4" />
                      <span className="text-slate-800 font-bold">Fincas</span>
                  </div>
                  <button onClick={() => setViewMode('create')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-bold hover:bg-emerald-700 flex items-center transition-colors">
                      <Plus className="h-4 w-4 mr-2" /> Nueva Finca
                  </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 shadow-sm">
                  <div className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 flex items-center shadow-inner">
                      <Search className="h-4 w-4 text-slate-400 mr-2" />
                      <input 
                          type="text" 
                          placeholder="Buscar finca o productor..." 
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
                              <th className="px-4 py-3">Finca</th>
                              <th className="px-4 py-3">Ubicación</th>
                              <th className="px-4 py-3">Productor</th>
                              <th className="px-4 py-3 text-right">Sup. Operativa</th>
                              <th className="px-4 py-3 text-center">Geocerca</th>
                              <th className="px-4 py-3 text-center">Semilla</th>
                              <th className="px-4 py-3 text-center">Última Visita</th>
                              <th className="px-4 py-3 text-center">Acción</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {filteredFarms.map(f => (
                              <tr key={f.id} onClick={() => handleSelectFarm(f)} className="hover:bg-slate-50 cursor-pointer group transition-colors">
                                  <td className="px-4 py-3 font-bold text-slate-800">{f.name}</td>
                                  <td className="px-4 py-3 text-slate-600">{f.location}, {f.state}</td>
                                  <td className="px-4 py-3 text-emerald-600 font-medium">{f.producerName}</td>
                                  <td className="px-4 py-3 text-right">
                                      <span className={f.overOccupied ? 'text-red-600 font-bold' : 'text-slate-600'}>
                                          {f.riceArea} / {f.totalArea} ha
                                      </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      {f.geofenceActive ? (
                                          <div className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full">
                                              <MapPin className="h-3 w-3" />
                                          </div>
                                      ) : (
                                          <div className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-400 rounded-full">
                                              <MapPin className="h-3 w-3" />
                                          </div>
                                      )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      {(f.activeSeedFieldsCount || 0) > 0 && (
                                          <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded border border-purple-200 font-bold">
                                              {f.activeSeedFieldsCount} Lotes
                                          </span>
                                      )}
                                  </td>
                                  <td className="px-4 py-3 text-center text-xs text-slate-500">
                                      {f.lastVisit || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      <button className="text-slate-400 group-hover:text-emerald-600">
                                          <ChevronRight className="h-5 w-5" />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {filteredFarms.length === 0 && (
                      <div className="p-8 text-center text-slate-500">No se encontraron fincas.</div>
                  )}
              </div>
          </div>
      );
  }

  // --- DETAIL VIEW ---
  if (!selectedFarm) return null;

  const tabs: {id: FarmTab, label: string, icon: any}[] = [
      { id: 'general', label: 'General', icon: Building },
      { id: 'geo', label: 'Mapa de Geocerca', icon: MapPin },
      { id: 'lots', label: 'Lotes Asociados', icon: Grid },
      { id: 'inputs', label: 'Insumos Asociados', icon: Truck },
      { id: 'agronomic', label: 'Info Agronómica', icon: Mountain },
  ];

  return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Operaciones</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="cursor-pointer hover:text-emerald-700" onClick={() => setViewMode('list')}>Fincas</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-slate-800 font-bold">{selectedFarm.name}</span>
              </div>
              <button onClick={() => setViewMode('list')} className="px-3 py-1.5 border border-slate-300 bg-white rounded text-sm text-slate-700 font-medium hover:bg-slate-50">
                  Volver
              </button>
          </div>

          {/* Farm Header Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start gap-6">
              <div className="h-20 w-20 bg-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center shrink-0">
                  <Map className="h-10 w-10 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 truncate">{selectedFarm.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-1">
                            <p className="text-slate-500 text-sm flex items-center"><MapPin className="h-3 w-3 mr-1"/> {selectedFarm.location}</p>
                            <p className="text-slate-500 text-sm flex items-center"><User className="h-3 w-3 mr-1"/> {selectedFarm.producerName}</p>
                        </div>
                      </div>
                      
                      {/* Alianza Agrocognitive Badge */}
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-500 shadow-sm">
                          <div className="bg-blue-600 p-1.5 rounded-lg">
                              <Zap className="h-4 w-4 text-white fill-white" />
                          </div>
                          <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 leading-none mb-1">Geocerca Alianza</p>
                              <p className="text-sm font-black text-blue-700 leading-none">Agrocognitive</p>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-4 text-xs mt-4">
                      <span className="flex items-center text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          <Grid className="h-3 w-3 mr-1"/> {selectedFarm.riceArea} ha Operativas
                      </span>
                      {selectedFarm.geofenceActive && (
                          <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                              <MapPin className="h-3 w-3 mr-1"/> Geocerca Activa
                          </span>
                      )}
                  </div>
              </div>
              <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm self-start md:self-center">
                  Editar
              </button>
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
              {activeTab === 'general' && renderGeneralTab(selectedFarm)}
              {activeTab === 'geo' && renderGeoTab(selectedFarm)}
              {activeTab === 'lots' && renderLotsTab(selectedFarm)}
              {activeTab === 'inputs' && renderInputsTab(selectedFarm)}
              {activeTab === 'agronomic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                              <Mountain className="h-5 w-5 mr-2 text-amber-600" /> Suelo y Nivelación
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                  <label className="block text-xs font-bold text-amber-800 uppercase mb-1">Tipo de Suelo</label>
                                  <p className="font-medium text-slate-800">{selectedFarm.agronomics?.soilType || 'No Registrado'}</p>
                              </div>
                              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                  <label className="block text-xs font-bold text-amber-800 uppercase mb-1">Nivelación</label>
                                  <p className="font-medium text-slate-800">{selectedFarm.agronomics?.leveling || 'No Registrado'}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );
};

export default DesktopFarms;
