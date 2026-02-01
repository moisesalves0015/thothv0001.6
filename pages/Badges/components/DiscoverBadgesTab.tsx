import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Badge } from '../../../types';
import { Search, Loader2, Bookmark, BookmarkCheck, Sparkles, TrendingUp, Clock } from 'lucide-react';

type SortType = 'recent' | 'popular';

const DiscoverBadgesTab: React.FC = () => {
    const { user } = useAuth();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortType>('recent');
    const [savedBadgeIds, setSavedBadgeIds] = useState<Set<string>>(new Set());

    // Fetch public badges
    useEffect(() => {
        if (!user) return;

        setLoading(true);
        const q = query(
            collection(db, 'badges'),
            where('isPublic', '==', true),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allBadges = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Badge[];

            // Filter out user's own badges
            const othersBadges = allBadges.filter(b => b.creatorId !== user.uid);
            setBadges(othersBadges);
            setLoading(false);
        }, (error) => {
            console.error('[DiscoverBadgesTab] Error fetching badges:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch saved badge IDs
    useEffect(() => {
        if (!user) return;

        const fetchSavedIds = async () => {
            try {
                const savedRef = collection(db, 'users', user.uid, 'savedBadges');
                const snapshot = await getDoc(doc(db, 'users', user.uid));
                // We'll track saved IDs in real-time
                const unsubscribe = onSnapshot(savedRef, (snapshot) => {
                    const ids = new Set(snapshot.docs.map(doc => doc.id));
                    setSavedBadgeIds(ids);
                });
                return unsubscribe;
            } catch (error) {
                console.error('[DiscoverBadgesTab] Error fetching saved IDs:', error);
            }
        };

        fetchSavedIds();
    }, [user]);

    const handleSave = async (badge: Badge) => {
        if (!user) return;

        try {
            const savedRef = doc(db, 'users', user.uid, 'savedBadges', badge.id);
            await setDoc(savedRef, {
                badgeId: badge.id,
                savedAt: new Date(),
                badgeData: badge
            });
            setSavedBadgeIds(prev => new Set([...prev, badge.id]));
        } catch (error) {
            console.error('[DiscoverBadgesTab] Error saving badge:', error);
            alert('Erro ao salvar emblema');
        }
    };

    // Filter and sort badges
    const filteredBadges = badges
        .filter(badge =>
            badge.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'popular') {
                return (b.usageCount || 0) - (a.usageCount || 0);
            }
            // Default: recent
            const aTime = (a.createdAt as any)?.seconds || 0;
            const bTime = (b.createdAt as any)?.seconds || 0;
            return bTime - aTime;
        });

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar emblemas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#006c55] dark:focus:ring-emerald-400 transition-all"
                    />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSortBy('recent')}
                        className={`
              flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all
              ${sortBy === 'recent'
                                ? 'bg-[#006c55] dark:bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }
            `}
                    >
                        <Clock size={16} />
                        Recentes
                    </button>
                    <button
                        onClick={() => setSortBy('popular')}
                        className={`
              flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all
              ${sortBy === 'popular'
                                ? 'bg-[#006c55] dark:bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }
            `}
                    >
                        <TrendingUp size={16} />
                        Populares
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="text-[#006c55] dark:text-emerald-400 animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Carregando emblemas...</p>
                </div>
            ) : filteredBadges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Sparkles size={32} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                        {searchQuery ? 'Nenhum emblema encontrado' : 'Nenhum emblema disponível'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
                        {searchQuery
                            ? 'Tente buscar por outro termo'
                            : 'Ainda não há emblemas públicos de outros usuários'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBadges.map((badge) => {
                        const isSaved = savedBadgeIds.has(badge.id);
                        return (
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
                                    {isSaved && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 backdrop-blur-sm rounded-lg text-xs font-bold text-white flex items-center gap-1">
                                            <BookmarkCheck size={12} />
                                            Salvo
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 truncate">
                                        {badge.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                        por {badge.creatorName || 'Usuário'}
                                    </p>

                                    {/* Actions */}
                                    <button
                                        onClick={() => !isSaved && handleSave(badge)}
                                        disabled={isSaved}
                                        className={`
                      w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all
                      ${isSaved
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                                : 'bg-[#006c55] dark:bg-emerald-500 text-white hover:bg-[#005a46] dark:hover:bg-emerald-600 active:scale-95'
                                            }
                    `}
                                    >
                                        {isSaved ? (
                                            <>
                                                <BookmarkCheck size={14} />
                                                Já Salvo
                                            </>
                                        ) : (
                                            <>
                                                <Bookmark size={14} />
                                                Salvar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DiscoverBadgesTab;
