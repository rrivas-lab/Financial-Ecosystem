
import React, { useState, useEffect } from 'react';
import { Tractor, Loader2, ArrowRight, Smartphone, Monitor, ChevronLeft, MessageCircle } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  preselectedMode?: 'mobile' | 'desktop' | 'producer' | null;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, preselectedMode, onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!preselectedMode) return;
    
    setLoading(true);
    // Simulate API Call delay
    setTimeout(() => {
      onLogin({
        id: preselectedMode === 'mobile' ? 't3' : 'u1', // t3 is Ing. Juan Martinez in MasterData
        name: preselectedMode === 'mobile' ? 'Ing. Juan Martinez' : preselectedMode === 'producer' ? 'Pedro Productor' : 'Lic. Ana Rodriguez',
        email: 'user@aproscello.com',
        role: preselectedMode === 'mobile' ? 'tecnico' : preselectedMode === 'producer' ? 'producer' : 'coordinador',
        appMode: preselectedMode
      });
      setLoading(false);
    }, 800);
  };

  const getButtonColor = () => {
      if (preselectedMode === 'mobile') return 'bg-slate-900 hover:bg-slate-800';
      if (preselectedMode === 'producer') return 'bg-[#008069] hover:bg-[#006050]';
      return 'bg-emerald-600 hover:bg-emerald-700';
  };

  const getModeLabel = () => {
      if (preselectedMode === 'mobile') return 'Acceso Técnico de Campo';
      if (preselectedMode === 'producer') return 'WhatsApp del Productor';
      return 'Acceso Administrativo Odoo';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-3xl"></div>

      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-500 relative z-10">
        <button 
          onClick={onBack} 
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          title="Volver al selector"
        >
           <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="bg-emerald-100 p-4 rounded-full mb-4">
            {preselectedMode === 'producer' ? (
                <MessageCircle className="h-10 w-10 text-[#008069]" />
            ) : (
                <Tractor className="h-10 w-10 text-emerald-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Aproscello Manager</h1>
          <p className="text-slate-500 text-sm mt-1">
             {getModeLabel()}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Usuario</label>
            <input 
              type="text" 
              value={preselectedMode === 'mobile' ? 'juan.martinez' : preselectedMode === 'producer' ? '584149999999' : 'ana.rodriguez'} 
              disabled 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 font-medium"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
            <input 
              type="password" 
              value="********" 
              disabled 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 font-medium"
            />
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center transition-all ${getButtonColor()}`}
          >
             {loading ? (
               <Loader2 className="h-6 w-6 animate-spin" />
             ) : (
               <>
                 {preselectedMode === 'mobile' ? 'Iniciar Sesión (App)' : preselectedMode === 'producer' ? 'Abrir WhatsApp' : 'Iniciar Sesión (Web)'}
                 <ArrowRight className="ml-2 h-5 w-5" />
               </>
             )}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
           <p>Monitoring & Traceability System</p>
           <p className="mt-1">© 2025 Aproscello</p>
        </div>
      </div>

      {/* Powered By Badge - Bottom Right Corner */}
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Powered by</span>
            <span className="text-sm font-bold text-emerald-600">CorpoEureka</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
