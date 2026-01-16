
import React, { useState, useEffect } from 'react';
import { NavigationProps, RouteDay, RouteStop } from '../types';
import { ChevronLeft, Home, Navigation, MapPin, Play, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useRoutes } from '../context/RouteContext';

const MobileRouteExecution: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const { activePlan, completeStop } = useRoutes();
  const [selectedDayId, setSelectedDayId] = useState<string>('');
  const [showGeofencePrompt, setShowGeofencePrompt] = useState<RouteStop | null>(null);

  // Initialize selected day
  useEffect(() => {
      if (activePlan && activePlan.days.length > 0) {
          // Default to first day or today if matches
          const today = new Date().toISOString().split('T')[0];
          const todayDay = activePlan.days.find(d => d.date === today);
          setSelectedDayId(todayDay ? todayDay.id : activePlan.days[0].id);
      }
  }, [activePlan]);

  // Fallback if no plan is active
  if (!activePlan) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white">
              <MapPin className="h-16 w-16 text-slate-700 mb-4" />
              <h2 className="text-xl font-bold">No hay ruta activa</h2>
              <button onClick={() => onNavigate('route-planner')} className="mt-4 text-emerald-500 font-bold">Crear Plan</button>
          </div>
      );
  }

  const currentDay = activePlan.days.find(d => d.id === selectedDayId) || activePlan.days[0];

  const handleSimulateArrival = (stop: RouteStop) => {
      setShowGeofencePrompt(stop);
  };

  const handleStartVisit = () => {
      if(!showGeofencePrompt) return;
      onNavigate('visit-wizard', { 
          stop: showGeofencePrompt,
          returnTo: 'route-execution' // Explicitly return to route execution
      });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 relative">
       {/* Map Layer (Mock) */}
       <div className="absolute inset-0 bg-slate-800 opacity-50 z-0 flex items-center justify-center overflow-hidden">
           <div className="text-slate-600 text-9xl opacity-10 rotate-12 select-none">MAPA GPS</div>
           <svg className="absolute inset-0 w-full h-full pointer-events-none">
               <path d="M 100 100 Q 200 300 300 500" stroke="#10b981" strokeWidth="4" fill="none" strokeDasharray="10 5" />
           </svg>
       </div>

       {/* Top Bar */}
       <div className="relative z-10 p-4 bg-gradient-to-b from-slate-900 via-slate-900/90 to-transparent pb-8">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('dashboard')} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white shadow-lg">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-white flex items-center">
                            <Navigation className="h-3 w-3 mr-2 text-emerald-400" />
                            {activePlan.id}
                        </h1>
                        <p className="text-xs text-slate-400">Planificación Activa</p>
                    </div>
                </div>
            </div>

            {/* Day Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {activePlan.days.map((day, idx) => (
                    <button
                        key={day.id}
                        onClick={() => setSelectedDayId(day.id)}
                        className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border min-w-[80px] transition-all ${
                            selectedDayId === day.id 
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg scale-105' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 opacity-80'
                        }`}
                    >
                        <span className="text-[10px] font-bold uppercase">{day.dayLabel || `Día ${idx+1}`}</span>
                        <span className="text-xs font-mono">{day.date.split('-')[2]}</span>
                    </button>
                ))}
            </div>
       </div>

       {/* Stops List Card (Bottom Sheet style) */}
       <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-20 max-h-[60vh] flex flex-col border-t border-slate-800">
           <div className="p-2 flex justify-center">
               <div className="w-12 h-1.5 bg-slate-700 rounded-full"></div>
           </div>
           
           <div className="p-4 flex-1 overflow-y-auto space-y-4 pb-24">
               {currentDay.stops.map((stop, idx) => (
                   <div key={stop.id} className={`p-4 rounded-xl border flex gap-4 transition-all ${
                       stop.status === 'En Sitio' ? 'bg-emerald-900/20 border-emerald-500/50' : 
                       stop.status === 'Completada' ? 'bg-slate-800/50 border-slate-700 opacity-60' :
                       'bg-slate-800 border-slate-700'
                   }`}>
                       <div className="flex flex-col items-center pt-1">
                           {stop.status === 'Completada' ? (
                               <CheckCircle className="h-6 w-6 text-emerald-500" />
                           ) : (
                               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                   stop.status === 'En Sitio' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-500 text-slate-400'
                               }`}>
                                   {idx + 1}
                               </div>
                           )}
                           {idx < currentDay.stops.length - 1 && <div className="w-0.5 bg-slate-700 flex-1 my-1 min-h-[20px]"></div>}
                       </div>
                       
                       <div className="flex-1">
                           <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold ${stop.status === 'En Sitio' ? 'text-emerald-400' : 'text-white'}`}>{stop.farmName}</h3>
                                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-mono">{stop.visitCode}</span>
                           </div>
                           <p className="text-sm text-slate-400 mb-1">{stop.reason}</p>
                           <p className="text-xs text-slate-500 mb-2">{stop.producerName}</p>
                           
                           {stop.status !== 'Completada' && (
                               <div className="flex gap-2">
                                   <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded flex items-center justify-center">
                                       <Navigation className="h-3 w-3 mr-1" /> Mapa
                                   </button>
                                   <button 
                                      onClick={() => handleSimulateArrival(stop)}
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded flex items-center justify-center"
                                   >
                                       Simular Llegada
                                   </button>
                               </div>
                           )}
                       </div>
                   </div>
               ))}
               {currentDay.stops.length === 0 && (
                   <div className="text-center text-slate-500 py-8">
                       <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                       <p>Sin visitas para este día.</p>
                   </div>
               )}
           </div>
       </div>

       {/* Geofence Prompt Modal */}
       {showGeofencePrompt && (
           <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 border border-emerald-500/50 shadow-2xl animate-in slide-in-from-bottom-10">
                   <div className="flex flex-col items-center text-center mb-6">
                       <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-500 animate-pulse">
                           <MapPin className="h-8 w-8 text-emerald-500" />
                       </div>
                       <h2 className="text-xl font-bold text-white">¡Llegaste a {showGeofencePrompt.farmName}!</h2>
                       <p className="text-slate-400 mt-2 text-sm">
                           Visita: <strong>{showGeofencePrompt.visitCode}</strong><br/>
                           Motivo: {showGeofencePrompt.reason}
                       </p>
                   </div>
                   <div className="space-y-3">
                       <button 
                         onClick={handleStartVisit}
                         className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center hover:bg-emerald-500"
                       >
                           <Play className="h-5 w-5 mr-2 fill-current" /> Iniciar Visita
                       </button>
                       <button 
                         onClick={() => setShowGeofencePrompt(null)}
                         className="w-full bg-slate-700 text-slate-300 py-3 rounded-xl font-medium hover:bg-slate-600"
                       >
                           Cancelar
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default MobileRouteExecution;
