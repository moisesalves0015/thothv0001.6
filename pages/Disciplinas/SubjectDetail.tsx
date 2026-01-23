
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  // Added ChevronRight to fix errors on lines 196 and 296
  ChevronRight,
  Calendar as CalendarIcon, 
  Clock, 
  FileText, 
  Download, 
  MessageCircle, 
  Send, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Smile,
  Meh,
  Frown,
  Angry,
  PlayCircle,
  CheckCircle,
  MoreVertical,
  Paperclip,
  Share2,
  Users
} from 'lucide-react';

// Mock Data
const SUBJECT_DATA = {
  id: '1',
  name: 'História do Brasil II',
  code: 'HIS002-2024.1',
  teacher: 'Prof. Dr. Ricardo Almeida',
  period: '1º Semestre de 2024',
  status: 'Em Andamento',
  description: 'Estudo aprofundado dos processos políticos, sociais e culturais do Brasil Imperial até a República Velha, focando na construção da identidade nacional e conflitos regionais.',
  themeColor: '#006c55',
  lessons: [
    { id: 'l1', title: 'O Primeiro Reinado e a Independência', date: '04 Mar, 2024', watched: true },
    { id: 'l2', title: 'Período Regencial: Crises e Revoltas', date: '11 Mar, 2024', watched: true },
    { id: 'l3', title: 'O Segundo Reinado e a Estabilidade Política', date: '18 Mar, 2024', watched: false },
    { id: 'l4', title: 'Guerra do Paraguai e seus Desdobramentos', date: '25 Mar, 2024', watched: false }
  ],
  materials: [
    { id: 'm1', name: 'Apostila_Cap1_Imperio.pdf', type: 'PDF', date: '01 Mar, 2024' },
    { id: 'm2', name: 'Slides_Aula02_Regencias.pptx', type: 'Slides', date: '10 Mar, 2024' },
    { id: 'm3', name: 'Documento_Constituicao_1824.pdf', type: 'PDF', date: '05 Mar, 2024' }
  ],
  faq: [
    { q: 'Como será a avaliação final?', a: 'A avaliação final será composta por uma prova dissertativa (60%) e um trabalho de pesquisa original (40%).' },
    { q: 'Onde encontro as leituras complementares?', a: 'Todas as leituras estão disponíveis na aba de Materiais e Arquivos desta página.' },
    { q: 'Qual a tolerância de atraso para as aulas?', a: 'A tolerância máxima é de 15 minutos após o início da chamada.' }
  ],
  evaluations: [
    { id: 'e1', title: 'Primeira Verificação (P1)', date: '15 Abr, 2024', status: 'Agendada' },
    { id: 'e2', title: 'Trabalho de Pesquisa: Escravidão', date: '20 Mai, 2024', status: 'Pendente' }
  ],
  students: [
    { name: 'Ana Silva', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' },
    { name: 'Bruno Costa', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno' },
    { name: 'Carla Dias', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carla' },
    { name: 'Daniel Paz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel' },
    { name: 'Eduarda Luz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eduarda' },
    { name: 'Fábio Melo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fabio' },
    { name: 'Gisele Reis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gisele' }
  ]
};

const SubjectDetail: React.FC = () => {
  const { id } = useParams();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [chatMsg, setChatMsg] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Calendar logic
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

  const handleFeedback = (type: string) => {
    setFeedback(type);
    // Silent send simulation - feedback is stored in state
  };

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      
      {/* 1. CAIXA PRINCIPAL (HEADER) */}
      <section className="w-full glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/40">
        <div className="bg-[#006c55]/10 h-32 relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(#006c55 1.5px, transparent 1.5px)',
                 backgroundSize: '12px 12px'
               }}>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="absolute top-6 left-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-700 hover:bg-white transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="px-8 pb-10 flex flex-col md:flex-row gap-8 relative">
          <div className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden translate-y-[-50%] shrink-0">
             <div className="text-4xl font-black text-[#006c55]">HB</div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
               <div>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{SUBJECT_DATA.name}</h1>
                 <p className="text-sm font-black uppercase text-[#006c55] tracking-widest">{SUBJECT_DATA.code} • {SUBJECT_DATA.period}</p>
               </div>
               <div className="flex gap-3">
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    {SUBJECT_DATA.status}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
               <div>
                 <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">{SUBJECT_DATA.description}</p>
                 <div className="flex items-center gap-3">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo" className="w-10 h-10 rounded-full border border-slate-100 shadow-sm" alt="Professor" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Responsável</p>
                      <p className="text-sm font-bold text-slate-900">{SUBJECT_DATA.teacher}</p>
                    </div>
                 </div>
               </div>
               
               <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Informações Rápidas</h3>
                    <Share2 size={14} className="text-slate-300" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <CalendarIcon size={14} className="text-[#006c55]" />
                       <span className="text-xs font-bold text-slate-700">Aulas Segundas e Quartas</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Clock size={14} className="text-[#006c55]" />
                       <span className="text-xs font-bold text-slate-700">10:40 – 12:20 • Sala 302</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <FileText size={14} className="text-[#006c55]" />
                       <span className="text-xs font-bold text-slate-700">Frequência: 92%</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA (PRINCIPAL) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 2. LISTA DE AULAS */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex flex-col shrink-0">
               <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Roteiro de Aulas</h2>
               <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Plano de Ensino</span>
            </div>
            <div className="p-6 pt-2 space-y-3">
              {SUBJECT_DATA.lessons.map((lesson) => (
                <div key={lesson.id} className="group flex items-center justify-between p-4 bg-white/80 hover:bg-white border border-white hover:border-[#006c55]/10 rounded-2xl transition-all cursor-pointer shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lesson.watched ? 'bg-[#006c55] text-white' : 'bg-slate-100 text-slate-400'}`}>
                         {lesson.watched ? <CheckCircle size={20} /> : <PlayCircle size={20} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">{lesson.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{lesson.date}</p>
                      </div>
                   </div>
                   <ChevronRight size={16} className="text-slate-300 group-hover:text-[#006c55] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* 6. CHAT DA DISCIPLINA */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40 flex flex-col h-[400px]">
            <div className="px-6 pt-6 mb-4 flex flex-col shrink-0">
               <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Chat da Disciplina</h2>
               <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Conversa entre Alunos</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/20">
               <div className="flex items-start gap-3">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" className="w-8 h-8 rounded-full" alt="Avatar" />
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm max-w-[80%]">
                    <p className="text-[10px] font-black text-[#006c55] uppercase mb-1">Ana Silva</p>
                    <p className="text-xs text-slate-700 font-medium">Alguém conseguiu encontrar o documento da Constituição de 1824 na aba de materiais?</p>
                  </div>
               </div>
               <div className="flex items-start gap-3 justify-end">
                  <div className="bg-[#006c55] p-3 rounded-2xl rounded-tr-none text-white shadow-sm max-w-[80%]">
                    <p className="text-xs font-medium">Sim Ana! Está logo abaixo do slide da aula 02.</p>
                  </div>
               </div>
            </div>
            <div className="p-4 bg-white/50 border-t border-white/50 flex gap-2">
               <input 
                 value={chatMsg}
                 onChange={e => setChatMsg(e.target.value)}
                 type="text" 
                 placeholder="Enviar mensagem..." 
                 className="flex-1 h-12 px-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#006c55] text-sm font-medium" 
               />
               <button className="w-12 h-12 bg-[#006c55] text-white rounded-xl flex items-center justify-center hover:bg-[#005a46] transition-all">
                  <Send size={18} />
               </button>
            </div>
          </div>

          {/* 9. LISTA DE ALUNOS */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex flex-col shrink-0">
               <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Alunos Matriculados</h2>
               <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">{SUBJECT_DATA.students.length} Integrantes</span>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto p-6 pt-2 no-scrollbar">
              {SUBJECT_DATA.students.map((student, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
                   <div className="relative">
                     <img src={student.avatar} className="w-14 h-14 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform" alt={student.name} />
                     <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                   </div>
                   <span className="text-[10px] font-black text-slate-700 truncate w-16 text-center">{student.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (LATERAL) */}
        <div className="lg:col-span-4 space-y-8">

          {/* 4. FEEDBACK EMOCIONAL */}
          <div className="glass-panel rounded-2xl p-6 border border-white/40 shadow-xl bg-[#d9f1a2]/10">
             <div className="flex items-center gap-2 mb-4">
               <Smile size={14} className="text-[#006c55]" />
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Feedback Semanal</h3>
             </div>
             <p className="text-xs font-bold text-slate-700 leading-snug mb-5">Como você está se sentindo em relação a esta disciplina hoje?</p>
             <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Smile, label: 'Feliz', type: 'happy', color: 'text-emerald-500' },
                  { icon: Meh, label: 'Neutro', type: 'neutral', color: 'text-amber-500' },
                  { icon: Frown, label: 'Desmot.', type: 'unmotivated', color: 'text-blue-500' },
                  { icon: Angry, label: 'Frust.', type: 'frustrated', color: 'text-red-500' }
                ].map((item) => (
                  <button 
                    key={item.type}
                    onClick={() => handleFeedback(item.type)}
                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${feedback === item.type ? 'bg-white border-[#006c55] shadow-lg' : 'bg-white/50 border-white hover:bg-white'}`}
                  >
                    <item.icon size={20} className={item.color} />
                    <span className="text-[8px] font-black uppercase text-slate-400">{item.label}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* 3. AGENDA / CALENDÁRIO */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex flex-col shrink-0">
               <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Calendário</h2>
               <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Datas Chave</span>
            </div>
            <div className="p-6 pt-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-[#006c55] capitalize">{calendarData.monthName} {calendarData.year}</span>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="text-slate-300 hover:text-[#006c55]"><ChevronLeft size={18}/></button>
                  <button onClick={nextMonth} className="text-slate-300 hover:text-[#006c55]"><ChevronRight size={18}/></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[10px] font-black text-slate-300 uppercase">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarData.days.map((day, i) => {
                  const isToday = day === new Date().getDate() && calendarData.month === new Date().getMonth();
                  const hasActivity = day === 15 || day === 20; // Example markers
                  return (
                    <div key={i} className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative ${!day ? 'opacity-0' : isToday ? 'bg-[#006c55] border-[#006c55] text-white' : hasActivity ? 'bg-[#d9f1a2] border-[#d9f1a2]/20 text-[#006c55]' : 'bg-slate-50/50 border-slate-100 text-slate-400'}`}>
                      <span className="text-[10px] font-black">{day}</span>
                      {hasActivity && <div className={`w-1 h-1 rounded-full absolute bottom-1 ${isToday ? 'bg-white' : 'bg-[#006c55]'}`} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 7. CONTEÚDOS E ARQUIVOS */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex flex-col shrink-0">
               <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Materiais</h2>
               <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Arquivos Compartilhados</span>
            </div>
            <div className="p-6 pt-2 space-y-3">
              {SUBJECT_DATA.materials.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-white/60 border border-white rounded-2xl group transition-all hover:bg-white shadow-sm">
                   <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#006c55]/10 group-hover:text-[#006c55] transition-all">
                         {file.type === 'PDF' ? <FileText size={20} /> : <Paperclip size={20} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-black text-slate-900 truncate leading-tight">{file.name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{file.date}</p>
                      </div>
                   </div>
                   <button className="p-2 text-slate-300 hover:text-[#006c55] transition-colors"><Download size={16}/></button>
                </div>
              ))}
            </div>
          </div>

          {/* 8. AVALIAÇÕES FUTURAS */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex flex-col shrink-0">
               <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Avaliações</h2>
               <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Próximas Datas</span>
            </div>
            <div className="p-6 pt-2 space-y-3">
              {SUBJECT_DATA.evaluations.map((evalItem) => (
                <div key={evalItem.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-center">
                   <div>
                     <h4 className="text-xs font-black text-slate-900">{evalItem.title}</h4>
                     <p className="text-[10px] font-bold text-[#006c55] uppercase tracking-tighter mt-0.5">{evalItem.date}</p>
                   </div>
                   <span className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">{evalItem.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. PERGUNTAS FREQUENTES (FAQ) */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex flex-col shrink-0">
               <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Dúvidas</h2>
               <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Perguntas Frequentes</span>
            </div>
            <div className="p-6 pt-2 space-y-2">
              {SUBJECT_DATA.faq.map((item, idx) => (
                <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden">
                   <button 
                     onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                     className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-white text-left transition-all"
                   >
                     <span className="text-[11px] font-black text-slate-800 leading-snug">{item.q}</span>
                     {activeFaq === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                   </button>
                   {activeFaq === idx && (
                     <div className="p-4 pt-0 bg-white">
                        <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
                     </div>
                   )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SubjectDetail;
