import React, { useState } from 'react';
import { X, Search, UserPlus, Check, Send, Sparkles } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase';
import { SearchService } from '../../../modules/search/search.service';
import { Author } from '../../../types';
import { toast } from 'sonner';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    eventTitle: string;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, eventId, eventTitle }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Author[]>([]);
    const [loading, setLoading] = useState(false);
    const [invitedIds, setInvitedIds] = useState<string[]>([]);

    if (!isOpen) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (query.length < 2) return;

        setLoading(true);
        try {
            const users = await SearchService.searchUsers(query);
            setResults(users);
        } catch (error) {
            console.error(error);
            toast.error('Erro na busca');
        } finally {
            setLoading(false);
        }
    };

    const sendInvite = async (userId: string) => {
        try {
            await updateDoc(doc(db, 'events', eventId), {
                invited: arrayUnion(userId)
            });
            setInvitedIds([...invitedIds, userId]);
            toast.success('Convite enviado!');
        } catch (error) {
            toast.error('Erro ao enviar convite');
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-lg rounded-[32px] overflow-hidden border border-white/10 shadow-2xl flex flex-col h-[600px]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Convidar Amigos</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Convidando para: {eventTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6">
                    <form onSubmit={handleSearch} className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            autoFocus
                            placeholder="Buscar por nome ou @username"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (e.target.value.length >= 2) handleSearch(e as any);
                            }}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all"
                        />
                    </form>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar space-y-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Buscando Conexões...</span>
                        </div>
                    ) : results.length > 0 ? (
                        results.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-emerald-500/20 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{user.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1">@{user.username}</p>
                                    </div>
                                </div>

                                {invitedIds.includes(user.id) ? (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                        <Check size={14} /> Enviado
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => sendInvite(user.id)}
                                        className="p-3 rounded-xl bg-white dark:bg-white/10 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all shadow-sm group-hover:scale-105 active:scale-95"
                                    >
                                        <Send size={18} />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : query.length >= 2 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                            <Search size={32} className="opacity-10" />
                            <p className="text-xs font-bold">Nenhum usuário encontrado</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center gap-4">
                            <Sparkles size={40} className="text-emerald-500/20" />
                            <p className="text-xs font-bold max-w-[200px] leading-relaxed">
                                Digite o nome de quem você quer convidar para fortalecer seu evento.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
