import React, { useState, useEffect } from 'react';
import { Author } from '../types';
import { User, Layers, Plus, Check, Loader2, Clock, Play } from 'lucide-react';
import { ConnectionService } from '../modules/connection/connection.service';

interface ConnectionCardProps {
  author: Author;
  currentUid?: string;
  currentUserData?: Author;
  initialStatus?: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
  onActionComplete?: () => void; // Para recarregar listas pai se necessário
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ author, currentUid, currentUserData, initialStatus, onActionComplete }) => {
  const [status, setStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>(initialStatus || 'none');
  const [loading, setLoading] = useState(false);

  // Se não foi passado status inicial, verifica (útil em listas gerais)
  useEffect(() => {
    if (!initialStatus && currentUid) {
      ConnectionService.getConnectionStatus(currentUid, author.id).then(res => setStatus(res.status));
    }
  }, [currentUid, author.id, initialStatus]);

  const handleAction = async (action: 'connect' | 'accept' | 'reject' | 'remove') => {
    if (!currentUid || !currentUserData || loading) return;

    setLoading(true);
    try {
      if (action === 'connect') {
        await ConnectionService.sendConnectionRequest(currentUid, currentUserData, author.id, author);
        setStatus('pending_sent');
      } else if (action === 'accept') {
        await ConnectionService.acceptConnectionRequest(currentUid, author.id);
        setStatus('accepted');
      } else if (action === 'reject') {
        await ConnectionService.removeConnection(currentUid, author.id, false);
        setStatus('none');
      } else if (action === 'remove') {
        await ConnectionService.removeConnection(currentUid, author.id, status === 'accepted');
        setStatus('none');
      }

      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error("Erro na ação de conexão:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-shrink-0 w-[190px] h-[260px] relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-white/20">
      {/* Camada 1: Imagem de Fundo Total */}
      <img
        src={author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${author.name}`}
        alt={author.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
      />

      {/* Camada 2 & 3: Painel com efeito Glassmorphism */}
      <div className="absolute bottom-2 left-2 right-2 p-3 rounded-xl bg-white/75 backdrop-blur-xl border border-white/40 flex flex-col gap-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300">

        {/* Camada 4: Conteúdo (Texto e Botões) */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <h4 className="text-[13px] font-black text-slate-900 leading-tight truncate">
              {author.name}
            </h4>
            {author.verified && (
              <div className="bg-[#006c55] rounded-full p-0.5 flex items-center justify-center flex-shrink-0">
                <svg className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
          <p className="text-[9px] font-bold text-slate-500 leading-tight line-clamp-1 mt-0.5">
            {author.university || "Estudante"}
          </p>
        </div>

        {/* Stats & Action */}
        <div className="flex items-center justify-between mt-0.5 pt-1.5 border-t border-slate-100/80">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <User size={10} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-700">{author.stats?.followers || 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Layers size={10} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-700">{author.stats?.projects || 0}</span>
            </div>
          </div>

          <div className="flex gap-1">
            {/* Logic for Different Buttons */}
            {status === 'none' && (
              <button
                onClick={() => handleAction('connect')}
                disabled={loading}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 transition-all shadow-sm active:scale-90"
                title="Conectar"
              >
                {loading ? <Loader2 size={12} className="animate-spin text-[#006c55]" /> : <Plus size={12} strokeWidth={3} />}
              </button>
            )}

            {status === 'pending_sent' && (
              <button
                disabled
                className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-400 border border-slate-200 transition-all shadow-sm cursor-not-allowed"
                title="Solicitação Enviada"
              >
                <Clock size={12} strokeWidth={3} />
              </button>
            )}

            {status === 'pending_received' && (
              <>
                <button
                  onClick={() => handleAction('accept')}
                  disabled={loading}
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-[#006c55] text-white hover:bg-[#005a46] border border-transparent transition-all shadow-sm active:scale-90"
                  title="Aceitar"
                >
                  <Check size={12} strokeWidth={3} />
                </button>
              </>
            )}

            {status === 'accepted' && (
              <button
                disabled={loading} // TODO: Open Chat
                className="flex items-center justify-center w-7 h-7 rounded-full bg-[#006c55] text-white hover:bg-[#005a46] border border-transparent transition-all shadow-sm active:scale-90"
                title="Conexão (Enviar Mensagem)"
              >
                <Play size={10} fill="currentColor" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;
