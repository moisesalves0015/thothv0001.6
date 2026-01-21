import React, { useState, useMemo } from 'react';
import { Reminder } from '../types';
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
  ChevronLeft
} from 'lucide-react';

interface EnhancedReminder extends Reminder {
  title: string;
  time?: string;
  date?: string;
  isStarred?: boolean;
}

const RemindersBox: React.FC = () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const [reminders, setReminders] = useState<EnhancedReminder[]>([
    { 
      id: '1', 
      title: 'Entrega do Portfólio',
      text: 'Finalizar a renderização das telas do projeto Thoth e organizar os assets no Figma para a apresentação de amanhã.', 
      completed: false, 
      isHighlighted: true, 
      isStarred: true,
      timestamp: today.getTime(),
      date: today.toISOString().split('T')[0],
      time: '23:59',
    },
    { 
      id: '2', 
      title: 'Reunião de Alinhamento',
      text: 'Discutir o progresso do desenvolvimento front-end com a equipe de design e validar as novas interações de vidro.', 
      completed: false, 
      isHighlighted: false, 
      isStarred: false,
      timestamp: tomorrow.getTime(),
      date: tomorrow.toISOString().split('T')[0],
      time: '14:00',
    }
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<EnhancedReminder | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newDate, setNewDate] = useState(today.toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('12:00');

  const addReminder = () => {
    if (!newTitle.trim()) return;
    const combinedDate = new Date(`${newDate}T${newTime}`);
    const newItem: EnhancedReminder = {
      id: Date.now().toString(),
      title: newTitle,
      text: newText,
      completed: false,
      isHighlighted: false,
      isStarred: false,
      timestamp: combinedDate.getTime(),
      date: newDate,
      time: newTime,
    };
    setReminders([newItem, ...reminders]);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewText('');
    setNewDate(today.toISOString().split('T')[0]);
    setNewTime('12:00');
    setIsAdding(false);
  };

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReminders(reminders.map(r => r.id === id ? { ...r, isStarred: !r.isStarred } : r));
  };

  const handleDelete = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
    setDeleteConfirmId(null);
    if (selectedReminder?.id === id) setSelectedReminder(null);
  };

  const shareReminder = async (reminder: EnhancedReminder, type: 'internal' | 'external') => {
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

  return (
    <div className="w-full lg:w-[315px] h-[550px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl relative border border-white/40">
      {/* Header - Padronizado com SidebarFeed */}
      <div className="flex flex-col px-6 pt-6 mb-4 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Lembretes</h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 bg-[#006c55] hover:bg-[#005a46] text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-[#006c55]/20 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Organização</span>
      </div>

      {/* Lista de Lembretes - Padding p-6 */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 bg-transparent">
        {reminders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 opacity-40 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <Check size={32} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tudo em dia!</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div 
              key={reminder.id}
              onClick={() => setSelectedReminder(reminder)}
              className={`group relative flex flex-col p-5 rounded-2xl border transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-2 ${
                reminder.completed 
                ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                : reminder.isStarred 
                  ? 'bg-white border-[#006c55]/20 shadow-xl shadow-[#006c55]/5 scale-[1.02]' 
                  : 'bg-white/80 border-white hover:border-[#006c55]/10 hover:bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className={`text-[14px] font-black leading-tight mb-1 truncate ${reminder.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                    {reminder.title}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed">
                    {reminder.text}
                  </p>
                </div>
                <button 
                  onClick={(e) => toggleComplete(reminder.id, e)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    reminder.completed 
                    ? 'bg-[#006c55] text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-300 hover:text-[#006c55] hover:bg-[#006c55]/10'
                  }`}
                >
                  <Check size={14} strokeWidth={4} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/40">
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="flex items-center gap-1">
                    <CalendarIcon size={11} className="text-[#006c55]" />
                    <span className="text-[9px] font-bold uppercase tracking-tight">
                      {reminder.date ? reminder.date.split('-').reverse().slice(0, 2).join('/') : 'Hoje'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={11} className="text-[#006c55]" />
                    <span className="text-[9px] font-bold uppercase tracking-tight">{reminder.time || '--:--'}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => toggleStar(reminder.id, e)}
                  className={`transition-colors ${reminder.isStarred ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
                >
                  <Star size={14} fill={reminder.isStarred ? 'currentColor' : 'none'} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))
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

      {/* Overlays / Modais */}
      {isAdding && (
        <div className="absolute inset-0 z-[60] bg-white dark:bg-slate-900 p-8 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Novo Lembrete</h3>
            <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24}/></button>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Título</label>
              <input 
                type="text" 
                placeholder="Ex: Entrega de Projeto" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-2xl px-5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#006c55] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Descrição</label>
              <textarea 
                placeholder="Detalhes..." 
                value={newText}
                onChange={e => setNewText(e.target.value)}
                className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-2xl p-5 font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:border-[#006c55] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Data</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={e => setNewDate(e.target.value)} 
                  className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-2xl px-4 font-bold text-slate-700 dark:text-white focus:outline-none" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Hora</label>
                <input 
                  type="time" 
                  value={newTime} 
                  onChange={e => setNewTime(e.target.value)} 
                  className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-2xl px-4 font-bold text-slate-700 dark:text-white focus:outline-none" 
                />
              </div>
            </div>
          </div>

          <button 
            onClick={addReminder}
            disabled={!newTitle.trim()}
            className="w-full h-16 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[#006c55]/20 disabled:opacity-50 transition-all mt-4 flex items-center justify-center gap-2"
          >
            Salvar <ArrowRight size={18} />
          </button>
        </div>
      )}

      {selectedReminder && (
        <div className="absolute inset-0 z-[70] bg-white dark:bg-slate-900 p-8 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-10">
            <button 
              onClick={(e) => toggleStar(selectedReminder.id, e as any)}
              className={`${selectedReminder.isStarred ? 'text-amber-400' : 'text-slate-300'} transition-colors`}
            >
              <Star size={24} fill={selectedReminder.isStarred ? 'currentColor' : 'none'} strokeWidth={3} />
            </button>
            <button onClick={() => setSelectedReminder(null)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24}/></button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{selectedReminder.title}</h3>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/10 text-[11px] font-black uppercase text-slate-700 dark:text-slate-200">
                <CalendarIcon size={14} className="text-[#006c55]" /> {selectedReminder.date?.split('-').reverse().join('/')}
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/10 text-[11px] font-black uppercase text-slate-700 dark:text-slate-200">
                <Clock size={14} className="text-[#006c55]" /> {selectedReminder.time}
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50/30 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-white/5 mb-10">
              {selectedReminder.text}
            </p>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Compartilhar</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => shareReminder(selectedReminder, 'internal')}
                  className="h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all group"
                >
                  <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Thoth Rede</span>
                </button>
                <button 
                  onClick={() => shareReminder(selectedReminder, 'external')}
                  className="h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all group"
                >
                  <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Menu Nativo</span>
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setDeleteConfirmId(selectedReminder.id)}
            className="h-14 w-full rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest mt-6"
          >
            <Trash2 size={18} className="inline mr-2" /> Excluir
          </button>
        </div>
      )}

      {isAgendaOpen && (
        <div className="absolute inset-0 z-[80] bg-white dark:bg-slate-900 p-6 flex flex-col animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Agenda</h3>
            <button onClick={() => setIsAgendaOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24}/></button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black uppercase tracking-widest text-[#006c55] capitalize">
                {calendarData.monthName} {calendarData.year}
              </span>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-1 text-slate-300 hover:text-[#006c55]"><ChevronLeft size={20}/></button>
                <button onClick={nextMonth} className="p-1 text-slate-300 hover:text-[#006c55]"><ChevronRight size={20}/></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-black text-slate-300 uppercase py-1">{d}</div>
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
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                      !day ? 'opacity-0 pointer-events-none' : 
                      isToday ? 'bg-[#006c55] border-[#006c55] text-white' :
                      dayReminders.length > 0 ? 'bg-white dark:bg-slate-800 border-[#006c55]/20 text-slate-900 dark:text-white' :
                      'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-white/5 text-slate-400'
                    }`}
                  >
                    <span className={`text-xs font-black ${isToday ? 'text-white' : dayReminders.length > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    
                    {dayReminders.length > 0 && (
                      <div className="absolute bottom-1.5 flex gap-0.5">
                        <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-[#006c55]'}`} />
                        {hasPriority && <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-amber-400'}`} />}
                        {hasFuture && <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-blue-400'}`} />}
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
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Futuro</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-[280px] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Tem certeza?</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Você realmente deseja excluir este lembrete?</p>
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => handleDelete(deleteConfirmId)}
                className="h-12 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-colors"
              >
                Confirmar Exclusão
              </button>
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
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
        input[type="date"], input[type="time"] { appearance: none; -webkit-appearance: none; }
      `}</style>
    </div>
  );
};

export default RemindersBox;