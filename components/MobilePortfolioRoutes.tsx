
import React, { useState, useMemo } from 'react';
import { NavigationProps, Producer, RouteDay, VisitType, VisitStatus, Visit } from '../types';
import { useProducers } from '../context/ProducerContext';
import { useCredits } from '../context/CreditContext';
import { useVisits } from '../context/VisitContext';
import { 
  Search, Calendar, MoreVertical, 
  CreditCard, Sprout, Clock, Briefcase, Plus, X, Settings, MapPin, AlertCircle, ChevronRight,
  DollarSign, Activity, FileText, Navigation, Brain, Truck
} from 'lucide-react';

const MobilePortfolioRoutes: React.FC<NavigationProps> = ({ onNavigate, user }) => {
  const { producers } = useProducers();
  const { credits } = useCredits();
  const { addVisit } = useVisits();
  const [activeTab, setActiveTab] = useState<'cartera' | 'sugeridas' | 'programadas'>('cartera');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'credit' | 'seed' | 'alert'>('all');
  
  // Producer Action Sheet State
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);

  // --- FILTRADO DINÁMICO POR TÉCNICO LOGUEADO ---
  const filteredProducers = useMemo(() => {
      return producers.filter(p => {
          const isAssignedToMe = p.mainTechnician === user?.name;
          const isNewFromMobile = p.source === 'Mobile';
          if (!isAssignedToMe && !isNewFromMobile) return false;

          const matchesSearch = 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.vat.includes(searchTerm);

          const matchesFilter = 
              filter === 'all' ? true :
              filter === 'credit' ? p.creditActive :
              filter === 'seed' ? p.hasSeedFields :
              filter === 'alert' ? (p.activeAlertsCount || 0) > 0 : true;

          return matchesSearch && matchesFilter;
      });
  }, [producers, user?.name, searchTerm, filter]);

  const getProducerCredit = (name: string) => credits.find(c => c.producerName === name);

  const handleQuickVisitPlan = (producer: Producer) => {
    const visitCode = `VIS-AD-${Math.floor(Math.random() * 900 + 100)}`;
    const newVisit: Visit = {
        id: `v-adhoc-${Date.now()}`,
        code: visitCode,
        producerId: producer.id,
        producerName: producer.name,
        farmName: producer.farms[0]?.name || 'Finca Principal',
        date: new Date().toISOString().split('T')[0],
        type: VisitType.SEGUIMIENTO,
        status: VisitStatus.PENDIENTE_GESTION,
        technician: user?.name || 'Técnico',
        visitSource: 'Ad-hoc (Técnico)'
    };
    
    addVisit(newVisit);
    alert(`📅 Visita ${visitCode} generada exitosamente para ${producer.name}. Puede encontrarla en su sección de "Ruta" o "Visitas Pendientes".`);
    setSelectedProducer(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 relative mx-auto max-w-md w-full overflow-hidden border-x border-slate-800 shadow-2xl">
      
      {/* 1. HEADER COMPACTO */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
          <div className="flex justify-between items-center mb-4">
              <div>
                  <h1 className="text-xl font-bold text-white">Mi Gestión</h1>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none mt-1">
                      {user?.name || 'Técnico Aproscello'}
                  </p>
              </div>
              <button 
                onClick={() => onNavigate('profile')}
                className="h-9 w-9 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white border-2 border-slate-800 shadow-lg active:scale-90 transition-transform"
              >
                  {user?.name?.substring(0,2).toUpperCase() || 'TU'}
              </button>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('cartera')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'cartera' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                  Cartera ({filteredProducers.length})
              </button>
              <button 
                onClick={() => setActiveTab('sugeridas')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'sugeridas' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                  Sugeridas
              </button>
              <button 
                onClick={() => setActiveTab('programadas')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'programadas' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                  Itinerario
              </button>
          </div>
      </div>

      {/* 2. ÁREA DE LISTADO */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 scrollbar-hide">
          {activeTab === 'cartera' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex gap-2">
                      <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input 
                            type="text" 
                            placeholder="Buscar productor..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-emerald-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                          />
                      </div>
                      <button 
                        onClick={() => onNavigate('mobile-registration')}
                        className="bg-emerald-600 text-white px-3 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                      >
                          <Plus className="h-5 w-5" />
                      </button>
                  </div>

                  {/* Filtros de Estado */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border transition-all whitespace-nowrap ${filter === 'all' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Todos</button>
                      <button onClick={() => setFilter('alert')} className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border flex items-center transition-all whitespace-nowrap ${filter === 'alert' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><AlertCircle className="h-3 w-3 mr-1" /> Críticos</button>
                      <button onClick={() => setFilter('credit')} className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border flex items-center transition-all whitespace-nowrap ${filter === 'credit' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><CreditCard className="h-3 w-3 mr-1" /> Apoyos</button>
                  </div>

                  <div className="space-y-3">
                      {filteredProducers.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => setSelectedProducer(p)}
                            className="bg-slate-800 rounded-2xl p-4 border border-slate-700 relative active:bg-slate-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm group overflow-hidden"
                          >
                              {(p.activeAlertsCount || 0) > 0 && (
                                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg animate-pulse uppercase tracking-tighter">
                                      Alerta Activa
                                  </div>
                              )}
                              
                              <div className="flex justify-between items-start mb-2">
                                  <div className="min-w-0 flex-1">
                                      <h3 className="font-bold text-white text-base leading-tight truncate pr-4">{p.name}</h3>
                                      <p className="text-[10px] text-slate-400 flex items-center mt-1 truncate">
                                          <MapPin className="h-2.5 w-2.5 mr-1 text-slate-500" />
                                          {p.farms.length > 0 ? p.farms[0].name : 'Sin Finca Principal'}
                                      </p>
                                  </div>
                                  <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 ml-2">
                                      <ChevronRight className="h-3 w-3 text-slate-500" />
                                  </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5 mb-3">
                                  {p.creditActive && (
                                      <span className="bg-blue-900/30 text-blue-300 text-[8px] px-2 py-0.5 rounded-full border border-blue-800/50 flex items-center font-bold uppercase tracking-tighter">
                                          <DollarSign className="h-2 w-2 mr-1" /> Financiamiento
                                      </span>
                                  )}
                                  {p.hasSeedFields && (
                                      <span className="bg-purple-900/30 text-purple-300 text-[8px] px-2 py-0.5 rounded-full border border-purple-800/50 flex items-center font-bold uppercase tracking-tighter">
                                          <Sprout className="h-2.5 w-2.5 mr-1" /> Semilla
                                      </span>
                                  )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500 border-t border-slate-700/50 pt-2">
                                  <div className="flex items-center">
                                      <Clock className="h-2.5 w-2.5 mr-1 text-slate-600" /> 
                                      Ult: <span className="text-slate-300 ml-1 font-mono">{p.lastVisit || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center justify-end">
                                      <Calendar className="h-2.5 w-2.5 mr-1 text-emerald-600/70" /> 
                                      Prox: <span className="text-emerald-400 ml-1 font-bold">{p.nextVisit || '---'}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>

      {/* 3. PRODUCER ACTIONS SHEET */}
      {selectedProducer && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedProducer(null)}>
              <div 
                className="bg-slate-900 w-full max-w-md rounded-t-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 border-t border-slate-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                  <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-6"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                      <div className="min-w-0 flex-1">
                          <h2 className="text-xl font-bold text-white leading-tight truncate">{selectedProducer.name}</h2>
                          <p className="text-slate-400 text-[10px] flex items-center mt-1 uppercase font-bold tracking-wider">
                              <MapPin className="h-3 w-3 mr-1 text-emerald-500" />
                              {selectedProducer.farms[0]?.name || 'Sin finca registrada'}
                          </p>
                      </div>
                      <button onClick={() => setSelectedProducer(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 border border-slate-700 ml-4">
                          <X className="h-4 w-4" />
                      </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
                          <span className="text-[8px] text-slate-500 uppercase font-black mb-1 tracking-tighter">Financiamiento Disp.</span>
                          {getProducerCredit(selectedProducer.name) ? (
                              <div className="flex items-center gap-1">
                                  <span className="text-emerald-400 font-bold text-base leading-none tracking-tight">
                                    ${getProducerCredit(selectedProducer.name)?.amountAvailable.toLocaleString()}
                                  </span>
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                              </div>
                          ) : (
                              <span className="text-slate-500 text-[10px] italic">Sin apoyo activo</span>
                          )}
                      </div>
                      <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
                          <span className="text-[8px] text-slate-500 uppercase font-black mb-1 tracking-tighter">Estado de Cultivo</span>
                          <div className="flex items-center gap-1.5">
                              <Sprout className="h-3 w-3 text-emerald-500" />
                              <span className="text-slate-200 font-bold text-[10px]">Macollamiento</span>
                          </div>
                      </div>
                  </div>

                  {/* ACCIONES TÉCNICAS */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                      <button 
                        onClick={() => onNavigate('visits', { filter: 'producer', producerId: selectedProducer.id })} 
                        className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-700 active:bg-slate-700 transition-all gap-1.5 group"
                      >
                          <div className="bg-emerald-900/20 p-2 rounded-xl group-active:scale-90 transition-transform">
                              <Calendar className="h-5 w-5 text-emerald-400" />
                          </div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Historial</span>
                      </button>
                      
                      <button 
                        onClick={() => onNavigate('activities', { mode: 'create', producerId: selectedProducer.id, producerName: selectedProducer.name, farmId: selectedProducer.farms[0]?.id, farmName: selectedProducer.farms[0]?.name })} 
                        className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-700 active:bg-slate-700 transition-all gap-1.5 group"
                      >
                          <div className="bg-amber-900/20 p-2 rounded-xl group-active:scale-90 transition-transform">
                              <Activity className="h-5 w-5 text-amber-400" />
                          </div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Labor</span>
                      </button>

                      <button 
                        onClick={() => onNavigate('harvests', { producerId: selectedProducer.id })}
                        className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-700 active:bg-slate-700 transition-all gap-1.5 group"
                      >
                          <div className="bg-blue-900/20 p-2 rounded-xl group-active:scale-90 transition-transform">
                              <Truck className="h-5 w-5 text-blue-400" />
                          </div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Despacho</span>
                      </button>

                      <button 
                        onClick={() => onNavigate('diagnosis')}
                        className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-700 active:bg-slate-700 transition-all gap-1.5 group"
                      >
                          <div className="bg-purple-900/20 p-2 rounded-xl group-active:scale-90 transition-transform">
                              <Brain className="h-5 w-5 text-purple-400" />
                          </div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Diagnóstico</span>
                      </button>
                  </div>
                  
                  {/* ACCIÓN PRIMARIA: EMITIR ORDEN DE INSUMOS O PLANIFICAR VISITA */}
                  <div className="space-y-3">
                      <button 
                        onClick={() => handleQuickVisitPlan(selectedProducer)}
                        className="w-full bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xl active:scale-[0.98] transition-all"
                      >
                          <Calendar className="h-4 w-4 mr-3" />
                          Generar Visita Semanal
                      </button>
                      
                      <button 
                          onClick={() => onNavigate('activities', { mode: 'create', producerId: selectedProducer.id, producerName: selectedProducer.name, farmId: selectedProducer.farms[0]?.id, farmName: selectedProducer.farms[0]?.name })}
                          className="w-full bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xl active:scale-[0.98] transition-all"
                      >
                          <Plus className="h-4 w-4 mr-3" />
                          Emitir Orden de Insumos
                      </button>
                  </div>
                  
                  <p className="w-full py-1 text-slate-600 text-[8px] font-black uppercase tracking-[0.2em] text-center mt-4">
                      Deslizar para cerrar
                  </p>
              </div>
          </div>
      )}

    </div>
  );
};

export default MobilePortfolioRoutes;
