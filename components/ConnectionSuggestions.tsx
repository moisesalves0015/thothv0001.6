import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ConnectionService } from '../modules/connection/connection.service';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Author } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  RefreshCw,
  Search,
  Filter,
  X,
  UserPlus,
  Sparkles
} from 'lucide-react';
import ConnectionCard from './ConnectionCard';

const ConnectionSuggestions: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<Author[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Author[]>([]);
  const [currentUserData, setCurrentUserData] = useState<Author | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'university' | 'course'>('all');

  const fetchSuggestions = useCallback(async (userId: string) => {
    try {
      const list = await ConnectionService.getSuggestions(userId);
      setSuggestions(list);
      setFilteredSuggestions(list);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, []);

  const loadUserData = useCallback(async (user: any) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const userData: Author = {
          id: user.uid,
          name: data.fullName || user.displayName || "Usuário",
          username: data.username || `@${user.email?.split('@')[0] || 'usuario'}`,
          avatar: data.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          university: data.university,
          course: data.course,
          stats: data.stats || { followers: 0, projects: 0 }
        };
        setCurrentUserData(userData);
        await fetchSuggestions(user.uid);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [fetchSuggestions]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user);
        setLoading(false);
      }
    });

    return () => unsub();
  }, [loadUserData]);

  useEffect(() => {
    let filtered = suggestions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.university?.toLowerCase().includes(query) ||
        user.course?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (activeFilter === 'university') {
          return user.university && user.university === currentUserData?.university;
        }
        if (activeFilter === 'course') {
          return user.course && user.course === currentUserData?.course;
        }
        return true;
      });
    }

    setFilteredSuggestions(filtered);
  }, [suggestions, searchQuery, activeFilter, currentUserData]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 202;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (auth.currentUser) {
      await fetchSuggestions(auth.currentUser.uid);
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleConnectionAction = (userId: string) => {
    // Atualizar localmente após ação
    setFilteredSuggestions(prev => prev.filter(user => user.id !== userId));
  };

  const getFilterCount = (type: 'university' | 'course') => {
    if (!currentUserData) return 0;

    return suggestions.filter(user => {
      if (type === 'university') {
        return user.university && user.university === currentUserData.university;
      }
      return user.course && user.course === currentUserData.course;
    }).length;
  };

  if (loading) {
    return (
      <div className="relative w-full h-[350px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex flex-col px-6 pt-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 w-32 bg-slate-200 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="flex gap-3 px-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[190px] h-[260px] bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl group">
      {/* Decorative Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex flex-col px-6 pt-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">

              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Conexões Sugeridas</h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] dark:text-emerald-400 mt-1 opacity-80">
              expanda sua rede acadêmica
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-white/60 text-slate-600 hover:text-[#006c55] hover:bg-white transition-all border border-white/90 shadow-sm active:scale-90"
              title="Atualizar sugestões"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2 rounded-lg transition-all ${isFilterOpen ?
                  'bg-[#006c55] text-white' :
                  'bg-white/60 text-slate-600 hover:text-[#006c55] hover:bg-white border border-white/90'
                  } shadow-sm active:scale-90`}
                title="Filtrar conexões"
              >
                <Filter size={14} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Filtrar por</span>
                  </div>
                  {[
                    { id: 'all', label: 'Todas', icon: Sparkles, count: suggestions.length },
                    { id: 'university', label: 'Mesma Universidade', icon: Users, count: getFilterCount('university') },
                    { id: 'course', label: 'Mesmo Curso', icon: Users, count: getFilterCount('course') }
                  ].map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setActiveFilter(filter.id as any);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${isActive ?
                          'bg-[#006c55]/5 text-[#006c55] font-bold' :
                          'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={14} className={isActive ? 'text-[#006c55]' : 'text-slate-400'} />
                          <span className="text-[12px] font-medium">{filter.label}</span>
                        </div>
                        {filter.count > 0 && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ?
                            'bg-[#006c55] text-white' :
                            'bg-slate-100 text-slate-500'
                            }`}>
                            {filter.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scroll Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => handleScroll('left')}
                className="p-2 rounded-lg bg-white/60 text-[#006c55] hover:bg-white transition-all border border-white/90 shadow-sm active:scale-90"
                aria-label="Rolar para esquerda"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2 rounded-lg bg-white/60 text-[#006c55] hover:bg-white transition-all border border-white/90 shadow-sm active:scale-90"
                aria-label="Rolar para direita"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Active Filter */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}


          {/* Active Filter Badge */}
          {activeFilter !== 'all' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#006c55]/10 to-[#006c55]/5 rounded-lg border border-[#006c55]/20">
              <Users size={12} className="text-[#006c55]" />
              <span className="text-[10px] font-black text-[#006c55] uppercase tracking-wider">
                {activeFilter === 'university' ? 'Mesma Universidade' : 'Mesmo Curso'}
              </span>
              <span className="text-[9px] font-bold text-slate-500 ml-1">
                ({getFilterCount(activeFilter)})
              </span>
              <button
                onClick={() => setActiveFilter('all')}
                className="ml-1 text-slate-400 hover:text-slate-600"
              >
                <X size={10} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Connection Cards */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto overflow-y-hidden py-4 px-6 snap-x snap-mandatory no-scrollbar scroll-smooth flex-1 touch-pan-x bg-transparent"
        onScroll={() => setIsFilterOpen(false)}
      >
        {filteredSuggestions.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Users size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">
              {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhuma sugestão disponível'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm">
              {searchQuery
                ? 'Tente buscar por termos diferentes ou limpe os filtros.'
                : 'Conecte-se com mais pessoas ou atualize para novas sugestões.'}
            </p>
            {(searchQuery || activeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="mt-4 bg-[#006c55] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#005a46] transition-all"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {filteredSuggestions.map((author) => (
              <div key={author.id} className="snap-center h-full flex items-center justify-center">
                <ConnectionCard
                  author={author}
                  currentUid={auth.currentUser?.uid}
                  currentUserData={currentUserData}
                  onActionComplete={() => handleConnectionAction(author.id)}
                />
              </div>
            ))}
            <div className="flex-shrink-0 w-2"></div>
          </>
        )}
      </div>

      {/* Footer - Removido conforme solicitação */}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-center { scroll-snap-align: center; }
        .snap-mandatory { scroll-snap-type: x mandatory; }
      `}</style>
    </div>
  );
};

export default ConnectionSuggestions;
