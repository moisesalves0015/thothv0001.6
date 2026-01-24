
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  Bell,
  ChevronLeft,
  User as UserIcon,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/index';

const UtilityHeader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsCount] = useState(3);
  const [messagesCount] = useState(2);

  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const userAvatar = user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Thoth'}`;
  const userName = user?.displayName || "Estudante";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut(auth);
      setProfileDropdownOpen(false);
      navigate('/login');
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }
  };

  const navigateTo = (path: string) => {
    setProfileDropdownOpen(false);
    navigate(path);
  };

  return (
    <header className="flex items-center justify-between w-full h-[64px] mb-4 bg-transparent gap-2 md:gap-4 box-border relative utility-header-transparent">
      <div className="flex items-center flex-shrink-0">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-[#006c55] hover:text-white dark:hover:bg-[#006c55] dark:hover:text-white transition-all shadow-sm active:scale-90"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="flex-1 h-10 md:h-12 relative min-w-0">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim()) {
            navigate(`/explorar?q=${encodeURIComponent(searchQuery.trim())}`);
          }
        }} className="relative flex items-center w-full h-full">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full pl-5 pr-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all text-[16px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
          />
          <button type="submit" className="absolute right-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-[#006c55] to-[#00876a] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg border-none">
            <Search size={18} />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/mensagens')}
          className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-[#006c55] hover:text-white transition-all shadow-sm active:scale-90"
        >
          <MessageCircle size={18} />
          {messagesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {messagesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate('/notificacoes')}
          className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-[#006c55] hover:text-white transition-all shadow-sm active:scale-90"
        >
          <Bell size={18} />
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {notificationsCount}
            </span>
          )}
        </button>

        <div className="relative hidden lg:flex items-center h-12 ml-2" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <img src={userAvatar} className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" alt="Perfil" />
            <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[100px]">{userName}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-[1001] animate-in fade-in slide-in-from-top-2 duration-300">
              <button onClick={() => navigateTo('/perfil')} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-[#006c55]/5 hover:text-[#006c55]">
                <UserIcon size={16} /> Perfil
              </button>
              <button onClick={() => navigateTo('/configuracoes')} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-[#006c55]/5 hover:text-[#006c55]">
                <Settings size={16} /> Configuração
              </button>
              <button onClick={() => navigateTo('/suporte')} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-[#006c55]/5 hover:text-[#006c55]">
                <LifeBuoy size={16} /> Suporte
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-4"></div>
              <a href="#" onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={16} /> Sair
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UtilityHeader;
