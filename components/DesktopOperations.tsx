
import React, { useState } from 'react';
import { NavigationProps, FieldActivity, ActivityType } from '../types';
import { Search, Grid, Plus, Filter, ChevronRight, Activity, FileText, Truck, CheckSquare, X, Save, ArrowRight, Package } from 'lucide-react';

interface DesktopOperationsProps extends NavigationProps {
  currentView: string;
}

// --- MOCK DATA FOR OPERATIONS ---

const mockActivities: FieldActivity[] = [
    { id: 'a1', date: '2025-10-27 09:00', type: ActivityType.RIEGO, producerName: 'Juan Pérez', farmName: 'La Esperanza', fieldName: 'Lote Norte', quantity: 'Lámina 5cm', cost: 0, status: 'Completada', technician: 'Ing. Mendez' },
    { id: 'a2', date: '2025-10-26 14:00', type: ActivityType.FUMIGACION, producerName: 'Agro El Sol', farmName: 'Hato Grande', fieldName: 'Lote 4', quantity: 'Drone', cost: 150, status: 'Validada', technician: 'Ing. Mendez' },
];

const mockDeliveries = [
    { id: 'd1', number: 'ENT-001', date: '2025-10-25', producer: 'Juan Pérez', items: 'Urea (400kg)', status: 'Entregado', origin: 'Aproscello' },
    { id: 'd2', number: 'ENT-002', date: '2025-10-26', producer: 'Agro El Sol', items: 'Semilla Certificada (1000kg)', status: 'En Tránsito', origin: 'Alianza' },
];

// --- SUB-COMPONENTS ---

