import React, { useState } from 'react';
import { Award, Search, CheckCircle2, Send, X, User } from 'lucide-react';
import { ThothEvent } from '../../../types';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { toast } from 'sonner';

interface CertificateIssuerProps {
    event: ThothEvent;
    isOpen: boolean;
    onClose: () => void;
}

// Mock type for user fetching - in real app would fetch from 'users' collection
interface Participant {
    uid: string;
    name?: string;
    email?: string;
    photoURL?: string;
}

const CertificateIssuer: React.FC<CertificateIssuerProps> = ({ event, isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // In a real implementation, we would fetch the user details for each participant ID.
    // For now, we simulate this or just use IDs.
    // Since we don't have a 'getUsersByIds' hook ready here, we'll assume we issue by ID 
    // and letting backend (cloud functions) or client side display handle the rest.
    // But for better UI, let's claim we just select from the list.

    const participants = event.participants || [];

    const toggleUser = (uid: string) => {
        if (selectedUsers.includes(uid)) {
            setSelectedUsers(selectedUsers.filter(id => id !== uid));
        } else {
            setSelectedUsers([...selectedUsers, uid]);
        }
    };

    const handleIssue = async () => {
        if (selectedUsers.length === 0) return;
        setLoading(true);
        try {
            const batchPromises = selectedUsers.map(async (userId) => {
                // Create certificate in user's subcollection
                await addDoc(collection(db, `users/${userId}/certificates`), {
                    eventId: event.id,
                    eventTitle: event.title,
                    date: event.date,
                    issuedAt: serverTimestamp(),
                    issuerId: event.creatorId,
                    type: event.type
                });
            });

            await Promise.all(batchPromises);
            toast.success(`${selectedUsers.length} certificados emitidos com sucesso!`);
            onClose();
            setSelectedUsers([]);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao emitir certificados.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-lg rounded-[40px] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">

                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-amber-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-500">
                            <Award size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                Emitir Certificados
                            </h2>
                            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest opacity-60">
                                {event.title}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 text-center">
                        <p className="text-xs text-slate-500 font-medium">
                            Selecione os participantes que compareceram para liberar o certificado de horas.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-2 pb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Participantes ({participants.length})</span>
                            <button
                                onClick={() => setSelectedUsers(selectedUsers.length === participants.length ? [] : [...participants])}
                                className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider"
                            >
                                {selectedUsers.length === participants.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                            </button>
                        </div>

                        {participants.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm font-bold text-slate-400">Nenhum participante ainda.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {participants.map(uid => (
                                    <button
                                        key={uid}
                                        onClick={() => toggleUser(uid)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedUsers.includes(uid)
                                                ? 'bg-emerald-500/5 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                                                : 'bg-white dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                                                <User size={14} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black truncate max-w-[150px]">ID: {uid.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                        {selectedUsers.includes(uid) && (
                                            <CheckCircle2 size={18} className="text-emerald-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                    <button
                        onClick={handleIssue}
                        disabled={selectedUsers.length === 0 || loading}
                        className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Emitindo...' : (
                            <>
                                Confirmar Emissão <Send size={16} />
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CertificateIssuer;
