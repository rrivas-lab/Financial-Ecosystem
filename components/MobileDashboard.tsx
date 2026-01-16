
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Wallet, 
  Activity, 
  CloudSun, 
  Droplets, 
  ChevronRight, 
  Bell, 
  Truck, 
  Home, 
  Map, 
  Navigation, 
  Play, 
  Calendar, 
  Clock, 
  Plus, 
  MapPin, 
  List, 
  AlertCircle 
} from 'lucide-react';
import { NavigationProps, FieldActivity, ActivityType, VisitStatus } from '../types';
import { useRoutes } from '../context/RouteContext';
import { useVisits } from '../context/VisitContext';

const mockRecentActivities: FieldActivity[] = [
  {
    id: 'a1',
    date: 'Hoy, 08:30 AM',
    type: ActivityType.RIEGO,
    producerName: 'Juan Pérez',
    farmName: 'La Esperanza',
    fieldName: 'Lote Norte',
    quantity: 'Lámina 5cm',
    cost: 50,
    status: 'Completada',
    technician: 'Ing. Mendez'
  },
  {
    id: 'a2',
    date: 'Ayer, 14:15 PM',
    type: ActivityType.FERTILIZACION,
    producerName: 'Agro El Sol',
    farmName: 'Hato Grande',
    fieldName: 'Lote 4',
    quantity: '200kg Urea',
    cost: 180,
    status: 'Pendiente',
    technician: 'Ing. Mendez'
  }
];

