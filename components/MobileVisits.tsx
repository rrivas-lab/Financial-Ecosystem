
import React, { useState, useEffect } from 'react';
import { Visit, VisitStatus, VisitType, NavigationProps } from '../types';
import { useVisits } from '../context/VisitContext';
import { Calendar, MapPin, ChevronLeft, Home, Play, CheckCircle, Clock, CheckSquare, AlertTriangle, X, Hash } from 'lucide-react';

type TabType = 'todas' | 'sugeridas' | 'en_proceso' | 'finalizadas';

const MobileVisits: React.FC<NavigationProps> = ({ onNavigate, params, user }) => {
  const { visits } = useVisits();
  const [activeTab, setActiveTab] = useState<TabType>('todas');
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
      if (params?.filter === 'expired') {
          setActiveFilter('expired');
      } else {
          setActiveFilter(null);
      }
  }, [params]);

  useEffect(() => {
      // 1. Get visits from Context
      let subset = visits;

      // 2. Filter by Technician (if user is defined and is a technician)
      if (user && user.role === 'tecnico') {
          // Assuming user.name matches the 'technician' field in Visit
          subset = subset.filter(v => v.technician === user.name);
      }

      // 3. Apply status/tab filters
      if (activeFilter === 'expired') {
          const mockToday = new Date().toISOString().split('T')[0];
          subset = subset.filter(v => 
            v.date < mockToday && 
            v.status !== VisitStatus.CERRADA && 
            v.status !== VisitStatus.ANULADA
          );
      } else {
          if (activeTab === 'todas') {
              // Show all active/pending/closed except maybe Cancelled? Or show all.
              // Showing all for now.
          } else if (activeTab === 'sugeridas') {
              subset = subset.filter(v => v.status === VisitStatus.PLANIFICADA || v.status === VisitStatus.CONFIRMADA);
          } else if (activeTab === 'en_proceso') {
              subset = subset.filter(v => v.status === VisitStatus.EN_PROCESO || v.status === VisitStatus.PENDIENTE_GESTION);
          } else if (activeTab === 'finalizadas') {
              subset = subset.filter(v => v.status === VisitStatus.CERRADA || v.status === VisitStatus.ANULADA);
          }
      }

      // Sort by date desc
      subset.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setFilteredVisits(subset);
  }, [activeTab, activeFilter, visits, user]);

  const handleStartVisit = (visit: Visit) => {
      const isInGeofence = true;
      if (isInGeofence) {
          alert(`Ubicación validada dentro de la geocerca de ${visit.farmName}. Iniciando visita...`);
          onNavigate('visit-wizard', { 
              stop: { 
                  farmName: visit.farmName, 
                  producerName: visit.producerName, 
                  fieldName: 'Lote Principal', 
                  reason: visit.type,
                  visitId: visit.id,
                  visitCode: visit.code
              },
              returnTo: 'visits' // Ensure we come back here
          });
      } else {
          alert("Alerta: Usted está fuera del rango de la finca asignada.");
      }
  };

  const clearFilter = () => {
      setActiveFilter(null);
      onNavigate('visits'); 
  };

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
              <button onClick={() => onNavigate('dashboard')} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-bold text-white">Visitas Técnicas</h1>
          </div>
          <button onClick={() => onNavigate('selector')} className="p-2 bg-slate-800 rounded-full text-slate-400">
                <Home className="h-5 w-5" />
            </button>
      </div>

      {activeFilter === 'expired' && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center justify-between animate-in slide-in-from-top-2">
              <div className="flex items-center text-red-200 gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-bold">Filtro Activo: Visitas Vencidas</span>
              </div>
              <button onClick={clearFilter} className="bg-red-500/30 hover:bg-red-500/50 p-1 rounded-full text-red-100 transition-colors">
                  <X className="h-4 w-4" />
              </button>
          </div>
      )}

      {/* Tabs - Updated to include "Todas" as first option */}
      {!activeFilter && (
          <div className="flex bg-slate-800 p-1 rounded-xl overflow-x-auto">
              <button 
                onClick={() => setActiveTab('todas')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'todas' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                  Todas
              </button>
              <button 
                onClick={() => setActiveTab('sugeridas')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'sugeridas' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                  Sugeridas
              </button>
              <button 
                onClick={() => setActiveTab('en_proceso')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'en_proceso' ? 'bg-blue-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                  En Proceso
              </button>
              <button 
                onClick={() => setActiveTab('finalizadas')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'finalizadas' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                  Finalizadas
              </button>
          </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pb-20">
          {filteredVisits.length > 0 ? filteredVisits.map(visit => (
              <div 
                key={visit.id} 
                className={`rounded-xl p-4 border relative overflow-hidden transition-all ${
                    visit.status === VisitStatus.EN_PROCESO ? 'bg-gradient-to-br from-blue-900 to-slate-900 border-blue-500/50' : 
                    (new Date(visit.date) < new Date() && visit.status !== VisitStatus.CERRADA && visit.status !== VisitStatus.ANULADA) ? 'bg-slate-800 border-red-500/50' :
                    'bg-slate-800 border-slate-700'
                }`}
              >
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              visit.type === VisitType.PRE_CREDITO ? 'bg-purple-900/50 text-purple-400 border border-purple-800' : 
                              'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
                          }`}>{visit.type}</span>
                          
                          {/* Correlative Badge */}
                          {visit.code && (
                              <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600 font-mono flex items-center">
                                  <Hash className="h-3 w-3 mr-1" />
                                  {visit.code}
                              </span>
                          )}
                      </div>
                      
                      <div className={`flex items-center text-xs ${new Date(visit.date) < new Date() && visit.status !== VisitStatus.CERRADA ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                          <Calendar className="h-3 w-3 mr-1" />
                          {visit.date}
                      </div>
                  </div>
                  
                  <h3 className="font-bold text-white text-lg">{visit.producerName}</h3>
                  <div className="flex items-center text-sm text-slate-400 mt-1 mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      {visit.farmName}
                  </div>

                  <div className="flex gap-2">
                      {(visit.status === VisitStatus.PLANIFICADA || visit.status === VisitStatus.CONFIRMADA) && (
                          <button 
                            onClick={() => handleStartVisit(visit)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center shadow-lg"
                          >
                              <Play className="h-4 w-4 mr-2 fill-current" /> Iniciar
                          </button>
                      )}
                      
                      {(visit.status === VisitStatus.EN_PROCESO || visit.status === VisitStatus.PENDIENTE_GESTION) && (
                          <button 
                            onClick={() => onNavigate('visit-wizard', { 
                                stop: { 
                                    farmName: visit.farmName, 
                                    producerName: visit.producerName,
                                    visitId: visit.id,
                                    visitCode: visit.code,
                                    reason: visit.type
                                },
                                returnTo: 'visits' 
                            })}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center shadow-lg"
                          >
                              <CheckSquare className="h-4 w-4 mr-2" /> Continuar
                          </button>
                      )}

                      {visit.status === VisitStatus.CERRADA && (
                          <div className="w-full text-center text-xs text-emerald-500 font-bold flex items-center justify-center bg-emerald-900/20 py-2 rounded-lg border border-emerald-900">
                              <CheckCircle className="h-4 w-4 mr-1" /> Sincronizada
                          </div>
                      )}
                  </div>
              </div>
          )) : (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                  <Clock className="h-12 w-12 mb-3 opacity-20" />
                  <p>No se encontraron visitas para este filtro.</p>
                  {activeFilter && <button onClick={clearFilter} className="text-emerald-500 text-sm font-bold mt-2">Borrar Filtros</button>}
              </div>
          )}
      </div>
    </div>
  );
};

export default MobileVisits;
