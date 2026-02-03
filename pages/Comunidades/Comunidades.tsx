
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Search,
    Plus,
    BookOpen,
    FlaskConical,
    GraduationCap,
    ChevronRight,
    Sparkles,
    ArrowUpRight,
    Bell,
    Clock,
    Filter,
    Heart,
    Zap,
    MessageCircle
} from 'lucide-react';

const Comunidades: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'Minhas' | 'Explorar'>('Minhas');

    const myCommunities = [
        {
            id: 'c1',
            name: 'História do Brasil II',
            type: 'Disciplina',
            update: 'Novo material de prova',
            activeNow: 12,
            priority: true,
            icon: BookOpen,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            id: 'c2',
            name: 'Lab de TICS - Pesquisa',
            type: 'Projeto',
            update: 'Reunião amanhã às 14h',
            activeNow: 4,
            priority: false,
            icon: FlaskConical,
            color: 'text-purple-500',
            bg: 'bg-purple-50'
        },
        {
            id: 'c3',
            name: 'Turma Design 2024.1',
            type: 'Curso',
            update: '3 novas mensagens',
            activeNow: 28,
            priority: false,
            icon: GraduationCap,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        }
    ];

    const suggested = [
        { name: 'Grupo de Estudos: Antropologia', type: 'Estudo', members: 42, moderator: 'Ana Silva', desc: 'Foco em revisão para a P2 e troca de resumos semanais.' },
        { name: 'CAtlética - Thoth Sports', type: 'Institucional', members: 156, moderator: 'Diretório', desc: 'Avisos sobre treinos, competições e integração esportiva.' }
    ];

    return (
        <div className="flex flex-col gap-10 mt-0 animate-in fade-in duration-500 pb-24">

            {/* 1. HERO - ACOLHIMENTO INICIAL */}
            <section className="relative w-full glass-panel rounded-[3rem] p-10 lg:p-16 overflow-hidden border border-white/40 shadow-3xl bg-white/40">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#006c55]/5 rounded-full blur-[100px] -z-10"></div>

                <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                    <div className="flex-1 space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#d9f1a2]/20 rounded-full border border-[#d9f1a2]/30">
                            <Heart size={14} className="text-[#006c55]" fill="currentColor" />
                            <span className="text-[10px] font-black uppercase text-[#006c55] tracking-widest">Você não está sozinho</span>
                        </div>
                        <h1 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                            Seu Círculo de <br />
                            <span className="text-[#006c55]">Pertencimento.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto lg:mx-0">
                            Conecte-se com pessoas que compartilham sua jornada. Estude em grupo, tire dúvidas e construa sua rede acadêmica real.
                        </p>

                        <div className="relative max-w-lg mx-auto lg:mx-0 pt-4">
                            <Search className="absolute left-5 top-[60%] -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                placeholder="Buscar comunidades ou grupos de estudo..."
                                className="w-full h-16 pl-14 pr-6 bg-white rounded-2xl border-2 border-slate-100 focus:outline-none focus:border-[#006c55] transition-all font-bold shadow-xl shadow-slate-200/50"
                            />
                        </div>
                    </div>

                    <div className="hidden lg:flex w-1/3 flex-col gap-4">
                        <div className="p-8 bg-[#006c55] rounded-[2.5rem] text-white shadow-2xl space-y-4 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Users size={120} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Zap size={24} fill="#d9f1a2" className="text-[#d9f1a2]" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Iniciativa Social</span>
                            </div>
                            <h3 className="text-xl font-black leading-tight">Lidere sua <br /> Comunidade</h3>
                            <button className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-[#006c55] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Criar Novo Círculo</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. NAVEGAÇÃO E FILTROS */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
                    {['Minhas', 'Explorar'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            {tab === 'Minhas' ? 'Meu Círculo' : 'Radar de Descoberta'}
                        </button>
                    ))}
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#006c55] transition-all shadow-sm">
                    <Filter size={16} /> Tipagem Inteligente
                </button>
            </div>

            {/* 3. GRID DE COMUNIDADES */}
            {activeTab === 'Minhas' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
                    {myCommunities.map(comm => (
                        <div
                            key={comm.id}
                            onClick={() => navigate(`/comunidades/${comm.id}`)}
                            className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-3xl transition-all duration-500 cursor-pointer relative overflow-hidden"
                        >
                            {comm.priority && (
                                <div className="absolute top-0 right-10 w-8 h-10 bg-[#d9f1a2] rounded-b-lg flex items-center justify-center text-[#006c55] shadow-sm">
                                    <Bell size={14} className="animate-bounce" />
                                </div>
                            )}

                            <div className={`w-14 h-14 ${comm.bg} ${comm.color} rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform`}>
                                <comm.icon size={28} />
                            </div>

                            <div className="space-y-3 mb-10">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${comm.color}`}>{comm.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                    <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">{comm.activeNow} Estudando agora</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#006c55] transition-colors tracking-tight">{comm.name}</h3>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#006c55] animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-slate-500">{comm.update}</span>
                                </div>
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-[#006c55] group-hover:text-white transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6 px-2">
                    {suggested.map((s, i) => (
                        <div key={i} className="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-slate-100 flex flex-col lg:flex-row items-center gap-8 group hover:bg-white transition-all shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 group-hover:text-[#006c55] group-hover:bg-[#d9f1a2]/20 transition-all shrink-0">
                                <Users size={36} />
                            </div>
                            <div className="flex-1 space-y-3 text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-3">
                                    <h3 className="text-2xl font-black text-slate-900">{s.name}</h3>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg">{s.type}</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xl">{s.desc}</p>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                                        <span className="text-[10px] font-black uppercase text-slate-400">Mod: {s.moderator}</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-[#006c55] bg-[#d9f1a2]/30 px-3 py-1 rounded-full">{s.members} Membros</span>
                                </div>
                            </div>
                            <button className="w-full lg:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#006c55] transition-all shadow-xl shadow-slate-200 group-hover:shadow-[#006c55]/20 flex items-center justify-center gap-2">
                                Solicitar Acesso <ArrowUpRight size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comunidades;
