
import React, { useState } from 'react';
import { 
  Delivery, DeliveryStatus, NavigationProps, DeliveryItem, 
  DeliveryProviderType, DeliveryOriginType, InputSource
} from '../types';
import { 
  Truck, Package, FileText, DollarSign, MapPin, Search, Plus, 
  ChevronRight, ArrowRight, CheckCircle, ShieldCheck, User, 
  ClipboardCheck, Building, Calendar, Filter, Image, Save, AlertTriangle, X,
  History, Scale, Briefcase, LayoutGrid, Clock
} from 'lucide-react';

const mockDeliveries: Delivery[] = [
  {
    id: 'd1', code: 'ORD-VIS-25-101-094', dateScheduled: '2025-10-27',
    producerId: '1', producerName: 'Juan Pérez', farmId: 'f1', farmName: 'La Esperanza',
    creditId: 'cr1', projectType: 'Consumo',
    originType: 'Visita', originId: 'v1',
    providerType: 'Aproscello', providerName: 'Almacén Central',
    status: 'Pendiente',
    totalAmount: 450,
    items: [
      { id: 'i1', product: 'Urea', quantity: 10, unit: 'sacos', unitCost: 45, totalCost: 450, origin: 'Aproscello', category: 'Fertilizante', isSeed: false, visitRecommendationId: 'r1' }
    ],
    logistics: { warehouseId: 'WH-Main', transportType: 'Flete' }
  },
  {
    id: 'd2', code: 'ORD-VIS-25-098-102', dateScheduled: '2025-10-26',
    producerId: '2', producerName: 'Agro El Sol', farmId: 'f2', farmName: 'Hato Grande',
    creditId: 'cr2', projectType: 'Semilla',
    originType: 'Manual',
    providerType: 'Alianza', providerName: 'AgroInsumos C.A.',
    status: 'Facturada',
    totalAmount: 1200,
    items: [
      { id: 'i2', product: 'Semilla SD20A', quantity: 20, unit: 'sacos', unitCost: 60, totalCost: 1200, origin: 'Alianza', category: 'Semilla', isSeed: true, seedCategory: 'Registrada' }
    ],
    invoice: { number: 'FAC-9921', date: '2025-10-26', amount: 1200, status: 'Registrada' }
  }
];

type DeliveryTab = 'general' | 'items' | 'finance' | 'provider' | 'field' | 'history';

