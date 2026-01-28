
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  User,
  Sparkles,
  Loader2,
  MapPin,
  GraduationCap,
  Briefcase,
  Edit3,
  Share2,
  Settings,
  Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../../components/PostCard';
import BadgeSystemBox from '../../components/BadgeSystemBox';
import SidebarFeed from '../../components/SidebarFeed';
import { collection, onSnapshot, query, orderBy, where, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserService } from '../../modules/user/user.service';
import ProfileSidebar from './ProfileSidebar';
import ProfileTabs from './ProfileTabs';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { username } = useParams<{ username?: string }>();

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
        if (username) {
          const profile = await UserService.getUserByUsername(username);
          if (!profile) {
            setProfileNotFound(true);
            setLoading(false);
            return;
          }
          targetUid = profile.uid;
        } else if (user) {
          targetUid = user.uid;
        } else {
          setLoading(false);
          return;
        }

        setIsOwner(user?.uid === targetUid);

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
            setProfileNotFound(true);
          }
          setLoading(false);
        });

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
  }, [username, user]);

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
    <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500 w-full">

      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        {isOwner ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <Edit3 size={14} /> Editar Perfil
          </button>
        ) : (
          <button className="flex items-center gap-2 px-4 py-2 bg-[#006c55] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#005a46] transition-all shadow-lg active:scale-95">
            Conectar
          </button>
        )}
        <button className="p-2 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-all border border-slate-100 shadow-sm">
          <Share2 size={18} />
        </button>
        {isOwner && (
          <button className="p-2 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-all border border-slate-100 shadow-sm">
            <Settings size={18} />
          </button>
        )}
      </div>

      {/* Top Grid: Profile Card + Badges */}
      {/* Top Section: Profile (Sidebar) + Badges (Main) */}
      <div className="flex flex-col lg:flex-row gap-[30px] w-full">
        <div className="w-full lg:w-[315px]">
          <ProfileSidebar
            user={user}
            profileData={profileData}
          />
        </div>
        <div className="w-full lg:w-[660px]">
          <BadgeSystemBox />
        </div>
      </div>

      {/* Navigation Tabs - Full Width */}
      <div>
        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={{
            connections: profileData.stats?.connections || 0,
            projects: projects.length || profileData.stats?.projects || 0,
            posts: posts.length || profileData.stats?.posts || 0,
            badges: profileData.stats?.badges || 12
          }}
        />
      </div>

      {/* Content Area */}
      <div className="w-full">

        {/* Timeline - Horizontal Feed (reusing SidebarFeed component) */}
        {activeTab === 'timeline' && (
          <section className="w-full min-h-[480px]">
            <SidebarFeed
              title="Timeline"
              userId={username ? (profileData.uid || user?.uid) : user?.uid}
              maxPosts={20}
            />
          </section>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="liquid-glass p-8 rounded-[24px] shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900">Sobre</h2>
              </div>
              {profileData.bio ? (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{profileData.bio}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">Nenhuma descrição fornecida.</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-600">
                  <GraduationCap className="text-[#006c55]" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Curso</p>
                    <p className="text-sm font-bold">{profileData.course || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="text-[#006c55]" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Localização</p>
                    <p className="text-sm font-bold">{profileData.location || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="liquid-glass p-8 rounded-[24px] shadow-2xl">
              <h2 className="text-xl font-black text-slate-900 mb-6">Trajetória</h2>
              <div className="space-y-8">
                {profileData.trajectory && profileData.trajectory.length > 0 ? (
                  profileData.trajectory.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 relative group">
                      <div className="w-10 h-10 rounded-xl bg-[#006c55]/10 text-[#006c55] flex items-center justify-center shrink-0">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.company} • {item.period}</span>
                        <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">Nenhuma experiência registrada.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <h2 className="text-xl font-black text-slate-900">Projetos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length > 0 ? projects.map(project => (
                <div key={project.id} className="liquid-glass rounded-[24px] overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    <img src={project.coverImage || "https://images.unsplash.com/photo-1551650975-87deedd944c3"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-black text-slate-900 mb-2 truncate">{project.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{project.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-wider">{project.category || 'Geral'}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full p-8 text-center liquid-glass rounded-[24px]">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Nenhum projeto publicado ainda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {(activeTab === 'badges' || activeTab === 'activity' || activeTab === 'network') && <div className="p-12 flex flex-col items-center justify-center text-center liquid-glass rounded-[24px] animate-in fade-in">
          <Sparkles size={32} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-900 mb-1">Em breve</h3>
          <p className="text-xs text-slate-400 font-medium">Esta seção está em desenvolvimento.</p>
        </div>
        }

      </div>

      {/* Edit Modal (Copied Reuse) */}
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
    </div>
  );
};

export default Profile;