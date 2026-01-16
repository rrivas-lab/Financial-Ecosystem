
import React, { useState, useRef, useEffect } from 'react';
import { Producer, NavigationProps, DocStatus, ProducerDocument, CreditApplicationStatus, ChatMessage, CreditApplication, VisitType, VisitStatus, Visit } from '../types';
import { useProducers } from '../context/ProducerContext';
import { useMasterData } from '../context/MasterDataContext';
import { useApplications } from '../context/ApplicationContext';
import { usePatterns } from '../context/PatternContext';
import { useVisits } from '../context/VisitContext';
import { 
  Search, MapPin, FileText, Sprout, DollarSign, ClipboardCheck, Truck, 
  Activity, ChevronRight, LayoutDashboard, User, Grid, 
  ShieldCheck, Plus, MoreHorizontal, Filter, Layers, Save, X,
  CreditCard, CheckCircle, Upload, MessageCircle, Smartphone, Eye, Send, FileCheck, Ban, Camera, Download, AlertCircle, RotateCcw, ArrowRight, Package, CheckCheck,
  Briefcase, Award, Zap, FileUp
} from 'lucide-react';

type DetailTab = 'resumen' | 'generales' | 'fincas' | 'lotes' | 'docs' | 'visitas' | 'financiero' | 'expediente' | 'requests';

