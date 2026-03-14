import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
    X, 
    Search, 
    BookOpen, 
    ChevronRight, 
    ShieldCheck, 
    Lock, 
    Globe,
    Users,
    Hash,
    Calendar,
    CheckCircle2,
    ArrowRight,
    User
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { DisciplineService } from '../../../modules/discipline/discipline.service';
import { Discipline } from '../../../types';

interface JoinDisciplineModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const JoinDisciplineModal: React.FC<JoinDisciplineModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Discipline[]>([]);
    const [loading, setLoading] = useState(false);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    
    // Private discipline states
    const [showJoinCodeInput, setShowJoinCodeInput] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length >= 3) {
                setLoading(true);
                try {
                    const data = await DisciplineService.searchDisciplines(searchTerm);
                    setResults(data);
                } catch (err) {
                    console.error('Error searching disciplines:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    if (!isOpen) return null;

    const handleJoin = async (discipline: Discipline) => {
        if (!user) return;

        if (discipline.type === 'private' && !showJoinCodeInput) {
            setShowJoinCodeInput(discipline.id);
            setError(null);
            return;
        }

        setJoiningId(discipline.id);
        setError(null);

        try {
            if (discipline.type === 'private') {
                if (discipline.joinCode !== joinCode.toUpperCase()) {
                    setError('Código de acesso inválido.');
                    setJoiningId(null);
                    return;
                }
            }

            await DisciplineService.enrollInDiscipline(discipline.id, user.uid);
            onClose();
        } catch (err) {
            console.error('Error joining discipline:', err);
            setError('Falha ao entrar na disciplina.');
        } finally {
            setJoiningId(null);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div 
                className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Buscar Disciplina</h3>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Entre em novas turmas</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Input Area */}
                <div className="p-6 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nome ou código (ex: HBR-254)..."
                            className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-[1.5rem] text-base dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-4 no-scrollbar min-h-[300px]">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 animate-pulse">Buscando disciplinas...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 py-16 opacity-60">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-4 border border-white dark:border-white/5">
                                <Search size={32} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">
                                {searchTerm.length < 3 ? 'Digite ao menos 3 caracteres' : 'Nenhuma disciplina encontrada'}
                            </h4>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                {searchTerm.length < 3 ? 'Refine sua busca para ver resultados' : 'Verifique se o código ou nome está correto'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {results.map((discipline) => {
                                const isEnrolled = discipline.members.includes(user?.uid || '');
                                const isPrivate = discipline.type === 'private';
                                const isJoining = joiningId === discipline.id;
                                const showCode = showJoinCodeInput === discipline.id;

                                return (
                                    <div 
                                        key={discipline.id}
                                        className={`group bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-[2rem] p-4 transition-all hover:shadow-xl hover:-translate-y-1 ${isEnrolled ? 'opacity-70 grayscale-[0.5]' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div 
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6"
                                                style={{ backgroundColor: discipline.themeColor }}
                                            >
                                                <BookOpen size={24} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-[17px] font-black text-slate-900 dark:text-white truncate tracking-tight">{discipline.name}</h4>
                                                    {isPrivate ? <Lock size={14} className="text-slate-400 shrink-0" /> : <Globe size={14} className="text-emerald-500 shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                                    <span className="flex items-center gap-1"><Hash size={12} /> {discipline.code}</span>
                                                    <span className="flex items-center gap-1"><User size={12} /> {discipline.teacherName}</span>
                                                </div>
                                            </div>
                                            {isEnrolled ? (
                                                <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    <CheckCircle2 size={14} /> Inscrito
                                                </div>
                                            ) : !showCode ? (
                                                <button 
                                                    onClick={() => handleJoin(discipline)}
                                                    disabled={isJoining}
                                                    className="w-12 h-12 bg-[#006c55] text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                                                >
                                                    {isJoining ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <ChevronRight size={20} strokeWidth={3} />}
                                                </button>
                                            ) : null}
                                        </div>

                                        {/* Join Code Animated Input */}
                                        {showCode && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 animate-in slide-in-from-top-4 duration-300">
                                                <div className="flex flex-col gap-3">
                                                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                        <ShieldCheck size={14} className="text-amber-500" /> Esta disciplina é privada. Digite o código de acesso:
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text"
                                                            value={joinCode}
                                                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                                            placeholder="CÓDIGO"
                                                            maxLength={6}
                                                            className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-xl px-4 text-center font-black tracking-[0.3em] dark:text-white focus:outline-none focus:border-emerald-500 transition-all text-lg"
                                                            autoFocus
                                                        />
                                                        <button 
                                                            onClick={() => handleJoin(discipline)}
                                                            disabled={joinCode.length < 6 || isJoining}
                                                            className="px-6 bg-[#006c55] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                                        >
                                                            {isJoining ? '...' : 'Entrar'}
                                                        </button>
                                                        <button 
                                                           onClick={() => { setShowJoinCodeInput(null); setJoinCode(''); setError(null); }}
                                                           className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-200"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                    {error && (
                                                        <p className="text-[11px] font-bold text-rose-500 ml-1 animate-pulse">{error}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-6 bg-emerald-50/30 dark:bg-emerald-950/20 border-t border-emerald-100/50 dark:border-white/5 text-center">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-emerald-500/60 uppercase tracking-tighter flex items-center justify-center gap-2">
                        <Lock size={12} strokeWidth={3} /> Segurança Thoth: Disciplinas privadas requerem código do professor.
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default JoinDisciplineModal;
