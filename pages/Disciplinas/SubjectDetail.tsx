import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
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
  Users,
  BookOpen,
  Plus,
  Target,
  UserPlus
} from 'lucide-react';
import { DisciplineService } from '../../modules/discipline/discipline.service';
import { ChatService } from '../../modules/chat/chat.service';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Discipline, 
  Author, 
  DisciplineLesson, 
  DisciplineMaterial, 
  DisciplineFAQ, 
  DisciplineEvaluation,
  ChatMessage
} from '../../types';
import AppLoadingPage from '../../components/AppLoadingPage';
import RoadmapManager from './components/RoadmapManager';
import UnifiedScheduler from './components/UnifiedScheduler';
import CRMView from './components/CRMView';

const SubjectDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [chatMsg, setChatMsg] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Dynamic Data States
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<Discipline | null>(null);
  const [lessons, setLessons] = useState<DisciplineLesson[]>([]);
  const [materials, setMaterials] = useState<DisciplineMaterial[]>([]);
  const [faqs, setFaqs] = useState<DisciplineFAQ[]>([]);
  const [evaluations, setEvaluations] = useState<DisciplineEvaluation[]>([]);
  const [members, setMembers] = useState<Author[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [initialManagerTab, setInitialManagerTab] = useState<any>('lesson');
  const [viewMode, setViewMode] = useState<'professor' | 'student' | 'crm'>('professor');

  // 1. Fetch Core Data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('SubjectDetail: Attempting to fetch core discipline data for id:', id);
        // 1. Fetch Core Discipline First
        const sub = await DisciplineService.getDiscipline(id);
        
        if (sub) {
          console.log('SubjectDetail: Discipline found:', sub.name);
          setSubject(sub);
          
          // 2. Fetch Members
          console.log('SubjectDetail: Fetching members for uids:', sub.members);
          DisciplineService.getDisciplineMembers(sub.members || [])
            .then(setMembers)
            .catch(err => console.error("Error fetching members:", err));

          // 3. Fetch Sub-collections in parallel (non-blocking)
          console.log('SubjectDetail: Fetching sub-collections...');
          
          DisciplineService.getLessons(id)
            .then(setLessons)
            .catch(err => console.warn("Could not fetch lessons (Permissions?):", err));
            
          DisciplineService.getMaterials(id)
            .then(setMaterials)
            .catch(err => console.warn("Could not fetch materials (Permissions?):", err));
            
          DisciplineService.getFAQs(id)
            .then(setFaqs)
            .catch(err => console.warn("Could not fetch FAQs (Permissions?):", err));
            
          DisciplineService.getEvaluations(id)
            .then(setEvaluations)
            .catch(err => console.warn("Could not fetch evaluations (Permissions?):", err));

          DisciplineService.getAssignments(id)
            .then(setAssignments)
            .catch(err => console.warn("Could not fetch assignments:", err));
        } else {
          console.error('SubjectDetail: CRITICAL - Discipline object is NULL for ID:', id);
        }
      } catch (error) {
        console.error("Error fetching subject details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 2. Chat Real-time Subscription
  useEffect(() => {
    if (!subject?.chatId) return;

    const unsubscribe = ChatService.subscribeToMessages(subject.chatId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [subject?.chatId]);

  const handleSendMessage = async () => {
    if (!chatMsg.trim() || !subject?.chatId || !user) return;

    try {
      await ChatService.sendMessage(subject.chatId, {
        senderId: user.uid,
        text: chatMsg,
        status: 'sent',
        type: 'text'
      });
      setChatMsg('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

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
  };

  // 5. Handle View Mode Toggles
  useEffect(() => {
    const handleSetView = (ev: any) => {
      const newMode = ev.detail as 'professor' | 'student' | 'crm';
      console.log('SubjectDetail: Setting viewMode to', newMode);
      setViewMode(newMode);
    };

    window.addEventListener('thoth:subject-set-view', handleSetView);
    return () => window.removeEventListener('thoth:subject-set-view', handleSetView);
  }, []);

  if (loading) return <AppLoadingPage />;
  if (!subject) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
        <BookOpen size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Disciplina não encontrada</h2>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">Não conseguimos localizar os dados desta disciplina. Verifique se o link está correto ou se você tem permissão.</p>
      <button 
        onClick={() => window.history.back()}
        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
      >
        Voltar para Grade
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      
      {/* 1. CAIXA PRINCIPAL (HEADER) */}
      <section className={`w-full glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/40 transition-all duration-500 ${viewMode === 'crm' ? 'mb-0' : 'mb-0'}`}>
        <div className={`bg-[#006c55]/10 relative transition-all duration-500 ${viewMode === 'crm' ? 'h-16' : 'h-32'}`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(#006c55 1.5px, transparent 1.5px)',
                 backgroundSize: '12px 12px'
               }}>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="absolute top-1/2 -translate-y-1/2 left-6 w-8 h-8 bg-white/80 backdrop-blur-md rounded-lg flex items-center justify-center text-slate-700 hover:bg-white transition-all shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          
          {viewMode === 'crm' && (
            <div className="absolute top-1/2 -translate-y-1/2 left-20 flex items-center gap-4">
               <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">{subject.name}</h1>
               <div className="h-4 w-px bg-slate-200"></div>
               <p className="text-[10px] font-black uppercase text-[#006c55] tracking-widest">{subject.code} • {subject.semester}</p>
            </div>
          )}
        </div>

        {viewMode !== 'crm' ? (
          <div className="px-8 pb-10 flex flex-col md:flex-row gap-8 relative">
            <div className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden translate-y-[-50%] shrink-0">
               <div className="text-4xl font-black text-[#006c55]">
                 {subject.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
               </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                 <div>
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{subject.name}</h1>
                   <p className="text-sm font-black uppercase text-[#006c55] tracking-widest">{subject.code} • {subject.semester}</p>
                 </div>
                 <div className="flex gap-3">
                    <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      {subject.status === 'active' ? 'Em Andamento' : 'Arquivada'}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 <div>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">{subject.description}</p>
                   <div className="flex items-center gap-3">
                      <img src={subject.teacherAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${subject.teacherId}`} className="w-10 h-10 rounded-full border border-slate-100 shadow-sm" alt="Professor" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Responsável</p>
                        <p className="text-sm font-bold text-slate-900">{subject.teacherName}</p>
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
                         <span className="text-xs font-bold text-slate-700">Aulas {subject.schedule?.map(s => `${s.day}`).join(' e ') || 'A definir'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <Clock size={14} className="text-[#006c55]" />
                         <span className="text-xs font-bold text-slate-700">{subject.schedule?.[0]?.time || 'Horário a definir'} • {subject.room || 'S/ Sala'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <FileText size={14} className="text-[#006c55]" />
                         <span className="text-xs font-bold text-slate-700">Frequência: {user?.stats?.projects || 100}%</span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-8 py-4 flex items-center justify-between bg-white/50">
             <div className="flex gap-8">
               <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Criado em</span>
                 <span className="text-xs font-bold text-slate-900">
                   {subject.createdAt?.toDate ? subject.createdAt.toDate().toLocaleDateString('pt-BR') : 
                    subject.createdAt?.seconds ? new Date(subject.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 
                    '12/03/2026'}
                 </span>
               </div>
               <div className="flex gap-3 items-center">
                  <img src={subject.teacherAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${subject.teacherId}`} className="w-8 h-8 rounded-full border border-white shadow-sm" alt="Professor" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Por</span>
                    <span className="text-xs font-bold text-slate-900">{subject.teacherName}</span>
                  </div>
               </div>
             </div>
             
             <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-lg">
                   <Users size={12} className="text-slate-500" />
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{members.length} Alunos</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Gestão Ativa</span>
                </div>
             </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {viewMode === 'crm' ? (
          <div className="lg:col-span-12">
             <CRMView 
               disciplineId={id!} 
               members={members}
               lessons={lessons}
               materials={materials}
               evaluations={evaluations}
               assignments={assignments}
               faqs={faqs}
               onAction={(tab) => { setInitialManagerTab(tab); setIsManagementOpen(true); }}
             />
          </div>
        ) : (
          <>
            {/* COLUNA ESQUERDA (PRINCIPAL) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 2. LISTA DE AULAS */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex items-center justify-between shrink-0">
               <div className="flex flex-col">
                 <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Roteiro de Aulas</h2>
                 <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Plano de Ensino</span>
               </div>
               {subject.teacherId === user?.uid && viewMode === 'professor' && (
                 <button 
                  onClick={() => { setInitialManagerTab('lesson'); setIsManagementOpen(true); }}
                  className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
                 >
                   <Plus size={18} />
                 </button>
               )}
            </div>
            <div className="p-6 pt-2 space-y-3">
              {lessons.length > 0 ? lessons.map((lesson) => (
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
              )) : (
                <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma aula registrada</div>
              )}
            </div>
          </div>

          {/* 10. ENTREGAS DE TRABALHO */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex items-center justify-between shrink-0">
               <div className="flex flex-col">
                 <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Entregas de Trabalho</h2>
                 <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Trabalhos e Projetos</span>
               </div>
               {subject.teacherId === user?.uid && viewMode === 'professor' && (
                 <button 
                  onClick={() => { setInitialManagerTab('assignment'); setIsManagementOpen(true); }}
                  className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
                 >
                   <Plus size={18} />
                 </button>
               )}
            </div>
            <div className="p-6 pt-2 space-y-3">
              {assignments && assignments.length > 0 ? assignments.map((assignment) => (
                <div key={assignment.id} className="group p-4 bg-white/80 hover:bg-white border border-white hover:border-[#006c55]/10 rounded-2xl transition-all shadow-sm">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#006c55]">
                           <Target size={20} />
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-slate-900 leading-tight">{assignment.title}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Prazo: {assignment.dueDate ? assignment.dueDate.split('-').reverse().join('/') : ''} às {assignment.dueTime}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100">
                        {assignment.status}
                      </div>
                   </div>
                   <p className="text-xs text-slate-500 line-clamp-2 mb-4">{assignment.description}</p>
                   <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                         {assignment.attachments?.map((_: any, i: number) => (
                           <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[#10b981]">
                             <FileText size={10} />
                           </div>
                         ))}
                      </div>
                      <button className="text-[10px] font-black uppercase tracking-widest text-[#006c55] flex items-center gap-1 hover:underline">
                        Ver Detalhes e Entregar
                        <ChevronRight size={14} />
                      </button>
                   </div>
                </div>
              )) : (
                <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum trabalho pendente</div>
              )}
            </div>
          </div>

          {/* 6. CHAT DA DISCIPLINA */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40 flex flex-col h-[400px]">
            <div className="px-6 pt-6 mb-4 flex flex-col shrink-0">
               <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Chat da Disciplina</h2>
               <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Conversa entre Alunos</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/20">
               {messages.length > 0 ? messages.map((msg) => (
                 <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === user?.uid ? 'justify-end' : ''}`}>
                    {msg.senderId !== user?.uid && (
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`} className="w-8 h-8 rounded-full" alt="Avatar" />
                    )}
                    <div className={`${msg.senderId === user?.uid ? 'bg-[#006c55] text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'} p-3 rounded-2xl shadow-sm max-w-[80%]`}>
                      {msg.senderId !== user?.uid && (
                        <p className="text-[10px] font-black text-[#006c55] uppercase mb-1">{members.find(m => m.id === msg.senderId)?.name || 'Colega'}</p>
                      )}
                      <p className="text-xs font-medium">{msg.text}</p>
                    </div>
                 </div>
               )) : (
                 <div className="h-full flex items-center justify-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Inicie uma conversa</p>
                 </div>
               )}
            </div>
            <div className="p-4 bg-white/50 border-t border-white/50 flex gap-2">
               <input 
                 value={chatMsg}
                 onChange={e => setChatMsg(e.target.value)}
                 type="text" 
                 placeholder="Enviar mensagem..." 
                 className="flex-1 h-12 px-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#006c55] text-sm font-medium" 
               />
               <button 
                 onClick={handleSendMessage}
                 className="w-12 h-12 bg-[#006c55] text-white rounded-xl flex items-center justify-center hover:bg-[#005a46] transition-all"
               >
                  <Send size={18} />
               </button>
            </div>
          </div>

          {/* 9. LISTA DE ALUNOS */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex items-center justify-between shrink-0">
               <div className="flex flex-col">
                 <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Alunos Matriculados</h2>
                 <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">{members.length} Integrantes</span>
               </div>
               {subject.teacherId === user?.uid && viewMode === 'professor' && (
                 <button 
                  onClick={() => { setInitialManagerTab('member'); setIsManagementOpen(true); }}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95 text-[10px] font-black uppercase tracking-widest"
                 >
                   <UserPlus size={14} />
                   Convidar
                 </button>
               )}
            </div>
            <div className="flex items-center gap-4 overflow-x-auto p-6 pt-2 no-scrollbar">
              {members.map((student) => (
                <div key={student.id} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
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
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Feedback Semanal ({viewMode})</h3>
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

          <UnifiedScheduler filterDisciplineId={id} />

          {/* 7. CONTEÚDOS E ARQUIVOS */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex items-center justify-between shrink-0">
               <div className="flex flex-col">
                 <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Materiais</h2>
                 <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Arquivos Compartilhados</span>
               </div>
               {subject.teacherId === user?.uid && viewMode === 'professor' && (
                 <button 
                  onClick={() => { setInitialManagerTab('material'); setIsManagementOpen(true); }}
                  className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
                 >
                   <Plus size={18} />
                 </button>
               )}
            </div>
            <div className="p-6 pt-2 space-y-3">
              {materials.length > 0 ? materials.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-white/60 border border-white rounded-2xl group transition-all hover:bg-white shadow-sm">
                   <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#006c55]/10 group-hover:text-[#006c55] transition-all">
                         {file.type === 'PDF' ? <FileText size={20} /> : file.type === 'Slides' ? <Paperclip size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-black text-slate-900 truncate leading-tight">{file.name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{file.date}</p>
                      </div>
                   </div>
                   <button onClick={() => window.open(file.url, '_blank')} className="p-2 text-slate-300 hover:text-[#006c55] transition-colors"><Download size={16}/></button>
                </div>
              )) : (
                <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum material disponível</div>
              )}
            </div>
          </div>

          {/* 8. AVALIAÇÕES FUTURAS */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex items-center justify-between shrink-0">
               <div className="flex flex-col">
                 <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Avaliações</h2>
                 <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Próximas Datas</span>
               </div>
               {subject.teacherId === user?.uid && viewMode === 'professor' && (
                 <button 
                  onClick={() => { setInitialManagerTab('evaluation'); setIsManagementOpen(true); }}
                  className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
                 >
                   <Plus size={18} />
                 </button>
               )}
            </div>
            <div className="p-6 pt-2 space-y-3">
              {evaluations.length > 0 ? evaluations.map((evalItem) => (
                <div key={evalItem.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-center">
                   <div>
                     <h4 className="text-xs font-black text-slate-900">{evalItem.title}</h4>
                     <p className="text-[10px] font-bold text-[#006c55] uppercase tracking-tighter mt-0.5">{evalItem.date}</p>
                   </div>
                   <span className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">{evalItem.status}</span>
                </div>
              )) : (
                <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Sem avaliações agendadas</div>
              )}
            </div>
          </div>

          {/* 5. PERGUNTAS FREQUENTES (FAQ) */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/40">
            <div className="px-6 pt-6 mb-4 flex items-center justify-between shrink-0">
               <div className="flex flex-col">
                 <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Dúvidas</h2>
                 <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#006c55] mt-1 opacity-80">Perguntas Frequentes</span>
               </div>
               {subject.teacherId === user?.uid && viewMode === 'professor' && (
                 <button 
                  onClick={() => { setInitialManagerTab('faq'); setIsManagementOpen(true); }}
                  className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
                 >
                   <Plus size={18} />
                 </button>
               )}
            </div>
            <div className="p-6 pt-2 space-y-2">
              {faqs.length > 0 ? faqs.map((item, idx) => (
                <div key={item.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                   <button 
                     onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                     className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-white text-left transition-all"
                   >
                     <span className="text-[11px] font-black text-slate-800 leading-snug">{item.question}</span>
                     {activeFaq === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                   </button>
                   {activeFaq === idx && (
                     <div className="p-4 pt-0 bg-white">
                        <p className="text-xs text-slate-500 leading-relaxed">{item.answer}</p>
                     </div>
                   )}
                </div>
              )) : (
                <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma dúvida frequente</div>
              )}
            </div>
          </div>

            </div>
          </>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* MODAL DE GERENCIAMENTO */}
      {isManagementOpen && (
        <RoadmapManager 
          disciplineId={id!} 
          initialTab={initialManagerTab}
          onClose={() => setIsManagementOpen(false)} 
          onSuccess={() => window.location.reload()} 
        />
      )}
    </div>
  );
};

export default SubjectDetail;
