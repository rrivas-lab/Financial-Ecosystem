
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  CheckCircle, AlertTriangle, Droplets, CloudSun, DollarSign, Activity, 
  Wallet, Info, Users, Tractor, Sprout, Map, Truck, ClipboardCheck,
  FileText, Briefcase, Zap, CheckSquare, Clock, MapPin
} from 'lucide-react';
import { NavigationProps } from '../types';

interface DashboardProps extends NavigationProps {
  currentView?: string;
}

// --- MOCK DATA ---
const dataApoyosCiclo = [
  { name: 'Inv. 2024', activo: 400, liquidado: 2400 },
  { name: 'Ver. 2024', activo: 300, liquidado: 1398 },
  { name: 'Inv. 2025', activo: 2000, liquidado: 500 },
  { name: 'Ver. 2025', activo: 100, liquidado: 0 },
];

const dataOcupacionFincas = [
  { name: 'Finca A', operativa: 100, ocupada: 90 },
  { name: 'Finca B', operativa: 50, ocupada: 55 }, // Over
  { name: 'Finca C', operativa: 200, ocupada: 120 },
  { name: 'Finca D', operativa: 80, ocupada: 80 },
];

const dataEntregasOrigen = [
  { name: 'Aproscello', value: 75 },
  { name: 'Alianzas', value: 25 },
];

const dataEntregasEstado = [
  { name: 'Pendiente', value: 15 },
  { name: 'En Tránsito', value: 10 },
  { name: 'Entregado', value: 75 },
];

const dataVisitasTecnico = [
  { name: 'Ing. Mendez', realizadas: 45, autorizadas: 30 },
  { name: 'Ing. Ruiz', realizadas: 38, autorizadas: 20 },
  { name: 'Tec. Gomez', realizadas: 52, autorizadas: 40 },
];

const dataSemillaCategorias = [
  { name: 'Genética', value: 5 },
  { name: 'Fundación', value: 15 },
  { name: 'Registrada', value: 45 },
  { name: 'Certificada', value: 120 },
];

