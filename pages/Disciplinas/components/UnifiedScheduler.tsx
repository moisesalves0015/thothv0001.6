import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, MoreHorizontal, Bell, Sparkles, BookOpen, Users, Filter, CheckCircle2 } from 'lucide-react';

// Mock Data for Unified Calendar
const ALL_EVENTS = [
    { id: 'e1', title: 'Aula de História do Brasil II', subject: 'História do Brasil II', type: 'aula', date: new Date().toISOString().split('T')[0], time: '10:40', location: 'Sala 302', color: '#006c55', disciplineId: 'EkRWqhVyNf8mW9fzlPTN', status: 'pending' },
    { id: 'e2', title: 'Entrega de Trabalho', subject: 'Antropologia Visual', type: 'entrega', date: new Date().toISOString().split('T')[0], time: '23:59', location: 'Online', color: '#8b4513', disciplineId: 'anthro123', status: 'pending' },
    { id: 'e3', title: 'Aula de Design de Interfaces', subject: 'Design de Interfaces', type: 'aula', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '18:30', location: 'Lab 4', color: '#1e40af', disciplineId: 'design123', status: 'done' },
    { id: 'e4', title: 'Prova P1', subject: 'História do Brasil II', type: 'prova', date: new Date(Date.now() + (86400000 * 7)).toISOString().split('T')[0], time: '10:40', location: 'Sala 302', color: '#006c55', disciplineId: 'EkRWqhVyNf8mW9fzlPTN', status: 'pending' },
];

interface UnifiedSchedulerProps {
    filterDisciplineId?: string | null;
}

interface CalendarDay {
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    hasEvents: boolean;
    isToday: boolean;
    isSelected: boolean;
}

