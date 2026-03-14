import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
    X, 
    BookOpen, 
    Calendar, 
    Plus, 
    Trash2, 
    Type, 
    Tag, 
    Hash, 
    Palette, 
    Globe, 
    Lock,
    Clock,
    User
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { DisciplineService } from '../../../modules/discipline/discipline.service';
import { DisciplineSchedule } from '../../../types';

interface CreateDisciplineModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const THEME_COLORS = [
    { name: 'Emeralda', color: '#006c55' },
    { name: 'Oceano', color: '#1e40af' },
    { name: 'Ametista', color: '#7c3aed' },
    { name: 'Rubi', color: '#dc2626' },
    { name: 'Âmbar', color: '#d97706' },
    { name: 'Grafite', color: '#334155' },
];

const CreateDisciplineModal: React.FC<CreateDisciplineModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [semester, setSemester] = useState('2024.1');
    const [room, setRoom] = useState('');
    const [themeColor, setThemeColor] = useState(THEME_COLORS[0].color);
    const [type, setType] = useState<'public' | 'private'>('public');
    const [schedule, setSchedule] = useState<DisciplineSchedule[]>([{ day: 'Segunda', time: '08:00 - 10:00' }]);

    if (!isOpen) return null;

    const handleAddSchedule = () => {
        setSchedule([...schedule, { day: 'Segunda', time: '08:00 - 10:00' }]);
    };

    const handleRemoveSchedule = (index: number) => {
        setSchedule(schedule.filter((_, i) => i !== index));
    };

    const handleScheduleChange = (index: number, field: keyof DisciplineSchedule, value: string) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || loading) return;

        setLoading(true);
        try {
            // Generate a join code for private disciplines
            const joinCode = type === 'private' ? Math.random().toString(36).substring(2, 8).toUpperCase() : null;

            await DisciplineService.createDiscipline({
                name,
                code,
                description,
                semester,
                teacherId: user.uid,
                teacherName: user.displayName || 'Professor',
                teacherAvatar: (user as any).photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`,
                schedule,
                room,
                themeColor,
                members: [user.uid],
                status: 'active',
                type,
                joinCode
            });
            onClose();
        } catch (error) {
            console.error('Error creating discipline:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div 
                className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <BookOpen className="text-emerald-500" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Criar Disciplina</h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nova Grade Acadêmica</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Type size={12} /> Nome da Disciplina
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: História do Brasil II"
                                    className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 text-base dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Hash size={12} /> Código
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="HBR-254"
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 text-base dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Tag size={12} /> Semestre
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                        placeholder="2024.1"
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 text-base dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Palette size={12} /> Cor do Tema
                                </label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl">
                                    {THEME_COLORS.map((c) => (
                                        <button
                                            key={c.color}
                                            type="button"
                                            onClick={() => setThemeColor(c.color)}
                                            className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${themeColor === c.color ? 'ring-4 ring-emerald-500/20 scale-110 shadow-lg' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: c.color }}
                                        >
                                            {themeColor === c.color && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Extended Info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    Visibilidade
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setType('public')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${type === 'public' 
                                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                            : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/5 hover:bg-slate-50'}`}
                                    >
                                        <Globe size={14} /> Pública
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('private')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${type === 'private' 
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                                            : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/5 hover:bg-slate-50'}`}
                                    >
                                        <Lock size={14} /> Privada
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descrição</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Dê uma breve visão geral da disciplina..."
                                    className="w-full h-[148px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-base dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Clock size={12} /> Horários da Disciplina
                            </label>
                            <button 
                                type="button"
                                onClick={handleAddSchedule}
                                className="flex items-center gap-2 text-[#006c55] text-[10px] font-black uppercase tracking-wider hover:text-emerald-400 transition-colors"
                            >
                                <Plus size={14} strokeWidth={3} /> Adicionar Horário
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {schedule.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-200">
                                    <select 
                                        value={item.day}
                                        onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                                        className="flex-1 h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 text-sm font-bold dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                                    >
                                        {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    <input 
                                        type="text"
                                        value={item.time}
                                        onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                                        placeholder="08:00 - 10:00"
                                        className="flex-[1.5] h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 text-sm font-bold dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                                    />
                                    {schedule.length > 1 && (
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveSchedule(index)}
                                            className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500/20 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                            <img src={(user as any).photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} className="w-full h-full object-cover" alt="User" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{user.displayName || 'Professor'}</p>
                            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1">Criador da Disciplina</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wider hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-2xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={loading || !name || !code}
                            className="px-8 py-3.5 bg-gradient-to-r from-[#006c55] to-[#00876a] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                        >
                            {loading ? 'Criando...' : 'Finalizar Criação'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateDisciplineModal;
