import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  MoreVertical,
  Search,
  Filter,
  ArrowUpRight,
  TrendingDown,
  Layout,
  BookOpen,
  FileText,
  Target,
  Plus,
  ChevronRight,
  Download,
  Calendar,
  Clock
} from 'lucide-react';
import { 
  Author, 
  DisciplineLesson, 
  DisciplineMaterial, 
  DisciplineFAQ, 
  DisciplineEvaluation 
} from '../../../types';

interface CRMViewProps {
  disciplineId: string;
  members: Author[];
  lessons: DisciplineLesson[];
  materials: DisciplineMaterial[];
  evaluations: DisciplineEvaluation[];
  assignments: any[];
  faqs: DisciplineFAQ[];
  onAction: (tab: string) => void;
}

const CRMView: React.FC<CRMViewProps> = ({ 
  disciplineId, 
  members, 
  lessons, 
  materials, 
  evaluations, 
  assignments,
  faqs,
  onAction 
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'lessons' | 'assignments' | 'materials' | 'evaluations'>('students');

  // Mock metrics for premium feel
  const metrics = [
    { label: 'Engajamento Geral', value: '84%', change: '+5.2%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Entrega de Trabalhos', value: '92%', change: '+3.1%', icon: CheckCircle2, color: 'text-[#006c55]', bg: 'bg-[#006c55]/10' },
    { label: 'Alunos em Risco', value: '3', change: '-1', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Média da Turma', value: '8.5', change: '+0.4', icon: ArrowUpRight, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const tabs = [
    { id: 'students', label: 'Alunos', count: members.length, icon: Users },
    { id: 'lessons', label: 'Aulas', count: lessons.length, icon: BookOpen },
    { id: 'assignments', label: 'Trabalhos', count: assignments.length, icon: Target },
    { id: 'materials', label: 'Materiais', count: materials.length, icon: FileText },
    { id: 'evaluations', label: 'Avaliações', count: evaluations.length, icon: Calendar },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Aluno</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Progresso</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Desempenho</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {members.map((student) => {
                  const progress = Math.floor(Math.random() * 40) + 60;
                  const grade = (Math.random() * 3 + 7).toFixed(1);
                  const isAtRisk = progress < 70 || Number(grade) < 7.5;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <img src={student.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{student.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{student.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5 w-40">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Aulas</span>
                            <span className="text-slate-900">{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isAtRisk ? 'bg-amber-400' : 'bg-[#006c55]'}`} style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${Number(grade) > 8.5 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                            {grade}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isAtRisk ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                          {isAtRisk ? 'Risco' : 'Engajado'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-[#006c55] hover:text-white transition-all"><MessageSquare size={14} /></button>
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"><MoreVertical size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      case 'lessons':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Título da Aula</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Data</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Frequência Médio</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Mídia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#006c55]">
                          <BookOpen size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{lesson.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-medium text-slate-500">{lesson.date}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-600">85%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-400 hover:text-[#006c55]"><Layout size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'assignments':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Tarefa / Trabalho</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Prazo</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Entregas</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Peso</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignments.map((as) => (
                  <tr key={as.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-900">{as.title}</span>
                    </td>
                    <td className="px-8 py-5 text-xs font-medium text-slate-500 truncate max-w-[100px]">{as.dueDate} {as.dueTime}</td>
                    <td className="px-8 py-5 text-xs font-bold text-[#006c55]">14/20</td>
                    <td className="px-8 py-5 text-xs font-medium text-slate-400">2.0 pts</td>
                    <td className="px-8 py-5 text-right">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded border border-emerald-100">Aberto</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'materials':
        return (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((m) => (
              <div key={m.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-[#006c55]/20 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#006c55]">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate w-32">{m.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black">{m.type}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-[#006c55]"><Download size={16} /></button>
              </div>
            ))}
          </div>
        );
      case 'evaluations':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Avaliação</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Data</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Local</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Participantes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-900">{ev.title}</span>
                    </td>
                    <td className="px-8 py-5 text-xs font-medium text-slate-500">{ev.date}</td>
                    <td className="px-8 py-5 text-xs font-medium text-slate-400">Presencial / Sala 201</td>
                    <td className="px-8 py-5">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. DASHBOARD METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="glass-panel p-6 rounded-[2rem] border border-white/40 shadow-xl group hover:scale-[1.02] transition-all bg-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center`}>
                <m.icon size={24} />
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${m.change.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {m.change}
              </span>
            </div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{m.label}</h3>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{m.value}</p>
          </div>
        ))}
      </div>

      {/* 2. MANAGEMENT HUB CONTAINER */}
      <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/40 shadow-2xl bg-white/50">
        
        {/* TABS NAVIGATION */}
        <div className="px-8 pt-8 border-b border-slate-100">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hub de Gestão CRM</h2>
                <p className="text-sm font-medium text-slate-500">Gestão centralizada de alunos, aulas e materiais.</p>
              </div>
              <button 
                onClick={() => {
                  const map: any = { students: 'member', lessons: 'lesson', assignments: 'assignment', materials: 'material', evaluations: 'evaluation' };
                  onAction(map[activeTab]);
                }}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-xl active:scale-95 text-xs font-black uppercase tracking-widest"
              >
                <Plus size={16} />
                {activeTab === 'students' ? 'Convidar Aluno' : `Adicionar ${tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}`}
              </button>
           </div>

           <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2.5 pb-4 border-b-2 transition-all relative ${activeTab === tab.id ? 'border-[#006c55] text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon size={16} />
                  <span className="text-sm font-black uppercase tracking-widest">{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${activeTab === tab.id ? 'bg-[#006c55] text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
           </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
             <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder={`Pesquisar em ${tabs.find(t => t.id === activeTab)?.label}...`}
               className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006c55]/10 focus:border-[#006c55]"
             />
           </div>
           <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
               <Filter size={14} /> Filtros
             </button>
             <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
               Exportar
             </button>
           </div>
        </div>

        {/* CONTENT AREA */}
        <div className="min-h-[400px]">
          {renderContent()}
        </div>

        {/* FOOTER STATS */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronizado</span>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Última atualização: Hoje, 20:30</span>
          </div>
          <div className="flex gap-1">
             {[1].map(p => (
               <button key={p} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${p === 1 ? 'bg-[#006c55] text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400'}`}>
                 {p}
               </button>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CRMView;
