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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2 text-slate-400">
                        <Users size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Total</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tighter">{stats.total}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2 text-red-400">
                        <Shield size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Admins</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tighter">{stats.admins}</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2 text-blue-400">
                        <Users size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Professores</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tighter">{stats.professors}</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2 text-emerald-400">
                        <Users size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Estudantes</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tighter">{stats.students}</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-[24px] border border-white/10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou UID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#006c55] transition-all placeholder:text-slate-600"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDiagnosticMode(!diagnosticMode)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${diagnosticMode ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                        title="Modo Diagnóstico"
                    >
                        <AlertTriangle size={14} />
                        <span className="hidden md:inline">Diag</span>
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#006c55]"
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
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-[32px] p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Diagnóstico de Usuários</h3>
                            <p className="text-xs text-purple-300 font-mono mt-1">Dados não processados do Firestore</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto bg-black/40 rounded-2xl border border-purple-500/20 p-2">
                        <code className="text-[10px] text-purple-200 block whitespace-pre overflow-auto max-h-60">
                            {JSON.stringify(users.slice(0, 5), null, 2)}
                            {users.length > 5 && `\n... mais ${users.length - 5} usuários ...`}
                        </code>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Usuário</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Função</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Data Cadastro</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 relative overflow-hidden ring-2 ring-white/5">
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-black text-[#006c55] uppercase text-xs bg-black">
                                                        {(user.fullName || user.name || '?').charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-white truncate">{user.fullName || user.name || 'Sem Nome'}</span>
                                                <span className="text-[10px] text-slate-500 truncate font-mono">{user.email}</span>
                                                {diagnosticMode && <span className="text-[9px] text-purple-500 font-mono mt-0.5">{user.id}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide inline-flex items-center gap-1.5 ${user.role === 'Admin' ? 'bg-red-500/10 text-red-400' :
                                                user.role === 'Professor' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-emerald-500/10 text-emerald-400'
                                            }`}>
                                            {user.role || 'Estudante'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-xs text-slate-400 font-medium font-mono">
                                            {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('pt-BR') : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all"
                                                title="Editar Usuário"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}
                                                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"
                                                title="Deletar Usuário"
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
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-500">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-3">
                            <Edit2 size={24} className="text-[#006c55]" />
                            Editar Usuário
                        </h3>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={editForm.fullName || ''}
                                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Função / Cargo</label>
                                <select
                                    value={editForm.role || ''}
                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none appearance-none"
                                >
                                    <option value="Estudante" className="bg-black">Estudante</option>
                                    <option value="Professor" className="bg-black">Professor</option>
                                    <option value="Admin" className="bg-black">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Universidade / Instituição</label>
                                <input
                                    type="text"
                                    value={editForm.university || ''}
                                    onChange={e => setEditForm({ ...editForm, university: e.target.value })}
                                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#006c55] focus:outline-none"
                                />
                            </div>

                            <button type="submit" className="w-full h-14 mt-4 bg-[#006c55] hover:bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-lg shadow-[#006c55]/20 flex items-center justify-center gap-2">
                                <Save size={18} /> Salvar Alterações
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && userToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter mb-2 text-white uppercase italic">Excluir Usuário?</h3>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                Você está prestes a remover <span className="text-white">{userToDelete.fullName}</span>. Esta ação removerá o registro do banco de dados, mas não excluirá a conta de autenticação (Firebase Auth).
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full mt-10">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancelar
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
