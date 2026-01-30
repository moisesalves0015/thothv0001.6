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
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#006c55]/10 rounded-full blur-[40px] group-hover:bg-[#006c55]/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 text-slate-400">
                            <Activity size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Volume Total</span>
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter">
                            {orders.length}
                            <span className="text-sm text-slate-500 font-bold ml-2">pedidos</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 text-slate-400">
                            <DollarSign size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Receita Bruta (Rede)</span>
                        </div>
                        <div className="text-4xl font-black text-emerald-400 tracking-tighter">
                            R$ {orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0).toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="bg-[#006c55] rounded-[32px] p-8 relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-[#006c55]/30 transition-all" onClick={() => { resetForm(); setIsShopModalOpen(true); }}>
                    <div className="absolute -right-4 -bottom-4 opacity-20">
                        <Landmark size={120} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-center">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                            <Plus size={24} className="text-white" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">Nova Parceria</h3>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-2">Expandir rede de atendimento</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-[24px] border border-white/10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, ID ou gerente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#006c55] transition-all placeholder:text-slate-600"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDiagnosticMode(!diagnosticMode)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${diagnosticMode ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        title="Modo Diagnóstico"
                    >
                        <AlertTriangle size={14} />
                        <span className="hidden md:inline">Diag</span>
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === 'all' ? 'bg-white text-black' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === 'active' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                        Ativos
                    </button>
                    <button
                        onClick={() => setFilterStatus('inactive')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === 'inactive' ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                        Inativos
                    </button>
                </div>
            </div>

            {/* Diagnostic Panel */}
            {diagnosticMode && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-[32px] p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Diagnóstico de Rede</h3>
                            <p className="text-xs text-purple-300 font-mono mt-1">Dados não processados do Firestore</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-black/40 p-4 rounded-2xl border border-purple-500/20">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-1">Total Stations</span>
                            <span className="text-2xl font-black text-white">{stations.length}</span>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-purple-500/20">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">Active</span>
                            <span className="text-2xl font-black text-emerald-400">{stations.filter(s => s.status === 'active').length}</span>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-purple-500/20">
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest block mb-1">Inactive</span>
                            <span className="text-2xl font-black text-red-400">{stations.filter(s => s.status !== 'active').length}</span>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-purple-500/20">
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">Total Orders</span>
                            <span className="text-2xl font-black text-blue-400">{orders.length}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto bg-black/40 rounded-2xl border border-purple-500/20">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-[10px] text-slate-400 uppercase tracking-widest">
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Access Code</th>
                                    <th className="p-4">Calculated Revenue</th>
                                    <th className="p-4">Raw Metadata</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-mono text-slate-300">
                                {stations.map(station => {
                                    const metrics = stationMetrics[station.id];
                                    return (
                                        <tr key={station.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-purple-400">{station.id.slice(0, 8)}...</td>
                                            <td className="p-4 font-sans font-bold text-white">{station.name}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${station.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {station.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-white bg-white/5 rounded">{station.accessCode}</td>
                                            <td className="p-4 text-emerald-400">R$ {metrics?.totalRevenue.toFixed(2)}</td>
                                            <td className="p-4 text-[10px] text-slate-500 max-w-[200px] truncate">
                                                {JSON.stringify({ ...station, metrics: undefined })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Stations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStations.map(station => {
                    const metrics = stationMetrics[station.id] || { totalOrders: 0, totalRevenue: 0, activeOrders: 0, completedOrders: 0, lastActivity: null };

                    return (
                        <div key={station.id} className="bg-white/5 border border-white/10 rounded-[32px] p-6 hover:bg-white/[0.07] transition-all group relative overflow-hidden flex flex-col">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                                        <Landmark size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white leading-none mb-1">{station.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-slate-500 uppercase">{station.stationId}</span>
                                            {station.status === 'active' ? (
                                                <div className="px-1.5 py-0.5 bg-emerald-500/20 rounded text-[9px] font-black text-emerald-500 uppercase">Online</div>
                                            ) : (
                                                <div className="px-1.5 py-0.5 bg-red-500/20 rounded text-[9px] font-black text-red-500 uppercase">Offline</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(station)}
                                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                    >
                                        <Settings size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Receita</span>
                                    <span className="text-lg font-black text-emerald-400">R$ {metrics.totalRevenue.toFixed(2)}</span>
                                </div>
                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Pedidos</span>
                                    <span className="text-lg font-black text-white">{metrics.totalOrders}</span>
                                </div>
                            </div>

                            {/* Info List */}
                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <Mail size={14} className="text-[#006c55]" />
                                    <span className="truncate">{station.ownerEmail}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <Phone size={14} className="text-[#006c55]" />
                                    <span>{station.phoneNumber || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <Percent size={14} className="text-[#006c55]" />
                                    <span>Comissão: <span className="text-white font-bold">{station.commissionRate}%</span></span>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <button
                                    onClick={() => { setSecurityStation(station); setIsSecurityModalOpen(true); }}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <Shield size={14} /> Segurança
                                </button>
                                <button
                                    onClick={() => { setShopToDelete(station); setIsDeleteModalOpen(true); }}
                                    className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- MODALS --- */}

            {/* Edit/Create Modal */}
            {isShopModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsShopModalOpen(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                        <h3 className="text-2xl font-black text-white uppercase italic mb-8">{editShopId ? 'Editar Parceria' : 'Nova Parceria'}</h3>

                        <form onSubmit={handleSaveShop} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nome</label>
                                <input type="text" required value={newShop.name} onChange={e => setNewShop({ ...newShop, name: e.target.value })} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">ID da Estação</label>
                                <input type="text" required value={newShop.stationId} onChange={e => setNewShop({ ...newShop, stationId: e.target.value })} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Email</label>
                                <input type="email" required value={newShop.ownerEmail} onChange={e => setNewShop({ ...newShop, ownerEmail: e.target.value })} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Gerente</label>
                                <input type="text" required value={newShop.managerName} onChange={e => setNewShop({ ...newShop, managerName: e.target.value })} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Telefone</label>
                                <input type="text" required value={newShop.phoneNumber} onChange={e => setNewShop({ ...newShop, phoneNumber: e.target.value })} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Comissão (%)</label>
                                <input type="number" required value={newShop.commissionRate} onChange={e => setNewShop({ ...newShop, commissionRate: Number(e.target.value) })} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none" />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Endereço</label>
                                <input type="text" required value={newShop.address} onChange={e => setNewShop({ ...newShop, address: e.target.value })} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none" />
                            </div>
                            {!editShopId && (
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Código de Acesso Inicial</label>
                                    <input type="text" required value={newShop.accessCode} onChange={e => setNewShop({ ...newShop, accessCode: e.target.value })} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none" />
                                </div>
                            )}

                            <div className="md:col-span-2 pt-4">
                                <button type="submit" className="w-full h-16 bg-[#006c55] hover:bg-emerald-600 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all shadow-lg shadow-[#006c55]/20">
                                    Confirmar
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

export default PrinterStationsAdmin;
