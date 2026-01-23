import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export class StorageService {
    /**
     * Faz upload de um arquivo para o Firebase Storage.
     * @param path Caminho no bucket (ex: 'avatars/uid.png')
     * @param file O arquivo (File ou Blob)
     * @returns URL de download pública
     */
    static async uploadFile(path: string, file: File | Blob): Promise<string> {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    }
}
