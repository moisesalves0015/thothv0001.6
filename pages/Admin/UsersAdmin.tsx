import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Shield,
    Activity,
    AlertTriangle,
    X,
    Save,
    Check
} from 'lucide-react';
import { collection, query, onSnapshot, doc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserService } from '../../modules/user/user.service';
import { toast } from 'sonner';

interface User {
    id: string; // Document ID (uid)
    uid: string;
    fullName?: string;
    name?: string;
    email: string;
    role?: string;
    photoURL?: string;
    createdAt?: any;
    [key: string]: any;
}

const UsersAdmin: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Diagnostic
    const [diagnosticMode, setDiagnosticMode] = useState(false);

    // Edit Modal
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Delete Modal
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        // Subscribe to users
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100)); // Limit to prevent overload
        const unsub = onSnapshot(q, (snapshot) => {
            const fetchedUsers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as User[];
            setUsers(fetchedUsers);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const name = user.fullName || user.name || '';
            const matchesSearch =
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id.includes(searchTerm);

            const matchesRole = roleFilter === 'all'
                ? true
                : (user.role || 'Estudante') === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setEditForm({
            fullName: user.fullName || user.name,
            role: user.role || 'Estudante',
            bio: user.bio,
            university: user.university
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            await UserService.updateProfile(editingUser.id, editForm as any);
            toast.success("Usuário atualizado com sucesso!");
            setIsEditModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar usuário.");
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await deleteDoc(doc(db, 'users', userToDelete.id));
            toast.success("Usuário removido da base de dados.");
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao deletar usuário.");
        }
    };

    // Stats
    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === 'Admin').length,
        professors: users.filter(u => u.role === 'Professor').length,
        students: users.filter(u => u.role !== 'Admin' && u.role !== 'Professor').length
    }), [users]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[32px] p-8 shadow-sm group transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2 text-slate-400">
                        <Users size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Base Total</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.total}</div>
                </div>
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[32px] p-8 shadow-sm group transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2 text-red-500">
                        <Shield size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Administradores</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.admins}</div>
                </div>
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[32px] p-8 shadow-sm group transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2 text-blue-500">
                        <Users size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Professores</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.professors}</div>
                </div>
                <div className="bg-[#006c55] rounded-[32px] p-8 shadow-sm transition-all hover:shadow-lg hover:shadow-[#006c55]/20">
                    <div className="flex items-center gap-3 mb-2 text-white/70">
                        <Users size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Estudantes</span>
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter">{stats.students}</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800/40 p-4 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006c55] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou UID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all placeholder:text-slate-400 font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setDiagnosticMode(!diagnosticMode)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${diagnosticMode ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <AlertTriangle size={14} />
                        Diag
                    </button>
                    <div className="w-px h-6 bg-slate-100 dark:bg-white/10 mx-2 shrink-0"></div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="h-10 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 transition-all shrink-0"
                    >
                        <option value="all">Todas as Funções</option>
                        <option value="Admin">Admin</option>
                        <option value="Professor">Professor</option>
                        <option value="Estudante">Estudante</option>
                    </select>
                </div>
            </div>

            {/* Diagnostic Panel */}
            {diagnosticMode && (
                <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/30 rounded-[32px] p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Diagnóstico de Usuários</h3>
                            <p className="text-[10px] text-purple-500 font-bold uppercase tracking-widest mt-1">Snapshot JSON (Amostragem)</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto bg-white dark:bg-black/40 rounded-[24px] border border-slate-100 dark:border-purple-500/20 shadow-sm p-4">
                        <code className="text-[11px] text-purple-600 dark:text-purple-200 block whitespace-pre overflow-auto max-h-64 font-mono font-bold">
                            {JSON.stringify(users.slice(0, 3), null, 2)}
                            {users.length > 3 && `\n\n... +${users.length - 3} itens indexados ...`}
                        </code>
                    </div>
                </div>
            )}

            {/* Users Display */}
            <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Usuário</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Função</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Data Cadastro</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex-shrink-0 relative overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-black text-[#006c55] uppercase text-sm">
                                                        {(user.fullName || user.name || '?').charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{user.fullName || user.name || 'Sem Nome'}</span>
                                                <span className="text-[10px] text-slate-400 truncate font-bold uppercase tracking-widest">{user.email}</span>
                                                {diagnosticMode && <span className="text-[9px] text-purple-500 font-mono mt-0.5">{user.id}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${user.role === 'Admin' ? 'bg-red-50 text-red-600' :
                                                user.role === 'Professor' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {user.role || 'Estudante'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                                            {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('pt-BR') : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="w-10 h-10 bg-slate-50 hover:bg-[#006c55]/10 text-slate-400 hover:text-[#006c55] rounded-xl transition-all border border-slate-100"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}
                                                className="w-10 h-10 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-100"
                                                title="Deletar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-50 dark:divide-white/5">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="p-6 space-y-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex-shrink-0 border border-slate-100 dark:border-white/5 relative overflow-hidden">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-[#006c55] text-sm">
                                                {(user.fullName || user.name || '?').charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{user.fullName || user.name || 'Sem Nome'}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[150px]">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${user.role === 'Admin' ? 'bg-red-50 text-red-600' :
                                        user.role === 'Professor' ? 'bg-blue-50 text-blue-600' :
                                            'bg-emerald-50 text-emerald-600'
                                    }`}>
                                    {user.role || 'Estudante'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    Desde: {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('pt-BR') : 'N/A'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditUser(user)}
                                        className="p-2 bg-slate-50 rounded-lg text-slate-400 border border-slate-100"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}
                                        className="p-2 bg-red-50 rounded-lg text-red-500 border border-red-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/10 rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-500">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                            <X size={20} />
                        </button>
                        <div className="mb-10">
                            <p className="text-[10px] font-black text-[#006c55] uppercase tracking-[0.3em] mb-1">Membro do Ecossistema</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Editar Perfil</h3>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nome Completo</label>
                                <input
                                    type="text"
                                    value={editForm.fullName || ''}
                                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                                    className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Função na Thoth</label>
                                <select
                                    value={editForm.role || ''}
                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-black text-[10px] uppercase tracking-widest"
                                >
                                    <option value="Estudante">Estudante</option>
                                    <option value="Professor">Professor</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Instituição de Ensino</label>
                                <input
                                    type="text"
                                    value={editForm.university || ''}
                                    onChange={e => setEditForm({ ...editForm, university: e.target.value })}
                                    className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:border-[#006c55] focus:outline-none focus:ring-4 focus:ring-[#006c55]/5 transition-all font-bold text-sm"
                                />
                            </div>

                            <button type="submit" className="w-full h-16 mt-6 bg-[#006c55] hover:bg-[#005c49] rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all shadow-xl shadow-[#006c55]/20 flex items-center justify-center gap-3">
                                <Check size={20} /> Atualizar Registro
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && userToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/10 rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-500 mb-6 border border-red-100">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white uppercase">Remover Usuário?</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                Você está prestes a remover <span className="text-slate-900 dark:text-white">{userToDelete.fullName || userToDelete.name}</span> permanentemente.
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full mt-10">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="h-14 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-100"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-red-500/20"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersAdmin;
