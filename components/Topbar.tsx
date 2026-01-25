
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  LifeBuoy,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Search,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Bell
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/index';
import { useAuth } from '../contexts/AuthContext';
import { ChatService } from '../modules/chat/chat.service';

const avatarUrls = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Moisés",
  "https://i.pravatar.cc/100?img=32",
  "https://i.pravatar.cc/100?img=45"
];

interface ProfileDropdownProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onSupportClick?: () => void;
  onLogoutClick?: () => void;
  isOpen?: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onProfileClick,
  onSettingsClick,
  onSupportClick,
  onLogoutClick,
  isOpen = true,
}) => {
  if (!isOpen) return null;

  const handleClick = (e: React.MouseEvent, callback?: () => void) => {
    e.preventDefault();
    if (callback) callback();
  };

  return (
    <div className="absolute right-0 top-[50px] bg-white rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-black/5 min-w-[200px] p-[8px] z-[1002] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-3 py-2 mb-1 border-bottom border-slate-50">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minha Conta</span>
      </div>
      <a
        href="#"
        onClick={(e) => handleClick(e, onProfileClick)}
        className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] text-[14px] text-slate-700 no-underline hover:bg-[#006c55]/5 hover:text-[#006c55] transition-all font-medium"
      >
        <User size={18} />
        Meu Perfil
      </a>
      <a
        href="#"
        onClick={(e) => handleClick(e, onSettingsClick)}
        className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] text-[14px] text-slate-700 no-underline hover:bg-[#006c55]/5 hover:text-[#006c55] transition-all font-medium"
      >
        <Settings size={18} />
        Configuração
      </a>
      <a
        href="#"
        onClick={(e) => handleClick(e, onSupportClick)}
        className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] text-[14px] text-slate-700 no-underline hover:bg-[#006c55]/5 hover:text-[#006c55] transition-all font-medium"
      >
        <LifeBuoy size={18} />
        Suporte
      </a>
      <div className="h-px bg-slate-100 my-1 mx-2"></div>
      <a
        href="#"
        onClick={(e) => handleClick(e, onLogoutClick)}
        className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] text-[14px] text-red-500 no-underline hover:bg-red-50 transition-all font-bold"
      >
        <LogOut size={18} />
        Sair da conta
      </a>
    </div>
  );
};

const Topbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const avatarAtual = user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Thoth'}`;

  // Hook for Unread Count
  useEffect(() => {
    if (!user) return;
    try {
      const unsub = ChatService.subscribeToUnreadCount(user.uid, (count) => {
        setUnreadCount(count);
      });
      return () => unsub();
    } catch (e) {
      console.error("Failed to subscribe to unread count", e);
    }
  }, [user]);

  const mobileMenuItems = [
    { icon: LayoutDashboard, label: 'Página Inicial', path: '/home' },
    { icon: GraduationCap, label: 'Estudos', path: '/estudos' },
    { icon: BookOpen, label: 'Disciplinas', path: '/disciplinas' },
    { icon: Users, label: 'Conexões', path: '/conexoes' },
    { icon: Calendar, label: 'Eventos', path: '/eventos' },
    { icon: Search, label: 'Pesquisas', path: '/pesquisas' },
    { icon: Briefcase, label: 'Vagas', path: '/vagas' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeAll();
      navigate('/');
    } catch (err) {
      console.error("Erro ao deslogar mobile:", err);
    }
  };

  const navigateTo = (path: string) => {
    closeAll();
    navigate(path);
  };

  return (
    <>
      {/* Backdrop */}
      {(menuOpen || profileDropdownOpen) && (
        <div
          className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300"
          onClick={closeAll}
        />
      )}

      <header className={`fixed top-0 left-0 w-full z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-[12px] rounded-b-[16px] border border-white/60 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.1)] lg:hidden transition-all duration-300 topbar-glass ${menuOpen ? 'rounded-b-[24px]' : ''}`}>
        <div className="flex items-center justify-between px-4 h-[64px]">
          <button
            className={`text-slate-700 dark:text-slate-200 transition-transform ${menuOpen ? 'rotate-90' : ''}`}
            onClick={() => {
              setMenuOpen(!menuOpen);
              setProfileDropdownOpen(false);
            }}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
            ) : (
              <div className="relative">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
              </div>
            )}
          </button>

          <div className="font-black text-[#006c55] dark:text-emerald-400 text-[24px] tracking-tighter">thoth</div>

          <div className="relative" ref={dropdownRef}>
            <div
              className={`cursor-pointer transition-all active:scale-90 ${profileDropdownOpen ? 'ring-4 ring-[#006c55]/10 rounded-full' : ''}`}
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setMenuOpen(false);
              }}
            >
              <img
                src={avatarAtual}
                alt="Avatar"
                className="w-[38px] h-[38px] rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md"
              />
            </div>

            <ProfileDropdown
              isOpen={profileDropdownOpen}
              onProfileClick={() => navigateTo('/perfil')}
              onSettingsClick={() => navigateTo('/configuracoes')}
              onSupportClick={() => navigateTo('/suporte')}
              onLogoutClick={handleLogout}
            />
          </div>
        </div>

        <nav className={`flex flex-col gap-1 px-3 overflow-hidden transition-all duration-500 ${menuOpen ? "max-h-[85vh] py-4 border-t border-slate-100 dark:border-white/10" : "max-h-0 py-0"}`}>
          {mobileMenuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={closeAll}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${isActive ? 'bg-[#006c55]/5 dark:bg-emerald-400/10 text-[#006c55] dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`
                }
              >
                <Icon size={20} />
                <span className="text-[15px]">{item.label}</span>
                {item.label.includes('Mensagens') && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </header>
    </>
  );
};

export default Topbar;
