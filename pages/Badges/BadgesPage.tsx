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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all active:scale-95"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="text-[#006c55] dark:text-emerald-400" size={24} />
                                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                                        Emblemas
                                    </h1>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    Gerencie sua coleção de emblemas
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/badges/create')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#006c55] to-[#00876a] dark:from-emerald-500 dark:to-emerald-600 text-white rounded-xl font-bold text-sm hover:from-[#005a46] hover:to-[#007a62] dark:hover:from-emerald-600 dark:hover:to-emerald-700 transition-all shadow-lg shadow-[#006c55]/20 dark:shadow-emerald-500/20 active:scale-95"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Criar Novo</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap
                    ${isActive
                                            ? 'bg-gradient-to-r from-[#006c55] to-[#00876a] dark:from-emerald-500 dark:to-emerald-600 text-white shadow-lg shadow-[#006c55]/20 dark:shadow-emerald-500/20'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }
                  `}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'inventory' && <MyBadgesTab />}
                {activeTab === 'discover' && <DiscoverBadgesTab />}
            </div>
        </div>
    );
};

export default BadgesPage;
