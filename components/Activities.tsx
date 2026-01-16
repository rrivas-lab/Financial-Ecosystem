import React, { useState, useEffect } from 'react';
import { FieldActivity, ActivityType, NavigationProps } from '../types';
import { 
  Plus, Search, Filter, Calendar, MapPin, 
  X, Camera, Check, ChevronLeft, ArrowRight,
  ClipboardList
} from 'lucide-react';

const mockActivities: FieldActivity[] = [
  {
    id: 'a1',
    date: '2025-10-26 08:30',
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
    date: '2025-10-26 10:15',
    type: ActivityType.FERTILIZACION,
    producerName: 'Agro El Sol',
    farmName: 'Hato Grande',
    fieldName: 'Lote 4',
    quantity: '200kg Urea',
    cost: 180,
    status: 'Pendiente',
    technician: 'Ing. Mendez'
  },
  {
    id: 'a3',
    date: '2025-10-25 14:00',
    type: ActivityType.FUMIGACION,
    producerName: 'Maria Rodriguez',
    farmName: 'Parcela 45',
    fieldName: 'Lote 1',
    quantity: 'Drone - 2ha',
    cost: 120,
    status: 'Validada',
    technician: 'Ing. Mendez'
  }
];

type ViewMode = 'list' | 'selection' | 'form' | 'confirmation';

interface FormState {
  producerId: string;
  farmId: string;
  fieldId: string;
  activityType: ActivityType | null;
  quantity: string;
  cost: string;
  notes: string;
}

const ActivityIcon = ({ type }: { type: ActivityType }) => {
  switch (type) {
    case ActivityType.RIEGO: return <span className="text-blue-500">💧</span>;
    case ActivityType.FERTILIZACION: return <span className="text-amber-500">🧪</span>;
    case ActivityType.SIEMBRA: return <span className="text-emerald-500">🌱</span>;
    case ActivityType.FUMIGACION: return <span className="text-purple-500">🛸</span>;
    case ActivityType.COSECHA: return <span className="text-orange-500">🌾</span>;
    default: return <span className="text-slate-500">🚜</span>;
  }
};

