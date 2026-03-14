
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../firebase';
import { PrintRequest } from '../../types';

export class PrintService {
  private static collectionName = 'printRequests';

  static async uploadFile(file: File): Promise<string> {
    const fileRef = ref(storage, `print-files/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    return getDownloadURL(snapshot.ref);
  }

  static async createRequest(data: Partial<PrintRequest>) {
    const payload = {
      ...data,
      customerName: auth.currentUser?.displayName || 'Usuário Thoth',
      customerId: auth.currentUser?.uid || 'anonymous',
      timestamp: Date.now(),
      status: 'pending' as const,
      archived: false,
      pickupCode: Math.floor(1000 + Math.random() * 9000).toString()
    };
    
    // Deep strip any invalid Firestore types (undefined, NaN, Proxy, Functions) before network call
    const cleanPayload = JSON.parse(JSON.stringify(payload));
    
    console.log('[PrintService] Sending clean payload to Firestore:', cleanPayload);
    
    return addDoc(collection(db, this.collectionName), cleanPayload);
  }

  /**
   * Assina os pedidos de uma gráfica específica (para o Dashboard)
   */
  static subscribeToShopOrders(stationId: string, ownerEmail: string, isAdmin: boolean, callback: (requests: PrintRequest[]) => void): Unsubscribe {
    const constraints: any[] = [
      where('stationId', '==', stationId),
      // orderBy('timestamp', 'desc'), // Removido temporariamente para depuração de índice
      limit(100)
    ];

    // Se NÃO for admin, aplica o filtro de email do proprietário
    if (!isAdmin) {
      constraints.push(where('stationOwnerEmail', '==', ownerEmail.trim().toLowerCase()));
    }

    const q = query(collection(db, this.collectionName), ...constraints);

    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrintRequest));
      callback(requests);
    });
  }

  static subscribeToRequests(callback: (requests: PrintRequest[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collectionName),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrintRequest));
      callback(requests);
    });
  }

  static subscribeToUserRequests(userId: string, callback: (requests: PrintRequest[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collectionName),
      where('customerId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrintRequest));
      callback(requests);
    });
  }

  static async updateStatus(id: string, status: PrintRequest['status']) {
    return updateDoc(doc(db, this.collectionName, id), { status });
  }

  static async updateRequest(id: string, data: Partial<PrintRequest>) {
    return updateDoc(doc(db, this.collectionName, id), data);
  }

  static async toggleArchive(id: string, archived: boolean) {
    return updateDoc(doc(db, this.collectionName, id), { archived });
  }

  static async deleteRequest(id: string) {
    return deleteDoc(doc(db, this.collectionName, id));
  }

  /**
   * Calcula a posição de um pedido na fila de uma gráfica específica
   */
  static calculateQueuePosition(requests: PrintRequest[], currentRequest: PrintRequest): number {
    const queueRequests = requests
      .filter(r =>
        r.stationId === currentRequest.stationId &&
        r.status === 'pending' &&
        !r.archived
      )
      .sort((a, b) => {
        // Urgent orders come first
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        // Within same priority, sort by timestamp (oldest first)
        return a.timestamp - b.timestamp;
      });

    console.log(`[PrintService] Calculating queue for order ${currentRequest.id}:`, {
      stationId: currentRequest.stationId,
      totalRequests: requests.length,
      filteredRequests: queueRequests.length,
      currentStatus: currentRequest.status,
      currentArchived: currentRequest.archived,
      currentPriority: currentRequest.priority,
      queueDetails: queueRequests.map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        date: new Date(r.timestamp).toLocaleString('pt-BR'),
        customerId: r.customerId,
        customerName: r.customerName,
        fileName: r.fileName,
        status: r.status,
        archived: r.archived,
        priority: r.priority
      }))
    });

    const position = queueRequests.findIndex(r => r.id === currentRequest.id);
    return position >= 0 ? position + 1 : 0;
  }

  /**
   * Assina todos os pedidos pendentes de uma gráfica específica (para calcular posição na fila)
   */
  static subscribeToStationPendingRequests(stationId: string, callback: (requests: PrintRequest[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collectionName),
      where('stationId', '==', stationId),
      where('status', '==', 'pending'),
      where('archived', '==', false),
      orderBy('timestamp', 'asc')
    );

    // Add options to detect cache vs server data
    return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrintRequest));

      console.log(`🔍 [PrintService] subscribeToStationPendingRequests for ${stationId}:`, {
        totalDocs: snapshot.docs.length,
        fromCache: snapshot.metadata.fromCache,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
        docIds: snapshot.docs.map(d => d.id),
        archivedValues: snapshot.docs.map(d => ({
          id: d.id,
          archived: d.data().archived,
          archivedType: typeof d.data().archived,
          hasArchivedField: d.data().hasOwnProperty('archived'),
          fromCache: d.metadata.fromCache
        }))
      });

      // Only call callback with server data, ignore cache-only updates
      if (!snapshot.metadata.fromCache) {
        console.log(`✅ [PrintService] Using SERVER data for station ${stationId}`);
        callback(requests);
      } else {
        console.log(`⚠️ [PrintService] Ignoring CACHE data for station ${stationId}, waiting for server...`);
      }
    });
  }
}
