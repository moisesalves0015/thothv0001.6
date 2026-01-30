/**
 * Script utilitário para limpar pedidos antigos pendentes
 * 
 * COMO USAR:
 * 1. Abra o console do navegador (F12)
 * 2. Copie e cole este código
 * 3. Execute: await cleanOldPendingOrders('9016', 7) // arquiva pedidos com mais de 7 dias
 * 
 * OU para ver quais pedidos seriam arquivados sem fazer nada:
 * 4. Execute: await listOldPendingOrders('9016', 7)
 */

import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Lista pedidos pendentes antigos sem arquivá-los
 */
export async function listOldPendingOrders(stationId: string, daysOld: number = 7) {
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    const q = query(
        collection(db, 'printRequests'),
        where('stationId', '==', stationId),
        where('status', '==', 'pending'),
        where('archived', '==', false)
    );

    const snapshot = await getDocs(q);
    const oldOrders = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((order: any) => order.timestamp < cutoffDate);

    console.log(`📋 Pedidos pendentes com mais de ${daysOld} dias:`, oldOrders.length);
    oldOrders.forEach((order: any) => {
        const date = new Date(order.timestamp);
        const daysAgo = Math.floor((Date.now() - order.timestamp) / (24 * 60 * 60 * 1000));
        console.log(`  - ${order.id}: ${order.fileName} (${order.customerName}) - ${daysAgo} dias atrás (${date.toLocaleString('pt-BR')})`);
    });

    return oldOrders;
}

/**
 * Arquiva pedidos pendentes antigos
 */
export async function cleanOldPendingOrders(stationId: string, daysOld: number = 7) {
    const oldOrders = await listOldPendingOrders(stationId, daysOld);

    if (oldOrders.length === 0) {
        console.log('✅ Nenhum pedido antigo encontrado!');
        return;
    }

    const confirm = window.confirm(
        `Deseja arquivar ${oldOrders.length} pedidos pendentes com mais de ${daysOld} dias?\n\n` +
        'Isso vai removê-los da fila, mas eles ainda estarão disponíveis na aba "Arquivados".'
    );

    if (!confirm) {
        console.log('❌ Operação cancelada');
        return;
    }

    console.log(`🔄 Arquivando ${oldOrders.length} pedidos...`);

    for (const order of oldOrders) {
        await updateDoc(doc(db, 'printRequests', order.id), {
            archived: true
        });
        console.log(`  ✓ Arquivado: ${order.id}`);
    }

    console.log('✅ Limpeza concluída!');
}

/**
 * Arquiva TODOS os pedidos pendentes de uma estação (use com cuidado!)
 */
export async function archiveAllPendingOrders(stationId: string) {
    const q = query(
        collection(db, 'printRequests'),
        where('stationId', '==', stationId),
        where('status', '==', 'pending'),
        where('archived', '==', false)
    );

    const snapshot = await getDocs(q);

    const confirm = window.confirm(
        `⚠️ ATENÇÃO: Deseja arquivar TODOS os ${snapshot.size} pedidos pendentes da estação ${stationId}?\n\n` +
        'Esta ação é útil para limpar pedidos de teste, mas use com cuidado em produção!'
    );

    if (!confirm) {
        console.log('❌ Operação cancelada');
        return;
    }

    console.log(`🔄 Arquivando ${snapshot.size} pedidos...`);

    for (const docSnap of snapshot.docs) {
        await updateDoc(doc(db, 'printRequests', docSnap.id), {
            archived: true
        });
        console.log(`  ✓ Arquivado: ${docSnap.id}`);
    }

    console.log('✅ Todos os pedidos foram arquivados!');
}