const Activities: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const [mode, setMode] = useState<ViewMode>('list');
  const [formData, setFormData] = useState<FormState>({
    producerId: '',
    farmId: '',
    fieldId: '',
    activityType: null,
    quantity: '',
    cost: '',
    notes: ''
  });

  // Handle initialization params (e.g., coming from FAB)
  useEffect(() => {
    if (params?.mode === 'create') {
      setMode('selection');
      // Reset form if starting new
      setFormData({
         producerId: '', farmId: '', fieldId: '', activityType: null, quantity: '', cost: '', notes: ''
      });
    }
  }, [params]);

  const handleSelectType = (type: ActivityType) => {
    setFormData(prev => ({ ...prev, activityType: type }));
    setMode('form');
  };

  const handleSave = () => {
    // Validate
    if (!formData.activityType || !formData.quantity) {
      alert('Por favor complete los campos obligatorios');
      return;
    }
    // Mock save logic would go here
    setMode('confirmation');
  };

  // --- SUB-COMPONENTS RENDERERS ---

  const renderList = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Actividades de Campo</h1>
          <p className="text-sm text-slate-500">Historial de labores registradas</p>
        </div>
        <button 
          onClick={() => setMode('selection')}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Registrar Actividad
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por lote, productor..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <button className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-50">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
              <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-xl shrink-0">
                <ActivityIcon type={activity.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-900 truncate">{activity.type}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activity.status === 'Completada' ? 'bg-emerald-100 text-emerald-700' :
                    activity.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1 flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                  {activity.producerName} - {activity.farmName} ({activity.fieldName})
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {activity.date}</span>
                  <span className="font-medium text-slate-700">Cant: {activity.quantity}</span>
                  <span className="font-medium text-slate-700">Est: ${activity.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSelection = () => (
    <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-4">
        <button onClick={() => setMode('list')} className="p-2 hover:bg-slate-200 rounded-full">
          <ChevronLeft className="h-6 w-6 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Nueva Actividad</h1>
      </div>

      {/* Context Selection First */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
         <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">1. Seleccione Ubicación</h2>
         <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Productor / Finca</label>
            <select className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Seleccionar...</option>
              <option>Juan Pérez - Finca La Esperanza</option>
              <option>Agro El Sol - Hato Grande</option>
            </select>
         </div>
         <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Lote / Campo</label>
            <select className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Seleccionar...</option>
              <option>Lote Norte (Arroz SD20A)</option>
              <option>Lote Sur (Arroz Matias)</option>
            </select>
         </div>
      </div>

      {/* Activity Type Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">2. Tipo de Labor</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(ActivityType).map((type) => (
            <button
              key={type}
              onClick={() => handleSelectType(type)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-95 group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform"><ActivityIcon type={type} /></div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-emerald-700">{type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-4">
        <button onClick={() => setMode('selection')} className="p-2 hover:bg-slate-200 rounded-full">
          <ChevronLeft className="h-6 w-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Registrar {formData.activityType}</h1>
          <p className="text-xs text-slate-500">Juan Pérez • Lote Norte</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
         
         <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cultivo</label>
              <input type="text" value="Arroz (SD20A)" disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cantidad / Dosis</label>
              <input 
                type="text" 
                placeholder="Ej. 200 kg" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Costo Est. ($)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
              />
            </div>
         </div>

         <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Observaciones</label>
            <textarea 
              rows={3} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Detalles adicionales..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
         </div>

         {/* Evidence / Actions */}
         <div className="flex gap-3">
            <button className="flex-1 py-3 border border-slate-300 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 font-medium text-sm">
              <Camera className="h-4 w-4 mr-2" />
              Tomar Foto
            </button>
            <button className="flex-1 py-3 border border-slate-300 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 font-medium text-sm">
               Firma Digital
            </button>
         </div>

         <button 
           onClick={handleSave}
           className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-md flex items-center justify-center mt-4"
         >
           Guardar y Continuar
           <ArrowRight className="h-5 w-5 ml-2" />
         </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="max-w-md mx-auto text-center pt-10 animate-in zoom-in duration-300 px-4">
      <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Actividad Registrada!</h2>
      <p className="text-slate-500 mb-8">
        Se ha guardado el registro de <strong>{formData.activityType}</strong> exitosamente.
      </p>

      <div className="bg-white p-4 rounded-xl border border-slate-200 text-left mb-8 shadow-sm">
         <div className="flex justify-between py-2 border-b border-slate-100">
           <span className="text-slate-500 text-sm">Productor:</span>
           <span className="font-medium text-slate-800 text-sm">Juan Pérez</span>
         </div>
         <div className="flex justify-between py-2 border-b border-slate-100">
           <span className="text-slate-500 text-sm">Actividad:</span>
           <span className="font-medium text-slate-800 text-sm">{formData.activityType}</span>
         </div>
         <div className="flex justify-between py-2">
           <span className="text-slate-500 text-sm">Cantidad:</span>
           <span className="font-medium text-slate-800 text-sm">{formData.quantity}</span>
         </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-900"
        >
          Volver al Inicio
        </button>
        <button 
          onClick={() => {
            // Keep context, reset form fields only
            setFormData(prev => ({ ...prev, activityType: null, quantity: '', cost: '', notes: '' }));
            setMode('selection');
          }}
          className="w-full text-emerald-600 py-3 rounded-xl font-medium hover:bg-emerald-50 border border-transparent hover:border-emerald-100"
        >
          Registrar Otra Actividad
        </button>
      </div>
    </div>
  );

  return (
    <div className="pb-20 lg:pb-0 min-h-full">
      {mode === 'list' && renderList()}
      {mode === 'selection' && renderSelection()}
      {mode === 'form' && renderForm()}
      {mode === 'confirmation' && renderConfirmation()}
    </div>
  );
};

export default Activities;
