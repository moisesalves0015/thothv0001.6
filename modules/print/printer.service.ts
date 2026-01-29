
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    query,
    where,
    getDocs,
    onSnapshot,
    Unsubscribe,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';

export interface ServiceItem {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    pricePerPage: number;
    colorPrice: number;
    type: 'document' | 'photo' | 'poster' | 'banner' | 'other';
    minPages: number;
    maxPages: number;
    turnaroundTime: number; // hours
    isActive: boolean;
}

export interface PrinterStation {
    id: string;
    name: string;
    stationId: string;
    accessCode: string;
    ownerEmail: string;
    commissionRate: number;
    phoneNumber: string;
    address: string;
    managerName: string;
    status: 'active' | 'inactive';
    isOpen: boolean; // Status de aberta/fechada
    prices: { pb: number; color: number }; // Preços por página
    services?: ServiceItem[];
    workingHours: string; // Ex: "08:00 - 18:00"
    discounts: { active: boolean; percentage: number };
    lastSeen?: any;
    createdAt: any;
}

export class PrinterService {
    private static collectionName = 'printerStations';

    static async registerStation(data: Omit<PrinterStation, 'id' | 'createdAt' | 'status' | 'isOpen' | 'prices' | 'workingHours' | 'discounts'>) {
        return addDoc(collection(db, this.collectionName), {
            ...data,
            ownerEmail: data.ownerEmail.trim().toLowerCase(),
            commissionRate: Number(data.commissionRate) || 0,
            status: 'active',
            isOpen: true,
            prices: { pb: 0.15, color: 1.00 }, // Default prices
            workingHours: '08:00 - 18:00',
            discounts: { active: false, percentage: 0 },
            createdAt: serverTimestamp()
        });
    }

    static async updateStation(id: string, data: Partial<PrinterStation>) {
        return updateDoc(doc(db, this.collectionName, id), {
            ...data,
            updatedAt: serverTimestamp()
        });
    }

    static async deleteStation(id: string) {
        return deleteDoc(doc(db, this.collectionName, id));
    }

    /**
     * Verifica se o usuário tem alguma impressora vinculada pelo email.
     */
    static async checkUserPrinterAccess(email: string): Promise<boolean> {
        if (!email) return false;
        const q = query(
            collection(db, this.collectionName),
            where('ownerEmail', '==', email.trim().toLowerCase()),
            where('status', '==', 'active')
        );
        const snap = await getDocs(q);
        return !snap.empty;
    }

    static subscribeToStations(callback: (stations: PrinterStation[]) => void): Unsubscribe {
        const q = query(collection(db, this.collectionName), where('status', '==', 'active'));
        return onSnapshot(q, (snapshot) => {
            const stations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PrinterStation));
            callback(stations);
        });
    }

    static async validateCredentials(stationId: string, accessCode: string): Promise<PrinterStation | null> {
        const q = query(
            collection(db, this.collectionName),
            where('stationId', '==', stationId.trim()),
            where('accessCode', '==', accessCode.trim()),
            where('status', '==', 'active')
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as PrinterStation;
        }
        return null;
    }
}
