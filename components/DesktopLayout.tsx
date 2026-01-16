
import React, { useState, useMemo } from 'react';
import { 
  Users, ClipboardCheck, Sprout, LogOut, Tractor, Activity, DollarSign, Truck, FileText, Settings, ChevronDown, Bell, User as UserIcon, Map, Calendar, Layers, Briefcase, BarChart2, CheckSquare, Building, Package as PackageIcon, Menu, Book, List, Compass, X, AlertCircle, FileSearch, CheckCircle, FileCheck, Grid
} from 'lucide-react';
import { User } from '../types';
import { useProducers } from '../context/ProducerContext';
import { useApplications } from '../context/ApplicationContext';

interface DesktopLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string, params?: any) => void;
  user?: User | null;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, activeView, onNavigate, user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const { producers } = useProducers();
  const { applications } = useApplications();

  // Calcular alertas dinámicamente basadas en productores pendientes y docs en revisión
  const alerts = useMemo(() => {
    const pendingProducers = producers.filter(p => p.status === 'Pendiente');
    const docsInReview = producers.reduce((acc, p) => {
      const inReviewCount = (p.documents || []).filter(d => d.status === 'En_Revision').length;
      return acc + (inReviewCount > 0 ? 1 : 0);
    }, 0);
    const pendingApps = applications.filter(a => a.status === 'Solicitud').length;

    return {
      pendingProducersCount: pendingProducers.length,
      docsInReviewCount: docsInReview,
      pendingAppsCount: pendingApps,
      totalAlerts: pendingProducers.length + docsInReview + pendingApps
    };
  }, [producers, applications]);

  const menuStructure = [
    {
      label: 'Configuración',
      items: [
        { id: 'config-patterns', label: 'Patrones de Apoyo', icon: Settings },
      ]
    },
    {
      label: 'Maestros',
      items: [
        { 
          id: 'ops-producers', 
          label: 'Productores', 
          icon: Users, 
          badge: alerts.pendingProducersCount > 0 ? alerts.pendingProducersCount : null,
          badgeColor: 'bg-amber-500'
        },
        { id: 'ops-farms', label: 'Fincas y Lotes', icon: Map },
        { id: 'masters-crops', label: 'Cultivos y Rubros', icon: Sprout },
        { id: 'masters-inputs', label: 'Insumos', icon: PackageIcon },
        { id: 'masters-partners', label: 'Agroindustrias', icon: Building },
        { id: 'masters-techs', label: 'Técnicos', icon: UserIcon },
        { id: 'masters-committee', label: 'Comité de Crédito', icon: CheckSquare },
        { id: 'masters-docs', label: 'Documentos (Recaudos)', icon: Book },
        { id: 'masters-stages', label: 'Etapas de Apoyo', icon: List },
      ]
    },
    {
      label: 'Gestión de Apoyo',
      items: [
        { 
          id: 'ops-applications', 
          label: 'Solicitudes (Flujo)', 
          icon: FileText,
          badge: alerts.pendingAppsCount > 0 ? alerts.pendingAppsCount : null,
          badgeColor: 'bg-red-500'
        },
        { id: 'financing', label: 'Cartera de Créditos', icon: DollarSign },
      ]
    },
    {
      label: 'Operaciones de Campo',
      items: [
        { id: 'ops-route-planning', label: 'Planificación de Rutas', icon: Compass },
        { id: 'ops-visits', label: 'Visitas Técnicas', icon: ClipboardCheck },
        { id: 'ops-deliveries', label: 'Entregas e Inventario', icon: Truck },
        { id: 'harvests', label: 'Recepción Cosecha', icon: Layers },
      ]
    },
    {
      label: 'Semillas',
      items: [
        { id: 'seeds', label: 'Programa CONASEM', icon: Sprout },
      ]
    },
    {
      label: 'Reportes',
      items: [
        { id: 'dataviz', label: 'Informes y Estadísticas', icon: BarChart2 },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <nav className="bg-slate-900 text-slate-100 shadow-md border-b border-slate-700 z-50 flex-shrink-0">
        <div className="max-w-full px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-2">
              <button className="md:hidden p-2 text-slate-300 hover:text-white rounded-md hover:bg-slate-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center font-bold text-lg md:text-xl tracking-tight mr-2 md:mr-6 text-white cursor-pointer select-none" onClick={() => onNavigate('dashboard-general')}>
                <Tractor className="h-6 w-6 mr-2 text-emerald-500" />
                <span className="hidden xs:inline">APROSCELLO</span>
              </div>
              <div className="hidden md:flex space-x-1">
                {menuStructure.map((group, idx) => {
                  const hasGroupAlert = group.items.some(i => i.badge);
                  return (
                    <div key={idx} className="relative group h-14 flex items-center">
                      <button className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center transition-colors group-hover:text-white group-hover:bg-slate-800 relative">
                        {group.label}
                        {hasGroupAlert && (
                          <span className="absolute top-2 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                        <ChevronDown className="ml-1 h-3 w-3 opacity-70 group-hover:rotate-180 transition-transform" />
                      </button>
                      <div className="absolute left-0 top-full pt-0 w-64 hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                        <div className="h-1 w-full bg-transparent"></div>
                        <div className="rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                          <div className="py-1">
                            {group.items.map((item) => (
                              <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors border-l-4 ${activeView === item.id ? 'border-emerald-600 text-emerald-700 bg-emerald-50 font-medium' : 'border-transparent text-slate-700'}`}>
                                <div className="flex items-center">
                                  <item.icon className={`h-4 w-4 mr-3 ${activeView === item.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                                  {item.label}
                                </div>
                                {item.badge && (
                                  <span className={`${item.badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}>
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="relative">
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`p-2 rounded-md transition-colors relative ${isNotifOpen ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <Bell className="h-5 w-5" />
                  {alerts.totalAlerts > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
                  )}
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-[100] animate-in fade-in zoom-in-95">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="font-bold text-sm">Notificaciones Centralizadas</h4>
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{alerts.totalAlerts} Acción Requerida</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {alerts.pendingProducersCount > 0 && (
                        <div className="p-4 hover:bg-slate-50 cursor-pointer flex gap-3 border-b border-slate-50" onClick={() => { onNavigate('ops-producers'); setIsNotifOpen(false); }}>
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg h-fit"><AlertCircle className="h-5 w-5"/></div>
                          <div><p className="text-sm font-bold">Validar Productores</p><p className="text-xs text-slate-500">Hay {alerts.pendingProducersCount} nuevos registros de WhatsApp.</p></div>
                        </div>
                      )}
                      {alerts.pendingAppsCount > 0 && (
                        <div className="p-4 hover:bg-slate-50 cursor-pointer flex gap-3 border-b border-slate-50" onClick={() => { onNavigate('ops-applications'); setIsNotifOpen(false); }}>
                          <div className="p-2 bg-red-100 text-red-600 rounded-lg h-fit"><FileSearch className="h-5 w-5"/></div>
                          <div><p className="text-sm font-bold">Solicitudes Nuevas</p><p className="text-xs text-slate-500">Hay {alerts.pendingAppsCount} solicitudes esperando revisión.</p></div>
                        </div>
                      )}
                      {alerts.docsInReviewCount > 0 && (
                        <div className="p-4 hover:bg-slate-50 cursor-pointer flex gap-3 border-b border-slate-50" onClick={() => { onNavigate('ops-producers', { tab: 'docs' }); setIsNotifOpen(false); }}>
                          {/* Fixed FileCheck icon reference */}
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg h-fit"><FileCheck className="h-5 w-5"/></div>
                          <div><p className="text-sm font-bold">Recaudos en Revisión</p><p className="text-xs text-slate-500">Productores cargaron documentos vía WhatsApp.</p></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => onNavigate('selector')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors flex items-center gap-2">
                {/* Fixed Grid icon reference */}
                <Grid className="h-5 w-5" /><span className="text-xs font-medium hidden sm:inline">Apps</span>
              </button>
              <div className="flex items-center pl-2 md:pl-4 border-l border-slate-700 ml-1 md:ml-2">
                <div className="text-right mr-3 hidden sm:block">
                  <p className="text-sm font-medium text-white leading-none">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{user?.role === 'coordinador' ? 'Coordinador' : 'Analista'}</p>
                </div>
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs md:text-sm border-2 border-slate-800">
                    {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 overflow-auto bg-slate-100 p-4 md:p-6 relative">
        {children}
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-200 pointer-events-none opacity-70 hover:opacity-100 transition-opacity hidden md:flex">
            <span className="text-[10px] text-slate-500 font-semibold">Odoo Backend v2.3</span>
            <span className="text-sm font-bold text-emerald-600">Aproscello</span>
        </div>
      </main>
    </div>
  );
};

export default DesktopLayout;
