import React, { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Upload, Image as ImageIcon, Loader2, Check, X } from 'lucide-react';

const CreateBadgeTab: React.FC = () => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState('');
    const [width, setWidth] = useState(2);
    const [height, setHeight] = useState(2);
    const [isPublic, setIsPublic] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Imagem muito grande! Máximo 2MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Apenas imagens são permitidas');
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCreate = async () => {
        if (!user || !imageFile) {
            alert('Por favor, selecione uma imagem');
            return;
        }

        if (!name.trim()) {
            alert('Por favor, dê um nome ao emblema');
            return;
        }

        if (name.length < 3 || name.length > 30) {
            alert('O nome deve ter entre 3 e 30 caracteres');
            return;
        }

        setUploading(true);

        try {
            // Upload image to Firebase Storage
            const storageRef = ref(storage, `badges/${user.uid}/${Date.now()}_${imageFile.name}`);
            await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(storageRef);

            // Create badge document
            await addDoc(collection(db, 'badges'), {
                name: name.trim(),
                imageUrl,
                width,
                height,
                creatorId: user.uid,
                creatorName: user.displayName || 'Usuário',
                creatorAvatar: user.photoURL || '',
                createdAt: serverTimestamp(),
                isPublic,
                usageCount: 0,
                tags: []
            });

            // Success!
            setSuccess(true);
            setTimeout(() => {
                // Reset form
                setName('');
                setWidth(2);
                setHeight(2);
                setIsPublic(true);
                setImageFile(null);
                setImagePreview('');
                setSuccess(false);
            }, 2000);
        } catch (error) {
            console.error('[CreateBadgeTab] Error creating badge:', error);
            alert('Erro ao criar emblema. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const sizes = [1, 2, 3, 4];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                    {/* Form */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                                Criar Novo Emblema
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Personalize seu perfil com emblemas únicos
                            </p>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Nome do Emblema
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Campeão de Matemática"
                                maxLength={30}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#006c55] dark:focus:ring-emerald-400 transition-all"
                            />
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                {name.length}/30 caracteres
                            </p>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Imagem
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full px-4 py-8 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl hover:border-[#006c55] dark:hover:border-emerald-400 transition-all flex flex-col items-center justify-center gap-3"
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl" />
                                        <p className="text-sm font-bold text-[#006c55] dark:text-emerald-400">
                                            Clique para trocar
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={32} className="text-slate-400 dark:text-slate-500" />
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                Clique para fazer upload
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                PNG, JPG ou GIF (máx. 2MB)
                                            </p>
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Size */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                                Tamanho
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">
                                        Largura
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {sizes.map((size) => (
                                            <button
                                                key={`w-${size}`}
                                                onClick={() => setWidth(size)}
                                                className={`
                          flex-1 px-3 py-2 rounded-lg font-bold text-sm transition-all
                          ${width === size
                                                        ? 'bg-[#006c55] dark:bg-emerald-500 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                    }
                        `}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">
                                        Altura
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {sizes.map((size) => (
                                            <button
                                                key={`h-${size}`}
                                                onClick={() => setHeight(size)}
                                                className={`
                          flex-1 px-3 py-2 rounded-lg font-bold text-sm transition-all
                          ${height === size
                                                        ? 'bg-[#006c55] dark:bg-emerald-500 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                    }
                        `}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Public Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Emblema Público
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Outros usuários podem salvar e usar
                                </p>
                            </div>
                            <button
                                onClick={() => setIsPublic(!isPublic)}
                                className={`
                  relative w-14 h-8 rounded-full transition-all
                  ${isPublic ? 'bg-[#006c55] dark:bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}
                `}
                            >
                                <div
                                    className={`
                    absolute top-1 w-6 h-6 bg-white rounded-full transition-all
                    ${isPublic ? 'left-7' : 'left-1'}
                  `}
                                />
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleCreate}
                            disabled={uploading || !imageFile || !name.trim()}
                            className={`
                w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all
                ${uploading || !imageFile || !name.trim()
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                    : success
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gradient-to-r from-[#006c55] to-[#00876a] dark:from-emerald-500 dark:to-emerald-600 text-white hover:from-[#005a46] hover:to-[#007a62] dark:hover:from-emerald-600 dark:hover:to-emerald-700 active:scale-95'
                                }
              `}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Criando...
                                </>
                            ) : success ? (
                                <>
                                    <Check size={20} />
                                    Emblema Criado!
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={20} />
                                    Criar Emblema
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-full max-w-sm">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 text-center">
                                Preview
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
                                <div
                                    className="grid gap-2 mx-auto"
                                    style={{
                                        gridTemplateColumns: `repeat(4, 1fr)`,
                                        gridTemplateRows: `repeat(4, 1fr)`,
                                        width: '240px',
                                        height: '240px'
                                    }}
                                >
                                    {/* Grid cells */}
                                    {Array.from({ length: 16 }).map((_, i) => {
                                        const col = i % 4;
                                        const row = Math.floor(i / 4);
                                        const isInBadge = col < width && row < height;

                                        return (
                                            <div
                                                key={i}
                                                className={`
                          rounded-lg transition-all
                          ${isInBadge
                                                        ? 'bg-gradient-to-br from-[#006c55] to-[#00876a] dark:from-emerald-500 dark:to-emerald-600'
                                                        : 'bg-slate-200 dark:bg-slate-700'
                                                    }
                        `}
                                                style={{
                                                    backgroundImage: isInBadge && imagePreview ? `url(${imagePreview})` : undefined,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {name || 'Nome do Emblema'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Tamanho: {width}x{height}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBadgeTab;
