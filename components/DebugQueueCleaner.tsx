import React, { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Archive, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DebugQueueCleanerProps {
    stationId: string;
}

const DebugQueueCleaner: React.FC<DebugQueueCleanerProps> = ({ stationId }) => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);

    const loadPendingOrders = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'printRequests'),
                where('stationId', '==', stationId),
                where('status', '==', 'pending'),
                where('archived', '==', false)
            );

            const snapshot = await getDocs(q);
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setOrders(ordersData);
            console.log('📋 Pedidos pendentes encontrados:', ordersData);
            toast.success(`${ordersData.length} pedidos pendentes encontrados`);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            toast.error('Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    };

    const archiveOrder = async (orderId: string) => {
        try {
            await updateDoc(doc(db, 'printRequests', orderId), {
                archived: true
            });
            toast.success('Pedido arquivado!');
            await loadPendingOrders(); // Reload
        } catch (error) {
            console.error('Erro ao arquivar:', error);
            toast.error('Erro ao arquivar pedido');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 max-w-md">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    🔧 Debug: Limpeza de Fila
                </h3>
                <button
                    onClick={loadPendingOrders}
                    disabled={loading}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Gráfica: {stationId}
            </p>

            {orders.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                    Clique em atualizar para ver pedidos pendentes
                </p>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {orders.map((order: any) => (
                        <div
                            key={order.id}
                            className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {order.fileName || 'Sem nome'}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {order.customerName || 'Cliente desconhecido'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {new Date(order.timestamp).toLocaleString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-slate-400 font-mono">
                                        ID: {order.id.substring(0, 8)}...
                                    </p>
                                </div>
                                <button
                                    onClick={() => archiveOrder(order.id)}
                                    className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors flex-shrink-0"
                                    title="Arquivar"
                                >
                                    <Archive size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400">
                    Total: {orders.length} pedidos pendentes
                </p>
            </div>
        </div>
    );
};

export default DebugQueueCleaner;
