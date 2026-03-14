
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Bell,
  MoreVertical,
  ChevronRight,
  BookOpen,
  Plus,
  Filter,
  X,
  Sparkles
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'criada' | 'inscrita';
  schedule: { day: string; time: string }[];
  participants: string[];
  themeColor: string;
  dotColor: string;
  mainAvatar: string;
}

const MOCK_SUBJECTS: Subject[] = [
  {
    id: '1',
    name: 'História do Brasil II',
    code: 'Cod.: 25468521',
    type: 'inscrita',
    themeColor: '#006c55', // Thoth Primary
    dotColor: '#a7d1c5',
    mainAvatar: 'https://i.pravatar.cc/150?u=subject1',
    schedule: [
      { day: 'Segunda', time: '10:40 – 12:20' },
      { day: 'Quarta', time: '10:40 – 12:20' }
    ],
    participants: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=7'
    ]
  },
  {
    id: '2',
    name: 'Antropologia Visual',
    code: 'Cod.: 25468521',
    type: 'criada',
    themeColor: '#8b4513', // Warm Earth
    dotColor: '#d2b48c',
    mainAvatar: 'https://i.pravatar.cc/150?u=subject2',
    schedule: [
      { day: 'Terça', time: '08:00 – 10:00' },
      { day: 'Quinta', time: '14:00 – 16:00' }
    ],
    participants: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=9',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=10',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=11'
    ]
  },
  {
    id: '3',
    name: 'Design de Interfaces',
    code: 'Cod.: 25468521',
    type: 'inscrita',
    themeColor: '#1e40af', // Deep Blue
    dotColor: '#93c5fd',
    mainAvatar: 'https://i.pravatar.cc/150?u=subject3',
    schedule: [
      { day: 'Segunda', time: '18:30 – 20:30' },
      { day: 'Sexta', time: '18:30 – 20:30' }
    ],
    participants: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=14',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=15',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=16'
    ]
  }
];

const MySubjectsBox: React.FC = () => {
  const [filter, setFilter] = useState<'Todas' | 'Inscritas' | 'Criadas'>('Todas');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle click outside for filter and card menus
  React.useEffect(() => {
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

  const filteredSubjects = MOCK_SUBJECTS.filter(s => {
    if (filter === 'Todas') return true;
    if (filter === 'Criadas') return s.type === 'criada';
    if (filter === 'Inscritas') return s.type === 'inscrita';
    return true;
  });

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

          {/* Botão Criar Estilo New Post */}
          <button
            onClick={() => {/* Lógica de criar disciplina */}}
            className="w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-[#006c55] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-white/90 dark:border-white/10 shadow-sm active:scale-95 flex items-center justify-center"
            title="Nova Disciplina"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
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
      <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-0 pt-8 pb-4 no-scrollbar snap-x">
        {filteredSubjects.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center glass-panel rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
            <BookOpen size={48} className="mb-4 text-slate-300 opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nenhuma disciplina na grade</p>
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className={`group flex-shrink-0 w-[300px] md:w-auto first:ml-6 md:first:ml-8 last:mr-6 md:last:mr-8 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-[2.5rem] shadow-sm hover:shadow-xl flex flex-col transition-all duration-500 hover:-translate-y-2 ${
                activeMenuId === subject.id ? 'z-[60] relative shadow-xl' : 'z-10'
              }`}
            >
              {/* Background Decorativo Clipado */}
              <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                <div 
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-[0.08] transition-all duration-700 group-hover:scale-150 group-hover:opacity-[0.12]"
                  style={{ backgroundColor: subject.themeColor }} 
                />
              </div>

              {/* Header do Card (Lado a Lado) */}
              <div className="h-24 relative p-6 pb-2">
                
                <div className="relative flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/5 shadow-sm transition-transform group-hover:rotate-6">
                      <BookOpen size={20} style={{ color: subject.themeColor }} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Mensagens no topo do card como solicitado */}
                    <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <MessageSquare size={12} className="text-[#006c55] dark:text-emerald-400" />
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">12</span>
                    </div>

                    {/* Avatar do Professor */}
                    <div className="relative group/avatar cursor-pointer z-20">
                      <div className="relative w-11 h-11 transition-transform duration-500 group-hover/avatar:scale-110">
                        <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[1rem] shadow-xl" />
                        <div className="absolute inset-0.5 rounded-[0.8rem] overflow-hidden border border-slate-50 dark:border-white/10">
                          <img src={subject.mainAvatar} className="w-full h-full object-cover" alt="Instrutor" />
                        </div>
                        <div 
                          className="absolute -inset-0.5 border-2 rounded-[1.1rem] opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" 
                          style={{ borderColor: subject.themeColor }}
                        />
                      </div>
                    </div>

                    <div className="relative" ref={activeMenuId === subject.id ? menuRef : null}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === subject.id ? null : subject.id);
                        }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-600 dark:hover:text-white transition-all hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Menu de Opções */}
                      {activeMenuId === subject.id && (
                        <div className="absolute right-0 top-full mt-2 w-44 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-xl shadow-2xl z-[200] py-2 animate-in fade-in zoom-in-95 duration-200">
                          <button className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            Ver Detalhes
                          </button>
                          <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            Editar Grade
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />
                          <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Corpo Principal (Alinhado à Esquerda) */}
              <div className="px-8 pb-4 pt-0 flex-1 flex flex-col relative">
                <div className="mb-5">
                  <h3 className="text-[19px] font-black leading-[1.2] text-slate-900 dark:text-white mb-2 group-hover:text-[#006c55] dark:group-hover:text-emerald-400 transition-colors">
                    {subject.name}
                  </h3>
                  
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{subject.code}</span>
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${subject.type === 'criada' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">{subject.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-1 w-10 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      <div className="h-full w-0 group-hover:w-full transition-all duration-700" style={{ backgroundColor: subject.themeColor }} />
                    </div>
                  </div>
                </div>

                {/* Agenda Semanal Estilizada */}
                <div className="flex flex-col gap-1 mb-5">
                  <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] mb-0.5">Grade</span>
                  {subject.schedule.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-0 border-b border-slate-50 dark:border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-2.5 rounded-full opacity-40" style={{ backgroundColor: subject.themeColor }} />
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{item.day}</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tabular-nums">{item.time}</span>
                    </div>
                  ))}
                </div>

                {/* Rodapé do Card */}
                <div className="mt-auto pt-3 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center -space-x-2.5">
                    {subject.participants.slice(0, 4).map((avatar, idx) => (
                      <div key={idx} className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white dark:border-slate-900 shadow-sm transition-transform hover:-translate-y-1">
                        <img src={avatar} alt="Estudante" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {subject.participants.length > 4 && (
                      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-white dark:border-white/10 flex items-center justify-center shadow-sm">
                        <span className="text-[10px] font-black text-slate-400">+{subject.participants.length - 4}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => navigate(`/disciplinas/${subject.id}`)}
                      className="w-10 h-10 rounded-[1.2rem] bg-slate-900 dark:bg-emerald-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl"
                    >
                      <ChevronRight size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default MySubjectsBox;
