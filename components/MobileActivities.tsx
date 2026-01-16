
import React, { useState, useEffect } from 'react';
import { FieldActivity, ActivityType, NavigationProps } from '../types';
import { 
  ChevronLeft, Search, Filter, Plus, Calendar, MapPin, Camera, PenTool, Check, ArrowRight, Home 
} from 'lucide-react';

// Mock Data (same as desktop for consistency, but styled differently)
const mockActivities: FieldActivity[] = [
  { id: 'a1', date: '26/10 08:30', type: ActivityType.RIEGO, producerName: 'Juan P.', farmName: 'La Esperanza', fieldName: 'Lote Norte', quantity: '5cm', cost: 50, status: 'Completada', technician: 'Mendez' },
  { id: 'a2', date: '26/10 10:15', type: ActivityType.FERTILIZACION, producerName: 'Agro Sol', farmName: 'Hato Grande', fieldName: 'Lote 4', quantity: '200kg', cost: 180, status: 'Pendiente', technician: 'Mendez' },
];

type ViewMode = 'list' | 'selection' | 'form' | 'confirmation';

interface FormState {
  producerId: string;
  producerName?: string; // Added for display
  farmId: string;
  farmName?: string; // Added for display
  fieldId: string;
  activityType: ActivityType | null;
  quantity: string;
  cost: string;
  notes: string;
}

