
import React, { useState } from 'react';
import { Visit, VisitStatus, VisitType, NavigationProps, RecommendedInput, InputSource, AIDiagnosis } from '../types';
import { useVisits } from '../context/VisitContext';
import { 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  ClipboardCheck, 
  ChevronRight, 
  ChevronLeft,
  Filter, 
  Plus, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  X,
  Eye,
  Smartphone,
  Tractor,
  Brain,
  Layers,
  MoreVertical,
  Download,
  Package,
  Hash,
  Check
} from 'lucide-react';

const DesktopVisits: React.FC<NavigationProps> = ({ onNavigate }) => {
  const { visits, updateVisit } = useVisits();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  // Derivamos la visita seleccionada directamente del contexto para asegurar que los cambios de estado sean reactivos
  const selectedVisit = visits.find(v => v.id === selectedVisitId) || null;

  const getStatusColor = (status: VisitStatus) => {
    switch (status) {
      case VisitStatus.PLANIFICADA: return 'bg-slate-100 text-slate-600 border-slate-200';
      case VisitStatus.CONFIRMADA: return 'bg-blue-100 text-blue-700 border-blue-200';
      case VisitStatus.EN_PROCESO: return 'bg-amber-100 text-amber-700 border-amber-200';
      case VisitStatus.PENDIENTE_GESTION: return 'bg-purple-100 text-purple-700 border-purple-200';
      case VisitStatus.CERRADA: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case VisitStatus.ANULADA: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100';
    }
  };

  const handleCloseVisitFromOffice = () => {
    if (!selectedVisit) return;
    
    const confirmMsg = `¿Está seguro de finalizar administrativamente la visita ${selectedVisit.code || selectedVisit.id}? 
    
Esto validará el informe técnico y activará el proceso de pre-facturación para la orden de insumos correlativa.`;

    if (window.confirm(confirmMsg)) {
        // Actualizamos en el contexto global usando el ID
        updateVisit(selectedVisit.id, { status: VisitStatus.CERRADA });
        
        // No necesitamos actualizar un estado local 'selectedVisit' porque se deriva de 'visits'
        alert(`✅ Visita CERRADA.\n\nEl informe ha sido validado y los insumos están disponibles para despacho.`);
    }
  };

  const filteredVisits = visits.filter(v => 
    v.producerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.farmName && v.farmName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.code && v.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    v.technician.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- DETAIL VIEW ---
  if (selectedVisit) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setSelectedVisitId(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-bold transition-colors"
          >
            <ChevronLeft className="h-5 w-5" /> Volver al listado de visitas
          </button>
          <div className="flex gap-3">
            {selectedVisit.status !== VisitStatus.CERRADA && (
              <button 
                onClick={handleCloseVisitFromOffice}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                  <Check className="h-4 w-4" /> FINALIZAR VISITA
              </button>
            )}
            <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-900 flex items-center gap-2 shadow-sm">
                <Download className="h-4 w-4" /> EXPORTAR PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card matching Screenshot */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedVisit.producerName}</h2>
                  <p className="text-slate-400 font-bold flex items-center mt-2 text-base">
                    <MapPin className="h-5 w-5 mr-1.5 text-slate-300" /> {selectedVisit.farmName}
                  </p>
                </div>
                <span className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border transition-colors duration-500 ${getStatusColor(selectedVisit.status)}`}>
                  {selectedVisit.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-8 gap-x-12 border-t border-slate-100 pt-8">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Tipo de Visita</label>
                  <p className="font-bold text-slate-700 text-base">{selectedVisit.type}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Fecha</label>
                  <p className="font-bold text-slate-700 text-base">{selectedVisit.date}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Técnico Asignado</label>
                  <p className="font-bold text-slate-700 text-base">{selectedVisit.technician}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Correlativo</label>
                  <p className="font-bold text-slate-700 text-base font-mono uppercase tracking-tighter">{selectedVisit.code || selectedVisit.id}</p>
                </div>
              </div>
            </div>

            {/* Diagnóstico IA Gemini */}
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm overflow-hidden group min-h-[200px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-emerald-600 group-hover:scale-110 transition-transform" /> 
                  Diagnóstico Inteligente (Gemini AI)
                </h3>
                {selectedVisit.aiDiagnosis && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 uppercase">CONF: {selectedVisit.aiDiagnosis.confidence}%</span>
                  </div>
                )}
              </div>
              
              {selectedVisit.aiDiagnosis ? (
                <div className="flex-1 animate-in fade-in duration-500">
                  <div className="p-4 bg-emerald-900 text-white rounded-xl flex justify-between items-center shadow-lg border-b-4 border-emerald-700">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-300 uppercase mb-1 tracking-widest">Hallazgo Principal</p>
                      <p className="text-xl font-black">{selectedVisit.aiDiagnosis.condition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-300 uppercase mb-1 tracking-widest">Severidad</p>
                      <span className="text-lg font-black">{selectedVisit.aiDiagnosis.severity}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Recomendación Técnica del Informe</p>
                    <p className="text-slate-700 text-sm leading-relaxed font-medium italic">"{selectedVisit.aiDiagnosis.recommendation}"</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/30 p-8">
                    <Brain className="h-12 w-12 text-slate-200 mb-3" />
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Sin Diagnóstico IA Registrado</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Recommended Inputs Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.15em]">Insumos Autorizados</h3>
              </div>
              
              {selectedVisit.recommendedInputs && selectedVisit.recommendedInputs.length > 0 ? (
                <div className="space-y-4">
                  {selectedVisit.recommendedInputs.map((input, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group hover:border-emerald-200 transition-colors">
                      <div>
                        <p className="text-sm font-black text-slate-800 group-hover:text-emerald-700 transition-colors">{input.product}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{input.quantity} {input.unit} • {input.source}</p>
                      </div>
                      <span className={`text-[9px] px-2 py-1 rounded font-black uppercase tracking-widest border ${input.status === 'Aprobado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {input.status}
                      </span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Este informe funciona como Orden de Entrega</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-slate-100" />
                    <p className="text-sm text-slate-400 italic font-medium">Sin prescripción de insumos.</p>
                </div>
              )}
            </div>

            {/* Evidence Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.15em] mb-4">Evidencia Fotográfica</h3>
                 <div className="grid grid-cols-2 gap-2">
                     {selectedVisit.visualRecords && selectedVisit.visualRecords.length > 0 ? (
                       selectedVisit.visualRecords.map(vr => (
                         <div key={vr.id} className="aspect-square bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                           <img src={vr.imageUrl} className="w-full h-full object-cover" alt="Evidencia" />
                         </div>
                       ))
                     ) : (
                       <div className="aspect-square bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                           <Tractor className="h-6 w-6 text-slate-200" />
                       </div>
                     )}
                     <div className="aspect-square bg-slate-50 rounded-lg border border-slate-200 border-dashed flex items-center justify-center group hover:bg-emerald-50 transition-colors cursor-pointer">
                         <Plus className="h-4 w-4 text-slate-300 group-hover:text-emerald-500" />
                     </div>
                 </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión de Visitas Técnicas</h1>
          <p className="text-sm text-slate-500 font-medium">Historial y seguimiento de inspecciones de campo</p>
        </div>
        <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
          <Plus className="h-5 w-5 mr-2" /> Programar Nueva Visita
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 shadow-sm items-center">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center shadow-inner">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Filtrar por productor, técnico o ID..." 
            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-50 flex items-center shadow-sm">
          <Filter className="h-4 w-4 mr-2" /> Filtros
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b font-black text-slate-500 text-[10px] uppercase tracking-widest">
            <tr>
              <th className="p-5">Correlativo</th>
              <th className="p-5">Fecha</th>
              <th className="p-5">Productor / Finca</th>
              <th className="p-5">Tipo</th>
              <th className="p-5">Técnico</th>
              <th className="p-5 text-center">Estado</th>
              <th className="p-5 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredVisits.map(visit => (
              <tr key={visit.id} onClick={() => setSelectedVisitId(visit.id)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                <td className="p-5 font-black text-emerald-800 font-mono uppercase">{visit.code || visit.id}</td>
                <td className="p-5 font-medium text-slate-600">{visit.date}</td>
                <td className="p-5">
                  <div className="font-bold text-slate-800">{visit.producerName}</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{visit.farmName}</div>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded text-[10px] font-black border uppercase tracking-wider ${visit.type === VisitType.SEGUIMIENTO ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                    {visit.type}
                  </span>
                </td>
                <td className="p-5 text-slate-600 font-bold">{visit.technician}</td>
                <td className="p-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(visit.status)}`}>
                    {visit.status}
                  </span>
                </td>
                <td className="p-5 text-center">
                  <button className="bg-slate-100 text-slate-500 p-2 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesktopVisits;
