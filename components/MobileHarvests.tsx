import React from 'react';
import { NavigationProps } from '../types';
import { ChevronLeft, Truck, Save, Home, FileText } from 'lucide-react';

const MobileHarvests: React.FC<NavigationProps> = ({ onNavigate }) => {
  return (
    <div className="p-4 space-y-6">
       <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => onNavigate('dashboard')} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h1 className="text-lg font-bold text-white">Registrar Carga</h1>
            </div>
            <button onClick={() => onNavigate('selector')} className="p-2 bg-slate-800 rounded-full text-slate-400">
                <Home className="h-5 w-5" />
            </button>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-5">
           <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-900/50 flex items-center">
              <Truck className="h-6 w-6 text-emerald-500 mr-3" />
              <div>
                 <p className="text-sm text-emerald-400 font-bold">Despacho de Cosecha</p>
                 <p className="text-xs text-slate-400">Registrando Carga #45 (Invierno 2025)</p>
              </div>
           </div>

           <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Productor / Lote</label>
              <select className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-3 outline-none">
                <option>Juan Pérez - Lote Norte (Arroz)</option>
              </select>
           </div>
           
           <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center">
                <FileText className="h-3 w-3 mr-1" /> Guía SUNAGRO / SIGAI
             </label>
             <input type="text" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none" placeholder="Ej. SUN-2025-00123" />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Kg Estimados</label>
                <input type="number" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Placa Camión</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none" placeholder="ABC-123" />
              </div>
           </div>
        </div>

        <button 
          onClick={() => {
              alert('Carga registrada. Guía vinculada al lote.');
              onNavigate('dashboard');
          }}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center hover:bg-emerald-500"
        >
          <Save className="h-5 w-5 mr-2" />
          Registrar Salida
        </button>
    </div>
  );
};

export default MobileHarvests;