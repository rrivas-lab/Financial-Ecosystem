
import React, { useState, useEffect, useRef } from 'react';
import { NavigationProps, Producer, Farm, Field } from '../types';
import { useProducers } from '../context/ProducerContext';
import { useMasterData } from '../context/MasterDataContext';
import { 
  ChevronLeft, Home, User, MapPin, Grid, Plus, Save, 
  Search, Smartphone, AlertCircle, Edit2, ArrowLeft, Trash2,
  Briefcase, MousePointer2, Check, RotateCcw, X
} from 'lucide-react';

type RegisterTab = 'producer' | 'farm' | 'lot';
type SubViewMode = 'list' | 'create';

// Helper for Mock Map Editing
interface Point { x: number; y: number }

const MobileRegistration: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const { addProducer, updateProducer, getProducerByVat, producers } = useProducers();
  const { crops } = useMasterData(); 
  const [activeTab, setActiveTab] = useState<RegisterTab>('producer');
  
  // View State
  const [subView, setSubView] = useState<SubViewMode>('create');
  
  // Map/Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingContext, setDrawingContext] = useState<'farm' | 'lot' | null>(null);
  const [mapPoints, setMapPoints] = useState<Point[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Forms State
  const [producerForm, setProducerForm] = useState({ name: '', vat: '', phone: '', address: '' });
  const [farmForm, setFarmForm] = useState({ 
      producerId: '', name: '', location: '', coords: '', totalArea: '', operationalArea: '', 
      geofence: [] as {lat: number, lng: number}[] 
  });
  const [lotForm, setLotForm] = useState({ 
      farmId: '', name: '', area: '', crop: '',
      geofence: [] as {lat: number, lng: number}[]
  });

  // Lookup State
  const [existingProducer, setExistingProducer] = useState<string | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');

  // Handle Params
  useEffect(() => {
    if (params?.preSelectedProducerId) {
        setExistingProducer(params.preSelectedProducerId);
        const p = producers.find(prod => prod.id === params.preSelectedProducerId);
        if (p) {
            setProducerForm({
                name: p.name,
                vat: p.vat,
                phone: p.phone,
                address: p.address || ''
            });
        }
        if (params.initialTab) setActiveTab(params.initialTab);
        else setActiveTab('farm');
        setSubView('list');
    } else {
        setExistingProducer(null);
        setSubView('create');
    }
  }, [params, producers]);

  const selectedProducerObj = producers.find(p => p.id === existingProducer);
  const selectedFarmObj = selectedProducerObj?.farms.find(f => f.id === selectedFarmId);

  // --- MAP / DRAWING LOGIC ---

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMapPoints([...mapPoints, { x, y }]);
  };

  const openMapEditor = (context: 'farm' | 'lot') => {
      setDrawingContext(context);
      setMapPoints([]); // Start fresh or load existing if we mapped back
      setIsDrawing(true);
  };

  const saveGeometry = () => {
      // Mock conversion of screen points to LatLng relative to a base
      const baseLat = 8.92;
      const baseLng = -69.21;
      const geoPoints = mapPoints.map(p => ({
          lat: baseLat + (p.y * 0.00001), 
          lng: baseLng + (p.x * 0.00001)
      }));

      // Calculate pseudo-area based on points count for demo
      const estimatedArea = (mapPoints.length * 1.5).toFixed(1);

      if (drawingContext === 'farm') {
          setFarmForm({ 
              ...farmForm, 
              geofence: geoPoints, 
              totalArea: estimatedArea, // Auto-fill area
              coords: `${baseLat}, ${baseLng}` 
          });
      } else {
          setLotForm({ 
              ...lotForm, 
              geofence: geoPoints,
              area: estimatedArea // Auto-fill area
          });
      }
      setIsDrawing(false);
  };

  // --- SAVE HANDLERS ---

  const handleSaveProducer = () => {
      if (!producerForm.name || !producerForm.vat) { alert('Complete campos obligatorios'); return; }
      
      // Update logic
      if (existingProducer) {
          updateProducer(existingProducer, { name: producerForm.name, phone: producerForm.phone, address: producerForm.address });
          alert('Productor actualizado.');
          return;
      }
      
      // Create logic
      const cleanVat = producerForm.vat.replace(/[- ]/g, '').toUpperCase();
      if (producers.some(p => p.vat.replace(/[- ]/g, '').toUpperCase() === cleanVat)) {
          alert('Productor ya registrado.');
          return;
      }

      const newProducer: Producer & { source: 'Mobile' } = {
          id: Date.now().toString(),
          name: producerForm.name, vat: producerForm.vat, type: 'Natural', email: '', 
          phone: producerForm.phone, address: producerForm.address, status: 'Pendiente', source: 'Mobile',
          creditActive: false, filesStatus: 'Incompleto', farms: [], activeCreditsCount: 0
      };
      
      addProducer(newProducer);
      alert(`Productor registrado en estado PENDIENTE.\n\nSe ha notificado a la central para la validación de recaudos y activación.`);
      setExistingProducer(newProducer.id);
      if(window.confirm('¿Desea registrar la finca ahora?')) { setActiveTab('farm'); setSubView('create'); }
  };

  const handleSaveFarm = () => {
      if (!selectedProducerObj || !farmForm.name) return;
      const newFarm: Farm = {
          id: `f-${Date.now()}`,
          name: farmForm.name,
          location: farmForm.location,
          coordinates: farmForm.coords,
          producerId: selectedProducerObj.id,
          producerName: selectedProducerObj.name,
          totalArea: parseFloat(farmForm.totalArea) || 0,
          riceArea: parseFloat(farmForm.operationalArea) || 0,
          status: 'Activa',
          geofenceActive: farmForm.geofence.length > 0,
          geofencePolygon: farmForm.geofence,
          fields: []
      };
      const updatedFarms = [...selectedProducerObj.farms, newFarm];
      updateProducer(selectedProducerObj.id, { farms: updatedFarms });
      alert(`Finca "${farmForm.name}" agregada.`);
      setFarmForm({ producerId: '', name: '', location: '', coords: '', totalArea: '', operationalArea: '', geofence: [] });
      setSubView('list');
  };

  const handleSaveLot = () => {
      if (!selectedProducerObj || !selectedFarmId || !lotForm.name) return;
      const newLot: Field = {
          id: `l-${Date.now()}`,
          farmId: selectedFarmId,
          farmName: selectedFarmObj?.name,
          producerName: selectedProducerObj.name,
          name: lotForm.name,
          code: `L-${Math.floor(Math.random()*1000)}`,
          area: parseFloat(lotForm.area) || 0,
          crop: lotForm.crop,
          use: 'Consumo',
          status: 'Planificado',
          geofenceActive: lotForm.geofence.length > 0,
          geofencePolygon: lotForm.geofence,
          planCompliance: 0
      };
      const updatedFarms = selectedProducerObj.farms.map(f => {
          if (f.id === selectedFarmId) return { ...f, fields: [...(f.fields || []), newLot] };
          return f;
      });
      updateProducer(selectedProducerObj.id, { farms: updatedFarms });
      alert(`Lote "${lotForm.name}" registrado.`);
      setLotForm({ farmId: '', name: '', area: '', crop: '', geofence: [] });
      setSubView('list');
  };

  const handleSearchProducer = () => {
      if (!producerForm.vat) { alert("Ingrese Cédula/RIF"); return; }
      const cleanVat = producerForm.vat.replace(/[- ]/g, '').toUpperCase();
      const found = producers.find(p => p.vat.replace(/[- ]/g, '').toUpperCase() === cleanVat);
      if (found) {
          alert(`Encontrado: ${found.name}`);
          setExistingProducer(found.id);
          setProducerForm({ name: found.name, vat: found.vat, phone: found.phone, address: found.address || '' });
          setActiveTab('farm'); setSubView('list');
      } else {
          alert("Documento no registrado. Proceda con la creación.");
      }
  };

  // --- MAP EDITOR OVERLAY ---
  if (isDrawing) {
      return (
          <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
              {/* Toolbar */}
              <div className="bg-slate-800 p-4 flex justify-between items-center shadow-lg border-b border-slate-700">
                  <h3 className="text-white font-bold flex items-center">
                      <MousePointer2 className="h-5 w-5 mr-2 text-emerald-400" />
                      Trazar {drawingContext === 'farm' ? 'Geocerca Finca' : 'Límites Lote'}
                  </h3>
                  <div className="flex gap-2">
                      <button onClick={() => setMapPoints([])} className="p-2 bg-slate-700 rounded text-slate-300"><RotateCcw className="h-5 w-5" /></button>
                      <button onClick={() => setIsDrawing(false)} className="p-2 bg-slate-700 rounded text-red-400"><X className="h-5 w-5" /></button>
                  </div>
              </div>

              {/* Canvas Area */}
              <div 
                  ref={mapRef}
                  onClick={handleMapClick}
                  className="flex-1 bg-slate-800 relative overflow-hidden cursor-crosshair"
                  style={{
                      backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                  }}
              >
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                      <span className="text-6xl font-bold text-slate-600 -rotate-12">MAPA SATELITAL</span>
                  </div>
                  
                  {/* Render Polygon */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {mapPoints.length > 0 && (
                          <>
                              <polygon 
                                  points={mapPoints.map(p => `${p.x},${p.y}`).join(' ')}
                                  fill="rgba(16, 185, 129, 0.3)"
                                  stroke="#10b981"
                                  strokeWidth="2"
                              />
                              {/* Draw line to cursor could be added here if we tracked mouse move */}
                              {mapPoints.map((p, i) => (
                                  <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#10b981" />
                              ))}
                          </>
                      )}
                  </svg>

                  {/* Instructions */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg text-xs text-white text-center pointer-events-none">
                      Toque la pantalla para agregar puntos. {mapPoints.length} puntos definidos.
                  </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-800 border-t border-slate-700">
                  <button 
                      onClick={saveGeometry}
                      disabled={mapPoints.length < 3}
                      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center shadow-lg transition-all ${
                          mapPoints.length < 3 
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-500'
                      }`}
                  >
                      <Save className="h-5 w-5 mr-2" /> Guardar Geometría
                  </button>
              </div>
          </div>
      );
  }

  // --- MAIN RENDER ---
  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
              <button onClick={() => onNavigate('portfolio')} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                  <ChevronLeft className="h-6 w-6" />
              </button>
              <div>
                  <h1 className="text-lg font-bold text-white">Registro Maestros</h1>
                  <p className="text-xs text-slate-400 flex items-center">
                      <Briefcase className="h-3 w-3 mr-1" /> Gestión de Datos
                  </p>
              </div>
          </div>
          <button onClick={() => onNavigate('selector')} className="p-2 bg-slate-800 rounded-full text-slate-400">
              <Home className="h-5 w-5" />
          </button>
      </div>

      {/* Tabs */}
      <div className="flex p-4 gap-2">
          {[
              { id: 'producer', label: 'Productor', icon: User },
              { id: 'farm', label: 'Finca', icon: MapPin },
              { id: 'lot', label: 'Lote', icon: Grid }
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { 
                    setActiveTab(tab.id as RegisterTab); 
                    if (tab.id === 'producer') setSubView('create');
                    else setSubView(existingProducer ? 'list' : 'create');
                }} 
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex flex-col items-center gap-1 ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                  <tab.icon className="h-5 w-5" /> {tab.label}
              </button>
          ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* TAB: PRODUCTOR */}
          {activeTab === 'producer' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-white">Datos Personales</h3>
                          {existingProducer && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Modo Edición</span>}
                      </div>
                      <div className="space-y-3">
                          <div>
                              <label className="text-xs text-slate-400 font-bold uppercase">Cédula / RIF</label>
                              <div className="flex gap-2">
                                  <input type="text" className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg" value={producerForm.vat} onChange={e => setProducerForm({...producerForm, vat: e.target.value})} disabled={!!existingProducer} />
                                  {!existingProducer && <button onClick={handleSearchProducer} className="p-3 rounded-lg bg-blue-600 text-white"><Search className="h-5 w-5" /></button>}
                              </div>
                          </div>
                          <div><label className="text-xs text-slate-400 font-bold uppercase">Nombre</label><input type="text" className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg" value={producerForm.name} onChange={e => setProducerForm({...producerForm, name: e.target.value})} /></div>
                          <div><label className="text-xs text-slate-400 font-bold uppercase">Teléfono</label><input type="tel" className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg" value={producerForm.phone} onChange={e => setProducerForm({...producerForm, phone: e.target.value})} /></div>
                          <div><label className="text-xs text-slate-400 font-bold uppercase">Dirección</label><textarea rows={2} className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg" value={producerForm.address} onChange={e => setProducerForm({...producerForm, address: e.target.value})} /></div>
                      </div>
                  </div>
                  <button onClick={handleSaveProducer} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-500 flex items-center justify-center">
                      <Save className="h-5 w-5 mr-2" /> {existingProducer ? 'Actualizar' : 'Guardar y Enviar'}
                  </button>
              </div>
          )}

          {/* TAB: FINCA */}
          {activeTab === 'farm' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  {existingProducer ? (
                      <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg flex items-center gap-3"><User className="h-5 w-5 text-emerald-400" /><div><span className="text-xs text-slate-400 uppercase font-bold">Productor</span><p className="text-white font-bold">{selectedProducerObj?.name}</p></div></div>
                  ) : (
                      <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-lg text-amber-200 text-sm flex items-center"><AlertCircle className="h-5 w-5 mr-2" /> Seleccione productor primero.</div>
                  )}

                  {subView === 'list' && existingProducer && (
                      <>
                          <div className="flex justify-between items-center"><h3 className="text-white font-bold">Fincas Registradas</h3><button onClick={() => setSubView('create')} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center shadow-sm"><Plus className="h-3 w-3 mr-1" /> Nueva</button></div>
                          <div className="space-y-3">
                              {selectedProducerObj?.farms.length === 0 ? <div className="text-center py-8 text-slate-500 bg-slate-800 rounded-xl">Sin registros</div> : selectedProducerObj?.farms.map(f => (
                                  <div key={f.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center"><div><h4 className="font-bold text-white">{f.name}</h4><p className="text-xs text-slate-400">{f.location} • {f.totalArea} ha</p></div><button className="p-2 bg-slate-700 rounded-full text-slate-300"><Edit2 className="h-4 w-4" /></button></div>
                              ))}
                          </div>
                      </>
                  )}

                  {(subView === 'create' || !existingProducer) && (
                      <div className={`bg-slate-800 p-4 rounded-xl border border-slate-700 ${!existingProducer ? 'opacity-50 pointer-events-none' : ''}`}>
                          <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white">Nueva Finca</h3>{existingProducer && <button onClick={() => setSubView('list')} className="text-xs text-slate-400 flex items-center"><ArrowLeft className="h-3 w-3 mr-1" /> Volver</button>}</div>
                          <div className="space-y-3">
                              <div><label className="text-xs text-slate-400 font-bold uppercase">Nombre</label><input type="text" className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg" value={farmForm.name} onChange={e => setFarmForm({...farmForm, name: e.target.value})} /></div>
                              <div><label className="text-xs text-slate-400 font-bold uppercase">Ubicación</label><input type="text" className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg" value={farmForm.location} onChange={e => setFarmForm({...farmForm, location: e.target.value})} /></div>
                              
                              <div className="p-3 bg-slate-900 rounded-lg border border-slate-600">
                                  <label className="text-xs text-slate-400 font-bold uppercase block mb-2">Geometría y Área</label>
                                  <div className="flex gap-2 mb-2">
                                      <button onClick={() => openMapEditor('farm')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center font-bold text-sm">
                                          <MapPin className="h-4 w-4 mr-2" /> {farmForm.geofence.length > 0 ? 'Modificar Geocerca' : 'Definir Geocerca'}
                                      </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                      <div><label className="text-[10px] text-slate-500 uppercase">Área Total</label><input type="number" className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded text-sm" value={farmForm.totalArea} onChange={e => setFarmForm({...farmForm, totalArea: e.target.value})} /></div>
                                      <div><label className="text-[10px] text-slate-500 uppercase">Área Op.</label><input type="number" className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded text-sm" value={farmForm.operationalArea} onChange={e => setFarmForm({...farmForm, operationalArea: e.target.value})} /></div>
                                  </div>
                              </div>
                          </div>
                          <button onClick={handleSaveFarm} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg hover:bg-emerald-500">Guardar Finca</button>
                      </div>
                  )}
              </div>
          )}

          {/* TAB: LOTE */}
          {activeTab === 'lot' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Finca Asociada</label>
                      <select className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg text-sm" disabled={!existingProducer} value={selectedFarmId} onChange={(e) => { setSelectedFarmId(e.target.value); setSubView('list'); }}>
                          <option value="">-- Seleccione --</option>
                          {selectedProducerObj?.farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                  </div>

                  {selectedFarmId && (
                      <>
                          {subView === 'list' && (
                              <>
                                  <div className="flex justify-between items-center"><h3 className="text-white font-bold">Lotes en {selectedFarmObj?.name}</h3><button onClick={() => setSubView('create')} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center shadow-sm"><Plus className="h-3 w-3 mr-1" /> Nuevo</button></div>
                                  <div className="space-y-3">
                                      {selectedFarmObj?.fields && selectedFarmObj.fields.length > 0 ? selectedFarmObj.fields.map(f => (
                                          <div key={f.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center"><div><h4 className="font-bold text-white">{f.name}</h4><p className="text-xs text-slate-400">{f.crop} • {f.area} ha</p></div><div className="px-2 py-1 bg-slate-700 rounded text-[10px] text-slate-300">{f.status}</div></div>
                                      )) : <div className="text-center py-6 text-slate-500 italic bg-slate-800/50 rounded-xl">Sin lotes</div>}
                                  </div>
                              </>
                          )}

                          {subView === 'create' && (
                              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 animate-in fade-in">
                                  <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white">Nuevo Lote</h3><button onClick={() => setSubView('list')} className="text-xs text-slate-400 flex items-center hover:text-white"><ArrowLeft className="h-3 w-3 mr-1" /> Volver</button></div>
                                  <div className="space-y-3">
                                      <div><label className="text-xs text-slate-400 font-bold uppercase">Nombre</label><input type="text" className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg" value={lotForm.name} onChange={e => setLotForm({...lotForm, name: e.target.value})} /></div>
                                      
                                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-600">
                                          <label className="text-xs text-slate-400 font-bold uppercase block mb-2">Límites y Superficie</label>
                                          <button onClick={() => openMapEditor('lot')} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center font-bold text-sm mb-2">
                                              <MousePointer2 className="h-4 w-4 mr-2" /> {lotForm.geofence.length > 0 ? 'Modificar Trazado' : 'Trazar Lote en Mapa'}
                                          </button>
                                          <div><label className="text-[10px] text-slate-500 uppercase">Área (ha)</label><input type="number" className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded text-sm" value={lotForm.area} onChange={e => setLotForm({...lotForm, area: e.target.value})} /></div>
                                      </div>

                                      <div>
                                          <label className="text-xs text-slate-400 font-bold uppercase">Cultivo</label>
                                          <select className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg" value={lotForm.crop} onChange={e => setLotForm({...lotForm, crop: e.target.value})}>
                                              <option value="">Seleccionar...</option>
                                              {crops.filter(c => c.status === 'Activo').map(c => <option key={c.id} value={`${c.name} ${c.variety}`}>{c.name} ({c.variety})</option>)}
                                          </select>
                                      </div>
                                  </div>
                                  <button onClick={handleSaveLot} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg hover:bg-emerald-500">Guardar Lote</button>
                              </div>
                          )}
                      </>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};

export default MobileRegistration;
