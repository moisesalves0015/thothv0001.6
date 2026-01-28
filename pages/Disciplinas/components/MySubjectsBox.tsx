
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Bell, 
  MoreVertical,
  ChevronRight,
  BookOpen
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filteredSubjects = MOCK_SUBJECTS.filter(s => {
    if (filter === 'Todas') return true;
    if (filter === 'Criadas') return s.type === 'criada';
    if (filter === 'Inscritas') return s.type === 'inscrita';
    return true;
  });

  return (
    <div className="w-full bg-transparent overflow-hidden">
      {/* Header com Filtros Estilizados */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 px-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">Minhas Disciplinas</h2>
        
        <div className="flex items-center gap-2">
          {['Todas', 'Inscritas', 'Criadas'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-5 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${
                filter === f 
                ? 'bg-[#d9f1a2] text-[#006c55] shadow-lg shadow-[#d9f1a2]/20 scale-105' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Horizontal de Disciplinas */}
      <div 
        ref={scrollRef}
        className="flex items-stretch gap-6 overflow-x-auto no-scrollbar pb-6 snap-x px-2"
      >
        {filteredSubjects.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center glass-panel rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
            <BookOpen size={48} className="mb-4 text-slate-300 opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nenhuma disciplina na grade</p>
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <div 
              key={subject.id}
              className="w-[300px] flex-shrink-0 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-[2.2rem] overflow-hidden shadow-2xl flex flex-col snap-start transition-all hover:translate-y-[-4px]"
              style={{ borderLeft: `6px solid ${subject.themeColor}` }}
            >
              {/* Header do Card com Padrão de Círculos Thoth */}
              <div className="h-20 relative p-5 overflow-hidden">
                 {/* Padrão radial sutil */}
                 <div className="absolute top-0 left-0 w-full h-full opacity-[0.15] pointer-events-none" 
                      style={{ 
                        backgroundImage: `radial-gradient(${subject.themeColor} 1.5px, transparent 1.5px), radial-gradient(${subject.themeColor} 1.5px, transparent 1.5px)`,
                        backgroundSize: '10px 10px',
                        backgroundPosition: '0 0, 5px 5px'
                      }}>
                 </div>
                 
                 <div className="relative flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <div className="relative group cursor-pointer">
                        <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/10">
                          <MessageSquare size={18} className="text-slate-400 group-hover:text-[#006c55] transition-colors" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#d9f1a2] text-[#006c55] text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">2</span>
                      </div>
                      <div className="relative group cursor-pointer">
                        <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/10">
                          <Bell size={18} className="text-slate-400 group-hover:text-[#006c55] transition-colors" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#d9f1a2] text-[#006c55] text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">2</span>
                      </div>
                    </div>
                    <button className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
                      <MoreVertical size={20} />
                    </button>
                 </div>
              </div>

              {/* Corpo Principal */}
              <div className="px-7 pb-7 pt-1 flex-1 flex flex-col relative">
                {/* Avatar do Professor */}
                <div className="absolute right-7 top-0 w-14 h-14 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden translate-y-[-50%] group cursor-pointer">
                  <img src={subject.mainAvatar} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Instrutor" />
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-black leading-tight text-slate-900 dark:text-white mb-1">{subject.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subject.code}</p>
                </div>

                {/* Agenda Semanal */}
                <div className="space-y-1.5 mb-7">
                  {subject.schedule.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subject.themeColor }} />
                      <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">{item.day}</span>
                      <span className="text-[12px] font-medium text-slate-400">{item.time}</span>
                    </div>
                  ))}
                </div>

                {/* Participantes Estilo Stack */}
                <div className="mb-8">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Integrantes</p>
                  <div className="flex -space-x-2">
                    {subject.participants.slice(0, 5).map((avatar, idx) => (
                      <img
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-sm transition-transform hover:translate-y-[-2px] hover:z-10"
                        src={avatar}
                        alt={`Aluno ${idx + 1}`}
                      />
                    ))}
                    {subject.participants.length > 5 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-sm z-0">
                        <span className="text-[8px] font-black text-slate-500 dark:text-slate-300">+{subject.participants.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de Ação Estilo Thoth */}
                <button 
                  onClick={() => navigate(`/disciplinas/${subject.id}`)}
                  className="mt-auto w-full h-12 bg-slate-50 dark:bg-slate-800/50 hover:bg-[#006c55] hover:text-white rounded-2xl flex items-center justify-between px-5 group transition-all border border-slate-100 dark:border-white/5 active:scale-95"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-white">Abrir Aula</span>
                  <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 group-hover:bg-white text-slate-900 group-hover:text-[#006c55] flex items-center justify-center transition-all shadow-sm">
                    <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
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
