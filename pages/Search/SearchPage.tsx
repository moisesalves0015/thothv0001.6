import React, { useState, useEffect } from 'react';
import { User, Calendar, Briefcase, FileText, Search as SearchIcon, Sparkles } from 'lucide-react';
import { SearchService } from '../../modules/search/search.service';
import PostCard from '../../components/shared/PostCard';
import ConnectionCard from '../../components/shared/ConnectionCard';
import { Author, Post } from '../../types';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    // Tabs
    const [activeTab, setActiveTab] = useState<'people' | 'posts' | 'events' | 'jobs' | 'projects'>('people');

    // Data
    const [results, setResults] = useState<Author[]>([]);
    const [postResults, setPostResults] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUserData, setCurrentUserData] = useState<Author | undefined>(undefined);

    // Fetch current user data for "Follow" logic
    useEffect(() => {
        const fetchMe = async () => {
            if (auth.currentUser) {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setCurrentUserData({
                        id: auth.currentUser.uid,
                        name: data.fullName || data.name,
                        username: data.username,
                        avatar: data.photoURL,
                        university: data.university,
                        stats: data.stats
                    });
                }
            }
        };
        fetchMe();
    }, []);

    // Search Effect (Triggered by URL change)
    useEffect(() => {
        const performSearch = async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                try {
                    if (activeTab === 'people') {
                        const users = await SearchService.searchUsers(query);
                        setResults(users);
                        setPostResults([]);
                    } else if (activeTab === 'posts') {
                        const posts = await SearchService.searchPosts(query);
                        setPostResults(posts);
                        setResults([]);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setPostResults([]);
            }
        };

        performSearch();
    }, [query, activeTab]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header / Context */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
                <div className="hidden lg:flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#006c55]/10 flex items-center justify-center text-[#006c55]">
                        <SearchIcon size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Resultados</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Exibindo resultados para <span className="text-slate-900 dark:text-slate-200 font-bold">"{query}"</span>
                        </p>
                    </div>
                </div>

                {/* Tags / Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setActiveTab('people')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'people' ? 'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' : 'bg-white/50 text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'}`}
                    >
                        <User size={16} /> Pessoas
                    </button>
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'posts' ? 'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' : 'bg-white/50 text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'}`}
                    >
                        <Sparkles size={16} /> Publicações
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'events' ? 'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' : 'bg-white/50 text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'}`}
                    >
                        <Calendar size={16} /> Eventos
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'jobs' ? 'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' : 'bg-white/50 text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'}`}
                    >
                        <Briefcase size={16} /> Vagas
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'projects' ? 'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' : 'bg-white/50 text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'}`}
                    >
                        <FileText size={16} /> Projetos
                    </button>
                </div>
            </div>

            {/* Results Area */}
            <div className="flex flex-col gap-4">
                {!query ? (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        Use a barra de busca acima para encontrar pessoas e conteúdos.
                    </div>
                ) : activeTab === 'people' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {loading ? (
                            <div className="col-span-full py-12 text-center text-slate-400">
                                <div className="animate-spin w-6 h-6 border-2 border-[#006c55] border-t-transparent rounded-full mx-auto mb-2"></div>
                                Buscando...
                            </div>
                        ) : results.length > 0 ? (
                            results.map(user => (
                                <div key={user.id} className="flex justify-center">
                                    <ConnectionCard
                                        author={user}
                                        currentUid={auth.currentUser?.uid}
                                        currentUserData={currentUserData}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                                Nenhum usuário encontrado com "{query}".
                            </div>
                        )}
                    </div>
                ) : activeTab === 'posts' ? (
                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <div className="col-span-full py-12 text-center text-slate-400">
                                <div className="animate-spin w-6 h-6 border-2 border-[#006c55] border-t-transparent rounded-full mx-auto mb-2"></div>
                                Buscando...
                            </div>
                        ) : postResults.length > 0 ? (
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                {postResults.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                                Nenhuma publicação encontrada com "{query}".
                            </div>
                        )}
                    </div>
                ) : activeTab === 'events' || activeTab === 'jobs' || activeTab === 'projects' ? (
                    <div className="glass-panel p-12 rounded-2xl text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            {activeTab === 'events' && <Calendar size={32} />}
                            {activeTab === 'jobs' && <Briefcase size={32} />}
                            {activeTab === 'projects' && <FileText size={32} />}
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Em Breve</h3>
                        <p className="text-sm text-slate-500 max-w-xs mt-2">
                            A busca por {activeTab === 'events' ? 'eventos' : activeTab === 'jobs' ? 'vagas' : 'projetos'} estará disponível nas próximas atualizações.
                        </p>
                    </div>
                ) : null}
            </div>
        </div >
    );
};

export default SearchPage;
