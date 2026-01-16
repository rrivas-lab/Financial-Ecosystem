
import React, { useState } from 'react';
import { Harvest, HarvestLoad, NavigationProps } from '../types';
import { Truck, CheckCircle, Search, Plus, ChevronRight, Save, Scale, FileText, DollarSign, Sprout, AlertTriangle, ArrowRight, ClipboardCheck, History, Calendar, LayoutDashboard, X } from 'lucide-react';

const mockHarvests: Harvest[] = [
  { 
    id: 'h1', producerName: 'Juan Pérez', farmName: 'La Esperanza', creditId: 'cr1', crop: 'Arroz SD20A', kgHarvested: 25000, unitPrice: 0.45, totalAmount: 11250, status: 'Registrado', date: '2025-10-20',
    projectType: 'Consumo', cycle: 'Invierno 2025', paymentStatus: 'Parcial', harvestedArea: 5, yield: 5000,
    loads: [
        { id: 'l1', harvestId: 'h1', date: '2025-10-20', kg: 15000, guideNumber: 'SUN-1001', moisture: 22, impurity: 5, status: 'Registrada', destination: 'Silo A' },
        { id: 'l2', harvestId: 'h1', date: '2025-10-21', kg: 10000, guideNumber: 'SUN-1002', moisture: 20, impurity: 4, status: 'Registrada', destination: 'Silo A' }
    ],
    grossAmount: 11250, retentionPercent: 0, retentionAmount: 0,
    linkedVisits: ['v4', 'v5']
  },
  { 
    id: 'h2', producerName: 'Agro El Sol', farmName: 'Hato Grande', creditId: 'cr2', crop: 'Arroz Matias', kgHarvested: 50000, unitPrice: 0.50, totalAmount: 22500, status: 'Pagado', date: '2025-10-18', 
    projectType: 'Semilla', cycle: 'Invierno 2025', paymentStatus: 'Total', seedCategory: 'Fundación', harvestedArea: 8, yield: 6250,
    loads: [
        { id: 'l3', harvestId: 'h2', date: '2025-10-18', kg: 25000, guideNumber: 'SUN-2001', moisture: 13, impurity: 2, status: 'Registrada', destination: 'Planta Semilla' },
        { id: 'l4', harvestId: 'h2', date: '2025-10-18', kg: 25000, guideNumber: 'SUN-2002', moisture: 14, impurity: 2, status: 'Registrada', destination: 'Planta Semilla' }
    ], 
    grossAmount: 25000, retentionPercent: 10, retentionAmount: 2500
  },
];

type HarvestTab = 'general' | 'loads' | 'finance' | 'seed' | 'settlement' | 'visits' | 'history';

