
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  CheckCheck,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { MOCK_CONNECTIONS } from '../../constants';

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

const Mensagens: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(MOCK_CONNECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulação de históricos diferentes por usuário
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({
    'c1': [
      { id: '1', senderId: 'me', text: 'Oi Sophie! Revisou os assets?', time: '10:30', status: 'read' },
      { id: '2', senderId: 'c1', text: 'Oi! Sim, os blurs ficaram ótimos.', time: '10:32', status: 'read' }
    ],
    'c2': [
      { id: '1', senderId: 'c2', text: 'Cara, viu a nova funcionalidade do Thoth?', time: '09:15', status: 'read' },
      { id: '2', senderId: 'me', text: 'Ainda não, vou conferir agora!', time: '09:20', status: 'read' }
    ]
  });

  const activeContact = useMemo(() => 
    MOCK_CONNECTIONS.find(c => c.id === selectedId) || MOCK_CONNECTIONS[0]
  , [selectedId]);

  const filteredConnections = useMemo(() => 
    MOCK_CONNECTIONS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  , [searchQuery]);

  const currentMessages = chatHistories[selectedId] || [
    { id: 'default', senderId: selectedId, text: `Olá! Eu sou ${activeContact.name}. Como posso ajudar hoje?`, time: 'Agora', status: 'read' }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setChatHistories(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMessage]
    }));
    setInputText('');

    // Resposta automática fake após 1s
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: selectedId,
        text: 'Entendido! Vou verificar isso agora mesmo.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };
      setChatHistories(prev => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] || []), response]
      }));
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 h-[calc(100vh-160px)]">
      <div className="thoth-page-header shrink-0">
        <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Mensagens</h1>
        <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Central de Comunicação</p>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden relative">
        
        {/* LISTA DE CONVERSAS */}
        <div className={`w-full lg:w-[320px] flex flex-col glass-panel rounded-2xl bg-white/40 border border-white/60 overflow-hidden shadow-xl transition-all duration-300 ${!isMobileListVisible ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/40">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55] transition-colors" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar colega..." 
                  className="w-full h-10 pl-10 pr-4 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
             {filteredConnections.map((conn) => (
               <div 
                 key={conn.id}
                 onClick={() => { setSelectedId(conn.id); setIsMobileListVisible(false); }}
                 className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                   selectedId === conn.id 
                   ? 'bg-[#006c55] text-white shadow-lg' 
                   : 'hover:bg-white/80'
                 }`}
               >
                 <div className="relative shrink-0">
                    <img src={conn.avatar} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm" alt={conn.name} />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                       <h4 className="text-xs font-black truncate">{conn.name}</h4>
                       <span className={`text-[8px] font-bold uppercase ${selectedId === conn.id ? 'text-white/60' : 'text-slate-400'}`}>10:35</span>
                    </div>
                    <p className={`text-[11px] truncate ${selectedId === conn.id ? 'text-white/80' : 'text-slate-500'}`}>
                      {chatHistories[conn.id]?.slice(-1)[0]?.text || "Inicie uma conversa..."}
                    </p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* ÁREA DO CHAT */}
        <div className={`flex-1 flex flex-col glass-panel rounded-2xl bg-white border border-white overflow-hidden shadow-xl transition-all duration-300 ${isMobileListVisible ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 shrink-0">
             <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileListVisible(true)} className="lg:hidden p-2 -ml-2 text-slate-400">
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  <img src={activeContact.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm border-2 border-white" alt="Avatar" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-none">{activeContact.name}</h3>
                  <p className="text-[9px] font-black text-[#006c55] uppercase tracking-widest mt-1">Conexão Ativa</p>
                </div>
             </div>
             <div className="flex items-center gap-1">
                <button className="p-2 text-slate-400 hover:text-[#006c55] hover:bg-[#006c55]/5 rounded-lg transition-all"><Phone size={18}/></button>
                <button className="p-2 text-slate-400 hover:text-[#006c55] hover:bg-[#006c55]/5 rounded-lg transition-all"><Video size={18}/></button>
                <button className="p-2 text-slate-400 hover:text-[#006c55] hover:bg-[#006c55]/5 rounded-lg transition-all"><MoreVertical size={18}/></button>
             </div>
          </div>

          {/* Histórico */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 no-scrollbar">
             {currentMessages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                      msg.senderId === 'me' 
                      ? 'bg-[#006c55] text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                       <p className="text-[13px] leading-relaxed font-medium">{msg.text}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                       <span className="text-[8px] font-bold text-slate-400 uppercase">{msg.time}</span>
                       {msg.senderId === 'me' && <CheckCheck size={10} className="text-[#006c55]" />}
                    </div>
                  </div>
               </div>
             ))}
             <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-50 flex items-center gap-3 shrink-0">
             <button className="p-2.5 text-slate-400 hover:text-[#006c55] rounded-xl transition-all"><Plus size={20}/></button>
             <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Mensagem..." 
                  className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                   <button className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors"><Smile size={18}/></button>
                   <button className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors"><Paperclip size={18}/></button>
                </div>
             </div>
             <button 
               onClick={handleSendMessage}
               disabled={!inputText.trim()}
               className="w-11 h-11 bg-[#006c55] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#006c55]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:grayscale"
             >
                <Send size={18} strokeWidth={2.5} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mensagens;
