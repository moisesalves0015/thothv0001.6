
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
    return addDoc(collection(db, this.collectionName), {
      ...data,
      customerName: auth.currentUser?.displayName || 'Usuário Thoth',
      customerId: auth.currentUser?.uid || 'anonymous',
      timestamp: Date.now(),
      status: 'pending',
      archived: false,
      pickupCode: Math.floor(1000 + Math.random() * 9000).toString()
    });
  }

  /**
   * Assina os pedidos de uma gráfica específica (para o Dashboard)
   */
  static subscribeToShopOrders(stationId: string, ownerEmail: string, callback: (requests: PrintRequest[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.collectionName),
      where('stationId', '==', stationId),
      where('stationOwnerEmail', '==', ownerEmail.trim().toLowerCase()),
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

  static async toggleArchive(id: string, archived: boolean) {
    return updateDoc(doc(db, this.collectionName, id), { archived });
  }

  static async deleteRequest(id: string) {
    return deleteDoc(doc(db, this.collectionName, id));
  }
}