const DesktopDeliveries: React.FC<NavigationProps> = ({ onNavigate }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [activeTab, setActiveTab] = useState<DeliveryTab>('general');
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: DeliveryStatus) => {
      switch (status) {
          case 'Pendiente': return 'bg-amber-100 text-amber-700 border-amber-200';
          case 'Entregada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'Facturada': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-slate-100 text-slate-600 border-slate-200';
      }
  };

  if (viewMode === 'detail' && selectedDelivery) {
    const tabs = [
        { id: 'general', label: 'General', icon: LayoutGrid },
        { id: 'items', label: 'Ítems', icon: Package },
        { id: 'finance', label: 'Finanzas', icon: DollarSign },
        { id: 'provider', label: 'Proveedor', icon: Building },
        { id: 'field', label: 'Campo', icon: MapPin },
        { id: 'history', label: 'Historial', icon: History },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Breadcrumbs matching image */}
            <div className="flex justify-between items-center text-sm mb-4">
                <div className="flex items-center space-x-2 text-slate-500">
                    <span className="hover:text-emerald-700 cursor-pointer">Operaciones</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="hover:text-emerald-700 cursor-pointer" onClick={() => { setSelectedDelivery(null); setViewMode('list'); }}>Entregas</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-800 font-bold">{selectedDelivery.code}</span>
                </div>
                <button onClick={() => { setSelectedDelivery(null); setViewMode('list'); }} className="px-4 py-1.5 border border-slate-200 bg-white rounded-md text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
                    Volver
                </button>
            </div>

            {/* Header Status Card matching screenshot */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-widest border ${getStatusColor(selectedDelivery.status)}`}>
                        {selectedDelivery.status}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-none">{selectedDelivery.producerName}</h1>
                        <p className="text-sm text-slate-400 mt-2 font-medium uppercase tracking-tighter">
                            Monto Total: <span className="text-emerald-600 font-black">${selectedDelivery.totalAmount}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Tabs Navigation */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col min-h-[500px]">
                <div className="border-b border-slate-200 flex px-2 overflow-x-auto bg-slate-50/30">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                                activeTab === tab.id 
                                ? 'border-emerald-600 text-emerald-700 bg-white' 
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 pb-2 border-b">Datos de Asignación</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Código Entrega</label>
                                        <p className="font-bold text-slate-800 text-sm">{selectedDelivery.code}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Fecha Programada</label>
                                        <p className="font-medium text-slate-800 text-sm">{selectedDelivery.dateScheduled}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Productor</label>
                                        <p className="font-bold text-emerald-600 text-sm hover:underline cursor-pointer">{selectedDelivery.producerName}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Finca / Lote</label>
                                        <p className="font-medium text-slate-800 text-sm">{selectedDelivery.farmName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 pb-2 border-b">Origen & Proyecto</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Tipo de Proyecto</label>
                                        <span className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{selectedDelivery.projectType}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Origen de Solicitud</label>
                                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                                            <ClipboardCheck className="h-4 w-4" /> 
                                            {selectedDelivery.originType} ({selectedDelivery.originId})
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Apoyo Financiero</label>
                                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                                            <DollarSign className="h-4 w-4 text-slate-400" />
                                            {selectedDelivery.creditId}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Items Tab */}
                    {activeTab === 'items' && (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b font-black text-slate-500 text-[10px] uppercase tracking-widest">
                                    <tr><th className="px-6 py-4">Producto</th><th className="px-6 py-4 text-right">Cantidad</th><th className="px-6 py-4 text-right">Unitario</th><th className="px-6 py-4 text-right">Subtotal</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedDelivery.items.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-bold text-slate-800">{item.product}</td>
                                            <td className="px-6 py-4 text-right font-mono">{item.quantity} {item.unit}</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-500">${item.unitCost}</td>
                                            <td className="px-6 py-4 text-right font-black text-slate-900">${item.totalCost}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50 font-black border-t-2 border-slate-200">
                                    <tr><td colSpan={3} className="px-6 py-4 text-right uppercase text-xs">Total de Insumos</td><td className="px-6 py-4 text-right text-emerald-700 text-lg">${selectedDelivery.totalAmount}</td></tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
          <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión de Entregas e Inventario</h1>
              <p className="text-sm text-slate-500 font-medium">Control de órdenes de despacho vinculadas a visitas y apoyos</p>
          </div>
          <button 
            onClick={() => setViewMode('create')}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
              <Plus className="h-5 w-5 mr-2" /> Generar Entrega Manual
          </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 shadow-sm">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center shadow-inner">
            <Search className="h-5 w-5 text-slate-400 mr-3" />
            <input 
                type="text" 
                placeholder="Buscar por código, productor o finca..." 
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
              <th className="p-5">Orden #</th>
              <th className="p-5">Productor / Finca</th>
              <th className="p-5">Origen Solicitud</th>
              <th className="p-5">Apoyo</th>
              <th className="p-5 text-center">Estado</th>
              <th className="p-5 text-right">Total</th>
              <th className="p-5 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deliveries.filter(d => d.producerName.toLowerCase().includes(searchTerm.toLowerCase())).map(d => (
              <tr key={d.id} onClick={() => { setSelectedDelivery(d); setViewMode('detail'); }} className="hover:bg-slate-50 cursor-pointer group transition-colors">
                <td className="p-5 font-bold text-emerald-800 font-mono text-xs">{d.code}</td>
                <td className="p-5">
                    <div className="font-bold text-slate-800">{d.producerName}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{d.farmName}</div>
                </td>
                <td className="p-5">
                    <div className="flex items-center gap-2">
                        {d.originType === 'Visita' ? <ClipboardCheck className="h-4 w-4 text-emerald-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                        <span className="font-bold text-slate-600">{d.originType} ({d.originId})</span>
                    </div>
                </td>
                <td className="p-5 text-slate-500 font-mono">
                    <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3" /> {d.creditId}
                    </div>
                </td>
                <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(d.status)}`}>
                        {d.status}
                    </span>
                </td>
                <td className="p-5 text-right font-black text-slate-700">${d.totalAmount.toLocaleString()}</td>
                <td className="p-5 text-center">
                    <button className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
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

export default DesktopDeliveries;
