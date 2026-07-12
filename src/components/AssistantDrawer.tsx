import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, Check, AlertCircle, Loader2, Image as ImageIcon, Mic, StopCircle, Trash2, Paperclip, FileText } from 'lucide-react';
import { Message, Movement, Attachment } from '../types';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterExpense: (movement: Omit<Movement, 'id'>) => void;
  movements: Movement[];
  budget: number;
}

const fileToBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function AssistantDrawer({ isOpen, onClose, onRegisterExpense, movements, budget }: AssistantDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu asistente financiero. ¿En qué gasto puedo ayudarte hoy? Puedes enviarme una foto de un recibo o una nota de voz.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const totalSpent = movements.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
  const totalIncomes = movements.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);
  const availableBalance = budget + totalIncomes - totalSpent;

  const handleSend = async () => {
    if (!input.trim() && !attachment && !isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      attachments: attachment ? [attachment] : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const context = {
        userName: 'Diego', // In a real app this would be from auth
        currentDate: new Date().toISOString().split('T')[0],
        availableBalance: availableBalance
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Lo siento, ocurrió un error.';
        
        if (response.status === 429) {
          errorMessage = 'He alcanzado mi límite de mensajes por ahora. Intenta de nuevo más tarde.';
        } else if (response.status === 503) {
          errorMessage = 'El asistente está muy solicitado en este momento. Por favor, intenta de nuevo en un minuto.';
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.text || 'He registrado tu gasto.',
        isFunctionCall: data.functionCalls && data.functionCalls.length > 0
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.functionCalls) {
        for (const call of data.functionCalls) {
          if (call.name === 'registerExpense') {
            const { amount, date, description, category } = call.args;
            onRegisterExpense({
              title: description,
              amount: Number(amount),
              date,
              description: '',
              category: category as any,
              type: 'expense'
            });
          }
        }
      }

    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.message,
        status: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file);
      setAttachment({
        type: 'image',
        data: base64,
        mimeType: file.type
      });
    } else if (file.type.startsWith('audio/')) {
      const base64 = await fileToBase64(file);
      setAttachment({
        type: 'audio',
        data: base64,
        mimeType: file.type
      });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64 = await fileToBase64(audioBlob);
        setAttachment({
          type: 'audio',
          data: base64,
          mimeType: 'audio/webm'
        });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0F172A] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                  <Bot className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-tight">Asistente Inteligente</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">En línea</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.attachments && msg.attachments.map((att, idx) => (
                      <div key={idx} className="mb-2">
                        {att.type === 'image' ? (
                          <img 
                            src={`data:${att.mimeType};base64,${att.data}`} 
                            alt="Uploaded" 
                            className="w-48 h-auto rounded-xl border border-white/10 shadow-lg"
                          />
                        ) : (
                          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                            <Mic className="w-5 h-5 text-indigo-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nota de Voz</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className={`
                      p-4 rounded-2xl text-sm font-medium leading-relaxed
                      ${msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : msg.status === 'error'
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-tl-none'
                          : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'}
                    `}>
                      {msg.content}
                      {msg.isFunctionCall && (
                        <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg w-fit">
                          <Check className="w-3 h-3" /> Gasto Registrado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Escribiendo...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/5 border-t border-white/10 space-y-4">
              {/* Attachment Preview */}
              <AnimatePresence>
                {attachment && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative group"
                  >
                    {attachment.type === 'image' ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                        <img 
                          src={`data:${attachment.mimeType};base64,${attachment.data}`} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <Mic className="w-6 h-6 text-indigo-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                        {attachment.type === 'image' ? 'Imagen adjunta' : 'Audio preparado'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {attachment.mimeType}
                      </p>
                    </div>
                    <button 
                      onClick={() => setAttachment(null)}
                      className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Pregúntame o envía un recibo..."
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={(!input.trim() && !attachment) || isLoading}
                    className={`
                      absolute right-2 top-2 p-3 rounded-xl transition-all
                      ${(!input.trim() && !attachment) || isLoading 
                        ? 'text-slate-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'}
                    `}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Adjuntar imagen o audio"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`
                      p-4 border rounded-2xl transition-all relative
                      ${isRecording 
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-500 animate-pulse' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}
                    `}
                    title={isRecording ? 'Detener grabación' : 'Grabar nota de voz'}
                  >
                    {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,audio/*" 
                className="hidden" 
              />
              
              <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
                Presiona Enter para enviar • Saldo: ${availableBalance.toLocaleString('es-CO')}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
