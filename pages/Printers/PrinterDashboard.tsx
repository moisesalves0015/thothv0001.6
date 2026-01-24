
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer,
  Clock,
  CheckCircle2,
  Loader2,
  FileText,
  MoreVertical,
  ChevronLeft,
  Search,
  ShieldCheck,
  QrCode,
  LogOut,
  X,
  Plus,
  Users,
  Send,
  Download,
  DollarSign,
  TrendingUp,
  Settings2,
  Lock,
  Calendar,
  Zap,
  AlertCircle
} from 'lucide-react';
import { PrintService } from '../../modules/print/print.service';
import { PrinterService, PrinterStation } from '../../modules/print/printer.service';
import { PrintRequest, Message } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const PrinterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PrintRequest | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [activeChatTab, setActiveChatTab] = useState<'support' | 'clients'>('support');
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Shop specific states
  const [currentStation, setCurrentStation] = useState<PrinterStation | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [stationId, setStationId] = useState<string>(''); // Pegaremos do localStorage após login

  // Estados Simulados para o Chat
  const [supportMessages, setSupportMessages] = useState<Message[]>([
    { id: 's1', role: 'system', content: 'Terminal conectado via SSL. Estação: GR-THOTH-01', timestamp: Date.now() - 1000 * 60 * 60 },
    { id: 's2', role: 'user', content: 'Olá, detectamos uma instabilidade na fila do Bloco A.', timestamp: Date.now() - 1000 * 60 * 30 },
    { id: 's3', role: 'assistant', content: 'Estamos cientes. O servidor secundário já assumiu o processamento.', timestamp: Date.now() - 1000 * 60 * 20 }
  ]);

  const [clientMessages, setClientMessages] = useState<Message[]>([
    { id: 'c1', role: 'user', content: 'Moisés: Posso trocar o papel do TCC por um de gramatura 90g?', timestamp: Date.now() - 1000 * 60 * 10 },
    { id: 'c2', role: 'assistant', content: 'Thoth: Claro! Haverá um acréscimo de R$ 0,10 por página.', timestamp: Date.now() - 1000 * 60 * 5 }
  ]);

  // Listener em tempo real usando o PrintService
  useEffect(() => {
    const savedStationId = localStorage.getItem('thoth_station_id');
    if (!savedStationId) {
      navigate('/printers/login');
      return;
    }
    setStationId(savedStationId);

    // Busca dados da estação
    const fetchStationAndOrders = async () => {
      let unsubOrders: (() => void) | null = null;

      const unsubStation = PrinterService.subscribeToStations((stations) => {
        const station = stations.find(s => s.stationId === savedStationId);
        if (station) {
          console.log("[Dashboard] Station found:", station.name, "| Owner:", station.ownerEmail);
          console.log("[Dashboard] Auth User:", authUser?.email);
          setCurrentStation(station);
          // Só assina pedidos após ter o email do dono para o filtro de segurança
          if (!unsubOrders) {
            console.log("[Dashboard] Subscribing to orders for:", station.stationId);
            unsubOrders = PrintService.subscribeToShopOrders(station.stationId, station.ownerEmail, setRequests);
          }
        } else {
          console.warn("[Dashboard] Station not found for ID:", savedStationId);
        }
      });

      return () => {
        unsubStation();
        if (unsubOrders) (unsubOrders as any)();
      };
    };

    const cleanupPromise = fetchStationAndOrders();

    return () => {
      cleanupPromise.then(cleanup => cleanup());
    };
  }, [navigate]);

  const moveRequest = async (id: string, newStatus: PrintRequest['status']) => {
    try {
      await PrintService.updateStatus(id, newStatus);
    } catch (e) {
      console.error("Erro ao mover pedido:", e);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: PrintRequest['status']) => {
    const id = e.dataTransfer.getData('requestId');
    if (id) await moveRequest(id, targetStatus);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData('requestId', id);
  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg: Message = { id: Date.now().toString(), role: 'assistant', content: chatInput, timestamp: Date.now() };
    if (activeChatTab === 'support') setSupportMessages(prev => [...prev, msg]);
    else setClientMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r =>
      !r.archived && (
        r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
    );
  }, [requests, searchQuery]);

  // Cálculos Dinâmicos para os Stats
  const stats = useMemo(() => {
    const daily = requests.filter(r => r.status === 'ready' && new Date(r.timestamp).toDateString() === new Date().toDateString());
    const total = requests.filter(r => r.status === 'ready');
    return {
      dailyRevenue: daily.reduce((acc, curr) => acc + curr.totalPrice, 0),
      monthlyRevenue: total.reduce((acc, curr) => acc + curr.totalPrice, 0),
      pendingJobs: requests.filter(r => r.status === 'pending').length,
      completedToday: daily.length
    };
  }, [requests]);

  const toggleShopStatus = async () => {
    if (!currentStation) return;
    try {
      await PrinterService.updateStation(currentStation.id, { isOpen: !currentStation.isOpen });
    } catch (e) {
      console.error("Erro ao alterar status:", e);
    }
  };

  const updatePricing = async (type: 'pb' | 'color', value: number) => {
    if (!currentStation) return;
    try {
      const newPrices = { ...currentStation.prices, [type]: value };
      await PrinterService.updateStation(currentStation.id, { prices: newPrices });
    } catch (e) {
      console.error("Erro ao alterar preços:", e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Orgânico Thoth */}
      <div className="fixed inset-0 z-[-1] bg-[#fff5f7] bg-center bg-cover bg-no-repeat bg-fixed opacity-100" style={{ backgroundImage: 'url("https://i.pinimg.com/736x/99/b2/0c/99b20c6f0e8c81d5db7998cc91123825.jpg")' }}></div>

      {/* Header Premium Glass */}
      <header className="h-16 bg-white/60 backdrop-blur-xl border-b border-white/40 flex items-center justify-between px-8 sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/80 border border-white/60 hover:bg-[#006c55] hover:text-white transition-all shadow-sm active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">Terminal <span className="text-[#006c55]">Thoth</span></h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-black text-[#006c55] uppercase tracking-[0.2em] opacity-70">{currentStation?.name || 'Operação Gráfica'}</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{stationId}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Conectado como</span>
            <span className={`text-[9px] font-bold ${authUser?.email?.toLowerCase() === currentStation?.ownerEmail?.toLowerCase() ? 'text-slate-700' : 'text-red-500'}`}>
              {authUser?.email || 'Desconhecido'}
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full ${requests.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
        </div>

        {authUser && currentStation && authUser.email?.toLowerCase() !== currentStation.ownerEmail.toLowerCase() && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 max-w-lg">
            <AlertCircle size={20} className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest">Erro de Permissão</span>
              <span className="text-[11px] font-medium opacity-90 leading-tight">
                Você acessou via Painel do Parceiro, mas sua conta Thoth é <b>{authUser.email}</b>.
                Os pedidos desta gráfica pertencem a <b>{currentStation.ownerEmail}</b>.
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 max-w-lg mx-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006c55] transition-colors" size={16} />
            <input
              type="text"
              placeholder="Pesquisar ordens ou clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-11 pr-4 bg-white/40 border border-white/60 rounded-2xl text-[14px] focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all shadow-sm active:scale-90 ${showSettings ? 'bg-[#006c55] text-white' : 'bg-white/80 border border-white/60 text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings2 size={20} />
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('thoth_station_id');
              navigate('/printers/login');
            }}
            className="flex items-center gap-2 pl-2 pr-4 h-10 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group"
          >
            <LogOut size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1500px] mx-auto w-full">

        {/* Coluna Esquerda: Stats & Kanban (9) */}
        <div className="xl:col-span-9 space-y-6 animate-in fade-in duration-700">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Receita Diária', val: `R$ ${stats.dailyRevenue.toFixed(2)}`, icon: <TrendingUp size={20} />, color: 'emerald' },
              { label: 'Balanço Mensal', val: `R$ ${stats.monthlyRevenue.toFixed(0)}`, icon: <DollarSign size={20} />, color: 'blue' },
              { label: 'Fila de Espera', val: `${stats.pendingJobs} Jobs`, icon: <Clock size={20} />, color: 'amber' },
              { label: 'Entregues Hoje', val: stats.completedToday, icon: <CheckCircle2 size={20} />, color: 'primary' }
            ].map((card, i) => (
              <div key={i} className="bg-white/75 backdrop-blur-md p-5 rounded-2xl border border-white/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-500 group-hover:bg-[#006c55] group-hover:text-white transition-all shadow-inner`}>
                    {card.icon}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{card.label}</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{card.val}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Kanban Workflow */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]">
            {['pending', 'printing', 'ready'].map((status) => (
              <div
                key={status}
                className={`bg-white/30 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-5 border border-white/50 shadow-sm transition-all ${status === 'printing' ? 'bg-[#006c55]/5 border-2 border-dashed border-[#006c55]/20' : ''}`}
                onDragOver={allowDrop}
                onDrop={(e) => handleDrop(e, status as any)}
              >
                <div className="flex items-center justify-between border-b border-white/40 pb-3">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    {status === 'pending' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                    {status === 'printing' && <Loader2 size={14} className="text-[#006c55] animate-spin" />}
                    {status === 'ready' && <CheckCircle2 size={16} className="text-emerald-500" />}
                    {status === 'pending' ? 'Aguardando' : status === 'printing' ? 'Imprimindo' : 'Pronto'}
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 bg-white/60 px-2 py-0.5 rounded-full">{filteredRequests.filter(r => r.status === status).length}</span>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                  {filteredRequests.filter(r => r.status === status).map(req => (
                    <div
                      key={req.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, req.id)}
                      className={`bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-white/90 cursor-grab active:grabbing transition-all hover:border-[#006c55]/40 group ${status === 'printing' ? 'border-l-4 border-l-[#006c55]' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-[#006c55] transition-colors">
                          <FileText size={20} />
                        </div>
                        <span className="text-[11px] font-black text-slate-900">R$ {req.totalPrice.toFixed(2)}</span>
                      </div>
                      <h4 className="text-[13px] font-black text-slate-900 truncate mb-0.5">{req.fileName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{req.customerName}</p>

                      {req.fileUrl && (
                        <a
                          href={req.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex items-center gap-2 text-[9px] font-black text-[#006c55] uppercase tracking-widest bg-[#006c55]/5 p-2 rounded-lg hover:bg-[#006c55] hover:text-white transition-all"
                        >
                          <Download size={12} /> Baixar Arquivo
                        </a>
                      )}

                      {status === 'printing' && (
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4 border border-slate-200 shadow-inner">
                          <div className="h-full bg-[#006c55] animate-[loading_4s_ease-in-out_infinite]"></div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{req.pages} Pags</span>
                        {status === 'pending' && (
                          <button onClick={() => moveRequest(req.id, 'printing')} className="h-8 px-4 bg-[#006c55] text-white rounded-2xl hover:bg-emerald-600 transition-all text-[9px] font-black uppercase shadow-lg shadow-[#006c55]/10">Iniciar</button>
                        )}
                        {status === 'printing' && (
                          <button onClick={() => moveRequest(req.id, 'ready')} className="h-8 px-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all text-[9px] font-black uppercase shadow-lg">Finalizar</button>
                        )}
                        {status === 'ready' && (
                          <button onClick={() => { setSelectedRequest(req); setIsVerifyModalOpen(true); }} className="h-8 px-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all text-[9px] font-black uppercase shadow-lg shadow-emerald-500/10 flex items-center gap-1.5"><ShieldCheck size={12} /> Validar</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Chat (Topo) e Histórico (Base) */}
        <div className="xl:col-span-3 flex flex-col gap-6 h-full animate-in fade-in duration-700 delay-150">

          {/* Chat Unificado */}
          <div className="bg-slate-950 rounded-2xl flex flex-col h-[500px] shadow-2xl relative overflow-hidden group border border-white/5">
            <div className="absolute top-[-40px] left-[-40px] w-64 h-64 bg-[#006c55]/15 rounded-full blur-[80px] opacity-40"></div>

            <div className="p-6 pb-0 relative z-10">
              <div className="flex bg-white/5 p-1 rounded-2xl gap-1 mb-6">
                <button
                  onClick={() => setActiveChatTab('support')}
                  className={`flex-1 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeChatTab === 'support' ? 'bg-[#006c55] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <ShieldCheck size={12} /> Suporte
                </button>
                <button
                  onClick={() => setActiveChatTab('clients')}
                  className={`flex-1 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeChatTab === 'clients' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Users size={12} /> Clientes
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                    {activeChatTab === 'support' ? 'Central Thoth' : 'Mensagens'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Tempo Real</span>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-0 space-y-4 relative z-10">
              {(activeChatTab === 'support' ? supportMessages : clientMessages).map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'assistant' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm ${msg.role === 'assistant'
                    ? 'bg-[#006c55] text-white rounded-tr-none'
                    : msg.role === 'system'
                      ? 'bg-white/5 text-slate-500 italic text-[10px] w-full text-center border border-white/5 py-1.5'
                      : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
                    }`}>
                    {msg.content}
                  </div>
                  <span className="text-[7px] font-bold text-slate-600 uppercase mt-1 px-1 tracking-tighter">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-6 pt-0 relative z-10">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Mensagem..."
                  className="w-full h-11 pl-4 pr-12 bg-white/5 border border-white/10 rounded-2xl text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#006c55]/30 focus:border-[#006c55] transition-all shadow-inner"
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-1.5 top-1.5 w-8 h-8 bg-[#006c55] text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all active:scale-90 shadow-lg"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Histórico Transacional */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-2xl flex flex-col flex-1 min-h-[250px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <h3 className="text-[13px] font-black text-slate-900 tracking-tight leading-none uppercase">Histórico</h3>
                <span className="text-[9px] font-black text-[#006c55] uppercase tracking-widest mt-1 opacity-60">Fluxo Diário</span>
              </div>
              <button className="p-2.5 bg-white/60 rounded-2xl hover:bg-[#006c55] hover:text-white transition-all shadow-sm">
                <Download size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {requests.filter(r => r.status === 'ready').slice(0, 8).map((req, i) => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-white/40 hover:bg-white/80 rounded-2xl transition-all border border-transparent hover:border-white shadow-sm group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-800 truncate max-w-[100px]">{req.fileName}</span>
                      <span className="text-[9px] font-bold text-slate-400">{new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-slate-900">R$ {req.totalPrice.toFixed(2)}</span>
                </div>
              ))}
              {requests.filter(r => r.status === 'ready').length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-[10px]">
                  Nenhuma transação concluída hoje.
                </div>
              )}
            </div>

            <button className="mt-4 w-full text-center text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-[#006c55] transition-colors">Ver Relatório Completo</button>
          </div>

        </div>

        {/* Painel de Configurações (Microserviço Sync) */}
        {showSettings && (
          <div className="xl:col-span-3 animate-in slide-in-from-right duration-500">
            <div className="bg-white/80 backdrop-blur-3xl rounded-[32px] border border-white p-8 shadow-2xl space-y-8 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Settings2 size={18} className="text-[#006c55]" />
                  Painel de Gestão
                </h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
              </div>

              {/* Toggle Aberto/Fechado */}
              <div className="p-6 rounded-[24px] bg-slate-900 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#006c55]/20 blur-3xl -z-10"></div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono">Status da Loja</span>
                  <div className={`w-2 h-2 rounded-full ${currentStation?.isOpen ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_emerald]' : 'bg-red-500'}`}></div>
                </div>
                <button
                  onClick={toggleShopStatus}
                  className={`w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStation?.isOpen ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                >
                  {currentStation?.isOpen ? 'Fechar Gráfica Agora' : 'Abrir Gráfica Agora'}
                </button>
              </div>

              {/* Tabela de Preços */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tabela de Preços (v1.0)</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-[#006c55]/30 transition-all">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Página P&B (R$)</span>
                      <input
                        type="number" step="0.05"
                        value={currentStation?.prices.pb || 0}
                        onChange={(e) => updatePricing('pb', parseFloat(e.target.value))}
                        className="text-lg font-black text-slate-900 bg-transparent focus:outline-none w-24"
                      />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#006c55]/10 group-hover:text-[#006c55] transition-all">
                      <FileText size={14} />
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-[#006c55]/30 transition-all">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Página Color (R$)</span>
                      <input
                        type="number" step="0.10"
                        value={currentStation?.prices.color || 0}
                        onChange={(e) => updatePricing('color', parseFloat(e.target.value))}
                        className="text-lg font-black text-slate-900 bg-transparent focus:outline-none w-24"
                      />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#006c55]/10 group-hover:text-[#006c55] transition-all">
                      <Zap size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Horário e Descontos */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Período Ativo</span>
                  </div>
                  <span className="text-[#006c55]">{currentStation?.workingHours || '08:00 - 18:00'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} />
                    <span>Desconto Ativo</span>
                  </div>
                  <span className={currentStation?.discounts.active ? 'text-emerald-500' : 'text-slate-400'}>
                    {currentStation?.discounts.active ? `${currentStation.discounts.percentage}%` : 'Inativo'}
                  </span>
                </div>
              </div>

              <button className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                Histórico de Faturamento
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Validação */}
      {isVerifyModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-[400px] bg-white rounded-2xl p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 border border-white">
            <div className="absolute top-0 right-0 p-6">
              <button onClick={() => setIsVerifyModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-300 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all border border-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-2xl relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping opacity-20"></div>
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Checkout de Ativo</h2>
              <p className="text-sm text-slate-500 font-medium">Insira o código de retirada gerado no app.</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center">
                <h4 className="text-[15px] font-black text-slate-900 truncate mb-1">{selectedRequest.fileName}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedRequest.customerName}</p>
              </div>

              <div className="space-y-2 text-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Token de 4 Dígitos</label>
                <input
                  type="text"
                  maxLength={4}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className="w-full h-20 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-5xl font-black tracking-[0.5em] text-slate-900 focus:outline-none focus:ring-8 focus:ring-[#006c55]/10 focus:border-[#006c55] focus:bg-white transition-all shadow-inner"
                />
              </div>

              <button
                onClick={async () => {
                  if (verifyCode === selectedRequest.pickupCode) {
                    try {
                      await PrintService.deleteRequest(selectedRequest.id);
                      setIsVerifyModalOpen(false);
                      setVerifyCode('');
                      alert("Autenticação bem-sucedida. Ordem entregue.");
                    } catch (error) {
                      console.error("Erro ao finalizar pedido:", error);
                    }
                  } else {
                    alert("Token inválido. Verifique no terminal do aluno.");
                  }
                }}
                className="w-full h-16 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#006c55]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Confirmar Entrega
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default PrinterDashboard;