const UnifiedScheduler: React.FC<UnifiedSchedulerProps> = ({ filterDisciplineId }) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [activeFilter, setActiveFilter] = useState<'all' | 'aula' | 'entrega' | 'prova'>('all');

    // Calendar Logic (42-day grid for stability, from Calendario.tsx)
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const startingDayOfWeek = firstDayOfMonth.getDay();
        
        const days: CalendarDay[] = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonthLastDay - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({
                date, day: prevMonthLastDay - i, isCurrentMonth: false,
                hasEvents: ALL_EVENTS.some(e => e.date === dateStr && (!filterDisciplineId || e.disciplineId === filterDisciplineId)),
                isToday: false, isSelected: false
            });
        }

        // Current month days
        for (let i = 1; i <= lastDayOfMonth; i++) {
            const date = new Date(year, month, i);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();

            days.push({
                date, day: i, isCurrentMonth: true,
                hasEvents: ALL_EVENTS.some(e => e.date === dateStr && (!filterDisciplineId || e.disciplineId === filterDisciplineId)),
                isToday, isSelected
            });
        }

        // Next month days to complete 42 cells (6 rows)
        const remainingSlots = 42 - days.length;
        for (let i = 1; i <= remainingSlots; i++) {
            const date = new Date(year, month + 1, i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({ 
                date, day: i, isCurrentMonth: false, 
                hasEvents: ALL_EVENTS.some(e => e.date === dateStr && (!filterDisciplineId || e.disciplineId === filterDisciplineId)),
                isToday: false, isSelected: false 
            });
        }

        return days;
    }, [viewDate, selectedDate, filterDisciplineId]);

    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const handleDateSelect = (day: CalendarDay) => {
        setSelectedDate(day.date);
        if (!day.isCurrentMonth) {
            setViewDate(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
        }
    };

    const getEventsForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        let filtered = ALL_EVENTS.filter(e => e.date === dateStr);
        if (filterDisciplineId) {
            filtered = filtered.filter(e => e.disciplineId === filterDisciplineId);
        }
        if (activeFilter !== 'all') {
            filtered = filtered.filter(e => e.type === activeFilter);
        }
        return filtered;
    };

    const selectedDayEvents = getEventsForDay(selectedDate);
    const monthName = viewDate.toLocaleString('pt-BR', { month: 'long' });

    const filterOptions = [
        { id: 'all', label: 'Tudo', icon: <Filter size={12} /> },
        { id: 'aula', label: 'Aulas', icon: <BookOpen size={12} /> },
        { id: 'entrega', label: 'Entregas', icon: <Sparkles size={12} /> },
        { id: 'prova', label: 'Provas', icon: <Bell size={12} /> },
    ];

    return (
        <div className="liquid-glass rounded-[2rem] flex flex-col md:flex-row gap-0 h-auto md:min-h-[580px] w-full relative overflow-hidden shadow-2xl group border border-white/40 dark:border-white/10">
            {/* Decorative Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[100]" />
            
            {/* Esquerda: Calendário Grid (Divisão 50/50 no Desktop) */}
            <div className="w-full md:w-1/2 flex flex-col min-w-0 p-6 lg:p-10 border-r border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#006c55]/10 dark:bg-emerald-500/10 flex items-center justify-center text-[#006c55] dark:text-emerald-400 border border-[#006c55]/20 shadow-sm">
                            <CalendarIcon size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Cronograma</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">Navegação Temporal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-xl p-1.5 border border-slate-100 dark:border-white/5 shadow-inner">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-[#006c55] transition-all"><ChevronLeft size={16} /></button>
                        <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200 min-w-[110px] text-center tracking-[0.15em] leading-none">{monthName} {viewDate.getFullYear()}</span>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-[#006c55] transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 text-center mb-6 px-1">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
                        <span key={idx} className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">{day}</span>
                    ))}
                </div>

                {/* Grid Grid - Otimizado para o layout 50% */}
                <div className="grid grid-cols-7 gap-2.5 flex-1 content-start px-1">
                    {calendarDays.map((day, i) => (
                        <button
                            key={i}
                            onClick={() => handleDateSelect(day)}
                            className={`
                                aspect-square rounded-[1rem] flex flex-col items-center justify-center relative transition-all duration-300 group
                                ${day.isSelected
                                    ? 'bg-[#006c55] text-white shadow-xl scale-105 z-10'
                                    : 'bg-white/40 dark:bg-white/2 hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/5'
                                }
                                ${!day.isSelected && day.isToday ? 'border-2 border-[#006c55] dark:border-emerald-500/50 text-[#006c55] dark:text-emerald-400 bg-[#006c55]/5 font-black' : ''}
                                ${!day.isCurrentMonth ? 'opacity-20 grayscale scale-95' : ''}
                            `}
                        >
                            <span className={`text-[14px] ${day.isSelected || day.isToday ? 'font-black' : 'font-bold'}`}>{day.day}</span>
                            {day.hasEvents && (
                                <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${day.isSelected ? 'bg-white shadow-[0_0_8px_white]' : 'bg-[#006c55] dark:bg-emerald-400 shadow-[0_0_8px_rgba(0,108,85,0.4)]'}`}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Direita: Atividades Filtradas (Dividida 50/50 no Desktop) */}
            <div className="w-full md:w-1/2 flex flex-col bg-slate-50/50 dark:bg-black/20 min-w-0">
                {/* Header da Agenda com Filtros */}
                <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-white/5 bg-white/30 dark:bg-white/2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{selectedDate.getDate()}</h4>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">
                                {selectedDate.toLocaleString('pt-BR', { month: 'long', weekday: 'long' })}
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400">
                             <Clock size={24} className="opacity-50" />
                        </div>
                    </div>

                    {/* Filtros de Tipo (Segmented Control Style) */}
                    <div className="flex p-1 gap-1 bg-slate-100 dark:bg-white/5 rounded-2xl overflow-x-auto no-scrollbar">
                        {filterOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setActiveFilter(opt.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                                    ${activeFilter === opt.id 
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
                            >
                                {opt.icon}{opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable Atividades - Design Aprimorado */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 no-scrollbar scroll-smooth">
                    {selectedDayEvents.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100 dark:border-white/5 shadow-xl">
                                <CalendarIcon size={32} className="text-slate-200" strokeWidth={1} />
                            </div>
                            <h5 className="text-[12px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-2">Pausa Neural</h5>
                            <p className="text-[11px] font-bold text-slate-400 max-w-[200px]">Nenhum registro para esta categoria ou data.</p>
                        </div>
                    ) : (
                        selectedDayEvents.map(event => (
                            <div 
                                key={event.id} 
                                className="group relative bg-white/50 dark:bg-white/5 rounded-[2rem] p-6 border border-white dark:border-white/10 shadow-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:bg-white dark:hover:bg-white/10 cursor-pointer overflow-hidden"
                            >
                                {/* Activity Type Background Accent */}
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                                    {event.type === 'aula' && <BookOpen size={80} />}
                                    {event.type === 'entrega' && <Sparkles size={80} />}
                                    {event.type === 'prova' && <Bell size={80} />}
                                </div>

                                <div className="flex gap-5 relative z-10">
                                    {/* Left Slot: Time/Icon */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10 transition-transform duration-500 group-hover:rotate-12" style={{ backgroundColor: event.color }}>
                                            {event.type === 'aula' ? <BookOpen size={20} /> : event.type === 'entrega' ? <Sparkles size={20} /> : <Bell size={20} />}
                                        </div>
                                        <div className="h-full w-px bg-gradient-to-b from-slate-200 to-transparent dark:from-white/10 dark:to-transparent" />
                                    </div>

                                    {/* Right Slot: Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col gap-1 mb-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5">{event.subject}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${event.status === 'done' ? 'bg-[#d9f1a2] text-[#006c55]' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                                                    {event.status === 'done' ? 'Concluído' : 'Pendente'}
                                                </span>
                                            </div>
                                            <h5 className="text-[17px] font-black text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-[#006c55] dark:group-hover:text-emerald-400 transition-colors">{event.title}</h5>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 items-center">
                                            <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                                    <Clock size={13} className="text-slate-400" />
                                                </div>
                                                <span className="tabular-nums">{event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                                    <MapPin size={13} className="text-slate-400" />
                                                </div>
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Action - Ajustado para o design unificado */}
                <div className="p-6 lg:p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                     <button className="group w-full py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white hover:bg-[#006c55] dark:hover:bg-emerald-600 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-3">
                         Sincronizar Agenda <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
