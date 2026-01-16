import React, { useState } from 'react';
import { RouteDay, RouteStop, NavigationProps } from '../types';
import { Map, ChevronRight, User, Clock, MapPin, Navigation, CheckCircle, Settings, Globe } from 'lucide-react';

const mockRoutes: RouteDay[] = [
    {
        id: 'rd1', date: '2025-10-27', status: 'En Curso', technicianId: 'Ing. Mendez', totalKm: 42,
        stops: [
            { id: 's1', sequence: 1, farmName: 'Finca El Palmar', producerName: 'Juan Pérez', fieldId: 'f1', fieldName: 'Lote A', lat: 0, lng: 0, priorityLevel: 'Alta', status: 'Completada', estimatedTime: '45m', reason: 'Inspección' },
            { id: 's2', sequence: 2, farmName: 'Hato Grande', producerName: 'Agro El Sol', fieldId: 'f2', fieldName: 'Lote 4', lat: 0, lng: 0, priorityLevel: 'Alta', status: 'En Sitio', estimatedTime: '30m', reason: 'Fumigación' },
            { id: 's3', sequence: 3, farmName: 'La Esperanza', producerName: 'Maria R.', fieldId: 'f3', fieldName: 'Lote Sur', lat: 0, lng: 0, priorityLevel: 'Media', status: 'Pendiente', estimatedTime: '60m', reason: 'Pre-Crédito' },
        ]
    },
    {
        id: 'rd2', date: '2025-10-27', status: 'Borrador', technicianId: 'Ing. Carlos Ruiz', totalKm: 35, // Fixed: Status "Sugerida" changed to "Borrador"
        stops: [
            { id: 's4', sequence: 1, farmName: 'Los Andes', producerName: 'Pedro S.', fieldId: 'f4', fieldName: 'Lote 1', lat: 0, lng: 0, priorityLevel: 'Media', status: 'Pendiente', estimatedTime: '40m', reason: 'Seguimiento' }
        ]
    }
];

const DesktopRoutes: React.FC<NavigationProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'monitor' | 'geofences' | 'map'>('monitor');

  // --- RENDERERS ---

  const renderMonitor = () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Active Routes List */}
          <div className="lg:col-span-1 space-y-4">
              <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Rutas Activas ({mockRoutes.length})</h2>
              {mockRoutes.map(route => (
                  <div key={route.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                              <div className="bg-slate-100 p-2 rounded-full mr-3">
                                  <User className="h-5 w-5 text-slate-600" />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800 text-sm">{route.technicianId}</h3>
                                  <p className="text-xs text-slate-500">{route.totalKm} km est.</p>
                              </div>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                              route.status === 'En Curso' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                              {route.status}
                          </span>
                      </div>
                      
                      <div className="relative pl-4 border-l-2 border-slate-200 space-y-4">
                          {route.stops.map((stop, idx) => (
                              <div key={stop.id} className="relative">
                                  <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 ${
                                      stop.status === 'Completada' ? 'bg-emerald-500 border-emerald-500' : 
                                      stop.status === 'En Sitio' ? 'bg-blue-500 border-blue-500 animate-pulse' : 'bg-white border-slate-300'
                                  }`}></div>
                                  <div>
                                      <p className={`text-xs font-bold ${stop.status === 'En Sitio' ? 'text-blue-600' : 'text-slate-700'}`}>{stop.farmName}</p>
                                      <p className="text-[10px] text-slate-500">{stop.reason}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>

          {/* Map Visualization (Mock) */}
          <div className="lg:col-span-2 bg-slate-200 rounded-lg border border-slate-300 min-h-[500px] flex items-center justify-center relative overflow-hidden group">
              <div className="text-slate-400 font-bold text-lg flex flex-col items-center">
                  <Map className="h-12 w-12 mb-2 opacity-50" />
                  Vista de Mapa en Tiempo Real
                  <span className="text-xs font-normal mt-1">(Integración con Google Maps API)</span>
              </div>
              
              {/* Fake pins */}
              <div className="absolute top-1/3 left-1/4 transform hover:scale-110 transition-transform cursor-pointer">
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap">Ing. Mendez (En Sitio)</div>
                  <Navigation className="h-8 w-8 text-blue-600 fill-current mx-auto" />
              </div>

               <div className="absolute bottom-1/3 right-1/3 transform hover:scale-110 transition-transform cursor-pointer opacity-50">
                  <MapPin className="h-8 w-8 text-slate-500 mx-auto" />
              </div>
          </div>
      </div>
  );

  const renderGeofences = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" /> Configuración de Geocercas
              </h2>
              <p className="text-sm text-slate-500 mb-6">Defina los radios de detección automática para el check-in de los técnicos.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg bg-slate-50">
                      <label className="font-bold text-sm block mb-2">Radio Estándar (m)</label>
                      <input type="number" value="200" className="w-full p-2 border rounded" />
                  </div>
                  <div className="p-4 border rounded-lg bg-slate-50">
                      <label className="font-bold text-sm block mb-2">Alerta de Desvío (km)</label>
                      <input type="number" value="5" className="w-full p-2 border rounded" />
                  </div>
              </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-4">Fincas con Geocerca Activa</h3>
              <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500">
                      <tr>
                          <th className="p-3">Finca</th>
                          <th className="p-3">Coordenadas Centro</th>
                          <th className="p-3 text-center">Radio</th>
                          <th className="p-3 text-center">Estado</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr className="border-b">
                          <td className="p-3 font-medium">Finca La Esperanza</td>
                          <td className="p-3 text-slate-500">8.1234, -69.1234</td>
                          <td className="p-3 text-center">200m</td>
                          <td className="p-3 text-center"><span className="text-emerald-600 font-bold text-xs">Activa</span></td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center">
         <div className="flex items-center space-x-2 text-sm text-slate-500">
             <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Operaciones</span>
             <ChevronRight className="h-4 w-4" />
             <span className="text-slate-800 font-bold">Monitor de Rutas</span>
         </div>
         <div className="flex space-x-2">
             <button 
                onClick={() => setViewMode(viewMode === 'geofences' ? 'monitor' : 'geofences')}
                className={`bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-slate-50 ${viewMode === 'geofences' ? 'bg-slate-100' : ''}`}
             >
                 {viewMode === 'geofences' ? 'Volver al Monitor' : 'Configurar Geocercas'}
             </button>
             <button 
                onClick={() => setViewMode('map')}
                className="bg-emerald-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-emerald-700 flex items-center"
             >
                 <Globe className="h-4 w-4 mr-1" /> Ver Mapa Global
             </button>
         </div>
      </div>

      {viewMode === 'monitor' && renderMonitor()}
      {viewMode === 'geofences' && renderGeofences()}
      {viewMode === 'map' && (
          <div className="bg-slate-200 w-full h-[600px] rounded-xl flex items-center justify-center border-2 border-slate-300">
              <div className="text-center">
                  <Globe className="h-20 w-20 text-slate-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-600">Mapa Satelital Global</h2>
                  <p className="text-slate-500">Visualización de todas las unidades de producción y técnicos en tiempo real.</p>
                  <button onClick={() => setViewMode('monitor')} className="mt-4 text-emerald-600 font-bold hover:underline">Volver</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default DesktopRoutes;