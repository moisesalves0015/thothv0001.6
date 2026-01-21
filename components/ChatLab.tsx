
import React, { useState, useRef, useEffect } from 'react';
import { AiService } from '../modules/ai/ai.service';
import { Message } from '../types';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';

const ChatLab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Olá! Eu sou Lumina. Sou sua assistente inteligente integrada ao ecossistema Thoth. Como posso acelerar seus processos hoje?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await AiService.chat(input);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: Date.now(),
        groundingUrls: result.urls.length > 0 ? result.urls : undefined
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: "Sinto muito, tive um problema de conexão com a rede Thoth. Poderia tentar novamente?", 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden rounded-3xl border border-white/40">
      <header className="p-6 border-b border-slate-200/50 flex items-center justify-between shrink-0 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006c55] flex items-center justify-center text-white shadow-lg shadow-[#006c55]/20">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Lumina Assistant</h2>
            <p className="text-[10px] uppercase font-bold text-[#006c55] tracking-widest mt-1">Conectada ao Gemini 3 Flash</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#006c55]/10 rounded-full border border-[#006c55]/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-[#006c55] uppercase tracking-tighter">Grounding Ativo</span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#006c55] text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`rounded-2xl p-4 shadow-sm border ${msg.role === 'user' ? 'bg-[#006c55] text-white border-[#006c55]' : 'bg-white/80 backdrop-blur-sm text-slate-800 border-white'}`}>
                <div className="whitespace-pre-wrap text-[14px] leading-relaxed font-medium">{msg.content}</div>
                
                {msg.groundingUrls && (
                  <div className="mt-4 pt-3 border-t border-slate-200/50 flex flex-wrap gap-2">
                    {msg.groundingUrls.map((url, idx) => (
                      <a 
                        key={idx} 
                        href={url.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${msg.role === 'user' ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:text-[#006c55] hover:border-[#006c55]/30'}`}
                      >
                        <ExternalLink size={10} />
                        {url.title}
                      </a>
                    ))}
                  </div>
                )}
                
                <div className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-white text-slate-400 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                <Loader2 size={14} className="animate-spin text-[#006c55]" />
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white">
                <div className="flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultando Thoth...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white/40 backdrop-blur-md border-t border-slate-200/50 shrink-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem para Lumina..."
              className="w-full h-14 bg-white/70 border border-white rounded-2xl px-5 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] focus:bg-white transition-all shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-40 group-focus-within:opacity-0 transition-opacity">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pressione Enter</span>
            </div>
          </div>
          <button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()} 
            className="w-14 h-14 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-[#006c55]/20 disabled:opacity-50 active:scale-95"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatLab;
