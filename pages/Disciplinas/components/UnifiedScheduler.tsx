
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, MoreHorizontal } from 'lucide-react';

// Mock Data for Unified Calendar
const ALL_EVENTS = [
    { id: 'e1', title: 'Aula de História do Brasil II', subject: 'História do Brasil II', type: 'aula', date: new Date().toISOString().split('T')[0], time: '10:40', location: 'Sala 302', color: '#006c55', disciplineId: 'EkRWqhVyNf8mW9fzlPTN' },
    { id: 'e2', title: 'Entrega de Trabalho', subject: 'Antropologia Visual', type: 'entrega', date: new Date().toISOString().split('T')[0], time: '23:59', location: 'Online', color: '#8b4513', disciplineId: 'anthro123' },
    { id: 'e3', title: 'Aula de Design de Interfaces', subject: 'Design de Interfaces', type: 'aula', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '18:30', location: 'Lab 4', color: '#1e40af', disciplineId: 'design123' },
    { id: 'e4', title: 'Prova P1', subject: 'História do Brasil II', type: 'prova', date: new Date(Date.now() + (86400000 * 7)).toISOString().split('T')[0], time: '10:40', location: 'Sala 302', color: '#006c55', disciplineId: 'EkRWqhVyNf8mW9fzlPTN' },
];

interface UnifiedSchedulerProps {
    filterDisciplineId?: string | null;
}

const UnifiedScheduler: React.FC<UnifiedSchedulerProps> = ({ filterDisciplineId }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeDayRef = useRef<HTMLButtonElement>(null);

    // Centralizar o dia atual no mobile ao carregar
    useEffect(() => {
        if (activeDayRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const activeItem = activeDayRef.current;
            const scrollPos = activeItem.offsetLeft - (container.offsetWidth / 2) + (activeItem.offsetWidth / 2);
            container.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
    }, []);

    // Calendar Logic
    const calendarData = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

        return { days, monthName: viewDate.toLocaleString('pt-BR', { month: 'long' }), year, month };
    }, [viewDate]);

    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

    const getEventsForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        let filtered = ALL_EVENTS.filter(e => e.date === dateStr);
        if (filterDisciplineId) {
            filtered = filtered.filter(e => e.disciplineId === filterDisciplineId);
        }
        return filtered;
    };

    const selectedDayEvents = getEventsForDay(selectedDate);    return (
        <div className="liquid-glass rounded-[2rem] flex flex-col md:flex-row gap-0 h-auto md:h-[500px] w-full relative overflow-hidden shadow-2xl group border border-white/40 dark:border-white/10">
            {/* Decorative Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[100]" />
            
            {/* Esquerda: Calendário Grid */}
            <div className="flex-1 flex flex-col min-w-0 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#006c55]/10 dark:bg-emerald-500/10 flex items-center justify-center text-[#006c55] dark:text-emerald-400 border border-[#006c55]/20">
                            <CalendarIcon size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Cronograma</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">Visão Unificada</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-xl p-1.5 border border-slate-100 dark:border-white/5">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-[#006c55] transition-all"><ChevronLeft size={16} /></button>
                        <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200 min-w-[100px] text-center tracking-widest">{calendarData.monthName} {calendarData.year}</span>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-[#006c55] transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>

                {/* Desktop Grid View */}
                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <span key={day} className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{day}</span>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 flex-1 content-start">
                    {calendarData.days.map((date, i) => {
                        if (!date) return <div key={i} className="aspect-square" />;

                        const isSelected = isSameDay(date, selectedDate);
                        const dayEvents = getEventsForDay(date);
                        const hasEvents = dayEvents.length > 0;
                        const isRealToday = isSameDay(date, new Date());

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(date)}
                                className={`
                                    aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all group
                                    ${isSelected
                                        ? 'bg-[#006c55] text-white shadow-lg active:scale-95 z-10'
                                        : 'bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-white/5'
                                    }
                                    ${isRealToday && !isSelected ? 'border-2 border-[#006c55] dark:border-emerald-500 text-[#006c55] dark:text-emerald-400 bg-[#006c55]/5' : ''}
                                `}
                            >
                                <span className={`text-[13px] font-bold ${isSelected ? 'text-white' : ''}`}>{date.getDate()}</span>
                                {hasEvents && (
                                    <div className={`absolute bottom-2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#006c55] dark:bg-emerald-400'}`}></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Direita: Lista de Eventos (Agenda Style) */}
            <div className="md:w-[380px] flex flex-col bg-slate-50/50 dark:bg-black/20 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/10 min-w-0">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-white/30 dark:bg-white/2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">{selectedDate.getDate()}</h4>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                {selectedDate.toLocaleString('pt-BR', { month: 'long', weekday: 'long' })}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400">
                             <Clock size={18} />
                        </div>
                    </div>
                </div>

                {/* Scrollable Context - Fixed height ensured by parent md:h-[500px] and flex-1 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar scroll-smooth">
                    {selectedDayEvents.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4 border border-slate-100 dark:border-white/5 shadow-sm">
                                <CalendarIcon size={24} className="text-slate-300" />
                            </div>
                            <h5 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Dia Tranquilo</h5>
                            <p className="text-[10px] font-bold text-slate-400">Nenhuma atividade registrada.</p>
                        </div>
                    ) : (
                        selectedDayEvents.map(event => (
                            <div 
                                key={event.id} 
                                className="group relative liquid-glass rounded-2xl p-5 border border-white dark:border-white/10 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                            >
                                <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-md" style={{ backgroundColor: event.color }} />
                                
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <h5 className="text-[15px] font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-1">{event.title}</h5>
                                        <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                            <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: event.color }}>{event.subject}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 items-center pt-1">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            <Clock size={13} className="opacity-70" style={{ color: event.color }} />
                                            <span className="tabular-nums">{event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                            <MapPin size={13} className="opacity-70" style={{ color: event.color }} />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Insight Inside Box */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                     <button className="w-full py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm active:scale-95">
                         Ver Calendário Completo
                     </button>
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default UnifiedScheduler;
