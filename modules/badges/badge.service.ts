
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

interface CreateBadgeData {
  name: string;
  description: string;
  category: string;
  visibility: string;
  imageUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
  creatorId: string;
  totalPaid: number;
  paymentInfo: string;
}

export class BadgeService {
  /**
   * Processamento de imagem Center-Crop via Canvas
   */
  static async processImage(base64: string, w: number, h: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!base64) return resolve("");
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const res = 512;
        canvas.width = w * res;
        canvas.height = h * res;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64);

        const targetRatio = canvas.width / canvas.height;
        const sourceRatio = img.width / img.height;
        let sw, sh, sx, sy;

        if (sourceRatio > targetRatio) {
          sh = img.height; sw = img.height * targetRatio;
          sx = (img.width - sw) / 2; sy = 0;
        } else {
          sw = img.width; sh = img.width / targetRatio;
          sx = 0; sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.85));
      };
      img.onerror = () => reject(new Error("Erro ao processar imagem"));
    });
  }

  /**
   * Persistência de novo emblema
   */
  static async createBadge(data: CreateBadgeData) {
    const finalImage = await this.processImage(data.imageUrl, data.width, data.height);
    return addDoc(collection(db, 'badges'), {
      ...data,
      imageUrl: finalImage,
      createdAt: serverTimestamp()
    });
  }

  /**
   * Atualização de posição no mural
   */
  static async updatePosition(id: string, x: number, y: number) {
    return updateDoc(doc(db, 'badges', id), { x, y });
  }
}
