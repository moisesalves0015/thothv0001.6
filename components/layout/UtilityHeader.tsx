
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  Bell,
  ChevronLeft,
  Calendar as CalendarIcon,
  User as UserIcon,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronDown,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/index';
import { ChatService } from '../../modules/chat/chat.service';
import { NotificationService } from '../../modules/notification/notification.service';

const UtilityHeader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);

  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Sincronizar campo de busca com a URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const userAvatar = user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || 'Thoth'}`;
  const userName = user?.displayName || "Estudante";

  useEffect(() => {
    if (!user?.uid) return;

    let unsubMessages: (() => void) | undefined;
    let unsubNotifs: (() => void) | undefined;

    try {
      // Subscribe to Message Count
      unsubMessages = ChatService.subscribeToUnreadCount(user.uid, (count) => {
        setMessagesCount(count);
      });

      // Subscribe to Notification Count
      unsubNotifs = NotificationService.subscribeToUnreadCount(user.uid, (count) => {
        setNotificationsCount(count);
      });
    } catch (error) {
      console.error("Error setting up subscriptions:", error);
    }

    return () => {
      try {
        if (unsubMessages) unsubMessages();
        if (unsubNotifs) unsubNotifs();
      } catch (error) {
        console.error("Error unsubscribing:", error);
      }
    };
  }, [user?.uid]);

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
    <header className="flex items-center justify-between w-full h-[52px] md:h-[64px] mb-2 md:mb-4 bg-transparent gap-2 md:gap-4 box-border relative utility-header-transparent">
      <style>{`
        @keyframes badge-pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(225, 29, 72, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
        }
        @keyframes badge-pulse-amber {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        .animate-badge-rose { animation: badge-pulse 2s infinite; }
        .animate-badge-amber { animation: badge-pulse-amber 2s infinite; }
      `}</style>
      <div className="flex items-center flex-shrink-0 gap-1.5 md:gap-3">
        {location.pathname !== '/home' && location.pathname !== '/' ? (
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full liquid-glass text-slate-700 dark:text-slate-300 hover:bg-[#006c55] hover:text-white dark:hover:bg-[#006c55] dark:hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <button
            onClick={() => navigate('/calendario')}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full liquid-glass text-slate-700 dark:text-slate-300 hover:bg-[#006c55] hover:text-white dark:hover:bg-[#006c55] dark:hover:text-white transition-all active:scale-90 shadow-sm border border-white/40 dark:border-white/5"
            title="Super Calendário"
          >
            <CalendarIcon size={20} />
          </button>
        )}

        {location.pathname === '/mensagens' && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('thoth:create-group'))}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full liquid-glass text-slate-700 dark:text-slate-300 hover:bg-[#006c55] hover:text-white dark:hover:bg-[#006c55] dark:hover:text-white transition-all active:scale-90 shadow-sm border border-white/40 dark:border-white/5"
            title="Criar Novo Grupo"
          >
            <Plus size={20} />
          </button>
        )}

        {location.pathname === '/badges' && (
          <button
            onClick={() => navigate('/badges/create')}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full liquid-glass text-slate-700 dark:text-slate-300 hover:bg-[#006c55] hover:text-white dark:hover:bg-[#006c55] dark:hover:text-white transition-all active:scale-90 shadow-sm border border-white/40 dark:border-white/5"
            title="Criar Novo Emblema"
          >
            <Plus size={20} />
          </button>
        )}
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
            className="w-full h-full pl-5 pr-12 rounded-full liquid-glass focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all text-[16px] text-slate-900 dark:text-white placeholder-slate-700 dark:placeholder-slate-300"
          />
          <button type="submit" className="absolute right-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-[#006c55] to-[#00876a] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg border-none">
            <Search size={18} />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/mensagens')}
          className={`relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all active:scale-90 group ${location.pathname === '/mensagens' ? 'bg-[#006c55] text-white' : 'liquid-glass text-slate-700 dark:text-slate-300 hover:bg-[#006c55] hover:text-white'}`}
        >
          <MessageCircle size={18} />
          {messagesCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-tr from-rose-500 to-red-600 text-white text-[9px] font-black items-center justify-center shadow-lg animate-badge-rose">
                {messagesCount > 9 ? '9+' : messagesCount}
              </span>
            </span>
          )}
        </button>

        <button
          onClick={() => navigate('/notificacoes')}
          className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full liquid-glass text-slate-700 dark:text-slate-300 hover:bg-[#006c55] hover:text-white transition-all active:scale-90 group"
        >
          <Bell size={18} />
          {notificationsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-tr from-amber-500 to-orange-600 text-white text-[9px] font-black items-center justify-center shadow-lg animate-badge-amber">
                {notificationsCount > 9 ? '9+' : notificationsCount}
              </span>
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