const dataRutasCumplimiento = [
  { name: 'Sem 1', plan: 100, real: 95 },
  { name: 'Sem 2', plan: 120, real: 110 },
  { name: 'Sem 3', plan: 90, real: 90 },
  { name: 'Sem 4', plan: 110, real: 85 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// --- REUSABLE CARD COMPONENT ---
const KPICard = ({ title, value, subtext, icon: Icon, colorClass, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all active:scale-95 group cursor-pointer ${onClick ? '' : 'cursor-default'}`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
    {subtext && <div className="mt-3 text-xs text-slate-500">{subtext}</div>}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user, currentView }) => {
  const view = currentView || 'dashboard-general';

  // --- 1.1 DASHBOARD GENERAL ---
  if (view === 'dashboard-general') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold text-slate-800">Visión General</h1>
             <div className="flex items-center text-sm text-slate-500">
                 <CloudSun className="h-5 w-5 mr-2 text-yellow-500" /> 32°C • Turén, Portuguesa
             </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <KPICard title="Productores Activos" value="124" subtext="+5 este mes" icon={Users} colorClass="bg-blue-500 text-blue-600" onClick={() => onNavigate('producers')} />
           <KPICard title="Apoyos Activos" value="85" subtext="$1.2M Otorgados" icon={Wallet} colorClass="bg-emerald-500 text-emerald-600" onClick={() => onNavigate('financing')} />
           <KPICard title="Campos Semilla" value="18" subtext="450 ha inscritas" icon={Sprout} colorClass="bg-purple-500 text-purple-600" onClick={() => onNavigate('seeds')} />
           <KPICard title="Alertas Fitosanitarias" value="3" subtext="Requieren atención" icon={AlertTriangle} colorClass="bg-red-500 text-red-600" onClick={() => onNavigate('visits')} />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                 <div><p className="text-xs text-slate-500 uppercase font-bold">Diagnósticos IA</p><p className="text-xl font-bold">145</p></div>
                 <div className="h-8 w-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"><Zap className="h-4 w-4"/></div>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                 <div><p className="text-xs text-slate-500 uppercase font-bold">Rutas Hoy</p><p className="text-xl font-bold">8 / 12</p></div>
                 <div className="h-8 w-8 bg-amber-50 rounded-full flex items-center justify-center text-amber-600"><Map className="h-4 w-4"/></div>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                 <div><p className="text-xs text-slate-500 uppercase font-bold">Fincas Sobreocupadas</p><p className="text-xl font-bold text-red-600">4</p></div>
                 <div className="h-8 w-8 bg-red-50 rounded-full flex items-center justify-center text-red-600"><AlertTriangle className="h-4 w-4"/></div>
             </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-4">Evolución de Apoyos (Histórico)</h3>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataApoyosCiclo}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="activo" name="Activo" stackId="a" fill="#10b981" />
                      <Bar dataKey="liquidado" name="Liquidado" stackId="a" fill="#3b82f6" />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-4">Cumplimiento de Rutas (Semanal)</h3>
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataRutasCumplimiento}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="name" />
                       <YAxis />
                       <Tooltip />
                       <Legend />
                       <Line type="monotone" dataKey="plan" name="Planificado" stroke="#94a3b8" strokeDasharray="5 5" />
                       <Line type="monotone" dataKey="real" name="Ejecutado" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- 1.2 PRODUCTORES Y FINCAS ---
  if (view === 'dashboard-producers') {
      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h1 className="text-2xl font-bold text-slate-800">Productores y Fincas</h1>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard title="Productores" value="124" icon={Users} colorClass="bg-blue-500 text-blue-600" />
                <KPICard title="Fincas" value="142" icon={Map} colorClass="bg-emerald-500 text-emerald-600" />
                <KPICard title="Lotes" value="310" icon={Grid} colorClass="bg-amber-500 text-amber-600" />
                <KPICard title="Sin Geocerca" value="12" subtext="Pendiente Config" icon={AlertTriangle} colorClass="bg-red-500 text-red-600" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-700 mb-4">Ocupación de Fincas (Ha Operativa vs Ocupada)</h3>
                     <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataOcupacionFincas} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="operativa" name="Cap. Operativa" fill="#94a3b8" barSize={20} />
                                <Bar dataKey="ocupada" name="Ocupada" fill="#ef4444" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                 </div>

                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-700 mb-4">Alertas de Sobreocupación</h3>
                     <table className="w-full text-sm text-left">
                         <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                             <tr>
                                 <th className="p-2">Finca</th>
                                 <th className="p-2">Capacidad</th>
                                 <th className="p-2">Uso</th>
                                 <th className="p-2 text-right">Exceso</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             <tr>
                                 <td className="p-2 font-medium">Finca B</td>
                                 <td className="p-2">50 ha</td>
                                 <td className="p-2 text-red-600 font-bold">55 ha</td>
                                 <td className="p-2 text-right text-red-600">+5 ha</td>
                             </tr>
                             <tr>
                                 <td className="p-2 font-medium">Hato Viejo</td>
                                 <td className="p-2">120 ha</td>
                                 <td className="p-2 text-red-600 font-bold">130 ha</td>
                                 <td className="p-2 text-right text-red-600">+10 ha</td>
                             </tr>
                         </tbody>
                     </table>
                 </div>
             </div>
          </div>
      );
  }

  // --- 1.3 APOYOS Y GIROS ---
  if (view === 'dashboard-financial') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-slate-800">Apoyos y Giros</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard title="Presupuesto Otorgado" value="$1.2M" icon={DollarSign} colorClass="bg-emerald-500 text-emerald-600" />
                <KPICard title="Ejecución" value="68%" icon={Activity} colorClass="bg-blue-500 text-blue-600" />
                <KPICard title="Gastos Adm." value="$45K" icon={FileText} colorClass="bg-slate-500 text-slate-600" />
                <KPICard title="Inversión Semilla" value="$320K" subtext="26% del total" icon={Sprout} colorClass="bg-purple-500 text-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-4">Distribución por Tipo de Apoyo</h3>
                    <div className="h-64 flex justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                  data={[
                                      { name: 'Arroz Consumo', value: 60 },
                                      { name: 'Arroz Semilla', value: 25 },
                                      { name: 'Maíz', value: 15 }
                                  ]}
                                  innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}
                                >
                                    {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                         </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-4">Relación Visita-Giro</h3>
                    <div className="p-4 bg-emerald-50 rounded-lg flex items-center justify-between mb-4 border border-emerald-100">
                        <div>
                            <p className="text-sm font-bold text-emerald-800">Impacto Técnico</p>
                            <p className="text-xs text-emerald-600">Giros generados desde Visita</p>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700">82%</p>
                    </div>
                    <p className="text-sm text-slate-500">
                        El 82% de los desembolsos de insumos fueron precedidos por una visita técnica con diagnóstico y receta digital.
                    </p>
                </div>
            </div>
        </div>
      );
  }

  // --- 1.4 ENTREGAS Y LOGÍSTICA ---
  if (view === 'dashboard-logistics') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h1 className="text-2xl font-bold text-slate-800">Entregas y Logística</h1>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard title="Entregas Completadas" value="92%" icon={CheckCircle} colorClass="bg-emerald-500 text-emerald-600" />
                <KPICard title="Origen: Alianzas" value="25%" icon={Briefcase} colorClass="bg-purple-500 text-purple-600" />
                <KPICard title="Origen: Visita" value="82%" icon={ClipboardCheck} colorClass="bg-blue-500 text-blue-600" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-4">Estado de Entregas</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dataEntregasEstado} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                                    <Cell fill="#fbbf24" /> {/* Pendiente */}
                                    <Cell fill="#3b82f6" /> {/* Transito */}
                                    <Cell fill="#10b981" /> {/* Entregado */}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-4">Origen del Insumo</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataEntregasOrigen} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
             </div>
        </div>
      );
  }

  // --- 1.5 VISITAS TÉCNICAS ---
  if (view === 'dashboard-visits') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h1 className="text-2xl font-bold text-slate-800">Desempeño Técnico</h1>
             
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <KPICard title="Total Visitas" value="342" icon={Map} colorClass="bg-blue-500 text-blue-600" />
                 <KPICard title="Con Diagnóstico IA" value="45%" icon={Zap} colorClass="bg-amber-500 text-amber-600" />
                 <KPICard title="Generaron Receta" value="78%" icon={FileText} colorClass="bg-emerald-500 text-emerald-600" />
                 <KPICard title="Visitas Remotas" value="12%" icon={PhoneIcon} colorClass="bg-purple-500 text-purple-600" />
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-700 mb-4">Efectividad por Técnico (Visitas vs Autorizaciones)</h3>
                 <div className="h-72">
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={dataVisitasTecnico}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                             <XAxis dataKey="name" />
                             <YAxis />
                             <Tooltip />
                             <Legend />
                             <Bar dataKey="realizadas" name="Visitas Realizadas" fill="#94a3b8" />
                             <Bar dataKey="autorizadas" name="Autorizó Insumos" fill="#10b981" />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
             </div>
        </div>
      );
  }

  // --- 1.6 COSECHAS Y RESULTADOS ---
  if (view === 'dashboard-harvests') {
      return (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h1 className="text-2xl font-bold text-slate-800">Cosechas y Resultados</h1>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <KPICard title="Apoyos Liquidados" value="65%" subtext="Por Cosecha" icon={CheckCircle} colorClass="bg-emerald-500 text-emerald-600" />
                 <KPICard title="Rendimiento Global" value="5.2 t/ha" icon={Activity} colorClass="bg-blue-500 text-blue-600" />
                 <KPICard title="Retención Semilla" value="$125K" icon={Sprout} colorClass="bg-purple-500 text-purple-600" />
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-700 mb-4">Relación Cosecha vs Deuda (Top 5 Fincas)</h3>
                 <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="deuda" name="Deuda ($)" unit="$" />
                            <YAxis type="number" dataKey="cosecha" name="Valor Cosecha ($)" unit="$" />
                            <ZAxis type="number" dataKey="rendimiento" range={[60, 400]} name="Rendimiento (t/ha)" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            <Scatter name="Fincas" data={[
                                { deuda: 10000, cosecha: 15000, rendimiento: 5.5 },
                                { deuda: 12000, cosecha: 11000, rendimiento: 4.2 }, // Under
                                { deuda: 8000, cosecha: 14000, rendimiento: 6.0 },
                                { deuda: 15000, cosecha: 20000, rendimiento: 5.8 },
                                { deuda: 5000, cosecha: 6000, rendimiento: 5.0 },
                            ]} fill="#8884d8" />
                          </ScatterChart>
                      </ResponsiveContainer>
                 </div>
                 <p className="text-xs text-slate-500 mt-2 text-center">Eje X: Deuda Pendiente | Eje Y: Valor Cosecha Entregada | Tamaño: Rendimiento</p>
             </div>
         </div>
      );
  }

  // --- 1.7 SEMILLAS Y CALIDAD ---
  if (view === 'dashboard-seeds') {
      return (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-slate-800">Semillas y Calidad (CONASEM)</h1>
                 <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">
                     Ciclo Activo: Invierno 2025
                 </span>
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <KPICard title="Campos Inscritos" value="28" icon={FileText} colorClass="bg-blue-500 text-blue-600" />
                 <KPICard title="Lotes en Análisis" value="12" icon={Activity} colorClass="bg-amber-500 text-amber-600" />
                 <KPICard title="Certificados" value="85%" subtext="Tasa de Aprobación" icon={CheckSquare} colorClass="bg-emerald-500 text-emerald-600" />
                 <KPICard title="Degradados" value="3" subtext="A Consumo" icon={AlertTriangle} colorClass="bg-red-500 text-red-600" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-700 mb-4">Lotes por Categoría</h3>
                     <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={dataSemillaCategorias}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                 <XAxis dataKey="name" />
                                 <YAxis />
                                 <Tooltip />
                                 <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                 </div>

                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-700 mb-4">Cadena de Certificación</h3>
                     <div className="space-y-4">
                         <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-slate-600">Inspección Campo</span>
                             <div className="flex-1 mx-4 bg-slate-100 h-2 rounded-full overflow-hidden">
                                 <div className="bg-emerald-500 h-full" style={{ width: '100%' }}></div>
                             </div>
                             <span className="text-sm font-bold text-slate-800">28/28</span>
                         </div>
                         <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-slate-600">Análisis Interno</span>
                             <div className="flex-1 mx-4 bg-slate-100 h-2 rounded-full overflow-hidden">
                                 <div className="bg-blue-500 h-full" style={{ width: '80%' }}></div>
                             </div>
                             <span className="text-sm font-bold text-slate-800">22/28</span>
                         </div>
                         <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-slate-600">Muestreo Oficial</span>
                             <div className="flex-1 mx-4 bg-slate-100 h-2 rounded-full overflow-hidden">
                                 <div className="bg-purple-500 h-full" style={{ width: '40%' }}></div>
                             </div>
                             <span className="text-sm font-bold text-slate-800">11/28</span>
                         </div>
                         <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-slate-600">Etiquetado Final</span>
                             <div className="flex-1 mx-4 bg-slate-100 h-2 rounded-full overflow-hidden">
                                 <div className="bg-amber-500 h-full" style={{ width: '10%' }}></div>
                             </div>
                             <span className="text-sm font-bold text-slate-800">3/28</span>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      );
  }

  // --- 1.8 RUTAS Y DESEMPEÑO ---
  if (view === 'dashboard-routes') {
      return (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h1 className="text-2xl font-bold text-slate-800">Rutas y Productividad</h1>

             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <KPICard title="Rutas Completadas" value="95%" icon={CheckCircle} colorClass="bg-emerald-500 text-emerald-600" />
                 <KPICard title="Visitas / Ruta" value="4.2" icon={Map} colorClass="bg-blue-500 text-blue-600" />
                 <KPICard title="Inicio en Geocerca" value="88%" icon={MapPin} colorClass="bg-purple-500 text-purple-600" />
                 <KPICard title="Tiempo en Finca" value="45m" subtext="Promedio" icon={Clock} colorClass="bg-slate-500 text-slate-600" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-700 mb-4">Eficiencia de Rutas (Plan vs Real)</h3>
                     <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={dataRutasCumplimiento}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                 <XAxis dataKey="name" />
                                 <YAxis />
                                 <Tooltip />
                                 <Legend />
                                 <Bar dataKey="plan" name="Km Planificados" fill="#94a3b8" />
                                 <Bar dataKey="real" name="Km Reales" fill="#3b82f6" />
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                 </div>

                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-700 mb-4">Distribución del Tiempo Técnico</h3>
                     <div className="h-64 flex justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                 <Pie 
                                   data={[
                                       { name: 'En Finca (Valor)', value: 55 },
                                       { name: 'En Tránsito', value: 30 },
                                       { name: 'Administrativo', value: 15 }
                                   ]}
                                   innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}
                                 >
                                     <Cell fill="#10b981" /> 
                                     <Cell fill="#f59e0b" />
                                     <Cell fill="#94a3b8" />
                                 </Pie>
                                 <Tooltip />
                                 <Legend />
                             </PieChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </div>
         </div>
      );
  }

  // Fallback
  return <div>Dashboard no encontrado: {view}</div>;
};

// Helper Icon for Remote Visits (Phone)
const PhoneIcon = (props: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

// Helper Icon for Grid
const Grid = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
);

export default Dashboard;
