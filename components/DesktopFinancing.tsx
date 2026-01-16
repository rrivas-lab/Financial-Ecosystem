
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Credit, NavigationProps, Producer, SupportPattern, SupportPatternStage, Visit, VisitStatus, VisitType, DeliveryStatus } from '../types';
import { useCredits } from '../context/CreditContext';
import { useProducers } from '../context/ProducerContext';
import { usePatterns } from '../context/PatternContext';
import { useVisits } from '../context/VisitContext';
import { 
    ChevronLeft, ChevronRight, Truck, DollarSign, Scale, Banknote, History, Sprout, FileText, 
    LayoutDashboard, Search, Filter, X, ArrowRight, PenTool, CheckCircle, ShieldCheck, 
    FileCheck, Landmark, Receipt, ScrollText, Clock, Building2, Calculator, Info,
    RefreshCw, Calendar, List, ClipboardCheck, Brain, Eye, MapPin, Package, ListTodo,
    ArrowUpRight, FileSearch, Gavel, Plus, MoreVertical, Hash, User, Smartphone, Tractor, Download,
    FileUp, CheckCheck, AlertCircle, Loader2
} from 'lucide-react';

type CreditDetailTab = 'general' | 'tasks' | 'formalization' | 'disbursements' | 'deliveries' | 'visits' | 'settlement' | 'history';

