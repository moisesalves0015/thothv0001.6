
import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Bell,
    ChevronLeft,
    ChevronRight,
    Plus,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    BookOpen,
    Users,
    Filter,
    X,
    Share2,
    CalendarDays
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface EventItem {
    id: string;
    title: string;
    time: string;
    location: string;
    type: 'class' | 'event' | 'meeting' | 'reminder';
    color: string;
    description?: string;
    status?: 'done' | 'pending';
    date: Date;
}

interface CalendarDay {
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    hasEvents: boolean;
    isToday: boolean;
    isSelected: boolean;
}

const Calendario: React.FC = () => {
    const { isDarkMode } = useTheme();
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterType, setFilterType] = useState<'all' | 'class' | 'event' | 'meeting' | 'reminder'>('all');
    const [agendaView, setAgendaView] = useState<'timeline' | 'weekly'>('timeline');

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const [events] = useState<EventItem[]>([
        {
            id: '1',
            title: 'Arquitetura de Software',
            time: '07:30 - 09:10',
            location: 'Bloco C • Sala 104',
            type: 'class',
            color: 'bg-[#006c55]',
            date: new Date(currentYear, currentMonth, today.getDate())
        },
        {
            id: '2',
            title: 'Reunião Lab. Pesquisas',
            time: '10:00 - 11:30',
            location: 'Auditório Virtual Thoth',
            type: 'meeting',
            color: 'bg-blue-600',
            date: new Date(currentYear, currentMonth, today.getDate())
        },
        {
            id: '3',
            title: 'Fórum de Inovação UFERSA',
            time: '14:00 - 17:00',
            location: 'Centro de Convenções',
            type: 'event',
            color: 'bg-indigo-600',
            description: 'Palestra magna sobre IA na educação.',
            date: new Date(currentYear, currentMonth, today.getDate())
        },
        {
            id: '4',
            title: 'Entrega: Compiladores',
            time: 'Até 23:59',
            location: 'Portal Thoth',
            type: 'reminder',
            color: 'bg-rose-500',
            status: 'pending',
            date: new Date(currentYear, currentMonth, today.getDate())
        },
        {
            id: '5',
            title: 'Seminário de Banco de Dados',
            time: '13:00 - 15:00',
            location: 'Bloco A • Sala 203',
            type: 'class',
            color: 'bg-[#006c55]',
            date: new Date(currentYear, currentMonth, today.getDate() + 1)
        },
        {
            id: '6',
            title: 'Workshop de Carreira',
            time: '16:00 - 18:00',
            location: 'Auditório Central',
            type: 'event',
            color: 'bg-indigo-600',
            date: new Date(currentYear, currentMonth, today.getDate() + 2)
        }
    ]);

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDayOfMonth.getDay();
        const totalDays = lastDayOfMonth.getDate();

        const days: CalendarDay[] = [];

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonthLastDay - i);
            days.push({
                date,
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                hasEvents: events.some(e =>
                    e.date.getDate() === date.getDate() &&
                    e.date.getMonth() === date.getMonth() &&
                    e.date.getFullYear() === date.getFullYear()
                ),
                isToday: false,
                isSelected: false
            });
        }

        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(year, month, i);
            const isToday = date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
            const isSelected = date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();

            days.push({
                date,
                day: i,
                isCurrentMonth: true,
                hasEvents: events.some(e =>
                    e.date.getDate() === date.getDate() &&
                    e.date.getMonth() === date.getMonth() &&
                    e.date.getFullYear() === date.getFullYear()
                ),
                isToday,
                isSelected
            });
        }

        const remainingSlots = 42 - days.length;
        for (let i = 1; i <= remainingSlots; i++) {
            const date = new Date(year, month + 1, i);
            days.push({
                date,
                day: i,
                isCurrentMonth: false,
                hasEvents: false,
                isToday: false,
                isSelected: false
            });
        }

        return days;
    }, [currentDate, selectedDate, events]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
            return newDate;
        });
    };

    const handleDateSelect = (day: CalendarDay) => {
        setSelectedDate(day.date);
        if (!day.isCurrentMonth) {
            setCurrentDate(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
        }
    };

    const viewEvents = useMemo(() => {
        const sorted = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

        if (agendaView === 'timeline') {
            return sorted.filter(event => {
                const isDateMatch = event.date.getDate() === selectedDate.getDate() &&
                    event.date.getMonth() === selectedDate.getMonth() &&
                    event.date.getFullYear() === selectedDate.getFullYear();
                return isDateMatch && (filterType === 'all' || event.type === filterType);
            });
        }

        if (agendaView === 'weekly') {
            const startOfWeek = new Date(selectedDate);
            startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            return sorted.filter(event => {
                return event.date >= startOfWeek && event.date <= endOfWeek && (filterType === 'all' || event.type === filterType);
            });
        }

        return [];
    }, [events, selectedDate, filterType, agendaView]);

    const formatSelectedDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const getTypeIcon = (type: EventItem['type'], size = 14) => {
        switch (type) {
            case 'class': return <BookOpen size={size} />;
            case 'event': return <Sparkles size={size} />;
            case 'meeting': return <Users size={size} />;
            case 'reminder': return <Bell size={size} />;
            default: return <Bell size={size} />;
        }
    };

    return (
        <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500 w-full mb-10">

            {/* Standard Header Actions */}
            <div className="flex justify-between items-center px-1">
                <div className="thoth-page-header hidden lg:block">
                    <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Calendário
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Controle Neural de Tempo</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-white/5 shadow-sm active:scale-95">
                        <Share2 size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#006c55] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#006c55]/20 hover:bg-[#005a46] transition-all active:scale-95">
                        <Plus size={14} /> Novo Evento
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[30px] items-start">

                {/* Left Column: Calendar UI (Standard Box Style) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Filter Segment (Consistent Styling) - Moved to Top */}
                    <div className="glass-panel rounded-[30px] p-6 shadow-xl mb-6">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-4 flex items-center justify-between">
                            Filtros de Visão
                            {filterType !== 'all' && <button onClick={() => setFilterType('all')} className="text-[#006c55] dark:text-emerald-400 hover:scale-105 transition-all">Limpar</button>}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { type: 'all' as const, label: 'Tudo', icon: <Plus size={12} /> },
                                { type: 'class' as const, label: 'Aulas', icon: <BookOpen size={12} /> },
                                { type: 'event' as const, label: 'Eventos', icon: <Sparkles size={12} /> },
                                { type: 'meeting' as const, label: 'Meetings', icon: <Users size={12} /> },
                                { type: 'reminder' as const, label: 'Tasks', icon: <Bell size={12} /> }
                            ].map(f => (
                                <button
                                    key={f.type}
                                    onClick={() => setFilterType(f.type)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 
                                        ${filterType === f.type
                                            ? 'bg-[#006c55] text-white shadow-lg'
                                            : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                >
                                    {f.icon}{f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel rounded-[30px] overflow-hidden shadow-xl mb-0">
                        {/* Box Header Style Consistent with App */}
                        <div className="bg-slate-50/50 dark:bg-white/5 p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] flex items-center gap-2">
                                <Plus size={14} className="text-[#006c55] dark:text-emerald-400" /> Navegar
                            </h3>
                            <div className="flex gap-1">
                                <button onClick={() => navigateMonth('prev')} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-[#006c55]"><ChevronLeft size={16} /></button>
                                <button onClick={() => navigateMonth('next')} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-[#006c55]"><ChevronRight size={16} /></button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-7 gap-1 text-center mb-4">
                                {daysOfWeek.map(day => (
                                    <span key={day} className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{day}</span>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleDateSelect(day)}
                                        className={`h-11 w-full flex flex-col items-center justify-center rounded-xl text-[13px] font-bold transition-all relative group
                                            ${day.isSelected ? 'bg-[#006c55] text-white shadow-lg active:scale-95 z-10' : ''}
                                            ${!day.isSelected && day.isToday ? 'bg-[#006c55]/10 text-[#006c55] dark:text-emerald-400' : ''}
                                            ${!day.isSelected && !day.isToday && day.isCurrentMonth ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/5' : ''}
                                            ${!day.isCurrentMonth ? 'text-slate-200 dark:text-slate-800' : ''}
                                        `}
                                    >
                                        <span>{day.day}</span>
                                        {day.hasEvents && (
                                            <div className={`absolute bottom-2 w-1 h-1 rounded-full ${day.isSelected ? 'bg-white' : 'bg-[#006c55] dark:bg-emerald-400'}`}></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary Info Inside Box */}
                        <div className="bg-slate-50/30 dark:bg-slate-800/20 p-6 border-t border-slate-100 dark:border-white/5 overflow-hidden">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center text-[#006c55] dark:text-emerald-400 flex-shrink-0">
                                        <Clock size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 capitalize truncate whitespace-nowrap">{formatSelectedDate(selectedDate)}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1 whitespace-nowrap">Status do Dia</p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${viewEvents.length > 0 ? 'bg-[#d9f1a2] dark:bg-emerald-500/20 text-[#006c55] dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                        {viewEvents.length} Eventos
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline / Agenda (Standard Box Style) */}
                <div className="lg:col-span-8">
                    <div className="glass-panel rounded-[30px] p-0 overflow-hidden shadow-2xl dark:shadow-none min-h-[600px]">
                        <div className="bg-white/50 dark:bg-white/5 p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] flex items-center gap-2">
                                <Plus size={14} className="text-[#006c55] dark:text-emerald-400" /> Agenda Detalhada
                            </h3>
                            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl gap-1">
                                <button
                                    onClick={() => setAgendaView('timeline')}
                                    className={`px-6 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${agendaView === 'timeline' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
                                    Timeline
                                </button>
                                <button
                                    onClick={() => setAgendaView('weekly')}
                                    className={`px-6 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${agendaView === 'weekly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
                                    Semanal
                                </button>
                            </div>
                        </div>

                        <div className="p-8 px-2">
                            <div className="space-y-6">
                                {viewEvents.length > 0 ? (
                                    viewEvents.map((item, index) => {
                                        const showDateHeader = agendaView === 'weekly' && (
                                            index === 0 ||
                                            viewEvents[index - 1].date.toDateString() !== item.date.toDateString()
                                        );

                                        return (
                                            <div key={item.id} className="relative">
                                                {showDateHeader && (
                                                    <div className="flex items-center gap-4 mb-8 mt-10 first:mt-0">
                                                        <div className="flex items-center gap-2 bg-[#006c55]/5 dark:bg-emerald-500/10 px-5 py-2 rounded-2xl border border-[#006c55]/10 backdrop-blur-md">
                                                            <CalendarDays size={14} className="text-[#006c55] dark:text-emerald-400" />
                                                            <span className="text-[11px] font-black uppercase text-[#006c55] dark:text-emerald-400 tracking-[0.15em]">
                                                                {item.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
                                                            </span>
                                                        </div>
                                                        <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent dark:from-white/5 dark:to-transparent"></div>
                                                    </div>
                                                )}

                                                <div className="group flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    {/* Horário à Esquerda - Elegante e sem padding lateral extra */}
                                                    <div className="w-16 pt-1 text-right flex-shrink-0">
                                                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight tabular-nums leading-none block">
                                                            {item.time.split(' - ')[0]}
                                                        </span>
                                                        <div className="h-0.5 w-4 bg-[#006c55]/20 dark:bg-emerald-500/20 ml-auto my-1.5 rounded-full"></div>
                                                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase block">
                                                            {item.time.split(' - ')[1] || ''}
                                                        </span>
                                                    </div>

                                                    {/* Linha da Timeline */}
                                                    <div className="relative flex flex-col items-center">
                                                        <div className={`w-3.5 h-3.5 rounded-full border-[3px] border-white dark:border-slate-800 shadow-lg group-hover:scale-125 transition-all duration-500 z-10 ${item.color}`}></div>
                                                        <div className="w-0.5 flex-1 bg-gradient-to-b from-slate-100 via-slate-50 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent mt-2"></div>
                                                    </div>

                                                    {/* Card de Evento - Ultra simplificado e sem paddings laterais no container */}
                                                    <div className="flex-1 pb-10 min-w-0">
                                                        <div className="liquid-glass rounded-2xl p-4 border border-white dark:border-white/10 shadow-sm transition-all duration-500 relative overflow-hidden">
                                                            <div className="flex flex-col gap-2 relative z-10">
                                                                {/* Linha 1: Título */}
                                                                <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                                                                    {item.title}
                                                                </h3>

                                                                {/* Linha 2: Localização */}
                                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                                                    <MapPin size={11} className="text-[#006c55] dark:text-emerald-400 opacity-60" />
                                                                    <span className="truncate">{item.location}</span>
                                                                </div>

                                                                {/* Linha 3: Descrição (se houver) */}
                                                                {item.description && (
                                                                    <p className="text-[12px] text-slate-400 dark:text-slate-500 italic leading-relaxed border-l-2 border-[#006c55]/10 pl-3">
                                                                        {item.description}
                                                                    </p>
                                                                )}

                                                                {/* Linha 4: Status */}
                                                                <div className="pt-2">
                                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${item.status === 'done' ? 'bg-[#006c55]/10 text-[#006c55] dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500'}`}>
                                                                        {item.status === 'done' ? (
                                                                            <><CheckCircle2 size={10} /> Concluído</>
                                                                        ) : (
                                                                            <><Clock size={10} /> Pendente</>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-1000">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 rounded-full blur-2xl bg-[#006c55]/10 dark:bg-emerald-500/5 scale-150"></div>
                                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-200 dark:text-slate-700 relative z-10">
                                                <CalendarIcon size={36} strokeWidth={1} />
                                            </div>
                                        </div>
                                        <h4 className="text-[11px] font-black text-[#006c55] dark:text-emerald-400 uppercase tracking-[0.4em] mb-3">Status: Silêncio Neural</h4>
                                        <p className="text-[13px] font-bold text-slate-400 dark:text-slate-500 max-w-[240px] leading-relaxed mx-auto">
                                            {agendaView === 'timeline' ? 'Nenhum sinal de atividade em sua rede para hoje.' : 'Sua semana está processada e livre de pendências.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Footer Summary - Standard Box Styling */}
                        <div className="bg-slate-50/50 dark:bg-white/5 p-6 border-t border-slate-100 dark:border-white/5">
                            <div className="flex items-center justify-between gap-4 px-2 overflow-x-auto no-scrollbar">
                                {[
                                    { l: 'Total', v: events.length },
                                    { l: 'Hoje', v: events.filter(e => e.date.toDateString() === today.toDateString()).length },
                                    { l: 'Mes', v: events.filter(e => e.date.getMonth() === currentDate.getMonth()).length },
                                    { l: 'Tasks', v: events.filter(e => e.status === 'pending').length }
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                                        <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{s.v}</p>
                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.l}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendario;