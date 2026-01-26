import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
  Loader2,
  Edit3,
  Settings,
  Bell,
  Lock,
  Zap,
  Target,
  Heart,
  Code,
  Palette,
  Brain,
  Mail,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../../components/PostCard';
import { MOCK_POSTS, MOCK_CONNECTIONS } from '../../constants';
import { collection, onSnapshot, query, orderBy, where, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { BadgeSlot } from '../../types';
import { UserService } from '../../modules/user/user.service';

// Componente do Mural Interno do Perfil
const ProfileBadgeMural: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [tileSize, setTileSize] = useState(33);
  const gridRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<BadgeSlot[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="w-full h-[400px] lg:h-[350px] bg-gradient-to-br from-slate-50/50 to-white/30 rounded-3xl border border-white/60 overflow-hidden shadow-inner relative select-none backdrop-blur-sm">
      {loading && (
        <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="animate-spin text-[#006c55]" size={32} />
        </div>
      )}
      <div ref={gridRef} className="absolute inset-0 grid" style={{
        gridTemplateColumns: `repeat(${isMobile ? 10 : 20}, 1fr)`,
        gridTemplateRows: `repeat(${isMobile ? 12 : 6}, 1fr)`
      }}>
        {Array.from({ length: (isMobile ? 10 : 20) * (isMobile ? 12 : 6) }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-slate-200/10" />
        ))}
        {slots.map((slot) => {
          const { vx, vy } = toVisual(slot.x, slot.y);
          return (
            <div key={slot.badge.id} className="absolute animate-in zoom-in-95 duration-500" style={{
              width: `${(slot.badge.width || 1) * tileSize}px`,
              height: `${(slot.badge.height || 1) * tileSize}px`,
              transform: `translate(${vx * tileSize}px, ${vy * tileSize}px)`
            }}>
              <div className="w-full h-full bg-white/90 rounded-lg border border-white/50 overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                <img src={slot.badge.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={slot.badge.name} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { username } = useParams<{ username?: string }>(); // Pega username da URL se existir

  const [activeTab, setActiveTab] = useState('timeline');
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileNotFound, setProfileNotFound] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>({
    bio: "",
    course: "",
    university: "",
    period: "",
    location: "",
    website: "",
    skills: [],
    interests: [],
    trajectory: [],
    certifications: [],
    stats: {
      connections: 0,
      projects: 0,
      posts: 0,
      badges: 0
    }
  });

  // Efeito principal para carregar dados do perfil
  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;
    let unsubscribePosts: (() => void) | undefined;
    let unsubscribeProjects: (() => void) | undefined;

    const loadProfile = async () => {
      setLoading(true);
      setProfileNotFound(false);
      let targetUid = '';

      try {
        // 1. Determinar qual UID carregar
        if (username) {
          // Se tem username na URL, busca o UID correspondente
          const profile = await UserService.getUserByUsername(username);
          if (!profile) {
            setProfileNotFound(true);
            setLoading(false);
            return;
          }
          targetUid = profile.uid;
        } else if (user) {
          // Se não tem username na URL (rota /perfil), usa o logado
          targetUid = user.uid;
        } else {
          // Sem user logado e sem param na URL (não deveria acontecer por causa do ProtectedRoute, mas por segurança)
          setLoading(false);
          return;
        }

        // 2. Definir se é dono do perfil
        setIsOwner(user?.uid === targetUid);

        // 3. Carregar dados em tempo real (Snapshot)
        const userRef = doc(db, 'users', targetUid);
        unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData({
              ...data,
              skills: data.skills || [],
              interests: data.interests || [],
              trajectory: data.trajectory || [],
              certifications: data.certifications || [],
              stats: {
                connections: data.stats?.connections || 0,
                projects: data.stats?.projects || 0,
                posts: data.stats?.posts || 0,
                badges: data.stats?.badges || 12
              }
            });
          } else {
            // Caso documento seja deletado enquanto visualiza
            setProfileNotFound(true);
          }
          setLoading(false);
        });

        // 4. Carregar Posts e Projetos
        const postsQuery = query(
          collection(db, 'posts'),
          where('author.id', '==', targetUid),
          orderBy('createdAt', 'desc')
        );
        unsubscribePosts = onSnapshot(postsQuery, (snap) => {
          setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const projectsQuery = query(
          collection(db, 'projects'),
          where('ownerId', '==', targetUid),
          orderBy('createdAt', 'desc')
        );
        unsubscribeProjects = onSnapshot(projectsQuery, (snap) => {
          setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setProfileNotFound(true);
        setLoading(false);
      }
    };

    loadProfile();

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribePosts) unsubscribePosts();
      if (unsubscribeProjects) unsubscribeProjects();
    };
  }, [username, user]); // Recarrega se mudar URL ou usuário logado

  const userDisplayName = profileData.name || profileData.fullName || userProfile?.name || "Estudante Thoth";
  const userAvatar = profileData.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.uid || 'Thoth'}`;

  const skillCategories = useMemo(() => {
    const skills = profileData.skills || [];
    if (skills.length === 0) return [];
    return [
      { icon: Palette, label: "Design & UX", skills: skills.slice(0, 3) },
      { icon: Code, label: "Tecnologia", skills: skills.slice(3, 6) },
      { icon: Brain, label: "Expertise", skills: skills.slice(6) }
    ].filter(cat => cat.skills.length > 0);
  }, [profileData.skills]);

  const interestTags = useMemo(() => {
    const interests = profileData.interests || [];
    if (interests.length === 0) return [];
    const colors = [
      "bg-purple-50 text-purple-600 border-purple-100",
      "bg-emerald-50 text-emerald-600 border-emerald-100",
      "bg-amber-50 text-amber-600 border-amber-100",
      "bg-blue-50 text-blue-600 border-blue-100"
    ];
    const icons = [Globe, Heart, Zap, Target];
    return interests.map((label: string, i: number) => ({
      icon: icons[i % icons.length],
      label,
      color: colors[i % colors.length]
    }));
  }, [profileData.interests]);

  const handleSaveProfile = async (newData: any) => {
    if (!user) return;
    try {
      await UserService.updateProfile(user.uid, newData);
      setIsEditing(false);
    } catch (e) {
      console.error("Erro ao salvar perfil:", e);
    }
  };


  if (profileNotFound) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
        <User size={40} />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Perfil não encontrado</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">O link pode estar quebrado ou o usuário não existe.</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
      <div className="w-20 h-20 bg-slate-100 rounded-full border-4 border-[#006c55]/20 border-t-[#006c55] animate-spin" />
      <div className="text-center">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Preparando Portfólio</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronizando com a Rede Thoth</p>
      </div>
    </div>
  );

  return (
    <div className="profile-container flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      <section className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/60 bg-gradient-to-br from-white via-white to-slate-50">
        <div className="h-48 md:h-64 w-full relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1558655146-364adaf1fcc9?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Capa" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent"></div>
          <div className="absolute top-6 right-6 flex gap-2">
            {isOwner && (
              <button onClick={() => setIsEditing(true)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-slate-700 hover:bg-white hover:text-[#006c55] hover:shadow-lg transition-all group">
                <Camera size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            )}
            <button className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-slate-700 hover:bg-white hover:text-[#006c55] hover:shadow-lg transition-all">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-16 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-white">
              <img src={userAvatar} className="w-full h-full object-cover" alt="Avatar" />
            </div>
            {isOwner && (
              <div onClick={() => setIsEditing(true)} className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-br from-[#006c55] to-[#00a884] rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <Edit3 size={16} />
              </div>
            )}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gradient-to-r from-[#006c55] to-[#00a884] text-white text-[10px] font-black uppercase tracking-widest rounded-full whitespace-nowrap shadow-lg">
              {profileData.period || 'Graduando'}
            </div>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-1 leading-none">{userDisplayName}</h1>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-[#006c55] uppercase tracking-[0.2em]">{profileData.course || 'Estudante'}</p>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <p className="text-sm font-medium text-slate-500">{profileData.university || 'Instituição não definida'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isOwner && (
                  <button onClick={() => setIsEditing(true)} className="px-5 py-3 bg-gradient-to-r from-[#006c55] to-[#00a884] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#006c55]/20 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                    <Plus size={16} /> Editar Perfil
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-8 pt-4 border-t border-slate-100">
              {[
                { label: 'Conexões', value: profileData.stats?.connections || 0 },
                { label: 'Projetos', value: projects.length || profileData.stats?.projects || 0 },
                { label: 'Publicações', value: posts.length || profileData.stats?.posts || 0 },
                { label: 'Emblemas', value: profileData.stats?.badges || 12 }
              ].map(stat => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 border-t border-slate-100 flex gap-8 overflow-x-auto no-scrollbar bg-white/50 backdrop-blur-sm">
          {[
            { id: 'timeline', label: 'Timeline', icon: Layers, count: posts.length },
            { id: 'about', label: 'Sobre', icon: User },
            { id: 'projects', label: 'Projetos', icon: Briefcase, count: projects.length },
            { id: 'badges', label: 'Emblemas', icon: Award, count: profileData.stats.badges },
            { id: 'activity', label: 'Atividade', icon: TrendingUp },
            { id: 'network', label: 'Rede', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-5 border-b-2 transition-all whitespace-nowrap group relative ${activeTab === tab.id
                ? 'border-[#006c55] text-[#006c55] font-black'
                : 'border-transparent text-slate-400 font-bold hover:text-slate-600'
                }`}
            >
              <tab.icon size={16} />
              <span className="text-[11px] uppercase tracking-widest">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-[#006c55] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Col */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel-profile p-8 rounded-3xl bg-white border border-slate-100 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Apresentação</h3>
              {isOwner && <button onClick={() => setIsEditing(true)}><Edit3 size={14} className="text-[#006c55]" /></button>}
            </div>
            {profileData.bio ? (
              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-8 italic">"{profileData.bio}"</p>
            ) : isOwner ? (
              <button onClick={() => setIsEditing(true)} className="w-full py-8 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 text-xs font-bold hover:bg-slate-50 transition-all flex flex-col items-center gap-2 mb-8">
                <Plus size={20} /> Adicionar biografia
              </button>
            ) : <p className="text-sm text-slate-400 italic mb-8">Nenhuma bio disponível.</p>}
            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-500">
                <MapPin size={16} className="text-[#006c55]" />
                <span className="text-xs font-bold uppercase tracking-tighter">{profileData.location || 'Local não definido'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <GraduationCap size={16} className="text-[#006c55]" />
                <span className="text-xs font-bold uppercase tracking-tighter">{profileData.university || 'Instituição não definida'}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel-profile p-8 rounded-3xl bg-white border border-slate-100 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Expertise</h3>
              {isOwner && <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-[#006c55]">+ Adicionar</button>}
            </div>
            <div className="space-y-6">
              {skillCategories.length > 0 ? skillCategories.map((category, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <category.icon size={14} className="text-[#006c55]" />
                    <span className="text-xs font-bold uppercase tracking-wider">{category.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-700 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )) : isOwner ? (
                <button onClick={() => setIsEditing(true)} className="w-full py-8 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                  <Plus size={20} /> Habilidades
                </button>
              ) : <p className="text-xs text-slate-400 italic">Sem habilidades.</p>}
            </div>
          </div>

          <div className="glass-panel-profile p-8 rounded-3xl bg-white border border-slate-100 shadow-lg">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Interesses</h3>
            <div className="flex flex-wrap gap-2">
              {interestTags.length > 0 ? interestTags.map((interest, idx) => (
                <span key={idx} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${interest.color}`}>
                  <interest.icon size={10} />
                  {interest.label}
                </span>
              )) : isOwner ? (
                <button onClick={() => setIsEditing(true)} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-[10px] font-black uppercase">+ Definir Interesses</button>
              ) : <p className="text-xs text-slate-400 italic">Sem interesses.</p>}
            </div>
          </div>
        </div>

        {/* Main Col */}
        <div className="lg:col-span-8 space-y-8">
          {activeTab === 'timeline' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Linha do Tempo</h2>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#006c55] to-[#00a884] text-white text-xs font-black uppercase tracking-widest rounded-2xl">
                  <Sparkles size={14} /> Insight IA
                </button>
              </div>
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
              ) : (
                <div className="glass-panel-profile p-20 flex flex-col items-center justify-center text-center bg-white border border-slate-100 rounded-[3rem]">
                  <Layers size={40} className="text-slate-200 mb-4" />
                  <h3 className="text-xl font-black text-slate-900 mb-2">Timeline vazia</h3>
                  {isOwner && <button className="px-8 py-4 bg-[#006c55] text-white rounded-2xl font-black text-xs uppercase tracking-widest">Criar Publicação</button>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <div className="glass-panel-profile p-10 rounded-3xl bg-white border border-slate-100 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Trajetória Acadêmica</h2>
                  {isOwner && <button onClick={() => setIsEditing(true)}><Plus size={20} className="text-[#006c55]" /></button>}
                </div>
                <div className="space-y-10">
                  {profileData.trajectory.length > 0 ? profileData.trajectory.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-6 relative group">
                      <div className="w-12 h-12 rounded-2xl bg-[#006c55] text-white flex items-center justify-center shrink-0 shadow-lg"><Briefcase size={22} /></div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-500">{item.company}</span>
                        <h4 className="text-lg font-black text-slate-900">{item.title}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase">{item.period}</p>
                        <p className="text-sm text-slate-600 mt-2">{item.description}</p>
                      </div>
                    </div>
                  )) : isOwner && <button onClick={() => setIsEditing(true)} className="w-full py-12 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold text-xs uppercase">Registrar Experiência</button>}
                </div>
              </div>

              <div className="glass-panel-profile p-10 rounded-3xl bg-white border border-slate-100 shadow-xl">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Certificações</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.certifications.length > 0 ? profileData.certifications.map((cert: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 flex items-center gap-4">
                      <Award size={20} className="text-[#006c55]" />
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{cert.title}</h4>
                        <p className="text-[9px] font-bold uppercase text-slate-400">{cert.issuer}</p>
                      </div>
                    </div>
                  )) : isOwner && <button onClick={() => setIsEditing(true)} className="w-full py-8 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-bold">+ Adicionar Certificação</button>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
              {projects.length > 0 ? projects.map(project => (
                <div key={project.id} className="rounded-3xl bg-white border border-slate-100 shadow-lg overflow-hidden flex flex-col">
                  <div className="h-48 relative">
                    <img src={project.coverImage || "https://images.unsplash.com/photo-1551650975-87deedd944c3"} className="w-full h-full object-cover" alt="Proj" />
                    <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/90 rounded-full text-[9px] font-black uppercase text-[#006c55]">{project.category || 'Projeto'}</div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-black text-slate-900 mb-3">{project.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{project.description}</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full glass-panel-profile p-20 flex flex-col items-center justify-center text-center bg-white border border-slate-100 rounded-[3rem]">
                  <Briefcase size={40} className="text-slate-200 mb-4" />
                  <h3 className="text-xl font-black text-slate-900 mb-2">Sem projetos</h3>
                  {isOwner && <button className="px-8 py-4 bg-[#006c55] text-white rounded-2xl font-black text-xs uppercase">Criar Projeto</button>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="animate-in slide-in-from-bottom-4 space-y-8">
              <div className="glass-panel-profile p-10 rounded-3xl bg-white border border-slate-100 shadow-xl">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Mural de Ativos</h2>
                <ProfileBadgeMural />
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Editar Perfil</h3>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-600 font-bold">X</button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nome</label>
                  <input id="edit-name" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" defaultValue={profileData.name || profileData.fullName} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Curso</label>
                  <input id="edit-course" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" defaultValue={profileData.course} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Universidade</label>
                  <input id="edit-univ" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" defaultValue={profileData.university} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Localização</label>
                  <input id="edit-loc" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" defaultValue={profileData.location} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Bio</label>
                <textarea id="edit-bio" className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm" defaultValue={profileData.bio} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-600 font-bold">Cancelar</button>
                <button onClick={() => {
                  handleSaveProfile({
                    name: (document.getElementById('edit-name') as HTMLInputElement).value,
                    course: (document.getElementById('edit-course') as HTMLInputElement).value,
                    university: (document.getElementById('edit-univ') as HTMLInputElement).value,
                    location: (document.getElementById('edit-loc') as HTMLInputElement).value,
                    bio: (document.getElementById('edit-bio') as HTMLTextAreaElement).value,
                  });
                }} className="px-8 py-3 bg-[#006c55] text-white rounded-xl font-black uppercase tracking-widest">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .glass-panel-profile { backdrop-filter: blur(10px); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Profile;