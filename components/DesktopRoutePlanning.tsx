
import React, { useState } from 'react';
import { NavigationProps, RouteDay, RoutePlan, RouteStop } from '../types';
import { useRoutes } from '../context/RouteContext';
import { useProducers } from '../context/ProducerContext';
import { Map, Calendar, Users, ArrowRight, CheckCircle, Navigation, Clock, Search, MapPin, Save, RefreshCw, Plus, ChevronRight, Eye, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const DesktopRoutePlanning: React.FC<NavigationProps> = ({ onNavigate }) => {
  const { plans, setActivePlan, addPlan } = useRoutes(); 
  const { producers, sendMessageToProducer } = useProducers(); // Consume producers to match name-based mocks
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedPlan, setSelectedPlan] = useState<RoutePlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Wizard State
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [config, setConfig] = useState({
    startDate: '',
    endDate: '',
    startPoint: 'Sede Aproscello',
    endPoint: 'Retorno a Sede',
    maxVisits: 5,
    technicians: 'Todos'
  });
  const [generatedId, setGeneratedId] = useState('');
  const [generatedDays, setGeneratedDays] = useState<RouteDay[]>([]);

  // --- ACTIONS ---

  const handleGenerate = () => {
    setTimeout(() => {
        // Mock Generation
        const days: RouteDay[] = [
            {
                id: `rd-${Date.now()}-1`, date: config.startDate || '2025-10-28', dayLabel: 'Día 1', status: 'Borrador', technicianId: 't1', totalKm: 45,
                stops: [
                    { id: 's1', visitCode: 'VIS-NEW-101', sequence: 1, farmName: 'Finca La Esperanza', producerName: 'Juan Pérez', fieldId: 'f1', fieldName: 'Lote A', lat: 0, lng: 0, priorityLevel: 'Alta', status: 'Pendiente', estimatedTime: '45 min', reason: 'Inspección Semilla' },
                    { id: 's2', visitCode: 'VIS-NEW-102', sequence: 2, farmName: 'Hato Grande', producerName: 'Agro El Sol', fieldId: 'f2', fieldName: 'Lote 4', lat: 0, lng: 0, priorityLevel: 'Alta', status: 'Pendiente', estimatedTime: '30 min', reason: 'Pre-Crédito' }
                ]
            },
            {
                id: `rd-${Date.now()}-2`, date: '2025-10-29', dayLabel: 'Día 2', status: 'Borrador', technicianId: 't1', totalKm: 38,
                stops: [
                    { id: 's3', visitCode: 'VIS-NEW-103', sequence: 1, farmName: 'Los Andes', producerName: 'Pedro Sanchez', fieldId: 'f3', fieldName: 'Lote 1', lat: 0, lng: 0, priorityLevel: 'Media', status: 'Pendiente', estimatedTime: '60 min', reason: 'Seguimiento' }
                ]
            }
        ];
        setGeneratedDays(days);
        setWizardStep(2);
    }, 800);
  };

  const handleConfirmWizard = () => {
      const newId = `PLAN-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      setGeneratedId(newId);
      
      const newPlan: RoutePlan = {
          id: newId,
          startDate: config.startDate,
          endDate: config.endDate,
          technicianId: 'Ing. Mendez', // Mock
          status: 'Activo',
          days: generatedDays
      };

      // Add to global context
      addPlan(newPlan);
      
      // Send notifications to producers
      generatedDays.forEach(day => {
          day.stops.forEach(stop => {
              // Find producer to get ID (Mock matching by name for desktop demo)
              const producer = producers.find(p => p.name === stop.producerName);
              if (producer) {
                   const msg = `🔔 *VISITA PROGRAMADA*\n\nEstimado productor, se ha agendado la visita técnica **${stop.visitCode}** para el día **${day.date}**.\n\n📍 Finca: ${stop.farmName}\n🔧 Motivo: ${stop.reason}\n\nPor favor asegúrese de estar presente.`;
                   sendMessageToProducer(producer.id, msg);
              }
          });
      });
      
      // If needed, set as active for mobile
      setActivePlan(newPlan);

      setWizardStep(3);
  };

  const handleFinishWizard = () => {
      setWizardStep(1);
      setConfig({ startDate: '', endDate: '', startPoint: 'Sede Aproscello', endPoint: 'Retorno a Sede', maxVisits: 5, technicians: 'Todos' });
      setViewMode('list');
  };

  // --- RENDERERS ---

  const renderList = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex justify-between items-center">
              <div>
                  <h1 className="text-2xl font-bold text-slate-800">Planificación de Rutas</h1>
                  <p className="text-sm text-slate-500">Gestión de itinerarios y asignación de técnicos</p>
              </div>
              <button 
                onClick={() => setViewMode('create')}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium hover:bg-emerald-700 flex items-center transition-colors"
              >
                  <Plus className="h-4 w-4 mr-2" /> Nueva Planificación
              </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                      <tr>
                          <th className="px-6 py-4">ID Plan</th>
                          <th className="px-6 py-4">Técnico</th>
                          <th className="px-6 py-4">Periodo</th>
                          <th className="px-6 py-4 text-center">Días</th>
                          <th className="px-6 py-4 text-center">Estado</th>
                          <th className="px-6 py-4 text-center">Acciones</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {plans.map(plan => (
                          <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-800">{plan.id}</td>
                              <td className="px-6 py-4 text-slate-600 flex items-center">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center mr-2 text-[10px] font-bold text-slate-500">
                                      {plan.technicianId.substring(0,2)}
                                  </div>
                                  {plan.technicianId}
                              </td>
                              <td className="px-6 py-4 text-slate-600">
                                  <span className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1 text-slate-400" /> 
                                      {plan.startDate} <span className="mx-1">→</span> {plan.endDate}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-center font-medium text-slate-700">{plan.days.length}</td>
                              <td className="px-6 py-4 text-center">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                      plan.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' :
                                      plan.status === 'Finalizado' ? 'bg-slate-100 text-slate-600' :
                                      'bg-amber-100 text-amber-700'
                                  }`}>
                                      {plan.status}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <button 
                                    onClick={() => { setSelectedPlan(plan); setViewMode('detail'); }}
                                    className="text-emerald-600 hover:text-emerald-800 font-medium text-xs flex items-center justify-center mx-auto"
                                  >
                                      <Eye className="h-4 w-4 mr-1" /> Ver Detalle
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderDetail = () => {
      if (!selectedPlan) return null;

      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Operaciones</span>
                      <ChevronRight className="h-4 w-4" />
                      <span className="cursor-pointer hover:text-emerald-700" onClick={() => setViewMode('list')}>Planificación</span>
                      <ChevronRight className="h-4 w-4" />
                      <span className="text-slate-800 font-bold">{selectedPlan.id}</span>
                  </div>
                  <button onClick={() => setViewMode('list')} className="px-3 py-1.5 border border-slate-300 bg-white rounded text-sm text-slate-700 font-medium hover:bg-slate-50">
                      Volver
                  </button>
              </div>

              {/* Plan Header */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-1">Detalle de Planificación</h2>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center"><Users className="h-4 w-4 mr-1"/> Técnico: {selectedPlan.technicianId}</span>
                          <span className="flex items-center"><Calendar className="h-4 w-4 mr-1"/> {selectedPlan.startDate} al {selectedPlan.endDate}</span>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Estado</p>
                      <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase ${
                          selectedPlan.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                          {selectedPlan.status}
                      </span>
                  </div>
              </div>

              {/* Days List */}
              <div className="space-y-4">
                  {selectedPlan.days.map((day, idx) => (
                      <div key={day.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <div 
                            className="p-4 bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                          >
                              <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                                      {idx + 1}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-slate-800">{day.dayLabel || `Día ${idx + 1}`} <span className="font-normal text-slate-500 text-sm">({day.date})</span></h3>
                                      <p className="text-xs text-slate-500">{day.stops.length} Visitas • {day.totalKm} km est.</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${day.status === 'Finalizada' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
                                      {day.status}
                                  </span>
                                  {expandedDay === day.id ? <ChevronUp className="h-5 w-5 text-slate-400"/> : <ChevronDown className="h-5 w-5 text-slate-400"/>}
                              </div>
                          </div>

                          {expandedDay === day.id && (
                              <div className="p-4 border-t border-slate-100 bg-white animate-in slide-in-from-top-2">
                                  {day.stops.length > 0 ? (
                                      <table className="w-full text-left text-sm">
                                          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                              <tr>
                                                  <th className="px-4 py-2">Seq</th>
                                                  <th className="px-4 py-2">Correlativo</th>
                                                  <th className="px-4 py-2">Finca / Productor</th>
                                                  <th className="px-4 py-2">Motivo</th>
                                                  <th className="px-4 py-2 text-center">Estado</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                              {day.stops.map(stop => (
                                                  <tr key={stop.id} className="hover:bg-slate-50">
                                                      <td className="px-4 py-3 font-mono text-slate-500">{stop.sequence}</td>
                                                      <td className="px-4 py-3 font-bold text-emerald-700">{stop.visitCode}</td>
                                                      <td className="px-4 py-3">
                                                          <div className="font-medium text-slate-800">{stop.farmName}</div>
                                                          <div className="text-xs text-slate-500">{stop.producerName}</div>
                                                      </td>
                                                      <td className="px-4 py-3 text-slate-600">{stop.reason}</td>
                                                      <td className="px-4 py-3 text-center">
                                                          <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                                                              stop.status === 'Completada' ? 'bg-emerald-100 text-emerald-700' : 
                                                              stop.status === 'En Sitio' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                                          }`}>
                                                              {stop.status}
                                                          </span>
                                                      </td>
                                                  </tr>
                                              ))}
                                          </tbody>
                                      </table>
                                  ) : (
                                      <p className="text-center text-slate-400 py-4 italic">No hay paradas configuradas.</p>
                                  )}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const renderWizard = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
             <div className="flex items-center space-x-2 text-sm text-slate-500">
                 <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Operaciones</span>
                 <ArrowRight className="h-4 w-4" />
                 <span className="cursor-pointer hover:text-emerald-700" onClick={() => setViewMode('list')}>Planificación</span>
                 <ArrowRight className="h-4 w-4" />
                 <span className="text-slate-800 font-bold">Nueva Planificación</span>
             </div>
          </div>

          {wizardStep === 1 && (
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 p-6 border-b border-slate-200">
                      <h2 className="text-xl font-bold text-slate-800 flex items-center">
                          <Map className="h-6 w-6 mr-3 text-emerald-600" />
                          Configuración de Planificación
                      </h2>
                      <p className="text-slate-500 mt-1">Defina los parámetros para generar las rutas automáticas de los técnicos.</p>
                  </div>
                  
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                          <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b pb-2 mb-4">Parámetros Temporales</h3>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Fecha Inicio</label>
                              <input type="date" className="w-full p-3 border rounded-lg" value={config.startDate} onChange={e => setConfig({...config, startDate: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Fecha Fin</label>
                              <input type="date" className="w-full p-3 border rounded-lg" value={config.endDate} onChange={e => setConfig({...config, endDate: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Visitas Máximas por Día</label>
                              <input type="number" className="w-full p-3 border rounded-lg" value={config.maxVisits} onChange={e => setConfig({...config, maxVisits: parseInt(e.target.value)})} />
                          </div>
                      </div>

                      <div className="space-y-4">
                          <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b pb-2 mb-4">Logística y Asignación</h3>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Punto de Partida</label>
                              <div className="flex gap-2">
                                  <span className="p-3 bg-slate-100 border border-slate-300 rounded-l-lg"><MapPin className="h-5 w-5 text-slate-500"/></span>
                                  <input type="text" className="flex-1 p-3 border rounded-r-lg" value={config.startPoint} onChange={e => setConfig({...config, startPoint: e.target.value})} />
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Punto Final (Retorno)</label>
                              <div className="flex gap-2">
                                  <span className="p-3 bg-slate-100 border border-slate-300 rounded-l-lg"><MapPin className="h-5 w-5 text-slate-500"/></span>
                                  <input type="text" className="flex-1 p-3 border rounded-r-lg" value={config.endPoint} onChange={e => setConfig({...config, endPoint: e.target.value})} />
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Técnicos a Planificar</label>
                              <select className="w-full p-3 border rounded-lg bg-white">
                                  <option>Todos los Técnicos Activos</option>
                                  <option>Zona Norte (Ing. Mendez)</option>
                                  <option>Zona Sur (Ing. Ruiz)</option>
                              </select>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                      <button onClick={() => setViewMode('list')} className="px-6 py-3 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-white">Cancelar</button>
                      <button 
                        onClick={handleGenerate}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-700 flex items-center transition-all"
                      >
                          <RefreshCw className="h-5 w-5 mr-2" />
                          Generar Propuesta
                      </button>
                  </div>
              </div>
          )}

          {wizardStep === 2 && (
              <div className="flex flex-col h-[600px] gap-6">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center">
                      <div>
                          <h3 className="font-bold text-blue-800">Propuesta Generada</h3>
                          <p className="text-sm text-blue-600">Se han distribuido {generatedDays.reduce((acc, d) => acc + d.stops.length, 0)} visitas pendientes en {generatedDays.length} días de ruta.</p>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => setWizardStep(1)} className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg font-bold hover:bg-blue-100">Ajustar Parámetros</button>
                          <button onClick={handleConfirmWizard} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700">Confirmar Planificación</button>
                      </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 flex-1">
                      {generatedDays.map((day, idx) => (
                          <div key={day.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                              <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
                                  <span>{day.dayLabel} <span className="text-xs font-normal text-slate-500">({day.date})</span></span>
                                  <span className="text-xs bg-white px-2 py-1 rounded border">{day.stops.length} Visitas</span>
                              </div>
                              <div className="p-3 flex-1 overflow-y-auto space-y-2">
                                  {day.stops.map(stop => (
                                      <div key={stop.id} className="p-3 border rounded-lg bg-slate-50 text-sm hover:bg-white hover:shadow-sm transition-all">
                                          <div className="flex justify-between mb-1">
                                              <span className="font-bold text-slate-800">{stop.producerName}</span>
                                              <span className="text-[10px] text-slate-400 font-mono">{stop.visitCode}</span>
                                          </div>
                                          <div className="text-xs text-emerald-600 font-semibold mb-1">{stop.reason}</div>
                                          <div className="text-xs text-slate-500">{stop.farmName} • {stop.estimatedTime}</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {wizardStep === 3 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm animate-in zoom-in duration-300">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="h-12 w-12 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Planificación Confirmada!</h2>
                  <p className="text-slate-500 mb-8 max-w-md text-center">Se han asignado las rutas a los técnicos correspondientes y se ha sincronizado con sus dispositivos móviles.</p>
                  
                  <div className="bg-slate-50 px-8 py-4 rounded-xl border border-slate-200 text-center mb-8">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Correlativo de Planificación</p>
                      <p className="text-4xl font-mono font-bold text-slate-900 tracking-wider">{generatedId}</p>
                  </div>

                  <div className="flex gap-4">
                      <button onClick={handleFinishWizard} className="px-6 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900">Volver a la Lista</button>
                  </div>
              </div>
          )}
      </div>
  );

  return (
      <>
        {viewMode === 'list' && renderList()}
        {viewMode === 'detail' && renderDetail()}
        {viewMode === 'create' && renderWizard()}
      </>
  );
};

export default DesktopRoutePlanning;
