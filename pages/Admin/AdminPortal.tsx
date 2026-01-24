
import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Users,
    Activity,
    Lock,
    Settings,
    Search,
    Filter,
    MoreVertical,
    ChevronRight,
    Database,
    Globe,
    Server,
    Key,
    Eye,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Printer,
    X,
    Plus
} from 'lucide-react';
import { collection, query, limit, onSnapshot, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { PrinterService, PrinterStation } from '../../modules/print/printer.service';
import { Mail, Phone, MapPin, Landmark, Percent } from 'lucide-react';

const AdminPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'grificas' | 'rules' | 'logs'>('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSessions: 142, // Mocked for design
        systemHealth: '99.8%',
        securityAlerts: 0
    });

    const [users, setUsers] = useState<any[]>([]);
    const [stations, setStations] = useState<PrinterStation[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states for new partner shop
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);
    const [editShopId, setEditShopId] = useState<string | null>(null);
    const [newShop, setNewShop] = useState({
        name: '',
        stationId: '',
        accessCode: '',
        ownerEmail: '',
        commissionRate: 0,
        phoneNumber: '',
        address: '',
        managerName: ''
    });

    // Deletion states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [shopToDelete, setShopToDelete] = useState<PrinterStation | null>(null);

    useEffect(() => {
        // Basic stats fetching
        const fetchStats = async () => {
            const usersSnap = await getDocs(collection(db, 'users'));
            setStats(prev => ({ ...prev, totalUsers: usersSnap.size }));
        };

        // Users preview
        const q = query(collection(db, 'users'), limit(10));
        const unsub = onSnapshot(q, (snap) => {
            setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        fetchStats();

        // Printer stations subscription
        const unsubStations = PrinterService.subscribeToStations(setStations);

        return () => {
            unsub();
            unsubStations();
        };
    }, []);

    const handleSaveShop = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editShopId) {
                await PrinterService.updateStation(editShopId, newShop);
                alert("Parceria atualizada com sucesso!");
            } else {
                await PrinterService.registerStation(newShop);
                alert("Parceria registrada com sucesso!");
            }

            setIsShopModalOpen(false);
            setEditShopId(null);
            setNewShop({
                name: '', stationId: '', accessCode: '', ownerEmail: '',
                commissionRate: 0, phoneNumber: '', address: '', managerName: ''
            });
        } catch (error) {
            console.error("Erro ao salvar parceiro:", error);
            alert("Erro ao salvar parceiro.");
        }
    };

    const handleEditShop = (shop: PrinterStation) => {
        setEditShopId(shop.id);
        setNewShop({
            name: shop.name,
            stationId: shop.stationId,
            accessCode: shop.accessCode,
            ownerEmail: shop.ownerEmail,
            commissionRate: shop.commissionRate,
            phoneNumber: shop.phoneNumber,
            address: shop.address,
            managerName: shop.managerName
        });
        setIsShopModalOpen(true);
    };

    const confirmDeleteShop = (shop: PrinterStation) => {
        setShopToDelete(shop);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteShop = async () => {
        if (!shopToDelete) return;
        try {
            await PrinterService.deleteStation(shopToDelete.id);
            setIsDeleteModalOpen(false);
            setShopToDelete(null);
            alert("Gráfica removida da rede.");
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao remover gráfica.");
        }
    };

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
                            { id: 'grificas', label: 'Gráficas Parceiras', icon: <Landmark size={18} /> },
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
                            <h2 className="text-3xl font-black tracking-tight mb-1 capitalize">{activeTab}</h2>
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
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Usuários Totais', value: stats.totalUsers, icon: <Users />, color: 'primary' },
                                    { label: 'Sessões Ativas', value: stats.activeSessions, icon: <Eye />, color: 'emerald' },
                                    { label: 'Saúde do Kernel', value: stats.systemHealth, icon: <Server />, color: 'blue' },
                                    { label: 'Alertas Vermelhos', value: stats.securityAlerts, icon: <AlertTriangle />, color: 'red' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/[0.07] transition-all group overflow-hidden relative">
                                        <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-[#006c55]/10 transition-all"></div>
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 mb-4 group-hover:text-white transition-colors">
                                            {s.icon}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">{s.label}</span>
                                        <span className="text-3xl font-black tracking-tight">{s.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Analytics Section Preview */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                            <Activity size={20} className="text-[#006c55]" />
                                            Fluxo do Servidor
                                        </h3>
                                        <select className="bg-black border border-white/10 rounded-lg text-[10px] font-black uppercase px-3 py-1 text-slate-400">
                                            <option value="24h">Últimas 24h</option>
                                        </select>
                                    </div>
                                    <div className="h-64 flex items-end gap-2 px-2">
                                        {[40, 60, 45, 90, 65, 80, 50, 70, 40, 85, 30, 95, 75, 60, 80, 45, 70, 90, 50, 65].map((h, i) => (
                                            <div key={i} className="flex-1 bg-[#006c55]/20 hover:bg-[#006c55] rounded-t transition-all group relative" style={{ height: `${h}%` }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black px-1.5 py-0.5 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {h}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 px-1">
                                        <span className="text-[10px] font-bold text-slate-600">00:00</span>
                                        <span className="text-[10px] font-bold text-slate-600">12:00</span>
                                        <span className="text-[10px] font-bold text-slate-600">23:59</span>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col">
                                    <h3 className="text-lg font-black tracking-tight mb-8">Status Global</h3>
                                    <div className="space-y-6 flex-1">
                                        {[
                                            { l: 'Base de Dados', s: 'Online', c: 'emerald' },
                                            { l: 'Auth Service', s: 'Online', c: 'emerald' },
                                            { l: 'Storage Bucket', s: 'Online', c: 'emerald' },
                                            { l: 'CDN Edge', s: 'Online', c: 'emerald' },
                                            { l: 'Neural API', s: 'Offline', c: 'red' },
                                        ].map((svc, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-400">{svc.l}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase text-${svc.c}-500`}>{svc.s}</span>
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-${svc.c}-500 shadow-[0_0_8px_${svc.c}]`}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="mt-8 w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                        Relatório Completo
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="animate-in fade-in duration-700 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Filtrar por nome, email ou UID..."
                                        className="w-full h-11 pl-12 pr-4 bg-black border border-white/10 rounded-2xl text-sm focus:border-[#006c55] focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="h-11 px-6 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
                                        <Filter size={16} /> Filtros
                                    </button>
                                    <button className="h-11 px-6 bg-[#006c55] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-[#006c55]/20">
                                        Novo Usuário
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Identidade</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Cargo / Status</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Data de Registro</th>
                                            <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u, i) => (
                                            <tr key={u.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 relative overflow-hidden">
                                                            {u.photoURL ? (
                                                                <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center font-black text-[#006c55] uppercase text-xs">
                                                                    {u.fullName?.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-bold truncate">{u.fullName || 'Usuário Sem Nome'}</span>
                                                            <span className="text-[10px] text-slate-500 truncate">{u.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${u.role === 'Admin' ? 'bg-red-500/10 text-red-500' :
                                                            u.role === 'Professor' ? 'bg-blue-500/10 text-blue-500' :
                                                                'bg-emerald-500/10 text-emerald-500'
                                                            }`}>
                                                            {u.role || 'Estudante'}
                                                        </span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'Indisponível'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <button className="p-2 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"><Key size={14} /></button>
                                                        <button className="p-2 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"><Eye size={14} /></button>
                                                        <button className="p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 border-t border-white/5 flex justify-center">
                                <button className="text-[10px] font-black uppercase text-slate-500 hover:text-white tracking-widest transition-all">Ver Todos os Usuários</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'grificas' && (
                        <div className="animate-in fade-in duration-700 space-y-8 pb-12">
                            <div className="bg-white/5 border border-white/10 rounded-[32px] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-[400px] h-full bg-[#006c55]/5 blur-[80px] -z-10 group-hover:bg-[#006c55]/10 transition-all duration-500"></div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <h3 className="text-2xl font-black tracking-tighter uppercase italic">Rede de Parcerias <span className="text-[#006c55] text-sm not-italic ml-2">Enterprise</span></h3>
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">Gestão de gráficas conveniadas, taxas de comissão e métricas de faturamento.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditShopId(null);
                                        setNewShop({
                                            name: '', stationId: '', accessCode: '', ownerEmail: '',
                                            commissionRate: 0, phoneNumber: '', address: '', managerName: ''
                                        });
                                        setIsShopModalOpen(true);
                                    }}
                                    className="h-16 px-10 bg-[#006c55] rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-2xl shadow-[#006c55]/20 flex items-center gap-4 hover:scale-105 active:scale-95 whitespace-nowrap"
                                >
                                    <Plus size={20} strokeWidth={3} /> Cadastrar Nova Gráfica
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {stations.map(station => (
                                    <div key={station.id} className="bg-white/5 border border-white/10 p-8 rounded-[40px] hover:bg-white/[0.07] transition-all group relative overflow-hidden flex flex-col min-h-[380px]">
                                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#006c55]/5 rounded-full blur-[60px] group-hover:bg-[#006c55]/15 transition-all"></div>

                                        {/* Status & Commission Header */}
                                        <div className="flex items-start justify-between mb-8 relative z-10">
                                            <div className="w-16 h-16 rounded-[24px] bg-[#006c55]/10 flex items-center justify-center text-[#006c55] group-hover:bg-[#006c55] group-hover:text-white transition-all shadow-inner group-hover:shadow-[0_0_30px_rgba(0,108,85,0.4)]">
                                                <Landmark size={32} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
                                                    <Percent size={14} className="text-emerald-500" />
                                                    <span className="text-sm font-black text-emerald-500">{station.commissionRate}%</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditShop(station)}
                                                        className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                                                    >
                                                        <Settings size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDeleteShop(station)}
                                                        className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8 relative z-10 flex-1">
                                            <div>
                                                <h4 className="text-xl font-black tracking-tight leading-none text-white group-hover:text-emerald-400 transition-colors uppercase">{station.name}</h4>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 block">{station.managerName || 'Gerente Não Definido'}</span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                                                    <Mail size={14} className="text-[#006c55]" />
                                                    <span className="text-xs font-bold">{station.ownerEmail}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                                                    <Phone size={14} className="text-[#006c55]" />
                                                    <span className="text-xs font-bold">{station.phoneNumber || '(00) 00000-0000'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                                                    <MapPin size={14} className="text-[#006c55]" />
                                                    <span className="text-xs font-bold truncate max-w-[200px]">{station.address || 'Endereço Pendente'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-black/60 rounded-[30px] border border-white/5 space-y-4 relative z-10 backdrop-blur-md">
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block opacity-60">ID do Terminal</span>
                                                    <span className="font-mono text-white font-black tracking-[0.4em] text-xs">{station.stationId}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Ativo</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {stations.length === 0 && (
                                    <div className="col-span-full py-32 bg-white/5 border border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center opacity-40 group hover:opacity-100 transition-opacity">
                                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <Landmark size={48} className="text-slate-500 group-hover:text-[#006c55]" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Nenhuma Gráfica Parceira Cadastrada</span>
                                    </div>
                                )}
                            </div>
                        </div>
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

            {/* Modal de Registro de Parceiro */}
            {isShopModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[50px] p-12 shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsShopModalOpen(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-20 h-20 bg-[#006c55] rounded-[28px] flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(0,108,85,0.4)]">
                                <Landmark size={40} />
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter mb-2 text-white uppercase italic">
                                {editShopId ? 'Editar Parceria' : 'Nova Parceria Gráfica'}
                            </h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">
                                {editShopId ? 'Atualize as definições estratégicas do parceiro.' : 'Estabeleça um novo ponto de fornecimento na rede Thoth.'}
                            </p>
                        </div>

                        <form onSubmit={handleSaveShop} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome da Gráfica</label>
                                    <input
                                        type="text" required
                                        value={newShop.name}
                                        onChange={e => setNewShop({ ...newShop, name: e.target.value })}
                                        placeholder="Ex: Gráfica do Centro"
                                        className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#006c55] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">ID do Terminal</label>
                                    <input
                                        type="text" required
                                        value={newShop.stationId}
                                        onChange={e => setNewShop({ ...newShop, stationId: e.target.value })}
                                        placeholder="Ex: GR-CENTER-01"
                                        className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#006c55] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Código de Acesso</label>
                                    <input
                                        type="password" required
                                        value={newShop.accessCode}
                                        onChange={e => setNewShop({ ...newShop, accessCode: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#006c55] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Taxa de Comissão Thoth (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number" required
                                            value={newShop.commissionRate}
                                            onChange={e => setNewShop({ ...newShop, commissionRate: Number(e.target.value) })}
                                            className="w-full h-14 px-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-sm font-black text-emerald-500 focus:outline-none focus:border-emerald-500 transition-all"
                                        />
                                        <Percent size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email do Responsável</label>
                                    <input
                                        type="email" required
                                        value={newShop.ownerEmail}
                                        onChange={e => setNewShop({ ...newShop, ownerEmail: e.target.value })}
                                        placeholder="manager@grafica.com"
                                        className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#006c55] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome do Gerente</label>
                                    <input
                                        type="text" required
                                        value={newShop.managerName}
                                        onChange={e => setNewShop({ ...newShop, managerName: e.target.value })}
                                        placeholder="Ex: Carlos Oliveira"
                                        className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#006c55] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Telefone de Contato</label>
                                    <input
                                        type="text" required
                                        value={newShop.phoneNumber}
                                        onChange={e => setNewShop({ ...newShop, phoneNumber: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                        className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#006c55] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Endereço Físico</label>
                                    <input
                                        type="text" required
                                        value={newShop.address}
                                        onChange={e => setNewShop({ ...newShop, address: e.target.value })}
                                        placeholder="Rua, Número, Bloco..."
                                        className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#006c55] transition-all"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="md:col-span-2 w-full h-20 bg-[#006c55] hover:bg-emerald-600 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl shadow-[#006c55]/20 mt-4 hover:scale-[1.02] active:scale-[0.98]">
                                {editShopId ? 'Salvar Alterações' : 'Firmar Nova Parceria'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal de Confirmação de Exclusão */}
            {isDeleteModalOpen && shopToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter mb-2 text-white uppercase italic">Romper Parceria?</h3>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                Você está prestes a remover <span className="text-white">{shopToDelete.name}</span> da rede Thoth. Esta ação é irreversível.
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full mt-10">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteShop}
                                    className="h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-red-500/20"
                                >
                                    Confirmar Exclusão
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPortal;
