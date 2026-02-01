import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera,
    User,
    Check,
    Loader2,
    ArrowRight,
    School,
    GraduationCap,
    Building2,
    UserCircle,
    BookOpen,
    MapPin,
    Hash,
    Sparkles,
    Upload,
    Info,
    ChevronRight,
    Star,
    Target,
    Globe,
    Users,
    Award,
    Shield,
    Search,
    ArrowLeft
} from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../modules/storage/storage.service';
import { UserService } from '../../modules/user/user.service';

// Mock de cursos - Em produção viria do backend
const COURSES = [
    { id: 'eng-comp', name: 'Engenharia de Computação', area: 'Exatas', icon: '💻' },
    { id: 'med', name: 'Medicina', area: 'Saúde', icon: '⚕️' },
    { id: 'direito', name: 'Direito', area: 'Humanas', icon: '⚖️' },
    { id: 'adm', name: 'Administração', area: 'Sociais', icon: '📊' },
    { id: 'arquit', name: 'Arquitetura e Urbanismo', area: 'Artes', icon: '🏛️' },
    { id: 'psi', name: 'Psicologia', area: 'Humanas', icon: '🧠' },
    { id: 'eng-civ', name: 'Engenharia Civil', area: 'Exatas', icon: '🏗️' },
    { id: 'letras', name: 'Letras', area: 'Humanas', icon: '📚' },
    { id: 'bio', name: 'Biologia', area: 'Biológicas', icon: '🧬' },
    { id: 'eco', name: 'Economia', area: 'Sociais', icon: '📈' },
];

const ROLES = [
    {
        id: 'Estudante',
        label: 'Estudante',
        icon: GraduationCap,
        description: 'Busco aprender, trocar materiais e fazer conexões.',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-400/10',
        badge: '📚 Aprendizado'
    },
    {
        id: 'Professor',
        label: 'Professor',
        icon: School,
        description: 'Compartilho conhecimento e oriento estudantes.',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-400/10',
        badge: '🎓 Ensino'
    },
    {
        id: 'Entidade',
        label: 'Entidade / Atlética',
        icon: Building2,
        description: 'Organizo eventos e represento os estudantes.',
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-400/10',
        badge: '🏆 Representação'
    },
    {
        id: 'Outro',
        label: 'Visitante / Outro',
        icon: UserCircle,
        description: 'Acompanho a comunidade acadêmica.',
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-800',
        badge: '👁️ Observador'
    }
];

