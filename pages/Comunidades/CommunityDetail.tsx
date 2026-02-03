
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    MessageCircle,
    Zap,
    FileText,
    Calendar as CalendarIcon,
    Users,
    BookOpen,
    MoreVertical,
    Pin,
    Download,
    Plus,
    HelpCircle,
    Send,
    Search,
    CheckCircle2,
    Trash2,
    Heart,
    Smile,
    Meh,
    Frown,
    Award,
    ShieldAlert
} from 'lucide-react';

const CommunityDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<'Feed' | 'Salas' | 'Materiais' | 'Agenda' | 'Dúvidas'>('Feed');
    const [emotionalCheck, setEmotionalCheck] = useState<string | null>(null);

    const sections = [
        { id: 'Feed', icon: MessageSquare, label: 'Feed Social' },
        { id: 'Salas', icon: Users, label: 'Círculos de Estudo' },
        { id: 'Materiais', icon: FileText, label: 'Repositório' },
        { id: 'Agenda', icon: CalendarIcon, label: 'Próximos Marcos' },
        { id: 'Dúvidas', icon: HelpCircle, label: 'Discussões' },
    ];

    return (
        <div className="flex flex-col gap-8 pb-32 animate-in fade-in duration-500">

            {/* 1. HEADER INTEGRADO COM PRESENÇA */}
            <section className="w-full glass-panel rounded-[3rem] overflow-hidden shadow-2xl border border-white/40 bg-white/40">
                <div className="h-32 bg-gradient-to-r from-slate-900 via-[#006c55] to-[#004d3d] relative">
                    <button
                        onClick={() => navigate('/comunidades')}
                        className="absolute top-8 left-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="absolute top-8 right-8 flex items-center gap-4">
                        <div className="hidden md:flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#006c55] bg-white overflow-hidden shadow-lg">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <div className="px-4 py-2 bg-[#d9f1a2] text-[#006c55] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                            12 Estudando agora
                        </div>
                    </div>
                </div>

                <div className="px-10 pb-8 flex flex-col md:flex-row gap-8 relative">
                    <div className="w-28 h-28 rounded-[2.5rem] bg-white border-4 border-white shadow-2xl flex items-center justify-center translate-y-[-40%] shrink-0">
                        <BookOpen size={44} className="text-[#006c55]" />
                    </div>

                    <div className="flex-1 -mt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">História do Brasil II</h1>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">Disciplina Oficial</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professor: Dr. Ricardo Almeida</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#006c55] transition-all">Convidar Colega</button>
                                <button className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors"><MoreVertical size={20} /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NAVEGAÇÃO DE PÁGINA INTERNA */}
                <div className="px-10 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {sections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id as any)}
                            className={`py-8 px-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeSection === s.id ? 'text-[#006c55]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <s.icon size={18} />
                            {s.label}
                            {activeSection === s.id && <div className="absolute bottom-0 left-4 right-4 h-1.5 bg-[#006c55] rounded-t-full shadow-lg shadow-[#006c55]/20"></div>}
                        </button>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUNA PRINCIPAL DINÂMICA */}
                <div className="lg:col-span-8 space-y-8">

                    {/* CHECK-IN EMOCIONAL (TRIGGER PSICOLÓGICO) */}
                    <div className="glass-panel p-8 bg-white/60 rounded-[2.5rem] border border-white/60 shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <Heart size={18} fill="#ef4444" className="text-red-500" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Check-in da Comunidade</h3>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <p className="text-sm font-bold text-slate-500 text-center md:text-left">Como está sua relação com essa disciplina hoje?</p>
                            <div className="flex items-center gap-3">
                                {[
                                    { id: 'happy', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { id: 'neutral', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-50' },
                                    { id: 'tired', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50' }
                                ].map(emoji => (
                                    <button
                                        key={emoji.id}
                                        onClick={() => setEmotionalCheck(emoji.id)}
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${emotionalCheck === emoji.id ? `${emoji.bg} ring-2 ring-${emoji.color}` : 'bg-slate-50 hover:bg-white border border-slate-100'}`}
                                    >
                                        <emoji.icon size={32} className={emoji.color} />
                                    </button>
                                ))}
                            </div>
                            {emotionalCheck && (
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-in fade-in">Vulnerabilidade gera conexão. Obrigado por partilhar.</p>
                            )}
                        </div>
                    </div>

                    {activeSection === 'Feed' && (
                        <div className="space-y-8">
                            {/* AVISO DO PROFESSOR (IDENTIDADE COMPARTILHADA) */}
                            <div className="p-8 bg-emerald-50 border-l-8 border-[#006c55] rounded-[2.5rem] flex items-start gap-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 text-emerald-100 group-hover:scale-110 transition-transform"><Pin size={48} /></div>
                                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-[#006c55] shadow-xl shrink-0">
                                    <ShieldAlert size={32} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-[#006c55] tracking-widest mb-2 flex items-center gap-2">
                                        <CheckCircle2 size={12} /> Aviso de Moderador
                                    </h4>
                                    <p className="text-lg font-black text-emerald-950 leading-tight">Marcos da Semana: Submissão do resumo crítico da Unidade II até sexta-feira às 18:00.</p>
                                </div>
                            </div>

                            {/* POSTAGENS COM REAÇÕES SENTIMENTAIS */}
                            {[1, 2].map(i => (
                                <div key={i} className="glass-panel p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm space-y-6 group hover:shadow-2xl transition-all duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 90}`} alt="user" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">Membro da Comunidade <span className="text-[10px] font-bold text-[#006c55] ml-2 px-3 py-1 bg-[#d9f1a2]/30 rounded-full uppercase">Estudando</span></p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Há {i * 5} minutos atrás</p>
                                            </div>
                                        </div>
                                        <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical size={20} /></button>
                                    </div>
                                    <p className="text-base font-medium text-slate-600 leading-relaxed">Acabei de terminar o mapa mental da aula de ontem sobre o Período Regencial. O que vocês acham de organizarmos um círculo de revisão às 19h?</p>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-full">#Sugestao</span>
                                        <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-full">#Colaboração</span>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
                                        <button className="px-4 py-2 bg-emerald-50 text-[#006c55] rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-[#006c55] hover:text-white transition-all shadow-sm">
                                            <Zap size={14} /> Me ajudou (8)
                                        </button>
                                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                            <Award size={14} /> Inspirador (3)
                                        </button>
                                        <button className="ml-auto flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors">
                                            <MessageSquare size={16} /> 5 Comentários
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSection === 'Salas' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 animate-in slide-in-from-bottom-4">
                            {[
                                { title: 'Revisão Unidade II', members: 4, type: 'Voz & Vídeo', active: true },
                                { title: 'Tira-Dúvidas P1', members: 0, type: 'Chat Focado', active: false }
                            ].map((sala, idx) => (
                                <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
                                    {sala.active && <div className="absolute top-6 right-6 w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>}
                                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 group-hover:bg-[#006c55] group-hover:text-white transition-all shadow-inner border border-slate-100">
                                        <Users size={36} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{sala.title}</h3>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{sala.type} • {sala.members} Membros</p>
                                    </div>
                                    <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#006c55] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                                        Entrar no Círculo <ChevronRight size={18} />
                                    </button>
                                </div>
                            ))}
                            <button className="h-full border-2 border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center justify-center text-slate-300 hover:text-[#006c55] hover:border-[#006c55]/30 transition-all group">
                                <Plus size={44} className="mb-4 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Criar Sala de Estudo</span>
                            </button>
                        </div>
                    )}

                    {activeSection === 'Materiais' && (
                        <div className="glass-panel bg-white p-10 rounded-[3rem] border border-slate-100 space-y-10 shadow-xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Memória Acadêmica</h3>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Arquivos estruturados por temas</p>
                                </div>
                                <button className="flex items-center gap-3 px-8 py-4 bg-[#006c55] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-[#006c55]/20 hover:scale-105 active:scale-95 transition-all"><Plus size={18} /> Compartilhar Material</button>
                            </div>

                            <div className="space-y-10">
                                {['Unidade 1 - Brasil Colônia', 'Unidade 2 - Independência'].map(unit => (
                                    <div key={unit} className="space-y-4">
                                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 flex items-center gap-2">
                                            <FileText size={14} className="text-[#006c55]" /> {unit}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            {[1, 2].map(j => (
                                                <div key={j} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:border-[#006c55]/30 transition-all hover:shadow-xl">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-[#006c55] shadow-sm transition-all"><FileText size={24} /></div>
                                                        <div>
                                                            <p className="text-base font-black text-slate-900 leading-none">Resumo_Estrategico_V{j}.pdf</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Enviado por: Ana Silva</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                                <span className="text-[9px] font-bold text-[#006c55] uppercase">Atualizado em 12/03</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button className="p-3 text-slate-300 hover:text-[#006c55] transition-colors"><Download size={22} /></button>
                                                        <button className="p-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'Dúvidas' && (
                        <div className="space-y-8">
                            <div className="p-8 bg-white rounded-[3rem] border-4 border-slate-100 flex flex-col md:flex-row gap-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#d9f1a2]/10 rounded-full blur-2xl"></div>
                                <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg">
                                    <HelpCircle size={32} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Fórum de Descobertas</h3>
                                    <input placeholder="Qual sua dúvida para a rede hoje?" className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#006c55] transition-all" />
                                </div>
                                <button className="md:mt-8 h-16 px-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-[#006c55] transition-all shadow-xl active:scale-95"><Send size={24} /></button>
                            </div>

                            {[1, 2].map(k => (
                                <div key={k} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 group hover:shadow-2xl transition-all duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-100">Dúvida Aberta</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Postado por: Ricardo Dias</span>
                                        </div>
                                        <button className="p-2 text-slate-200"><MoreVertical size={20} /></button>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">Qual a diferença fundamental entre o Primeiro e o Segundo Reinado em termos de centralização de poder?</h3>

                                    <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 relative group/response">
                                        <div className="absolute top-6 left-6 text-emerald-200 opacity-20"><MessageCircle size={80} /></div>
                                        <div className="flex items-center gap-4 mb-4 relative z-10">
                                            <div className="w-8 h-8 rounded-full bg-[#006c55] text-white flex items-center justify-center shadow-lg"><Award size={14} /></div>
                                            <span className="text-[10px] font-black text-[#006c55] uppercase tracking-widest">Resposta Destacada (Monitor)</span>
                                        </div>
                                        <p className="text-base text-emerald-900 font-medium italic leading-relaxed relative z-10">"A principal diferença reside na 'Poder Moderador'. Enquanto em 1824 ele era uma imposição autoritária, no Segundo Reinado D. Pedro II o utilizou como árbitro diplomático..."</p>
                                        <div className="mt-6 flex items-center gap-6 relative z-10">
                                            <button className="text-[10px] font-black text-[#006c55] uppercase hover:underline">Isso resolveu minha dúvida</button>
                                            <button className="text-[10px] font-black text-slate-400 uppercase hover:underline">Ver mais 12 respostas</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* COLUNA LATERAL - WIDGETS DE IMPACTO SOCIAL */}
                <div className="lg:col-span-4 space-y-8 sticky top-24">

                    {/* PRESENÇA SOCIAL EM TEMPO REAL */}
                    <div className="glass-panel p-8 bg-white rounded-[3rem] border border-white shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Na sala agora</h3>
                            </div>
                            <Search size={16} className="text-slate-300" />
                        </div>
                        <div className="space-y-5">
                            {[
                                { name: 'Dr. Ricardo Almeida', role: 'Professor', avatar: 'https://i.pravatar.cc/100?u=teach', status: 'Online' },
                                { name: 'Ricardo Lima', role: 'Monitor Thoth', avatar: 'https://i.pravatar.cc/100?u=moni', status: 'Estudando 📚' },
                                { name: 'Ana Silva', role: 'Colega', avatar: 'https://i.pravatar.cc/100?u=ana', status: 'Em Pausa ☕' }
                            ].map((member, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img src={member.avatar} className="w-11 h-11 rounded-2xl border-2 border-white shadow-sm group-hover:scale-110 transition-transform" alt="Avatar" />
                                            <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 bg-emerald-500 rounded-lg border-2 border-white shadow-sm"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 leading-none">{member.name}</p>
                                            <p className="text-[9px] font-bold text-[#006c55] uppercase mt-1 tracking-tighter">{member.role}</p>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{member.status}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-5 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">Ver todos os 122 alunos</button>
                    </div>

                    {/* AGENDA COMPARTILHADA (ONDE O CAOS MORRE) */}
                    <div className="glass-panel p-8 bg-white rounded-[3rem] border border-white shadow-xl overflow-hidden relative">
                        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-50"></div>
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Agenda da Rede</h3>
                            <CalendarIcon size={20} className="text-[#006c55]" />
                        </div>
                        <div className="space-y-8 relative z-10">
                            {[
                                { title: 'Prova P1 (Dissertativa)', date: '15 Abr', type: 'Exame Final', color: 'bg-red-500', sub: 'Estude Cap. 4-12' },
                                { title: 'Trabalho de Pesquisa', date: '22 Abr', type: 'Entrega Digital', color: 'bg-[#006c55]', sub: 'Foco em ABNT' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-5 group cursor-pointer">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3.5 h-3.5 rounded-full ${item.color} shadow-[0_0_12px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform border-2 border-white`}></div>
                                        <div className="w-0.5 flex-1 bg-slate-100 my-2"></div>
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-sm font-black text-slate-900 leading-tight">{item.title}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{item.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                            <span className={`text-[8px] font-black uppercase ${item.color.replace('bg-', 'text-')}`}>{item.type}</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-300 mt-2 italic group-hover:text-slate-500 transition-colors">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-5 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-[#006c55]/20 transition-all active:scale-95">Sincronizar com Meus Lembretes</button>
                    </div>

                    {/* RECIPROCIDADE - CONTRIBUIÇÕES ÚTEIS */}
                    <div className="glass-panel p-8 bg-slate-950 rounded-[3rem] border border-white/10 shadow-2xl text-white">
                        <div className="flex items-center gap-3 mb-8">
                            <Award size={18} className="text-[#d9f1a2]" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#d9f1a2]">Heróis da Comunidade</h3>
                        </div>
                        <div className="space-y-6">
                            {[
                                { name: 'Isabela Soares', points: 1420, label: 'Mestre da Explicação' },
                                { name: 'Victor Hugo', points: 980, label: 'Resumista Pro' }
                            ].map((hero, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black leading-none">{hero.name}</p>
                                        <p className="text-[8px] font-bold text-[#d9f1a2] uppercase mt-1 tracking-widest">{hero.label}</p>
                                    </div>
                                    <span className="text-xs font-black text-slate-400">{hero.points} XP</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center">
                            <p className="text-[9px] font-bold text-slate-500 uppercase text-center mb-4">Sua contribuição atual: 120 XP</p>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#d9f1a2] w-[45%] rounded-full shadow-[0_0_10px_#d9f1a2]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityDetail;
