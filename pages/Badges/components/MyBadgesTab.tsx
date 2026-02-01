import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Badge } from '../../../types';
import { Edit2, Trash2, Grid3x3, Loader2, Bookmark, BookmarkX } from 'lucide-react';
import BadgeEditModal from './BadgeEditModal';

type SubTab = 'created' | 'saved';

const MyBadgesTab: React.FC = () => {
    const { user } = useAuth();
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('created');
    const [createdBadges, setCreatedBadges] = useState<Badge[]>([]);
    const [savedBadges, setSavedBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

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
        } catch (error) {
            console.error('[MyBadgesTab] Error unsaving badge:', error);
            alert('Erro ao remover emblema dos salvos');
        }
    };

    const badges = activeSubTab === 'created' ? createdBadges : savedBadges;

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setActiveSubTab('created')}
                    className={`
            px-4 py-2 rounded-xl font-bold text-sm transition-all
            ${activeSubTab === 'created'
                            ? 'bg-[#006c55] dark:bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }
          `}
                >
                    Criados por Mim ({createdBadges.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('saved')}
                    className={`
            px-4 py-2 rounded-xl font-bold text-sm transition-all
            ${activeSubTab === 'saved'
                            ? 'bg-[#006c55] dark:bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }
          `}
                >
                    Salvos ({savedBadges.length})
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="text-[#006c55] dark:text-emerald-400 animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Carregando emblemas...</p>
                </div>
            ) : badges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        {activeSubTab === 'created' ? (
                            <Grid3x3 size={32} className="text-slate-400 dark:text-slate-500" />
                        ) : (
                            <Bookmark size={32} className="text-slate-400 dark:text-slate-500" />
                        )}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                        {activeSubTab === 'created' ? 'Nenhum emblema criado' : 'Nenhum emblema salvo'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
                        {activeSubTab === 'created'
                            ? 'Crie seu primeiro emblema na aba "Criar Novo"'
                            : 'Explore a aba "Descobrir" para salvar emblemas de outros usuários'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden hover:shadow-xl hover:border-[#006c55]/20 dark:hover:border-emerald-400/20 transition-all"
                        >
                            {/* Image */}
                            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 relative overflow-hidden">
                                <img
                                    src={badge.imageUrl}
                                    alt={badge.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-bold text-white">
                                    {badge.width}x{badge.height}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 truncate">
                                    {badge.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    {new Date((badge.createdAt as any)?.seconds * 1000 || Date.now()).toLocaleDateString('pt-BR')}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {activeSubTab === 'created' ? (
                                        <>
                                            <button
                                                onClick={() => setEditingBadge(badge)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#006c55] dark:bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-[#005a46] dark:hover:bg-emerald-600 transition-all active:scale-95"
                                            >
                                                <Edit2 size={14} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(badge.id)}
                                                className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all active:scale-95"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleUnsave(badge.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                                        >
                                            <BookmarkX size={14} />
                                            Remover
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
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