const DesktopProducers: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const { producers, addProducer, updateProducer, sendMessageToProducer, updateProducerDocument } = useProducers();
  const { documents: masterDocs, technicians } = useMasterData();
  const { applications, addApplication, updateApplication } = useApplications();
  const { patterns } = usePatterns(); 
  const { addVisit } = useVisits();
  
  const activePatterns = patterns.filter(p => p.status === 'Activo');

  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);
  
  const selectedProducer = selectedProducerId ? producers.find(p => p.id === selectedProducerId) || null : null;

  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [activeTab, setActiveTab] = useState<DetailTab>('resumen');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App Wizard State
  const [isAppWizardOpen, setIsAppWizardOpen] = useState(false);
  const [appForm, setAppForm] = useState({ patternId: '', subTypeId: '', hectares: '', farmId: '' });

  // Technician Edit State
  const [isEditingTech, setIsEditingTech] = useState(false);

  const initialFormState = { name: '', vat: '', type: 'Natural', email: '', phone: '', address: '', status: 'Activo' };
  const [formData, setFormData] = useState(initialFormState);

  // Handle Deep Linking from other modules
  useEffect(() => {
      if (params?.producerId) {
          setSelectedProducerId(params.producerId);
          setViewMode('detail');
          if (params.tab) {
              setActiveTab(params.tab as DetailTab);
          }
      }
  }, [params]);

  const handleSelectProducer = (p: Producer) => {
      setSelectedProducerId(p.id);
      setViewMode('detail');
      setActiveTab('resumen');
      setIsEditingTech(false);
  };

  const handleCreate = () => {
      if (!formData.name || !formData.vat) {
          alert("Por favor complete Nombre y Documento.");
          return;
      }

      let initialHistory: ChatMessage[] = [];

      if (formData.status === 'Activo') {
          const welcomeMsg = `🔔 *BIENVENIDO A APROSCELLO* 🔔\n\nEstimado ${formData.name}, su cuenta ha sido creada y **ACTIVADA**.\n\nPuede proceder a solicitar apoyo financiero.`;
          
          initialHistory.push({
              id: Date.now().toString(),
              text: welcomeMsg,
              sender: 'bot',
              timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          });
      }

      const newProducer: Producer & { source: 'Odoo' } = {
          id: Date.now().toString(),
          name: formData.name,
          vat: formData.vat,
          type: formData.type as any,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          status: formData.status as any,
          source: 'Odoo',
          creditActive: false,
          filesStatus: 'Incompleto',
          farms: [],
          activeCreditsCount: 0,
          documents: [], 
          chatHistory: initialHistory
      };
      
      addProducer(newProducer);
      
      alert(formData.status === 'Activo' 
        ? "Productor creado y ACTIVADO. Se envió mensaje de bienvenida." 
        : "Productor creado exitosamente.");
        
      setViewMode('list');
      setFormData(initialFormState);
  };

  const handleCancelCreate = () => {
      setViewMode('list');
      setFormData(initialFormState);
  };

  const handleBackToList = () => {
      setSelectedProducerId(null);
      setViewMode('list');
  };

  const handleToggleStatus = (newStatus: 'Activo' | 'Inactivo') => {
      if(!selectedProducer) return;
      updateProducer(selectedProducer.id, { status: newStatus });
      if (newStatus === 'Activo') {
          sendMessageToProducer(selectedProducer.id, `🔔 *NOTIFICACIÓN APROSCELLO* 🔔\n\nEstimado ${selectedProducer.name}, su cuenta ha sido **ACTIVADA**.\n\nYa puede registrar su Solicitud de Apoyo.`);
          alert(`¡PRODUCTOR ACTIVADO!`);
      }
  };

  const handleRequestDigital = () => {
      if (!selectedProducer) return;
      const missingDocs = (selectedProducer.documents || []).filter((d: ProducerDocument) => d.status !== 'Validado_Fisico' && d.status !== 'Validado_Digital');
      if (missingDocs.length === 0) { alert('No hay documentos configurados o pendientes.'); return; }
      const docList = missingDocs.map((d: any) => `- ${d.name}`).join('\n');
      sendMessageToProducer(selectedProducer.id, `📂 *RECORDATORIO DE DOCUMENTOS*\n\nEstimado productor, tiene documentos pendientes por consignar:\n\n${docList}\n\nPor favor envíe las fotos por este medio.`);
      missingDocs.forEach((d: any) => { if (d.status === 'Pendiente') updateProducerDocument(selectedProducer.id, d.id, 'Solicitado'); });
      alert('Solicitud enviada por WhatsApp.');
  };

  const handleDocAction = (doc: ProducerDocument, action: 'approve_digital' | 'reject' | 'confirm_physical' | 'return_revision' | 'upload_manual') => {
      if (!selectedProducer) return;

      if (action === 'approve_digital') {
          updateProducerDocument(selectedProducer.id, doc.id, 'Validado_Digital');
          
          const currentDocs = selectedProducer.documents || [];
          const validatedDigitalCount = currentDocs.filter(d => d.status === 'Validado_Digital' || d.status === 'Validado_Fisico').length;
          
          if (validatedDigitalCount === 0) {
              sendMessageToProducer(selectedProducer.id, `✅ *VALIDACIÓN DIGITAL EXITOSA*\n\nHemos verificado la foto de su documento "${doc.name}".\n\n🏛️ *REQUERIMIENTO:* Para finalizar el expediente, por favor acuda a nuestras oficinas con los **ORIGINALES** de sus recaudos para su validación física.`);
          } else {
              sendMessageToProducer(selectedProducer.id, `✅ *DOCUMENTO APROBADO*\n\nSu documento "${doc.name}" ha sido validado digitalmente.`);
          }
      }
      
      if (action === 'reject') setRejectingDocId(doc.id);
      if (action === 'return_revision') setRejectingDocId(doc.id);

      if (action === 'confirm_physical') {
          updateProducerDocument(selectedProducer.id, doc.id, 'Validado_Fisico');
          checkPhysicalExpediteCompletion(doc.name);
      }

      if (action === 'upload_manual') {
          setUploadingDocId(doc.id);
          setTimeout(() => fileInputRef.current?.click(), 100);
      }
  };

  const checkPhysicalExpediteCompletion = (lastDocName: string) => {
    if (!selectedProducer) return;
    
    const currentProducerUpdated = producers.find(p => p.id === selectedProducer.id);
    if (!currentProducerUpdated) return;

    const stillPending = (currentProducerUpdated.documents || []).filter(d => d.status !== 'Validado_Fisico').length;
    
    if (stillPending === 0) {
        const app = applications.find(a => a.producerName === selectedProducer.name && (a.status === 'Documentacion' || a.status === 'Pre-Aprobada'));
        
        if (app) {
            const visitCode = `VIS-2025-${Math.floor(Math.random() * 900 + 100)}`;
            const techName = selectedProducer.mainTechnician || "Ing. Carlos Mendez";
            const estDate = new Date();
            estDate.setDate(estDate.getDate() + 3);

            const newVisit: Visit = {
                id: `v-${Date.now()}`,
                code: visitCode,
                producerId: selectedProducer.id,
                producerName: selectedProducer.name,
                farmName: app.farmName,
                date: estDate.toISOString().split('T')[0],
                type: VisitType.EVALUACION_INICIAL,
                status: VisitStatus.PLANIFICADA,
                technician: techName,
                relatedCode: app.code,
                relatedType: 'Solicitud'
            };
            addVisit(newVisit);

            updateApplication(app.id, { status: 'Visita_Evaluacion', visitCode, visitId: newVisit.id });

            sendMessageToProducer(selectedProducer.id, `📁 *¡EXPEDIENTE FÍSICO COMPLETO!* 📁\n\nFelicidades, hemos completado la validación de todos sus recaudos.\n\n🚜 *SIGUIENTE ETAPA:* Su solicitud ha avanzado a **Visita de Inspección**.\n\n🆔 *Correlativo Visita:* ${visitCode}\n📅 *Fecha Estimada:* ${estDate.toLocaleDateString()}\n👤 *Técnico:* ${techName}`);
        } else {
            sendMessageToProducer(selectedProducer.id, `📁 *EXPEDIENTE FÍSICO COMPLETO*\n\nHemos validado todos sus documentos originales con éxito.`);
        }
    }
  };

  const handleManualFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0] || !selectedProducer || !uploadingDocId) return;
      const reader = new FileReader();
      reader.onloadend = () => {
          const doc = selectedProducer.documents?.find(d => d.id === uploadingDocId);
          // Al cargar desde oficina, el analista usualmente ya tiene el físico o una copia validada.
          // Lo marcamos como Validado Físico para agilizar el expediente.
          updateProducerDocument(selectedProducer.id, uploadingDocId, 'Validado_Fisico', reader.result as string);
          checkPhysicalExpediteCompletion(doc?.name || '');
          setUploadingDocId(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(e.target.files[0]);
  };

  const confirmRejection = () => {
      if (!selectedProducer || !rejectingDocId) return;
      const doc = selectedProducer.documents?.find((d: any) => d.id === rejectingDocId);
      updateProducerDocument(selectedProducer.id, rejectingDocId, 'Rechazado', undefined, rejectReason);
      sendMessageToProducer(selectedProducer.id, `❌ *DOCUMENTO OBSERVADO*\n\nDocumento: ${doc?.name}\nObservación: ${rejectReason}\n\nPor favor suba una nueva foto o corrija el documento.`);
      setRejectingDocId(null); setRejectReason('');
  };

  const calculateGeneralStatus = (p: Producer) => {
      const docs = p.documents || [];
      if (docs.length === 0) return { label: 'Sin Iniciar', color: 'text-slate-400 bg-slate-100' };
      if (docs.some(d => d.status === 'Rechazado')) return { label: 'Rechazado', color: 'text-red-700 bg-red-100' };
      if (docs.some(d => d.status === 'En_Revision')) return { label: 'En Revisión', color: 'text-amber-700 bg-amber-100' };
      if (docs.every(d => d.status === 'Validado_Fisico')) return { label: 'Completo', color: 'text-emerald-700 bg-emerald-100' };
      if (docs.some(d => d.status === 'Validado_Digital')) return { label: 'Val. Digital', color: 'text-blue-700 bg-blue-100' };
      return { label: 'Incompleto', color: 'text-slate-600 bg-slate-100' };
  };

  const handleCreateApplication = () => {
      if (!selectedProducer || !appForm.patternId || !appForm.subTypeId || !appForm.hectares) { alert("Seleccione Patrón, Tipo de Apoyo y Hectáreas"); return; }
      const pattern = activePatterns.find(p => p.id === appForm.patternId);
      const subType = pattern?.subTypes?.find(st => st.id === appForm.subTypeId);
      const estimatedAmount = (parseFloat(appForm.hectares) * (subType?.calculatedCostPerHa || 0));
      const farm = selectedProducer.farms.find(f => f.id === appForm.farmId);
      const newApp: CreditApplication = {
          id: `SOL-${Date.now()}`, code: `SOL-2025-${Math.floor(Math.random() * 1000)}`, producerName: selectedProducer.name, farmName: farm?.name || 'Finca Principal', projectType: pattern?.projectType as any, type: pattern?.projectType as any, amount: estimatedAmount, requestedAmount: estimatedAmount, hectares: parseFloat(appForm.hectares), status: 'Solicitud', date: new Date().toISOString().split('T')[0], patternId: pattern?.id, patternName: pattern?.name, supportTypeId: subType?.id, documents: [], assignedTechnician: selectedProducer.mainTechnician
      };
      addApplication(newApp);
      setIsAppWizardOpen(false); setAppForm({ patternId: '', subTypeId: '', hectares: '', farmId: '' });
      setActiveTab('requests');
  };

  const getEstimatedAmount = () => {
      if(!appForm.patternId || !appForm.subTypeId || !appForm.hectares) return 0;
      const pattern = activePatterns.find(p => p.id === appForm.patternId);
      const subType = pattern?.subTypes?.find(st => st.id === appForm.subTypeId);
      return (parseFloat(appForm.hectares) * (subType?.calculatedCostPerHa || 0)).toLocaleString();
  };

  if (viewMode === 'create') {
      return (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <h1 className="text-2xl font-bold text-slate-800">Nuevo Productor</h1>
                  <button onClick={handleCancelCreate} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X className="h-6 w-6" /></button>
              </div>
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="block text-sm font-bold text-slate-700 mb-2">Tipo</label><select className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}><option value="Natural">Persona Natural</option><option value="Juridica">Persona Jurídica</option></select></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-2">Cédula / RIF</label><input type="text" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" value={formData.vat} onChange={(e) => setFormData({...formData, vat: e.target.value})} placeholder="V-12345678" /></div>
                      <div className="col-span-2"><label className="block text-sm font-bold text-slate-700 mb-2">Nombre o Razón Social</label><input type="text" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nombre Completo" /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-2">Teléfono</label><input type="tel" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="04xx-xxxxxxx" /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-2">Estado Inicial</label><select className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option value="Activa">Activo</option><option value="Pendiente">Pendiente</option></select></div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-100 gap-2"><button onClick={handleCancelCreate} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancelar</button><button onClick={handleCreate} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm flex items-center"><Save className="h-5 w-5 mr-2" /> Guardar Productor</button></div>
              </div>
          </div>
      );
  }

  if (viewMode === 'detail' && selectedProducer) {
      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {isAppWizardOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-emerald-500">
                          <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-center"><h3 className="font-bold text-emerald-800 text-lg">Solicitar Apoyo Financiero</h3><button onClick={() => setIsAppWizardOpen(false)}><X className="text-emerald-600"/></button></div>
                          <div className="p-6 space-y-4">
                              <div><label className="block text-sm font-bold text-slate-700 mb-1">Patrón de Apoyo</label><select className="w-full p-3 border rounded-lg bg-white" value={appForm.patternId} onChange={(e) => setAppForm({...appForm, patternId: e.target.value, subTypeId: ''})}><option value="">-- Seleccionar --</option>{activePatterns.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div>
                              <div><label className="block text-sm font-bold text-slate-700 mb-1">Finca</label><select className="w-full p-3 border rounded-lg bg-white" value={appForm.farmId} onChange={(e) => setAppForm({...appForm, farmId: e.target.value})}><option value="">-- Seleccionar --</option>{selectedProducer.farms.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}</select></div>
                              <div><label className="block text-sm font-bold text-slate-700 mb-1">Hectáreas</label><input type="number" className="w-full p-3 border rounded-lg" value={appForm.hectares} onChange={(e) => setAppForm({...appForm, hectares: e.target.value})} placeholder="0.00" /></div>
                              <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-200"><div><span className="text-sm font-bold text-slate-700 block">Monto Estimado:</span></div><span className="text-2xl font-bold text-emerald-600">${getEstimatedAmount()}</span></div>
                          </div>
                          <div className="p-4 bg-slate-50 border-t flex justify-end gap-3"><button onClick={() => setIsAppWizardOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-white">Cancelar</button><button onClick={handleCreateApplication} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Crear Solicitud</button></div>
                      </div>
                  </div>
              )}

              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-500"><span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Inicio</span><ChevronRight className="h-4 w-4" /><span className="cursor-pointer hover:text-emerald-700" onClick={handleBackToList}>Productores</span><ChevronRight className="h-4 w-4" /><span className="text-slate-800 font-bold">{selectedProducer.name}</span></div>
                  <div className="flex gap-2">
                      {selectedProducer.status === 'Pendiente' && (<button onClick={() => handleToggleStatus('Activo')} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 flex items-center shadow-sm animate-pulse"><ShieldCheck className="h-4 w-4 mr-2" /> Validar y Activar</button>)}
                      <button onClick={handleBackToList} className="px-3 py-1.5 border border-slate-300 bg-white rounded text-sm text-slate-700 font-medium hover:bg-slate-50">Volver</button>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-6 relative overflow-hidden group">
                  <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-2xl border-4 border-white shadow-sm shrink-0">{selectedProducer.name.substring(0, 2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h1 className="text-2xl font-bold text-slate-900 truncate">{selectedProducer.name}</h1>
                          <p className="text-slate-500 text-sm">{selectedProducer.vat} • {selectedProducer.type}</p>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          {selectedProducer.crediAgro?.isMember ? (
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-3 rounded-2xl shadow-lg border border-emerald-500/20 text-white flex items-center gap-4 animate-in zoom-in-95 duration-500">
                              <div className="bg-white/20 p-2 rounded-xl">
                                <Award className="h-6 w-6 text-emerald-200" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 leading-none mb-1">Score CrediAgro</p>
                                <div className="flex items-end gap-1.5">
                                  <span className="text-2xl font-black leading-none">{selectedProducer.crediAgro.score}</span>
                                  <span className="text-[10px] font-bold text-emerald-300 pb-0.5">/ 1000</span>
                                </div>
                              </div>
                              <div className="pl-3 border-l border-white/10">
                                <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-400 grayscale">
                               <Award className="h-4 w-4" />
                               <span className="text-[10px] font-bold uppercase tracking-wider">No CrediAgro</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-4 text-sm text-slate-600"><span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-slate-400"/> {selectedProducer.region}</span><span className="flex items-center"><Smartphone className="h-4 w-4 mr-1 text-slate-400"/> {selectedProducer.phone}</span><span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedProducer.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{selectedProducer.status}</span></div>
                  </div>
              </div>

              <div className="flex border-b border-slate-200 overflow-x-auto">{['resumen', 'requests', 'docs', 'fincas', 'financiero'].map((t) => (<button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors uppercase ${activeTab === t ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{t === 'requests' ? 'Solicitudes' : t === 'docs' ? 'Expediente Digital' : t}</button>))}</div>

              <div className="min-h-[300px]">
                  {activeTab === 'resumen' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                              <h3 className="font-bold text-slate-800 mb-4">Resumen Operativo</h3>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-xs text-slate-500 uppercase font-bold">Hectáreas</p><p className="text-xl font-bold text-slate-800">{selectedProducer.totalHectares || 0} ha</p></div>
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-xs text-slate-500 uppercase font-bold">Fincas</p><p className="text-xl font-bold text-slate-800">{selectedProducer.farms.length}</p></div>
                              </div>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                              <h3 className="font-bold text-slate-800 mb-4">Estado del Expediente</h3>
                              <div className="flex items-center gap-4"><div className={`p-3 rounded-full ${calculateGeneralStatus(selectedProducer).label === 'Completo' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}><ShieldCheck className="h-8 w-8" /></div><div><p className="font-bold text-slate-800">{calculateGeneralStatus(selectedProducer).label}</p><button onClick={() => setActiveTab('docs')} className="text-sm text-blue-600 hover:underline">Ver Documentos</button></div></div>
                          </div>
                      </div>
                  )}
                  {activeTab === 'docs' && (
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
                          <div className="flex justify-between mb-6"><div><h3 className="font-bold text-slate-800">Expediente Digital</h3><p className="text-sm text-slate-500">Gestión de recaudos y validación</p></div><div className="flex gap-2"><button onClick={handleRequestDigital} className="flex items-center text-sm bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 font-bold shadow-sm"><MessageCircle className="h-4 w-4 mr-2 text-emerald-600"/> Solicitar Digital (WhatsApp)</button></div></div>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleManualFileUpload} />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedProducer.documents?.map(doc => (
                                  <div key={doc.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-start mb-3"><div><h4 className="font-bold text-slate-800 text-sm">{doc.name}</h4></div><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${doc.status === 'Validado_Fisico' ? 'bg-emerald-100 text-emerald-700' : doc.status === 'Validado_Digital' ? 'bg-blue-100 text-blue-700' : doc.status === 'Rechazado' ? 'bg-red-100 text-red-700' : doc.status === 'En_Revision' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{doc.status.replace('_', ' ')}</span></div>
                                      <div className="bg-slate-100 h-32 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden group">
                                          {doc.fileUrl ? (
                                              <img src={doc.fileUrl} alt="Preview" className="w-full h-full object-cover" />
                                          ) : (
                                              <div className="flex flex-col items-center gap-2">
                                                  <FileText className="h-10 w-10 text-slate-300" />
                                                  <button onClick={() => handleDocAction(doc, 'upload_manual')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Cargar Archivo</button>
                                              </div>
                                          )}
                                          {doc.fileUrl && (
                                              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center gap-2">
                                                  <button onClick={() => setPreviewDocUrl(doc.fileUrl || null)} className="p-2 bg-white rounded-full text-slate-800 hover:scale-110 transition-transform"><Eye className="h-4 w-4"/></button>
                                                  <button onClick={() => handleDocAction(doc, 'upload_manual')} className="p-2 bg-blue-600 rounded-full text-white hover:scale-110 transition-transform"><FileUp className="h-4 w-4"/></button>
                                              </div>
                                          )}
                                      </div>
                                      <div className="flex gap-2 mt-2">
                                          {doc.status === 'En_Revision' && (<div className="flex w-full gap-2 bg-amber-50 p-2 rounded-lg"><button onClick={() => handleDocAction(doc, 'reject')} className="flex-1 bg-red-100 text-red-700 text-xs font-bold py-2 rounded hover:bg-red-200">Rechazar</button><button onClick={() => handleDocAction(doc, 'approve_digital')} className="flex-1 bg-blue-100 text-blue-700 text-xs font-bold py-2 rounded hover:bg-blue-200">Aprobar Digital</button></div>)}
                                          {(doc.status === 'Validado_Digital' || doc.status === 'Solicitado' || doc.status === 'Pendiente' || doc.status === 'Rechazado') && (
                                              <div className="flex w-full gap-2">
                                                  <button onClick={() => handleDocAction(doc, 'upload_manual')} className="flex-1 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold py-2 rounded hover:bg-slate-100 flex items-center justify-center"><Upload className="h-3 w-3 mr-1"/> Cargar Manual</button>
                                                  {doc.status === 'Validado_Digital' && (
                                                      <button onClick={() => handleDocAction(doc, 'confirm_physical')} className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold py-2 rounded hover:bg-emerald-100 flex items-center justify-center"><CheckCheck className="h-3 w-3 mr-1"/> Confirmar Físico</button>
                                                  )}
                                              </div>
                                          )}
                                          {doc.status === 'Validado_Fisico' && (<div className="w-full text-center text-xs text-emerald-600 font-bold flex items-center justify-center py-2"><FileCheck className="h-4 w-4 mr-1"/> Expediente Completo</div>)}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
                  {activeTab === 'requests' && (
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
                          <div className="flex justify-between mb-4"><h3 className="font-bold text-slate-800">Historial de Solicitudes</h3><button onClick={() => { setAppForm({ patternId: '', subTypeId: '', hectares: '', farmId: '' }); setIsAppWizardOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm hover:bg-emerald-700"><Plus className="h-4 w-4 mr-2"/> Nueva Solicitud</button></div>
                          <div className="space-y-3">{applications.filter(app => app.producerName === selectedProducer.name).map(app => (<div key={app.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors"><div><div className="flex items-center gap-2"><span className="font-bold text-slate-800">{app.code}</span></div><p className="text-xs text-slate-500 mt-1">{app.patternName}</p></div><div className="text-right flex items-center gap-4"><div><p className="font-bold text-slate-800">${app.amount.toLocaleString()}</p></div><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${app.status === 'Activa' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{app.status.replace('_', ' ')}</span><ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-600"/></div></div>))}</div>
                      </div>
                  )}
              </div>

              {previewDocUrl && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewDocUrl(null)}><button className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"><X className="h-8 w-8"/></button><img src={previewDocUrl} className="max-w-full max-h-full rounded shadow-2xl" /></div>)}
              {rejectingDocId && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm"><h3 className="font-bold text-lg mb-4 text-red-600">Rechazar Documento</h3><textarea className="w-full border rounded p-2 mb-4 text-sm" placeholder="Motivo del rechazo..." rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} /><div className="flex justify-end gap-2"><button onClick={() => setRejectingDocId(null)} className="px-4 py-2 text-slate-600 text-sm hover:bg-slate-100 rounded">Cancelar</button><button onClick={confirmRejection} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700">Confirmar</button></div></div></div>)}
          </div>
      );
  }

  return (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-slate-800">Productores</h1><button onClick={() => { setViewMode('create'); setFormData(initialFormState); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-sm hover:bg-emerald-700"><Plus className="h-4 w-4 mr-2" /> Nuevo Productor</button></div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 shadow-sm"><div className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 flex items-center shadow-inner"><Search className="h-4 w-4 text-slate-400 mr-2" /><input type="text" placeholder="Buscar por nombre, cédula..." className="flex-1 bg-transparent outline-none text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-50 border-b font-bold text-slate-600 text-xs uppercase"><tr><th className="p-4">Productor</th><th className="p-4">Ubicación</th><th className="p-4 text-center">Estado</th><th className="p-4 text-center">Expediente</th><th className="p-4 text-center">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{producers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (<tr key={p.id} onClick={() => handleSelectProducer(p)} className="hover:bg-slate-50 cursor-pointer transition-colors group"><td className="p-4"><div className="font-bold text-slate-800">{p.name}</div><div className="text-xs text-slate-500">{p.vat}</div></td><td className="p-4 text-slate-600">{p.region || 'Sin asignar'}</td><td className="p-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${p.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span></td><td className="p-4 text-center"><span className={`px-2 py-1 rounded text-xs font-medium border ${calculateGeneralStatus(p).color}`}>{calculateGeneralStatus(p).label}</span></td><td className="p-4 text-center"><button className="text-slate-400 group-hover:text-emerald-600"><ChevronRight className="h-5 w-5"/></button></td></tr>))}</tbody></table></div>
      </div>
  );
};

export default DesktopProducers;
