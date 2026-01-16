
import React from 'react';
import { Smartphone, Monitor, ArrowRight, Tractor, MessageCircle } from 'lucide-react';

interface EnvironmentSelectorProps {
  onSelect: (mode: 'mobile' | 'desktop' | 'producer') => void;
}

const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <div className="bg-emerald-100 p-4 rounded-full inline-flex mb-4">
            <Tractor className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">¿Qué quieres ver?</h1>
        <p className="text-slate-500 mt-2">Selecciona el entorno de demostración</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Desktop Odoo Card */}
        <button 
          onClick={() => onSelect('desktop')}
          className="bg-white group hover:bg-slate-900 transition-all duration-300 p-8 rounded-2xl border-2 border-slate-100 hover:border-slate-800 shadow-xl hover:shadow-2xl text-left flex flex-col relative overflow-hidden"
        >
          <div className="bg-emerald-100 p-4 rounded-2xl w-fit mb-6 group-hover:bg-slate-800 transition-colors">
            <Monitor className="h-8 w-8 text-emerald-600 group-hover:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-2">Back Office App</h2>
          <p className="text-slate-500 group-hover:text-slate-400 mb-8">Portal web administrativo. Gestión de productores, financiamiento y semillas (CONASEM).</p>
          
          <div className="mt-auto flex items-center text-emerald-600 group-hover:text-emerald-400 font-semibold">
            Entrar al Módulo <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Mobile App Card */}
        <button 
          onClick={() => onSelect('mobile')}
          className="bg-white group hover:bg-slate-900 transition-all duration-300 p-8 rounded-2xl border-2 border-slate-100 hover:border-slate-800 shadow-xl hover:shadow-2xl text-left flex flex-col relative overflow-hidden"
        >
          <div className="bg-blue-100 p-4 rounded-2xl w-fit mb-6 group-hover:bg-slate-800 transition-colors">
            <Smartphone className="h-8 w-8 text-blue-600 group-hover:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-2">App móvil de visitas técnicas</h2>
          <p className="text-slate-500 group-hover:text-slate-400 mb-8">UI móvil para técnicos de campo. Diagnósticos IA, modo offline y registro de actividades.</p>
          
          <div className="mt-auto flex items-center text-blue-600 group-hover:text-blue-400 font-semibold">
            Entrar a la App <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* WhatsApp Producer Card */}
        <button 
          onClick={() => onSelect('producer')}
          className="bg-white group hover:bg-[#008069] transition-all duration-300 p-8 rounded-2xl border-2 border-slate-100 hover:border-[#005c4b] shadow-xl hover:shadow-2xl text-left flex flex-col relative overflow-hidden"
        >
          <div className="bg-green-100 p-4 rounded-2xl w-fit mb-6 group-hover:bg-[#005c4b] transition-colors">
            <MessageCircle className="h-8 w-8 text-[#008069] group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-2">WhatsApp Productor</h2>
          <p className="text-slate-500 group-hover:text-green-100 mb-8">Simulación del chat del productor. Solicitud de apoyo, envío de documentos y notificaciones.</p>
          
          <div className="mt-auto flex items-center text-[#008069] group-hover:text-white font-semibold">
            Abrir Chat <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      <div className="mt-12 text-center text-xs text-slate-400">
        Demo desarrollada con React + Gemini API
      </div>
    </div>
  );
};

export default EnvironmentSelector;
