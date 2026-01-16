import React, { useState } from 'react';
import { 
  Menu, 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  Sprout, 
  LogOut,
  Tractor,
  Activity,
  UserCircle,
  Plus,
  Camera,
  X,
  Stethoscope
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string, params?: any) => void;
  user?: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Desktop Navigation - The "Odoo" Experience
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'activities', label: 'Actividades', icon: Activity },
    { id: 'visits', label: 'Visitas Técnicas', icon: ClipboardCheck },
    { id: 'producers', label: 'Productores', icon: Users },
    { id: 'seeds', label: 'Semillas / CONASEM', icon: Sprout },
    { id: 'profile', label: 'Mi Perfil', icon: UserCircle },
  ];

  // Mobile Bottom Navigation - The "Field App" Experience
  const mobileNavItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'activities', label: 'Registro', icon: Activity },
    { id: 'visits', label: 'Diagnóstico', icon: ClipboardCheck }, // Maps to visits/diagnosis
    { id: 'profile', label: 'Perfil', icon: UserCircle },
  ];

  const handleFabAction = (action: string) => {
    setIsFabOpen(false);
    switch (action) {
      case 'activity':
        onNavigate('activities', { mode: 'create' });
        break;
      case 'photo':
        // Mock camera action
        alert('Cámara activada para nota rápida');
        break;
      case 'diagnosis':
        onNavigate('visits', { mode: 'diagnosis' });
        break;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar (Odoo Module Style) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } hidden lg:block`}
      >
        <div className="flex items-center justify-center h-16 border-b border-slate-800 bg-slate-950">
          <Tractor className="h-8 w-8 text-emerald-500 mr-2" />
          <span className="text-xl font-bold tracking-wider">APROSCELLO</span>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeView === item.id 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
           <div className="px-4 py-2 mb-2 text-xs text-slate-500">
             Usuario: {user?.name || 'Invitado'}
           </div>
          <button 
            onClick={() => onNavigate('logout')}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors hover:bg-red-900/30 rounded-lg"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-sm lg:flex">
          <div className="flex items-center lg:hidden">
            <Tractor className="h-6 w-6 text-emerald-600 mr-2" />
            <span className="font-bold text-slate-800">APROSCELLO</span>
          </div>
          
          <div className="flex items-center space-x-4 ml-auto">
            <span className="text-sm text-slate-500 hidden sm:block">Ciclo: Invierno 2025</span>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'JP'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 pb-24 lg:pb-6 lg:p-6">
          {children}
        </main>

        {/* Global FAB (Mobile Only) */}
        <div className="lg:hidden fixed bottom-20 right-4 z-50 flex flex-col items-end space-y-3">
          {isFabOpen && (
            <>
              <div className="flex items-center space-x-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <span className="bg-white px-2 py-1 rounded shadow text-xs font-medium text-slate-600">Diagnóstico IA</span>
                <button 
                  onClick={() => handleFabAction('diagnosis')}
                  className="h-12 w-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700"
                >
                  <Stethoscope className="h-6 w-6" />
                </button>
              </div>
              <div className="flex items-center space-x-2 animate-in slide-in-from-bottom-2 fade-in duration-200 delay-75">
                <span className="bg-white px-2 py-1 rounded shadow text-xs font-medium text-slate-600">Tomar Foto</span>
                <button 
                  onClick={() => handleFabAction('photo')}
                  className="h-12 w-12 bg-amber-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-amber-600"
                >
                  <Camera className="h-6 w-6" />
                </button>
              </div>
              <div className="flex items-center space-x-2 animate-in slide-in-from-bottom-2 fade-in duration-200 delay-100">
                <span className="bg-white px-2 py-1 rounded shadow text-xs font-medium text-slate-600">Registrar Actividad</span>
                <button 
                  onClick={() => handleFabAction('activity')}
                  className="h-12 w-12 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700"
                >
                  <Activity className="h-6 w-6" />
                </button>
              </div>
            </>
          )}
          
          <button 
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
              isFabOpen ? 'bg-slate-800 text-white rotate-45' : 'bg-emerald-600 text-white'
            }`}
          >
            <Plus className="h-8 w-8" />
          </button>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          {mobileNavItems.map((item) => (
             <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                activeView === item.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className={`h-6 w-6 ${activeView === item.id ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layout;