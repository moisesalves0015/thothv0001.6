import React, { useState, useMemo, useEffect } from 'react';
import { Reminder } from '../types';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ReminderService } from '../modules/reminder/reminder.service';
import {
  Plus,
  Check,
  Trash2,
  Star,
  Share2,
  Clock,
  Calendar as CalendarIcon,
  X,
  ChevronRight,
  MessageCircle,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  User,
  BookOpen,
  Target,
  GraduationCap
} from 'lucide-react';

const RemindersBox: React.FC = () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Carregar lembretes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          setLoading(true);
          const data = await ReminderService.getReminders(user.uid);
          setReminders(data);
        } catch (error) {
          console.error("Error loading reminders:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setReminders([]);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const [isAdding, setIsAdding] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<'all' | 'study' | 'work' | 'personal' | 'exam'>('all');

  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newDate, setNewDate] = useState(today.toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('12:00');
  const [newType, setNewType] = useState<'study' | 'work' | 'personal' | 'exam'>('study');

  const addReminder = async () => {
    if (!newTitle.trim() || !currentUser) return;

    const combinedDate = new Date(`${newDate}T${newTime}`);
    const newItem: Omit<Reminder, 'id'> = {
      title: newTitle,
      text: newText,
      completed: false,
      isHighlighted: false,
      isStarred: false,
      type: newType,
      timestamp: combinedDate.getTime(),
      date: newDate,
      time: newTime,
    };

    try {
      const addedReminder = await ReminderService.addReminder(currentUser.uid, newItem);
      setReminders([addedReminder, ...reminders]);
      resetForm();
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewText('');
    setNewDate(today.toISOString().split('T')[0]);
    setNewTime('12:00');
    setNewType('study');
    setIsAdding(false);
  };

  const toggleComplete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const newCompleted = !reminder.completed;

    // Otimistic Global Update
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: newCompleted } : r));

    try {
      await ReminderService.updateReminder(currentUser.uid, id, { completed: newCompleted });
    } catch (error) {
      console.error("Error updating reminder:", error);
      // Revert on error if needed
    }
  };

  const toggleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const newStarred = !reminder.isStarred;

    setReminders(reminders.map(r => r.id === id ? { ...r, isStarred: newStarred } : r));

    try {
      await ReminderService.updateReminder(currentUser.uid, id, { isStarred: newStarred });
    } catch (error) {
      console.error("Error updating star:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;

    // Optimistic
    setReminders(reminders.filter(r => r.id !== id));
    setDeleteConfirmId(null);
    if (selectedReminder?.id === id) setSelectedReminder(null);

    try {
      await ReminderService.deleteReminder(currentUser.uid, id);
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const shareReminder = async (reminder: Reminder, type: 'internal' | 'external') => {
    if (type === 'external') {
      const formattedDate = reminder.date ? reminder.date.split('-').reverse().join('/') : 'Hoje';
      const formattedTime = reminder.time || '--:--';

      const shareText = `✨ Olha esse lembrete que eu criei no Thoth\n\n📌 Título: ${reminder.title}\n\n📝 ${reminder.text}\n\n⏰ Data e hora:\n${formattedDate} às ${formattedTime}\n\n🚀 Junte-se a essa comunidade no Thoth`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: reminder.title,
            text: shareText,
          });
        } catch (err) {
          console.debug('User cancelled share or browser error:', err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareText);
          alert('Conteúdo copiado para a área de transferência!');
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      }
    } else {
      alert(`Compartilhando "${reminder.title}" com suas conexões Thoth...`);
    }
  };

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    const monthName = viewDate.toLocaleString('pt-BR', { month: 'long' });
    return { days, monthName, year, month };
  }, [viewDate]);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const getRemindersForDay = (day: number | null) => {
    if (!day) return [];
    return reminders.filter(r => {
      const d = new Date(r.timestamp);
      return d.getDate() === day &&
        d.getMonth() === calendarData.month &&
        d.getFullYear() === calendarData.year;
    });
  };

  const filteredReminders = useMemo(() => {
    if (activeFilter === 'all') return reminders;
    return reminders.filter(r => r.type === activeFilter);
  }, [reminders, activeFilter]);

  const getTypeConfig = (type?: string) => {
    switch (type) {
      case 'study': return { label: 'Estudo', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: BookOpen };
      case 'work': return { label: 'Trabalho', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Target };
      case 'exam': return { label: 'Prova', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: GraduationCap };
      case 'personal': return { label: 'Pessoal', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', icon: User };
      default: return { label: 'Geral', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: BookOpen };
    }
  };

  const typeFilters = [
    { id: 'all', label: 'Todos', icon: BookOpen, color: 'text-slate-600', bg: 'bg-slate-50' },
    { id: 'study', label: 'Estudo', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'work', label: 'Trabalho', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'exam', label: 'Provas', icon: GraduationCap, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'personal', label: 'Pessoal', icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="w-full lg:w-[315px] h-[550px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl relative border border-white/40">
      {/* Header */}
      <div className="flex flex-col px-6 pt-6 pb-4 flex-shrink-0 z-10 bg-gradient-to-b from-white/80 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Lembretes</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">
              organização acadêmica
            </span>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 bg-[#006c55] hover:bg-[#005a46] text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-[#006c55]/20 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            const count = filter.id === 'all'
              ? reminders.length
              : reminders.filter(r => r.type === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${isActive
                  ? `${filter.bg} ${filter.color} font-bold border border-white/40`
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <Icon size={12} />
                <span className="text-[10px] font-bold whitespace-nowrap">{filter.label}</span>
                {count > 0 && (
                  <span className={`text-[8px] font-black px-1 py-0.5 rounded-full ${isActive
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-100 text-slate-500'
                    }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Lembretes */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 bg-transparent">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006c55]"></div>
            <p className="mt-2 text-xs font-bold text-slate-400">Carregando...</p>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 opacity-40 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <Check size={32} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tudo em dia!</p>
            <p className="text-[9px] text-slate-400 mt-2 max-w-[180px]">
              {activeFilter === 'all'
                ? 'Nenhum lembrete criado ainda'
                : `Nenhum lembrete do tipo ${typeFilters.find(f => f.id === activeFilter)?.label.toLowerCase()}`}
            </p>
          </div>
        ) : (
          filteredReminders.map((reminder) => {
            const typeConfig = getTypeConfig(reminder.type);
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={reminder.id}
                onClick={() => setSelectedReminder(reminder)}
                className={`group relative flex flex-col p-4 rounded-2xl border transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-2 ${reminder.completed
                    ? 'bg-slate-50/50 border-slate-100 opacity-60'
                    : reminder.isStarred
                      ? 'bg-gradient-to-br from-white to-white/95 border-amber-200 shadow-lg shadow-amber-500/5'
                      : 'bg-gradient-to-br from-white/95 to-white/80 border-white hover:border-[#006c55]/20 hover:shadow-lg'
                  }`}
              >
                {/* Type Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${typeConfig.bg} ${typeConfig.border}`}>
                    <TypeIcon size={10} className={typeConfig.color} />
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                  </div>

                  <button
                    onClick={(e) => toggleComplete(reminder.id, e)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${reminder.completed
                      ? 'bg-[#006c55] text-white'
                      : 'bg-white text-slate-300 hover:text-[#006c55] hover:bg-[#006c55]/10 border border-slate-100'
                      }`}
                  >
                    <Check size={14} strokeWidth={4} />
                  </button>
                </div>

                {/* Title and Text */}
                <div className="mb-3">
                  <h4 className={`text-[14px] font-black leading-tight mb-1 ${reminder.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {reminder.title}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed">
                    {reminder.text}
                  </p>
                </div>

                {/* Date/Time and Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100/40">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex items-center gap-1">
                      <CalendarIcon size={10} className="text-[#006c55]" />
                      <span className="text-[9px] font-bold uppercase tracking-tight">
                        {reminder.date ? reminder.date.split('-').reverse().slice(0, 2).join('/') : 'Hoje'}
                      </span>
                    </div>
                    <span className="text-[8px] text-slate-300">•</span>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-[#006c55]" />
                      <span className="text-[9px] font-bold uppercase tracking-tight">{reminder.time || '--:--'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => toggleStar(reminder.id, e)}
                      className={`transition-colors ${reminder.isStarred ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
                    >
                      <Star size={14} fill={reminder.isStarred ? 'currentColor' : 'none'} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Nav */}
      <div className="p-6 bg-transparent border-t border-white/40 shrink-0">
        <button
          onClick={() => setIsAgendaOpen(true)}
          className="w-full flex items-center justify-between text-slate-400 hover:text-[#006c55] transition-colors group"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Acessar agenda completa</span>
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Modal: Novo Lembrete */}
      {isAdding && (
        <div className="absolute inset-0 z-[60] bg-gradient-to-br from-white to-white/95 p-6 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Novo Lembrete</h3>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#006c55] mt-1 opacity-80">
                organize sua rotina
              </span>
            </div>
            <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto no-scrollbar pb-6">
            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tipo</label>
              <div className="grid grid-cols-4 gap-2">
                {typeFilters.slice(1).map((filter) => {
                  const Icon = filter.icon;
                  const isActive = newType === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setNewType(filter.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isActive
                        ? `${filter.bg} border-2 ${filter.color.replace('text-', 'border-')} font-bold`
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                    >
                      <Icon size={16} className={isActive ? filter.color : 'text-slate-400'} />
                      <span className={`text-[10px] font-bold mt-1 ${isActive ? filter.color : 'text-slate-500'}`}>
                        {filter.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Título</label>
              <input
                type="text"
                placeholder="Ex: Entrega de Projeto"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full h-12 bg-white border border-slate-100 rounded-xl px-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Descrição</label>
              <textarea
                placeholder="Detalhes do lembrete..."
                value={newText}
                onChange={e => setNewText(e.target.value)}
                className="w-full h-28 bg-white border border-slate-100 rounded-xl p-4 font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Data</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full h-12 bg-white border border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Hora</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full h-12 bg-white border border-slate-100 rounded-xl px-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all"
                />
              </div>
            </div>
          </div>

          <button
            onClick={addReminder}
            disabled={!newTitle.trim()}
            className="w-full h-14 bg-gradient-to-r from-[#006c55] via-[#007a62] to-[#00876a] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#006c55]/20 hover:shadow-2xl hover:shadow-[#006c55]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Adicionar Lembrete</span>
          </button>
        </div>
      )}

      {/* Modal: Detalhes do Lembrete */}
      {selectedReminder && (
        <div className="absolute inset-0 z-[70] bg-gradient-to-br from-white to-white/95 p-6 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={(e) => toggleStar(selectedReminder.id, e as any)}
              className={`${selectedReminder.isStarred ? 'text-amber-400' : 'text-slate-300'} transition-colors`}
            >
              <Star size={24} fill={selectedReminder.isStarred ? 'currentColor' : 'none'} strokeWidth={3} />
            </button>
            <button onClick={() => setSelectedReminder(null)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Type Badge */}
            <div className="mb-4">
              {(() => {
                const typeConfig = getTypeConfig(selectedReminder.type);
                const TypeIcon = typeConfig.icon;
                return (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${typeConfig.bg} ${typeConfig.border}`}>
                    <TypeIcon size={12} className={typeConfig.color} />
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                  </div>
                );
              })()}
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">{selectedReminder.title}</h3>

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-white px-4 py-2 rounded-xl border border-slate-100 text-[12px] font-bold text-slate-700">
                <CalendarIcon size={14} className="text-[#006c55]" />
                {selectedReminder.date?.split('-').reverse().join('/')}
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-white px-4 py-2 rounded-xl border border-slate-100 text-[12px] font-bold text-slate-700">
                <Clock size={14} className="text-[#006c55]" />
                {selectedReminder.time}
              </div>
            </div>

            <p className="text-slate-600 font-medium leading-relaxed bg-gradient-to-br from-slate-50/50 to-white p-5 rounded-2xl border border-slate-100 mb-8">
              {selectedReminder.text}
            </p>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Compartilhar</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareReminder(selectedReminder, 'internal')}
                  className="h-14 rounded-xl bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-slate-50"
                >
                  <Share2 size={16} />
                  <span>Thoth Rede</span>
                </button>
                <button
                  onClick={() => shareReminder(selectedReminder, 'external')}
                  className="h-14 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-600 border border-emerald-100 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:from-emerald-100 hover:to-emerald-50"
                >
                  <MessageCircle size={16} />
                  <span>Menu Nativo</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setDeleteConfirmId(selectedReminder.id)}
            className="h-14 w-full rounded-xl bg-gradient-to-r from-red-50 to-red-50/50 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest mt-6 flex items-center justify-center gap-2 border border-red-100"
          >
            <Trash2 size={16} />
            <span>Excluir Lembrete</span>
          </button>
        </div>
      )}

      {/* Modal: Agenda */}
      {isAgendaOpen && (
        <div className="absolute inset-0 z-[80] bg-gradient-to-br from-white to-white/95 p-6 flex flex-col animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Agenda</h3>
            <button onClick={() => setIsAgendaOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black uppercase tracking-widest text-[#006c55] capitalize">
                {calendarData.monthName} {calendarData.year}
              </span>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-[#006c55] transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-[#006c55] transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-black text-slate-300 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 flex-1">
              {calendarData.days.map((day, i) => {
                const dayReminders = getRemindersForDay(day);
                const isToday = day === new Date().getDate() &&
                  calendarData.month === new Date().getMonth() &&
                  calendarData.year === new Date().getFullYear();
                const hasPriority = dayReminders.some(r => r.isStarred);
                const hasFuture = day && (new Date(calendarData.year, calendarData.month, day) > new Date());

                return (
                  <div
                    key={i}
                    onClick={() => dayReminders.length > 0 && setSelectedReminder(dayReminders[0])}
                    className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative transition-all cursor-pointer ${!day
                      ? 'opacity-0 pointer-events-none'
                      : isToday
                        ? 'bg-gradient-to-br from-[#006c55] to-[#00876a] border-[#006c55] text-white'
                        : dayReminders.length > 0
                          ? 'bg-gradient-to-br from-white to-white/95 border-[#006c55]/20 text-slate-900'
                          : 'bg-slate-50/50 border-slate-100 text-slate-400'
                      }`}
                  >
                    <span className={`text-xs font-black ${isToday ? 'text-white' : 'text-slate-900'}`}>
                      {day}
                    </span>

                    {dayReminders.length > 0 && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-[#006c55]'}`} />
                        {hasPriority && <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-amber-400'}`} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#006c55]" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Hoje</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Prioritário</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Com Lembrete</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-white/95 rounded-2xl p-6 w-full max-w-[280px] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <h4 className="text-base font-black text-slate-900 mb-2">Excluir lembrete?</h4>
            <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">
              Esta ação não pode ser desfeita. O lembrete será removido permanentemente.
            </p>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="h-12 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:from-red-600 hover:to-red-700 transition-all"
              >
                Confirmar Exclusão
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="h-12 bg-white text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="date"], input[type="time"] { 
          appearance: none; 
          -webkit-appearance: none; 
        }
      `}</style>
    </div>
  );
};

export default RemindersBox;