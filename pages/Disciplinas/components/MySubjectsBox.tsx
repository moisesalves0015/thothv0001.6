import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Bell,
  MoreVertical,
  ChevronRight,
  BookOpen,
  Plus,
  Filter,
  X,
  Sparkles,
  Search,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { DisciplineService } from '../../../modules/discipline/discipline.service';
import { Discipline } from '../../../types';
import CreateDisciplineModal from './CreateDisciplineModal';
import JoinDisciplineModal from './JoinDisciplineModal';

const MySubjectsBox: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'Todas' | 'Inscritas' | 'Criadas'>('Todas');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // New States for Real Logic
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Real-time Subscription
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = DisciplineService.subscribeToUserDisciplines(user.uid, (data) => {
      setDisciplines(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle click outside for filter and card menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    if (isFilterOpen || activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen, activeMenuId]);

  const filteredSubjects = disciplines
    .sort((a, b) => {
      // Use current time as fallback for pending server timestamps to keep new items at the top
      const dateA = a.createdAt?.seconds || Date.now() / 1000;
      const dateB = b.createdAt?.seconds || Date.now() / 1000;
      return dateB - dateA;
    })
    .filter(s => {
      if (filter === 'Todas') return true;
      const isTeacher = s.teacherId === user?.uid;
      if (filter === 'Criadas') return isTeacher;
      if (filter === 'Inscritas') return !isTeacher;
      return true;
    });

  // Reset scroll and trigger recurring "peek" animation
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    // Reset to 0 immediately on filter/data change
    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });

    if (filteredSubjects.length <= 1) return;

    const triggerPeek = () => {
      if (scrollContainerRef.current) {
        // Peek right (increased distance to 240px to show 2nd card)
        scrollContainerRef.current.scrollTo({ left: 240, behavior: 'smooth' });
        
        // Return after a longer pause
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          }
        }, 1200);
      }
    };

    // Initial peek after short delay
    const initialTimer = setTimeout(triggerPeek, 1500);

    // Recurring peek every 40 seconds
    const interval = setInterval(triggerPeek, 40000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [filter, disciplines, filteredSubjects.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full liquid-glass rounded-[32px] pt-6 md:pt-8 pb-1 md:pb-2 px-0 shadow-2xl border border-white/60 dark:border-white/10 overflow-visible group/subjects">
      {/* Decorative Accent (Clipped to radius) */}
      <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-[#006c55] to-blue-500 opacity-0 group-hover/subjects:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Header Estilo Home Feed */}
      <div className="flex items-center justify-between px-6 md:px-8">
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Minhas Disciplinas</h2>
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-1">
            Gestão de Grade
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Filtro Estilo SidebarFeed */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isFilterOpen ?
                'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' :
                'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-[#006c55] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 border border-white/90 dark:border-white/10 shadow-sm'
                } active:scale-95`}
              title="Filtrar disciplinas"
            >
              <Filter size={18} />
            </button>

            {/* Dropdown de Filtros */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Filtrar por</span>
                </div>
                {['Todas', 'Inscritas', 'Criadas'].map((f) => {
                  const isActive = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => {
                        setFilter(f as any);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${isActive ?
                        'bg-emerald-50 dark:bg-emerald-900/20 text-[#006c55] dark:text-emerald-400 font-bold' :
                        'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <span className="text-[12px] font-medium">{f}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#006c55] dark:bg-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botão Buscar/Entrar */}
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-[#006c55] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-white/90 dark:border-white/10 shadow-sm active:scale-95 flex items-center justify-center"
            title="Buscar Disciplina"
          >
            <Search size={18} strokeWidth={3} />
          </button>

          {/* Botão Criar */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-9 h-9 rounded-full bg-slate-900 dark:bg-emerald-500 text-white hover:bg-black dark:hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center justify-center transform hover:rotate-90 duration-300"
            title="Nova Disciplina"
          >
            <Plus size={18} strokeWidth={3} />
          </button>

          {/* Controles de Scroll (Desktop Only) */}
          <div className="hidden md:flex gap-2 ml-2">
            <button
              onClick={() => handleScroll('left')}
              className="w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 text-[#006c55] dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition-all border border-white/90 dark:border-white/10 shadow-sm active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 text-[#006c55] dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition-all border border-white/90 dark:border-white/10 shadow-sm active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Badge do Filtro Ativo */}
      {filter !== 'Todas' && (
        <div className="flex items-center gap-2 mb-6 px-6 md:px-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
            <Filter size={12} className="text-[#006c55] dark:text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#006c55] dark:text-emerald-400">
              {filter}
            </span>
            <button
              onClick={() => setFilter('Todas')}
              className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
            >
              <X size={10} />
            </button>
          </div>
        </div>
      )}
      {/* GRID / FEED DE DISCIPLINAS */}
      <div 
        ref={scrollContainerRef}
        className="flex items-stretch gap-[30px] overflow-x-auto no-scrollbar scroll-px-6 md:scroll-px-8 pt-4 pb-4 snap-x snap-mandatory scroll-smooth flex-1 min-h-0"
      >
        {filteredSubjects.length === 0 ? (
          <div className="w-full px-6 md:px-8">
            <div className="w-full py-20 flex flex-col items-center justify-center glass-panel rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
              <BookOpen size={48} className="mb-4 text-slate-300 opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nenhuma disciplina na grade</p>
            </div>
          </div>
        ) : (
          <>
            {/* Espaçador Inicial Físico (Mais confiável para snap horizontal) */}
            <div className="flex-shrink-0 w-px h-px snap-start ml-6 md:ml-8 -mr-[30px]" />
            
            {filteredSubjects.map((subject) => {
              const isTeacher = subject.teacherId === user?.uid;
              return (
                <div key={subject.id} className="snap-start flex-shrink-0">
                  <div
                    className={`group h-full flex-shrink-0 w-[340px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[2.5rem] shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                      activeMenuId === subject.id ? 'z-[60] relative' : 'z-10'
                    }`}
                  >
                    {/* Banner do Card com Gradiente Dinâmico */}
                    <div className="h-32 relative overflow-hidden">
                      <div 
                        className="absolute inset-0 opacity-20 dark:opacity-40"
                        style={{ 
                          background: `linear-gradient(135deg, ${subject.themeColor}, #ffffff00)`,
                        }}
                      />
                      <div 
                        className="absolute inset-0 backdrop-blur-[2px]"
                        style={{ backgroundColor: `${subject.themeColor}10` }}
                      />
                      
                      {/* Pattern Decorativo */}
                      <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full border-[20px] border-white -mr-10 -mt-10" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full border-[10px] border-white -ml-5 -mb-5" />
                      </div>

                      {/* Badges do Canto */}
                      <div className="absolute top-5 left-6 flex gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-sm">
                          <div className={`w-1.5 h-1.5 rounded-full ${isTeacher ? 'bg-amber-400' : 'bg-emerald-400'} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                          <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">{isTeacher ? 'Criada' : 'Inscrita'}</span>
                        </div>
                        {subject.type === 'private' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                            <Lock size={10} className="text-white" />
                            <span className="text-[9px] font-black text-white hover:text-white uppercase tracking-wider">Privada</span>
                          </div>
                        )}
                      </div>

                      {/* Menu do Card */}
                      <div className="absolute top-5 right-5" ref={activeMenuId === subject.id ? menuRef : null}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === subject.id ? null : subject.id);
                          }}
                          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {activeMenuId === subject.id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-[200] py-2 border border-slate-100 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200">
                            <button className="w-full text-left px-5 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Detalhes da Turma</button>
                            <button className="w-full text-left px-5 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Materiais de Apoio</button>
                            <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />
                            <button className="w-full text-left px-5 py-3 text-[11px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">Remover da Grade</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="px-8 pt-0 pb-8 flex-1 flex flex-col relative">
                      
                      {/* Avatar do Instrutor (Floating) */}
                      <div className="relative -mt-10 mb-5 flex items-end justify-between">
                        <div className="relative group/avatar">
                          <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-800 p-1 shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                            <div className="w-full h-full rounded-[1.8rem] overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-100 dark:bg-slate-700">
                              <img src={subject.teacherAvatar} className="w-full h-full object-cover" alt="Instrutor" />
                            </div>
                          </div>
                          <div 
                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-50 dark:border-white/10 flex items-center justify-center shadow-lg"
                            style={{ color: subject.themeColor }}
                          >
                            <BookOpen size={14} strokeWidth={2.5} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                            <MessageCircle size={12} className="text-[#006c55] dark:text-emerald-400" />
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">12</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                            <Bell size={12} className="text-[#006c55] dark:text-emerald-400" />
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">5</span>
                          </div>
                        </div>
                      </div>

                      {/* Texto e Info Principal */}
                      <div className="space-y-1 mb-6">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] block">Cod: {subject.code}</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight hover:text-[#006c55] dark:hover:text-emerald-400 transition-colors cursor-pointer">{subject.name}</h3>
                      </div>

                      {/* Grade de Horários (Compact Chips - Horizontal Scroll) */}
                      <div className="group/schedule relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Horários</span>
                          <div className="flex gap-1 opacity-0 group-hover/schedule:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const el = document.getElementById(`schedule-${subject.id}`);
                                el?.scrollBy({ left: -100, behavior: 'smooth' });
                              }}
                              className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-[#006c55] hover:text-white transition-all"
                            >
                              <ChevronLeft size={10} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const el = document.getElementById(`schedule-${subject.id}`);
                                el?.scrollBy({ left: 100, behavior: 'smooth' });
                              }}
                              className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-[#006c55] hover:text-white transition-all"
                            >
                              <ChevronRight size={10} />
                            </button>
                          </div>
                        </div>
                        <div 
                          id={`schedule-${subject.id}`}
                          className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 mb-8 pb-1 scroll-smooth"
                        >
                          {subject.schedule.map((item, idx) => (
                            <div key={idx} className="flex flex-col rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-2.5 min-w-[120px] transition-all hover:border-slate-200 dark:hover:border-white/10 flex-shrink-0">
                              <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1.5">{item.day}</span>
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">{item.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer App-like */}
                      <div className="mt-auto pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center -space-x-2.5 mr-3">
                            {subject.members.slice(0, 3).map((uid, idx) => (
                              <div key={idx} className="w-9 h-9 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 shadow-sm bg-slate-100 dark:bg-slate-800 transition-transform hover:-translate-y-1">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`} alt="Estudante" className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {subject.members.length > 3 && (
                              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                                <span className="text-[9px] font-black text-slate-500">+{subject.members.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none">Alunos</span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1">{subject.members.length} Inscritos</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => navigate(`/disciplinas/${subject.id}`)} 
                          className="w-11 h-11 rounded-[1.3rem] bg-slate-900 dark:bg-emerald-500 text-white flex items-center justify-center transition-all hover:rotate-6 hover:scale-110 active:scale-95 shadow-xl hover:shadow-emerald-500/25"
                        >
                          <ChevronRight size={20} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex-shrink-0 w-8" />
          </>
        )}
      </div>

      <CreateDisciplineModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      
      <JoinDisciplineModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default MySubjectsBox;
