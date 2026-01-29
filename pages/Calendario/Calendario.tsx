
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
    const [agendaView, setAgendaView] = useState<'timeline' | 'weekly' | 'monthly'>('timeline');

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

        if (agendaView === 'monthly') {
            return sorted.filter(event => {
                return event.date.getMonth() === selectedDate.getMonth() &&
                    event.date.getFullYear() === selectedDate.getFullYear() &&
                    (filterType === 'all' || event.type === filterType);
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
                    <div className="glass-panel rounded-[30px] p-0 overflow-hidden shadow-2xl dark:shadow-none relative">
                        {/* Box Header Style Consistent with App */}
                        <div className="bg-slate-50/50 dark:bg-white/5 p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] flex items-center gap-2">
                                <CalendarDays size={14} className="text-[#006c55] dark:text-emerald-400" />
                                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
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
                        <div className="bg-slate-50/30 dark:bg-slate-800/20 p-6 border-t border-slate-100 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center text-[#006c55] dark:text-emerald-400">
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 capitalize">{formatSelectedDate(selectedDate)}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Status do Dia</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${viewEvents.length > 0 ? 'bg-[#d9f1a2] dark:bg-emerald-500/20 text-[#006c55] dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                        {viewEvents.length} Eventos
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Segment (Consistent Styling) */}
                    <div className="glass-panel rounded-[30px] p-6 shadow-xl">
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
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${agendaView === 'timeline' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
                                    Timeline
                                </button>
                                <button
                                    onClick={() => setAgendaView('weekly')}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${agendaView === 'weekly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
                                    Semanal
                                </button>
                                <button
                                    onClick={() => setAgendaView('monthly')}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${agendaView === 'monthly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>
                                    Mensal
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            {agendaView === 'timeline' && (
                                <div className="space-y-6">
                                    {viewEvents.length > 0 ? (
                                        viewEvents.map((item) => (
                                            <div key={item.id} className="group flex gap-6 animate-in slide-in-from-left-4 duration-300">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 shadow-sm ${item.color}`}></div>
                                                    <div className="w-0.5 flex-1 bg-slate-100 dark:bg-white/10 mt-1"></div>
                                                </div>
                                                <div className="flex-1 pb-6">
                                                    <div className="liquid-glass rounded-2xl p-5 border border-white dark:border-white/5 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-2 rounded-lg ${item.color} bg-opacity-10 dark:bg-opacity-20 text-slate-900 dark:text-white flex items-center justify-center`}>
                                                                    {getTypeIcon(item.type)}
                                                                </div>
                                                                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{item.title}</h3>
                                                            </div>
                                                            <span className="text-[10px] font-black text-[#006c55] dark:text-emerald-400 uppercase tracking-widest bg-[#006c55]/10 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
                                                                {item.time}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 mb-3 px-1">
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold">
                                                                <MapPin size={12} className="text-slate-300" />
                                                                {item.location}
                                                            </div>
                                                        </div>
                                                        {item.description && (
                                                            <p className="text-[13px] text-slate-400 dark:text-slate-500 italic mt-2 border-l-2 border-[#006c55]/20 pl-4">{item.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-800 mb-4">
                                                <CalendarIcon size={32} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Sem eventos hoje</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {agendaView === 'weekly' && (
                                <div className="overflow-x-auto pb-4 custom-scrollbar">
                                    <div className="grid grid-cols-7 gap-4 min-w-[1200px] min-h-[400px]">
                                        {daysOfWeek.map((dayName, idx) => {
                                            const startOfWeek = new Date(selectedDate);
                                            startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
                                            const dayDate = new Date(startOfWeek);
                                            dayDate.setDate(dayDate.getDate() + idx);

                                            const dayEvents = viewEvents.filter(e => e.date.toDateString() === dayDate.toDateString());
                                            const isToday = dayDate.toDateString() === today.toDateString();

                                            return (
                                                <div key={idx} className={`flex flex-col rounded-2xl p-4 border transition-all ${isToday ? 'bg-[#006c55]/5 border-[#006c55]/20' : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5'}`}>
                                                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/50 dark:border-white/5">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-[#006c55] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{dayName}</span>
                                                        <span className={`text-xs font-bold ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{dayDate.getDate()}</span>
                                                    </div>
                                                    <div className="space-y-3 overflow-y-auto max-h-[400px] no-scrollbar">
                                                        {dayEvents.length > 0 ? dayEvents.map(event => (
                                                            <div key={event.id} className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 group hover:scale-[1.02] transition-transform">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className={`w-2 h-2 rounded-full ${event.color}`}></div>
                                                                    <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate">{event.title}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{event.time}</p>
                                                                    <div className="p-1 rounded bg-slate-50 dark:bg-white/5">
                                                                        {getTypeIcon(event.type, 10)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <div className="h-10 flex items-center justify-center opacity-20">
                                                                <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {agendaView === 'monthly' && (
                                <div className="grid grid-cols-7 gap-1 border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner bg-slate-50/30 dark:bg-black/20">
                                    {daysOfWeek.map(d => (
                                        <div key={d} className="bg-white/60 dark:bg-white/5 p-2 text-center border-b border-slate-100 dark:border-white/5">
                                            <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{d}</span>
                                        </div>
                                    ))}
                                    {calendarDays.map((day, i) => {
                                        const dayEvents = events.filter(e =>
                                            e.date.getDate() === day.date.getDate() &&
                                            e.date.getMonth() === day.date.getMonth() &&
                                            e.date.getFullYear() === day.date.getFullYear()
                                        );

                                        return (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    setSelectedDate(day.date);
                                                    setAgendaView('timeline');
                                                }}
                                                className={`min-h-[90px] p-2 border-r border-b border-slate-100 dark:border-white/5 transition-all cursor-pointer
                                                ${!day.isCurrentMonth ? 'opacity-20 bg-slate-100/30 dark:bg-black/10' : 'bg-white/30 dark:bg-white/5 group hover:bg-white/60 dark:hover:bg-white/10'}
                                                ${day.isToday ? 'ring-1 ring-inset ring-[#006c55]/20 bg-[#006c55]/5' : ''}
                                            `}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[11px] font-bold ${day.isToday ? 'text-[#006c55] dark:text-emerald-400 font-black' : 'text-slate-400 dark:text-slate-500'}`}>{day.day}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {dayEvents.slice(0, 3).map(e => (
                                                        <div key={e.id} className={`w-full h-1.5 rounded-full ${e.color} opacity-80`} title={e.title}></div>
                                                    ))}
                                                    {dayEvents.length > 3 && (
                                                        <p className="text-[7px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-tighter">+{dayEvents.length - 3} mais</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer Summary - Standard Box Styling */}
                        <div className="bg-slate-50/50 dark:bg-white/5 p-6 border-t border-slate-100 dark:border-white/5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 text-center">
                                {[
                                    { l: 'Total', v: events.length },
                                    { l: 'Hoje', v: events.filter(e => e.date.toDateString() === today.toDateString()).length },
                                    { l: 'Mes', v: events.filter(e => e.date.getMonth() === currentDate.getMonth()).length },
                                    { l: 'Tasks', v: events.filter(e => e.status === 'pending').length }
                                ].map((s, i) => (
                                    <div key={i}>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{s.v}</p>
                                        <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1">{s.l}</p>
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