
import React, { useState, useEffect } from 'react';
import { NavigationProps, RouteDay, RouteStop, ActivityType, RoutePlan, VisitStatus } from '../types';
import { ChevronLeft, Home, MapPin, Clock, Sprout, AlertTriangle, CheckSquare, Search, GripVertical, Check, Loader2, Play, Navigation, Calendar, ChevronRight } from 'lucide-react';
import { useRoutes } from '../context/RouteContext';
import { useVisits } from '../context/VisitContext';
import { useProducers } from '../context/ProducerContext';

const MobileRoutePlanner: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const { setActivePlan, addPlan } = useRoutes(); 
  const { visits, updateVisit } = useVisits(); 
  const { sendMessageToProducer } = useProducers(); // Consume Producer Context for messaging
  
  const [step, setStep] = useState<'config' | 'loading' | 'review' | 'confirmed'>('config');
  const [config, setConfig] = useState({
      startPoint: 'Mi Ubicación Actual',
      endPoint: 'Oficina Central',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      visitsPerDay: 1 
  });
  
  // State to hold the potential plan structure before confirmation
  const [draftPlan, setDraftPlan] = useState<RoutePlan | null>(null);
  const [activeReviewDay, setActiveReviewDay] = useState<number>(0);
  const [generatedId, setGeneratedId] = useState('');

  const [hasActiveRoute, setHasActiveRoute] = useState(false);
  const [forceProducerId, setForceProducerId] = useState<string | null>(null);

  useEffect(() => {
      if (params?.includeProducerId) {
          setForceProducerId(params.includeProducerId);
      }
  }, [params]);

  const handleSuggestRoute = () => {
    setStep('loading');
    
    // Filter pending visits from Context
    const pendingVisits = visits.filter(v => v.status === VisitStatus.PENDIENTE_GESTION);
    
    setTimeout(() => {
        const days: RouteDay[] = [];
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

        let visitIndex = 0;

        for (let i = 0; i < diffDays; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(currentDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];
            
            const dayStops: RouteStop[] = [];
            
            // Handle forced producer inclusion on first day
            if (i === 0 && forceProducerId) {
                 dayStops.push({ 
                    id: `s-forced-${i}`, sequence: 1, farmName: params?.farmName || 'Finca Asignada', producerName: params?.producerName || 'Productor Seleccionado', fieldId: params?.farmId || 'f-forced', fieldName: 'Lote Principal',
                    lat: 0, lng: 0, priorityLevel: 'Alta', status: 'Pendiente', estimatedTime: '60 min', 
                    reason: 'Visita Solicitada Manualmente', activityType: ActivityType.MANTENIMIENTO,
                    visitCode: 'VIS-REQ-MANUAL'
                });
            }

            // Distribute pending visits based on visitsPerDay config
            for (let j = 0; j < config.visitsPerDay; j++) {
                if (visitIndex < pendingVisits.length) {
                    const v = pendingVisits[visitIndex];
                    dayStops.push({
                        id: `stop-${v.id}`,
                        visitCode: v.code || `VIS-${visitIndex}`,
                        visitId: v.id, // Important for sync
                        sequence: dayStops.length + 1,
                        farmName: v.farmName,
                        producerName: v.producerName,
                        fieldId: 'f-gen',
                        fieldName: 'Lote General',
                        lat: 0, lng: 0,
                        priorityLevel: 'Alta',
                        status: 'Pendiente',
                        estimatedTime: '45 min',
                        reason: v.type,
                        activityType: ActivityType.MANTENIMIENTO,
                        isSeedField: v.type === 'Campo Semilla'
                    });
                    visitIndex++;
                }
            }

            // Only add day if it has stops
            if (dayStops.length > 0) {
                days.push({
                    id: `rd-${i}`,
                    date: dateStr,
                    dayLabel: `Día ${i + 1}`,
                    status: 'Borrador',
                    technicianId: 't1',
                    totalKm: 15 + (dayStops.length * 10),
                    stops: dayStops
                });
            }
        }

        const plan: RoutePlan = {
            id: 'DRAFT',
            startDate: config.startDate,
            endDate: config.endDate,
            technicianId: 't1',
            days: days,
            status: 'Borrador'
        };

        setDraftPlan(plan);
        setActiveReviewDay(0);
        setStep('review');
    }, 1000);
  };

  const handleConfirmRoute = () => {
      if (!draftPlan) return;

      const newId = `RUT-2025-${Math.floor(Math.random() * 800) + 100}`;
      setGeneratedId(newId);
      
      const finalPlan: RoutePlan = {
          ...draftPlan,
          id: newId,
          status: 'Activo',
          days: draftPlan.days.map(d => ({ ...d, status: 'Confirmada' }))
      };

      // 1. SAVE TO GLOBAL ROUTE CONTEXT (Shared List)
      addPlan(finalPlan);

      // 2. SET ACTIVE FOR MOBILE
      setActivePlan(finalPlan);

      // 3. UPDATE VISITS STATUS AND NOTIFY PRODUCER
      finalPlan.days.forEach(day => {
          day.stops.forEach(stop => {
              if (stop.visitId) {
                  // A. Update Status in DB
                  updateVisit(stop.visitId, { status: VisitStatus.PLANIFICADA });

                  // B. Find original visit to get producer ID properly
                  const originalVisit = visits.find(v => v.id === stop.visitId);
                  
                  if (originalVisit && originalVisit.producerId) {
                      // C. Send WhatsApp Notification
                      const message = `🔔 *VISITA PROGRAMADA* 🔔\n\nEstimado productor, se ha agendado la visita técnica **${stop.visitCode}** para el día **${day.date}**.\n\n📍 Finca: ${stop.farmName}\n🔧 Motivo: ${stop.reason}\n\nPor favor, asegúrese de estar presente o delegar a un encargado para recibir al técnico.`;
                      sendMessageToProducer(originalVisit.producerId, message);
                  }
              }
          });
      });
      
      setStep('confirmed');
  };

  if (step === 'config') {
      return (
        <div className="p-4 space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('dashboard')} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Planificador</h1>
                </div>
                <button onClick={() => onNavigate('selector')} className="p-2 bg-slate-800 rounded-full text-slate-400">
                    <Home className="h-5 w-5" />
                </button>
            </div>

            <div className={`space-y-6 flex-1 transition-opacity duration-300 ${hasActiveRoute ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
                    <h2 className="text-white font-bold mb-2 flex items-center border-b border-slate-700 pb-2">
                        <MapPin className="h-5 w-5 mr-2 text-emerald-500" /> Puntos de Ruta
                    </h2>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Punto de Partida</label>
                        <select 
                            className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg text-sm"
                            value={config.startPoint}
                            onChange={(e) => setConfig({...config, startPoint: e.target.value})}
                        >
                            <option value="Mi Ubicación Actual">Mi Ubicación Actual (GPS)</option>
                            <option value="Sede Aproscello">Sede Aproscello</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Punto Final</label>
                        <select 
                            className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg text-sm"
                            value={config.endPoint}
                            onChange={(e) => setConfig({...config, endPoint: e.target.value})}
                        >
                            <option value="Retorno a Sede">Retorno a Sede</option>
                            <option value="Casa">Casa</option>
                        </select>
                    </div>
                </div>

                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
                    <h2 className="text-white font-bold mb-2 flex items-center border-b border-slate-700 pb-2">
                        <Calendar className="h-5 w-5 mr-2 text-blue-500" /> Tiempo y Cantidad
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Desde</label>
                            <input 
                                type="date"
                                className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg text-sm"
                                value={config.startDate}
                                onChange={(e) => setConfig({...config, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Hasta</label>
                            <input 
                                type="date"
                                className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg text-sm"
                                value={config.endDate}
                                onChange={(e) => setConfig({...config, endDate: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Visitas por Día</label>
                        <input 
                            type="range" min="1" max="10" step="1" 
                            value={config.visitsPerDay} onChange={(e) => setConfig({...config, visitsPerDay: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-right text-emerald-400 font-bold mt-1 border border-emerald-500/30 inline-block px-2 rounded bg-emerald-900/20">{config.visitsPerDay} visitas</div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleSuggestRoute}
                disabled={hasActiveRoute}
                className={`w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-all ${
                    hasActiveRoute ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500'
                }`}
            >
                <Search className="h-5 w-5 mr-2" />
                Planificar Visitas
            </button>
        </div>
      );
  }

  if (step === 'loading') {
      return (
          <div className="flex flex-col items-center justify-center h-full space-y-6 p-8 text-center">
              <Loader2 className="h-16 w-16 text-emerald-500 animate-spin" />
              <h2 className="text-xl font-bold text-white">Calculando Ruta Óptima...</h2>
              <p className="text-slate-400">Analizando distancias, prioridades y disponibilidad de productores.</p>
          </div>
      );
  }

  if (step === 'review' && draftPlan) {
      const currentDay = draftPlan.days[activeReviewDay];
      const totalVisits = draftPlan.days.reduce((acc, d) => acc + d.stops.length, 0);

      return (
        <div className="p-4 space-y-4 h-full flex flex-col">
             <div className="flex justify-between items-center mb-2">
                <button onClick={() => setStep('config')} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-bold text-white">Ruta Propuesta</h1>
                    <p className="text-xs text-slate-400">{totalVisits} visitas encontradas en {draftPlan.days.length} días</p>
                </div>
                <div className="w-10"></div>
            </div>

            <p className="text-sm text-slate-400 text-center px-4">
                Estas son las visitas pendientes asignadas a su planificación según los criterios ingresados.
            </p>

            {/* DAY SELECTOR if multiple */}
            {draftPlan.days.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-700">
                    {draftPlan.days.map((day, idx) => (
                        <button
                            key={day.id}
                            onClick={() => setActiveReviewDay(idx)}
                            className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg border min-w-[70px] transition-all ${
                                activeReviewDay === idx
                                ? 'bg-emerald-600 border-emerald-500 text-white' 
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                        >
                            <span className="text-[10px] font-bold uppercase">{day.dayLabel}</span>
                            <span className="text-xs font-mono">{day.date.split('-')[2]}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4">
                {currentDay ? currentDay.stops.map((stop, idx) => (
                    <div key={stop.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex gap-4 relative animate-in slide-in-from-right-2">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-900 text-emerald-400 border border-emerald-500 flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                            </div>
                            {idx < currentDay.stops.length - 1 && <div className="w-0.5 bg-slate-600 flex-1 my-1"></div>}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-white">{stop.farmName}</h3>
                                <GripVertical className="h-5 w-5 text-slate-600" />
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{stop.fieldName} • {stop.producerName}</p>
                            
                            <div className="bg-slate-900 p-2 rounded border border-slate-700 flex items-start gap-2 mb-2">
                                {stop.isSeedField ? <Sprout className="h-4 w-4 text-purple-400 mt-0.5" /> : <Clock className="h-4 w-4 text-amber-400 mt-0.5" />}
                                <div>
                                    <p className="text-xs font-bold text-slate-200">{stop.reason}</p>
                                    <p className="text-[10px] text-slate-500">Labor: {stop.activityType} • Est: {stop.estimatedTime}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-slate-500 mt-10">No hay visitas planificadas para este día.</div>
                )}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
                <button 
                    onClick={handleConfirmRoute}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center hover:bg-emerald-500"
                >
                    <Check className="h-5 w-5 mr-2" />
                    Confirmar Planificación
                </button>
                <button onClick={handleSuggestRoute} className="w-full py-3 text-slate-400 font-medium hover:text-white">
                    Recalcular
                </button>
            </div>
        </div>
      );
  }

  if (step === 'confirmed') {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border-4 border-emerald-500">
                  <Check className="h-12 w-12 text-emerald-500" />
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-white mb-2">¡Ruta Generada!</h2>
                  <p className="text-slate-400">Su planificación ha sido guardada, sincronizada y los productores notificados.</p>
              </div>
              
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">Correlativo de Ruta</p>
                  <p className="text-3xl font-mono font-bold text-white tracking-widest">{generatedId}</p>
              </div>

              <button 
                onClick={() => onNavigate('route-execution')}
                className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-200"
              >
                  Iniciar Recorrido
              </button>
              <button onClick={() => onNavigate('dashboard')} className="text-slate-400 hover:text-white">
                  Volver al Inicio
              </button>
          </div>
      );
  }

  return null;
};

export default MobileRoutePlanner;
