import React, { useState, useEffect } from 'react';
import {
    Printer,
    Archive,
    Trash2,
    RefreshCw,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
    Download,
    Calendar,
    Edit2,
    Save,
    X,
    FileText,
    HardDrive,
    ArrowRightLeft
} from 'lucide-react';
import { collection, query, getDocs, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { ref, getMetadata } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { PrintRequest } from '../../types';
import { toast } from 'sonner';
import { PrinterService } from '../../modules/print/printer.service';

interface FileStatus {
    exists: boolean;
    size?: number;
    loading: boolean;
}

const PrintOrdersAdmin: React.FC = () => {
    const [orders, setOrders] = useState<PrintRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'printing' | 'ready' | 'cancelled'>('all');
    const [archivedFilter, setArchivedFilter] = useState<'all' | 'active' | 'archived'>('active');
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [stationFilter, setStationFilter] = useState<string>('all');
    const [stations, setStations] = useState<any[]>([]);
    const [editingOrder, setEditingOrder] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<PrintRequest>>({});
    const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>({});
    const [diagnosticMode, setDiagnosticMode] = useState(false);
    const [rawOrders, setRawOrders] = useState<any[]>([]);

    useEffect(() => {
        loadOrders();
        loadStations();
    }, []);

    const loadStations = async () => {
        try {
            const q = query(collection(db, 'printerStations'));
            const snapshot = await getDocs(q);
            const stationsData = snapshot.docs.map(doc => ({
                stationId: doc.id,
                ...doc.data()
            }));
            setStations(stationsData);
        } catch (error) {
            console.error('Error loading stations:', error);
        }
    };

    const loadOrders = async () => {
        setLoading(true);
        try {
            // Get ALL documents without any restrictions
            const allDocsSnapshot = await getDocs(collection(db, 'printRequests'));
            console.log('🔍 [ADMIN CRM] RAW TOTAL DOCUMENTS (no filters):', allDocsSnapshot.docs.length);

            const q = query(
                collection(db, 'printRequests'),
                orderBy('timestamp', 'desc')
            );

            const snapshot = await getDocs(q);
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PrintRequest));

            // Store raw data for diagnostics
            setRawOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Detailed diagnostic logging
            console.log('🔍 [ADMIN CRM] Total documents in printRequests:', snapshot.docs.length);
            console.log('🔍 [ADMIN CRM] Orders by status:', {
                pending: ordersData.filter(o => o.status === 'pending').length,
                printing: ordersData.filter(o => o.status === 'printing').length,
                ready: ordersData.filter(o => o.status === 'ready').length,
                cancelled: ordersData.filter(o => o.status === 'cancelled').length,
            });
            console.log('🔍 [ADMIN CRM] Orders by archived:', {
                archived: ordersData.filter(o => o.archived === true).length,
                active: ordersData.filter(o => !o.archived).length,
                undefined: ordersData.filter(o => o.archived === undefined).length,
            });
            console.log('🔍 [ADMIN CRM] Pending + Not Archived:',
                ordersData.filter(o => o.status === 'pending' && !o.archived).length
            );

            // Log station 9016 specifically
            const station9016 = ordersData.filter(o => o.stationId === '9016');
            console.log('🔍 [ADMIN CRM] Station 9016 orders:', station9016.length);
            console.log('🔍 [ADMIN CRM] Station 9016 pending:',
                station9016.filter(o => o.status === 'pending' && !o.archived).length
            );
            console.log('🔍 [ADMIN CRM] Station 9016 pending orders:',
                station9016.filter(o => o.status === 'pending' && !o.archived).map(o => ({
                    id: o.id,
                    fileName: o.fileName,
                    customerName: o.customerName,
                    customerId: o.customerId,
                    timestamp: o.timestamp,
                    date: new Date(o.timestamp).toLocaleString('pt-BR'),
                    archived: o.archived,
                    status: o.status
                }))
            );

            setOrders(ordersData);
            toast.success(`${ordersData.length} pedidos carregados`);

            // Check file statuses
            ordersData.forEach(order => checkFileStatus(order));
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    };

    const checkFileStatus = async (order: PrintRequest) => {
        if (!order.fileUrl) {
            setFileStatuses(prev => ({
                ...prev,
                [order.id]: { exists: false, loading: false }
            }));
            return;
        }

        setFileStatuses(prev => ({
            ...prev,
            [order.id]: { exists: false, loading: true }
        }));

        try {
            // Extract path from URL
            const url = new URL(order.fileUrl);
            const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
            if (!pathMatch) throw new Error('Invalid URL');

            const filePath = decodeURIComponent(pathMatch[1]);
            const fileRef = ref(storage, filePath);
            const metadata = await getMetadata(fileRef);

            setFileStatuses(prev => ({
                ...prev,
                [order.id]: {
                    exists: true,
                    size: metadata.size,
                    loading: false
                }
            }));
        } catch (error: any) {
            setFileStatuses(prev => ({
                ...prev,
                [order.id]: {
                    exists: false,
                    loading: false
                }
            }));
        }
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const filteredOrders = orders.filter(order => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (
                !order.fileName?.toLowerCase().includes(query) &&
                !order.customerName?.toLowerCase().includes(query) &&
                !order.id.toLowerCase().includes(query)
            ) {
                return false;
            }
        }

        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) {
            return false;
        }

        // Archived filter
        if (archivedFilter === 'active' && order.archived) {
            return false;
        }
        if (archivedFilter === 'archived' && !order.archived) {
            return false;
        }

        // Station filter
        if (stationFilter !== 'all' && order.stationId !== stationFilter) {
            return false;
        }

        return true;
    });

    const handleSelectAll = () => {
        if (selectedOrders.size === filteredOrders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
        }
    };

    const handleSelectOrder = (orderId: string) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrders(newSelected);
    };

    const startEditing = (order: PrintRequest) => {
        setEditingOrder(order.id);
        setEditForm({
            status: order.status,
            stationId: order.stationId,
            printerName: order.printerName,
            stationOwnerEmail: order.stationOwnerEmail,
            totalPrice: order.totalPrice,
            archived: order.archived
        });
    };

    const cancelEditing = () => {
        setEditingOrder(null);
        setEditForm({});
    };

    const saveEdit = async (orderId: string) => {
        try {
            await updateDoc(doc(db, 'printRequests', orderId), editForm);
            toast.success('Pedido atualizado!');
            setEditingOrder(null);
            setEditForm({});
            await loadOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Erro ao atualizar pedido');
        }
    };

    const reassignStation = async (orderId: string, newStationId: string) => {
        const station = stations.find(s => s.stationId === newStationId);
        if (!station) {
            toast.error('Gráfica não encontrada');
            return;
        }

        const confirm = window.confirm(
            `Reencaminhar pedido para "${station.name}"?`
        );

        if (!confirm) return;

        try {
            await updateDoc(doc(db, 'printRequests', orderId), {
                stationId: newStationId,
                printerName: station.name,
                stationOwnerEmail: station.ownerEmail
            });
            toast.success(`Pedido reencaminhado para ${station.name}!`);
            await loadOrders();
        } catch (error) {
            console.error('Error reassigning order:', error);
            toast.error('Erro ao reencaminhar pedido');
        }
    };

    const bulkArchive = async () => {
        if (selectedOrders.size === 0) {
            toast.error('Nenhum pedido selecionado');
            return;
        }

        const confirm = window.confirm(
            `Deseja arquivar ${selectedOrders.size} pedido(s) selecionado(s)?`
        );

        if (!confirm) return;

        try {
            const promises = Array.from(selectedOrders).map((orderId: string) =>
                updateDoc(doc(db, 'printRequests', orderId), { archived: true })
            );

            await Promise.all(promises);
            toast.success(`${selectedOrders.size} pedido(s) arquivado(s)`);
            setSelectedOrders(new Set());
            await loadOrders();
        } catch (error) {
            console.error('Error archiving orders:', error);
            toast.error('Erro ao arquivar pedidos');
        }
    };

    const bulkDelete = async () => {
        if (selectedOrders.size === 0) {
            toast.error('Nenhum pedido selecionado');
            return;
        }

        const confirm = window.confirm(
            `⚠️ ATENÇÃO: Deseja DELETAR permanentemente ${selectedOrders.size} pedido(s)?\n\nEsta ação não pode ser desfeita!`
        );

        if (!confirm) return;

        try {
            const promises = Array.from(selectedOrders).map((orderId: string) =>
                deleteDoc(doc(db, 'printRequests', orderId))
            );

            await Promise.all(promises);
            toast.success(`${selectedOrders.size} pedido(s) deletado(s)`);
            setSelectedOrders(new Set());
            await loadOrders();
        } catch (error) {
            console.error('Error deleting orders:', error);
            toast.error('Erro ao deletar pedidos');
        }
    };

    const archiveOldPendingOrders = async (daysOld: number = 7) => {
        const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        const oldOrders = orders.filter(
            o => o.status === 'pending' && !o.archived && o.timestamp < cutoffDate
        );

        if (oldOrders.length === 0) {
            toast.info('Nenhum pedido antigo encontrado');
            return;
        }

        const confirm = window.confirm(
            `Encontrados ${oldOrders.length} pedidos pendentes com mais de ${daysOld} dias.\n\nDeseja arquivá-los?`
        );

        if (!confirm) return;

        try {
            const promises = oldOrders.map(order =>
                updateDoc(doc(db, 'printRequests', order.id), { archived: true })
            );

            await Promise.all(promises);
            toast.success(`${oldOrders.length} pedidos antigos arquivados`);
            await loadOrders();
        } catch (error) {
            console.error('Error archiving old orders:', error);
            toast.error('Erro ao arquivar pedidos antigos');
        }
    };

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { icon: any, text: string, class: string }> = {
            pending: { icon: Clock, text: 'Pendente', class: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
            printing: { icon: RefreshCw, text: 'Imprimindo', class: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
            ready: { icon: CheckCircle2, text: 'Pronto', class: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
            cancelled: { icon: XCircle, text: 'Cancelado', class: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' }
        };

        const config = configs[status as keyof typeof configs] || configs.pending;
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-bold ${config.class}`}>
                <Icon size={12} />
                {config.text}
            </div>
        );
    };

    const getFileStatusBadge = (orderId: string) => {
        const status = fileStatuses[orderId];

        if (!status || status.loading) {
            return (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <RefreshCw size={12} className="animate-spin" />
                    Verificando...
                </div>
            );
        }

        if (status.exists) {
            return (
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                    <HardDrive size={12} />
                    {formatFileSize(status.size)}
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle size={12} />
                Deletado
            </div>
        );
    };

    const stats = {
        total: orders.filter(o => !o.archived && (stationFilter === "all" || o.stationId === stationFilter)).length,
        pending: orders.filter(o => !o.archived && (!o.status || o.status === "pending") && (stationFilter === "all" || o.stationId === stationFilter)).length,
        printing: orders.filter(o => !o.archived && o.status === "printing" && (stationFilter === "all" || o.stationId === stationFilter)).length,
        ready: orders.filter(o => !o.archived && o.status === "ready" && (stationFilter === "all" || o.stationId === stationFilter)).length,
        cancelled: orders.filter(o => !o.archived && o.status === "cancelled" && (stationFilter === "all" || o.stationId === stationFilter)).length
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Printer className="text-[#006c55]" />
                        Gerenciamento de Pedidos
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Controle total sobre todos os pedidos de impressão
                    </p>
                </div>
                <button
                    onClick={loadOrders}
                    disabled={loading}
                    className="px-4 py-2 bg-[#006c55] text-white rounded-lg font-bold hover:bg-[#005544] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Atualizar
                </button>
                <button
                    onClick={() => setDiagnosticMode(!diagnosticMode)}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${diagnosticMode
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                >
                    <AlertTriangle size={16} />
                    Modo Diagnóstico {diagnosticMode ? 'ON' : 'OFF'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md group">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 group-hover:text-slate-600 transition-colors">Ativos</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stats.total}</div>
                </div>
                <div className="bg-white dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md group">
                    <div className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.15em] mb-1 group-hover:text-amber-500 transition-colors">Pendentes</div>
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">{stats.pending}</div>
                </div>
                <div className="bg-white dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md group">
                    <div className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.15em] mb-1 group-hover:text-blue-500 transition-colors">Imprimindo</div>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">{stats.printing}</div>
                </div>
                <div className="bg-white dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md group">
                    <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.15em] mb-1 group-hover:text-emerald-500 transition-colors">Prontos</div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{stats.ready}</div>
                </div>
                <div className="bg-white dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md group">
                    <div className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.15em] mb-1 group-hover:text-red-500 transition-colors">Cancelados</div>
                    <div className="text-2xl font-black text-red-600 dark:text-red-400 leading-none">{stats.cancelled}</div>
                </div>
            </div>

            {/* Diagnostic Panel */}
            {diagnosticMode && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border-2 border-purple-300 dark:border-purple-700">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-purple-600" size={24} />
                        <h2 className="text-xl font-black text-purple-900 dark:text-purple-100">
                            Modo Diagnóstico Avançado
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                            <h3 className="text-sm font-black text-purple-900 dark:text-purple-100 mb-2">
                                📊 Estatísticas do Banco de Dados
                            </h3>
                            <div className="space-y-1 text-xs font-mono">
                                <div>Total de documentos: <span className="font-black text-purple-600">{rawOrders.length}</span></div>
                                <div>Pending: <span className="font-black">{rawOrders.filter((o: any) => o.status === 'pending').length}</span></div>
                                <div>Printing: <span className="font-black">{rawOrders.filter((o: any) => o.status === 'printing').length}</span></div>
                                <div>Ready: <span className="font-black">{rawOrders.filter((o: any) => o.status === 'ready').length}</span></div>
                                <div>Cancelled: <span className="font-black">{rawOrders.filter((o: any) => o.status === 'cancelled').length}</span></div>
                                <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
                                    Archived: <span className="font-black text-amber-600">{rawOrders.filter((o: any) => o.archived === true).length}</span>
                                </div>
                                <div>Not Archived: <span className="font-black text-emerald-600">{rawOrders.filter((o: any) => !o.archived).length}</span></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                            <h3 className="text-sm font-black text-purple-900 dark:text-purple-100 mb-2">
                                🖨️ Gráfica 9016 (Específico)
                            </h3>
                            <div className="space-y-1 text-xs font-mono">
                                <div>Total: <span className="font-black text-purple-600">{rawOrders.filter((o: any) => o.stationId === '9016').length}</span></div>
                                <div>Pending: <span className="font-black">{rawOrders.filter((o: any) => o.stationId === '9016' && o.status === 'pending').length}</span></div>
                                <div>Pending + Not Archived: <span className="font-black text-red-600">
                                    {rawOrders.filter((o: any) => o.stationId === '9016' && o.status === 'pending' && !o.archived).length}
                                </span></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <h3 className="text-sm font-black text-purple-900 dark:text-purple-100 mb-3">
                            🔍 Pedidos Pendentes da Gráfica 9016 (RAW)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-purple-100 dark:bg-purple-900/30">
                                    <tr>
                                        <th className="px-2 py-1 text-left font-black">ID</th>
                                        <th className="px-2 py-1 text-left font-black">Arquivo</th>
                                        <th className="px-2 py-1 text-left font-black">Cliente</th>
                                        <th className="px-2 py-1 text-left font-black">Customer ID</th>
                                        <th className="px-2 py-1 text-left font-black">Data</th>
                                        <th className="px-2 py-1 text-left font-black">Status</th>
                                        <th className="px-2 py-1 text-left font-black">Archived</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100 dark:divide-purple-900/30">
                                    {rawOrders
                                        .filter((o: any) => o.stationId === '9016' && o.status === 'pending' && !o.archived)
                                        .map((o: any) => (
                                            <tr key={o.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/10">
                                                <td className="px-2 py-1 font-mono text-[10px]">{o.id.substring(0, 8)}...</td>
                                                <td className="px-2 py-1 font-bold">{o.fileName || 'N/A'}</td>
                                                <td className="px-2 py-1">{o.customerName || 'N/A'}</td>
                                                <td className="px-2 py-1 font-mono text-[10px]">{o.customerId?.substring(0, 8) || 'N/A'}...</td>
                                                <td className="px-2 py-1">{o.timestamp ? new Date(o.timestamp).toLocaleString('pt-BR') : 'N/A'}</td>
                                                <td className="px-2 py-1">
                                                    <span className="px-1 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1">
                                                    <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${o.archived
                                                        ? 'bg-slate-100 text-slate-600'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        {o.archived ? 'SIM' : 'NÃO'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                        <p className="text-xs font-bold text-yellow-800 dark:text-yellow-200">
                            💡 <strong>Dica:</strong> Verifique o console do navegador (F12) para logs detalhados.
                            Os pedidos acima são os que estão causando a fila mostrar 6 posições.
                        </p>
                    </div>
                </div>
            )}

            {/* Filters and Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-4">
                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006c55] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por arquivo, cliente ou ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all placeholder:text-slate-400 text-sm font-medium"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="pending">Pendentes</option>
                        <option value="printing">Imprimindo</option>
                        <option value="ready">Prontos</option>
                        <option value="cancelled">Cancelados</option>
                    </select>

                    <select
                        value={archivedFilter}
                        onChange={(e) => setArchivedFilter(e.target.value as any)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
                    >
                        <option value="active">Ativos</option>
                        <option value="archived">Cancelados</option>
                        <option value="all">Todos</option>
                    </select>

                    <select
                        value={stationFilter}
                        onChange={(e) => setStationFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
                    >
                        <option value="all">Todas as Gráficas</option>
                        {stations.map(station => (
                            <option key={station.stationId} value={station.stationId}>
                                {station.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Bulk Actions */}
                <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleSelectAll}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        {selectedOrders.size === filteredOrders.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </button>

                    <button
                        onClick={bulkArchive}
                        disabled={selectedOrders.size === 0}
                        className="px-3 py-2 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-bold hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <Archive size={16} />
                        Arquivar ({selectedOrders.size})
                    </button>

                    <button
                        onClick={bulkDelete}
                        disabled={selectedOrders.size === 0}
                        className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Deletar ({selectedOrders.size})
                    </button>

                    <button
                        onClick={() => archiveOldPendingOrders(7)}
                        className="px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-bold hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2"
                    >
                        <Calendar size={16} />
                        Limpar Antigos (7+ dias)
                    </button>
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-500 dark:text-slate-400">
                Mostrando {filteredOrders.length} de {orders.length} pedidos
                {selectedOrders.size > 0 && ` • ${selectedOrders.size} selecionado(s)`}
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Arquivo</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tamanho</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Gráfica</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Data</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Preço</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                                        <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                                        Carregando...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                                        Nenhum pedido encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr
                                        key={order.id}
                                        className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${order.archived ? 'opacity-60' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.has(order.id)}
                                                onChange={() => handleSelectOrder(order.id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-400">
                                            {order.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">
                                            {order.fileName}
                                            {order.archived && (
                                                <span className="ml-2 text-xs text-slate-500">(Arquivado)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getFileStatusBadge(order.id)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                            {order.customerName}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingOrder === order.id ? (
                                                <select
                                                    value={editForm.stationId}
                                                    onChange={(e) => {
                                                        const selectedStation = stations.find(s => s.stationId === e.target.value);
                                                        setEditForm({ 
                                                            ...editForm, 
                                                            stationId: e.target.value,
                                                            printerName: selectedStation?.name || '',
                                                            stationOwnerEmail: selectedStation?.ownerEmail || ''
                                                        });
                                                    }}
                                                    className="px-2 py-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                                                >
                                                    {stations.map(station => (
                                                        <option key={station.stationId} value={station.stationId}>
                                                            {station.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                                    {order.printerName || `ID: ${order.stationId}`}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingOrder === order.id ? (
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                                                    className="px-2 py-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                                                >
                                                    <option value="pending">Pendente</option>
                                                    <option value="printing">Imprimindo</option>
                                                    <option value="ready">Pronto</option>
                                                    <option value="cancelled">Cancelado</option>
                                                </select>
                                            ) : (
                                                getStatusBadge(order.status)
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(order.timestamp).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingOrder === order.id ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editForm.totalPrice}
                                                    onChange={(e) => setEditForm({ ...editForm, totalPrice: parseFloat(e.target.value) })}
                                                    className="w-20 px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                                                />
                                            ) : (
                                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                                    R$ {order.totalPrice?.toFixed(2)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                {editingOrder === order.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => saveEdit(order.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Salvar">
                                                            <Save size={16} />
                                                        </button>
                                                        <button onClick={cancelEditing} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors" title="Cancelar">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEditing(order)}
                                                            className="p-1.5 text-slate-400 hover:text-[#006c55] hover:bg-emerald-50 dark:hover:bg-[#006c55]/10 rounded-lg transition-all"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm('Deseja deletar permanentemente este pedido?')) {
                                                                    try {
                                                                        await deleteDoc(doc(db, 'printRequests', order.id));
                                                                        toast.success('Pedido deletado');
                                                                        await loadOrders();
                                                                    } catch (e) {
                                                                        toast.error('Erro ao deletar');
                                                                    }
                                                                }
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                            title="Deletar"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">
                            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                            <p className="text-xs font-bold uppercase">Carregando...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <p className="text-xs font-bold uppercase">Nenhum pedido encontrado</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className={`p-4 space-y-3 ${order.archived ? 'opacity-60 bg-slate-50/50' : 'bg-white dark:bg-slate-800/20'}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.has(order.id)}
                                            onChange={() => handleSelectOrder(order.id)}
                                            className="mt-1 rounded border-slate-200"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{order.fileName}</h4>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{order.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-slate-900 dark:text-white leading-none">R$ {order.totalPrice?.toFixed(2)}</div>
                                        <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase">{new Date(order.timestamp).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(order.status)}
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[120px]">
                                            {order.printerName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => startEditing(order)}
                                            className="p-2 text-slate-400 hover:text-[#006c55] hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(window.confirm('Deletar este pedido?')) deleteDoc(doc(db, 'printRequests', order.id)).then(() => loadOrders());
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrintOrdersAdmin;
