import React, { useState, useRef, useEffect } from 'react';
import { Visit, VisitType, VisitStatus, AIDiagnosis, NavigationProps } from '../types';
import { analyzeCropImage } from '../services/geminiService';
import { 
  Calendar, 
  MapPin, 
  Camera, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  ChevronLeft,
  DollarSign,
  AlertOctagon,
  X
} from 'lucide-react';

const mockVisits: Visit[] = [
  {
    id: 'v1',
    producerId: '1',
    producerName: 'Juan Pérez',
    farmName: 'Finca La Esperanza',
    date: new Date().toISOString().split('T')[0], // Today
    type: VisitType.PRE_CREDITO,
    status: VisitStatus.PLANIFICADA,
    technician: 'Ing. Carlos Mendez'
  },
  {
    id: 'v2',
    producerId: '2',
    producerName: 'Agropecuaria El Sol',
    farmName: 'Hato Grande',
    date: '2023-10-24',
    type: VisitType.SEGUIMIENTO,
    status: VisitStatus.EN_PROCESO,
    technician: 'Ing. Carlos Mendez'
  },
  {
    id: 'v3',
    producerId: '3',
    producerName: 'Maria Rodriguez',
    farmName: 'Parcela 45',
    date: '2025-09-10',
    type: VisitType.CAMPO_SEMILLA,
    status: VisitStatus.PLANIFICADA,
    technician: 'Ing. Carlos Mendez',
    observations: 'Alerta de plaga reportada' // For Alert filter
  }
];

