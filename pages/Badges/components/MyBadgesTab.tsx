import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Badge } from '../../../types';
import { Edit2, Trash2, Folder, Loader2, Bookmark, BookmarkX, ArrowLeft, MoreHorizontal, X, Maximize2 } from 'lucide-react';
import BadgeEditModal from './BadgeEditModal';

type SubTab = 'created' | 'saved';

const MyBadgesTab: React.FC = () => {
    const { user } = useAuth();
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('created');
    const [createdBadges, setCreatedBadges] = useState<Badge[]>([]);
    const [savedBadges, setSavedBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    // Fetch created badges
    useEffect(() => {
        if (!user) return;

        setLoading(true);
        const q = query(
            collection(db, 'badges'),
            where('creatorId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const badges = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Badge[];
            setCreatedBadges(badges);
            setLoading(false);
        }, (error) => {
            console.error('[MyBadgesTab] Error fetching created badges:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch saved badges
    useEffect(() => {
        if (!user) return;

        const fetchSavedBadges = async () => {
            try {
                const savedRef = collection(db, 'users', user.uid, 'savedBadges');
                const snapshot = await getDocs(savedRef);
                const badges = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data().badgeData
                })) as Badge[];
                setSavedBadges(badges);
            } catch (error) {
                console.error('[MyBadgesTab] Error fetching saved badges:', error);
            }
        };

        fetchSavedBadges();
    }, [user]);

    const handleDelete = async (badgeId: string) => {
        if (!confirm('Tem certeza que deseja deletar este emblema?')) return;

        try {
            await deleteDoc(doc(db, 'badges', badgeId));
            setSelectedBadge(null); // Close modal if open
        } catch (error) {
            console.error('[MyBadgesTab] Error deleting badge:', error);
            alert('Erro ao deletar emblema');
        }
    };

    const handleUnsave = async (badgeId: string) => {
        if (!user) return;

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'savedBadges', badgeId));
            setSavedBadges(prev => prev.filter(b => b.id !== badgeId));
            setSelectedBadge(null);
        } catch (error) {
            console.error('[MyBadgesTab] Error unsaving badge:', error);
            alert('Erro ao remover emblema dos salvos');
        }
    };

    const badges = activeSubTab === 'created' ? createdBadges : savedBadges;

    // View: Folders Grid
    if (!currentFolder) {
        return (
            <div className="space-y-6">
                {/* Sub-tabs inside Folder View */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => setActiveSubTab('created')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'created' ? 'bg-[#006c55] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                    >
                        Criados por Mim
                    </button>
                    <button
                        onClick={() => setActiveSubTab('saved')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'saved' ? 'bg-[#006c55] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                    >
                        Salvos
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in duration-500">
                    <button
                        onClick={() => setCurrentFolder('Estoque Geral')}
                        className="group flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left"
                    >
                        <div className="w-full aspect-[4/3] bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-500 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                            <Folder size={48} fill="currentColor" className="opacity-80" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">Estoque Geral</h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">{badges.length} itens</p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // View: Feed Grid (Inside Folder)
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => setCurrentFolder(null)}
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all active:scale-95"
                >
                    <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentFolder}</h2>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{badges.length} Emblemas</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#006c55]" /></div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6 p-4">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            onClick={() => setSelectedBadge(badge)}
                            className="group relative cursor-pointer aspect-square flex items-center justify-center transition-all duration-300 hover:scale-110 hover:z-10"
                        >
                            <img
                                src={badge.imageUrl}
                                alt={badge.name}
                                className="w-full h-full object-contain filter drop-shadow-md group-hover:drop-shadow-2xl transition-all"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selectedBadge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
                        <button
                            onClick={() => setSelectedBadge(null)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all"
                        >
                            <X size={16} />
                        </button>

                        <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 aspect-square flex items-center justify-center p-8 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                            <img
                                src={selectedBadge.imageUrl}
                                alt={selectedBadge.name}
                                className="w-full h-full object-contain drop-shadow-2xl scale-110"
                            />
                            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-black text-white">
                                {selectedBadge.width}x{selectedBadge.height}
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2">{selectedBadge.name}</h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
                                Adicionado em {new Date((selectedBadge.createdAt as any)?.seconds * 1000 || Date.now()).toLocaleDateString('pt-BR')}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {activeSubTab === 'created' ? (
                                    <>
                                        <button
                                            onClick={() => { setEditingBadge(selectedBadge); setSelectedBadge(null); }}
                                            className="flex items-center justify-center gap-2 py-3 bg-[#006c55] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#005a46] transition-all"
                                        >
                                            <Edit2 size={14} /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedBadge.id)}
                                            className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                                        >
                                            <Trash2 size={14} /> Deletar
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleUnsave(selectedBadge.id)}
                                        className="col-span-2 flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        <BookmarkX size={14} /> Remover dos Salvos
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Existing) */}
            {editingBadge && (
                <BadgeEditModal
                    badge={editingBadge}
                    onClose={() => setEditingBadge(null)}
                />
            )}
        </div>
    );
};

export default MyBadgesTab;
