
import React, { useState } from 'react';
import { CropPlan, PlannedTask, ActivityType, NavigationProps } from '../types';
import { Calendar, ChevronRight, Plus, SlidersHorizontal, ArrowRight, CheckSquare, X, Save } from 'lucide-react';

const mockPlans: CropPlan[] = [
  {
    id: 'p1',
    name: 'Plan Arroz Invierno 2025',
    lotId: 'L-101',
    farmName: 'Finca La Esperanza',
    producerName: 'Juan Pérez',
    cycle: 'Invierno 2025',
    type: 'Semilla',
    hectares: 25,
    tasks: [
      { id: 't1', activityType: ActivityType.PREPARACION, dayRelative: 1, duration: 5, status: 'Ejecutada' },
      { id: 't2', activityType: ActivityType.SIEMBRA, dayRelative: 10, duration: 2, status: 'Ejecutada' },
      { id: 't3', activityType: ActivityType.RIEGO, dayRelative: 15, duration: 1, status: 'Ejecutada' },
      { id: 't4', activityType: ActivityType.FERTILIZACION, dayRelative: 25, duration: 1, status: 'Planificada' },
      { id: 't5', activityType: ActivityType.FUMIGACION, dayRelative: 40, duration: 1, status: 'Planificada' },
      { id: 't6', activityType: ActivityType.COSECHA, dayRelative: 115, duration: 5, status: 'Planificada' },
    ]
  },
  {
      id: 'p2',
      name: 'Plan Maíz Invierno 2025',
      lotId: 'L-102',
      farmName: 'Hato Grande',
      producerName: 'Agro El Sol',
      cycle: 'Invierno 2025',
      type: 'Consumo',
      hectares: 50,
      tasks: [
        { id: 't7', activityType: ActivityType.PREPARACION, dayRelative: 1, duration: 7, status: 'Ejecutada' },
        { id: 't8', activityType: ActivityType.SIEMBRA, dayRelative: 12, duration: 3, status: 'Planificada' },
      ]
  }
];