const DesktopHarvests: React.FC<NavigationProps> = ({ onNavigate }) => {
  const [harvests, setHarvests] = useState<Harvest[]>(mockHarvests);
  const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [activeTab, setActiveTab] = useState<HarvestTab>('general');
  const [isRegisteringLoad, setIsRegisteringLoad] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Forms
  const [createForm, setCreateForm] = useState({ producerName: '', farmName: '', cycle: '', crop: '' });
  const [loadForm, setLoadForm] = useState({ guide: '', kg: '', moisture: '', impurity: '', destination: '' });

  const handleLiquidate = (id: string) => {
     setHarvests(prev => prev.map(h => h.id === id ? { ...h, status: 'Pagado', paymentStatus: 'Total' } : h));
     if (selectedHarvest) setSelectedHarvest({ ...selectedHarvest, status: 'Pagado', paymentStatus: 'Total' });
     alert("Cosecha liquidada. El saldo del Apoyo ha sido cubierto y el crédito marcado como Liquidado.");
  };

  const handleCreateHarvest = () => {
      alert("Cabecera de cosecha creada. Ahora puede registrar boletas de pesaje.");
      setViewMode('list');
  };

  const handleAddLoad = () => {
    if(!selectedHarvest) return;
    const newKg = parseFloat(loadForm.kg);
    const newLoad: HarvestLoad = {
        id: `l${Date.now()}`,
        harvestId: selectedHarvest.id,
        date: new Date().toISOString().split('T')[0],
        kg: newKg,
        guideNumber: loadForm.guide,
        moisture: parseFloat(loadForm.moisture),
        impurity: parseFloat(loadForm.impurity),
        destination: loadForm.destination,
        status: 'Registrada'
    };

    // Recalculate totals
    const newTotalKg = (selectedHarvest.kgHarvested || 0) + newKg;
    const newGross = newTotalKg * selectedHarvest.unitPrice;
    const retention = newGross * ((selectedHarvest.retentionPercent || 0) / 100);
    const newNet = newGross - retention;
    const newYield = selectedHarvest.harvestedArea ? newTotalKg / selectedHarvest.harvestedArea : 0;

    const updatedHarvest = {
        ...selectedHarvest,
        loads: [...(selectedHarvest.loads || []), newLoad],
        kgHarvested: newTotalKg,
        grossAmount: newGross,
        retentionAmount: retention,
        totalAmount: newNet,
        yield: newYield
    };

    setHarvests(harvests.map(h => h.id === selectedHarvest.id ? updatedHarvest : h));
    setSelectedHarvest(updatedHarvest);
    setIsRegisteringLoad(false);
    setLoadForm({ guide: '', kg: '', moisture: '', impurity: '', destination: '' });
  };

  // --- RENDERERS ---

  const renderCreateForm = () => (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold text-slate-800">Registrar Nueva Cosecha</h1>
              <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                  <X className="h-6 w-6" />
              </button>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Productor</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        value={createForm.producerName}
                        onChange={(e) => setCreateForm({...createForm, producerName: e.target.value})}
                      >
                          <option value="">Seleccione Productor...</option>
                          <option value="Juan Pérez">Juan Pérez</option>
                          <option value="Agro El Sol">Agro El Sol</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Finca / Lote</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        value={createForm.farmName}
                        onChange={(e) => setCreateForm({...createForm, farmName: e.target.value})}
                      >
                          <option value="">Seleccione...</option>
                          <option value="La Esperanza - Lote Norte">La Esperanza - Lote Norte</option>
                          <option value="Hato Grande - Lote 4">Hato Grande - Lote 4</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Ciclo</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        value={createForm.cycle}
                        onChange={(e) => setCreateForm({...createForm, cycle: e.target.value})}
                      >
                          <option value="Invierno 2025">Invierno 2025</option>
                          <option value="Verano 2025">Verano 2025</option>
                      </select>
                  </div>
                  <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Cultivo / Rubro</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ej. Arroz SD20A"
                        value={createForm.crop}
                        onChange={(e) => setCreateForm({...createForm, crop: e.target.value})}
                      />
                  </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                  <p>Al crear la cabecera de cosecha, podrá comenzar a registrar las <strong>Boletas de Pesaje</strong> individuales para cada camión recibido.</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button onClick={() => setViewMode('list')} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg mr-2">Cancelar</button>
                  <button onClick={handleCreateHarvest} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm flex items-center">
                      <Save className="h-5 w-5 mr-2" /> Crear Cosecha
                  </button>
              </div>
          </div>
      </div>
  );

  const renderGeneralTab = (h: Harvest) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider border-b pb-2">Información de Origen</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><label className="text-xs text-slate-500 font-bold uppercase">Productor</label><p className="font-medium text-emerald-700 cursor-pointer hover:underline" onClick={() => onNavigate('ops-producers')}>{h.producerName}</p></div>
                  <div><label className="text-xs text-slate-500 font-bold uppercase">Finca / Lote</label><p className="font-medium text-slate-800">{h.farmName}</p></div>
                  <div><label className="text-xs text-slate-500 font-bold uppercase">Ciclo</label><p className="font-medium text-slate-800">{h.cycle}</p></div>
                  <div><label className="text-xs text-slate-500 font-bold uppercase">Tipo Proyecto</label><span className={`px-2 py-0.5 rounded text-xs font-bold ${h.projectType === 'Semilla' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{h.projectType}</span></div>
                  <div><label className="text-xs text-slate-500 font-bold uppercase">Superficie Cosechada</label><p className="font-medium text-slate-800">{h.harvestedArea} ha</p></div>
                  <div><label className="text-xs text-slate-500 font-bold uppercase">Apoyo Asociado</label><p className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => onNavigate('financing')}>{h.creditId || 'N/A'}</p></div>
              </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-100 px-3 py-1 rounded-bl-lg text-xs font-bold text-slate-500">
                  Resumen Físico
              </div>
              <Scale className="h-12 w-12 text-slate-300 mb-4" />
              <h4 className="text-3xl font-bold text-slate-800">{h.kgHarvested.toLocaleString()} <span className="text-lg text-slate-500">kg</span></h4>
              <p className="text-sm text-slate-500 font-medium">Peso Neto Recibido</p>
              
              <div className="mt-6 w-full pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Rendimiento Calculado</p>
                  <p className="text-xl font-bold text-emerald-600">{h.yield?.toLocaleString(undefined, {maximumFractionDigits: 0})} kg/ha</p>
              </div>
          </div>
      </div>
  );

  const renderLoadsTab = (h: Harvest) => (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                  <h3 className="font-bold text-slate-700">Bitácora de Cargas</h3>
                  <p className="text-xs text-slate-500">{h.loads?.length || 0} Guías registradas • Total {h.kgHarvested.toLocaleString()} Kg</p>
              </div>
              <button onClick={() => setIsRegisteringLoad(true)} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-emerald-700 flex items-center shadow-sm">
                  <Plus className="h-3 w-3 mr-1" /> Registrar Guía
              </button>
          </div>
          
          {isRegisteringLoad && (
              <div className="p-4 bg-emerald-50 border-b border-emerald-100 grid grid-cols-1 md:grid-cols-6 gap-3 items-end animate-in slide-in-from-top-2">
                  <div><label className="text-xs font-bold text-emerald-800">Guía SUNAGRO/SIGAI</label><input type="text" className="w-full p-2 rounded border border-emerald-200 text-sm" placeholder="SUN-..." value={loadForm.guide} onChange={e => setLoadForm({...loadForm, guide: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-emerald-800">Peso Neto (Kg)</label><input type="number" className="w-full p-2 rounded border border-emerald-200 text-sm" placeholder="0" value={loadForm.kg} onChange={e => setLoadForm({...loadForm, kg: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-emerald-800">Destino</label><input type="text" className="w-full p-2 rounded border border-emerald-200 text-sm" placeholder="Silo/Planta" value={loadForm.destination} onChange={e => setLoadForm({...loadForm, destination: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-emerald-800">Humedad %</label><input type="number" className="w-full p-2 rounded border border-emerald-200 text-sm" placeholder="0" value={loadForm.moisture} onChange={e => setLoadForm({...loadForm, moisture: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-emerald-800">Impureza %</label><input type="number" className="w-full p-2 rounded border border-emerald-200 text-sm" placeholder="0" value={loadForm.impurity} onChange={e => setLoadForm({...loadForm, impurity: e.target.value})} /></div>
                  <div className="flex gap-2">
                       <button onClick={handleAddLoad} className="flex-1 bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700 flex justify-center"><Save className="h-4 w-4"/></button>
                       <button onClick={() => setIsRegisteringLoad(false)} className="bg-slate-300 text-slate-700 p-2 rounded hover:bg-slate-400"><X className="h-4 w-4"/></button>
                  </div>
              </div>
          )}

          <table className="w-full text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Guía Oficial</th>
                      <th className="px-4 py-3">Destino</th>
                      <th className="px-4 py-3 text-right">Kg Netos</th>
                      <th className="px-4 py-3 text-right">Humedad</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                  {h.loads?.map(load => (
                      <tr key={load.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">{load.date}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{load.guideNumber}</td>
                          <td className="px-4 py-3 text-slate-600">{load.destination || 'N/A'}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-700">{load.kg.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{load.moisture}%</td>
                          <td className="px-4 py-3 text-center">
                              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{load.status || 'Registrada'}</span>
                          </td>
                      </tr>
                  ))}
                  {(!h.loads || h.loads.length === 0) && (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">No hay cargas registradas</td></tr>
                  )}
              </tbody>
          </table>
      </div>
  );

  const renderFinanceTab = (h: Harvest) => (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
          <h3 className="font-bold text-slate-700 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-emerald-600" /> Cálculo Económico y Retenciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between h-40">
                  <div>
                      <p className="text-xs text-slate-500 font-bold uppercase mb-2">Ingreso Bruto</p>
                      <div className="flex justify-between text-sm mb-1">
                          <span>Total Kg:</span> <span className="font-mono">{h.kgHarvested.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span>Precio Unit:</span> <span className="font-mono">${h.unitPrice}</span>
                      </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-800 pt-2 border-t border-slate-200">
                      ${(h.grossAmount || h.totalAmount).toLocaleString()}
                  </div>
              </div>
              <div className="p-5 bg-red-50 rounded-xl border border-red-100 flex flex-col justify-between h-40">
                  <div>
                      <p className="text-xs text-red-500 font-bold uppercase mb-2">Retenciones</p>
                      <div className="flex justify-between text-sm mb-1">
                          <span className="text-red-800">Tipo Proyecto:</span> <span className="font-bold text-red-900">{h.projectType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-red-800">Tasa Aplicada:</span> <span className="font-bold text-red-900">{h.retentionPercent || 0}%</span>
                      </div>
                  </div>
                  <div className="text-2xl font-bold text-red-700 pt-2 border-t border-red-200">
                      -${(h.retentionAmount || 0).toLocaleString()}
                  </div>
              </div>
              <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-between h-40 shadow-inner">
                  <div>
                      <p className="text-xs text-emerald-600 font-bold uppercase mb-2">Neto Productor</p>
                      <p className="text-xs text-emerald-700 mb-1">Disponible para liquidar Apoyos</p>
                  </div>
                  <div className="text-3xl font-bold text-emerald-700 pt-2 border-t border-emerald-200">
                      ${h.totalAmount.toLocaleString()}
                  </div>
              </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-700 text-sm mb-3">Estado de Pago</h4>
              <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded text-sm font-bold uppercase ${h.paymentStatus === 'Total' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {h.paymentStatus || 'Pendiente'}
                  </div>
                  {h.paymentStatus === 'Parcial' && (
                      <div className="text-sm text-slate-600">
                          Pagado: <strong>$5,000</strong> • Pendiente: <strong>${(h.totalAmount - 5000).toLocaleString()}</strong>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );

  const renderSettlementTab = (h: Harvest) => (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center">
              <LayoutDashboard className="h-5 w-5 mr-2 text-blue-600" /> Aplicación a Apoyos (Liquidación)
          </h3>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <div className="flex justify-between items-center">
                  <span className="text-blue-800 font-medium">Monto Neto Disponible de Cosecha:</span>
                  <span className="text-xl font-bold text-blue-900">${h.totalAmount.toLocaleString()}</span>
              </div>
          </div>

          <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                      <tr>
                          <th className="p-3">Apoyo Vinculado</th>
                          <th className="p-3 text-right">Monto Aprobado</th>
                          <th className="p-3 text-right">Saldo Deudor</th>
                          <th className="p-3 text-right text-emerald-700">Abono Cosecha</th>
                          <th className="p-3 text-right">Nuevo Saldo</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      <tr>
                          <td className="p-3 font-bold text-slate-700">{h.creditId || 'CR-2025-001'} (Consumo)</td>
                          <td className="p-3 text-right text-slate-500">$10,000</td>
                          <td className="p-3 text-right font-medium text-red-600">$4,500</td>
                          <td className="p-3 text-right">
                              <input 
                                type="text" 
                                value={`$${h.totalAmount.toLocaleString()}`} 
                                className="w-24 text-right p-1 border border-emerald-300 rounded text-emerald-700 font-bold bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                readOnly
                              />
                          </td>
                          <td className="p-3 text-right font-bold text-slate-800">
                              {h.totalAmount >= 4500 ? '$0 (Liquidado)' : `$${(4500 - h.totalAmount).toLocaleString()}`}
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>

          {h.paymentStatus !== 'Total' ? (
              <div className="text-center pt-4">
                  <button 
                    onClick={() => handleLiquidate(h.id)}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-700 flex items-center justify-center mx-auto"
                  >
                      <ArrowRight className="h-5 w-5 mr-2" /> Confirmar Liquidación Automática
                  </button>
                  <p className="text-xs text-slate-400 mt-2">Esta acción cerrará el Apoyo si el saldo llega a cero.</p>
              </div>
          ) : (
              <div className="flex items-center justify-center p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 font-bold">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Apoyo Liquidado Exitosamente
              </div>
          )}
      </div>
  );

  const renderSeedTab = (h: Harvest) => (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
          <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-slate-700 flex items-center">
                  <Sprout className="h-5 w-5 mr-2 text-purple-600" /> Trazabilidad de Semilla
              </h3>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold uppercase border border-purple-200">
                  Categoría: {h.seedCategory}
              </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-2">Origen Genético</p>
                      <p className="text-sm mb-1"><strong>Lote Origen:</strong> SEM-2024-FUN-005</p>
                      <p className="text-sm"><strong>Variedad:</strong> {h.crop}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-2">Calidad (Laboratorio)</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white p-2 rounded border">
                              <p className="text-xs text-slate-400">Germinación</p>
                              <p className="font-bold text-slate-800">92%</p>
                          </div>
                          <div className="bg-white p-2 rounded border">
                              <p className="text-xs text-slate-400">Pureza</p>
                              <p className="font-bold text-slate-800">99%</p>
                          </div>
                          <div className="bg-white p-2 rounded border">
                              <p className="text-xs text-slate-400">Humedad</p>
                              <p className="font-bold text-slate-800">12%</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 flex flex-col justify-center">
                  <h4 className="font-bold text-purple-800 mb-2">Decisión de Calidad</h4>
                  <p className="text-sm text-purple-700 mb-4">El lote cumple con los parámetros para ser certificado como semilla {h.seedCategory}.</p>
                  
                  <div className="flex gap-2">
                      <button className="flex-1 bg-white text-slate-700 border border-slate-300 py-2 rounded text-xs font-bold hover:bg-slate-50">
                          Degradar a Consumo
                      </button>
                      <button className="flex-1 bg-purple-600 text-white py-2 rounded text-xs font-bold hover:bg-purple-700 shadow-sm">
                          Certificar Lote
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderVisitsTab = (h: Harvest) => (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 flex items-center">
                  <ClipboardCheck className="h-5 w-5 mr-2 text-slate-500" /> Visitas Técnicas Asociadas
              </h3>
          </div>
          <table className="w-full text-left text-sm">
              <thead className="bg-white text-slate-500 uppercase text-xs border-b border-slate-100">
                  <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Técnico</th>
                      <th className="px-4 py-3">Observación</th>
                      <th className="px-4 py-3 text-center">Acción</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">2025-10-15</td>
                      <td className="px-4 py-3 font-bold text-slate-700">Pre-Cosecha</td>
                      <td className="px-4 py-3 text-slate-600">Ing. Mendez</td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-xs">Humedad óptima, se autoriza inicio de cosecha.</td>
                      <td className="px-4 py-3 text-center">
                          <button className="text-emerald-600 text-xs font-bold hover:underline">Ver Informe</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
  );

  const renderHistoryTab = (h: Harvest) => (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center">
              <History className="h-5 w-5 mr-2 text-slate-500" /> Auditoría
          </h3>
          <div className="space-y-4">
              <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></div>
                      <div className="w-0.5 bg-slate-200 h-full mt-1"></div>
                  </div>
                  <div className="pb-4">
                      <p className="text-sm font-bold text-slate-800">Cosecha Registrada</p>
                      <p className="text-xs text-slate-500">2025-10-20 • Usuario: Logística</p>
                  </div>
              </div>
              <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div className="w-0.5 bg-slate-200 h-full mt-1"></div>
                  </div>
                  <div className="pb-4">
                      <p className="text-sm font-bold text-slate-800">Notificación a Finanzas (Pago Pendiente)</p>
                      <p className="text-xs text-slate-500">2025-10-20 • Sistema Automático</p>
                  </div>
              </div>
              {h.paymentStatus === 'Total' && (
                  <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5"></div>
                      </div>
                      <div>
                          <p className="text-sm font-bold text-slate-800">Liquidación y Cierre de Crédito</p>
                          <p className="text-xs text-slate-500">2025-10-22 • Usuario: Finanzas</p>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  // --- DETAIL VIEW ---
  if (viewMode === 'detail' && selectedHarvest) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                 <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <span className="cursor-pointer hover:text-emerald-700" onClick={() => onNavigate('dashboard')}>Finanzas</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="cursor-pointer hover:text-emerald-700" onClick={() => { setViewMode('list'); setSelectedHarvest(null); }}>Cosechas</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-800 font-bold">{selectedHarvest.producerName} ({selectedHarvest.id})</span>
                 </div>
                 <button onClick={() => { setViewMode('list'); setSelectedHarvest(null); }} className="px-3 py-1.5 border border-slate-300 bg-white rounded text-sm text-slate-700 font-medium hover:bg-slate-50">
                    Volver
                 </button>
             </div>

             <div className="bg-white border border-slate-200 rounded-lg shadow-sm min-h-[500px] flex flex-col">
                  {/* Tabs */}
                  <div className="border-b border-slate-200 overflow-x-auto">
                      <div className="flex min-w-max">
                          {[
                              { id: 'general', label: 'Datos Generales', icon: FileText },
                              { id: 'loads', label: 'Cargas y Guías', icon: Truck },
                              { id: 'finance', label: 'Cálculo Económico', icon: DollarSign },
                              { id: 'settlement', label: 'Liquidación', icon: LayoutDashboard },
                              ...(selectedHarvest.projectType === 'Semilla' ? [{ id: 'seed', label: 'Semilla', icon: Sprout }] : []),
                              { id: 'visits', label: 'Visitas', icon: ClipboardCheck },
                              { id: 'history', label: 'Historial', icon: History },
                          ].map(tab => (
                              <button
                                  key={tab.id}
                                  onClick={() => setActiveTab(tab.id as any)}
                                  className={`flex items-center px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                                      activeTab === tab.id 
                                      ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50' 
                                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                  }`}
                              >
                                  <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                                  {tab.label}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="p-6 bg-slate-50 flex-1">
                      {activeTab === 'general' && renderGeneralTab(selectedHarvest)}
                      {activeTab === 'loads' && renderLoadsTab(selectedHarvest)}
                      {activeTab === 'finance' && renderFinanceTab(selectedHarvest)}
                      {activeTab === 'settlement' && renderSettlementTab(selectedHarvest)}
                      {activeTab === 'seed' && renderSeedTab(selectedHarvest)}
                      {activeTab === 'visits' && renderVisitsTab(selectedHarvest)}
                      {activeTab === 'history' && renderHistoryTab(selectedHarvest)}
                  </div>
             </div>
        </div>
      );
  }

  // --- CREATE VIEW ---
  if (viewMode === 'create') {
      return renderCreateForm();
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Recepción de Cosechas</h1>
        <button 
            onClick={() => setViewMode('create')}
            className="bg-emerald-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-emerald-700 flex items-center"
        >
            <Plus className="h-4 w-4 mr-1" /> Nueva Cosecha
        </button>
      </div>

      <div className="bg-white p-4 rounded border border-slate-200 flex flex-col md:flex-row gap-4 shadow-sm">
         <div className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 flex items-center">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input 
                type="text" 
                className="flex-1 outline-none text-sm" 
                placeholder="Buscar por productor, finca, lote..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Productor / Lote</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Peso Neto (Kg)</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Rendimiento</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Valor Neto</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Estado Pago</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Apoyo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {harvests.filter(h => h.producerName.toLowerCase().includes(searchTerm.toLowerCase())).map((h) => (
              <tr key={h.id} onClick={() => { setSelectedHarvest(h); setViewMode('detail'); }} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                <td className="px-4 py-3 text-sm text-slate-600">{h.date}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">
                   {h.producerName}
                   <div className="text-xs text-slate-400">{h.farmName}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${h.projectType === 'Semilla' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {h.projectType}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700 text-right">{h.kgHarvested.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-600 text-right">{h.yield ? `${h.yield.toLocaleString()} kg/ha` : '-'}</td>
                <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">${h.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                   <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                     h.status === 'Pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                   }`}>
                     {h.status}
                   </span>
                </td>
                <td className="px-4 py-3 text-center">
                    {h.status === 'Pagado' ? (
                        <span className="text-emerald-500 text-xs font-bold flex items-center justify-center" title="Apoyo Liquidado">
                            <CheckCircle className="h-4 w-4" />
                        </span>
                    ) : (
                        <span className="text-slate-300 text-xs flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4" />
                        </span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesktopHarvests;
