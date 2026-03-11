
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
    Landmark,
    X
} from 'lucide-react';
import { db } from '../../firebase';
import PrintOrdersAdmin from './PrintOrdersAdmin';
import PrinterStationsAdmin from './PrinterStationsAdmin';
import UsersAdmin from './UsersAdmin';
import OverviewAdmin from './OverviewAdmin';

const AdminPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'graficas' | 'pedidos' | 'rules' | 'logs'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = [
        { id: 'overview', label: 'Monitoramento', icon: <Activity size={18} /> },
        { id: 'users', label: 'Gestão de Usuários', icon: <Users size={18} /> },
        { id: 'graficas', label: 'Gráficas Parceiras', icon: <Landmark size={18} /> },
        { id: 'pedidos', label: 'Pedidos de Impressão', icon: <Printer size={18} /> },
        { id: 'rules', label: 'Regras de Acesso', icon: <Lock size={18} /> },
        { id: 'logs', label: 'Kernel Logs', icon: <Database size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-[#006c55] selection:text-white">
            {/* Background Decoration */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-screen relative z-10">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-[60] shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#006c55] rounded-lg flex items-center justify-center shadow-md">
                            <ShieldAlert size={18} className="text-white" />
                        </div>
                        <h1 className="text-lg font-black tracking-tight">THOTH <span className="text-[#006c55]">CRM</span></h1>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Filter size={24} />}
                    </button>
                </div>

                {/* Sidebar */}
                <aside className={`
                    w-72 border-r border-slate-100 bg-white/80 backdrop-blur-xl flex flex-col p-6 
                    fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="hidden lg:flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-[#006c55] rounded-xl flex items-center justify-center shadow-[0_8px_16px_rgba(0,108,85,0.2)] border border-white/20">
                            <ShieldAlert size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter leading-none">THOTH <span className="text-[#006c55]">CRM</span></h1>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 block">Painel Administrativo</span>
                        </div>
                    </div>

                    <nav className="space-y-1.5 flex-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as any);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-black transition-all ${activeTab === tab.id
                                    ? 'bg-[#006c55]/5 text-[#006c55] border border-[#006c55]/10 shadow-[0_4px_12px_rgba(0,108,85,0.05)]'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/80'
                                    }`}
                            >
                                <span className={activeTab === tab.id ? 'text-[#006c55]' : 'text-slate-300 group-hover:text-slate-500 transition-colors'}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-slate-50">
                        <div className="p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Usuário Atual</p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#006c55] text-white flex items-center justify-center text-xs font-black">A</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-slate-900 truncate">Administrador</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Acesso Global</p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest">
                            <Settings size={16} />
                            Encerrar Sessão
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full max-w-full">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <p className="text-[10px] font-black text-[#006c55] uppercase tracking-[0.3em] mb-1">Módulo de {activeTab}</p>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 capitalize">
                                {tabs.find(t => t.id === activeTab)?.label || activeTab}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 shadow-sm">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Servidores Online</span>
                            </div>
                        </div>
                    </header>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full overflow-hidden">
                        {activeTab === 'overview' && <OverviewAdmin />}
                        {activeTab === 'users' && <UsersAdmin />}
                        {activeTab === 'graficas' && <PrinterStationsAdmin />}
                        {activeTab === 'pedidos' && <PrintOrdersAdmin />}

                        {(activeTab === 'rules' || activeTab === 'logs') && (
                            <div className="h-[500px] bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-transparent"></div>
                                <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-400 mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                                    <Database size={36} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-black mb-3 tracking-tighter uppercase text-slate-900">Módulo Bloqueado</h3>
                                <p className="text-[11px] text-slate-400 max-w-xs font-bold uppercase tracking-widest leading-relaxed">
                                    Esta seção requer permissões de nível Alpha. O Kernel está protegido.
                                </p>
                                <button className="mt-8 px-8 h-12 bg-[#006c55]/5 border border-[#006c55]/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#006c55] hover:text-white transition-all shadow-sm flex items-center gap-3 text-[#006c55]">
                                    <ShieldAlert size={16} /> Solicitar Elevação
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminPortal;
