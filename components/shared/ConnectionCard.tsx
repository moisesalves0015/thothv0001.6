import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Author } from '../../types';
import { User, Layers, Plus, Check, Loader2, Clock, MessageCircle, X, UserCheck, UserX, MoreVertical, BookOpen, MapPin, GraduationCap, Shield, Star } from 'lucide-react';
import { ConnectionService } from '../../modules/connection/connection.service';
import { NotificationService } from '../../modules/notification/notification.service';

interface ConnectionCardProps {
  author: Author;
  currentUid?: string;
  currentUserData?: Author;
  initialStatus?: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
  onActionComplete?: () => void;
  showRemoveOption?: boolean;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  author,
  currentUid,
  currentUserData,
  initialStatus,
  onActionComplete,
  showRemoveOption = true
}) => {
  const [status, setStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>(initialStatus || 'none');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const celebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#006c55', '#d9f1a2', '#ffffff']
    });
  };

  // Se inicialStatus mudar externamente, atualiza o local
  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  // Se não foi passado status inicial, verifica
  useEffect(() => {
    if (!initialStatus && currentUid) {
      ConnectionService.getConnectionStatus(currentUid, author.id).then(res => setStatus(res.status));
    }
  }, [currentUid, author.id, initialStatus]);

  // Helper para marcar notificação relacionada como concluída
  const markRelatedNotificationAsDone = async (userId: string, fromUserId: string) => {
    try {
      const notifs = await NotificationService.getNotifications(userId);
      const relatedNotif = notifs.find(
        n => n.type === 'connection' && n.metadata?.fromUserId === fromUserId && !n.isRead
      );

      if (relatedNotif?.id) {
        await NotificationService.markActionDone(relatedNotif.id);
      }
    } catch (error) {
      console.error('Error marking notification:', error);
    }
  };

  const handleAction = async (action: 'connect' | 'accept' | 'reject' | 'remove' | 'cancel') => {
    if (!currentUid || !currentUserData || loading) return;

    setLoading(true);
    try {
      switch (action) {
        case 'connect':
          await ConnectionService.sendConnectionRequest(currentUid, currentUserData, author.id, author);
          setStatus('pending_sent');
          break;
        case 'accept':
          await ConnectionService.acceptConnectionRequest(currentUid, author.id);
          setStatus('accepted');
          celebrate();
          // Marca notificação relacionada como concluída
          await markRelatedNotificationAsDone(currentUid, author.id);
          break;
        case 'reject':
          await ConnectionService.removeConnection(currentUid, author.id, false);
          setStatus('none');
          setShowRejectConfirm(false);
          // Marca notificação relacionada como concluída
          await markRelatedNotificationAsDone(currentUid, author.id);
          break;
        case 'remove':
          await ConnectionService.removeConnection(currentUid, author.id, true);
          setStatus('none');
          setShowRemoveConfirm(false);
          break;
        case 'cancel':
          await ConnectionService.removeConnection(currentUid, author.id, false);
          setStatus('none');
          break;
      }

      setShowMenu(false);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error("Erro na ação de conexão:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseAbbreviation = (course?: string) => {
    if (!course) return '';
    const words = course.split(' ');
    if (words.length === 1) return course.substring(0, 10);
    return words.map(word => word[0].toUpperCase()).join('');
  };

  return (
    <div className="flex-shrink-0 w-[190px] h-[260px] relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group border border-white/20">
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        {/* Background Image */}
        <img
          src={author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${author.name}`}
          alt={author.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
      </div>

      {/* Glass Panel Overlay */}
      <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300">

        {/* User Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between mb-0.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <h4 className="text-[13px] font-black text-white leading-tight truncate shadow-sm">
                  {author.name}
                </h4>
                {author.verified && (
                  <div className="bg-[#006c55] rounded-full p-0.5 flex items-center justify-center flex-shrink-0 border border-white/20">
                    <Check size={8} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-white/80 leading-tight truncate">
                {author.university && (
                  <span className="truncate">{author.university}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end pt-1 border-t border-white/20">
          <div className="flex items-center gap-1.5">
            {/* Estado: Nenhuma conexão */}
            {status === 'none' && (
              <button
                onClick={() => handleAction('connect')}
                disabled={loading}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#006c55] text-white hover:bg-[#005a46] border border-transparent transition-all shadow-sm active:scale-90"
                title="Enviar solicitação de conexão"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} strokeWidth={3} />}
              </button>
            )}

            {/* Estado: Solicitação enviada (aguardando) */}
            {status === 'pending_sent' && (
              <>
                <button
                  disabled
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 border border-amber-200 transition-all shadow-sm"
                  title="Solicitação enviada"
                >
                  <Clock size={12} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={loading}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all shadow-sm active:scale-90"
                  title="Cancelar solicitação"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <X size={12} strokeWidth={3} />}
                </button>
              </>
            )}

            {/* Estado: Solicitação recebida */}
            {status === 'pending_received' && (
              <>
                <button
                  onClick={() => handleAction('accept')}
                  disabled={loading}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 border border-transparent transition-all shadow-sm active:scale-90"
                  title="Aceitar solicitação"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={3} />}
                </button>
                <button
                  onClick={() => setShowRejectConfirm(true)}
                  disabled={loading}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200 transition-all shadow-sm active:scale-90"
                  title="Recusar solicitação"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </>
            )}

            {/* Estado: Conexão aceita */}
            {status === 'accepted' && (
              <>
                <button
                  onClick={async () => {
                    if (currentUid) {
                      const chatId = await import('../../modules/chat/chat.service').then(m =>
                        m.ChatService.getOrCreateDirectChat(currentUid, author.id, author)
                      );
                      window.location.href = `/mensagens?chatId=${chatId}`; // Force reload or use navigate if available in scope
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 border border-transparent transition-all shadow-sm active:scale-90"
                  title="Enviar mensagem"
                >
                  <MessageCircle size={12} strokeWidth={2.5} />
                </button>

                {showRemoveOption && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all shadow-sm active:scale-90"
                      title="Mais opções"
                    >
                      <MoreVertical size={12} strokeWidth={2.5} />
                    </button>

                    {/* Menu Dropdown - Posicionado para cima para evitar corte */}
                    {showMenu && (
                      <>
                        <div className="fixed inset-0 z-[1001]" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white/95 backdrop-blur-xl border border-white/40 rounded-xl shadow-2xl z-[1002] py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <MessageCircle size={12} /> Enviar mensagem
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <User size={12} /> Ver perfil completo
                          </button>
                          <div className="h-px bg-slate-100 my-1 mx-2" />
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              setShowRemoveConfirm(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <UserX size={12} /> Remover conexão
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmação de Rejeição */}
      {showRejectConfirm && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowRejectConfirm(false)} />
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
            <div className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-xl p-4 mx-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mb-2">
                  <X size={20} className="text-rose-500" />
                </div>
                <h5 className="text-[13px] font-black text-slate-900 mb-1">Recusar conexão?</h5>
                <p className="text-[11px] text-slate-500 mb-3">
                  {author.name} não será notificado sobre esta ação.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectConfirm(false)}
                    className="px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={loading}
                    className="px-3 py-1.5 text-[11px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {loading ? <Loader2 size={10} className="animate-spin" /> : 'Recusar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmação de Remoção */}
      {showRemoveConfirm && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowRemoveConfirm(false)} />
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
            <div className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-xl p-4 mx-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mb-2">
                  <UserX size={20} className="text-rose-500" />
                </div>
                <h5 className="text-[13px] font-black text-slate-900 mb-1">Remover conexão?</h5>
                <p className="text-[11px] text-slate-500 mb-3">
                  Esta ação é irreversível. {author.name} será removido da sua lista de conexões.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRemoveConfirm(false)}
                    className="px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleAction('remove')}
                    disabled={loading}
                    className="px-3 py-1.5 text-[11px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {loading ? <Loader2 size={10} className="animate-spin" /> : 'Remover'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};


export default ConnectionCard;