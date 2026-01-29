import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SidebarConfig } from '../../types';
import PostCard from './PostCard';
import NewPost from './NewPost';
import { useFeed } from '../../hooks/useFeed';
import { auth } from '../../firebase'; // Keep auth if used elsewhere, check usage.
import { Post } from '../../types'; // Keep for types if used
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  BookOpen,
  X,
  Sparkles,
  Target,
  GraduationCap,
  Calendar,
  Bookmark
} from 'lucide-react';

/**
 * SidebarFeed Component - Feed de conhecimento universitário simplificado
 */
const SidebarFeed: React.FC<SidebarConfig> = ({ title = "Feed do Conhecimento", maxPosts = 50 }) => {
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'study' | 'resource' | 'question' | 'event' | 'bookmarks'>('all');
  const { posts, loading, refreshing, handleRefresh, fetchPosts, setPosts } = useFeed(activeFilter);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Reset scroll when posts change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [posts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // handleRefresh removed (from hook)

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'bookmarks') return true; // Bookmarks já são filtrados no fetch
    return post.postType === activeFilter;
  });

  const getFilteredCount = (type: string) => {
    if (type === 'bookmarks') {
      // Se estamos visualizando os favoritos, a contagem é o total de posts carregados
      if (activeFilter === 'bookmarks') return posts.length;
      // Se estamos em outra view, não temos a contagem de favoritos carregada localmente -> retorna 0 (oculta badge)
      return 0;
    }
    return posts.filter(post => post.postType === type).length;
  };

  const filters = [
    { id: 'all', label: 'Todos', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { id: 'study', label: 'Estudos', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { id: 'resource', label: 'Recursos', icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200' },
    { id: 'question', label: 'Dúvidas', icon: Target, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    { id: 'event', label: 'Eventos', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
    { id: 'bookmarks', label: 'Salvos', icon: Bookmark, color: 'text-[#006c55]', bg: 'bg-emerald-50', border: 'border-emerald-100' }
  ];

  const getActiveFilterLabel = () => {
    const filter = filters.find(f => f.id === activeFilter);
    return filter ? filter.label : 'Todos';
  };

  return (
    <div className="relative h-full min-h-[550px] flex flex-col liquid-glass rounded-[24px] px-0 pt-5 pb-0 overflow-hidden shadow-2xl">
      {/* Header Section */}
      <div className="flex flex-col flex-shrink-0 z-10 pb-2 px-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">{title}</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-1">
              atualizações da rede
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-[#006c55] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-white/90 dark:border-white/10 shadow-sm active:scale-95 flex items-center justify-center"
              title="Atualizar feed"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {/* Botão de Filtro */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isFilterOpen ?
                  'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' :
                  'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-[#006c55] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 border border-white/90 dark:border-white/10 shadow-sm'
                  } active:scale-95`}
                title="Filtrar feed"
              >
                <Filter size={18} />
              </button>

              {/* Dropdown de Filtros */}
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Tipo de Conteúdo</span>
                  </div>
                  {filters.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.id;
                    const count = filter.id === 'all' ? posts.length : getFilteredCount(filter.id);

                    return (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setActiveFilter(filter.id as any);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${isActive ?
                          `${filter.bg} ${filter.color} font-bold` :
                          'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? filter.bg : 'bg-slate-100 dark:bg-slate-700'}`}>
                            <Icon size={14} className={isActive ? filter.color : 'text-slate-400'} />
                          </div>
                          <span className="text-[12px] font-medium">{filter.label}</span>
                        </div>
                        {count > 0 && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ?
                            'bg-white text-slate-900' :
                            'bg-slate-100 dark:bg-slate-700 text-slate-500'
                            }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Botão Nova Publicação */}
            <button
              onClick={() => setPostModalOpen(true)}
              className="w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-[#006c55] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-white/90 dark:border-white/10 shadow-sm active:scale-95 flex items-center justify-center"
              title="Nova Publicação"
            >
              <Plus size={18} strokeWidth={3} />
            </button>

            {/* Controles de Scroll */}
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

        {/* Badge do Filtro Ativo */}
        {activeFilter !== 'all' && (
          <div className="flex items-center gap-2 mt-4 px-5">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${filters.find(f => f.id === activeFilter)?.bg} border ${filters.find(f => f.id === activeFilter)?.border}`}>
              {React.createElement(filters.find(f => f.id === activeFilter)!.icon, {
                size: 12,
                className: filters.find(f => f.id === activeFilter)!.color
              })}
              <span className={`text-[10px] font-black uppercase tracking-wider ${filters.find(f => f.id === activeFilter)!.color}`}>
                {getActiveFilterLabel()}
              </span>
              <span className="text-[9px] font-bold text-slate-500 ml-1">
                ({getFilteredCount(activeFilter)} posts)
              </span>
              <button
                onClick={() => setActiveFilter('all')}
                className="ml-1 text-slate-400 hover:text-slate-600"
              >
                <X size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Cards */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-[30px] overflow-x-auto px-0 py-6 snap-x snap-mandatory no-scrollbar flex-1 bg-transparent scroll-smooth min-h-0"
      >
        {loading ? (
          <div className="w-full flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006c55]"></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <>
            {filteredPosts.slice(0, maxPosts).map((post) => (
              <div key={post.id} className="snap-start first:ml-5">
                <PostCard
                  post={post}
                  onBookmarkToggle={(postId, bookmarked) => {
                    if (activeFilter === 'bookmarks' && !bookmarked) {
                      setPosts(prev => prev.filter(p => p.id !== postId));
                    }
                  }}
                  onLikeToggle={(postId, liked) => {
                    console.log(`Post ${postId} ${liked ? 'liked' : 'unliked'}`);
                  }}
                  onDelete={(postId) => {
                    // Refresh completo para atualizar contadores (ex: repost count do original ao deletar repost)
                    fetchPosts();
                  }}
                  onRepostSuccess={fetchPosts}
                />
              </div>
            ))}
            <div className="flex-shrink-0 w-4"></div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 px-6">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <BookOpen size={24} className="opacity-30" />
            </div>
            <p className="text-sm font-medium mb-1">Nenhuma publicação encontrada</p>
            <p className="text-xs opacity-70 text-center max-w-sm">
              {activeFilter === 'all'
                ? "O feed está vazio. Seja o primeiro a compartilhar conhecimento!"
                : `Nenhum post do tipo "${getActiveFilterLabel().toLowerCase()}" encontrado.`}
            </p>
            <button
              onClick={() => setPostModalOpen(true)}
              className="mt-4 bg-[#006c55] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#005a46] transition-all"
            >
              Criar Publicação
            </button>
          </div>
        )}
      </div>

      {/* Footer Simples - Removido conforme solicitação */}

      {/* Modal de Nova Postagem */}
      <NewPost
        isOpen={isPostModalOpen}
        onClose={() => setPostModalOpen(false)}
        onPostCreated={fetchPosts}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-start { scroll-snap-align: start; }
        .snap-mandatory { scroll-snap-type: x mandatory; }
      `}</style>
    </div>
  );
};

export default SidebarFeed;
