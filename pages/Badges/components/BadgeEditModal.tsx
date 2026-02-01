import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Badge } from '../../../types';
import { X, Save, Loader2 } from 'lucide-react';

interface BadgeEditModalProps {
    badge: Badge;
    onClose: () => void;
}

const BadgeEditModal: React.FC<BadgeEditModalProps> = ({ badge, onClose }) => {
    const [name, setName] = useState(badge.name);
    const [isPublic, setIsPublic] = useState(badge.isPublic ?? true);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Por favor, dê um nome ao emblema');
            return;
        }

        if (name.length < 3 || name.length > 30) {
            alert('O nome deve ter entre 3 e 30 caracteres');
            return;
        }

        setSaving(true);

        try {
            await updateDoc(doc(db, 'badges', badge.id), {
                name: name.trim(),
                isPublic
            });

            onClose();
        } catch (error) {
            console.error('[BadgeEditModal] Error updating badge:', error);
            alert('Erro ao atualizar emblema');
        } finally {
            setSaving(false);
        }
    };

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-slate-200 dark:border-white/5">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        Editar Emblema
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Preview */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <img
                            src={badge.imageUrl}
                            alt={badge.name}
                            className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Tamanho: {badge.width}x{badge.height}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                A imagem não pode ser alterada
                            </p>
                        </div>
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
                            maxLength={30}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#006c55] dark:focus:ring-emerald-400 transition-all"
                        />
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {name.length}/30 caracteres
                        </p>
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
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-white/5 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className={`
              flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all
              ${saving || !name.trim()
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#006c55] to-[#00876a] dark:from-emerald-500 dark:to-emerald-600 text-white hover:from-[#005a46] hover:to-[#007a62] dark:hover:from-emerald-600 dark:hover:to-emerald-700 active:scale-95'
                            }
            `}
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Salvar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BadgeEditModal;
