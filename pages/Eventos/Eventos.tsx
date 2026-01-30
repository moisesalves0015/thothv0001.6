import React, { useState, useEffect } from 'react';
import {
  Calendar, BellRing, Search, Plus, Filter,
  Sparkles, ArrowRight, Grid, List as ListIcon,
  Compass, Users, Bookmark, Award
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, where, limit, getDocs, documentId } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { ThothEvent } from '../../types';
import EventCard from './components/EventCard';
import CreateEventModal from './components/CreateEventModal';
import { useNavigate } from 'react-router-dom';

type EventFilter = 'all' | 'workshop' | 'palestra' | 'social' | 'estudo';
type FeedTab = 'discover' | 'connections' | 'my-events' | 'created';

const Eventos: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ThothEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>('discover');

  // Connections caching
  const [connections, setConnections] = useState<string[]>([]);

  // Fetch connections only once
  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchConnections = async () => {
      try {
        // Simplified connection fetching strategy: 
        // In a real app we'd have a robust 'friends' service. 
        // Here we assume 'connections' collection exists where users array contains current uid
        const q = query(collection(db, 'connections'), where('users', 'array-contains', auth.currentUser.uid));
        const snap = await getDocs(q);
        const connIds = new Set<string>();
        snap.forEach(doc => {
          const data = doc.data();
          data.users.forEach((u: string) => {
            if (u !== auth.currentUser?.uid) connIds.add(u);
          });
        });
        setConnections(Array.from(connIds));
      } catch (e) {
        console.error("Error fetching connections", e);
      }
    };
    fetchConnections();
  }, []);


  useEffect(() => {
    setLoading(true);
    let q = query(collection(db, 'events'), orderBy('date', 'asc'), limit(50));

    // For 'connections' tab, we can't easily query "events where participants contains ANY of list" efficiently in Firestore if the list is huge.
    // Strategy: Fetch top 50 recents and filter client side OR fetch by user participation for 'my-events'

    if (activeTab === 'my-events' && auth.currentUser) {
      q = query(collection(db, 'events'), where('participants', 'array-contains', auth.currentUser.uid), orderBy('date', 'asc'));
    } else if (activeTab === 'created' && auth.currentUser) {
      q = query(collection(db, 'events'), where('creatorId', '==', auth.currentUser.uid), orderBy('date', 'asc'));
    }
    // For 'connections' and 'discover', we'll fetch recent events and filter in memory for better UX on small datasets
    // In production with thousands of events, this needs Algolia or Typesense.

    const unsub = onSnapshot(q, (snap) => {
      let eventsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ThothEvent));

      if (activeTab === 'connections' && connections.length > 0) {
        eventsData = eventsData.filter(e =>
          e.participants.some(p => connections.includes(p))
        );
      }

      setEvents(eventsData);
      setLoading(false);
    });

    return () => unsub();
  }, [activeTab, connections]);

  const filteredEvents = events.filter(e => {
    const matchesFilter = filter === 'all' || e.type === filter;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 mt-0 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-[#006c55]/10 text-[#006c55]">
              <Calendar size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Eventos & Datas
            </h1>
          </div>
          <p className="text-slate-500 font-bold text-sm ml-1 uppercase tracking-widest opacity-60">
            Workshops • Palestras • Networking
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-8 py-4 bg-[#006c55] text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#006c55]/20 hover:scale-105 active:scale-95 transition-all group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Criar Evento
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 bg-white/50 dark:bg-white/5 p-1.5 rounded-[22px] w-fit border border-slate-100 dark:border-white/5 overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'discover'
            ? 'bg-white dark:bg-white/10 text-[#006c55] dark:text-emerald-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          <Compass size={16} /> Explorar
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'connections'
            ? 'bg-white dark:bg-white/10 text-[#006c55] dark:text-emerald-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          <Users size={16} /> Seguindo
        </button>
        <button
          onClick={() => setActiveTab('my-events')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'my-events'
            ? 'bg-white dark:bg-white/10 text-[#006c55] dark:text-emerald-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          <Bookmark size={16} /> Vou ir
        </button>
        <button
          onClick={() => setActiveTab('created')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'created'
            ? 'bg-white dark:bg-white/10 text-[#006c55] dark:text-emerald-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          <Sparkles size={16} /> Criados
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters & Content Column */}
        <div className="flex-1 space-y-8">
          {/* Search & Filter Pills */}
          <div className="glass-panel p-6 rounded-[32px] border border-white/10 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006c55] transition-colors" size={18} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar evento ou local..."
                className="w-full bg-slate-50 dark:bg-white/5 border border-transparent focus:border-[#006c55]/30 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {(['all', 'workshop', 'palestra', 'social', 'estudo'] as EventFilter[]).map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${filter === t
                    ? 'bg-[#006c55] text-white border-transparent'
                    : 'bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-white/5 hover:border-[#006c55]/30'
                    }`}
                >
                  {t === 'all' ? 'Ver Todos' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 glass-panel rounded-3xl animate-pulse bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                  <Sparkles className="text-slate-200 dark:text-white/5" size={40} />
                </div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center glass-panel rounded-[40px] border border-dashed border-slate-200 dark:border-white/10">
              <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Nenhum evento encontrado</h3>
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">
                Tente mudar os filtros ou busque por outro termo. Explore novas oportunidades!
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Utilities */}
        <div className="w-full lg:w-[325px] flex flex-col gap-8">
          {/* Featured Event Card */}
          <div className="relative group overflow-hidden rounded-[40px] aspect-[4/5] bg-[#0A0A0A] border border-white/10 shadow-2xl p-8 flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/40 to-transparent opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10 space-y-4">
              <span className="px-3 py-1.5 rounded-xl bg-white text-[#006c55] text-[10px] font-black uppercase tracking-widest shadow-xl">
                Destaque
              </span>
              <h2 className="text-3xl font-black text-white leading-tight">Hackathon Thoth 2024</h2>
              <p className="text-white/70 text-sm font-medium">3 dias de código intensivo, networking e prêmios insanos.</p>
              <button className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.2em] group/btn">
                Saber Mais <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* Certificates Widget (Placeholder for now, will implement component later) */}
          <div className="glass-panel p-6 rounded-[32px] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Award size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Meus Certificados</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conquistas Acadêmicas</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center py-8">
              <Award size={24} className="text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-400">Participe de eventos para ganhar certificados.</p>
            </div>

            <button className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Ver Todos
            </button>
          </div>

        </div>
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(eventId) => {
          // Updated to accept eventId for redirection
          if (eventId) {
            navigate(`/eventos/${eventId}`);
          }
        }}
      // Pass navigate to modal if needed, but the onCreated callback handles the redirect here 
      // actually looking at the modal code, it might be better to handle redirect there or pass the ID back up.
      // I will update the modal to pass the ID back up.
      />
    </div>
  );
};

export default Eventos;
