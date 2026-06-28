import React, { useEffect, useState } from 'react';
import { Calendar, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { ThothEvent } from '../../../types';
import { useNavigate } from 'react-router-dom';

const EventSuggestionsBox: React.FC = () => {
    const navigate = useNavigate();
    const mockupEvents = [
        {
            id: 'mock-1',
            title: 'Congresso de Inovação',
            location: 'Auditório Principal',
            date: '2026-10-15T14:00:00Z',
            coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=80'
        },
        {
            id: 'mock-2',
            title: 'Workshop de Design UI/UX',
            location: 'Laboratório de Design',
            date: '2026-10-22T09:00:00Z',
            coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&auto=format&fit=crop&q=80'
        },
        {
            id: 'mock-3',
            title: 'Hackathon Universitário',
            location: 'Hub de Computação',
            date: '2026-11-05T18:00:00Z',
            coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80'
        }
    ];

    const [events, setEvents] = useState<any[]>(mockupEvents);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const q = query(
                    collection(db, 'events'),
                    where('date', '>=', new Date().toISOString()), // Future events only
                    orderBy('date', 'asc'),
                    limit(4)
                );

                const snapshot = await getDocs(q);
                const fetchedEvents = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const dateStr = data.date && typeof data.date.toDate === 'function'
                        ? data.date.toDate().toISOString()
                        : data.date;
                    return { id: doc.id, ...data, date: dateStr } as any;
                });
                
                if (fetchedEvents.length > 0) {
                    setEvents(fetchedEvents);
                } else {
                    setEvents(mockupEvents);
                }
            } catch (error) {
                console.error("Error fetching event suggestions:", error);
                setEvents(mockupEvents);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const formatEventDate = (dateVal: any) => {
        try {
            const d = new Date(dateVal);
            const m = d.toLocaleString('default', { month: 'short' }).replace('.', '');
            const day = d.getDate();
            return `${day} ${m.toUpperCase()}`;
        } catch {
            return "Em breve";
        }
    };

    return (
        <div className="w-full liquid-glass rounded-[24px] flex flex-col p-4 shadow-xl relative overflow-hidden transition-all duration-500 group min-h-[180px]">
            {/* Decorative Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover/feed:opacity-100 transition-opacity duration-300" />

            <div className="flex items-center justify-between mb-1.5">
                <div className="flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">Eventos em Destaque</h3>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-0.5">
                        Não perca as novidades
                    </span>
                </div>
                <button
                    onClick={() => navigate('/eventos')}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 transition-colors"
                >
                    <ArrowRight size={18} />
                </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin text-purple-500" size={24} />
                    </div>
                ) : events.length > 0 ? (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                        {events.map(event => (
                            <div
                                key={event.id}
                                onClick={() => navigate(`/eventos/${event.id}`)}
                                className="flex-shrink-0 w-[190px] flex flex-col gap-2 p-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-purple-100 dark:hover:border-purple-500/20 group/card shadow-sm"
                            >
                                <div className="w-full h-20 rounded-xl overflow-hidden relative group-hover/card:scale-[1.02] transition-transform border border-slate-100 dark:border-slate-700">
                                    <img src={event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=80'} alt={event.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-purple-600/90 backdrop-blur-sm text-white text-[8px] font-bold rounded uppercase font-mono tracking-wider">
                                        {formatEventDate(event.date)}
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-0.5">{event.title}</h4>
                                    <div className="flex items-center gap-1 text-[10px] text-purple-600 font-bold">
                                        <MapPin size={10} />
                                        <span className="truncate uppercase tracking-wider text-[9px]">{event.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-2 opacity-60">
                        <Calendar size={24} className="text-slate-300 mb-1" />
                        <p className="text-xs text-slate-400 font-medium">Nenhum evento próximo</p>
                    </div>
                )}
            </div>
            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
};

export default EventSuggestionsBox;
