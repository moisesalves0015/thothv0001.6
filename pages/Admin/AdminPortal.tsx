
import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Users,
    Activity,
    Lock,
    Settings,
    Search,
    Filter,
    Database,
    Server,
    Key,
    Eye,
    Trash2,
    AlertTriangle,
    Printer,
    Landmark
} from 'lucide-react';
import { db } from '../../firebase';
import PrintOrdersAdmin from './PrintOrdersAdmin';
import PrinterStationsAdmin from './PrinterStationsAdmin';
import UsersAdmin from './UsersAdmin';
import OverviewAdmin from './OverviewAdmin';

const AdminPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'graficas' | 'pedidos' | 'rules' | 'logs'>('overview');


    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#006c55] selection:text-white">
            {/* Glow Effects */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#006c55]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Sidebar - Internal to the page for a "Secret App" feel */}
            <div className="flex min-h-screen">
                <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col p-6 sticky top-0 h-screen z-50">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-[#006c55] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,108,85,0.4)]">
                            <ShieldAlert size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter leading-none">THOTH <span className="text-[#006c55]">CRM</span></h1>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Nível Alpha</span>
                        </div>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {[
                            { id: 'overview', label: 'Monitoramento', icon: <Activity size={18} /> },
                            { id: 'users', label: 'Gestão de Usuários', icon: <Users size={18} /> },
                            { id: 'graficas', label: 'Gráficas Parceiras', icon: <Landmark size={18} /> },
                            { id: 'pedidos', label: 'Pedidos de Impressão', icon: <Printer size={18} /> },
                            { id: 'rules', label: 'Regras de Acesso', icon: <Lock size={18} /> },
                            { id: 'logs', label: 'Kernel Logs', icon: <Database size={18} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-white/5 text-white border border-white/10 shadow-lg'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                <span className={activeTab === tab.id ? 'text-[#006c55]' : ''}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-white/5">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all">
                            <Settings size={18} />
                            Terminar Sessão
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                    <header className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight mb-1 capitalize">
                                {[
                                    { id: 'overview', label: 'Monitoramento' },
                                    { id: 'users', label: 'Gestão de Usuários' },
                                    { id: 'graficas', label: 'Gráficas Parceiras' },
                                    { id: 'pedidos', label: 'Pedidos de Impressão' },
                                    { id: 'rules', label: 'Regras de Acesso' },
                                    { id: 'logs', label: 'Kernel Logs' }
                                ].find(t => t.id === activeTab)?.label || activeTab}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium tracking-tight">Painel de gerenciamento administrativo da plataforma Thoth.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sistemas Estáveis</span>
                            </div>
                        </div>
                    </header>

                    {activeTab === 'overview' && (
                        <OverviewAdmin />
                    )}

                    {activeTab === 'users' && (
                        <UsersAdmin />
                    )}

                    {activeTab === 'graficas' && (
                        <PrinterStationsAdmin />
                    )}

                    {activeTab === 'pedidos' && (
                        <PrintOrdersAdmin />
                    )}

                    {(activeTab === 'rules' || activeTab === 'logs') && (
                        <div className="animate-in fade-in duration-700 h-[600px] bg-white/5 border border-white/10 rounded-[40px] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#006c55]/5 to-transparent"></div>
                            <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center text-slate-600 mb-8 border border-white/5">
                                <Database size={48} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-black mb-3 tracking-tighter uppercase italic">Módulo de Kernel <span className="text-[#006c55]">Restrito</span></h3>
                            <p className="text-xs text-slate-500 max-w-sm font-bold uppercase tracking-widest leading-relaxed">
                                Esta seção requer permissões de Root adicional. O acesso aos arquivos de kernel e logs de segurança estará disponível na versão Enterprise.
                            </p>
                            <button className="mt-10 px-10 h-16 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all shadow-inner hover:text-emerald-500 flex items-center gap-3">
                                <ShieldAlert size={18} /> Solicitar Elevação de Privilégio
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminPortal;
