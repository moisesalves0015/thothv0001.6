
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Check, Loader2, ArrowRight, School, GraduationCap, Building2, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../modules/storage/storage.service';

const ROLES = [
    { id: 'Estudante', label: 'Estudante', icon: GraduationCap, description: 'Interessado em aprender e trocar materiais.' },
    { id: 'Professor', label: 'Professor', icon: School, description: 'Compartilho conhecimento e gerencio turmas.' },
    { id: 'Entidade', label: 'Entidade / Atlética', icon: Building2, description: 'Organizo eventos e represento estudantes.' },
    { id: 'Outro', label: 'Visitante / Outro', icon: UserCircle, description: 'Acompanhando a comunidade acadêmica.' }
];

const Onboarding: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(ROLES[0].id);
    const [photoURL, setPhotoURL] = useState(user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || 'Thoth'}`);
    const [bio, setBio] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const photoInputRef = React.useRef<HTMLInputElement>(null);

    const handleFinish = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let finalPhotoURL = photoURL;

            // Se o usuário selecionou um arquivo local, faz o upload primeiro
            if (selectedFile) {
                finalPhotoURL = await StorageService.uploadFile(`avatars/${user.uid}`, selectedFile);
            }

            await UserService.updateProfile(user.uid, {
                role,
                photoURL: finalPhotoURL,
                bio
            });
            navigate('/home');
        } catch (error) {
            console.error("Error updating profile during onboarding:", error);
            alert("Erro ao salvar perfil. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleRandomizeAvatar = () => {
        setSelectedFile(null);
        const seed = Math.random().toString(36).substring(7);
        const style = role === 'Professor' ? 'avataaars' : 'initials';
        setPhotoURL(`https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`);
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPhotoURL(URL.createObjectURL(file));
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50/50">
            <div className="w-full max-w-[500px] glass-panel rounded-[32px] p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500 overflow-hidden">

                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-16 h-16 bg-[#006c55]/10 rounded-2xl flex items-center justify-center mb-4">
                        <User className="text-[#006c55]" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personalize seu Perfil</h2>
                    <p className="text-sm text-slate-500">Estamos quase lá! Como você quer ser visto na rede?</p>
                </div>

                {/* Profile Photo Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-xl bg-white transition-transform group-hover:scale-105">
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
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#006c55] text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-[#005a46] transition-all active:scale-90"
                            title="Mudar Avatar"
                        >
                            <Camera size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avatar da conta</span>
                        <button
                            onClick={handleRandomizeAvatar}
                            className="text-[10px] font-black text-[#006c55] uppercase tracking-widest hover:underline"
                        >
                            Sortear
                        </button>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-4 mb-8">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quem é você na UERJ?</label>
                    <div className="grid grid-cols-1 gap-3">
                        {ROLES.map((item) => {
                            const Icon = item.icon;
                            const isSelected = role === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setRole(item.id)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${isSelected
                                        ? 'bg-[#006c55]/5 border-[#006c55] ring-4 ring-[#006c55]/5'
                                        : 'bg-white border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-[#006c55] text-white' : 'bg-slate-50 text-slate-400'}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-black tracking-tight ${isSelected ? 'text-[#006c55]' : 'text-slate-900'}`}>{item.label}</h4>
                                        <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                                    </div>
                                    {isSelected && <Check className="text-[#006c55]" size={20} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bio Section */}
                <div className="space-y-1.5 mb-10">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sobre você (Opcional)</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Ex: Aluno de Eng. de Computação apaixonado por Thoth."
                        className="w-full h-24 p-4 bg-white/50 border border-white/60 rounded-2xl text-[14px] font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] focus:bg-white transition-all resize-none"
                    />
                </div>

                <button
                    onClick={handleFinish}
                    disabled={loading}
                    className="w-full h-14 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#006c55]/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Explorar a Thoth <ArrowRight size={18} /></>}
                </button>

            </div>
        </div>
    );
};

export default Onboarding;
