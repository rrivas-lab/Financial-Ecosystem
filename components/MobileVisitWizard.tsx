
import React, { useState, useRef } from 'react';
import { NavigationProps, RouteStop, AIDiagnosis, RecommendedInput, InputSource, ActivityType, VisitSpecificData, InitialEvalData, SeedInspectionData, FollowUpData, VisitType, VisualRecord, InputProduct, VisitStatus, Delivery } from '../types';
import { analyzeCropImage } from '../services/geminiService';
import { ChevronLeft, Home, Camera, CheckSquare, Brain, Microscope, AlertTriangle, Plus, Trash2, ArrowRight, CheckCircle, Save, FileText, Download, Truck, Droplets, Tractor, Sprout, ClipboardCheck, Map, Image as LucideImage, Loader2, X, Info, Beaker, FlaskConical, Hash, Clock, Mountain, Waves, Settings, Ruler, Zap, ScrollText, ClipboardList, Package } from 'lucide-react';
import { useVisits } from '../context/VisitContext';
import { useRoutes } from '../context/RouteContext';
import { useMasterData } from '../context/MasterDataContext';
import { useApplications } from '../context/ApplicationContext';
import { useProducers } from '../context/ProducerContext';

interface WizardProps extends NavigationProps {
  params: {
    stop: RouteStop;
    returnTo?: string;
  }
}

