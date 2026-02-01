import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    X,
    MapPin,
    GraduationCap,
    Users,
    FileText,
    Award,
    ExternalLink,
    UserPlus,
    Loader2
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePreviewModalProps {
    userId: string;
    username?: string;
    isOpen: boolean;
    onClose: () => void;
}

const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
    userId,
    username,
    isOpen,
    onClose
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !userId) return;

        const loadProfile = async () => {
            setLoading(true);
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setProfileData({ uid: userId, ...userDoc.data() });
                }
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [isOpen, userId]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isOwnProfile = user?.uid === userId;
    const rawUsername = username || profileData?.username || 'usuario';
    const displayUsername = rawUsername.replace(/^@/, '');

    const handleViewFullProfile = () => {
        onClose();
        if (isOwnProfile) {
            navigate('/perfil');
        } else {
            navigate(`/${displayUsername}`);
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
                {/* Header with Gradient */}
                <div className="relative h-32 bg-gradient-to-br from-[#006c55] via-[#007a62] to-[#00876a] dark:from-emerald-600 dark:to-emerald-700">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                        <Loader2 size={40} className="text-[#006c55] dark:text-emerald-400 animate-spin" />
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Carregando perfil...</p>
                    </div>
                ) : profileData ? (
                    <>
                        {/* Avatar Section */}
                        <div className="px-8 -mt-16 mb-6">
                            <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-white dark:bg-slate-800">
                                <img
                                    src={profileData.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.displayName || 'User'}`}
                                    alt={profileData.displayName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="px-8 pb-8 space-y-5">
                            {/* Name & Username */}
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                                    {profileData.displayName || profileData.fullName || 'Usuário Thoth'}
                                </h3>
                                <p className="text-base font-bold text-slate-400 dark:text-slate-500">
                                    @{displayUsername}
                                </p>
                            </div>

                            {/* Role & Course with Icons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {profileData.role && (
                                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#006c55]/10 dark:bg-emerald-400/10 text-[#006c55] dark:text-emerald-400 rounded-xl text-sm font-bold">
                                        <Users size={14} />
                                        <span>{profileData.role}</span>
                                    </div>
                                )}
                                {profileData.course && (
                                    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold">
                                        <GraduationCap size={14} />
                                        <span>{profileData.course}</span>
                                    </div>
                                )}
                                {profileData.university && (
                                    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold">
                                        <MapPin size={14} />
                                        <span className="truncate max-w-[200px]">{profileData.university}</span>
                                    </div>
                                )}
                            </div>

                            {/* Bio */}
                            {profileData.bio && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed">
                                    {profileData.bio}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-100 dark:border-white/5">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-[#006c55]/10 dark:bg-emerald-400/10 flex items-center justify-center">
                                            <Users size={16} className="text-[#006c55] dark:text-emerald-400" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                        {profileData.stats?.connections || 0}
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        Conexões
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <FileText size={16} className="text-blue-500" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                        {profileData.stats?.posts || 0}
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        Posts
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <Award size={16} className="text-amber-500" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                        {profileData.stats?.badges || 0}
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        Badges
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-5">
                                <button
                                    onClick={handleViewFullProfile}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#006c55] to-[#00876a] dark:from-emerald-500 dark:to-emerald-600 text-white rounded-xl text-sm font-black hover:from-[#005a46] hover:to-[#007a62] dark:hover:from-emerald-600 dark:hover:to-emerald-700 transition-all shadow-lg shadow-[#006c55]/20 dark:shadow-emerald-500/20 active:scale-95"
                                >
                                    <span>Ver Perfil Completo</span>
                                    <ExternalLink size={16} />
                                </button>
                                {!isOwnProfile && (
                                    <button className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                                        <UserPlus size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                            Perfil não encontrado
                        </p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default ProfilePreviewModal;
