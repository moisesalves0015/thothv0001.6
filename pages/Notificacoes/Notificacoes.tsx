
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Bell, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  Award, 
  Calendar, 
  AlertCircle,
  MoreHorizontal,
  CheckCircle2,
  Trash2,
  Sparkles
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'connection' | 'badge' | 'academic' | 'event';
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  actionDone?: boolean;
}

const Notificacoes: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifs, setNotifs] = useState<Notification[]>([
    { id: '1', type: 'academic', title: 'Nota Lançada: Design UX', desc: 'Sua nota da P1 foi publicada. Você atingiu 9.5!', time: '5m atrás', isRead: false },
    { id: '2', type: 'connection', title: 'Solicitação de Conexão', desc: 'Julian Rose quer participar da sua rede.', time: '1h atrás', isRead: false, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
    { id: '3', type: 'badge', title: 'Conquista Thoth', desc: 'Você desbloqueou o ativo "Pioneiro Thoth".', time: '3h atrás', isRead: true },
    { id: '4', type: 'comment', title: 'Marcus Thorne comentou', desc: '"Esse protótipo está em outro nível!"', time: '5h atrás', isRead: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' }
  ]);

  const celebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#006c55', '#d9f1a2', '#ffffff']
    });
  };

  const markAsRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleAction = (id: string, type: 'accept' | 'like') => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, actionDone: true, isRead: true } : n));
    if (type === 'accept') celebrate();
  };

  const deleteNotif = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifs = notifs.filter(n => filter === 'all' ? true : !n.isRead);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <Heart size={18} className="text-rose-500" fill="currentColor" />;
      case 'comment': return <MessageSquare size={18} className="text-blue-500" />;
      case 'connection': return <UserPlus size={18} className="text-[#006c55]" />;
      case 'badge': return <Award size={18} className="text-amber-500" />;
      case 'academic': return <AlertCircle size={18} className="text-indigo-500" />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="thoth-page-header">
          <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Notificações</h1>
          <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Alertas do Sistema</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex p-1 bg-white/60 backdrop-blur-md rounded-xl border border-white shadow-sm">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'unread', label: 'Novas' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === opt.id ? 'bg-[#006c55] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
           </div>
           <button 
             onClick={() => { setNotifs(notifs.map(n => ({...n, isRead: true}))); celebrate(); }}
             className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#006c55] transition-all shadow-sm"
             title="Limpar todas"
           >
              <CheckCircle2 size={18} />
           </button>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto space-y-3">
        {filteredNotifs.map((notif) => (
          <div 
            key={notif.id}
            onClick={() => markAsRead(notif.id)}
            className={`glass-panel group rounded-2xl p-5 border transition-all duration-300 flex items-start gap-5 cursor-pointer hover:bg-white/80 ${
              notif.isRead 
              ? 'bg-white/40 border-white opacity-70' 
              : 'bg-white border-[#006c55]/20 shadow-lg border-l-4 border-l-[#006c55]'
            }`}
          >
            <div className="relative shrink-0 mt-1">
              {notif.avatar ? (
                <img src={notif.avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-white" alt="Avatar" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-[#006c55]">
                  {getIcon(notif.type)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start mb-0.5">
                  <h3 className={`text-[14px] font-black tracking-tight ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{notif.time}</span>
               </div>
               <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{notif.desc}</p>
               
               {notif.type === 'connection' && !notif.actionDone && (
                 <div className="flex gap-2 mt-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAction(notif.id, 'accept'); }}
                      className="px-4 py-1.5 bg-[#006c55] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md"
                    >
                      Aceitar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                      className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Recusar
                    </button>
                 </div>
               )}

               {notif.actionDone && (
                 <div className="mt-3 flex items-center gap-2 text-[#006c55]">
                   <CheckCircle2 size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Ação concluída</span>
                 </div>
               )}
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
            >
              <Trash2 size={16}/>
            </button>
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center glass-panel rounded-2xl border-2 border-dashed border-slate-200 text-center opacity-60">
             <Bell size={32} className="text-slate-300 mb-3" />
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Tudo limpo</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Nenhuma notificação nova no radar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notificacoes;
