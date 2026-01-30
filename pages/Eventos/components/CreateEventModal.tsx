import React, { useState } from 'react';
import { X, Calendar, MapPin, Type, FileText, Image as ImageIcon, Users, Sparkles, Check, ChevronRight } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth, storage } from '../../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ThothEvent } from '../../../types';
import { toast } from 'sonner';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (eventId?: string) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'workshop' as ThothEvent['type'],
        date: '',
        time: '',
        location: '',
        maxParticipants: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        // Validation
        if (!formData.date || !formData.time) {
            toast.error('Por favor, selecione a data e o horário do evento.');
            return;
        }

        console.log('CURRENT USER:', auth.currentUser);
        console.log('AUTH STATE:', auth.currentUser ? 'Authenticated' : 'Not Authenticated');

        setLoading(true);
        try {
            const dateString = `${formData.date}T${formData.time}`;
            const eventDate = new Date(dateString);

            if (isNaN(eventDate.getTime())) {
                throw new Error('Data inválida');
            }

            let imageUrl = '';

            if (imageFile) {
                const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const docRef = await addDoc(collection(db, 'events'), {
                title: formData.title,
                description: '', // Legacy support or empty
                imageUrl: imageUrl,
                type: formData.type,
                date: eventDate,
                location: formData.location,
                creatorId: auth.currentUser.uid, // Correcting logical error in line 64 reference in thought
                participants: [auth.currentUser.uid],
                interested: [],
                invited: [],
                maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
                createdAt: serverTimestamp()
            });

            toast.success('Evento criado com sucesso!');
            onCreated(docRef.id);
            onClose();
        } catch (error) {
            console.error(error);
            if (error instanceof Error && error.message === 'Data inválida') {
                toast.error('A data ou horário selecionados são inválidos.');
            } else {
                toast.error('Erro ao criar evento.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-3xl rounded-[40px] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">

                {/* Modern Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                Criar Evento
                            </h2>
                            <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest opacity-60">
                                Novo Encontro
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content - Organized Grid */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                    {/* Section 1: Visual Identity */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 flex items-center gap-2">
                            <ImageIcon size={14} /> Identidade Visual
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr] gap-6">
                            <div className="space-y-4">
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10 pointer-events-none">
                                        <Type size={20} />
                                    </div>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Nome do Evento"
                                        className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/20 hover:border-emerald-500/10 rounded-2xl pl-12 pr-6 py-4 text-base font-bold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                                        style={{ fontSize: '16px' }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {(['workshop', 'palestra', 'social', 'estudo'] as const).map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center ${formData.type === type
                                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                                : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 hover:border-emerald-500/30'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group h-full min-h-[140px]">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="event-image-upload"
                                />
                                <label
                                    htmlFor="event-image-upload"
                                    className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all overflow-hidden"
                                >
                                    {imagePreview ? (
                                        <div className="relative w-full h-full">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <p className="text-white text-xs font-bold uppercase tracking-wider">Alterar Capa</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            <div className="p-3 bg-white dark:bg-white/5 rounded-full shadow-sm">
                                                <ImageIcon size={24} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest">Adicionar Capa</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/5" />

                    {/* Section 2: Logistics */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 flex items-center gap-2">
                            <Calendar size={14} /> Detalhes Logísticos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                                    <Calendar size={20} />
                                </div>
                                <input
                                    required
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/20 hover:border-emerald-500/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white font-bold outline-none transition-all"
                                    style={{ fontSize: '16px' }}
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                                    <ClockIcon />
                                </div>
                                <input
                                    required
                                    type="time"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/20 hover:border-emerald-500/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white font-bold outline-none transition-all"
                                    style={{ fontSize: '16px' }}
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                                    <MapPin size={20} />
                                </div>
                                <input
                                    required
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Localização (Ex: Sala 302)"
                                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/20 hover:border-emerald-500/10 rounded-2xl pl-12 pr-6 py-4 text-slate-900 dark:text-white font-bold outline-none transition-all placeholder:text-slate-400"
                                    style={{ fontSize: '16px' }}
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                                    <Users size={20} />
                                </div>
                                <input
                                    type="number"
                                    value={formData.maxParticipants}
                                    onChange={e => setFormData({ ...formData, maxParticipants: e.target.value })}
                                    placeholder="Máx. Participantes (Op)"
                                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/20 hover:border-emerald-500/10 rounded-2xl pl-12 pr-6 py-4 text-slate-900 dark:text-white font-bold outline-none transition-all placeholder:text-slate-400"
                                    style={{ fontSize: '16px' }}
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-4 bg-slate-50 dark:bg-white/[0.02]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-4 bg-[#006c55] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#006c55]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Criar Evento <ChevronRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-clock">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);


export default CreateEventModal;