const MobileActivities: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const [mode, setMode] = useState<ViewMode>('list');
  const [formData, setFormData] = useState<FormState>({
    producerId: '', farmId: '', fieldId: '', activityType: null, quantity: '', cost: '', notes: ''
  });

  useEffect(() => {
    if (params?.mode === 'create') {
      setMode('selection');
      
      // Handle Context passed from Portfolio
      if (params.producerId && params.farmId) {
          setFormData({ 
              producerId: params.producerId, 
              producerName: params.producerName,
              farmId: params.farmId, 
              farmName: params.farmName,
              fieldId: '', 
              activityType: null, 
              quantity: '', 
              cost: '', 
              notes: '' 
          });
      } else {
          setFormData({ producerId: '', farmId: '', fieldId: '', activityType: null, quantity: '', cost: '', notes: '' });
      }
    }
  }, [params]);

  const handleSelectType = (type: ActivityType) => {
    setFormData(prev => ({ ...prev, activityType: type }));
    setMode('form');
  };

  const handleSave = () => {
    setMode('confirmation');
  };

  const ActivityIcon = ({ type }: { type: ActivityType }) => {
    switch (type) {
      case ActivityType.RIEGO: return <span className="text-blue-400">💧</span>;
      case ActivityType.FERTILIZACION: return <span className="text-amber-400">🧪</span>;
      case ActivityType.SIEMBRA: return <span className="text-emerald-400">🌱</span>;
      default: return <span className="text-slate-400">🚜</span>;
    }
  };

  // --- VIEW: LIST ---
  if (mode === 'list') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center pb-2">
          <div className="flex items-center gap-2">
             <button onClick={() => onNavigate('dashboard')} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
               <ChevronLeft className="h-6 w-6" />
             </button>
             <h1 className="text-xl font-bold text-white">Actividades</h1>
          </div>
          <button onClick={() => setMode('selection')} className="bg-emerald-600 text-white p-2 rounded-full shadow-lg">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400">
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {mockActivities.map(act => (
            <div key={act.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex gap-4 items-start active:bg-slate-700 transition-colors">
              <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-xl shrink-0 border border-slate-700">
                <ActivityIcon type={act.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-white truncate">{act.type}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    act.status === 'Completada' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-900' : 'bg-amber-900/50 text-amber-400 border border-amber-900'
                  }`}>
                    {act.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 flex items-center mb-1 truncate">
                  <MapPin className="h-3 w-3 mr-1" />
                  {act.farmName} - {act.fieldName}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                   <span>{act.date}</span>
                   <span>•</span>
                   <span>Cant: {act.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: SELECTION ---
  if (mode === 'selection') {
    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => setMode('list')} className="p-1 rounded-full bg-slate-800 text-slate-400">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h1 className="text-lg font-bold text-white">Nueva Actividad</h1>
            </div>
            <button onClick={() => onNavigate('selector')} className="p-2 bg-slate-800 rounded-full text-slate-400">
                <Home className="h-5 w-5" />
            </button>
        </div>

        {/* 1. Context */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 uppercase">1. Ubicación</label>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Finca / Productor</label>
              {formData.producerId ? (
                 // Locked view if context passed
                 <div className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-lg p-3 flex items-center justify-between">
                     <span>{formData.producerName} - {formData.farmName}</span>
                     <span className="text-xs bg-emerald-900 text-emerald-400 px-2 py-0.5 rounded">Pre-seleccionado</span>
                 </div>
              ) : (
                <select className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-3 outline-none">
                    <option>Seleccionar...</option>
                    <option>Juan Pérez - La Esperanza</option>
                </select>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Lote</label>
              <select className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-3 outline-none">
                <option>Seleccionar...</option>
                <option>Lote Norte (Arroz)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Type */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 uppercase">2. Tipo de Labor</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(ActivityType).map((type) => (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:bg-slate-700"
              >
                <div className="text-2xl"><ActivityIcon type={type} /></div>
                <span className="text-sm font-medium text-slate-300">{type}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: FORM ---
  if (mode === 'form') {
    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button onClick={() => setMode('selection')} className="p-1 rounded-full bg-slate-800 text-slate-400">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-white">{formData.activityType}</h1>
                    <p className="text-xs text-slate-400">
                        {formData.producerName ? `${formData.producerName} • Lote Norte` : 'Lote Norte • Juan Pérez'}
                    </p>
                </div>
            </div>
             <button onClick={() => onNavigate('selector')} className="p-2 bg-slate-800 rounded-full text-slate-400">
                <Home className="h-5 w-5" />
            </button>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-5">
           <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cantidad / Dosis</label>
             <input 
               type="text" 
               placeholder="Ej. 200 kg" 
               value={formData.quantity}
               onChange={e => setFormData({...formData, quantity: e.target.value})}
               className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-emerald-500"
             />
           </div>
           <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Costo Estimado ($)</label>
             <input 
               type="number" 
               placeholder="0.00" 
               className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-emerald-500"
             />
           </div>
           <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notas</label>
             <textarea 
               rows={3} 
               placeholder="Observaciones..."
               className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-emerald-500"
             />
           </div>

           <div className="flex gap-3 pt-2">
             <button className="flex-1 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 flex items-center justify-center text-sm font-medium">
               <Camera className="h-4 w-4 mr-2" />
               Foto
             </button>
             <button className="flex-1 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 flex items-center justify-center text-sm font-medium">
               <PenTool className="h-4 w-4 mr-2" />
               Firma
             </button>
           </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center hover:bg-emerald-500"
        >
          Guardar y Continuar
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </div>
    );
  }

  // --- VIEW: CONFIRMATION ---
  if (mode === 'confirmation') {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6">
        <div className="h-24 w-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
          <Check className="h-12 w-12 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Registrado!</h2>
          <p className="text-slate-400">Actividad guardada localmente y sincronizada con Odoo.</p>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full text-left space-y-2">
           <div className="flex justify-between">
             <span className="text-slate-500 text-sm">Labor</span>
             <span className="text-white font-medium text-sm">{formData.activityType}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-slate-500 text-sm">Cantidad</span>
             <span className="text-white font-medium text-sm">{formData.quantity}</span>
           </div>
           {formData.producerName && (
               <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                   <span className="text-slate-500 text-sm">Productor</span>
                   <span className="text-white font-medium text-sm">{formData.producerName}</span>
               </div>
           )}
        </div>

        <div className="w-full space-y-3 pt-4">
          <button 
            onClick={() => onNavigate('portfolio')}
            className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium border border-slate-700 hover:bg-slate-700"
          >
            Volver a Cartera
          </button>
          <button 
            onClick={() => {
               setFormData(prev => ({...prev, activityType: null, quantity: ''}));
               setMode('selection');
            }}
            className="w-full text-emerald-500 py-3 rounded-xl font-medium hover:bg-emerald-500/10"
          >
            Registrar Otra
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MobileActivities;
