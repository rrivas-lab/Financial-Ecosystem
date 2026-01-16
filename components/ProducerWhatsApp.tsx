import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavigationProps, Producer, ChatMessage, CreditApplication, VisitType, VisitStatus } from '../types';
import { useProducers } from '../context/ProducerContext';
import { useApplications } from '../context/ApplicationContext';
import { usePatterns } from '../context/PatternContext';
import { 
  Send, Camera, Phone, Video, ArrowLeft,
  CheckCheck, Tractor, X, FileText
} from 'lucide-react';

type ChatFlowState = 
  | 'IDENTIFY' 
  | 'REG_NAME' 
  | 'REG_LOCATION' 
  | 'MAIN_MENU'
  | 'REQ_PATTERN'
  | 'REQ_RUBRO'
  | 'REQ_HECTARES'
  | 'REQ_FINCA'
  | 'UPLOAD_DOCS';

const ProducerWhatsApp: React.FC<NavigationProps> = ({ onNavigate }) => {
  const { getProducerByVat, addProducer, updateProducer, producers, updateProducerDocument } = useProducers();
  const { applications, addApplication } = useApplications();
  const { patterns } = usePatterns();
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- PERSISTENCIA ---
  const [currentProducerId, setCurrentProducerId] = useState<string | null>(() => localStorage.getItem('wa_producer_id'));
  const [flowState, setFlowState] = useState<ChatFlowState>(() => (localStorage.getItem('wa_flow_state') as ChatFlowState) || 'IDENTIFY');
  const [tempData, setTempData] = useState(() => {
    const saved = localStorage.getItem('wa_temp_data');
    return saved ? JSON.parse(saved) : { vat: '', name: '', location: '', patternId: '', patternName: '', rubro: '', hectares: '', finca: '', projectType: 'Consumo' };
  });

  const producerFromContext = useMemo(() => 
    producers.find(p => p.id === currentProducerId), 
    [producers, currentProducerId]
  );

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('wa_chat_history');
    if (saved) return JSON.parse(saved);
    return [{ 
      id: 'welcome', 
      text: '¡Bienvenido al canal oficial de Aproscello! 🚜\n\nPor favor, ingresa tu número de Cédula o RIF para identificarte (Ej: V-12345678):', 
      sender: 'bot', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }];
  });

  const pendingDocuments = useMemo(() => {
    return (producerFromContext?.documents || []).filter(d => d.status === 'Pendiente' || d.status === 'Solicitado' || d.status === 'Rechazado');
  }, [producerFromContext?.documents]);

  // Sincronizar mensajes desde el Administrador (Escritorio)
  useEffect(() => {
    if (producerFromContext?.chatHistory && producerFromContext.chatHistory.length > 0) {
      const contextMsgs = producerFromContext.chatHistory;
      setChatMessages(prev => {
        const newMsgs = contextMsgs.filter(cm => !prev.some(pm => pm.id === cm.id));
        if (newMsgs.length > 0) {
          if (producerFromContext.status === 'Activo' && flowState === 'IDENTIFY') {
              setFlowState('MAIN_MENU');
          }
          return [...prev, ...newMsgs];
        }
        return prev;
      });
    }
  }, [producerFromContext?.chatHistory, producerFromContext?.status]);

  useEffect(() => {
    localStorage.setItem('wa_producer_id', currentProducerId || '');
    localStorage.setItem('wa_flow_state', flowState);
    localStorage.setItem('wa_chat_history', JSON.stringify(chatMessages));
    localStorage.setItem('wa_temp_data', JSON.stringify(tempData));
  }, [chatMessages, flowState, currentProducerId, tempData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const addBotResponse = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        text,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, newMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userText = inputValue;
    setChatMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      text: userText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    }]);
    setInputValue('');
    processLogic(userText);
  };

  const processLogic = (text: string) => {
    const input = text.trim();
    const lower = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Comando Global de Rescate
    if (lower === 'reset' || lower === 'salir' || lower === 'menu') {
      setFlowState('MAIN_MENU');
      addBotResponse('🏠 Regresamos al Menú Principal:\n\n1. 🌾 *Solicitar Apoyo*\n2. 📂 *Enviar Documentos*\n3. 💰 *Ver Estatus*');
      return;
    }

    // 1. FASE IDENTIFICACIÓN
    if (flowState === 'IDENTIFY') {
      const vat = input.toUpperCase();
      const p = getProducerByVat(vat);
      if (p) {
        setCurrentProducerId(p.id);
        if (p.status === 'Activo') {
          setFlowState('MAIN_MENU');
          addBotResponse(`¡Hola de nuevo, ${p.name.split(' ')[0]}! ✅\n\n¿En qué podemos ayudarte?\n\n1. 🌾 *Solicitar Apoyo*\n2. 📂 *Enviar Documentos*\n3. 💰 *Ver Estatus*`);
        } else {
          addBotResponse(`Hola ${p.name.split(' ')[0]}. Tu cuenta está **PENDIENTE DE ACTIVACIÓN**. ⏳\n\nTe notificaremos por aquí apenas el analista valide tus datos.`);
        }
      } else {
        setTempData({ ...tempData, vat });
        setFlowState('REG_NAME');
        addBotResponse(`El documento *${vat}* no está registrado.\n\nVamos a registrarte. 📝\n\n👉 *Paso 1*: Escribe tu **Nombre Completo**:`);
      }
      return;
    }

    // 2. FASE REGISTRO NUEVO
    if (flowState === 'REG_NAME') {
      setTempData({ ...tempData, name: input });
      setFlowState('REG_LOCATION');
      addBotResponse(`Gracias, ${input}.\n\n👉 *Paso 2*: Indica la **Ubicación** de tu finca (Estado/Municipio):`);
      return;
    }

    if (flowState === 'REG_LOCATION') {
      const newId = `wa-${Date.now()}`;
      addProducer({
        id: newId, name: tempData.name, vat: tempData.vat, type: 'Natural', email: '', phone: 'WhatsApp', address: input, status: 'Pendiente', source: 'WhatsApp', creditActive: false, filesStatus: 'Incompleto', farms: [], activeCreditsCount: 0, chatHistory: [], documents: []
      });
      setCurrentProducerId(newId);
      setFlowState('IDENTIFY'); 
      addBotResponse(`🎉 *¡REGISTRO ENVIADO!* 🆔 Cédula: ${tempData.vat}\n👤 Nombre: ${tempData.name}\n\n⚠️ Tu cuenta está en proceso de **ACTIVACIÓN**. Te avisaremos por este chat.`);
      return;
    }

    // 3. MENÚ PRINCIPAL
    if (flowState === 'MAIN_MENU') {
      if (input === '1' || lower.includes('apoyo')) {
        if (producerFromContext?.status !== 'Activo') {
          addBotResponse(`⚠️ Tu cuenta debe estar **ACTIVA** para realizar solicitudes.`);
          return;
        }
        const activePatterns = patterns.filter(p => p.status === 'Activo');
        let m = `🌾 *SOLICITUD DE APOYO*\n\nSelecciona el programa:\n\n`;
        activePatterns.forEach((p, i) => m += `${i + 1}. *${p.name}*\n`);
        setFlowState('REQ_PATTERN'); 
        addBotResponse(m);
      } else if (input === '2' || lower.includes('doc')) {
        if (!pendingDocuments.length) {
            addBotResponse('✅ No tienes recaudos pendientes por subir.');
        } else {
            setFlowState('UPLOAD_DOCS');
            let m = `📂 *RECAUDOS PENDIENTES*\n\nSelecciona el número para subir la foto:\n\n`;
            pendingDocuments.forEach((d, i) => m += `${i + 1}. ⬜ *${d.name}*\n`);
            addBotResponse(m);
        }
      } else if (input === '3' || lower.includes('estatus')) {
        const myApps = applications.filter(a => a.producerName === producerFromContext?.name);
        if (!myApps.length) addBotResponse('💰 No tienes solicitudes activas.');
        else {
          let m = `📊 *ESTATUS DE TUS TRÁMITES*\n\n`;
          myApps.forEach(a => m += `• ${a.code}: *${a.status.replace('_',' ')}*\n`);
          addBotResponse(m);
        }
      } else {
        addBotResponse('Por favor elige una opción:\n1. 🌾 Solicitar Apoyo\n2. 📂 Enviar Documentos\n3. 💰 Ver Estatus');
      }
      return;
    }

    // 4. FLUJO DE SOLICITUD DE APOYO
    if (flowState === 'REQ_PATTERN') {
      const idx = parseInt(input) - 1;
      const activePatterns = patterns.filter(p => p.status === 'Activo');
      if (activePatterns[idx]) {
        setTempData({ 
            ...tempData, 
            patternId: activePatterns[idx].id, 
            patternName: activePatterns[idx].name,
            projectType: activePatterns[idx].projectType // Guardar el tipo correcto del patrón
        });
        setFlowState('REQ_RUBRO');
        addBotResponse(`Programa: *${activePatterns[idx].name}*.\n\nIndica el **Rubro** (Arroz, Maíz...):`);
      } else addBotResponse('❌ Opción no válida. Elige un número de la lista.');
      return;
    }

    if (flowState === 'REQ_RUBRO') {
      setTempData({ ...tempData, rubro: input });
      setFlowState('REQ_HECTARES');
      addBotResponse(`¿Cuántas **Hectáreas** deseas financiar? (Responde solo el número)`);
      return;
    }

    if (flowState === 'REQ_HECTARES') {
      const has = parseFloat(input);
      if (isNaN(has)) addBotResponse('❌ Ingresa solo el número.');
      else {
        setTempData({ ...tempData, hectares: has.toString() });
        setFlowState('REQ_FINCA');
        addBotResponse(`¿Cuál es el nombre de la **Finca** donde se ejecutará el proyecto?`);
      }
      return;
    }

    if (flowState === 'REQ_FINCA') {
      const totalAmount = parseFloat(tempData.hectares) * 1250; 
      const newApp: CreditApplication = {
        id: `SOL-WA-${Date.now()}`, 
        code: `WA-${Math.floor(Math.random()*900+100)}`, 
        producerName: producerFromContext?.name || 'Productor WA', 
        farmName: input, 
        // Added missing required property projectType
        projectType: tempData.projectType as 'Consumo' | 'Semilla',
        type: tempData.projectType as 'Consumo' | 'Semilla', // HEREDA EL TIPO DEL PATRÓN
        amount: totalAmount, 
        hectares: parseFloat(tempData.hectares), 
        status: 'Solicitud', 
        date: new Date().toISOString().split('T')[0], 
        patternId: tempData.patternId, 
        patternName: tempData.patternName, 
        documents: []
      };
      addApplication(newApp);
      setFlowState('MAIN_MENU');
      addBotResponse(`✅ *¡SOLICITUD RECIBIDA!* ✅\n\n🆔 Código: ${newApp.code}\n🌾 Programa: ${tempData.patternName}\n📏 Superficie: ${tempData.hectares} ha\n💰 Monto Est.: $${totalAmount.toLocaleString()}\n\nUn analista revisará tu caso. Te avisaremos por aquí si hace falta algún recaudo.`);
      return;
    }

    // 5. FLUJO CARGA DE DOCUMENTOS (Petición clave del usuario)
    if (flowState === 'UPLOAD_DOCS') {
      const idx = parseInt(input) - 1;
      if (pendingDocuments[idx]) {
        setSelectedDocId(pendingDocuments[idx].id);
        addBotResponse(`📸 Por favor, envía la **FOTO** legible de tu: *${pendingDocuments[idx].name}*`);
      } else {
          addBotResponse('❌ Elige un número válido de la lista de documentos.');
      }
      return;
    }

    addBotResponse('No entendí esa opción. Escribe "Menu" para ver las opciones disponibles.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !currentProducerId || !selectedDocId) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      setChatMessages(prev => [...prev, { id: `u-img-${Date.now()}`, text: `Documento enviado`, sender: 'user', image: imageData, timestamp: new Date().toLocaleTimeString(), status: 'read' }]);
      
      updateProducerDocument(currentProducerId, selectedDocId, 'En_Revision', imageData);
      
      // LÓGICA PROACTIVA: Verificar qué sigue
      setTimeout(() => {
          // Buscamos la data fresca del productor
          const latestProducer = producers.find(p => p.id === currentProducerId);
          const remaining = (latestProducer?.documents || []).filter(d => d.id !== selectedDocId && (d.status === 'Pendiente' || d.status === 'Solicitado' || d.status === 'Rechazado'));

          if (remaining.length > 0) {
              let m = `✅ *¡FOTO RECIBIDA!* El analista la validará pronto.\n\n⚠️ *AÚN FALTAN RECAUDOS:* Para completar tu expediente digital, envía los siguientes:\n\n`;
              remaining.forEach((d, i) => m += `${i + 1}. ⬜ *${d.name}*\n`);
              m += `\n👉 Escribe el **número** del documento que vas a subir ahora:`;
              addBotResponse(m);
              setFlowState('UPLOAD_DOCS'); 
          } else {
              addBotResponse(`🎉 *¡EXPEDIENTE DIGITAL COMPLETADO!* 🎉\n\nHas subido todos los recaudos. Nuestros analistas validarán las fotos. Te notificaremos por aquí cuando el estatus cambie.`);
              setFlowState('MAIN_MENU');
          }
          setSelectedDocId(null);
      }, 1500);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  return (
    <div className="fixed inset-0 bg-[#0b141a] flex items-center justify-center overflow-hidden">
      <div className="h-full w-full max-w-md bg-[#e5ddd5] flex flex-col font-sans relative shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#008069] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('selector')} className="p-1 hover:bg-[#006855] rounded-full transition-colors"><ArrowLeft className="h-6 w-6" /></button>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-emerald-700 shadow-inner overflow-hidden">
              <Tractor className="h-6 w-6 text-[#008069]" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Aproscello Bot 🤖</h1>
              <p className="text-[10px] text-green-100 opacity-90">en línea</p>
            </div>
          </div>
          <div className="flex gap-4"><Video className="h-5 w-5 opacity-80" /><Phone className="h-5 w-5 opacity-80" /></div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative scrollbar-hide" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat' }}>
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm relative ${msg.sender === 'user' ? 'bg-[#dcf8c6]' : 'bg-white'}`}>
                {msg.image && <img src={msg.image} className="mb-2 rounded-lg max-h-60 w-full object-cover border border-black/5" />}
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-normal">{msg.text}</p>
                <div className="flex justify-end items-center gap-1 mt-1 text-[9px] text-slate-400 font-bold uppercase">
                    {msg.timestamp} {msg.sender === 'user' && <CheckCheck className="h-3 w-3 text-blue-500" />}
                </div>
              </div>
            </div>
          ))}
          {isTyping && ( <div className="flex justify-start animate-pulse"><div className="bg-white rounded-full px-4 py-2 text-xs text-slate-400 font-bold italic shadow-sm">Escribiendo...</div></div> )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] px-2 py-2 flex items-center gap-2 border-t border-slate-200">
          <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 border border-slate-200 shadow-sm focus-within:ring-1 focus-within:ring-[#008069]">
            <input type="text" placeholder="Escribe un mensaje" className="flex-1 outline-none text-sm bg-transparent" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
            <button onClick={() => fileInputRef.current?.click()} className="ml-2 p-1 text-slate-400 hover:text-[#008069] transition-colors"><Camera className="h-5 w-5" /></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>
          <button onClick={handleSendMessage} className="w-11 h-11 rounded-full flex items-center justify-center bg-[#008069] text-white shadow-lg active:scale-90 transition-transform"><Send className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default ProducerWhatsApp;