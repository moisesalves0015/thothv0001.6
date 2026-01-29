
import React from 'react';
import {
    User,
    Users,
    Award,
    Briefcase,
    Layers,
    TrendingUp
} from 'lucide-react';

interface ProfileTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    stats: {
        connections: number;
        projects: number;
        posts: number;
        badges: number;
    };
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab, stats }) => {
    const tabs = [
        { id: 'timeline', label: 'Timeline', icon: Layers, count: null },
        { id: 'about', label: 'Sobre', icon: User, count: null },
        { id: 'projects', label: 'Projetos', icon: Briefcase, count: stats.projects },
        { id: 'badges', label: 'Emblemas', icon: Award, count: stats.badges },
        { id: 'activity', label: 'Atividade', icon: TrendingUp, count: stats.posts },
        { id: 'network', label: 'Rede', icon: Users, count: stats.connections }
    ];

    return (
        <div className="w-full liquid-glass rounded-[24px] p-6 shadow-2xl mb-6 order-2 md:order-none">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                console.log("Tab clicked:", tab.id);
                                setActiveTab(tab.id);
                            }}
                            className={`
                                relative flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 group liquid-btn
                                ${isActive ? 'active shadow-lg transform scale-[1.02]' : 'hover:scale-105'}
                            `}
                        >
                            <div className="flex flex-col items-center gap-1.5">
                                <tab.icon size={20} className={`mb-1 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#006c55]'}`} />
                                <span className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                                    {tab.label}
                                </span>
                            </div>

                            {tab.count !== null && (
                                <div className={`
                                    absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-colors
                                    ${isActive
                                        ? 'bg-white/20 text-[#006c55] dark:text-emerald-400'
                                        : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 group-hover:bg-[#006c55]/10 group-hover:text-[#006c55] dark:group-hover:text-emerald-400'
                                    }
                                `}>
                                    {tab.count}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ProfileTabs;
