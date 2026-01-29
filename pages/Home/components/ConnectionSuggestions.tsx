import React, { useRef } from 'react';
import { useConnectionSuggestions } from '../../../hooks/useConnectionSuggestions';
import { auth } from '../../../firebase';
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
import ConnectionCard from '../../../components/shared/ConnectionCard';
import ConnectionCardSkeleton from '../../../components/shared/ConnectionCardSkeleton';

const ConnectionSuggestions: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    suggestions,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    isFilterOpen,
    setIsFilterOpen,
    activeFilter,
    setActiveFilter,
    refresh,
    removeSuggestion,
    getFilterCount,
    currentUserData,
    allSuggestionsCount
  } = useConnectionSuggestions();

  // Alias for compatibility with existing JSX or just use 'suggestions' directly
  const filteredSuggestions = suggestions;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 202;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleConnectionAction = (userId: string) => {
    removeSuggestion(userId);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[350px] flex flex-col liquid-glass rounded-[24px] overflow-hidden shadow-2xl">
        <div className="flex flex-col px-6 pt-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 w-32 bg-slate-200 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="flex gap-3 px-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[190px] h-[260px] bg-slate-100 dark:bg-slate-800/40 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] flex flex-col liquid-glass rounded-[24px] px-0 pt-5 pb-0 overflow-hidden shadow-2xl group">
      {/* Decorative Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex flex-col flex-shrink-0 z-10 pb-2 px-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Conexões Sugeridas</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-1">
              expanda sua rede acadêmica
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={refresh}
              disabled={refreshing}
              className="w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-[#006c55] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-white/90 dark:border-white/10 shadow-sm active:scale-95 flex items-center justify-center"
              title="Atualizar sugestões"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${isFilterOpen ?
                  'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' :
                  'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-[#006c55] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 border border-white/90 dark:border-white/10 shadow-sm'
                  } active:scale-95`}
                title="Filtrar conexões"
              >
                <Filter size={18} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Filtrar por</span>
                  </div>
                  {[
                    { id: 'all', label: 'Todas', icon: Sparkles, count: allSuggestionsCount },
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
                          'bg-[#006c55]/10 text-[#006c55] font-bold' :
                          'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => handleScroll('left')}
                className="w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 text-[#006c55] dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition-all border border-white/90 dark:border-white/10 shadow-sm active:scale-95"
                aria-label="Rolar para esquerda"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 text-[#006c55] dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition-all border border-white/90 dark:border-white/10 shadow-sm active:scale-95"
                aria-label="Rolar para direita"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Active Filter */}
        <div className="flex items-center gap-3 px-5">
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
        className="flex items-center gap-3 overflow-x-auto overflow-y-hidden py-4 px-0 snap-x snap-mandatory no-scrollbar scroll-smooth flex-1 touch-pan-x bg-transparent"
        onScroll={() => setIsFilterOpen(false)}
      >
        {filteredSuggestions.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Users size={24} className="text-slate-300 dark:text-slate-600" />
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
              <div key={author.id} className="snap-center h-full flex items-center justify-center first:ml-5">
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

      <style jsx="true">{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-center { scroll-snap-align: center; }
        .snap-mandatory { scroll-snap-type: x mandatory; }
      `}</style>
    </div>
  );
};

export default ConnectionSuggestions;
