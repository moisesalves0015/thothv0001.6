import React from 'react';
import { Calendar, MapPin, Users, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThothEvent } from '../../../types';

interface EventCardProps {
    event: ThothEvent;
    onInterested?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onInterested }) => {
    const navigate = useNavigate();

    // Formatar data
    const date = event.date?.toDate ? event.date.toDate() : new Date();
    const day = date.getDate();
    const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

    const typeColors = {
        workshop: 'text-emerald-500 bg-emerald-500/10',
        palestra: 'text-blue-500 bg-blue-500/10',
        social: 'text-rose-500 bg-rose-500/10',
        estudo: 'text-amber-500 bg-amber-500/10',
        outro: 'text-slate-500 bg-slate-500/10'
    };

    return (
        <div
            onClick={() => navigate(`/eventos/${event.id}`)}
            className="group glass-panel rounded-3xl p-5 border border-white/10 hover:border-emerald-500/30 transition-all duration-500 cursor-pointer flex flex-col gap-4 relative overflow-hidden"
        >
            {/* Hover Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>

            {/* Header: Date and Badge */}
            <div className="flex justify-between items-start z-10">
                <div className="flex flex-col items-center bg-white dark:bg-white/5 shadow-sm rounded-2xl px-3 py-2 border border-slate-100 dark:border-white/5 min-w-[50px]">
                    <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{day}</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">{month}</span>
                </div>

                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${typeColors[event.type]}`}>
                    {event.type}
                </span>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2 z-10">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-500 transition-colors line-clamp-2">
                    {event.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                    {event.description}
                </p>
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-white/5 z-10">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-300" />
                        <span>{event.location}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                        {event.participants.length > 0 ? (
                            <>
                                {[1, 2, 3].slice(0, event.participants.length).map((_, i) => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-[#0A0A0A] bg-slate-200"></div>
                                ))}
                                {event.participants.length > 3 && (
                                    <div className="w-7 h-7 rounded-full border-2 border-white dark:border-[#0A0A0A] bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                        +{event.participants.length - 3}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Users size={14} />
                                <span className="text-[10px] uppercase font-black">Ninguém ainda</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onInterested?.(event.id);
                        }}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                    >
                        <Star size={18} fill={event.interested.includes('current-user-id') ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                Ver Detalhes <ArrowRight size={12} />
            </div>
        </div>
    );
};

export default EventCard;
