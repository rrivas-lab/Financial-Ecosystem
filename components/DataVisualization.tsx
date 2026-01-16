import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { ChevronLeft, TrendingUp, Droplets, DollarSign, Activity, Home } from 'lucide-react';
import { NavigationProps } from '../types';

const DataVisualization: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const [activeTab, setActiveTab] = useState<'roi' | 'water' | 'costs' | 'efficiency'>(params?.tab || 'roi');

  // Mock Data
  const roiData = [
    { name: 'Lote A1', inv: 1200, ret: 2400, net: 1200 },
    { name: 'Lote B2', inv: 1500, ret: 2800, net: 1300 },
    { name: 'Lote C3', inv: 900, ret: 1600, net: 700 },
    { name: 'Lote D4', inv: 2000, ret: 3800, net: 1800 },
  ];

  const waterData = [
    { name: 'Sem 1', consumo: 400 },
    { name: 'Sem 2', consumo: 300 },
    { name: 'Sem 3', consumo: 550 },
    { name: 'Sem 4', consumo: 450 },
    { name: 'Sem 5', consumo: 600 },
  ];

  const costsData = [
    { name: 'Fertilizantes', value: 4500 },
    { name: 'Agroquímicos', value: 3200 },
    { name: 'Semilla', value: 2100 },
    { name: 'Mano de Obra', value: 1800 },
    { name: 'Maquinaria', value: 1200 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="pb-20 lg:pb-0 space-y-6 p-4">
       <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <ChevronLeft className="h-6 w-6 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Métricas y Rendimiento</h1>
                    <p className="text-sm text-slate-500">Análisis detallado de producción</p>
                </div>
            </div>
            <button onClick={() => onNavigate('selector')} className="p-2 bg-slate-800 rounded-full text-slate-400">
                <Home className="h-5 w-5" />
            </button>
       </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
            { id: 'roi', label: 'ROI / Rendimiento', icon: TrendingUp },
            { id: 'water', label: 'Consumo Agua', icon: Droplets },
            { id: 'costs', label: 'Costos', icon: DollarSign },
            { id: 'efficiency', label: 'Eficiencia', icon: Activity }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
            </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
         {activeTab === 'roi' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Retorno de Inversión por Lote</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="inv" name="Inversión ($)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="ret" name="Retorno ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                        <p className="text-sm text-emerald-700 font-medium">Lote más rentable</p>
                        <p className="text-xl font-bold text-emerald-900">Lote D4 (+$1800)</p>
                    </div>
                     <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">Menor margen</p>
                        <p className="text-xl font-bold text-red-900">Lote C3 (+$700)</p>
                    </div>
                </div>
             </div>
         )}

         {activeTab === 'water' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Consumo Hídrico (m³/ha)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={waterData}>
                        <defs>
                            <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <Tooltip />
                        <Area type="monotone" dataKey="consumo" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
             </div>
         )}

         {activeTab === 'costs' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Desglose de Costos Operativos</h3>
                <div className="flex flex-col md:flex-row items-center">
                    <div className="h-80 w-full md:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={costsData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                            {costsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 space-y-3">
                        {costsData.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 border-b border-slate-100">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                                    <span className="text-slate-600 text-sm">{item.name}</span>
                                </div>
                                <span className="font-bold text-slate-800">${item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
         )}
      </div>
    </div>
  );
};

export default DataVisualization;