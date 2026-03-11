import React, { useState, useEffect, useMemo } from 'react';
import {
    Landmark,
    Plus,
    Search,
    Filter,
    Settings,
    Trash2,
    Mail,
    Phone,
    MapPin,
    Check,
    RotateCw,
    Shield,
    Lock,
    Unlock,
    Activity,
    DollarSign,
    FileText,
    AlertTriangle,
    X,
    Percent,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { PrinterService, PrinterStation } from '../../modules/print/printer.service';
import { PrintRequest } from '../../types';

interface StationMetrics {
    totalOrders: number;
    totalRevenue: number;
    activeOrders: number;
    completedOrders: number;
    lastActivity: Date | null;
}

const PrinterStationsAdmin: React.FC = () => {
    const [stations, setStations] = useState<PrinterStation[]>([]);
    const [orders, setOrders] = useState<PrintRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    // Modal States
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

    // Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [shopToDelete, setShopToDelete] = useState<PrinterStation | null>(null);

    // Security Modal
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [securityStation, setSecurityStation] = useState<PrinterStation | null>(null);

    // Diagnostic Mode
    const [diagnosticMode, setDiagnosticMode] = useState(false);

    useEffect(() => {
        // Subscribe to ALL stations (bypassing service filter)
        const qStations = query(collection(db, 'printerStations'));
        const unsubStations = onSnapshot(qStations, (snapshot) => {
            const fetchedStations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PrinterStation[];
            setStations(fetchedStations);
        });

        // Subscribe to ALL orders to calculate metrics
        const qOrders = query(collection(db, 'printRequests'));
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrintRequest)));
            setLoading(false);
        });

        return () => {
            unsubStations();
            unsubOrders();
        };
    }, []);

    // Calculate Metrics per Station
    const stationMetrics = useMemo(() => {
        const metrics: Record<string, StationMetrics> = {};

        stations.forEach(station => {
            const stationOrders = orders.filter(o => o.stationId === station.stationId);
            const completed = stationOrders.filter(o => o.status === 'ready');
            const active = stationOrders.filter(o => ['pending', 'printing'].includes(o.status));

            // Calculate total revenue from completed orders
            const revenue = completed.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

            // Find last activity
            const lastOrder = stationOrders.sort((a, b) => b.timestamp - a.timestamp)[0];

            metrics[station.id] = {
                totalOrders: stationOrders.length,
                totalRevenue: revenue,
                activeOrders: active.length,
                completedOrders: completed.length,
                lastActivity: lastOrder ? new Date(lastOrder.timestamp) : null
            };
        });

        return metrics;
    }, [stations, orders]);

    const filteredStations = useMemo(() => {
        return stations.filter(station => {
            const matchesSearch =
                station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                station.stationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                station.managerName?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'all'
                ? true
                : filterStatus === 'active' ? (station.status === 'active') : (station.status !== 'active');

            return matchesSearch && matchesStatus;
        });
    }, [stations, searchTerm, filterStatus]);

    // Handlers
    const handleSaveShop = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editShopId) {
                await PrinterService.updateStation(editShopId, newShop);
            } else {
                await PrinterService.registerStation(newShop);
            }
            setIsShopModalOpen(false);
            setEditShopId(null);
            resetForm();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar operação.");
        }
    };

    const handleDeleteShop = async () => {
        if (!shopToDelete) return;
        try {
            await PrinterService.deleteStation(shopToDelete.id);
            setIsDeleteModalOpen(false);
            setShopToDelete(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao deletar.");
        }
    };

    const handleToggleStatus = async (station: PrinterStation) => {
        try {
            const newStatus = station.status === 'active' ? 'inactive' : 'active';
            await PrinterService.updateStation(station.id, { status: newStatus });
        } catch (error) {
            console.error(error);
        }
    };

    const handleRegenerateCode = async () => {
        if (!securityStation) return;
        const newCode = Math.random().toString(36).slice(-8).toUpperCase();
        try {
            await PrinterService.updateStation(securityStation.id, { accessCode: newCode });
            alert(`Novo código gerado: ${newCode}`);
            setIsSecurityModalOpen(false);
            setSecurityStation(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar novo código.");
        }
    };

    const resetForm = () => {
        setNewShop({
            name: '', stationId: '', accessCode: '', ownerEmail: '',
            commissionRate: 0, phoneNumber: '', address: '', managerName: ''
        });
    };

    const openEditModal = (station: PrinterStation) => {
        setEditShopId(station.id);
        setNewShop({
            name: station.name,
            stationId: station.stationId,
            accessCode: station.accessCode,
            ownerEmail: station.ownerEmail,
            commissionRate: station.commissionRate,
            phoneNumber: station.phoneNumber,
            address: station.address,
            managerName: station.managerName
        });
        setIsShopModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[32px] p-8 shadow-sm group transition-all hover:shadow-md">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 text-slate-400">
                            <Activity size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volume de Rede</span>
                        </div>
                        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {orders.length}
                            <span className="text-sm text-slate-400 font-bold ml-2">jobs</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[32px] p-8 shadow-sm group transition-all hover:shadow-md">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 text-[#006c55]">
                            <DollarSign size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Receita Bruta</span>
                        </div>
                        <div className="text-4xl font-black text-[#006c55] tracking-tighter">
                            R$ {orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0).toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="bg-[#006c55] rounded-[32px] p-8 relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-[#006c55]/30 transition-all" onClick={() => { resetForm(); setIsShopModalOpen(true); }}>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Landmark size={120} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-center">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
                            <Plus size={24} className="text-white" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">Nova Parceria</h3>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-2">Expandir rede Thoth</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800/40 p-4 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006c55] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, ID ou gerente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all placeholder:text-slate-400 font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setDiagnosticMode(!diagnosticMode)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${diagnosticMode ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <AlertTriangle size={14} />
                        Diag
                    </button>
                    <div className="w-px h-6 bg-slate-100 dark:bg-white/10 mx-2 shrink-0"></div>
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filterStatus === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filterStatus === 'active' ? 'bg-[#006c55] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Ativos
                    </button>
                    <button
                        onClick={() => setFilterStatus('inactive')}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filterStatus === 'inactive' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Inativos
                    </button>
                </div>
            </div>

            {/* Diagnostic Panel */}
            {diagnosticMode && (
                <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/30 rounded-[32px] p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Diagnóstico de Rede</h3>
                            <p className="text-[10px] text-purple-500 font-bold uppercase tracking-widest mt-1">Snapshot do Hardware Virtuall</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-black/40 p-5 rounded-[24px] border border-slate-100 dark:border-purple-500/20 shadow-sm">
                            <span className="text-[9px] text-purple-600 font-black uppercase tracking-widest block mb-1 opacity-60">Nodes</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{stations.length}</span>
                        </div>
                        <div className="bg-white dark:bg-black/40 p-5 rounded-[24px] border border-slate-100 dark:border-purple-500/20 shadow-sm">
                            <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest block mb-1 opacity-60">Online</span>
                            <span className="text-2xl font-black text-emerald-600">{stations.filter(s => s.status === 'active').length}</span>
                        </div>
                        <div className="bg-white dark:bg-black/40 p-5 rounded-[24px] border border-slate-100 dark:border-purple-500/20 shadow-sm">
                            <span className="text-[9px] text-red-600 font-black uppercase tracking-widest block mb-1 opacity-60">Zumbi</span>
                            <span className="text-2xl font-black text-red-600">{stations.filter(s => s.status !== 'active').length}</span>
                        </div>
                        <div className="bg-white dark:bg-black/40 p-5 rounded-[24px] border border-slate-100 dark:border-purple-500/20 shadow-sm">
                            <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest block mb-1 opacity-60">Fluxo</span>
                            <span className="text-2xl font-black text-blue-600 font-mono">{orders.length}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto bg-white dark:bg-black/40 rounded-[24px] border border-slate-100 dark:border-purple-500/20 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 dark:border-white/10 text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
                                    <th className="px-6 py-4">ID de Sistema</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Access Token</th>
                                    <th className="px-6 py-4">Margem</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                {stations.map(station => (
                                    <tr key={station.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 dark:text-white">{station.name}</div>
                                            <div className="text-[9px] text-purple-400 font-mono mt-1 uppercase">{station.stationId}-v2</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${station.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {station.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 truncate max-w-[120px] font-mono opacity-60">{station.accessCode}</td>
                                        <td className="px-6 py-4 text-emerald-600">{station.commissionRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Stations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStations.map(station => {
                    const metrics = stationMetrics[station.id] || { totalOrders: 0, totalRevenue: 0, activeOrders: 0, completedOrders: 0, lastActivity: null };

                    return (
                        <div key={station.id} className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[32px] p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group relative overflow-hidden flex flex-col border-b-4 border-b-transparent hover:border-b-[#006c55]">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/5 text-slate-400 group-hover:text-[#006c55] group-hover:bg-emerald-50 transition-all">
                                        <Landmark size={24} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none mb-1 truncate">{station.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{station.stationId}</span>
                                            {station.status === 'active' ? (
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            ) : (
                                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openEditModal(station)}
                                    className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-[#006c55]/10 flex items-center justify-center text-slate-400 hover:text-[#006c55] transition-all border border-slate-100"
                                >
                                    <Settings size={18} />
                                </button>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Receita</span>
                                    <span className="text-lg font-black text-[#006c55]">R$ {metrics.totalRevenue.toFixed(2)}</span>
                                </div>
                                <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Entregues</span>
                                    <span className="text-lg font-black text-slate-900 dark:text-white">{metrics.completedOrders}</span>
                                </div>
                            </div>

                            {/* Info List */}
                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                    <Mail size={14} className="text-slate-300" />
                                    <span className="truncate">{station.ownerEmail}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                    <Phone size={14} className="text-slate-300" />
                                    <span>{station.phoneNumber || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                    <MapPin size={14} className="text-slate-300" />
                                    <span className="truncate">{station.address || 'Local não definido'}</span>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                <button
                                    onClick={() => { setSecurityStation(station); setIsSecurityModalOpen(true); }}
                                    className="px-4 py-2 bg-slate-50 hover:bg-blue-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all flex items-center gap-2 border border-slate-100"
                                >
                                    <Shield size={14} /> Segurança
                                </button>
                                <button
                                    onClick={() => { setShopToDelete(station); setIsDeleteModalOpen(true); }}
                                    className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all border border-red-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- MODALS --- */}

            {/* Edit/Create Modal */}
            {isShopModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsShopModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                            <X size={20} />
                        </button>
                        <div className="mb-10">
                            <p className="text-[10px] font-black text-[#006c55] uppercase tracking-[0.3em] mb-1">Módulo de Cadastro</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{editShopId ? 'Editar Parceria' : 'Nova Parceria'}</h3>
                        </div>

                        <form onSubmit={handleSaveShop} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 font-sans">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nome da Operação</label>
                                <input type="text" required value={newShop.name} onChange={e => setNewShop({ ...newShop, name: e.target.value })} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-bold text-sm" placeholder="Ex: Gráfica Central" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Identificador ID</label>
                                <input type="text" required value={newShop.stationId} onChange={e => setNewShop({ ...newShop, stationId: e.target.value })} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-bold text-sm" placeholder="Ex: CAMPUS-A" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Email do Proprietário</label>
                                <input type="email" required value={newShop.ownerEmail} onChange={e => setNewShop({ ...newShop, ownerEmail: e.target.value })} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-bold text-sm" placeholder="email@exemplo.com" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nome do Responsável</label>
                                <input type="text" required value={newShop.managerName} onChange={e => setNewShop({ ...newShop, managerName: e.target.value })} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-bold text-sm" placeholder="Nome Completo" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Telefone de Contato</label>
                                <input type="text" required value={newShop.phoneNumber} onChange={e => setNewShop({ ...newShop, phoneNumber: e.target.value })} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-bold text-sm" placeholder="(00) 0 0000-0000" />
                            </div>
                            <div className="space-y-1.5 font-sans">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Comissão (%)</label>
                                <input type="number" required value={newShop.commissionRate} onChange={e => setNewShop({ ...newShop, commissionRate: Number(e.target.value) })} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-bold text-sm" placeholder="0" />
                            </div>
                            <div className="space-y-1.5 font-sans md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Localização Física</label>
                                <input type="text" required value={newShop.address} onChange={e => setNewShop({ ...newShop, address: e.target.value })} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-bold text-sm" placeholder="Endereço Completo" />
                            </div>
                            {!editShopId && (
                                <div className="space-y-1.5 font-sans md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Token de Acesso (Login)</label>
                                    <input type="text" required value={newShop.accessCode} onChange={e => setNewShop({ ...newShop, accessCode: e.target.value })} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-bold font-mono text-sm" placeholder="Crie um código forte" />
                                </div>
                            )}

                            <div className="md:col-span-2 pt-6">
                                <button type="submit" className="w-full h-16 bg-[#006c55] hover:bg-[#005c49] rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all shadow-xl shadow-[#006c55]/20 flex items-center justify-center gap-3">
                                    <Check size={20} /> Finalizar Processo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Security Modal */}
            {isSecurityModalOpen && securityStation && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-8 shadow-2xl relative">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase italic">Segurança: {securityStation.name}</h3>

                            <div className="w-full space-y-4 mt-8">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Status da Estação</span>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-bold ${securityStation.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {securityStation.status === 'active' ? 'ATIVA' : 'SUSPENSA'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleStatus(securityStation)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${securityStation.status === 'active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                        >
                                            {securityStation.status === 'active' ? 'Suspender' : 'Reativar'}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Acesso Remoto</span>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="bg-black px-3 py-2 rounded-lg font-mono text-xs text-slate-300 flex-1 truncate">
                                            {securityStation.accessCode}
                                        </div>
                                        <button
                                            onClick={handleRegenerateCode}
                                            className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-lg transition-all"
                                            title="Regerar Token"
                                        >
                                            <RotateCw size={14} />
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-slate-600 mt-2 font-medium">
                                        *Regerar o código desconectará o terminal atual instantaneamente.
                                    </p>
                                </div>

                                <button onClick={() => setIsSecurityModalOpen(false)} className="w-full h-12 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase text-white tracking-widest transition-all mt-4">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && shopToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/10 rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-500 mb-6 border border-red-100">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white uppercase">Encerrar Parceria?</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                Você está removendo <span className="text-slate-900 dark:text-white">{shopToDelete.name}</span> permanentemente.
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full mt-10">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="h-14 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-100"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleDeleteShop}
                                    className="h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-red-500/20"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrinterStationsAdmin;