const DesktopPlanning: React.FC<NavigationProps> = ({ onNavigate }) => {
  const [plans, setPlans] = useState(mockPlans);
  const [viewMode, setViewMode] = useState<'gantt' | 'tasks' | 'create'>('gantt');

  const getTaskColor = (status: string) => {
    switch(status) {
        case 'Ejecutada': return 'bg-emerald-500 hover:bg-emerald-600';
        case 'Autorizada': return 'bg-blue-500 hover:bg-blue-600';
        case 'Planificada': return 'bg-slate-300 hover:bg-slate-400';
        case 'Vencida': return 'bg-red-500 hover:bg-red-600';
        default: return 'bg-slate-200';
    }
  };

  const maxDays = 130; // Visualization width

  // --- WIZARD RENDERER ---
  const renderCreateWizard = () => (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Nuevo Plan de Cultivo</h2>
              <button onClick={() => setViewMode('gantt')} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
              </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Productor / Finca</label>
                  <select className="w-full p-3 border border-slate-300 rounded-lg outline-none">
                      <option>Juan Pérez - La Esperanza</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Lote a Planificar</label>
                  <select className="w-full p-3 border border-slate-300 rounded-lg outline-none">
                      <option>Lote Nuevo 1 (20ha)</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ciclo Agrícola</label>
                  <select className="w-full p-3 border border-slate-300 rounded-lg outline-none">
                      <option>Invierno 2025</option>
                      <option>Verano 2025</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Patrón de Apoyo (Plantilla)</label>
                  <select className="w-full p-3 border border-slate-300 rounded-lg outline-none">
                      <option>Arroz Consumo Estándar</option>
                      <option>Arroz Semilla Certificada</option>
                  </select>
              </div>
          </div>

          <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-2 text-sm uppercase">Previsualización de Tareas (Automático)</h3>
              <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between"><span>Día 1: Preparación</span><span>5 días</span></div>
                  <div className="flex justify-between"><span>Día 10: Siembra</span><span>3 días</span></div>
                  <div className="flex justify-between"><span>Día 25: Fertilización 1</span><span>1 día</span></div>
                  <div className="flex justify-between text-slate-400 italic">... y 12 tareas más.</div>
              </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setViewMode('gantt')} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium">Cancelar</button>
              <button onClick={() => { alert('Plan creado y tareas generadas.'); setViewMode('gantt'); }} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center">
                  <Save className="h-5 w-5 mr-2" /> Guardar y Generar
              </button>
          </div>
      </div>
  );

  if (viewMode === 'create') return renderCreateWizard();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
         <div className="flex items-center space-x-2 text-sm text-slate-500">
             <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Operaciones</span>
             <ChevronRight className="h-4 w-4" />
             <span className="text-slate-800 font-bold">Planes de Cultivo (Gantt)</span>
         </div>
         <div className="flex space-x-2">
            <button 
                onClick={() => setViewMode('gantt')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${viewMode === 'gantt' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-700'}`}
            >
                Vista Gantt
            </button>
            <button 
                onClick={() => setViewMode('tasks')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${viewMode === 'tasks' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-700'}`}
            >
                Lista de Labores
            </button>
            <button 
                onClick={() => setViewMode('create')}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded shadow-sm text-sm font-medium hover:bg-emerald-700 flex items-center"
            >
                <Plus className="h-4 w-4 mr-1" /> Nuevo Plan
            </button>
         </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <div className="flex gap-4 mb-6">
               <div className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 flex items-center">
                   <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                   <select className="bg-transparent text-sm w-full outline-none text-slate-700 font-medium">
                       <option>Ciclo Invierno 2025</option>
                       <option>Ciclo Verano 2025</option>
                   </select>
               </div>
               <button className="px-3 py-2 border border-slate-200 rounded hover:bg-slate-50 flex items-center text-sm text-slate-600">
                   <SlidersHorizontal className="h-4 w-4 mr-2" /> Filtros
               </button>
          </div>

          {viewMode === 'gantt' && (
            <div className="space-y-8">
                {plans.map(plan => (
                    <div key={plan.id} className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                        <div className="flex justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-800 text-lg">{plan.producerName}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${plan.type === 'Semilla' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                        {plan.type}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    {plan.farmName} • Lote {plan.lotId} 
                                    <span className="text-slate-300">|</span> 
                                    {plan.hectares} ha
                                </p>
                            </div>
                            <div className="text-right">
                                <button className="text-sm text-emerald-600 font-medium hover:underline flex items-center">
                                    Ver Detalle <ArrowRight className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </div>

                        {/* Gantt Timeline */}
                        <div className="relative">
                             {/* Days Scale */}
                            <div className="flex text-[10px] text-slate-400 mb-1 px-1">
                                <span className="w-[20%]">Inicio</span>
                                <span className="w-[20%]">Día 30</span>
                                <span className="w-[20%]">Día 60</span>
                                <span className="w-[20%]">Día 90</span>
                                <span className="w-[20%]">Cosecha (120+)</span>
                            </div>

                            <div className="relative h-12 bg-slate-50 rounded border border-slate-200 overflow-hidden">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex">
                                    {[0, 20, 40, 60, 80].map(pct => (
                                        <div key={pct} className="border-r border-slate-200 h-full" style={{ width: '20%' }}></div>
                                    ))}
                                </div>
                                
                                {/* Task Bars */}
                                {plan.tasks.map(task => (
                                    <div 
                                        key={task.id}
                                        className={`absolute h-6 top-3 rounded shadow-sm flex items-center justify-center text-[10px] text-white font-bold cursor-pointer transition-all border border-white/20 ${getTaskColor(task.status)}`}
                                        style={{ 
                                            left: `${(task.dayRelative / maxDays) * 100}%`, 
                                            width: `${Math.max((task.duration || 5) / maxDays * 100, 5)}%`,
                                        }}
                                        title={`${task.activityType} - Día ${task.dayRelative}`}
                                    >
                                        <span className="truncate px-1">{task.activityType}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          )}

          {viewMode === 'tasks' && (
              <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Labor</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Productor / Lote</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Día Rel.</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Estado</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Acción</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {plans.flatMap(p => p.tasks.map(t => ({...t, plan: p}))).map(task => (
                              <tr key={task.id} className="hover:bg-slate-50 text-sm">
                                  <td className="px-4 py-3 font-medium text-slate-800">{task.activityType}</td>
                                  <td className="px-4 py-3 text-slate-600">{task.plan.producerName} - {task.plan.lotId}</td>
                                  <td className="px-4 py-3 text-slate-600">Día {task.dayRelative}</td>
                                  <td className="px-4 py-3 text-center">
                                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                          task.status === 'Ejecutada' ? 'bg-emerald-100 text-emerald-700' :
                                          task.status === 'Planificada' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'
                                      }`}>
                                          {task.status}
                                      </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                      <button className="text-emerald-600 hover:text-emerald-700 font-medium text-xs">Editar</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
    </div>
  );
};

export default DesktopPlanning;
