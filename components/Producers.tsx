import React from 'react';
import { Producer } from '../types';
import { Search, MapPin, MoreVertical, FileText } from 'lucide-react';

const mockProducers: Producer[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    vat: 'V-12345678',
    type: 'Natural',
    email: 'juan.perez@email.com',
    phone: '0414-5555555',
    status: 'Activo',
    creditActive: true,
    filesStatus: 'Aprobado',
    // Added missing required property activeCreditsCount
    activeCreditsCount: 1,
    farms: [
      // Added missing producerId, status, geofenceActive, and fields properties to satisfy Farm interface
      { id: 'f1', name: 'Finca La Esperanza', location: 'Santa Rosalía', totalArea: 45, riceArea: 40, coordinates: 'N8.5 W67.2', producerId: '1', status: 'Activa', geofenceActive: true, fields: [] }
    ]
  },
  {
    id: '2',
    name: 'Agropecuaria El Sol C.A.',
    vat: 'J-98765432-1',
    type: 'Juridica',
    email: 'contacto@elsol.com',
    phone: '0255-6666666',
    status: 'Pendiente',
    creditActive: false,
    filesStatus: 'Incompleto',
    // Added missing required property activeCreditsCount
    activeCreditsCount: 0,
    farms: [
      // Added missing producerId, status, geofenceActive, and fields properties to satisfy Farm interface
      { id: 'f2', name: 'Hato Grande', location: 'Turén', totalArea: 120, riceArea: 100, coordinates: 'N9.1 W68.1', producerId: '2', status: 'Activa', geofenceActive: false, fields: [] }
    ]
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    vat: 'V-87654321',
    type: 'Natural',
    email: 'maria.r@email.com',
    phone: '0412-1112222',
    status: 'Activo',
    creditActive: true,
    filesStatus: 'Aprobado',
    // Added missing required property activeCreditsCount
    activeCreditsCount: 1,
    farms: [
      // Added missing producerId, status, geofenceActive, and fields properties to satisfy Farm interface
      { id: 'f3', name: 'Parcela 45', location: 'Esteller', totalArea: 25, riceArea: 25, coordinates: 'N9.3 W69.0', producerId: '3', status: 'Activa', geofenceActive: true, fields: [] }
    ]
  }
];

const Producers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Productores</h1>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium">
          + Nuevo Productor
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o RIF..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
          <option value="">Todos los Estados</option>
          <option value="activo">Activo</option>
          <option value="pendiente">Pendiente</option>
        </select>
      </div>

      {/* Producers List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Productor</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Finca Principal</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockProducers.map((producer) => (
                <tr key={producer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{producer.name}</span>
                      <span className="text-sm text-slate-500">{producer.vat}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                      {producer.farms[0]?.name || 'N/A'}
                    </div>
                    <span className="text-xs text-slate-500 block ml-5">
                      {producer.farms[0]?.totalArea} ha
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      producer.status === 'Activo' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {producer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div>{producer.phone}</div>
                    <div className="text-slate-400 text-xs">{producer.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Ver Expediente">
                        <FileText className="h-5 w-5" />
                      </button>
                      <button className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Más opciones">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Producers;