const Onboarding: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('');
    const [course, setCourse] = useState('');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || 'Thoth'}`);
    const [bio, setBio] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const photoInputRef = React.useRef<HTMLInputElement>(null);
    const [searchCourse, setSearchCourse] = useState('');


    const filteredCourses = COURSES.filter(c =>
        c.name.toLowerCase().includes(searchCourse.toLowerCase()) ||
        c.area.toLowerCase().includes(searchCourse.toLowerCase())
    );

    const INTEREST_OPTIONS = [
        'Programação', 'Design', 'Pesquisa', 'Eventos', 'Esportes', 'Música',
        'Literatura', 'Ciência de Dados', 'Robótica', 'Sustentabilidade',
        'Empreendedorismo', 'Fotografia', 'Voluntariado', 'Startups'
    ];

    const handleFinish = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let finalPhotoURL = photoURL;

            if (selectedFile) {
                finalPhotoURL = await StorageService.uploadFile(`avatars/${user.uid}`, selectedFile);
                await updateProfile(user, { photoURL: finalPhotoURL });
                await refreshUser();
            }

            await UserService.updateProfile(user.uid, {
                role,
                course,
                photoURL: finalPhotoURL,
                bio,
                interests,
                onboardingComplete: true,
                joinedAt: new Date().toISOString()
            });

            navigate('/home');
        } catch (error) {
            console.error("Error updating profile during onboarding:", error);
            alert("Erro ao salvar perfil. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };



    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPhotoURL(URL.createObjectURL(file));
        }
    };

    const toggleInterest = (interest: string) => {
        setInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : prev.length < 5 ? [...prev, interest] : prev
        );
    };

    const handleNextStep = () => {
        if (step === 1 && role) setStep(2);
        else if (step === 2 && course) setStep(3);
        else if (step === 3) setStep(4);
    };

    const handlePreviousStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const getStepCompletion = () => {
        switch (step) {
            case 1: return role ? 25 : 0;
            case 2: return course ? 50 : 25;
            case 3: return 75;
            case 4: return 100;
            default: return 0;
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                                <Shield size={32} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Qual é o seu papel?</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Como você se identifica na comunidade acadêmica?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ROLES.map((item) => {
                                const Icon = item.icon;
                                const isSelected = role === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setRole(item.id)}
                                        className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all group ${isSelected
                                            ? `${item.bg} border-[#006c55] dark:border-[#006c55] shadow-lg scale-[1.02]`
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-colors ${isSelected ? 'bg-[#006c55] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-600'}`}>
                                            <Icon size={28} />
                                        </div>
                                        <div className="text-center">
                                            <h4 className={`text-sm font-black ${isSelected ? 'text-[#006c55] dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{item.label}</h4>
                                            <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/90 dark:bg-slate-900/50 text-[#006c55] dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                                {item.badge}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {role && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-[#006c55]/5 to-[#006c55]/10 dark:from-emerald-400/10 dark:to-emerald-400/5 rounded-xl border border-[#006c55]/20 dark:border-emerald-400/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info size={16} className="text-[#006c55] dark:text-emerald-400" />
                                    <span className="text-sm font-bold text-[#006c55] dark:text-emerald-400">Perfil selecionado</span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    {ROLES.find(r => r.id === role)?.description}
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                                <BookOpen size={32} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Qual é o seu curso?</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Selecione sua área de estudo para encontrar colegas</p>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={16} />
                                <input
                                    type="text"
                                    value={searchCourse}
                                    onChange={(e) => setSearchCourse(e.target.value)}
                                    placeholder="Buscar curso ou área..."
                                    className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 dark:focus:ring-emerald-400/10 focus:border-[#006c55] dark:focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] md:max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                {filteredCourses.map((c) => {
                                    const isSelected = course === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => setCourse(c.id)}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected
                                                ? 'bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-900/40 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-700/50'
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            <span className={`text-sm font-bold text-left ${isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-900 dark:text-white'}`}>
                                                {c.name}
                                            </span>
                                            {isSelected && <Check className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" size={16} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {course && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-50/30 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                        {COURSES.find(c => c.id === course)?.name}
                                    </span>
                                </div>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                                    Você encontrará colegas e conteúdos relacionados a esta área
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                                <Target size={32} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Seus interesses</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Selecione até 5 tópicos que mais te interessam</p>
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-bold">
                                {interests.length}/5 selecionados
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            {INTEREST_OPTIONS.map((interest) => {
                                const isSelected = interests.includes(interest);
                                return (
                                    <button
                                        key={interest}
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-4 py-3 md:py-2.5 rounded-xl border transition-all ${isSelected
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-md transform scale-105'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-200 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                            }`}
                                    >
                                        <span className="text-sm font-bold">{interest}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {interests.length > 0 && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-amber-50/30 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
                                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Interesses selecionados</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {interests.map(interest => (
                                        <span key={interest} className="px-2.5 py-1 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-800">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                                <User size={32} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Seu perfil visual</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Personalize sua foto e apresentação</p>
                        </div>

                        {/* Avatar Section */}
                        <div className="space-y-4">
                            <div className="flex flex-col items-center">
                                <div className="relative group mb-3">
                                    <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-800 transition-transform group-hover:scale-105">
                                        <img src={photoURL} alt="Profile Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={photoInputRef}
                                        onChange={handlePhotoSelect}
                                    />
                                    <button
                                        onClick={() => photoInputRef.current?.click()}
                                        className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-[#006c55] to-[#00876a] dark:from-emerald-500 dark:to-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:from-[#005a46] hover:to-[#007a62] dark:hover:from-emerald-600 dark:hover:to-emerald-700 transition-all active:scale-90 ring-4 ring-white dark:ring-slate-900"
                                        title="Enviar foto"
                                    >
                                        <Camera size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Hash size={14} />
                                    Biografia
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder={`Fale um pouco sobre você...\nEx: ${role === 'Estudante' ? 'Estudante de ' + COURSES.find(c => c.id === course)?.name + ' apaixonado por...' : role === 'Professor' ? 'Professor de ' + COURSES.find(c => c.id === course)?.name + ' com interesse em...' : 'Gosto de...'}`}
                                    className="w-full h-32 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 dark:focus:ring-emerald-400/10 focus:border-[#006c55] dark:focus:border-emerald-400 transition-all resize-none shadow-sm"
                                />
                                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                    <Info size={12} />
                                    Esta biografia aparecerá no seu perfil público
                                </div>
                            </div>

                            {/* Profile Preview */}
                            <div className="p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <img src={photoURL} className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm" alt="Preview" />
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{user?.displayName || 'Usuário Thoth'}</h4>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-[#006c55] dark:text-emerald-400">
                                                {ROLES.find(r => r.id === role)?.label}
                                            </span>
                                            <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {COURSES.find(c => c.id === course)?.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {bio && (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{bio.substring(0, 100)}..."</p>
                                )}
                                {interests.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {interests.slice(0, 3).map(interest => (
                                            <span key={interest} className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                {interest}
                                            </span>
                                        ))}
                                        {interests.length > 3 && (
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-600">
                                                +{interests.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div >
                );
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 transition-colors duration-500">
            {/* Background Decorative Blur */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#006c55]/5 dark:bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl mb-8 relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-[#006c55] dark:bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Check size={16} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Passo {step} de 4</span>
                </div>

                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#006c55] via-[#007a62] to-[#00876a] dark:from-emerald-500 dark:to-emerald-400 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${getStepCompletion()}%` }}
                    />
                </div>

                <div className="grid grid-cols-4 mt-2">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className="text-center">
                            <span className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${step >= s ? 'text-[#006c55] dark:text-emerald-400' : 'text-slate-300 dark:text-slate-700'}`}>
                                {s === 1 ? 'Perfil' : s === 2 ? 'Curso' : s === 3 ? 'Interesses' : 'Foto'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-2xl glass-panel dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/5 dark:shadow-black/20 border border-white/60 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative z-10 ring-1 ring-black/5 dark:ring-white/5">

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Side - Instructions - Hidden on Mobile */}
                    <div className="hidden md:block md:w-1/3 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#006c55] to-[#00876a] dark:from-emerald-500 dark:to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Award size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Conclua seu perfil</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Últimos passos para começar</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { step: 1, title: 'Defina seu papel', desc: 'Como você atua na universidade?' },
                                { step: 2, title: 'Escolha seu curso', desc: 'Encontre colegas da mesma área' },
                                { step: 3, title: 'Seus interesses', desc: 'O que você gosta de estudar?' },
                                { step: 4, title: 'Foto e bio', desc: 'Como você quer aparecer?' }
                            ].map(item => (
                                <div
                                    key={item.step}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${step === item.step
                                        ? 'bg-gradient-to-r from-[#006c55]/10 to-[#006c55]/5 dark:from-emerald-400/10 dark:to-emerald-400/5 border border-[#006c55]/20 dark:border-emerald-400/20'
                                        : 'opacity-50 dark:opacity-40 hover:opacity-80 dark:hover:opacity-70'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${step === item.step
                                        ? 'bg-[#006c55] dark:bg-emerald-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                        }`}>
                                        {step > item.step ? <Check size={16} /> : <span className="text-sm font-black">{item.step}</span>}
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-bold ${step === item.step ? 'text-[#006c55] dark:text-emerald-400' : 'text-slate-700 dark:text-slate-400'}`}>
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-50/30 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe size={14} className="text-blue-500 dark:text-blue-400" />
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Por que completar?</span>
                            </div>
                            <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                <li className="flex items-center gap-1.5">
                                    <Check size={10} className="text-blue-500" />
                                    <span>Encontre colegas do seu curso</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <Check size={10} className="text-blue-500" />
                                    <span>Receba conteúdo personalizado</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <Check size={10} className="text-blue-500" />
                                    <span>Participe de grupos relevantes</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="md:w-2/3 md:border-l border-slate-100 dark:border-white/5 md:pl-8">
                        <div className="h-full flex flex-col">
                            {renderStep()}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between pt-8 mt-auto border-t border-slate-100 dark:border-white/5">
                                <button
                                    onClick={handlePreviousStep}
                                    disabled={step === 1}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === 1
                                        ? 'opacity-0 cursor-default'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <ArrowLeft size={16} />
                                    <span className="text-sm font-bold">Voltar</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    {step < 4 ? (
                                        <button
                                            onClick={handleNextStep}
                                            disabled={!role || (step === 2 && !course)}
                                            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#006c55] to-[#00876a] dark:from-emerald-500 dark:to-emerald-600 text-white rounded-xl text-sm font-black hover:from-[#005a46] hover:to-[#007a62] dark:hover:from-emerald-600 dark:hover:to-emerald-700 transition-all shadow-lg shadow-[#006c55]/20 dark:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                                        >
                                            <span>Próximo passo</span>
                                            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleFinish}
                                            disabled={loading}
                                            className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 text-white rounded-xl text-sm font-black hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 hover:scale-105 active:scale-95"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    <span>Salvando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Finalizar Cadastro</span>
                                                    <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <p className="text-xs text-slate-400 dark:text-slate-600">
                    Você pode alterar essas informações depois nas configurações do perfil
                </p>
            </div>
        </div>
    );
};

export default Onboarding;