const ActivitiesView = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Actividad</th>
                    <th className="px-4 py-3">Productor / Lote</th>
                    <th className="px-4 py-3">Detalle</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3">Técnico</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {mockActivities.map(act => (
                    <tr key={act.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{act.date}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{act.type}</td>
                        <td className="px-4 py-3 text-slate-600">{act.producerName} - {act.fieldName}</td>
                        <td className="px-4 py-3 text-slate-600">{act.quantity}</td>
                        <td className="px-4 py-3 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${act.status === 'Completada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {act.status}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{act.technician}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const DeliveriesView = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                <tr>
                    <th className="px-4 py-3">Orden #</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Productor</th>
                    <th className="px-4 py-3">Insumos</th>
                    <th className="px-4 py-3">Origen</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {mockDeliveries.map(del => (
                     <tr key={del.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-emerald-600">{del.number}</td>
                        <td className="px-4 py-3 text-slate-600">{del.date}</td>
                        <td className="px-4 py-3 text-slate-800">{del.producer}</td>
                        <td className="px-4 py-3 text-slate-600">{del.items}</td>
                        <td className="px-4 py-3 text-slate-600">
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${del.origin === 'Aproscello' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                {del.origin}
                            </span>
                        </td>
                         <td className="px-4 py-3 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${del.status === 'Entregado' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {del.status}
                            </span>
                        </td>
                     </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// --- FORMS ---

const CreateActivityForm = ({ onCancel }: { onCancel: () => void }) => (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Registrar Nueva Actividad</h2>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Productor / Finca</label>
                <select className="w-full p-3 border border-slate-300 rounded-lg outline-none">
                    <option>Juan Pérez - La Esperanza</option>
                    <option>Agro El Sol - Hato Grande</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Labor</label>
                <select className="w-full p-3 border border-slate-300 rounded-lg outline-none">
                    {Object.values(ActivityType).map(t => <option key={t}>{t}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Cantidad / Dosis</label>
                    <input type="text" className="w-full p-3 border border-slate-300 rounded-lg outline-none" placeholder="Ej. 50 kg/ha" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Costo Total ($)</label>
                    <input type="number" className="w-full p-3 border border-slate-300 rounded-lg outline-none" placeholder="0.00" />
                </div>
            </div>
            <button onClick={onCancel} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 flex items-center justify-center mt-4">
                <Save className="h-5 w-5 mr-2" /> Guardar Registro
            </button>
        </div>
    </div>
);

const CreateDeliveryForm = ({ onCancel }: { onCancel: () => void }) => (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Nueva Entrega de Insumos</h2>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Productor (Apoyo Activo)</label>
                <select className="w-full p-3 border border-slate-300 rounded-lg outline-none">
                    <option>Juan Pérez (Crédito Arroz)</option>
                </select>
            </div>
            <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center"><Package className="h-4 w-4 mr-2"/> Selección de Productos (Inventario)</h4>
                <div className="flex gap-2 mb-2">
                    <select className="flex-1 p-2 border border-slate-300 rounded text-sm">
                        <option>Urea (Sacos 50kg)</option>
                        <option>Semilla SD20A</option>
                    </select>
                    <input type="number" placeholder="Cant." className="w-20 p-2 border border-slate-300 rounded text-sm" />
                    <button className="bg-slate-800 text-white px-3 rounded"><Plus className="h-4 w-4" /></button>
                </div>
                <div className="text-xs text-slate-500 italic">No hay ítems agregados.</div>
            </div>
            <button onClick={onCancel} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center mt-4">
                <ArrowRight className="h-5 w-5 mr-2" /> Generar Orden
            </button>
        </div>
    </div>
);

// --- MAIN CONTROLLER COMPONENT ---

const DesktopOperations: React.FC<DesktopOperationsProps> = ({ currentView, onNavigate }) => {
  const [isCreating, setIsCreating] = useState(false);

  const getTitle = () => {
      switch(currentView) {
          case 'ops-tasks': return { title: 'Labores Planificadas', icon: CheckSquare };
          case 'ops-applications': return { title: 'Solicitudes de Apoyo', icon: FileText };
          case 'ops-activities': return { title: 'Actividades de Campo', icon: Activity };
          case 'ops-deliveries': return { title: 'Entregas de Insumos', icon: Truck };
          default: return { title: 'Operaciones', icon: Grid };
      }
  };

  const { title, icon: Icon } = getTitle();

  if (isCreating) {
      if (currentView === 'ops-activities') return <CreateActivityForm onCancel={() => setIsCreating(false)} />;
      if (currentView === 'ops-deliveries') return <CreateDeliveryForm onCancel={() => setIsCreating(false)} />;
      // Fallback
      setIsCreating(false);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
         <div className="flex items-center space-x-2 text-sm text-slate-500">
             <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Operaciones</span>
             <ChevronRight className="h-4 w-4" />
             <span className="text-slate-800 font-bold">{title}</span>
         </div>
         <button 
            onClick={() => setIsCreating(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-emerald-700 flex items-center"
         >
            <Plus className="h-4 w-4 mr-1" /> Nuevo Registro
         </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
           <div className="flex-1 flex items-center bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
               <Search className="h-4 w-4 text-slate-400 mr-2" />
               <input type="text" placeholder="Buscar..." className="bg-transparent border-none text-sm outline-none w-full" />
           </div>
           <button className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 text-sm hover:bg-slate-50 flex items-center">
               <Filter className="h-4 w-4 mr-2" /> Filtros
           </button>
      </div>

      {/* Content Switcher */}
      {currentView === 'ops-activities' && <ActivitiesView />}
      {currentView === 'ops-deliveries' && <DeliveriesView />}
      
      {/* Fallback for others using placeholders or reusing Financing for Applications */}
      {currentView === 'ops-applications' && (
           <div className="bg-blue-50 p-6 rounded-lg text-blue-700 border border-blue-200">
               <h3 className="font-bold flex items-center"><FileText className="h-5 w-5 mr-2" /> Gestión de Solicitudes (Operativa)</h3>
               <p className="text-sm mt-2">Aquí se gestiona la carga de documentos y la inspección técnica previa a la aprobación financiera. Para la vista de comité, ir a Finanzas.</p>
               <button onClick={() => onNavigate('ops-applications')} className="mt-4 text-sm underline font-bold">Ir a Módulo de Solicitudes</button>
           </div>
      )}
      {currentView === 'ops-tasks' && (
           <div className="bg-slate-50 p-6 rounded-lg text-slate-600 border border-slate-200 text-center">
               <CheckSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
               <p>Para ver el detalle de Labores, utilice la vista de <strong>Planes de Cultivo</strong>.</p>
               <button onClick={() => onNavigate('ops-planning')} className="mt-2 text-emerald-600 font-bold text-sm hover:underline">Ir a Planes</button>
           </div>
      )}

    </div>
  );
};

export default DesktopOperations;
