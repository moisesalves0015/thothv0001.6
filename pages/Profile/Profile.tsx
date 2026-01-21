
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, 
  Users,
  Shield, 
  Award, 
  MapPin, 
  Link as LinkIcon, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  MessageCircle,
  Share2,
  ExternalLink,
  Plus,
  Layers,
  Sparkles,
  Camera,
  CheckCircle2,
  TrendingUp,
  Globe,
  Star,
  BookOpen,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../../components/PostCard';
import { MOCK_POSTS, MOCK_CONNECTIONS } from '../../constants';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { BadgeSlot } from '../../types';

// Componente do Mural Interno do Perfil (Identico ao BadgeSystemBox mas sem botão de criar)
const ProfileBadgeMural: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [tileSize, setTileSize] = useState(33);
  const gridRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<BadgeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const LOGIC_COLS = 20;
  const LOGIC_ROWS = 6;

  useEffect(() => {
    const q = query(collection(db, 'badges'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const badgesData = snapshot.docs.map(doc => ({
        badge: { id: doc.id, ...doc.data() },
        x: doc.data().x || 0,
        y: doc.data().y || 0
      })) as any;
      setSlots(badgesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (gridRef.current) setTileSize(gridRef.current.offsetWidth / (mobile ? 10 : 20));
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toVisual = (lx: number, ly: number) => {
    if (!isMobile) return { vx: lx, vy: ly };
    return ly < 6 ? { vx: lx, vy: ly } : { vx: lx - 10, vy: ly + 6 };
  };

  return (
    <div className="w-full h-[400px] lg:h-[350px] bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200/50 relative overflow-hidden select-none">
      {loading && (
        <div className="absolute inset-0 z-50 bg-white/40 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="animate-spin text-[#006c55]" size={32} />
        </div>
      )}
      <div ref={gridRef} className="absolute inset-0 grid" style={{ 
        gridTemplateColumns: `repeat(${isMobile ? 10 : 20}, 1fr)`,
        gridTemplateRows: `repeat(${isMobile ? 12 : 6}, 1fr)` 
      }}>
        {Array.from({ length: (isMobile ? 10 : 20) * (isMobile ? 12 : 6) }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-slate-200/20" />
        ))}
        {slots.map((slot) => {
          const { vx, vy } = toVisual(slot.x, slot.y);
          return (
            <div key={slot.badge.id} className="absolute" style={{
              width: `${(slot.badge.width || 1) * tileSize}px`,
              height: `${(slot.badge.height || 1) * tileSize}px`,
              transform: `translate(${vx * tileSize}px, ${vy * tileSize}px)`
            }}>
              <div className="w-full h-full bg-white rounded-none border-[0.5px] border-white/50 overflow-hidden shadow-sm">
                <img src={slot.badge.imageUrl} className="w-full h-full object-cover" alt={slot.badge.name} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('timeline');

  const userDisplayName = user?.displayName || "Estudante Thoth";
  const userAvatar = user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Thoth'}`;

  const profileInfo = {
    course: "Design de Interfaces & UX",
    university: "Universidade Thoth de Tecnologia",
    period: "7º Período",
    bio: "Explorando as fronteiras entre o design emocional e a inteligência artificial. Atualmente focado em construir ecossistemas de aprendizado mais humanos e acessíveis.",
    location: "São Paulo, Brasil",
    website: "https://portfolio.thoth.ai",
    skills: ["Figma", "React", "UX Research", "Motion Design", "Python", "IA Generativa"],
    interests: ["Cognição Humana", "Web3", "Sustentabilidade", "Educação Digital"],
    academic: {
      cr: "9.2",
      hours: "180/200h",
      progress: "75%",
      ranking: "Top 5%"
    },
    stats: {
      connections: 1240,
      projects: 15,
      posts: 42,
      score: 850
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      
      {/* 1. HEADER SOCIAL (CAPA E AVATAR) */}
      <section className="relative w-full glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/60">
        <div className="h-48 md:h-64 w-full relative bg-[#006c55]/10 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1523050853063-91589436026e?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            alt="Capa"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent"></div>
          <button className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-[#006c55] transition-all group">
            <Camera size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-16 relative z-10">
          <div className="relative group">
            <img src={userAvatar} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white shadow-2xl object-cover bg-white" alt="Avatar" />
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
              <Shield size={14} fill="currentColor" />
            </div>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 leading-none">{userDisplayName}</h1>
                <p className="text-sm font-bold text-[#006c55] uppercase tracking-[0.2em]">{profileInfo.course} • {profileInfo.period}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-6 py-3 bg-[#006c55] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#006c55]/20 hover:scale-105 transition-all flex items-center gap-2">
                  <Plus size={16} /> Editar Perfil
                </button>
                <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 border-t border-slate-100 flex gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'timeline', label: 'Timeline', icon: Layers },
            { id: 'about', label: 'Sobre', icon: User },
            { id: 'projects', label: 'Projetos', icon: Briefcase },
            { id: 'badges', label: 'Emblemas', icon: Award }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'border-[#006c55] text-[#006c55] font-black' : 'border-transparent text-slate-400 font-bold hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} />
              <span className="text-[11px] uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA LATERAL (INFO & ANALYTICS) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Card: Bio */}
          <div className="glass-panel p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl">
             <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-6">Apresentação</h3>
             <p className="text-sm font-medium text-slate-600 leading-relaxed mb-8">{profileInfo.bio}</p>
             <div className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-500">
                  <MapPin size={16} className="text-[#006c55]" />
                  <span className="text-xs font-bold uppercase tracking-tighter">{profileInfo.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <GraduationCap size={16} className="text-[#006c55]" />
                  <span className="text-xs font-bold uppercase tracking-tighter">{profileInfo.university}</span>
                </div>
                <a href={profileInfo.website} target="_blank" className="flex items-center gap-3 text-[#006c55] hover:underline">
                  <LinkIcon size={16} />
                  <span className="text-xs font-bold uppercase tracking-tighter">Portfólio Digital</span>
                </a>
             </div>
          </div>

          {/* Card: Analytics Acadêmico (Novo) */}
          <div className="glass-panel p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#d9f1a2]/10 rounded-full blur-3xl"></div>
             <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-6">Thoth Analytics</h3>
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Média Global (CR)</p>
                   <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-[#d9f1a2]">{profileInfo.academic.cr}</span>
                      <TrendingUp size={16} className="text-emerald-400" />
                   </div>
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Ranking Curso</p>
                   <span className="text-xl font-black">{profileInfo.academic.ranking}</span>
                </div>
                <div className="col-span-2">
                   <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Horas Complementares: {profileInfo.academic.hours}</p>
                   <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#d9f1a2]" style={{ width: '85%' }}></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Card: Conexões (Novo) */}
          <div className="glass-panel p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Conexões Relevantes</h3>
                <span className="text-[9px] font-black text-[#006c55]">{profileInfo.stats.connections}</span>
             </div>
             <div className="flex flex-wrap gap-2">
                {MOCK_CONNECTIONS.slice(0, 8).map((conn, i) => (
                  <img key={i} src={conn.avatar} className="w-10 h-10 rounded-xl border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer" alt="Friend" />
                ))}
                <div className="w-10 h-10 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold cursor-pointer hover:bg-slate-100 transition-colors">
                  +{profileInfo.stats.connections - 8}
                </div>
             </div>
          </div>

          {/* Card: Expertise & Interesses */}
          <div className="glass-panel p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl">
             <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Hard Skills</h3>
             <div className="flex flex-wrap gap-2 mb-8">
                {profileInfo.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-[#006c55]/5 text-[#006c55] rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#006c55]/10">{skill}</span>
                ))}
             </div>
             <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Interesses de Pesquisa</h3>
             <div className="flex flex-wrap gap-2">
                {profileInfo.interests.map(interest => (
                  <span key={interest} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">{interest}</span>
                ))}
             </div>
          </div>
        </div>

        {/* COLUNA PRINCIPAL (DINÂMICA) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* TAB: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between px-2">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Publicações Recentes</h2>
                 <button className="flex items-center gap-2 text-[10px] font-black uppercase text-[#006c55] tracking-widest hover:underline"><Sparkles size={12}/> Gerar Insight por IA</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_POSTS.slice(0, 4).map(post => (
                  <PostCard key={post.id} post={{...post, author: { ...post.author, name: userDisplayName, avatar: userAvatar }}} />
                ))}
              </div>
            </div>
          )}

          {/* TAB: SOBRE (Trajetória & Certificados) */}
          {activeTab === 'about' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="glass-panel p-10 rounded-[3rem] bg-white border border-white shadow-xl">
                  <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Trajetória Acadêmica</h2>
                  <div className="space-y-12">
                     <div className="flex gap-6 relative">
                        <div className="absolute left-6 top-12 bottom-[-48px] w-px bg-slate-100"></div>
                        <div className="w-12 h-12 rounded-2xl bg-[#006c55] text-white flex items-center justify-center shrink-0 shadow-lg z-10"><Briefcase size={22} /></div>
                        <div className="flex-1">
                           <span className="text-[10px] font-black uppercase text-[#006c55] tracking-widest mb-1 block">Estagiário de UX Design</span>
                           <h4 className="text-lg font-black text-slate-900 tracking-tight">Thoth Labs • Inovação Digital</h4>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-4">Jan 2024 – Presente</p>
                           <p className="text-sm text-slate-600 leading-relaxed max-w-xl">Atuando no desenvolvimento de interfaces inteligentes para o sistema Thoth Print.</p>
                        </div>
                     </div>
                     <div className="flex gap-6 relative">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg z-10"><GraduationCap size={22} /></div>
                        <div className="flex-1">
                           <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1 block">Pesquisador Voluntário</span>
                           <h4 className="text-lg font-black text-slate-900 tracking-tight">Grupo de Estudo: IA e Educação</h4>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-4">Ago 2023 – Dez 2023</p>
                           <p className="text-sm text-slate-600 leading-relaxed max-w-xl">Análise de impacto do uso de LLMs na retenção de conteúdo para alunos de graduação.</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Seção de Certificações (Nova) */}
               <div className="glass-panel p-10 rounded-[3rem] bg-white border border-white shadow-xl">
                  <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Certificações e Cursos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                       { title: 'Google UX Design Professional', issuer: 'Coursera', date: 'Out 2023', icon: Globe },
                       { title: 'React Performance Master', issuer: 'Rocketseat', date: 'Dez 2023', icon: Layers },
                       { title: 'IA Generativa para Criativos', issuer: 'Thoth Academy', date: 'Jan 2024', icon: Sparkles }
                     ].map((cert, i) => (
                       <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#006c55]"><cert.icon size={20} /></div>
                          <div>
                             <h4 className="text-xs font-black text-slate-900 leading-tight mb-1">{cert.title}</h4>
                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{cert.issuer} • {cert.date}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {/* TAB: PROJETOS */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
               {[1, 2, 3].map(i => (
                 <div key={i} className="glass-panel group rounded-[2.5rem] bg-white border border-slate-100 shadow-xl overflow-hidden flex flex-col hover:translate-y-[-8px] transition-all">
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                       <img src={`https://picsum.photos/seed/proj${i}/600/400`} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                       <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-[#006c55]">Estudo de Caso</div>
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                       <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Sistema de Grid Thoth {i}</h3>
                       <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">Redesign completo da experiência de navegação mobile para estudantes de arquitetura e design.</p>
                       <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
                          <div className="flex items-center gap-1.5 text-slate-400">
                             <Calendar size={12} />
                             <span className="text-[10px] font-bold uppercase tracking-tight">Mar 2024</span>
                          </div>
                          <button className="p-3 bg-slate-50 text-slate-400 hover:text-[#006c55] hover:bg-[#006c55]/10 rounded-xl transition-all"><ExternalLink size={18} /></button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* TAB: EMBLEMAS (MURAL COMPLETO IGUAL HOME) */}
          {activeTab === 'badges' && (
             <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="glass-panel p-10 rounded-[3rem] bg-white border border-white shadow-xl">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                      <div>
                         <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">Mural de Ativos Interativo</h2>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ativos vitalícios conquistados na rede Thoth</p>
                      </div>
                      <div className="px-6 py-3 bg-[#006c55]/10 rounded-2xl border border-[#006c55]/10 flex items-center gap-3">
                         <Award size={24} className="text-[#006c55]" />
                         <div>
                            <p className="text-[9px] font-black text-[#006c55] uppercase tracking-widest leading-none">Total de Pontos</p>
                            <p className="text-lg font-black text-slate-900 leading-none">12.450 pts</p>
                         </div>
                      </div>
                   </div>

                   {/* Mural de Emblemas (Interativo 20x6) */}
                   <ProfileBadgeMural />

                   <div className="mt-12 flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-3xl gap-6">
                      <div className="flex items-center gap-4 text-slate-500">
                         <div className="flex items-center gap-2"><Star size={14} className="text-amber-400" /><span className="text-[10px] font-black uppercase">8 Raros</span></div>
                         <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#006c55]" /><span className="text-[10px] font-black uppercase">15 Verificados</span></div>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Todos os emblemas são registrados via Protocolo TICS</p>
                   </div>
                </div>

                {/* Caixa de Emblemas Recomendados (Novo) */}
                <div className="glass-panel p-10 rounded-[3rem] bg-white border border-white shadow-xl">
                    <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Como conquistar mais emblemas?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { title: 'Top Influencer', desc: 'Chegue a 1.500 conexões', icon: Users },
                          { title: 'Project Master', desc: 'Finalize 20 projetos', icon: Briefcase },
                          { title: 'Study Guru', desc: '50 sessões de estudo', icon: BookOpen }
                        ].map((item, i) => (
                           <div key={i} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-center flex flex-col items-center">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100 shadow-sm"><item.icon size={24} /></div>
                              <h4 className="text-xs font-black text-slate-900 mb-1">{item.title}</h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.desc}</p>
                           </div>
                        ))}
                    </div>
                </div>
             </div>
          )}

        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Profile;
