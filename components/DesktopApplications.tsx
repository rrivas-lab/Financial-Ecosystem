
import React, { useState, useEffect } from 'react';
import { NavigationProps, CreditApplicationStatus, CreditApplication, Producer, Visit, VisitType, VisitStatus, CommitteeDossier, Credit, ProducerDocument } from '../types';
import { useApplications } from '../context/ApplicationContext';
import { useProducers } from '../context/ProducerContext';
import { usePatterns } from '../context/PatternContext';
import { useMasterData } from '../context/MasterDataContext';
import { useVisits } from '../context/VisitContext';
import { useCredits } from '../context/CreditContext';
import { 
  Plus, FileText, ChevronRight, CheckCircle, 
  Play, AlertCircle, CheckCheck, Clock, X, ArrowRight, FileCheck, Info,
  ThumbsUp, ThumbsDown, Gavel, Sprout, AlertTriangle, Link as LinkIcon, Eye,
  Building, Briefcase, DollarSign, Tractor, Smartphone, MessageSquare, Download,
  UserPlus, Hash, Layers, Scale, ShieldCheck, Ban, Landmark, Award, RotateCcw,
  ClipboardCheck, PenTool, Landmark as BankIcon, RefreshCw, Truck, Package
} from 'lucide-react';

const DesktopApplications: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const { applications, updateApplication } = useApplications();
  const { producers, sendMessageToProducer, syncRequiredDocuments } = useProducers();
  const { patterns } = usePatterns();
  const { documents: masterDocs, technicians } = useMasterData();
  const { addVisit, visits } = useVisits();
  const { addCredit, credits } = useCredits();

  const [selectedApp, setSelectedApp] = useState<CreditApplication | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'dossier'>('info');
  const [legalValidation, setLegalValidation] = useState(false);

  useEffect(() => {
    if (params?.applicationId) {
        const app = applications.find(a => a.id === params.applicationId);
        if (app) {
            setSelectedApp(app);
            setViewMode('detail');
            if (app.assignedTechnicianId) setSelectedTechnicianId(app.assignedTechnicianId);
            if (app.status === 'Comite' && app.dossier?.status === 'Aprobado') setLegalValidation(true);
        }
    }
  }, [params, applications]);

  const processVisitToCommittee = (app: CreditApplication, linkedVisit: Visit) => {
    const updates: Partial<CreditApplication> = { 
      status: 'Comite',
      dossier: {
        generatedDate: new Date().toLocaleDateString(),
        producerBio: "Productor con historial verificado en Aproscello.",
        financialSummary: `Solicitud por $${app.amount.toLocaleString()}. Análisis preliminar de capacidad de pago positivo.`,
        technicalOpinion: `Visita ${linkedVisit.code} finalizada. La unidad de producción cuenta con las condiciones técnicas para el rubro ${app.type}.`,
        status: 'Pendiente'
      }
    };
    updateApplication(app.id, updates);
    
    if (selectedApp?.id === app.id) {
      setSelectedApp(prev => prev ? { ...prev, ...updates } : null);
    }

    const producer = producers.find(p => p.name === app.producerName);
    if (producer) {
        sendMessageToProducer(producer.id, `📋 *SOLICITUD EN COMITÉ*\n\nSu inspección técnica ha sido validada. El expediente ahora está en manos del Comité de Crédito.`);
    }
  };

  useEffect(() => {
    applications.forEach(app => {
      if (app.status === 'Visita_Evaluacion' && (app.visitId || app.visitCode)) {
        const linkedVisit = visits.find(v => v.id === app.visitId || v.code === app.visitCode);
        if (linkedVisit && linkedVisit.status === VisitStatus.CERRADA) {
          processVisitToCommittee(app, linkedVisit);
        }
      }
    });
  }, [visits, applications]);

  const timelineSteps: { id: CreditApplicationStatus; label: string }[] = [
      { id: 'Solicitud', label: 'Solicitud' },
      { id: 'Pre-Aprobada', label: 'Pre-Aprobada' },
      { id: 'Documentacion', label: 'Documentación' },
      { id: 'Visita_Evaluacion', label: 'Evaluación Finca' },
      { id: 'Comite', label: 'Comité Crédito' },
      { id: 'Inspeccion_Conasem', label: 'Validación Rubro' },
      { id: 'Contrato', label: 'Contrato' },
      { id: 'Activa', label: 'Ejecución' }
  ];
  
  const getStepStatus = (current: string, stepId: string) => {
      if (current === 'Rechazada') return 'pending';
      const idxCurrent = timelineSteps.findIndex(s => s.id === current);
      const idxStep = timelineSteps.findIndex(s => s.id === stepId);
      if (idxStep < idxCurrent && idxStep !== -1) return 'completed';
      if (idxStep === idxCurrent) return 'current';
      return 'pending';
  };

  const createCreditFromApp = (app: CreditApplication) => {
    const creditCode = `CR-2025-${Math.floor(Math.random() * 800 + 100)}`;
    const producer = producers.find(p => p.name === app.producerName);
    
    addCredit({
        id: creditCode, 
        producerName: app.producerName, 
        farmName: app.farmName, 
        projectType: app.type as any, 
        amountApproved: app.amount, 
        amountConsumed: 0, 
        amountAvailable: app.amount, 
        status: 'Firma Pendiente', 
        cycle: 'Invierno 2025', 
        totalDisbursed: 0, 
        totalDelivered: 0,
        supportType: app.patternName
    });

    if (producer) {
        const msg = `📑 *EXPEDIENTE DE APOYO CREADO* 📑\n\nEstimado ${app.producerName}, su solicitud ha sido formalizada exitosamente.\n\n🆔 *Correlativo Apoyo:* **${creditCode}**\n🌾 *Rubro:* ${app.type}\n💰 *Monto Aprobado:* $${app.amount.toLocaleString()}\n\n📍 *SIGUIENTE PASO:* Acuda a Aproscello para la **Firma del Contrato de Apoyo a la Producción** y la suscripción del **Giro** de garantía.`;
        sendMessageToProducer(producer.id, msg);
    }
    return creditCode;
  };

  const handleLegalCheck = () => {
    if (!selectedApp) return;
    setLegalValidation(true);
    const producer = producers.find(p => p.name === selectedApp.producerName);
    if (producer) {
        sendMessageToProducer(producer.id, `⚖️ *VALIDACIÓN LEGAL EXITOSA*\n\nSu expediente ha sido validada jurídicamente y pasa a decisión del Comité.`);
    }
  };

  const handleCommitteeAction = (decision: 'Aprobado' | 'Rechazado' | 'Espera') => {
    if (!selectedApp) return;
    const producer = producers.find(p => p.name === selectedApp.producerName);
    if (!producer) return;

    if (decision === 'Aprobado') {
        if (selectedApp.type === 'Semilla') {
            const tech = technicians.find(t => t.id === selectedApp.assignedTechnicianId) || technicians[0];
            const visitCode = `CONASEM-2025-${Math.floor(Math.random() * 900 + 100)}`;
            const conasemVisit: Visit = {
                id: `v-conasem-${Date.now()}`,
                code: visitCode,
                producerId: producer.id,
                producerName: producer.name,
                farmName: selectedApp.farmName,
                date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                type: VisitType.CONASEM,
                status: VisitStatus.PLANIFICADA,
                technician: tech.name,
                relatedCode: selectedApp.code,
                relatedType: 'Solicitud'
            };
            addVisit(conasemVisit);
            const updates = { status: 'Inspeccion_Conasem' as CreditApplicationStatus, visitCode: visitCode, visitId: conasemVisit.id };
            updateApplication(selectedApp.id, updates);
            setSelectedApp({ ...selectedApp, ...updates });
        } else {
            const creditId = createCreditFromApp(selectedApp);
            const updates = { status: 'Contrato' as CreditApplicationStatus, visitId: creditId };
            updateApplication(selectedApp.id, updates);
            setSelectedApp({ ...selectedApp, ...updates });
        }
    } 
    else if (decision === 'Rechazado') {
        updateApplication(selectedApp.id, { status: 'Rechazada' });
        setSelectedApp({ ...selectedApp, status: 'Rechazada' });
    } 
    else if (decision === 'Espera') {
        updateApplication(selectedApp.id, { status: 'Documentacion' });
        setSelectedApp({ ...selectedApp, status: 'Documentacion' });
        setLegalValidation(false);
    }
  };

  const handleAdvanceStep = () => {
      if (!selectedApp) return;
      const producer = producers.find(p => p.name === selectedApp.producerName);
      if (!producer) return;

      let updates: Partial<CreditApplication> = {};
      
      if (selectedApp.status === 'Solicitud') {
          updates = { status: 'Pre-Aprobada' };
      } 
      else if (selectedApp.status === 'Pre-Aprobada') {
          updates = { status: 'Documentacion' };
          const pattern = patterns.find(p => p.id === selectedApp.patternId);
          if (pattern) {
              // Sincronizar documentos requeridos según patrón
              syncRequiredDocuments(producer.id, pattern.requiredDocumentIds, masterDocs);
              
              // Notificar proactivamente al productor sobre la etapa de Documentación
              const docNames = pattern.requiredDocumentIds.map(id => masterDocs.find(m => m.id === id)?.name).filter(Boolean).join('\n- ');
              const notifyMsg = `📂 *ETAPA DE DOCUMENTACIÓN* 📂\n\nEstimado ${producer.name}, su solicitud ha sido pre-aprobada.\n\nPara avanzar con su financiamiento, por favor envíe fotos legibles de los siguientes recaudos a través de este chat:\n\n- ${docNames}\n\nNuestro equipo revisará las imágenes para validar su expediente digital.`;
              sendMessageToProducer(producer.id, notifyMsg);
          }
      } 
      else if (selectedApp.status === 'Documentacion') {
          if (!selectedTechnicianId) { alert("⚠️ DEBE ASIGNAR UN TÉCNICO."); return; }
          const tech = technicians.find(t => t.id === selectedTechnicianId);
          const visitCode = `VIS-2025-${Math.floor(Math.random() * 900 + 100)}`;
          const newVisit: Visit = {
              id: `v-${Date.now()}`, code: visitCode, producerId: producer.id, producerName: producer.name, farmName: selectedApp.farmName, date: new Date().toISOString().split('T')[0], type: VisitType.EVALUACION_INICIAL, status: VisitStatus.PLANIFICADA, technician: tech?.name || 'Asignado', relatedCode: selectedApp.code, relatedType: 'Solicitud'
          };
          addVisit(newVisit);
          updates = { status: 'Visita_Evaluacion', assignedTechnicianId: selectedTechnicianId, assignedTechnician: tech?.name, visitCode: visitCode, visitId: newVisit.id };
      } 
      else if (selectedApp.status === 'Visita_Evaluacion') {
          const linkedVisit = visits.find(v => v.id === selectedApp.visitId || v.code === selectedApp.visitCode);
          if (linkedVisit && linkedVisit.status === VisitStatus.CERRADA) {
              processVisitToCommittee(selectedApp, linkedVisit);
              return;
          } else {
              alert("⚠️ La visita técnica aún no ha sido reportada como CERRADA por el técnico.");
              return;
          }
      }
      else if (selectedApp.status === 'Inspeccion_Conasem') {
          const linkedVisit = visits.find(v => v.id === selectedApp.visitId || v.code === selectedApp.visitCode);
          if (linkedVisit && linkedVisit.status === VisitStatus.CERRADA) {
              const creditId = createCreditFromApp(selectedApp);
              updates = { status: 'Contrato', visitId: creditId };
          } else {
              alert("⚠️ La validación de rubro (CONASEM) debe estar cerrada para proceder al contrato.");
              return;
          }
      }
      else if (selectedApp.status === 'Contrato') {
          updates = { status: 'Activa' };
      }

      updateApplication(selectedApp.id, updates);
      setSelectedApp({ ...selectedApp, ...updates });
  };

  const renderDetail = () => {
      if(!selectedApp) return null;
      const producer = producers.find(p => p.name === selectedApp.producerName);
      const pattern = patterns.find(p => p.id === selectedApp.patternId);
      const currentVisit = visits.find(v => (v.id === selectedApp.visitId || v.code === selectedApp.visitCode || v.relatedCode === selectedApp.code));
      const linkedVisitClosed = currentVisit?.status === VisitStatus.CERRADA;
      
      const linkedCredit = credits.find(c => 
        (c.id === selectedApp.visitId) || 
        (c.producerName === selectedApp.producerName && (selectedApp.status === 'Activa' || selectedApp.status === 'Contrato'))
      );

      const requiredDocs = pattern?.requiredDocumentIds.map(docId => {
          const master = masterDocs.find(m => m.id === docId);
          const producerDoc = producer?.documents?.find(pd => pd.id === docId);
          return { id: docId, name: master?.name || 'Documento', status: producerDoc?.status || 'Pendiente' };
      }) || [];

      return (
          <div className="animate-in fade-in duration-300 pb-20">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <span className="cursor-pointer hover:text-emerald-700" onClick={() => setViewMode('list')}>Solicitudes</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-slate-800 font-bold">{selectedApp.code}</span>
                </div>
                <button onClick={() => setViewMode('list')} className="px-3 py-1.5 border bg-white rounded text-sm font-medium hover:bg-slate-50">Volver</button>
              </div>

              {/* TIMELINE */}
              <div className="bg-white p-6 rounded-xl border shadow-sm overflow-x-auto mb-6">
                <div className="flex items-center justify-between min-w-[950px] px-4">
                  {timelineSteps.map((step, idx) => {
                    const status = getStepStatus(selectedApp.status, step.id);
                    if (step.id === 'Inspeccion_Conasem' && selectedApp.type !== 'Semilla' && selectedApp.status !== 'Inspeccion_Conasem') return null;
                    return (
                      <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${status === 'completed' ? 'bg-emerald-50 border-emerald-50 text-white' : status === 'current' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}>
                            {status === 'completed' ? <CheckCheck className="h-6 w-6" /> : <span className="font-bold">{idx + 1}</span>}
                          </div>
                          <span className={`text-[10px] font-bold uppercase mt-2 whitespace-nowrap ${status === 'current' ? 'text-blue-700' : 'text-slate-500'}`}>{step.label}</span>
                        </div>
                        {idx < timelineSteps.length - 1 && (<div className={`flex-1 h-1 mx-2 rounded ${status === 'completed' ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>)}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ACTION BANNER */}
              <div className={`border rounded-xl p-5 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 transition-all ${selectedApp.status === 'Rechazada' ? 'bg-red-50 border-red-200' : (linkedVisitClosed || (legalValidation && selectedApp.status === 'Comite')) ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${selectedApp.status === 'Rechazada' ? 'bg-red-100 text-red-600' : (linkedVisitClosed || (legalValidation && selectedApp.status === 'Comite') || selectedApp.status === 'Contrato') ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          {selectedApp.status === 'Contrato' ? <FileCheck className="h-6 w-6" /> : <Info className="h-6 w-6" />}
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-900">Estatus: {selectedApp.status.replace('_', ' ')}</h4>
                          <p className="text-sm text-slate-600">
                              {selectedApp.status === 'Documentacion' && 'Se ha notificado al productor para que consigne los recaudos vía WhatsApp.'}
                              {selectedApp.status === 'Visita_Evaluacion' && (linkedVisitClosed ? 'Visita completada por técnico. Puede avanzar al Comité.' : `Visita asignada a: ${currentVisit?.technician || 'Pendiente'}.`)}
                              {selectedApp.status === 'Comite' && (legalValidation ? 'Expediente listo para votación.' : 'Esperando validación jurídica.')}
                              {selectedApp.status === 'Inspeccion_Conasem' && (linkedVisitClosed ? 'Validación rubro cerrada. Proceder a firma de contrato.' : 'Pendiente inspección técnica de rubro semilla.')}
                              {selectedApp.status === 'Contrato' && 'Apoyo creado. Por favor proceda con la firma de Contrato y Giros.'}
                              {selectedApp.status === 'Activa' && 'Financiamiento en ejecución. El técnico ya puede emitir órdenes de insumos.'}
                          </p>
                      </div>
                  </div>

                  <div className="flex items-center gap-3">
                      {selectedApp.status === 'Documentacion' && (
                          <div className="flex items-center bg-white border rounded-lg p-1 shadow-sm">
                              <UserPlus className="h-4 w-4 ml-2 text-slate-400" />
                              <select className="bg-transparent text-sm font-bold p-2 outline-none" value={selectedTechnicianId} onChange={(e) => setSelectedTechnicianId(e.target.value)}>
                                  <option value="">Asignar Técnico...</option>
                                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                              </select>
                          </div>
                      )}
                      
                      {selectedApp.status === 'Visita_Evaluacion' && linkedVisitClosed && (
                          <button onClick={handleAdvanceStep} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-lg animate-in zoom-in">
                              <RefreshCw className="mr-2 h-4 w-4" /> Validar y Avanzar a Comité
                          </button>
                      )}

                      {selectedApp.status === 'Inspeccion_Conasem' && linkedVisitClosed && (
                          <button onClick={handleAdvanceStep} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-lg animate-in zoom-in">
                              <PenTool className="mr-2 h-4 w-4" /> Generar Contrato y Giros
                          </button>
                      )}

                      {selectedApp.status === 'Comite' && !legalValidation && (
                          <button onClick={handleLegalCheck} className="bg-amber-600 text-white px-6 py-2 rounded-lg font-bold shadow flex items-center"><Scale className="mr-2 h-4 w-4" /> Validar Jurídicamente</button>
                      )}
                      {selectedApp.status === 'Comite' && legalValidation && (
                          <div className="flex gap-2">
                              <button onClick={() => handleCommitteeAction('Aprobado')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center"><ThumbsUp className="mr-2 h-4 w-4" /> Aprobar</button>
                              <button onClick={() => handleCommitteeAction('Rechazado')} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center"><ThumbsDown className="mr-2 h-4 w-4" /> Rechazar</button>
                          </div>
                      )}
                      {selectedApp.status === 'Contrato' && (
                          <button onClick={() => onNavigate('financing', { creditId: selectedApp.visitId || linkedCredit?.id })} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-lg animate-pulse"><PenTool className="mr-2 h-4 w-4" /> Gestionar Firma de Documentos</button>
                      )}

                      {selectedApp.status === 'Activa' && (
                          <button onClick={() => onNavigate('ops-deliveries', { producerId: producer?.id })} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-lg"><Truck className="mr-2 h-4 w-4" /> Emitir Orden de Insumos</button>
                      )}
                      
                      {selectedApp.status !== 'Comite' && selectedApp.status !== 'Contrato' && selectedApp.status !== 'Inspeccion_Conasem' && selectedApp.status !== 'Activa' && selectedApp.status !== 'Rechazada' && !linkedVisitClosed && (
                          <button onClick={handleAdvanceStep} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-md">Continuar Paso <ArrowRight className="ml-2 h-4 w-4" /></button>
                      )}
                  </div>
              </div>

              {/* MAIN CONTENT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white p-6 rounded-xl border shadow-sm">
                          <div className="flex border-b mb-6">
                              <button onClick={() => setActiveDetailTab('info')} className={`px-4 py-2 font-bold text-xs uppercase border-b-2 transition-all ${activeDetailTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>Info. Proyecto</button>
                              <button onClick={() => setActiveDetailTab('dossier')} className={`px-4 py-2 font-bold text-xs uppercase border-b-2 transition-all ${activeDetailTab === 'dossier' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>Dossier Comité</button>
                          </div>

                          {activeDetailTab === 'info' ? (
                              <div className="space-y-6">
                                <div className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${selectedApp.type === 'Semilla' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {selectedApp.type === 'Semilla' ? <Sprout className="h-5 w-5" /> : <Tractor className="h-5 w-5" />}
                                        </div>
                                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rubro Solicitado</p><h4 className="text-base font-bold text-slate-800">{selectedApp.type === 'Semilla' ? 'Semilla Certificada' : 'Consumo / Grano'}</h4></div>
                                    </div>
                                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold uppercase">{selectedApp.patternName}</span>
                                </div>
                                
                                {linkedCredit && (
                                    <div className="p-4 bg-emerald-900 text-white rounded-xl flex items-center justify-between border-b-4 border-emerald-700 animate-in zoom-in-95">
                                        <div className="flex items-center gap-3">
                                            <BankIcon className="h-6 w-6 text-emerald-400" />
                                            <div><p className="text-[10px] font-bold text-emerald-200 uppercase">Expediente de Apoyo Generado</p><p className="text-lg font-black">{linkedCredit.id}</p></div>
                                        </div>
                                        <button onClick={() => onNavigate('financing', { creditId: linkedCredit.id })} className="bg-white text-emerald-900 px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-emerald-50">Formalizar Contrato</button>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-8 text-sm">
                                    <div><label className="text-slate-400 font-bold uppercase text-[10px]">Productor</label><p className="font-bold text-slate-800 text-lg">{selectedApp.producerName}</p></div>
                                    <div><label className="text-slate-400 font-bold uppercase text-[10px]">Monto Proyectado</label><p className="font-bold text-emerald-600 text-lg">${selectedApp.amount.toLocaleString()}</p></div>
                                    <div><label className="text-slate-400 font-bold uppercase text-[10px]">Finca</label><p className="font-medium text-slate-700">{selectedApp.farmName}</p></div>
                                    <div><label className="text-slate-400 font-bold uppercase text-[10px]">Superficie</label><p className="font-medium text-slate-700">{selectedApp.hectares} ha</p></div>
                                </div>
                                
                                {/* RECURSOS ASIGNADOS SEGUN PATRON */}
                                {pattern && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center"><Package className="h-4 w-4 mr-2 text-slate-400" /> Recursos según Patrón Tecnológico</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {pattern.lines.map(line => (
                                                <div key={line.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 text-xs">
                                                    <span className="font-medium text-slate-600">{line.product}</span>
                                                    <span className="font-bold text-slate-800">{(line.standardQty * selectedApp.hectares).toLocaleString()} {line.unit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                              </div>
                          ) : (
                              <div className="space-y-4 animate-in fade-in">
                                  {selectedApp.dossier ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="p-4 bg-slate-50 rounded-lg border">
                                              <h5 className="font-bold text-slate-700 text-xs uppercase mb-1">Dictamen Técnico</h5>
                                              <p className="text-sm italic">"{selectedApp.dossier.technicalOpinion}"</p>
                                          </div>
                                          <div className="p-4 bg-blue-50 rounded-lg border">
                                              <h5 className="font-bold text-blue-700 text-xs uppercase mb-1">Perfil Financiero</h5>
                                              <p className="text-sm">{selectedApp.dossier.financialSummary}</p>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="text-center py-10 text-slate-400 flex flex-col items-center"><FileCheck className="h-12 w-12 mb-2 opacity-20" /><p>Dossier no consolidado aún.</p></div>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white p-5 rounded-xl border shadow-sm">
                          <h3 className="font-bold text-slate-700 mb-4 flex items-center justify-between">Recaudos Requeridos</h3>
                          <div className="space-y-3">
                              {requiredDocs.map(doc => (
                                  <div key={doc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                                      <span className="font-medium text-slate-700 truncate mr-2">{doc.name}</span>
                                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${doc.status.includes('Validado') ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500'}`}>
                                          {doc.status.split('_')[0]}
                                      </span>
                                  </div>
                              ))}
                              <div className="mt-4 pt-4 border-t"><button onClick={() => onNavigate('ops-producers', { producerId: producer?.id, tab: 'docs' })} className="w-full text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest text-center">Ver Expediente Digital Completo</button></div>
                          </div>
                      </div>

                      {currentVisit && (
                          <div className="bg-white p-5 rounded-xl border shadow-sm border-blue-100">
                              <h3 className="font-bold text-slate-700 mb-4 flex items-center tracking-tight uppercase text-xs"><ClipboardCheck className="h-4 w-4 mr-2 text-blue-600" /> Detalle de Visita Vinculada</h3>
                              <div className="space-y-3">
                                  <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Correlativo</span><span className="font-bold font-mono text-emerald-600">{currentVisit.code}</span></div>
                                  <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Técnico</span><span className="font-bold text-slate-800">{currentVisit.technician}</span></div>
                                  <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Estatus Visita</span><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${linkedVisitClosed ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{currentVisit.status}</span></div>
                              </div>
                              {linkedVisitClosed && (selectedApp.status === 'Visita_Evaluacion' || selectedApp.status === 'Inspeccion_Conasem') && (
                                  <div className="mt-3 p-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold text-center rounded border border-emerald-100">
                                      VISITA FINALIZADA POR TÉCNICO
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  return (
      <div className="space-y-6">
          {viewMode === 'list' ? (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-slate-800">Control de Solicitudes</h1></div>
                <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b font-bold text-slate-600 text-xs uppercase">
                            <tr><th className="p-4">Código</th><th className="p-4">Productor</th><th className="p-4">Tipo</th><th className="p-4 text-right">Monto</th><th className="p-4 text-center">Estado</th><th className="p-4 text-center">Acción</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applications.map(app => (
                                <tr key={app.id} onClick={() => { setSelectedApp(app); setViewMode('detail'); }} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                    <td className="p-4 font-bold text-slate-700">{app.code}</td>
                                    <td className="p-4 font-medium text-slate-800">{app.producerName}</td>
                                    <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${app.type === 'Semilla' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{app.type}</span></td>
                                    <td className="p-4 text-right font-bold text-slate-700">${app.amount.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${app.status === 'Activa' ? 'bg-emerald-100 text-emerald-700' : app.status === 'Rechazada' ? 'bg-red-100 text-red-700' : app.status === 'Pre-Aprobada' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{app.status.replace('_', ' ')}</span>
                                    </td>
                                    <td className="p-4 text-center"><button className="text-slate-400 group-hover:text-emerald-600"><ChevronRight className="h-5 w-5"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
          ) : renderDetail()}
      </div>
  );
};

export default DesktopApplications;