const DesktopFinancing: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const { credits, updateCredit } = useCredits();
  const { producers, sendMessageToProducer } = useProducers();
  const { patterns } = usePatterns();
  const { visits, addVisit } = useVisits();
  
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [creditDetailTab, setCreditDetailTab] = useState<CreditDetailTab>('formalization');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingVisit, setViewingVisit] = useState<Visit | null>(null);
  
  const contractFileInputRef = useRef<HTMLInputElement>(null);
  const [contractFile, setContractFile] = useState<string | null>(null);
  const [isContractValidated, setIsContractValidated] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  useEffect(() => {
      if (params?.creditId) {
          const credit = credits.find(c => c.id === params.creditId);
          if (credit) setSelectedCredit(credit);
          if (params.tab) setCreditDetailTab(params.tab as CreditDetailTab);
      }
  }, [params, credits]);

  const associatedPattern = useMemo(() => {
    if (!selectedCredit) return null;
    return patterns.find(p => p.name === selectedCredit.supportType) || patterns[0];
  }, [selectedCredit, patterns]);

  const creditVisits = useMemo(() => {
    if (!selectedCredit) return [];
    return visits.filter(v => 
        v.creditId === selectedCredit.id || 
        (v.producerName === selectedCredit.producerName && v.farmName === selectedCredit.farmName)
    );
  }, [selectedCredit, visits]);

  const handleContractUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setContractFile(reader.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleValidateContract = () => {
    if (!selectedCredit) return;
    
    setIsProvisioning(true);
    
    // Simular creación de Plan Analítico y Centro de Costos en Odoo
    setTimeout(() => {
        setIsContractValidated(true);
        setIsProvisioning(false);
        updateCredit(selectedCredit.id, { status: 'Activo' });
        
        const producer = producers.find(p => p.name === selectedCredit.producerName);
        if (producer) {
            sendMessageToProducer(producer.id, `✍️ *CONTRATO FORMALIZADO* ✍️\n\nEstimado ${selectedCredit.producerName}, el contrato para el apoyo **${selectedCredit.id}** ha sido validado físicamente en nuestras oficinas.\n\n✅ Su financiamiento está ahora **ACTIVO**. Ya puede coordinar con su técnico los despachos de insumos según su plan de siembra.`);
        }
    }, 2500);
  };

  const handleGenerateFollowUpVisit = () => {
    if (!selectedCredit) return;
    const producer = producers.find(p => p.name === selectedCredit.producerName);
    const visitCode = `VIS-SEG-${Math.floor(Math.random() * 900 + 100)}`;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 7);
    const newVisit: Visit = {
      id: `v-seg-${Date.now()}`,
      code: visitCode,
      producerId: producer?.id || 'manual',
      producerName: selectedCredit.producerName,
      farmName: selectedCredit.farmName,
      date: estDate.toISOString().split('T')[0],
      type: VisitType.SEGUIMIENTO,
      status: VisitStatus.PENDIENTE_GESTION,
      technician: producer?.mainTechnician || "Ing. Carlos Mendez",
      creditId: selectedCredit.id,
      visitSource: 'Manual (Finanzas)'
    };
    addVisit(newVisit);
    if (producer) {
      sendMessageToProducer(producer.id, `📅 *NUEVA VISITA DE SEGUIMIENTO*\n\nSe ha programado una visita de control para el apoyo **${selectedCredit.id}**.\n\n🗓️ Fecha: ${estDate.toLocaleDateString()}\n📍 Finca: ${selectedCredit.farmName}\n\nNuestro equipo técnico pasará a evaluar el avance del cultivo.`);
    }
    alert(`Visita de seguimiento ${visitCode} generada.`);
  };

  const renderFormalizationTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Expediente Digital</h3>
                <p className="text-sm text-slate-500 font-medium">Gestión de recaudos y validación de contrato firmado</p>
            </div>
            <button className="flex items-center text-xs bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-100 font-black tracking-widest border border-emerald-200">
                <MessageSquareIcon className="h-4 w-4 mr-2" /> SOLICITAR DIGITAL (WHATSAPP)
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cédula/RIF Card - Indicar Cargado */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Cédula de Identidad / RIF</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-black uppercase border border-emerald-200">Cargado</span>
                </div>
                <div className="aspect-[16/9] bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
                    <img src="https://images.unsplash.com/photo-1633113214141-33100061e897?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Mock Doc" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white rounded-full text-slate-800"><Eye className="h-4 w-4"/></button>
                    </div>
                </div>
            </div>

            {/* Registro de Tierras Card - Indicar Cargado */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Registro de Tierras (INTI)</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-black uppercase border border-emerald-200">Cargado</span>
                </div>
                <div className="aspect-[16/9] bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
                    <img src="https://images.unsplash.com/photo-1568430462989-44163eb1752f?q=80&w=2670&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Mock Doc" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white rounded-full text-slate-800"><Eye className="h-4 w-4"/></button>
                    </div>
                </div>
            </div>

            {/* Contrato de Apoyo Card - Active Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Contrato de Apoyo a la Producción</h4>
                    <span className={`text-[10px] px-3 py-1 rounded font-black uppercase tracking-widest border transition-all ${
                        isContractValidated ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                        {isContractValidated ? 'Validado Físico' : 'Pendiente Firma'}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/2 aspect-video bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative flex items-center justify-center group/contract">
                        {contractFile ? (
                            <img src={contractFile} className="w-full h-full object-cover" alt="Contrato Escaneado" />
                        ) : (
                            <div className="text-center px-6">
                                <FileUp className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Haga clic para cargar el contrato firmado por el productor</p>
                            </div>
                        )}
                        <input type="file" ref={contractFileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleContractUpload} />
                        {!isContractValidated && !isProvisioning && (
                            <button 
                                onClick={() => contractFileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors"
                            />
                        )}
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center space-y-4">
                        {isProvisioning ? (
                            <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
                                <h5 className="font-black text-slate-800 text-sm uppercase">Procesando en ERP Odoo...</h5>
                                <div className="mt-4 space-y-2 w-full max-w-xs">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">Creando Plan Analítico <span className="text-emerald-600">80%</span></p>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[80%] animate-pulse"></div></div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">Vinculando Centro de Costo <span className="text-blue-600">SINC</span></p>
                                </div>
                            </div>
                        ) : isContractValidated ? (
                            <div className="animate-in zoom-in duration-500 flex flex-col items-center">
                                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                    <CheckCheck className="h-8 w-8" />
                                </div>
                                <h5 className="font-black text-emerald-700 text-lg uppercase tracking-tight">Expediente Completo</h5>
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-slate-500 font-medium">Plan Analítico: <span className="font-mono font-bold text-slate-800">PA-2025-094</span></p>
                                    <p className="text-xs text-slate-500 font-medium">Centro Costo: <span className="font-mono font-bold text-slate-800">CC-{selectedCredit?.id}</span></p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-left">
                                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                        Requiere la validación física de los originales en la oficina central. Al validar se creará automáticamente el <strong>Plan Analítico</strong> y el <strong>Centro de Costo</strong> en Odoo.
                                    </p>
                                </div>
                                <button 
                                    disabled={!contractFile}
                                    onClick={handleValidateContract}
                                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 ${
                                        contractFile ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    <CheckCircle className="h-5 w-5" /> Validar y Formalizar
                                </button>
                                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                                    Imprimir Formatos para Firma
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  // --- REST OF COMPONENT ---
  const renderVisitDetail = (visit: Visit) => {
    const getStatusColor = (status: VisitStatus) => {
        switch (status) {
          case VisitStatus.PLANIFICADA: return 'bg-slate-100 text-slate-600';
          case VisitStatus.CONFIRMADA: return 'bg-blue-100 text-blue-700';
          case VisitStatus.EN_PROCESO: return 'bg-amber-100 text-amber-700';
          case VisitStatus.PENDIENTE_GESTION: return 'bg-purple-100 text-purple-700';
          case VisitStatus.CERRADA: return 'bg-emerald-100 text-emerald-700';
          default: return 'bg-slate-100';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setViewingVisit(null)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-bold transition-colors"><ChevronLeft className="h-5 w-5" /> Volver al listado</button>
                <button className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-900 flex items-center gap-2"><Download className="h-4 w-4" /> Exportar PDF</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-10">
                            <div><h2 className="text-3xl font-black text-slate-900 tracking-tight">{visit.producerName}</h2><p className="text-slate-400 font-bold flex items-center mt-2 text-base"><MapPin className="h-5 w-5 mr-1.5 text-slate-300" /> {visit.farmName}</p></div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(visit.status)}`}>{visit.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-8 border-t border-slate-100 pt-8">
                            <div className="space-y-1"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Tipo de Visita</label><p className="font-bold text-slate-700 text-base">{visit.type}</p></div>
                            <div className="space-y-1"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Fecha</label><p className="font-bold text-slate-700 text-base">{visit.date}</p></div>
                            <div className="space-y-1"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Técnico Asignado</label><p className="font-bold text-slate-700 text-base">{visit.technician}</p></div>
                            <div className="space-y-1"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Correlativo</label><p className="font-bold text-slate-700 text-base font-mono uppercase">{visit.code || visit.id}</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderVisitsTab = () => {
    if (viewingVisit) return renderVisitDetail(viewingVisit);
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-end mb-4"><button onClick={handleGenerateFollowUpVisit} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-lg hover:bg-emerald-700 transition-all active:scale-95"><Plus className="h-4 w-4 mr-2" /> Generar Visita de Seguimiento</button></div>
            <div className="grid grid-cols-1 gap-4">
                {creditVisits.map(visit => (
                    <div key={visit.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex items-stretch hover:border-emerald-300 transition-colors group">
                        <div className="w-40 bg-slate-50 p-6 flex flex-col items-center justify-center border-r border-slate-100 shrink-0 text-center">
                            <Calendar className="h-8 w-8 text-slate-300 mb-3" /><p className="text-sm font-black text-slate-800 leading-none">{visit.date}</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-tighter">{visit.code || visit.id}</p>
                            <span className={`mt-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${visit.status === VisitStatus.CERRADA ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>{visit.status}</span>
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-6"><div><h4 className="text-xl font-black text-slate-900 leading-none">{visit.type}</h4><p className="text-sm text-slate-400 flex items-center mt-2 font-bold uppercase tracking-tight"><MapPin className="h-3.5 w-3.5 mr-1 text-emerald-500" /> {visit.farmName} • {visit.technician}</p></div>
                                <button onClick={() => setViewingVisit(visit)} className="p-2.5 bg-slate-50 rounded-full text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Eye className="h-5 w-5" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  if (selectedCredit) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center text-sm mb-4">
                <div className="flex items-center space-x-2 text-slate-500">
                    <span className="hover:text-emerald-700 cursor-pointer">Finanzas</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="hover:text-emerald-700 cursor-pointer" onClick={() => { setSelectedCredit(null); setViewingVisit(null); }}>Cartera de Apoyos</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-800 font-bold">{selectedCredit.id}</span>
                </div>
                <button onClick={() => { setSelectedCredit(null); setViewingVisit(null); }} className="px-4 py-1.5 border border-slate-200 bg-white rounded-md text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">Volver</button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm min-h-[500px] flex flex-col overflow-hidden">
                <div className="border-b border-slate-200 overflow-x-auto bg-white">
                    <div className="flex">
                        {[
                            { id: 'general', label: 'Resumen Apoyo', icon: LayoutDashboard },
                            { id: 'tasks', label: 'Subtareas / Hitos', icon: ListTodo },
                            { id: 'formalization', label: 'Contrato & Entes', icon: FileCheck },
                            { id: 'disbursements', label: 'Giros (Caja)', icon: Banknote },
                            { id: 'deliveries', label: 'Insumos', icon: Truck },
                            { id: 'visits', label: 'Visitas', icon: ClipboardCheck },
                            { id: 'settlement', label: 'Cierre Cosecha', icon: Scale },
                            { id: 'history', label: 'Log', icon: History },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => { setCreditDetailTab(tab.id as any); setViewingVisit(null); }}
                                className={`flex items-center px-6 py-4 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all ${creditDetailTab === tab.id ? 'border-emerald-600 text-emerald-700 bg-emerald-50/20' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                <tab.icon className={`h-4 w-4 mr-2 ${creditDetailTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-8 bg-slate-50/50 flex-1 overflow-y-auto">
                    {creditDetailTab === 'visits' && renderVisitsTab()}
                    {creditDetailTab === 'formalization' && renderFormalizationTab()}
                    {creditDetailTab !== 'visits' && creditDetailTab !== 'formalization' && (
                        <div className="text-center py-20 text-slate-400 italic">Sección {creditDetailTab} en desarrollo.</div>
                    )}
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4"><h1 className="text-2xl font-bold text-slate-800 tracking-tight">Cartera de Créditos (Apoyos)</h1></div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 shadow-sm"><div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center shadow-inner"><Search className="h-4 w-4 text-slate-400 mr-2" /><input type="text" placeholder="Buscar por productor..." className="flex-1 bg-transparent outline-none text-sm font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-left">
            <thead className="bg-slate-50 border-b font-black text-slate-500 text-[10px] uppercase tracking-widest"><tr><th className="px-6 py-4">ID Apoyo</th><th className="px-6 py-4">Productor</th><th className="px-6 py-4 text-right">Límite</th><th className="px-6 py-4 text-right">Disponible</th><th className="px-6 py-4 text-center">Estatus</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {credits.filter(c => c.producerName.toLowerCase().includes(searchTerm.toLowerCase())).map((credit) => (
                <tr key={credit.id} onClick={() => setSelectedCredit(credit)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 font-black text-emerald-800">{credit.id}</td>
                    <td className="px-6 py-4"><div>{credit.producerName}</div><div className="text-[10px] text-slate-400 uppercase font-black">{credit.farmName}</div></td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">${credit.amountApproved.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">${credit.amountAvailable.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center"><span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${credit.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{credit.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

const MessageSquareIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);

export default DesktopFinancing;
