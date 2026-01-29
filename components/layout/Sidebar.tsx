
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Calendar,
    Search,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Printer,
    GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PrinterService } from '../../modules/print/printer.service';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();
    console.log('Sidebar Debug:', { user, userProfile, role: userProfile?.role });
    const [hasPrinterAccess, setHasPrinterAccess] = React.useState(false);

    React.useEffect(() => {
        const checkAccess = async () => {
            const role = userProfile?.role ? String(userProfile.role).toLowerCase() : '';
            console.log('Role Check:', role);

            if (role === 'admin' || role === 'administrator' || userProfile?.isAdmin === true) {
                setHasPrinterAccess(true);
                return;
            }
            if (user?.email) {
                const access = await PrinterService.checkUserPrinterAccess(user.email);
                setHasPrinterAccess(access);
            }
        };
        checkAccess();
    }, [user, userProfile]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Página Inicial', path: '/home' },
        { icon: GraduationCap, label: 'Estudos', path: '/estudos' },
        { icon: BookOpen, label: 'Disciplinas', path: '/disciplinas' },
        { icon: Users, label: 'Conexões', path: '/conexoes' },
        { icon: Calendar, label: 'Eventos', path: '/eventos' },
        { icon: Search, label: 'Pesquisas', path: '/pesquisas' },
        { icon: Briefcase, label: 'Vagas', path: '/vagas' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} hidden lg:flex`}>
            {/* Cabeçalho do Sidebar */}
            <div className="sidebar-header">
                {!isCollapsed && <div className="sidebar-logo">thoth</div>}
                <button
                    className="sidebar-toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Menu de Navegação */}
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <div className="sidebar-item-content">
                                <Icon className="sidebar-icon" size={22} />
                                {!isCollapsed && (
                                    <span className="sidebar-item-label">{item.label}</span>
                                )}
                            </div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Rodapé do Sidebar */}
            {(userProfile?.role?.toLowerCase() === 'admin' || hasPrinterAccess) && (
                <div className="sidebar-profile">
                    <button
                        onClick={() => navigate('/printers/login')}
                        className="w-full flex items-center gap-3 p-3 rounded-[24px] hover:bg-[#006c55]/5 dark:hover:bg-slate-800 transition-all group"
                    >
                        <div className="w-11 h-11 rounded-[16px] bg-[#006c55]/10 dark:bg-emerald-400/10 flex items-center justify-center text-[#006c55] dark:text-emerald-400 group-hover:bg-[#006c55] group-hover:text-white transition-all shrink-0">
                            <Printer size={20} />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col text-left overflow-hidden">
                                <span className="text-xs font-black text-slate-900 dark:text-slate-200 leading-none truncate uppercase tracking-tighter">Área Gráfica</span>
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1.5 truncate">Portal Parceiro</span>
                            </div>
                        )}
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
