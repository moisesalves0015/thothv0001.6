import React, { useEffect, useState } from 'react';
import { Calendar, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { ThothEvent } from '../../../types';
import { useNavigate } from 'react-router-dom';

const EventSuggestionsBox: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<ThothEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const q = query(
                    collection(db, 'events'),
                    where('date', '>=', new Date().toISOString()), // Future events only
                    orderBy('date', 'asc'),
                    limit(2)
                );

                // Callback or simple fetch? Using fetch for "suggestions" usually safer to just get once or subscription.
                // Let's use getDocs for simplicity in a suggestion box, or listener if we want realtime.
                // getDocs is fine for home page to reduce reads on simple nav.
                const snapshot = await getDocs(q);
                const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ThothEvent));
                setEvents(fetchedEvents);
            } catch (error) {
                console.error("Error fetching event suggestions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="w-full liquid-glass rounded-[24px] flex flex-col p-5 shadow-2xl relative overflow-hidden transition-all duration-500 group min-h-[180px]">
            {/* Decorative Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">Eventos em Destaque</h3>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-1">
                        Não perca as novidades
                    </span>
                </div>
                <button
                    onClick={() => navigate('/eventos')}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 transition-colors"
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
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                        {events.map(event => (
                            <div
                                key={event.id}
                                onClick={() => navigate(`/eventos/${event.id}`)}
                                className="flex-shrink-0 w-[200px] flex flex-col gap-3 p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-purple-100 dark:hover:border-purple-500/20 group/card"
                            >
                                <div className="w-full h-24 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex flex-col items-center justify-center border border-purple-100 dark:border-purple-500/20 group-hover/card:scale-[1.02] transition-transform">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(event.date).toLocaleString('default', { month: 'short' }).replace('.', '')}</span>
                                    <span className="text-2xl font-black leading-none">{new Date(event.date).getDate()}</span>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-1">{event.title}</h4>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                        <MapPin size={10} />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-2 opactiy-60">
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
