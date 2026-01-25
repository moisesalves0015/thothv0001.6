
import React, { useState, useEffect } from 'react';
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

import { NotificationService, ThothNotification } from '../../modules/notification/notification.service';
import { useAuth } from '../../contexts/AuthContext';
import { ConnectionService } from '../../modules/connection/connection.service';

const Notificacoes: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifs, setNotifs] = useState<ThothNotification[]>([]);
  const { user } = useAuth();
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsub = NotificationService.subscribeToNotifications(user.uid, (data) => {
      setNotifs(data);
    });

    return () => unsub();
  }, [user]);

  const celebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#006c55', '#d9f1a2', '#ffffff']
    });
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    await NotificationService.markAsRead(user.uid, id);
  };

  const handleConnectionAction = async (notif: ThothNotification, action: 'accept' | 'reject') => {
    if (!user || !notif.metadata?.fromUserId || processingId) return;
    setProcessingId(notif.id);

    try {
      if (action === 'accept') {
        await ConnectionService.acceptConnectionRequest(user.uid, notif.metadata.fromUserId);
        celebrate();
      } else {
        await ConnectionService.removeConnection(user.uid, notif.metadata.fromUserId, false);
      }

      // Mark as read and done
      await NotificationService.markAsRead(user.uid, notif.id);
      // Auto-delete connection request notifs? Or just mark as read. 
      // Let's mark as read for history.
    } catch (e) {
      console.error("Error handling connection request:", e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAction = (id: string, type: 'accept' | 'like') => {
    // Legacy mapping or specific local state
    if (type === 'accept') celebrate();
  };

  const deleteNotif = async (id: string) => {
    if (!user) return;
    await NotificationService.deleteNotification(user.uid, id);
  };

  const getRelativeTime = (timestamp: any) => {
    if (!timestamp) return '...';
    try {
      const date = timestamp?.toMillis ? new Date(timestamp.toMillis()) : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();

      if (diff < 60000) return 'agora';
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m atrás`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h atrás`;
      return date.toLocaleDateString();
    } catch (e) {
      return '...';
    }
  };

  const filteredNotifs = notifs.filter(n => filter === 'all' ? true : !n.isRead);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={18} className="text-rose-500" fill="currentColor" />;
      case 'comment': return <MessageSquare size={18} className="text-blue-500" />;
      case 'connection': return <UserPlus size={18} className="text-[#006c55]" />;
      case 'badge': return <Award size={18} className="text-amber-500" />;
      case 'academic': return <AlertCircle size={18} className="text-indigo-500" />;
      case 'reminder': return <Calendar size={18} className="text-[#006c55]" />;
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
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === opt.id ? 'bg-[#006c55] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={async () => {
              if (!user) return;
              const unreadIds = notifs.filter(n => !n.isRead).map(n => n.id);
              for (const id of unreadIds) {
                if (id) await markAsRead(id);
              }
              celebrate();
            }}
            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#006c55] transition-all shadow-sm"
            title="Marcar todas como lidas"
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
            className={`glass-panel group rounded-2xl p-5 border transition-all duration-300 flex items-start gap-5 cursor-pointer hover:bg-white/80 ${notif.isRead
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

              {notif.type === 'connection' && !notif.isRead && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConnectionAction(notif, 'accept'); }}
                    disabled={processingId === notif.id}
                    className="px-4 py-1.5 bg-[#006c55] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md disabled:opacity-50"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConnectionAction(notif, 'reject'); }}
                    disabled={processingId === notif.id}
                    className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
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
              <Trash2 size={16} />
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
