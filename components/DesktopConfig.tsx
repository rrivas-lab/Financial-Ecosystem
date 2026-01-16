
import React, { useState, useEffect } from 'react';
import { NavigationProps, SupportPattern, SupportPatternStage, SupportPatternLine, SupportPatternSubType, PatternStatus } from '../types';
import { useMasterData } from '../context/MasterDataContext';
import { useApplications } from '../context/ApplicationContext';
import { usePatterns } from '../context/PatternContext';
import { Settings, ChevronRight, Save, LayoutDashboard, Plus, Trash2, CheckSquare, X, List, Building, Users, ArrowRight, ArrowLeft, Clock, Package, Layers, ToggleLeft, ToggleRight, Calendar, AlertTriangle, CheckCircle, Lock, Info, DollarSign, Calculator, Edit2, Search, Play, FileText, ChevronDown } from 'lucide-react';

const DesktopConfig: React.FC<NavigationProps> = ({ onNavigate }) => {
  const { stages: masterStages, partners: masterPartners, committee: masterCommittee, inputs: masterInputs, crops: masterCrops, documents: masterDocuments } = useMasterData();
  const { applications } = useApplications();
  const { patterns, addPattern, updatePattern } = usePatterns();
  
  const [selectedPattern, setSelectedPattern] = useState<SupportPattern | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [activeTab, setActiveTab] = useState<'general' | 'stages' | 'lines' | 'subtypes' | 'partners' | 'committee' | 'documents'>('general');

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<'stage' | 'line' | 'subtype' | 'partner' | 'committee' | 'document' | null>(null);
  const [wizardSelection, setWizardSelection] = useState<string[]>([]); 
  const [subTypeForm, setSubTypeForm] = useState({ id: '', name: '', description: '' });
  const [selectedGanttStage, setSelectedGanttStage] = useState<any | null>(null);
  const [formData, setFormData] = useState({
      name: '', cropIds: [] as string[], projectType: 'Consumo', financingAmount: '', globalBudget: '',
      adminFee: '10', cycleStart: '', cycleEnd: '', plannedVisits: '3'
  });

  const updatePatternState = (updated: SupportPattern) => {
      // Update global context
      updatePattern(updated.id, updated);
      // Update local selection
      setSelectedPattern(updated);
  };

  const handleCreate = () => {
      const newPattern: SupportPattern = {
          id: `p-${Date.now()}`,
          name: formData.name,
          cycle: 'Ciclo Personalizado',
          cropIds: formData.cropIds,
          cropName: masterCrops.filter(c => formData.cropIds.includes(c.id)).map(c => c.name).join(', '),
          projectType: formData.projectType as any,
          adminFeePercent: parseFloat(formData.adminFee) || 0,
          status: 'Inicio',
          financingCap: parseFloat(formData.financingAmount) || 0,
          globalBudget: parseFloat(formData.globalBudget) || 0,
          lines: [],
          stages: [],
          associatedPartners: [],
          committeeIds: [],
          requiredDocumentIds: [],
          subTypes: [],
          validityStart: formData.cycleStart,
          validityEnd: formData.cycleEnd
      };
      
      addPattern(newPattern);
      
      alert("Patrón de Apoyo creado en etapa INICIO. Complete los datos obligatorios.");
      setSelectedPattern(newPattern);
      setViewMode('list');
      setActiveTab('general');
  };

  const openWizard = (type: typeof wizardType, editData?: any) => { setWizardType(type); setWizardSelection([]); if (type === 'subtype') { if (editData) { setSubTypeForm({ id: editData.id, name: editData.name, description: editData.description || '' }); setWizardSelection(editData.includedLineIds || []); } else { setSubTypeForm({ id: '', name: '', description: '' }); } } setIsWizardOpen(true); };
  const handleWizardSubmit = () => { if (!selectedPattern) return; if (wizardType === 'stage') { const newStages = wizardSelection.map(id => { const master = masterStages.find(s => s.id === id); if (!master) return null; return { id: `st-p-${Date.now()}-${Math.random()}`, masterStageId: master.id, name: master.name, order: (selectedPattern.stages?.length || 0) + 1, deadlineDays: master.defaultDuration, requiresVisit: master.requiresVisit, visitCount: master.requiresVisit ? 1 : undefined, visitFrequency: master.requiresVisit ? 'Unica' : undefined } as SupportPatternStage; }).filter(Boolean) as SupportPatternStage[]; updatePatternState({ ...selectedPattern, stages: [...(selectedPattern.stages || []), ...newStages] }); } if (wizardType === 'line') { const newLines = wizardSelection.map(id => { const input = masterInputs.find(i => i.id === id); if (!input) return null; return { id: `l-${Date.now()}-${Math.random()}`, product: input.name, inputId: input.id, category: 'Insumo', standardQty: 0, unit: input.unit, unitCost: input.price || 0, totalCost: 0, type: input.category } as SupportPatternLine; }).filter(Boolean) as SupportPatternLine[]; updatePatternState({ ...selectedPattern, lines: [...selectedPattern.lines, ...newLines] }); } if (wizardType === 'partner') { const newPartners = wizardSelection.map(id => ({ partnerId: id })); updatePatternState({ ...selectedPattern, associatedPartners: [...(selectedPattern.associatedPartners || []), ...newPartners] }); } if (wizardType === 'committee') { updatePatternState({ ...selectedPattern, committeeIds: [...(selectedPattern.committeeIds || []), ...wizardSelection] }); } if (wizardType === 'document') { updatePatternState({ ...selectedPattern, requiredDocumentIds: [...(selectedPattern.requiredDocumentIds || []), ...wizardSelection] }); } if (wizardType === 'subtype') { const linesIncluded = selectedPattern.lines.filter(l => wizardSelection.includes(l.id)); const directCost = linesIncluded.reduce((sum, l) => sum + l.totalCost, 0); const adminFee = directCost * (selectedPattern.adminFeePercent / 100); const totalCost = directCost + adminFee; const newSubType: SupportPatternSubType = { id: subTypeForm.id || `stype-${Date.now()}`, name: subTypeForm.name, description: subTypeForm.description, includedLineIds: wizardSelection, calculatedCostPerHa: totalCost }; let updatedSubTypes = [...(selectedPattern.subTypes || [])]; if (subTypeForm.id) { updatedSubTypes = updatedSubTypes.map(st => st.id === subTypeForm.id ? newSubType : st); } else { updatedSubTypes.push(newSubType); } updatePatternState({ ...selectedPattern, subTypes: updatedSubTypes }); } setIsWizardOpen(false); };
  const handleUpdateStage = (stageId: string, updates: Partial<SupportPatternStage>) => { if (!selectedPattern || (selectedPattern.status !== 'Inicio' && selectedPattern.status !== 'Planificacion')) return; const updatedPattern = { ...selectedPattern, stages: selectedPattern.stages?.map(s => s.id === stageId ? { ...s, ...updates } : s) }; updatePatternState(updatedPattern); };
  const handleUpdateLine = (lineId: string, updates: Partial<SupportPatternLine>) => { if (!selectedPattern || selectedPattern.status !== 'Inicio') return; const updatedLines = selectedPattern.lines.map(l => { if (l.id === lineId) { const updatedLine = { ...l, ...updates }; if (updates.standardQty !== undefined || updates.unitCost !== undefined) { updatedLine.totalCost = (updatedLine.standardQty || 0) * (updatedLine.unitCost || 0); } return updatedLine; } return l; }); updatePatternState({ ...selectedPattern, lines: updatedLines }); };
  const handleRemoveItem = (type: string, id: string) => { if (!selectedPattern || selectedPattern.status !== 'Inicio') return; let updated = { ...selectedPattern }; if (type === 'stage') updated.stages = updated.stages?.filter(s => s.id !== id); if (type === 'line') updated.lines = updated.lines.filter(l => l.id !== id); if (type === 'subtype') updated.subTypes = updated.subTypes?.filter(s => s.id !== id); if (type === 'partner') updated.associatedPartners = updated.associatedPartners?.filter(ap => ap.partnerId !== id); if (type === 'committee') updated.committeeIds = updated.committeeIds?.filter(cid => cid !== id); if (type === 'document') updated.requiredDocumentIds = updated.requiredDocumentIds?.filter(did => did !== id); updatePatternState(updated); };
  const handleStageTransition = (direction: 'next' | 'prev') => { if (!selectedPattern) return; const statuses: PatternStatus[] = ['Inicio', 'Planificacion', 'Activo', 'Cierre']; const currentIndex = statuses.indexOf(selectedPattern.status); if (currentIndex === -1) return; const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1; if (newIndex < 0 || newIndex >= statuses.length) return; if (direction === 'next' && selectedPattern.status === 'Inicio') { if(!selectedPattern.name || !selectedPattern.financingCap) { alert("Error: Faltan campos obligatorios."); return; } } if (direction === 'prev' && selectedPattern.status === 'Activo') { if (!window.confirm("¿Está seguro de regresar a Planificación? Esto detendrá el flujo activo.")) return; } updatePatternState({...selectedPattern, status: statuses[newIndex]}); };

  const calculateBudgetUsage = (patternId: string) => {
      // Sum active (not rejected) applications
      const patternApps = applications.filter(a => a.patternId === patternId && a.status !== 'Rechazada');
      return patternApps.reduce((sum, a) => sum + (a.amount || 0), 0);
  };

  const renderDocuments = (p: SupportPattern, readOnly: boolean) => ( <div className="animate-in fade-in"> <div className="flex justify-between items-center mb-4"> <h3 className="font-bold text-slate-700">Documentos Requeridos</h3> {!readOnly && <button onClick={() => openWizard('document')} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center"><Plus className="h-3 w-3 mr-1"/> Agregar</button>} </div> <div className="space-y-2"> {p.requiredDocumentIds?.map(docId => { const doc = masterDocuments.find(d => d.id === docId); if (!doc) return null; return ( <div key={docId} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200"> <div> <p className="text-sm font-bold text-slate-800">{doc.name}</p> <p className="text-xs text-slate-500">{doc.description} • Etapa: {doc.stage}</p> </div> {!readOnly && <button onClick={() => handleRemoveItem('document', docId)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4"/></button>} </div> ); })} {(!p.requiredDocumentIds || p.requiredDocumentIds.length === 0) && <div className="text-sm text-slate-400 italic text-center py-4 border border-dashed border-slate-200 rounded">No hay documentos configurados.</div>} </div> </div> );
  const renderStages = (p: SupportPattern, readOnly: boolean) => ( <div className="animate-in fade-in"> <div className="flex justify-between items-center mb-4"> <h3 className="font-bold text-slate-700">Flujo de Etapas</h3> {!readOnly && <button onClick={() => openWizard('stage')} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center"><Plus className="h-3 w-3 mr-1"/> Agregar</button>} </div> <div className="space-y-3"> {p.stages?.sort((a,b) => a.order - b.order).map((stage, idx) => ( <div key={stage.id} className="bg-white border border-slate-200 rounded-lg p-3 flex gap-4 items-center shadow-sm"> <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-xs border border-slate-200">{idx + 1}</div> <div className="flex-1"> <div className="flex justify-between mb-1"> <span className="font-bold text-sm text-slate-800">{stage.name}</span> <div className="text-xs font-mono bg-slate-50 px-2 py-0.5 rounded border">{stage.deadlineDays} días</div> </div> <div className="flex items-center gap-4 text-xs text-slate-500"> <span className={`flex items-center ${stage.requiresVisit ? 'text-blue-600 font-bold' : ''}`}> {stage.requiresVisit ? <CheckSquare className="h-3 w-3 mr-1"/> : <X className="h-3 w-3 mr-1"/>} Visita Técnica </span> {stage.requiresVisit && <span>({stage.visitCount} {stage.visitFrequency})</span>} </div> </div> {!readOnly && ( <div className="flex flex-col gap-1"> <button onClick={() => handleUpdateStage(stage.id, { deadlineDays: (stage.deadlineDays || 0) + 1 })} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ChevronRight className="h-4 w-4 -rotate-90"/></button> <button onClick={() => handleRemoveItem('stage', stage.id)} className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded"><Trash2 className="h-4 w-4"/></button> </div> )} </div> ))} </div> </div> );
  const renderLines = (p: SupportPattern, readOnly: boolean) => ( <div className="animate-in fade-in"> <div className="flex justify-between items-center mb-4"> <h3 className="font-bold text-slate-700">Insumos y Servicios (Base)</h3> {!readOnly && <button onClick={() => openWizard('line')} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center"><Plus className="h-3 w-3 mr-1"/> Agregar</button>} </div> <table className="w-full text-sm text-left"> <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase"> <tr> <th className="p-2">Concepto</th> <th className="p-2 text-right">Cant/Ha</th> <th className="p-2 text-right">Costo Unit.</th> <th className="p-2 text-right">Total</th> {!readOnly && <th className="p-2 text-center">Acción</th>} </tr> </thead> <tbody className="divide-y divide-slate-100"> {p.lines.map(line => ( <tr key={line.id}> <td className="p-2"> <div className="font-medium text-slate-800">{line.product}</div> <div className="text-[10px] text-slate-500">{line.category} • {line.type}</div> </td> <td className="p-2 text-right"> {readOnly ? ( <span>{line.standardQty} {line.unit}</span> ) : ( <input type="number" className="w-20 p-1 border rounded text-right text-xs" value={line.standardQty} onChange={(e) => handleUpdateLine(line.id, { standardQty: parseFloat(e.target.value) })} /> )} </td> <td className="p-2 text-right font-mono text-xs">${line.unitCost}</td> <td className="p-2 text-right font-bold text-slate-700">${line.totalCost.toFixed(2)}</td> {!readOnly && ( <td className="p-2 text-center"> <button onClick={() => handleRemoveItem('line', line.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4"/></button> </td> )} </tr> ))} <tr className="bg-slate-50 font-bold border-t border-slate-200"> <td colSpan={3} className="p-2 text-right text-slate-600 uppercase text-xs">Costo Directo Total</td> <td className="p-2 text-right text-emerald-700">${p.lines.reduce((sum, l) => sum + l.totalCost, 0).toFixed(2)}</td> {!readOnly && <td></td>} </tr> </tbody> </table> </div> );
  const renderSubTypes = (p: SupportPattern, readOnly: boolean) => ( <div className="animate-in fade-in"> <div className="flex justify-between items-center mb-4"> <h3 className="font-bold text-slate-700">Paquetes Tecnológicos (Sub-Tipos)</h3> {!readOnly && <button onClick={() => openWizard('subtype')} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center"><Plus className="h-3 w-3 mr-1"/> Crear Paquete</button>} </div> <div className="grid grid-cols-1 gap-4"> {p.subTypes?.map(st => ( <div key={st.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-emerald-300 transition-colors"> <div className="flex justify-between items-start mb-2"> <h4 className="font-bold text-emerald-700 text-sm">{st.name}</h4> <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">${st.calculatedCostPerHa.toFixed(2)} / ha</span> </div> <p className="text-xs text-slate-500 mb-3">{st.description}</p> <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 border border-slate-100"> <span className="font-bold block mb-1">Incluye:</span> {st.includedLineIds.map(lid => p.lines.find(l => l.id === lid)?.product).join(', ')} </div> <div className="mt-2 text-xs border-t pt-2 border-slate-100 flex justify-between"> <span className="text-slate-500">Gastos Adm. ({p.adminFeePercent}%)</span> <span className="font-mono">${(st.calculatedCostPerHa - (st.calculatedCostPerHa / (1 + p.adminFeePercent/100))).toFixed(2)}</span> </div> {!readOnly && ( <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-slate-100"> <button onClick={() => openWizard('subtype', st)} className="text-xs text-blue-600 hover:underline">Editar</button> <button onClick={() => handleRemoveItem('subtype', st.id)} className="text-xs text-red-600 hover:underline">Eliminar</button> </div> )} </div> ))} </div> </div> );
  const renderPartners = (p: SupportPattern, readOnly: boolean) => ( <div className="animate-in fade-in"> <div className="flex justify-between items-center mb-4"> <h3 className="font-bold text-slate-700">Alianzas Comerciales</h3> {!readOnly && <button onClick={() => openWizard('partner')} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center"><Plus className="h-3 w-3 mr-1"/> Asociar</button>} </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {p.associatedPartners?.map(ap => { const partner = masterPartners.find(mp => mp.id === ap.partnerId); if (!partner) return null; return ( <div key={ap.partnerId} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm"> <div className="flex items-center gap-3"> <Building className="h-8 w-8 text-slate-300" /> <div> <p className="font-bold text-sm text-slate-800">{partner.name}</p> <p className="text-xs text-slate-500">{partner.type}</p> </div> </div> {!readOnly && <button onClick={() => handleRemoveItem('partner', ap.partnerId)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4"/></button>} </div> ); })} </div> </div> );
  const renderCommittee = (p: SupportPattern, readOnly: boolean) => ( <div className="animate-in fade-in"> <div className="flex justify-between items-center mb-4"> <h3 className="font-bold text-slate-700">Comité de Crédito Asignado</h3> {!readOnly && <button onClick={() => openWizard('committee')} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center"><Plus className="h-3 w-3 mr-1"/> Asignar</button>} </div> <div className="space-y-2"> {p.committeeIds?.map(cId => { const member = masterCommittee.find(m => m.id === cId); if (!member) return null; return ( <div key={cId} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"> <div className="flex items-center gap-3"> <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">{member.name.substring(0,2)}</div> <div> <p className="font-bold text-sm text-slate-800">{member.name}</p> <p className="text-xs text-slate-500">{member.role} • {member.agroIndustry}</p> </div> </div> {!readOnly && <button onClick={() => handleRemoveItem('committee', cId)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4"/></button>} </div> ); })} </div> </div> );
  const renderStatusPipeline = (currentStatus: PatternStatus) => { const statuses: PatternStatus[] = ['Inicio', 'Planificacion', 'Activo', 'Cierre']; const currentIndex = statuses.indexOf(currentStatus); return ( <div className="flex items-center space-x-1"> {statuses.map((s, idx) => ( <div key={s} className="flex items-center"> <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border flex items-center justify-center transition-all duration-300 ${ idx < currentIndex ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : idx === currentIndex ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 'bg-slate-50 text-slate-400 border-slate-200' }`}> {s} </div> {idx < statuses.length - 1 && ( <div className={`w-6 h-0.5 mx-1 ${idx < currentIndex ? 'bg-emerald-300' : 'bg-slate-200'}`}></div> )} </div> ))} </div> ); };

  // --- RESPONSIVE GANTT CHART (WATERFALL GRID STYLE) ---
  const renderGantt = (p: SupportPattern) => {
      const startDate = p.validityStart ? new Date(p.validityStart) : new Date();
      let cumulativeDays = 0;
      
      const stagesData = p.stages?.sort((a,b) => a.order - b.order) || [];
      // const totalDays = stagesData.reduce((acc, s) => acc + (s.deadlineDays || 0), 0) || 1;

      // Calculate Dates & Progress
      const stagesWithDates = stagesData.map(stage => {
          const start = new Date(startDate);
          start.setDate(start.getDate() + cumulativeDays);
          const duration = stage.deadlineDays || 0;
          const end = new Date(start);
          end.setDate(end.getDate() + duration);
          const relativeStartDay = cumulativeDays;
          cumulativeDays += duration;
          
          const today = new Date();
          let status: 'completed' | 'current' | 'future' = 'future';
          let progress = 0;
          let dayOfStage = 0;

          if (today > end) { status = 'completed'; progress = 100; dayOfStage = duration; } 
          else if (today >= start && today <= end) {
              status = 'current';
              const totalDurationMs = end.getTime() - start.getTime();
              const elapsedMs = today.getTime() - start.getTime();
              dayOfStage = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
              progress = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));
          }
          return { ...stage, start, end, status, progress, dayOfStage, relativeStartDay, duration };
      });

      const totalDuration = cumulativeDays;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + totalDuration);

      const today = new Date();
      const elapsedTotalMs = today.getTime() - startDate.getTime();
      const currentGlobalDay = Math.floor(elapsedTotalMs / (1000 * 60 * 60 * 24));
      const todayPct = Math.min(100, Math.max(0, (currentGlobalDay / totalDuration) * 100));

      // Generate Months Header
      const months = [];
      // We will render columns dynamically based on months in range
      const monthCount = Math.ceil(totalDuration / 30) + 1;
      for (let i = 0; i < monthCount; i++) {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + i);
          months.push(new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit' }).format(d));
      }

      // Colors
      const colors = ['bg-purple-400', 'bg-teal-400', 'bg-amber-400', 'bg-pink-400', 'bg-blue-400', 'bg-emerald-400', 'bg-indigo-400'];

      return (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden my-6 select-none mt-8 relative">
              <div className="flex">
                  {/* LEFT COLUMN: FIXED HEADERS */}
                  <div className="w-48 sm:w-64 flex-shrink-0 border-r border-slate-200 bg-white z-20">
                      <div className="h-10 bg-slate-700 text-white font-bold text-xs uppercase flex items-center px-4">
                          Etapas del Ciclo
                      </div>
                      <div className="bg-white">
                          {stagesWithDates.map((stage, idx) => (
                              <div key={stage.id} className={`h-12 border-b border-slate-100 flex items-center px-4 text-xs sm:text-sm font-medium ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                                  <span className="truncate" title={stage.name}>{stage.name}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* RIGHT COLUMN: FLUID TIMELINE GRID */}
                  <div className="flex-1 relative bg-slate-50 w-full overflow-hidden">
                      <div className="relative w-full h-full">
                          
                          {/* 1. Header (Months) - Flex container ensures response to width */}
                          <div className="flex h-10 bg-slate-700 text-white w-full border-b border-slate-600">
                              {months.map((m, i) => (
                                  <div key={i} className="flex-1 border-r border-slate-600 flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase truncate px-1">
                                      {m}
                                  </div>
                              ))}
                          </div>

                          {/* 2. Grid Body */}
                          <div className="relative">
                              {/* Background Vertical Grid Lines */}
                              <div className="absolute inset-0 flex pointer-events-none">
                                  {months.map((_, i) => (
                                      <div key={i} className="flex-1 border-r border-slate-200 h-full opacity-50"></div>
                                  ))}
                              </div>

                              {/* 3. Stage Rows & Bars */}
                              {stagesWithDates.map((stage, idx) => {
                                  const colorClass = colors[idx % colors.length];
                                  const leftPct = (stage.relativeStartDay / totalDuration) * 100;
                                  const widthPct = (stage.duration / totalDuration) * 100;

                                  return (
                                      <div key={stage.id} className={`h-12 border-b border-slate-100 relative ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                                          <div 
                                              className={`absolute top-2 bottom-2 rounded-full shadow-sm flex items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:brightness-110 transition-all z-10 ${colorClass}`}
                                              style={{ 
                                                  left: `${leftPct}%`, 
                                                  width: `${Math.max(widthPct, 1)}%` // ensure min visibility
                                              }}
                                              onClick={() => setSelectedGanttStage(stage)}
                                              title={`${stage.name} (${stage.duration} días)`}
                                          >
                                              {/* Progress Inner Bar */}
                                              {stage.status === 'current' && (
                                                  <div className="absolute top-0 bottom-0 left-0 bg-white/30" style={{ width: `${stage.progress}%` }}></div>
                                              )}
                                              
                                              {/* Show duration only if bar is wide enough */}
                                              {widthPct > 8 && <span className="truncate px-2">{stage.duration}d</span>}
                                          </div>
                                      </div>
                                  );
                              })}

                              {/* 4. Today Marker */}
                              {todayPct > 0 && todayPct < 100 && (
                                  <div className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center" style={{ left: `${todayPct}%` }}>
                                      <div className="w-0.5 h-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]"></div>
                                      {/* Floating Badge at bottom */}
                                      <div className="absolute bottom-[-14px] bg-white border border-red-500 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap z-40 transform -translate-x-1/2">
                                          Día {currentGlobalDay}
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-2 flex justify-between text-xs text-slate-500 font-mono px-4">
                  <span>{startDate.toLocaleDateString()}</span>
                  <span>Duración Total: {totalDuration} días</span>
                  <span>{endDate.toLocaleDateString()}</span>
              </div>

              {/* Detail Modal (Same as before) */}
              {selectedGanttStage && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                      <div className="bg-white text-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
                          <div className="flex justify-between items-start mb-4 border-b pb-2">
                              <div>
                                  <h3 className="text-xl font-bold text-slate-800">{selectedGanttStage.name}</h3>
                                  <span className="text-xs text-slate-500 font-mono">Día Global: {selectedGanttStage.relativeStartDay} - {selectedGanttStage.relativeStartDay + selectedGanttStage.duration}</span>
                              </div>
                              <button onClick={() => setSelectedGanttStage(null)}><X className="h-6 w-6 text-slate-400 hover:text-slate-600"/></button>
                          </div>
                          {/* ... Content ... */}
                          <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-slate-50 rounded border">
                                      <span className="text-xs font-bold text-slate-500 uppercase block">Inicio</span>
                                      <span className="font-mono font-bold">{selectedGanttStage.start.toLocaleDateString()}</span>
                                  </div>
                                  <div className="p-3 bg-slate-50 rounded border">
                                      <span className="text-xs font-bold text-slate-500 uppercase block">Fin</span>
                                      <span className="font-mono font-bold">{selectedGanttStage.end.toLocaleDateString()}</span>
                                  </div>
                              </div>
                              {selectedGanttStage.status === 'current' && (
                                  <div className="bg-emerald-50 p-3 rounded border border-emerald-100 text-center">
                                      <p className="text-emerald-800 font-bold text-sm">En Progreso: Día {selectedGanttStage.dayOfStage} / {selectedGanttStage.duration}</p>
                                      <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
                                          <div className="bg-emerald-600 h-full" style={{ width: `${selectedGanttStage.progress}%` }}></div>
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderWizard = () => { /* ... existing wizard code ... */ if (!isWizardOpen) return null; const renderWizardContent = () => { switch(wizardType) { case 'stage': return ( <div className="grid grid-cols-1 gap-2"> {masterStages.filter(s => !selectedPattern?.stages?.some(ps => ps.masterStageId === s.id)).map(s => ( <label key={s.id} className="flex items-center p-3 border rounded hover:bg-slate-50 cursor-pointer"> <input type="checkbox" className="mr-3" checked={wizardSelection.includes(s.id)} onChange={e => { if (e.target.checked) setWizardSelection([...wizardSelection, s.id]); else setWizardSelection(wizardSelection.filter(id => id !== s.id)); }} /> <div> <div className="font-bold text-sm">{s.name}</div> <div className="text-xs text-slate-500">{s.description} ({s.defaultDuration} días)</div> </div> </label> ))} </div> ); case 'line': return ( <div className="max-h-96 overflow-y-auto"> <input type="text" placeholder="Buscar insumo..." className="w-full p-2 border rounded mb-3 text-sm" /> <div className="grid grid-cols-1 gap-2"> {masterInputs.filter(i => !selectedPattern?.lines?.some(l => l.inputId === i.id)).map(i => ( <label key={i.id} className="flex items-center p-3 border rounded hover:bg-slate-50 cursor-pointer"> <input type="checkbox" className="mr-3" checked={wizardSelection.includes(i.id)} onChange={e => { if (e.target.checked) setWizardSelection([...wizardSelection, i.id]); else setWizardSelection(wizardSelection.filter(id => id !== i.id)); }} /> <div> <div className="font-bold text-sm">{i.name}</div> <div className="text-xs text-slate-500">{i.category} • ${i.price} / {i.unit}</div> </div> </label> ))} </div> </div> ); case 'subtype': return ( <div className="space-y-4"> <div><label className="block text-sm font-bold mb-1">Nombre Paquete</label><input type="text" className="w-full p-2 border rounded" value={subTypeForm.name} onChange={e => setSubTypeForm({...subTypeForm, name: e.target.value})} placeholder="Ej. Paquete Básico"/></div> <div><label className="block text-sm font-bold mb-1">Descripción</label><input type="text" className="w-full p-2 border rounded" value={subTypeForm.description} onChange={e => setSubTypeForm({...subTypeForm, description: e.target.value})} /></div> <div> <label className="block text-sm font-bold mb-2">Insumos Incluidos</label> <div className="border rounded max-h-48 overflow-y-auto p-2 space-y-1"> {selectedPattern?.lines.map(line => ( <label key={line.id} className="flex items-center p-2 hover:bg-slate-50 rounded"> <input type="checkbox" className="mr-2" checked={wizardSelection.includes(line.id)} onChange={e => { if (e.target.checked) setWizardSelection([...wizardSelection, line.id]); else setWizardSelection(wizardSelection.filter(id => id !== line.id)); }} /> <span className="text-sm">{line.product}</span> </label> ))} </div> </div> </div> ); case 'partner': return ( <div className="grid grid-cols-1 gap-2"> {masterPartners.filter(p => !selectedPattern?.associatedPartners?.some(ap => ap.partnerId === p.id)).map(p => ( <label key={p.id} className="flex items-center p-3 border rounded hover:bg-slate-50 cursor-pointer"> <input type="checkbox" className="mr-3" checked={wizardSelection.includes(p.id)} onChange={e => { if (e.target.checked) setWizardSelection([...wizardSelection, p.id]); else setWizardSelection(wizardSelection.filter(id => id !== p.id)); }} /> <div> <div className="font-bold text-sm">{p.name}</div> <div className="text-xs text-slate-500">{p.type}</div> </div> </label> ))} </div> ); case 'committee': return ( <div className="grid grid-cols-1 gap-2"> {masterCommittee.filter(c => !selectedPattern?.committeeIds?.includes(c.id)).map(c => ( <label key={c.id} className="flex items-center p-3 border rounded hover:bg-slate-50 cursor-pointer"> <input type="checkbox" className="mr-3" checked={wizardSelection.includes(c.id)} onChange={e => { if (e.target.checked) setWizardSelection([...wizardSelection, c.id]); else setWizardSelection(wizardSelection.filter(id => id !== c.id)); }} /> <div> <div className="font-bold text-sm">{c.name}</div> <div className="text-xs text-slate-500">{c.role}</div> </div> </label> ))} </div> ); case 'document': return ( <div className="grid grid-cols-1 gap-2"> {masterDocuments.filter(d => !selectedPattern?.requiredDocumentIds?.includes(d.id)).map(d => ( <label key={d.id} className="flex items-center p-3 border rounded hover:bg-slate-50 cursor-pointer"> <input type="checkbox" className="mr-3" checked={wizardSelection.includes(d.id)} onChange={e => { if (e.target.checked) setWizardSelection([...wizardSelection, d.id]); else setWizardSelection(wizardSelection.filter(id => id !== d.id)); }} /> <div> <div className="font-bold text-sm">{d.name}</div> <div className="text-xs text-slate-500">{d.requiredFor} • {d.stage}</div> </div> </label> ))} </div> ); default: return <div>Selección no válida</div>; } }; return ( <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"> <div className="bg-white text-slate-900 rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]"> <div className="flex justify-between items-center mb-6 border-b pb-4"> <h3 className="text-xl font-bold"> {wizardType === 'stage' && 'Agregar Etapas al Flujo'} {wizardType === 'line' && 'Agregar Insumos / Servicios'} {wizardType === 'subtype' && (subTypeForm.id ? 'Editar Paquete' : 'Crear Paquete de Apoyo')} {wizardType === 'partner' && 'Asociar Alianzas'} {wizardType === 'committee' && 'Asignar Comité'} {wizardType === 'document' && 'Requerir Documentos'} </h3> <button onClick={() => setIsWizardOpen(false)}><X className="h-6 w-6 text-slate-400 hover:text-slate-600" /></button> </div> {renderWizardContent()} <div className="flex justify-end gap-3 mt-6 pt-4 border-t"> <button onClick={() => setIsWizardOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancelar</button> <button onClick={handleWizardSubmit} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700">Confirmar</button> </div> </div> </div> ); };

  const renderDetail = () => {
      if (!selectedPattern) return null;
      const isLocked = selectedPattern.status === 'Activo' || selectedPattern.status === 'Cierre';
      const readOnly = isLocked || selectedPattern.status === 'Planificacion';
      const reservedAmount = calculateBudgetUsage(selectedPattern.id);
      const budgetPercent = selectedPattern.globalBudget ? (reservedAmount / selectedPattern.globalBudget) * 100 : 0;

      return (
          <div className="animate-in fade-in slide-in-from-right-4 relative pb-20 space-y-6">
              {renderWizard()}
              
              {/* BLOCK 1: HEADER & STATUS CARD */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                          <button onClick={() => setSelectedPattern(null)} className="p-2 rounded-full hover:bg-slate-200 transition-colors bg-slate-100 text-slate-500"><ChevronRight className="h-6 w-6 rotate-180"/></button>
                          <div>
                              <h2 className="text-2xl font-bold text-slate-800 leading-tight">{selectedPattern.name}</h2>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs font-bold">{selectedPattern.cycle}</span>
                                  <span>•</span>
                                  <span>{selectedPattern.projectType}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                              <button onClick={() => handleStageTransition('prev')} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 shadow-sm flex items-center transition-colors text-sm">
                                  <ArrowLeft className="h-4 w-4 mr-2"/> {selectedPattern.status === 'Activo' ? 'Pausar' : 'Atrás'}
                              </button>
                              <button onClick={() => handleStageTransition('next')} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-emerald-700 shadow-lg flex items-center transition-colors text-sm">
                                  {selectedPattern.status === 'Inicio' ? 'Solicitar Revisión' : selectedPattern.status === 'Planificacion' ? 'Aprobar y Activar' : selectedPattern.status === 'Activo' ? 'Cerrar Apoyo' : 'Archivar'} <ArrowRight className="h-4 w-4 ml-2"/>
                              </button>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                      {/* Financial Pill / Budget Bar */}
                      {selectedPattern.globalBudget ? (
                          <div className="flex flex-col w-1/3">
                              <div className="flex justify-between text-xs mb-1 font-bold">
                                  <span className="text-slate-500">PRESUPUESTO GLOBAL</span>
                                  <span className={budgetPercent > 100 ? 'text-red-600' : 'text-slate-700'}>
                                      ${reservedAmount.toLocaleString()} / ${selectedPattern.globalBudget.toLocaleString()}
                                  </span>
                              </div>
                              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                  <div 
                                      className={`h-full transition-all duration-500 ${budgetPercent > 100 ? 'bg-red-500' : budgetPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                      style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                                  ></div>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1 text-right">
                                  {budgetPercent.toFixed(1)}% Planificado en Solicitudes
                              </div>
                          </div>
                      ) : (
                          <div className="text-xs text-slate-400 italic">Presupuesto global no definido</div>
                      )}

                      {renderStatusPipeline(selectedPattern.status)}
                  </div>
              </div>

              {/* BLOCK 2: GANTT CHART CARD */}
              {(selectedPattern.status === 'Activo' || selectedPattern.status === 'Planificacion' || selectedPattern.status === 'Cierre') && (
                  renderGantt(selectedPattern)
              )}

              {/* BLOCK 3: CONFIGURATION CARD */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
                  {/* Tabs Header */}
                  <div className="bg-slate-50 border-b border-slate-200">
                      <div className="flex space-x-1 overflow-x-auto px-2 pt-2 scrollbar-hide">
                          {[
                              { id: 'general', label: 'Resumen General', icon: LayoutDashboard },
                              { id: 'documents', label: 'Documentación', icon: FileText },
                              { id: 'lines', label: 'Insumos Aplicados', icon: Package },
                              { id: 'subtypes', label: 'Tipos de Apoyo', icon: Layers },
                              { id: 'stages', label: 'Etapas y Visitas', icon: List },
                              { id: 'partners', label: 'Alianzas', icon: Building },
                              { id: 'committee', label: 'Comité', icon: Users }
                          ].map(tab => (
                              <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id as any)} 
                                className={`flex items-center px-4 py-3 text-sm font-bold border-t border-x rounded-t-lg transition-all whitespace-nowrap mb-[-1px] z-10 ${activeTab === tab.id ? 'bg-white border-slate-200 border-b-white text-emerald-700' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                              >
                                  <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} /> {tab.label}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6 bg-white flex-1">
                      {activeTab === 'general' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                              <div className="space-y-6">
                                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Configuración Básica</h3>
                                  <div className="space-y-4">
                                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Patrón</label><input type="text" defaultValue={selectedPattern.name} className="w-full p-3 border rounded-lg bg-slate-50 text-slate-700 font-medium" disabled={isLocked} /></div>
                                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rubros (IDs)</label><div className="p-3 border rounded-lg bg-slate-50 text-sm text-slate-700 font-mono">{selectedPattern.cropIds?.join(', ') || 'Sin rubros'}</div></div>
                                  </div>
                              </div>
                              <div className="space-y-6">
                                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Parámetros Financieros</h3>
                                  <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tope Indiv. ($/ha)</label><input type="number" defaultValue={selectedPattern.financingCap} className="w-full p-3 border rounded-lg bg-white font-mono" disabled={isLocked} /></div>
                                          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Presupuesto Global ($)</label><input type="number" defaultValue={selectedPattern.globalBudget} className="w-full p-3 border rounded-lg bg-white font-mono" disabled={isLocked} /></div>
                                          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gastos Adm. (%)</label><input type="number" value={selectedPattern.adminFeePercent} className="w-full p-3 border rounded-lg bg-white font-mono" disabled={isLocked} /></div>
                                      </div>
                                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vigencia del Ciclo</label><div className="flex gap-2"><input type="date" value={selectedPattern.validityStart} disabled={isLocked} className="w-full p-3 border rounded-lg bg-white text-sm" /><input type="date" value={selectedPattern.validityEnd} disabled={isLocked} className="w-full p-3 border rounded-lg bg-white text-sm" /></div></div>
                                  </div>
                              </div>
                          </div>
                      )}
                      {activeTab === 'documents' && renderDocuments(selectedPattern, readOnly)}
                      {activeTab === 'stages' && renderStages(selectedPattern, readOnly)}
                      {activeTab === 'lines' && renderLines(selectedPattern, readOnly)}
                      {activeTab === 'subtypes' && renderSubTypes(selectedPattern, readOnly)}
                      {activeTab === 'partners' && renderPartners(selectedPattern, readOnly)}
                      {activeTab === 'committee' && renderCommittee(selectedPattern, readOnly)}
                  </div>
              </div>
          </div>
      );
  };

  const renderCreateForm = () => (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto animate-in slide-in-from-right-4 mt-6">
          <h3 className="font-bold text-lg text-slate-800 mb-6 border-b pb-2">Nuevo Patrón de Apoyo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Patrón</label>
                  <input type="text" className="w-full p-3 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Arroz Consumo - Invierno 2025"/>
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Rubros Asociados</label>
                  <select multiple className="w-full p-3 border rounded-lg bg-white h-32" value={formData.cropIds} onChange={e => { const options = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value); setFormData({...formData, cropIds: options}); }}>
                      {masterCrops.map(c => <option key={c.id} value={c.id}>{c.name} ({c.variety})</option>)}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Mantenga presionado Ctrl/Cmd para seleccionar múltiples.</p>
              </div>
              <div>
                  <div className="mb-4">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Proyecto</label>
                      <select className="w-full p-3 border rounded-lg bg-white" value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})}>
                          <option value="Consumo">Consumo</option>
                          <option value="Semilla">Semilla</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Financiamiento Tope ($/ha)</label>
                      <input type="number" className="w-full p-3 border rounded-lg" value={formData.financingAmount} onChange={e => setFormData({...formData, financingAmount: e.target.value})} placeholder="0.00"/>
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Presupuesto Global del Programa ($)</label>
                  <input type="number" className="w-full p-3 border rounded-lg" value={formData.globalBudget} onChange={e => setFormData({...formData, globalBudget: e.target.value})} placeholder="Total disponible"/>
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Gastos Administrativos (%)</label>
                  <input type="number" className="w-full p-3 border rounded-lg" value={formData.adminFee} onChange={e => setFormData({...formData, adminFee: e.target.value})} />
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Visitas Planificadas (Default)</label>
                  <input type="number" className="w-full p-3 border rounded-lg" value={formData.plannedVisits} onChange={e => setFormData({...formData, plannedVisits: e.target.value})} />
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Inicio Vigencia</label>
                  <input type="date" className="w-full p-3 border rounded-lg" value={formData.cycleStart} onChange={e => setFormData({...formData, cycleStart: e.target.value})} />
              </div>
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Fin Vigencia</label>
                  <input type="date" className="w-full p-3 border rounded-lg" value={formData.cycleEnd} onChange={e => setFormData({...formData, cycleEnd: e.target.value})} />
              </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setViewMode('list')} className="px-6 py-2 border rounded-lg hover:bg-slate-50">Cancelar</button>
              <button onClick={handleCreate} className="bg-emerald-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center"><Save className="h-5 w-5 mr-2" /> Crear Patrón</button>
          </div>
      </div>
  );

  if (viewMode === 'create') return renderCreateForm();

  return (
      <div className="space-y-6 animate-in fade-in">
          {!selectedPattern ? (
              <>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">Patrones de Apoyo</h1>
                    <button onClick={() => setViewMode('create')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-emerald-700 shadow-sm"><Plus className="h-4 w-4 mr-2"/> Crear Nuevo Patrón</button>
                </div>
                <div className="grid gap-4">
                    {patterns.map(p => (
                        <div key={p.id} onClick={() => setSelectedPattern(p)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-400 transition-all group">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors"><Settings className="h-6 w-6"/></div>
                                    <div><h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{p.name}</h3><p className="text-sm text-slate-500">{p.cycle} • {p.projectType}</p></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${p.status === 'Activo' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>{p.status}</span>
                                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </>
          ) : renderDetail()}
      </div>
  );
};

export default DesktopConfig;
