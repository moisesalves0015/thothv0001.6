
import React from 'react';
import {
    MapPin,
    GraduationCap,
    Quote,
    Building2,
    CheckCircle2
} from 'lucide-react';

interface ProfileSidebarProps {
    user: any;
    profileData: any;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
    user,
    profileData
}) => {
    const userAvatar = profileData.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.uid || 'Thoth'}`;
    const userDisplayName = profileData.name || profileData.fullName || "Estudante Thoth";
    const userBio = profileData.bio || "Explorando conhecimentos e conectando ideias no Thoth.";

    // Fallback para curso se não existir
    const course = profileData.course || 'Curso não definido';
    const university = profileData.university || 'Universidade Thoth';

    return (
        <div className="w-full lg:w-[315px] h-[350px] liquid-glass rounded-[24px] p-0 shadow-2xl flex flex-col items-center text-center relative overflow-hidden group hover:shadow-emerald-900/10 transition-shadow duration-500">

            {/* Header / Background Visual REMOVED as per user request */}

            <div className="relative z-10 w-full flex flex-col items-center pt-10 px-6">

                {/* Badge Status (Graduando) - Pill Style */}
                <div className="mb-1 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
                    <span className="px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-[10px] font-black text-[#006c55] dark:text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Graduando
                    </span>
                </div>

                {/* Avatar with Double Ring */}
                <div className="w-[120px] h-[120px] rounded-full p-1 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200 dark:shadow-black/40 mb-4 relative group-hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-full border-4 border-slate-50 dark:border-slate-700 overflow-hidden relative">
                        <img
                            src={userAvatar}
                            className="w-full h-full object-cover"
                            alt="Profile"
                        />
                    </div>
                    {/* Verificado Icon */}
                    <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md">
                        <CheckCircle2 size={16} className="text-[#006c55] dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-900/20" />
                    </div>
                </div>

                {/* Name & Bio */}
                <div className="w-full mb-1">
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight mb-3 truncate px-2">
                        {userDisplayName}
                    </h2>


                </div>

                {/* Academic Info Block */}
                <div className="w-full flex flex-col gap-3">

                    {/* Course */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-lg border border-slate-100/50 dark:border-slate-700/50">
                            <GraduationCap size={16} className="text-[#006c55] dark:text-emerald-400" />
                            <span className="text-xs font-bold truncate max-w-[200px]">{course}</span>
                        </div>
                    </div>

                    {/* University */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-lg border border-slate-100/50 dark:border-slate-700/50">
                            <Building2 size={16} className="text-[#006c55] dark:text-emerald-400" />
                            <span className="text-xs font-bold truncate max-w-[200px]">{university}</span>
                        </div>
                    </div>

                    {/* Location */}
                    {profileData.location && (
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-slate-300 dark:text-slate-600">
                            <MapPin size={10} />
                            <span className="text-[9px] font-medium">{profileData.location}</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ProfileSidebar;
