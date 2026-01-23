
import React, { useRef, useEffect, useState } from 'react';
import ConnectionCard from './ConnectionCard';
import { ConnectionService } from '../modules/connection/connection.service';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Author } from '../types';

const ConnectionSuggestions: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<Author[]>([]);
  const [currentUserData, setCurrentUserData] = useState<Author | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Fetch Current User Data
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setCurrentUserData({
              id: user.uid,
              name: data.fullName || user.displayName || "Usuário",
              username: data.username,
              avatar: data.photoURL || user.photoURL || "",
              university: data.university,
              stats: data.stats
            });

            // 2. Fetch Suggestions
            const list = await ConnectionService.getSuggestions(user.uid);
            setSuggestions(list);
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsub();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 202; // Card width (190) + Gap (12)
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return (
    <div className="relative w-full h-[350px] lg:h-[350px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl animate-pulse">
      <div className="p-6">
        <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
        <div className="flex gap-4">
          {[1, 2, 3].map(i => <div key={i} className="w-[190px] h-[260px] bg-slate-100 rounded-2xl"></div>)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[350px] lg:h-[350px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Unified - Padronizado com SidebarFeed e RemindersBox */}
      <div className="flex flex-col px-6 pt-6 mb-4 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Sugestões de Conexão</h2>

          <div className="flex gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 rounded-lg bg-white/60 text-[#006c55] hover:bg-white transition-all border border-white/90 shadow-sm active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2 rounded-lg bg-white/60 text-[#006c55] hover:bg-white transition-all border border-white/90 shadow-sm active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">comunidade thoth</span>
      </div>

      {/* Horizontal List */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto overflow-y-hidden pt-1 pb-4 px-6 snap-x snap-mandatory no-scrollbar scroll-smooth flex-1 touch-pan-x bg-transparent"
      >
        {suggestions.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
            Nenhuma sugestão no momento.
          </div>
        ) : (
          suggestions.map((author) => (
            <div key={author.id} className="snap-center h-full flex items-center">
              <ConnectionCard
                author={author}
                currentUid={auth.currentUser?.uid}
                currentUserData={currentUserData}
              />
            </div>
          ))
        )}
        <div className="flex-shrink-0 w-2"></div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ConnectionSuggestions;