const MobileVisitWizard: React.FC<WizardProps> = ({ onNavigate, params }) => {
  const { updateVisit, getVisitById } = useVisits();
  const { completeStop, activePlan } = useRoutes();
  const { inputs: masterInputs } = useMasterData();
  const { sendMessageToProducer, producers } = useProducers();
  
  const [step, setStep] = useState<'specific' | 'diagnosis' | 'recipe' | 'summary'>('specific');
  const stop = params?.stop;
  const returnTo = params?.returnTo || 'visits';
  
  const fullVisit = stop.visitId ? getVisitById(stop.visitId) : null;
  const visitType = fullVisit?.type || params?.stop?.reason || VisitType.SEGUIMIENTO;

  const [isEverythingOk, setIsEverythingOk] = useState(true);
  const [visualRecords, setVisualRecords] = useState<VisualRecord[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [observations, setObservations] = useState('');
  const [recipeDelivered, setRecipeDelivered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recommendations, setRecommendations] = useState<RecommendedInput[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [recForm, setRecForm] = useState({ qty: '', source: 'Aproscello' as InputSource, appMethod: 'Foliar' });
  const [showRecForm, setShowRecForm] = useState(false);

  const handleAddPhoto = () => { fileInputRef.current?.click(); };
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const newRecord: VisualRecord = { id: `vr-${Date.now()}`, imageUrl: base64String, description: '', timestamp: new Date().toLocaleTimeString() };
      setVisualRecords(prev => [...prev, newRecord]);
      setLoadingAI(true);
      try {
        const result = await analyzeCropImage(base64String.split(',')[1]);
        setVisualRecords(prev => prev.map(vr => vr.id === newRecord.id ? { ...vr, aiDiagnosis: result, description: `IA: ${result.condition}. ${result.recommendation}` } : vr));
      } catch (error) { console.error(error); } finally { setLoadingAI(false); }
    };
    reader.readAsDataURL(file);
  };

  const addRecommendation = () => {
      const input = masterInputs.find(i => i.id === selectedProductId);
      if(!input || !recForm.qty) return;
      const newRec: RecommendedInput = { 
        id: Date.now().toString(), 
        product: input.name, 
        category: input.category, 
        quantity: parseFloat(recForm.qty), 
        unit: input.unit, 
        source: recForm.source, 
        status: 'Pendiente', 
        costEstimate: (input.price || 0) * parseFloat(recForm.qty) 
      };
      setRecommendations([...recommendations, newRec]);
      setSelectedProductId(''); setRecForm({ qty: '', source: 'Aproscello', appMethod: 'Foliar' }); setShowRecForm(false);
  };

  const handleFinish = () => {
      const visitId = stop.visitId || `v-manual-${Date.now()}`;
      const deliveryCode = recommendations.length > 0 && !recipeDelivered ? `ORD-${stop.visitCode || 'VIS'}-${Math.floor(Math.random()*900+100)}` : null;
      
      const visitUpdates = { 
          status: VisitStatus.CERRADA, 
          visualRecords, 
          aiDiagnosis: visualRecords[0]?.aiDiagnosis, 
          recommendedInputs: recommendations, 
          observations,
          validationResult: isEverythingOk ? 'Aprobado' : 'Rechazado'
      };

      if (stop.visitId) { updateVisit(stop.visitId, visitUpdates as any); }
      if (activePlan) { 
          const day = activePlan.days.find(d => d.stops.some(s => s.id === stop.id));
          if (day) completeStop(day.id, stop.id);
      }

      // NOTIFICACIÓN FINAL AL PRODUCTOR CON RÉCIPE DIGITAL
      let summaryMsg = `📑 *INFORME DE INSPECCIÓN TÉCNICA*\n\n✅ Visita: ${stop.visitCode}\n🚜 Finca: ${stop.farmName}\n👤 Técnico: Ing. Juan P. Martinez\n\n📝 *DIAGNÓSTICO:* ${visualRecords[0]?.aiDiagnosis?.condition || 'Desarrollo Normal'}\n📋 *ESTADO:* ${isEverythingOk ? 'CUMPLE PROTOCOLO' : 'OBSERVADO'}\n\n`;

      if (recommendations.length > 0) {
          summaryMsg += `💊 *PRESCRIPCIÓN (RÉCIPE):*\n`;
          recommendations.forEach(r => summaryMsg += `- ${r.product}: ${r.quantity} ${r.unit} (Retirar en ${r.source})\n`);
          
          if (recipeDelivered) {
              summaryMsg += `\n⚠️ *NOTA:* Se hizo entrega física del récipe para retiro por cuenta propia.`;
          } else {
              summaryMsg += `\n🚚 *ORDEN DE ENTREGA:* **${deliveryCode}**\nPresente este código en almacén para pre-facturación y retiro inmediato.`;
          }
      } else {
          summaryMsg += `✨ No se requieren aplicaciones de insumos en este momento.`;
      }
      
      summaryMsg += `\n\n📄 Ver Informe Detallado: [Descargar_PDF]`;

      const producer = producers.find(p => p.name === stop.producerName);
      if (producer) {
          sendMessageToProducer(producer.id, summaryMsg);
      }

      alert(`Visita cerrada exitosamente.\n\n${deliveryCode ? `Orden ${deliveryCode} generada como Pre-Factura.` : recipeDelivered ? 'Récipe técnico entregado al productor.' : 'Informe registrado sin insumos.'}`);
      onNavigate(returnTo);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-slate-800 bg-slate-950 z-20 sticky top-0">
          <div className="flex items-center gap-3">
              <button onClick={() => onNavigate(returnTo)} className="p-2 rounded-full bg-slate-800 text-slate-400 border border-slate-700"><ChevronLeft className="h-5 w-5" /></button>
              <div><h1 className="text-sm font-bold text-white uppercase">{visitType}</h1><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stop.visitCode}</p></div>
          </div>
          <div className="flex gap-1.5">{[1, 2, 3, 4].map(i => (<div key={i} className={`h-1.5 w-6 rounded-full ${i <= (step === 'specific' ? 1 : step === 'diagnosis' ? 2 : step === 'recipe' ? 3 : 4) ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`}></div>))}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide pb-24">
         {step === 'specific' && ( 
             <div className="space-y-6 animate-in slide-in-from-right-4">
                 <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl">
                    <h2 className="text-white font-bold uppercase text-[10px] tracking-widest mb-4 flex items-center"><Settings className="h-4 w-4 mr-2 text-blue-400"/> Parámetros de Campo</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-slate-500 text-[10px] font-bold uppercase block mb-1">Etapa Fenológica</label>
                            <select className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl text-sm outline-none">
                                <option>Vegetativa - Macollamiento</option>
                                <option>Reproductiva - Floración</option>
                                <option>Maduración - Cosecha</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-500 text-[10px] font-bold uppercase block mb-1">Humedad Suelo</label>
                            <select className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl text-sm outline-none"><option>Óptima</option><option>Exceso</option><option>Déficit</option></select>
                        </div>
                        <div>
                            <label className="text-slate-500 text-[10px] font-bold uppercase block mb-1">Presión Plagas</label>
                            <select className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl text-sm outline-none"><option>Nula</option><option>Leve</option><option>Crítica</option></select>
                        </div>
                    </div>
                 </div>
                 <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                    <label className="text-slate-500 text-[10px] font-bold uppercase block mb-2">Informe de Estado del Lote</label>
                    <textarea rows={4} value={observations} onChange={e => setObservations(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl text-sm outline-none" placeholder="Describa el vigor, uniformidad y condiciones generales..." />
                 </div>
             </div> 
         )}

         {step === 'diagnosis' && ( 
             <div className="space-y-6 animate-in slide-in-from-right-4">
                 <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                        <h2 className="text-white font-bold uppercase text-xs tracking-widest flex items-center"><Brain className="h-4 w-4 mr-2 text-emerald-400" /> Diagnóstico IA</h2>
                        <button onClick={handleAddPhoto} className="bg-emerald-600 text-white p-1.5 rounded-full"><Plus className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {visualRecords.map(vr => (
                            <div key={vr.id} className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                                <div className="relative h-40"><img src={vr.imageUrl} className="w-full h-full object-cover" /><button onClick={() => setVisualRecords(prev => prev.filter(r => r.id !== vr.id))} className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full shadow-lg"><X className="h-4 w-4" /></button></div>
                                <div className="p-3">
                                    {vr.aiDiagnosis ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="bg-emerald-900/40 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase">Detección Gemini 3</span>
                                                <span className="text-slate-500 text-[10px] font-bold">CONF: {vr.aiDiagnosis.confidence}%</span>
                                            </div>
                                            <p className="text-sm font-bold text-white leading-tight">{vr.aiDiagnosis.condition}</p>
                                            <p className="text-xs text-slate-400 italic">"{vr.aiDiagnosis.recommendation}"</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-500 animate-pulse"><Loader2 className="h-4 w-4 animate-spin"/> <span className="text-xs font-bold uppercase tracking-wider">Procesando imagen...</span></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {visualRecords.length === 0 && (
                        <div onClick={handleAddPhoto} className="border-2 border-dashed border-slate-700 p-12 rounded-2xl flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 hover:bg-slate-800 transition-colors cursor-pointer">
                            <Camera className="h-10 w-10 mb-2 text-slate-600"/><span className="text-xs font-black uppercase tracking-widest">Capturar Evidencia</span>
                        </div>
                    )}
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             </div> 
         )}

         {step === 'recipe' && ( 
             <div className="space-y-6 animate-in slide-in-from-right-4">
                 <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                        <h2 className="text-white font-bold uppercase text-xs tracking-widest flex items-center"><FlaskConical className="h-4 w-4 mr-2 text-purple-400" /> Prescripción Técnica</h2>
                        <button onClick={() => setShowRecForm(true)} className="bg-emerald-600 text-white px-3 py-1 rounded text-[10px] font-black shadow-lg uppercase tracking-wider">Añadir Insumo</button>
                    </div>
                    
                    <div className="space-y-3">
                        {recommendations.map(r => (
                            <div key={r.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg"><Package className="h-5 w-5 text-slate-400"/></div>
                                    <div>
                                        <p className="text-sm font-black text-white">{r.product}</p>
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">{r.quantity} {r.unit} • {r.source}</p>
                                    </div>
                                </div>
                                <button onClick={() => setRecommendations(prev => prev.filter(i => i.id !== r.id))} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        ))}
                        {recommendations.length === 0 && (
                            <div className="text-center py-6 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                                <Beaker className="h-8 w-8 mx-auto mb-2 opacity-20"/>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Sin insumos prescritos</p>
                            </div>
                        )}
                    </div>

                    {showRecForm && (
                        <div className="mt-6 bg-slate-900 p-5 rounded-2xl border border-emerald-500/50 animate-in zoom-in-95 space-y-4 shadow-2xl">
                            <div>
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Seleccionar Producto</label>
                                <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm text-white">
                                    <option value="">-- Buscar Insumo --</option>
                                    {masterInputs.map(i => (<option key={i.id} value={i.id}>{i.name} ({i.category})</option>))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Dosis / Cantidad</label>
                                    <input type="number" value={recForm.qty} onChange={e => setRecForm({...recForm, qty: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm text-white" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Firma Financiadora</label>
                                    <select value={recForm.source} onChange={e => setRecForm({...recForm, source: e.target.value as any})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm text-white">
                                        <option value="Aproscello">Aproscello</option>
                                        <option value="Alianza">Alianza Aliada</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={addRecommendation} className="flex-1 bg-emerald-600 text-white p-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Prescribir</button>
                                <button onClick={() => setShowRecForm(false)} className="flex-1 bg-slate-700 text-slate-300 p-3 rounded-xl text-xs font-black uppercase tracking-widest">Cerrar</button>
                            </div>
                        </div>
                    )}

                    {recommendations.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-700">
                             <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${recipeDelivered ? 'bg-emerald-600 border-emerald-600 shadow-[0_0_8px_#10b981]' : 'bg-slate-900 border-slate-600 group-hover:border-emerald-50'}`} onClick={() => setRecipeDelivered(!recipeDelivered)}>
                                    {recipeDelivered && <CheckCircle className="h-4 w-4 text-white" />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Entregué Récipe Físico</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">El productor no requiere orden de retiro inmediata</p>
                                </div>
                             </label>
                        </div>
                    )}
                 </div>
             </div> 
         )}

         {step === 'summary' && ( 
             <div className="space-y-6 animate-in slide-in-from-right-4">
                 <div className="text-center py-6">
                    <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black tracking-tight">Informe Listado</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Listo para Sincronización y Pre-Factura</p>
                 </div>
                 
                 <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resumen del Informe</span>
                        <div className="flex gap-1">
                            <Zap className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                            <Zap className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                        </div>
                    </div>
                    <div className="divide-y divide-slate-700/50">
                        <div className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3 text-slate-400"><ClipboardList className="h-4 w-4"/> <span className="text-[10px] font-black uppercase">Inspección de Lote</span></div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${isEverythingOk ? 'text-emerald-400 border-emerald-500/30' : 'text-red-400 border-red-500/30'}`}>{isEverythingOk ? 'CUMPLE' : 'REVISAR'}</span>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3 text-slate-400"><Brain className="h-4 w-4"/> <span className="text-[10px] font-black uppercase">Hallazgos IA</span></div>
                            <span className="text-xs font-bold text-white">{visualRecords.length} REGISTROS</span>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3 text-slate-400"><Truck className="h-4 w-4"/> <span className="text-[10px] font-black uppercase">Modo Entrega</span></div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${recipeDelivered ? 'text-amber-400 border-amber-500/30' : recommendations.length > 0 ? 'text-purple-400 border-purple-500/30' : 'text-slate-500 border-slate-700'}`}>
                                {recipeDelivered ? 'RÉCIPE ENTREGADO' : recommendations.length > 0 ? 'ORDEN CENTRAL' : 'NINGUNA'}
                            </span>
                        </div>
                    </div>
                 </div>

                 {recommendations.length > 0 && !recipeDelivered && (
                    <div className="bg-emerald-900/30 border border-emerald-500/30 p-5 rounded-2xl animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Entrega Generada</span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-500/60 font-bold uppercase">ORD-{stop.visitCode || 'VIS'}-094</span>
                        </div>
                        <p className="text-xs text-white leading-relaxed">Se ha registrado una **Orden de Retiro** correlativa. El productor recibirá el código vía WhatsApp para facturación inmediata en almacén.</p>
                    </div>
                 )}

                 <button className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.2em] gap-3 text-slate-400 hover:text-white transition-colors">
                    <Download className="h-4 w-4" /> GENERAR PDF DEL RÉCIPE
                 </button>
             </div> 
         )}
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <button 
            onClick={() => { if (step === 'specific') setStep('diagnosis'); else if (step === 'diagnosis') setStep('recipe'); else if (step === 'recipe') setStep('summary'); else handleFinish(); }} 
            className="w-full bg-emerald-600 p-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center transition-all active:scale-95"
          >
            {step === 'summary' ? (<><Save className="h-5 w-5 mr-3" /> FINALIZAR Y NOTIFICAR</>) : (<>CONTINUAR PASO <ArrowRight className="h-5 w-5 ml-3" /></>)}
          </button>
      </div>
    </div>
  );
};

export default MobileVisitWizard;
