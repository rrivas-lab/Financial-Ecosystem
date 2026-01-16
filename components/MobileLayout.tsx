
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  UserCircle,
  Plus,
  Stethoscope,
  Map,
  Briefcase,
  FileText
} from 'lucide-react';
import { User } from '../types';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string, params?: any) => void;
  user?: User | null;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isFabOpen, setIsFabOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard }, 
    { id: 'portfolio', label: 'Cartera', icon: Briefcase },
    { id: 'route-execution', label: 'Ruta', icon: Map },
    { id: 'profile', label: 'Perfil', icon: UserCircle },
  ];

  const handleFabAction = (action: string) => {
    setIsFabOpen(false);
    switch (action) {
      case 'activity':
        onNavigate('activities', { mode: 'create' });
        break;
      case 'diagnosis':
        onNavigate('diagnosis');
        break;
      case 'route':
        onNavigate('route-planner');
        break;
      case 'register':
        onNavigate('mobile-registration');
        break;
    }
  };

  return (
    // Outer Desktop Wrapper - Background strictly dark
    <div className="fixed inset-0 bg-[#020617] flex justify-center items-center overflow-hidden">
      
      {/* Mobile App Frame Container (Borderless and scrollbar-free) */}
      <div className="w-full max-w-md h-full bg-slate-900 text-slate-100 font-sans relative shadow-2xl flex flex-col overflow-hidden">
        
        {/* Mobile Content Area - Fixed height to avoid overflow leaks */}
        <main className="flex-1 overflow-y-auto pb-20 relative scrollbar-hide">
          {children}
        </main>

        {/* Global FAB - Positioned Absolute relative to the Frame */}
        <div className="absolute bottom-20 right-4 z-50 flex flex-col items-end space-y-3 pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-end space-y-3">
            {isFabOpen && (
              <>
                 <div className="flex items-center space-x-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <span className="bg-slate-800 px-2 py-1 rounded shadow text-[10px] font-bold uppercase text-slate-200 border border-slate-700">Nuevo Maestro</span>
                  <button 
                    onClick={() => handleFabAction('register')}
                    className="h-12 w-12 bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-amber-500"
                  >
                    <FileText className="h-6 w-6" />
                  </button>
                </div>
                 <div className="flex items-center space-x-2 animate-in slide-in-from-bottom-2 fade-in duration-200 delay-75">
                  <span className="bg-slate-800 px-2 py-1 rounded shadow text-[10px] font-bold uppercase text-slate-200 border border-slate-700">Planificar Ruta</span>
                  <button 
                    onClick={() => handleFabAction('route')}
                    className="h-12 w-12 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-500"
                  >
                    <Map className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 animate-in slide-in-from-bottom-2 fade-in duration-200 delay-100">
                  <span className="bg-slate-800 px-2 py-1 rounded shadow text-[10px] font-bold uppercase text-slate-200 border border-slate-700">Diagnóstico IA</span>
                  <button 
                    onClick={() => handleFabAction('diagnosis')}
                    className="h-12 w-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-500"
                  >
                    <Stethoscope className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 animate-in slide-in-from-bottom-2 fade-in duration-200 delay-150">
                  <span className="bg-slate-800 px-2 py-1 rounded shadow text-[10px] font-bold uppercase text-slate-200 border border-slate-700">Registrar Actividad</span>
                  <button 
                    onClick={() => handleFabAction('activity')}
                    className="h-12 w-12 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-500"
                  >
                    <Activity className="h-6 w-6" />
                  </button>
                </div>
              </>
            )}
            
            <button 
              onClick={() => setIsFabOpen(!isFabOpen)}
              className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 border border-slate-700 ${
                isFabOpen ? 'bg-slate-700 text-white rotate-45' : 'bg-emerald-500 text-white'
              }`}
            >
              <Plus className="h-8 w-8" />
            </button>
          </div>
        </div>

        {/* Bottom Navigation - Positioned Absolute relative to the Frame */}
        <nav className="absolute bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 flex justify-around items-center h-16 z-40">
          {navItems.map((item) => (
              <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                activeView === item.id ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <item.icon className={`h-6 w-6 ${activeView === item.id ? 'fill-current opacity-20' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileLayout;
