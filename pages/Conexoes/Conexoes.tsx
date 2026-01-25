import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { UserPlus, Sparkles, Clock, ArrowRight, Ban, Trash2 } from 'lucide-react';
import ConnectionCard from '../../components/ConnectionCard';
import ConnectionCardSkeleton from '../../components/ConnectionCardSkeleton';
import { ConnectionService } from '../../modules/connection/connection.service';
import { Author } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

// Subcomponents
import StatsHeader from './components/StatsHeader';
import FilterBar from './components/FilterBar';
import ConfirmationModal from './components/ConfirmationModal';
import FeedbackToast, { ToastProps } from './components/FeedbackToast';

// Tipo Extendido
type ConnectionAuthor = Author & { connectedAt?: string };

const Conexoes: React.FC = () => {
  const { user } = useAuth();
  const [currentUserData, setCurrentUserData] = useState<Author | undefined>(undefined);

  // Dados
  const [pendingRequests, setPendingRequests] = useState<Author[]>([]);
  const [sentRequests, setSentRequests] = useState<Author[]>([]);
  const [connections, setConnections] = useState<ConnectionAuthor[]>([]);
  const [suggestions, setSuggestions] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'az'>('recent');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, targetId: string, name: string } | null>(null);

  // Carregar Dados
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // 1. User Data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentUserData({
            id: user.uid,
            name: data.fullName || data.name,
            username: data.username,
            avatar: data.photoURL,
            university: data.university,
            stats: data.stats
          });
        }

        // 2. Received Requests (Existing Service)
        const reqs = await ConnectionService.getPendingRequests(user.uid);
        setPendingRequests(reqs);

        // 3. Sent Requests (New Service Method)
        const sentData = await ConnectionService.getSentRequests(user.uid);
        setSentRequests(sentData);

        // 4. Accepted Connections
        const conns = await ConnectionService.getConnections(user.uid);
        setConnections(conns);

        // 5. Suggestions
        const suggs = await ConnectionService.getSuggestions(user.uid);
        setSuggestions(suggs);

      } catch (error) {
        console.error(error);
        showToast("Erro ao carregar dados.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);


  // Computed Lists
  const filteredConnections = useMemo(() => {
    let result = [...connections];
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        (c.username && c.username.toLowerCase().includes(lower)) ||
        (c.university && c.university.toLowerCase().includes(lower))
      );
    }
    if (sortBy === 'az') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => {
        const da = a.connectedAt ? new Date(a.connectedAt).getTime() : 0;
        const db = b.connectedAt ? new Date(b.connectedAt).getTime() : 0;
        return db - da;
      });
    }
    return result;
  }, [connections, searchTerm, sortBy]);


  // Actions
  const celebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#006c55', '#d9f1a2', '#ffffff']
    });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, onClose: () => setToast(null) });
  };

  const handleAcceptRequest = (author: Author) => {
    // Optimistic UI
    setPendingRequests(prev => prev.filter(p => p.id !== author.id));
    setConnections(prev => [{ ...author, connectedAt: new Date().toISOString() } as ConnectionAuthor, ...prev]);
    showToast(`Você agora está conectado com ${author.name.split(' ')[0]}`, "success");
    // Removido celebrate() daqui pois o ConnectionCard já faz internamente
  };

  const handleRejectRequest = (id: string, name: string) => {
    setPendingRequests(prev => prev.filter(p => p.id !== id));
    showToast(`Solicitação de ${name} recusada.`, "success");
  };

  const handleCancelSent = async (id: string) => {
    // UI updatehandled by ConnectionCard normally, but for the specific Sent list we manual update
    if (user) {
      await ConnectionService.removeConnection(user.uid, id, false);
      setSentRequests(prev => prev.filter(p => p.id !== id));
      showToast("Solicitação cancelada.", "success");
    }
  };

  const confirmRemoveConnection = (id: string, name: string) => {
    setConfirmModal({ isOpen: true, targetId: id, name });
  };

  const executeRemoveConnection = async () => {
    if (!confirmModal || !user) return;

    try {
      await ConnectionService.removeConnection(user.uid, confirmModal.targetId, true);
      setConnections(prev => prev.filter(c => c.id !== confirmModal.targetId));
      showToast("Conexão removida com sucesso.", "success");
    } catch (error) {
      showToast("Erro ao remover conexão.", "error");
    } finally {
      setConfirmModal(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">

      {/* Header */}
      <StatsHeader
        connectionCount={connections.length}
        pendingCount={pendingRequests.length}
        sentCount={sentRequests.length}
      />

      {/* SECTION: PENDING (RECEIVED) */}
      {pendingRequests.length > 0 && (
        <section className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
              <UserPlus size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Solicitações Recebidas</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Pessoas querendo conectar</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex justify-center">
                <ConnectionCard
                  author={req}
                  currentUid={user?.uid}
                  currentUserData={currentUserData}
                  initialStatus="pending_received"
                  onActionComplete={() => handleAcceptRequest(req)} // Card handles logic, we update UI
                // Not perfect: Card calls accept, then we verify? 
                // Hack: ConnectionCard calls onActionComplete AFTER success. 
                // We pass a dummy 'accept' here assuming card did it, OR we rely on standard card behavior
                // Actually, let's keep it simple: Card does the logic, calls this cb, we update lists.
                // Wait, if Card does logic, we shouldn't duplicate toast if feasible.
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION: SENT REQUESTS (New Feature) */}
      {sentRequests.length > 0 && (
        <section className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Convites Enviados</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Aguardando resposta</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {sentRequests.map(req => (
              <div key={req.id} className="flex justify-center relative group">
                <ConnectionCard
                  author={req}
                  currentUid={user?.uid}
                  currentUserData={currentUserData}
                  initialStatus="pending_sent"
                // We need to allow cancelling. Card has "clock" disabled. 
                // We can overlay a cancel button or modify Card.
                // Let's modify Card interactively? No, let's wrap it with a helper act
                />
                <button
                  onClick={() => handleCancelSent(req.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-100/90 hover:bg-red-200 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100 shadow-sm z-10"
                  title="Cancelar solicitação"
                >
                  <Ban size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION: NETWORK */}
      <section className="flex flex-col gap-6">

        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalResults={filteredConnections.length}
        />

        <div className="min-h-[200px]">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => <ConnectionCardSkeleton key={i} />)}
            </div>
          ) : filteredConnections.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 animate-in fade-in duration-500">
              {filteredConnections.map(conn => (
                <div key={conn.id} className="flex justify-center relative group/card">
                  <ConnectionCard
                    author={conn}
                    currentUid={user?.uid}
                    currentUserData={currentUserData}
                    initialStatus="accepted"
                    onActionComplete={() => confirmRemoveConnection(conn.id, conn.name)}
                  // Hack: Card 'remove' button would trigger service. 
                  // We want to intercept. Card implementation of 'remove' logic might need adjustment 
                  // or we just rely on Card doing it and we confirm BEFORE calling Card?
                  // Since Card has internal handleAction, we can't easily intercept unless we change Card props.
                  // For now, let's assume specific "Remove" button on Card calls onActionComplete? 
                  // Actually Card implementation calls service THEN onActionComplete.
                  // To support "Confirm before action", we need to control the action trigger.
                  // Quick fix: Add specific "Delete" button wrapper here like we did for Cancel.
                  />
                  {/* Custom Delete Trigger Overlay (Only shows on accepted cards in this view) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); confirmRemoveConnection(conn.id, conn.name); }}
                    className="absolute top-2 right-2 p-1.5 bg-slate-900/10 hover:bg-red-500 text-slate-600 hover:text-white rounded-lg opacity-0 group-hover/card:opacity-100 transition-all backdrop-blur-sm z-10"
                    title="Remover conexão"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                <Sparkles size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                {searchTerm ? `Nenhum resultado para "${searchTerm}"` : "Sua rede está vazia"}
              </h3>
              <p className="text-slate-500 max-w-sm mt-2">
                {searchTerm
                  ? "Tente buscar por outro nome ou verifique a ortografia."
                  : "Conecte-se com colegas e professores para vê-los aqui. Veja as sugestões abaixo!"}
              </p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                  Limpar busca
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* SECTION: SUGGESTIONS */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-3xl p-8 border border-purple-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Sugestões para você</h2>
              <p className="text-sm text-slate-500 font-medium">Baseado no seu perfil e interesses</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-purple-800 hover:bg-purple-100/50 px-4 py-2 rounded-xl transition-all">
            Ver todas <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 relative z-10">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <ConnectionCardSkeleton key={i} />)
          ) : suggestions.slice(0, 18).map(sug => (
            <div key={sug.id} className="flex justify-center">
              <ConnectionCard
                author={sug}
                currentUid={user?.uid}
                currentUserData={currentUserData}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Modals & Toasts */}
      <ConfirmationModal
        isOpen={!!confirmModal}
        title="Remover Conexão"
        message={`Tem certeza que deseja remover ${confirmModal?.name} da sua rede? Eles só poderão conectar novamente enviando uma nova solicitação.`}
        confirmText="Remover"
        isDestructive={true}
        onConfirm={executeRemoveConnection}
        onCancel={() => setConfirmModal(null)}
      />

      {toast && <FeedbackToast {...toast} />}
    </div>
  );
};

export default Conexoes;
