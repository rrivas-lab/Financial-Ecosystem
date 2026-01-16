import React, { useState, useRef } from 'react';
import { NavigationProps, AIDiagnosis } from '../types';
import { analyzeCropImage } from '../services/geminiService';
import { Camera, Loader2, CheckCircle2, AlertTriangle, ChevronLeft, ArrowRight, DollarSign, AlertOctagon, Home } from 'lucide-react';

const MobileDiagnosis: React.FC<NavigationProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      setImage(base64String);
      setStep('analyzing');
      
      try {
        const result = await analyzeCropImage(base64Data);
        setDiagnosis(result);
        setStep('result');
      } catch (error) {
        alert("Error en análisis. Intente de nuevo.");
        setStep('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateOrder = () => {
    // Simulate API call and success message
    alert("¡Orden de Insumos generada exitosamente! Enviada a almacén para despacho.");
    // Return to main dashboard
    onNavigate('dashboard');
  };

  if (step === 'upload') {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <button onClick={() => onNavigate('dashboard')} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold text-white">Diagnóstico IA</h1>
            </div>
            <button onClick={() => onNavigate('selector')} className="p-2 bg-slate-800 rounded-full text-slate-400">
                <Home className="h-5 w-5" />
            </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-48 w-48 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors relative"
          >
            <Camera className="h-16 w-16 text-slate-500" />
            <div className="absolute -bottom-2 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
              TOCAR AQUÍ
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Tomar foto del cultivo</h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Asegúrese de que la hoja o zona afectada esté bien iluminada y enfocada.
            </p>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900">
        <div className="relative mb-8">
          <div className="h-32 w-32 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">
             <img src={image || ''} className="h-full w-full object-cover opacity-50" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 className="h-12 w-12 text-white animate-spin drop-shadow-md" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2 animate-pulse">Analizando imagen...</h2>
        <p className="text-slate-400 text-sm">Identificando patógenos y deficiencias nutricionales con Gemini 2.5</p>
      </div>
    );
  }

  if (step === 'result' && diagnosis) {
    return (
      <div className="p-4 space-y-6 bg-slate-900 min-h-screen">
        <div className="flex items-center justify-between">
           <button onClick={() => setStep('upload')} className="text-slate-400 flex items-center text-sm">
             <ChevronLeft className="h-4 w-4 mr-1" /> Nueva Foto
           </button>
           <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">CONF: {diagnosis.confidence}%</span>
        </div>

        {/* Diagnosis Card */}
        <div className={`rounded-xl overflow-hidden border ${diagnosis.condition.includes('Sano') ? 'border-emerald-600/50' : 'border-red-600/50'}`}>
           <div className={`p-4 ${diagnosis.condition.includes('Sano') ? 'bg-emerald-900/20' : 'bg-red-900/20'}`}>
              <div className="flex items-start gap-3">
                 {diagnosis.condition.includes('Sano') ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
                 ) : (
                    <AlertTriangle className="h-8 w-8 text-red-500 shrink-0" />
                 )}
                 <div>
                    <h2 className="text-xl font-bold text-white leading-tight mb-1">{diagnosis.condition}</h2>
                    <div className="flex gap-2">
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                         diagnosis.priority === 'Alta' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
                       }`}>
                         Prioridad {diagnosis.priority}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="bg-slate-800 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center mb-1">
                      <AlertOctagon className="h-3 w-3 mr-1" /> Severidad
                    </span>
                    <span className="text-slate-200 font-medium">{diagnosis.severity}</span>
                 </div>
                 <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center mb-1">
                      <DollarSign className="h-3 w-3 mr-1" /> Costo Est.
                    </span>
                    <span className="text-slate-200 font-medium">{diagnosis.estimatedCost}</span>
                 </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-2 uppercase">Recomendación</h3>
                <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                   {diagnosis.recommendation}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                 <button 
                   onClick={handleCreateOrder}
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium shadow-lg flex items-center justify-center"
                 >
                   Generar Orden Insumos
                 </button>
                 <button 
                   onClick={() => onNavigate('activities', { mode: 'create' })}
                   className="w-full bg-slate-700 hover:bg-slate-600 text-emerald-400 border border-slate-600 py-3 rounded-lg font-medium flex items-center justify-center"
                 >
                   + Actividad de Manejo
                 </button>
                 <button onClick={() => onNavigate('selector')} className="w-full py-2 text-slate-500 text-sm flex items-center justify-center hover:text-white mt-2">
                    <Home className="h-4 w-4 mr-2" /> Salir al Selector
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MobileDiagnosis;