import React from 'react';
import { TechnicianProfile, NavigationProps } from '../types';
import { User, Map, Mail, Phone, Calendar, ClipboardList, CheckCircle, BarChart2, LogOut, Settings, PenTool, Home, ChevronLeft } from 'lucide-react';

const mockProfile: TechnicianProfile = {
  id: 't1',
  name: 'Ing. Juan Pablo Martinez',
  role: 'Técnico de Campo Senior',
  region: 'Los Llanos (Portuguesa)',
  email: 'juan.martinez@aproscello.com',
  phone: '+58 414 123 4567',
  stats: {
    visitsMonth: 24,
    activitiesRegistered: 145,
    diagnosesPerformed: 18,
    efficiency: 92
  }
};

const Profile: React.FC<NavigationProps> = ({ onNavigate }) => {

  const handleLogout = () => {
    // Navigate to selector is effectively a logout in this app flow
    onNavigate('selector');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 lg:pb-0 p-4">
      <div className="flex justify-between items-center">
         <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('dashboard')} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white lg:hidden">
               <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 lg:text-slate-900">Mi Perfil</h1>
         </div>
         <button onClick={() => onNavigate('selector')} className="p-2 bg-slate-800 rounded-full text-slate-400">
            <Home className="h-5 w-5" />
         </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="h-24 w-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold border-4 border-emerald-500 shadow-lg">
          JP
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900">{mockProfile.name}</h2>
          <p className="text-emerald-600 font-medium mb-2">{mockProfile.role}</p>
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-slate-500">
            <span className="flex items-center justify-center md:justify-start"><Map className="h-4 w-4 mr-1" /> {mockProfile.region}</span>
            <span className="flex items-center justify-center md:justify-start"><Mail className="h-4 w-4 mr-1" /> {mockProfile.email}</span>
            <span className="flex items-center justify-center md:justify-start"><Phone className="h-4 w-4 mr-1" /> {mockProfile.phone}</span>
          </div>
        </div>
        <button 
          onClick={() => alert('Editar Perfil')}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center"
        >
          <PenTool className="h-4 w-4 mr-2"/> Editar
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('visits')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="mx-auto h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <Calendar className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{mockProfile.stats.visitsMonth}</p>
          <p className="text-xs text-slate-500">Visitas (Mes)</p>
        </div>
        <div 
          onClick={() => onNavigate('activities')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="mx-auto h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2">
            <ClipboardList className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{mockProfile.stats.activitiesRegistered}</p>
          <p className="text-xs text-slate-500">Actividades</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="mx-auto h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-2">
            <BarChart2 className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{mockProfile.stats.diagnosesPerformed}</p>
          <p className="text-xs text-slate-500">Diagnósticos IA</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="mx-auto h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-2">
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{mockProfile.stats.efficiency}%</p>
          <p className="text-xs text-slate-500">Eficiencia</p>
        </div>
      </div>

      {/* Additional Settings / Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-800">
          Configuración y Herramientas
        </div>
        <div className="divide-y divide-slate-100">
          <button className="w-full text-left px-6 py-4 hover:bg-slate-50 flex justify-between items-center text-slate-700">
            <span>Sincronización Offline</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Actualizado</span>
          </button>
          <button 
             onClick={() => alert('Configuración')}
             className="w-full text-left px-6 py-4 hover:bg-slate-50 flex justify-between items-center text-slate-700"
          >
            <span className="flex items-center"><Settings className="h-4 w-4 mr-2" /> Configuración General</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-6 py-4 hover:bg-red-50 flex justify-between items-center text-red-600"
          >
            <span className="flex items-center"><LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;