const Visits: React.FC<NavigationProps> = ({ onNavigate, params }) => {
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>(mockVisits);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosis | null>(null);
  const [diagnosisImage, setDiagnosisImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Navigation Params (Filters)
  useEffect(() => {
    if (params?.filter) {
        setActiveFilter(params.filter);
        if (params.filter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            setFilteredVisits(mockVisits.filter(v => v.date === today));
        } else if (params.filter === 'alerts') {
             // Mock logic for alerts (e.g. contains 'plaga' or 'Alerta')
            setFilteredVisits(mockVisits.filter(v => v.observations?.includes('Alerta') || v.status === VisitStatus.EN_PROCESO));
        } else {
            setFilteredVisits(mockVisits);
        }
    } else if (params?.mode === 'diagnosis') {
        // Start ad-hoc diagnosis
        const mockGenericVisit: Visit = {
             id: 'adhoc', producerId: 'x', producerName: 'Diagnóstico Rápido', 
             farmName: 'Sin Asignar', date: new Date().toISOString().split('T')[0], 
             type: VisitType.SEGUIMIENTO, status: VisitStatus.EN_PROCESO, technician: 'Yo'
        };
        setActiveVisit(mockGenericVisit);
    } else {
        setFilteredVisits(mockVisits);
        setActiveFilter('all');
    }
  }, [params]);

  const clearFilters = () => {
      onNavigate('visits', { filter: null });
  };

  const handleStartVisit = (visit: Visit) => {
    setActiveVisit({ ...visit, status: VisitStatus.EN_PROCESO });
    setDiagnosis(null);
    setDiagnosisImage(null);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; // Remove prefix
      
      setDiagnosisImage(base64String);
      setAnalysisLoading(true);
      
      try {
        const result = await analyzeCropImage(base64Data);
        setDiagnosis(result);
      } catch (error) {
        console.error("Error analyzing image", error);
        alert("Error al analizar la imagen. Intente nuevamente.");
      } finally {
        setAnalysisLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyRecommendation = (type: 'activity' | 'input') => {
     if (type === 'activity') {
        // Navigate to Activity Form, potentially pre-filling data from diagnosis
        onNavigate('activities', { mode: 'create' });
     } else {
        alert('Se ha agregado a la lista de insumos sugeridos para esta visita.');
     }
  };

  // --- VIEW: VISIT LIST ---
  if (!activeVisit) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Visitas Técnicas</h1>
            {activeFilter !== 'all' && (
                <div className="flex items-center mt-1">
                    <span className="text-sm bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full flex items-center">
                        Filtro: {activeFilter === 'today' ? 'Hoy' : 'Alertas'}
                        <button onClick={clearFilters} className="ml-2 hover:bg-slate-300 rounded-full p-0.5"><X className="h-3 w-3"/></button>
                    </span>
                </div>
            )}
          </div>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 w-full md:w-auto shadow-sm">
            + Nueva Visita
          </button>
        </div>

        {filteredVisits.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-slate-200">
                <p className="text-slate-500">No se encontraron visitas con el filtro actual.</p>
                <button onClick={clearFilters} className="text-emerald-600 text-sm font-medium mt-2 hover:underline">Ver todas</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVisits.map((visit) => (
                <div key={visit.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className={`px-2 py-1 rounded text-xs font-semibold 
                    ${visit.type === VisitType.PRE_CREDITO ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {visit.type}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold 
                    ${visit.status === VisitStatus.PLANIFICADA ? 'bg-slate-100 text-slate-600' : 
                      visit.status === VisitStatus.EN_PROCESO ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {visit.status}
                    </div>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 mb-1">{visit.producerName}</h3>
                <div className="flex items-center text-slate-500 text-sm mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {visit.farmName}
                </div>
                
                <div className="flex items-center text-slate-500 text-sm mb-6">
                    <Calendar className="h-4 w-4 mr-1" />
                    {visit.date}
                </div>

                <button 
                    onClick={() => handleStartVisit(visit)}
                    className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    {visit.status === VisitStatus.PLANIFICADA ? 'Iniciar Visita' : 'Continuar'}
                </button>
                </div>
            ))}
            </div>
        )}
      </div>
    );
  }

  // --- VIEW: ACTIVE VISIT EXECUTION (Simulating Mobile App) ---
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6 sticky top-0 bg-slate-50 py-4 z-10">
        <button 
          onClick={() => setActiveVisit(null)}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Ejecución de Visita</h1>
          <p className="text-sm text-slate-500">{activeVisit.producerName} - {activeVisit.farmName}</p>
        </div>
      </div>

      {/* Tabs / Sections */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="font-semibold text-slate-700">Diagnóstico Inteligente (Gemini AI)</h2>
          <p className="text-xs text-slate-500">Tome una foto del cultivo para identificar problemas y recibir costos estimados.</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Image Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
               onClick={() => fileInputRef.current?.click()}>
            
            {diagnosisImage ? (
              <img src={diagnosisImage} alt="Crop" className="max-h-64 rounded-lg object-contain mb-4" />
            ) : (
              <div className="bg-emerald-100 p-4 rounded-full mb-3">
                <Camera className="h-8 w-8 text-emerald-600" />
              </div>
            )}
            
            <p className="text-sm font-medium text-slate-600">
              {diagnosisImage ? 'Tocar para cambiar foto' : 'Tocar para subir o tomar foto'}
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* Loading State */}
          {analysisLoading && (
            <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg animate-pulse">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
              <p className="text-blue-700 font-medium">Analizando imagen con IA...</p>
            </div>
          )}

          {/* Result Card */}
          {diagnosis && !analysisLoading && (
            <div className="border border-slate-200 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`p-4 flex items-center justify-between ${
                diagnosis.condition.toLowerCase().includes('sano') 
                  ? 'bg-emerald-50 border-b border-emerald-100' 
                  : 'bg-red-50 border-b border-red-100'
              }`}>
                <div className="flex items-center">
                  {diagnosis.condition.toLowerCase().includes('sano') 
                    ? <CheckCircle2 className="h-6 w-6 text-emerald-600 mr-2" />
                    : <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  }
                  <div>
                    <h3 className="font-bold text-slate-800">{diagnosis.condition}</h3>
                    <p className="text-xs text-slate-500">Confianza: {diagnosis.confidence}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wide ${
                    diagnosis.priority === 'Alta' ? 'bg-red-200 text-red-800' :
                    diagnosis.priority === 'Media' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {diagnosis.priority}
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-white">
                 <div className="flex gap-4 mb-4">
                    <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="flex items-center text-xs font-semibold text-slate-500 uppercase mb-1">
                            <AlertOctagon className="h-3 w-3 mr-1" /> Severidad
                        </span>
                        <p className="font-medium text-slate-800">{diagnosis.severity}</p>
                    </div>
                    <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <span className="flex items-center text-xs font-semibold text-slate-500 uppercase mb-1">
                            <DollarSign className="h-3 w-3 mr-1" /> Costo Est.
                        </span>
                        <p className="font-medium text-slate-800">{diagnosis.estimatedCost}</p>
                    </div>
                 </div>

                <h4 className="text-sm font-semibold text-slate-700 mb-1">Recomendación Técnica:</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{diagnosis.recommendation}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
                  <button 
                    onClick={() => handleApplyRecommendation('activity')}
                    className="text-emerald-600 text-sm font-medium hover:text-emerald-700 flex items-center justify-center border border-emerald-200 rounded-lg px-4 py-2 hover:bg-emerald-50"
                  >
                    + Actividad Cultural
                  </button>
                  <button 
                    onClick={() => handleApplyRecommendation('input')}
                    className="bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 rounded-lg px-4 py-2 shadow-sm"
                  >
                    Generar Orden Insumos
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pb-6">
         <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50">
           Guardar Borrador
         </button>
         <button 
           className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center shadow-sm"
           onClick={() => {
             alert('Visita cerrada exitosamente. Datos sincronizados.');
             setActiveVisit(null);
             onNavigate('dashboard');
           }}
         >
           <Send className="h-4 w-4 mr-2" />
           Cerrar Visita
         </button>
      </div>
    </div>
  );
};

export default Visits;