import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, MapPin, Users, Share2, Star, CheckCircle2,
    ArrowLeft, Clock, Shield, MessageSquare, UserPlus, Sparkles,
    LayoutDashboard, Award
} from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { ThothEvent } from '../../types';
import { toast } from 'sonner';
import InviteModal from './components/InviteModal';
import CertificateIssuer from './components/CertificateIssuer';

const EventDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<ThothEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isCertificateIssuerOpen, setIsCertificateIssuerOpen] = useState(false);

    useEffect(() => {
        if (!id) return;

        const unsub = onSnapshot(doc(db, 'events', id), (docSnap) => {
            if (docSnap.exists()) {
                setEvent({ id: docSnap.id, ...docSnap.data() } as ThothEvent);
            } else {
                toast.error('Evento não encontrado');
                navigate('/eventos');
            }
            setLoading(false);
        });

        return () => unsub();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 animate-pulse">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">Sincronizando Dados...</p>
        </div>
    );

    if (!event) return null;

    const isParticipant = auth.currentUser ? event.participants.includes(auth.currentUser.uid) : false;
    const isInterested = auth.currentUser ? event.interested.includes(auth.currentUser.uid) : false;
    const isCreator = auth.currentUser && event.creatorId === auth.currentUser.uid;

    const toggleParticipation = async () => {
        if (!auth.currentUser || !id) return;
        try {
            const ref = doc(db, 'events', id);
            if (isParticipant) {
                await updateDoc(ref, { participants: arrayRemove(auth.currentUser.uid) });
                toast.info('Sua presença foi cancelada.');
            } else {
                await updateDoc(ref, {
                    participants: arrayUnion(auth.currentUser.uid),
                    interested: arrayRemove(auth.currentUser.uid) // Se confirmar presença, remove do interesse
                });
                toast.success('Presença confirmada!');
            }
        } catch (e) {
            toast.error('Ocorreu um erro.');
        }
    };

    const toggleInterest = async () => {
        if (!auth.currentUser || !id || isParticipant) return;
        try {
            const ref = doc(db, 'events', id);
            if (isInterested) {
                await updateDoc(ref, { interested: arrayRemove(auth.currentUser.uid) });
                toast.info('O evento não está mais no seu interesse.');
            } else {
                await updateDoc(ref, { interested: arrayUnion(auth.currentUser.uid) });
                toast.success('Interesse marcado!');
            }
        } catch (e) {
            toast.error('Ocorreu um erro.');
        }
    };

    const date = event.date?.toDate ? event.date.toDate() : new Date();
    const formattedDate = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Nav */}
            <button
                onClick={() => navigate('/eventos')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para Eventos
            </button>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Content Area */}
                <div className="flex-1 space-y-8">
                    {/* Header Hero */}
                    <div className="glass-panel overflow-hidden rounded-[40px] border border-white/10 relative">
                        <div className="h-64 bg-slate-100 dark:bg-white/5 relative">
                            {event.coverImage ? (
                                <img src={event.coverImage} className="w-full h-full object-cover opacity-60" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Sparkles size={80} className="text-slate-200 dark:text-white/5" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                            <div className="absolute bottom-8 left-8 right-8">
                                <span className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                    {event.type}
                                </span>
                                <h1 className="text-4xl font-black text-white tracking-tight mt-4 leading-tight">
                                    {event.title}
                                </h1>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Data do Evento</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{formattedDate}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Horário Previsto</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formattedTime}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Localização</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{event.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-[32px] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex flex-col justify-center gap-4 text-center">
                                <div className="flex items-center justify-center -space-x-3 mb-2">
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-[#0A0A0A] bg-slate-200"></div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-4 border-white dark:border-[#0A0A0A] bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white">
                                        +{event.participants.length}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-slate-500">
                                    <span className="text-slate-900 dark:text-white font-black">{event.participants.length} pessoas</span> confirmaram presença neste evento.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div className="glass-panel p-8 rounded-[40px] border border-white/10 space-y-6">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Shield className="text-emerald-500" size={24} />
                            Sobre o Evento
                        </h2>
                        <div className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                            {event.description}
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="w-full xl:w-[350px] space-y-6">
                    {/* Action Card */}
                    <div className="glass-panel p-8 rounded-[40px] border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent flex flex-col gap-6 sticky top-24">

                        {/* Status Header */}
                        <div className="text-center">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-2">Seu Status</h3>
                            <div className="flex justify-center">
                                {isParticipant ? (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest">
                                        <CheckCircle2 size={14} /> Presença Confirmada
                                    </div>
                                ) : isInterested ? (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest">
                                        <Star size={14} fill="white" /> Interessado
                                    </div>
                                ) : (
                                    <div className="text-sm font-bold text-slate-400">Você ainda não reagiu</div>
                                )}
                            </div>
                        </div>

                        {/* Creator Controls */}
                        {isCreator && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                    <Shield size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Área do Organizador</span>
                                </div>
                                <button
                                    onClick={() => setIsCertificateIssuerOpen(true)}
                                    className="w-full py-3 rounded-xl bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                                >
                                    <Award size={14} /> Emitir Certificados
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={toggleParticipation}
                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${isParticipant
                                    ? 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-rose-500 hover:text-white shadow-none'
                                    : 'bg-[#006c55] text-white shadow-[#006c55]/20 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isParticipant ? 'Cancelar Inscrição' : 'Confirmar Presença'}
                            </button>

                            {!isParticipant && (
                                <button
                                    onClick={toggleInterest}
                                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${isInterested
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                                        : 'bg-white/50 dark:bg-white/5 border-transparent text-slate-600 dark:text-white hover:border-slate-300 dark:hover:border-white/10'
                                        }`}
                                >
                                    <Star size={18} fill={isInterested ? 'currentColor' : 'none'} />
                                    {isInterested ? 'Remover Interesse' : 'Tenho Interesse'}
                                </button>
                            )}

                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-100 dark:border-white/10 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <UserPlus size={18} /> Convidar Amigos
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
                            <button className="p-3 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-emerald-500 transition-all">
                                <Share2 size={20} />
                            </button>
                            <button className="p-3 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-emerald-500 transition-all">
                                <MessageSquare size={20} />
                            </button>
                            <button className="p-3 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-emerald-500 transition-all">
                                <LayoutDashboard size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                eventId={id || ''}
                eventTitle={event.title}
            />

            {/* Certificate Issuer Modal */}
            <CertificateIssuer
                event={event}
                isOpen={isCertificateIssuerOpen}
                onClose={() => setIsCertificateIssuerOpen(false)}
            />
        </div>
    );
};

export default EventDetail;