const MobileDashboard: React.FC<NavigationProps> = ({ onNavigate, user }) => {
  const { activePlan } = useRoutes();
  const { visits } = useVisits();
  
  // Operational Stats
  const [stats, setStats] = useState({
      expiredVisits: 0,
      unplannedVisits: 0,
  });

  useEffect(() => {
      // Calculate pending visits dynamically from context
      const pending = visits.filter(v => v.status === VisitStatus.PENDIENTE_GESTION).length;
      // Mock expired logic (e.g. date < today)
      const expired = visits.filter(v => v.status === VisitStatus.PENDIENTE_GESTION && v.date < new Date().toISOString().split('T')[0]).length;
      
      setStats({ unplannedVisits: pending, expiredVisits: expired });
  }, [visits]);

  // Calculate current day info if plan exists
  const currentDayIndex = activePlan?.days.findIndex(d => d.date === new Date().toISOString().split('T')[0]) ?? 0;
  const currentDay = activePlan?.days[currentDayIndex >= 0 ? currentDayIndex : 0];
  const totalStops = activePlan?.days.reduce((acc, day) => acc + day.stops.length, 0) || 0;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-xl font-bold text-white">Hola, {user?.name?.split(' ')[0] || 'Técnico'}</h1>
          <p className="text-sm text-slate-400">Ciclo Invierno 2025</p>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={() => onNavigate('selector')}
                className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                title="Cambiar de módulo"
            >
                <Home className="h-5 w-5 text-slate-300" />
            </button>
            <button 
                onClick={() => alert('No hay nuevas notificaciones')} 
                className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center relative hover:bg-slate-700 transition-colors"
            >
                <Bell className="h-5 w-5 text-slate-300" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-slate-900"></span>
            </button>
        </div>
      </div>

      {/* 1. TARJETA DE VISITAS PENDIENTES POR PLANIFICAR */}
      <div 
        className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform group"
        onClick={() => onNavigate('visits')}
      >
          <div className="absolute right-[-20px] top-[-20px] bg-slate-700/30 w-32 h-32 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>

          <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                  <div className="bg-slate-700 p-2.5 rounded-lg text-slate-300 group-hover:text-emerald-400 transition-colors">
                      <List className="h-6 w-6" />
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">Visitas Pendientes</h3>
                      <p className="text-xs text-slate-400">Por planificar en ruta</p>
                  </div>
              </div>
              <div className="text-right">
                  <span className="text-3xl font-bold text-white">{stats.unplannedVisits}</span>
              </div>
          </div>

          {stats.expiredVisits > 0 ? (
              <div 
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center justify-between relative z-10 hover:bg-red-500/20 transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('visits', { filter: 'expired' });
                }}
              >
                  <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                      <div>
                          <p className="text-sm font-bold text-red-200">¡Atención Requerida!</p>
                          <p className="text-xs text-red-300/70">{stats.expiredVisits} visitas han vencido su fecha límite.</p>
                      </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-red-400" />
              </div>
          ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3 relative z-10">
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-200 font-medium">Todas las visitas están a tiempo.</p>
              </div>
          )}
      </div>

      {/* 2. RUTAS PLANIFICADAS */}
      <div>
          <div className="flex justify-between items-center mb-3 px-1">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Rutas Planificadas</h2>
              <button onClick={() => onNavigate('portfolio')} className="text-emerald-500 text-xs font-bold hover:underline">Ver Calendario</button>
          </div>

          {activePlan ? (
            // ESTADO: RUTA ACTIVA (SINCRONIZADA)
            <div 
                onClick={() => onNavigate('route-execution')}
                className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 shadow-lg border border-blue-400/50 flex flex-col gap-3 cursor-pointer hover:bg-blue-700 transition-all relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Navigation className="h-16 w-16 text-white" />
                </div>
                <div className="z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Ruta {activePlan.id} En Curso</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                        {currentDay ? `Día ${currentDayIndex + 1} de ${activePlan.days.length}` : 'Plan Activo'}
                    </h3>
                    <p className="text-sm text-blue-100">
                        {currentDay ? `${currentDay.stops.length} paradas hoy` : `${totalStops} visitas totales`}
                    </p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-blue-900/50 h-1.5 rounded-full mt-2 overflow-hidden z-10">
                    <div className="bg-white h-full w-1/3 rounded-full shadow-[0_0_10px_white]"></div>
                </div>
                
                <div className="flex justify-between items-center mt-1 z-10">
                    <span className="text-[10px] text-blue-200">Inicio: {activePlan.startDate}</span>
                    <span className="bg-white text-blue-900 text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                        Ver Itinerario
                    </span>
                </div>
            </div>
          ) : (
            // ESTADO: NO HAY RUTA PLANIFICADA (UPDATED DESIGN)
            <div 
                onClick={() => onNavigate('route-planner')}
                className="bg-slate-800/50 rounded-xl p-6 border-2 border-dashed border-slate-600 hover:border-emerald-500/50 cursor-pointer transition-all group relative overflow-hidden flex flex-col items-center justify-center text-center space-y-3"
            >
                <div className="w-14 h-14 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors text-slate-400 mb-1">
                    <Map className="h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">No hay ruta planificada</h3>
                    <p className="text-xs text-slate-500 group-hover:text-slate-400 mt-1 max-w-[200px] mx-auto">
                        Configure su itinerario para hoy y optimice su recorrido.
                    </p>
                </div>
                <button className="text-emerald-500 text-sm font-bold flex items-center mt-2 group-hover:text-emerald-400">
                    <Plus className="h-4 w-4 mr-1" />
                    Crear Planificación
                </button>
            </div>
          )}
      </div>

      {/* 3. WEATHER & KPI */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="flex justify-between items-start relative z-10">
              <div>
                  <p className="text-xs font-bold text-blue-100 uppercase mb-1">Condición Actual</p>
                  <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold">32°</span>
                      <CloudSun className="h-6 w-6 text-yellow-300" />
                  </div>
                  <p className="text-xs text-blue-100 mt-1">Parcialmente Nublado</p>
              </div>
              <div className="text-right">
                  <div className="flex items-center justify-end text-xs font-bold text-blue-100 mb-1">
                      <Droplets className="h-3 w-3 mr-1" /> 65% Hum.
                  </div>
                  <p className="text-[10px] text-blue-200">Turén, Portuguesa</p>
              </div>
          </div>
      </div>

      {/* 4. RECENT ACTIVITY LIST */}
      <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 px-1">Actividad Reciente</h2>
          <div className="space-y-3">
              {mockRecentActivities.map(activity => (
                  <div key={activity.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                          activity.type === ActivityType.RIEGO ? 'bg-blue-900/50 text-blue-400' : 'bg-amber-900/50 text-amber-400'
                      }`}>
                          <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                          <h4 className="text-sm font-bold text-white">{activity.type}</h4>
                          <p className="text-xs text-slate-400">{activity.farmName} • {activity.fieldName}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs text-slate-500">{activity.date.split(',')[1]}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              activity.status === 'Completada' ? 'bg-emerald-900 text-emerald-400' : 'bg-slate-700 text-slate-400'
                          }`}>
                              {activity.status}
                          </span>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
