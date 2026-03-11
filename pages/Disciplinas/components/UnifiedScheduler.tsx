
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, MoreHorizontal } from 'lucide-react';

// Mock Data for Unified Calendar
const ALL_EVENTS = [
    { id: 'e1', title: 'Aula de História do Brasil II', subject: 'História do Brasil II', type: 'aula', date: new Date().toISOString().split('T')[0], time: '10:40', location: 'Sala 302', color: '#006c55' },
    { id: 'e2', title: 'Entrega de Trabalho', subject: 'Antropologia Visual', type: 'entrega', date: new Date().toISOString().split('T')[0], time: '23:59', location: 'Online', color: '#8b4513' },
    { id: 'e3', title: 'Aula de Design de Interfaces', subject: 'Design de Interfaces', type: 'aula', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '18:30', location: 'Lab 4', color: '#1e40af' },
    { id: 'e4', title: 'Prova P1', subject: 'História do Brasil II', type: 'prova', date: new Date(Date.now() + (86400000 * 7)).toISOString().split('T')[0], time: '10:40', location: 'Sala 302', color: '#006c55' },
];

const UnifiedScheduler: React.FC = () => {
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
        return ALL_EVENTS.filter(e => e.date === dateStr);
    };

    const selectedDayEvents = getEventsForDay(selectedDate);

    return (
        <div className="liquid-glass p-6 rounded-[2rem] flex flex-col md:flex-row gap-8 h-auto md:h-[480px] w-full relative">

            {/* Esquerda: Calendário Grid */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <CalendarIcon size={20} className="text-[#006c55] dark:text-emerald-400" />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Calendário</h3>
                    </div>
                    <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 rounded-xl p-1 border border-white/20">
                        <button onClick={prevMonth} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-[#006c55] transition-all"><ChevronLeft size={16} /></button>
                        <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 min-w-[90px] text-center capitalize">{calendarData.monthName} {calendarData.year}</span>
                        <button onClick={nextMonth} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-[#006c55] transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>

                {/* Mobile Horizontal Scroll View */}
                <div
                    ref={scrollContainerRef}
                    className="md:hidden flex overflow-x-auto gap-3 pb-4 no-scrollbar snap-x snap-mandatory"
                >
                    {calendarData.days.filter(d => d !== null).map((date, i) => {
                        const d = date as Date;
                        const isSelected = isSameDay(d, selectedDate);
                        const dayEvents = getEventsForDay(d);
                        const hasEvents = dayEvents.length > 0;
                        const isRealToday = isSameDay(d, new Date());
                        const weekDay = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase().slice(0, 3);

                        return (
                            <button
                                key={i}
                                ref={isSelected ? activeDayRef : null}
                                onClick={() => setSelectedDate(d)}
                                className={`
                   snap-center flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all
                   ${isSelected
                                        ? 'bg-[#006c55] border-[#006c55] text-white shadow-lg shadow-[#006c55]/30 scale-105'
                                        : 'bg-white/40 dark:bg-white/5 border-white/20 text-slate-500'
                                    }
                   ${isRealToday && !isSelected ? 'border-[#006c55] ring-2 ring-[#006c55]/20' : ''}
                 `}
                            >
                                <span className={`text-[10px] font-black uppercase mb-1 ${isSelected ? 'text-[#d9f1a2]' : 'text-slate-400'}`}>{weekDay}</span>
                                <span className={`text-xl font-black ${isSelected ? 'text-white' : 'text-slate-700 dark:text-white'}`}>{d.getDate()}</span>

                                {hasEvents && (
                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#006c55]'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Desktop Grid View */}
                <div className="hidden md:grid grid-cols-7 gap-2 mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase">{d}</div>
                    ))}
                </div>

                <div className="hidden md:grid grid-cols-7 gap-2 flex-1 content-start">
                    {calendarData.days.map((date, i) => {
                        if (!date) return <div key={i} />;

                        const isSelected = isSameDay(date, selectedDate);
                        const dayEvents = getEventsForDay(date);
                        const hasEvents = dayEvents.length > 0;
                        const isRealToday = isSameDay(date, new Date());

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(date)}
                                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                  ${isSelected
                                        ? 'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/30 scale-105 z-10'
                                        : 'bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 border border-white/10'
                                    }
                  ${isRealToday && !isSelected ? 'border-2 border-[#006c55] text-[#006c55]' : ''}
                `}
                            >
                                <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>{date.getDate()}</span>
                                {hasEvents && (
                                    <div className="flex gap-0.5 mt-1">
                                        {dayEvents.slice(0, 3).map((ev, idx) => (
                                            <div key={idx} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : ''}`} style={{ backgroundColor: isSelected ? 'white' : ev.color }} />
                                        ))}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Direita: Lista de Eventos */}
            <div className="md:w-[320px] flex flex-col border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0 md:pl-8 min-w-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{selectedDate.getDate()}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedDate.toLocaleString('pt-BR', { month: 'long', weekday: 'long' })}</p>
                    </div>
                    <button className="text-slate-300 hover:text-[#006c55] transition-colors"><MoreHorizontal size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar max-h-[300px] md:max-h-none">
                    {selectedDayEvents.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
                            <div className="w-12 h-12 bg-white/20 dark:bg-white/5 rounded-full flex items-center justify-center mb-3 border border-white/10">
                                <CalendarIcon size={20} className="text-slate-400" />
                            </div>
                            <p className="text-xs font-bold text-slate-400">Nenhum evento para este dia</p>
                        </div>
                    ) : (
                        selectedDayEvents.map(event => (
                            <div key={event.id} className="group p-4 rounded-2xl border border-white/20 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm">
                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: event.color }} />

                                <h5 className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-1">{event.title}</h5>
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: event.color }}>{event.subject}</p>

                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} className="text-[#006c55]" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin size={12} className="text-[#006c55]" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
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
