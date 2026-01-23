
import React, { useState, useRef, useEffect } from 'react';
import { SidebarConfig } from '../types';
import PostCard from './PostCard';
import NewPost from './NewPost';
import { PostService } from '../modules/post/post.service';
import { auth } from '../firebase';
import { Post } from '../types';

/**
 * SidebarFeed Component - Padronizado com as demais caixas do sistema.
 */
const SidebarFeed: React.FC<SidebarConfig> = ({ title, maxPosts = 50 }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchPosts = async () => {
    try {
      if (auth.currentUser) {
        const feedPosts = await PostService.getFeedPosts(auth.currentUser.uid);
        setPosts(feedPosts);
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Largura da Caixa P (315) + Gap (30) = 345
      const scrollAmount = 345;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative h-full min-h-[550px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Section Unified - Identico ao RemindersBox */}
      <div className="flex flex-col px-6 pt-6 mb-4 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">{title}</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPostModalOpen(true)}
              className="flex items-center gap-2 bg-[#006c55] hover:bg-[#005a46] text-white px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all shadow-lg shadow-[#006c55]/20 active:scale-95"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
              <span className="hidden sm:inline">Nova Publicação</span>
            </button>

            <div className="hidden md:flex gap-2">
              <button
                onClick={() => handleScroll('left')}
                className="p-2.5 rounded-lg bg-white/60 text-[#006c55] hover:bg-white transition-all border border-white/90 shadow-sm active:scale-90"
                aria-label="Rolar para esquerda"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2.5 rounded-lg bg-white/60 text-[#006c55] hover:bg-white transition-all border border-white/90 shadow-sm active:scale-90"
                aria-label="Rolar para direita"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">atualizações da rede</span>
      </div>

      {/* Grid de Cards - Fundo Transparente para unificar com o cabeçalho */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-[30px] overflow-x-auto px-6 py-8 snap-x snap-mandatory no-scrollbar flex-1 bg-transparent scroll-smooth"
      >
        {loading ? (
          <div className="w-full flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006c55]"></div>
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.slice(0, maxPosts).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            <div className="flex-shrink-0 w-4"></div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="text-sm font-medium">Nenhuma publicação ainda.</p>
            <p className="text-xs opacity-70">Conecte-se com pessoas ou faça sua primeira publicação!</p>
          </div>
        )}
      </div>

      <NewPost
        isOpen={isPostModalOpen}
        onClose={() => setPostModalOpen(false)}
        onPostCreated={fetchPosts}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SidebarFeed;
