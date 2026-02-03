import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Package, Search, Plus, ArrowLeft } from 'lucide-react';
import MyBadgesTab from './components/MyBadgesTab';
import DiscoverBadgesTab from './components/DiscoverBadgesTab';

type TabType = 'inventory' | 'discover';

const BadgesPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('inventory');

    const tabs = [
        { id: 'inventory' as TabType, label: 'Meu Estoque', icon: Package },
        { id: 'discover' as TabType, label: 'Descobrir', icon: Search },
    ];

    return (
        <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500 w-full mb-10">
            {/* Header Actions */}
            <div className="flex justify-between items-center px-1">
                <div className="thoth-page-header hidden lg:block">
                    <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
                        Emblemas
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Gerencie sua coleção de ativos</p>
                </div>

                <div className="flex items-center gap-2">

                </div>
            </div>

            {/* Filters / Tabs */}
            <div className="glass-panel rounded-[30px] p-6 shadow-xl">
                <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-4 flex items-center justify-between">
                    Categorias
                </h4>
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 
                                    ${isActive
                                        ? 'bg-[#006c55] text-white shadow-lg'
                                        : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                            >
                                <Icon size={12} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="w-full">
                {activeTab === 'inventory' && <MyBadgesTab />}
                {activeTab === 'discover' && <DiscoverBadgesTab />}
            </div>
        </div>
    );
};

export default BadgesPage;
