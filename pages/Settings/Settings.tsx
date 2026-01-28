
import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  Globe,
  Moon,
  ShieldCheck,
  UserCircle,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../modules/storage/storage.service';

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme, backgroundImage, setAppBackground } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(false);
  const [lang, setLang] = useState('Português (BR)');
  const [isUploadingBg, setIsUploadingBg] = useState(false);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }

    setIsUploadingBg(true);
    try {
      const timestamp = Date.now();
      const url = await StorageService.uploadFile(`users/${user.uid}/backgrounds/${timestamp}_${file.name}`, file);
      setAppBackground(url);
    } catch (error) {
      console.error("Erro ao atualizar background:", error);
      alert("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setIsUploadingBg(false);
    }
  };

  // Componente de Toggle customizado com design Thoth
  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-[#006c55] shadow-lg shadow-[#006c55]/20' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${active ? 'left-7' : 'left-1'}`}></div>
    </button>
  );

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      <div className="thoth-page-header">
        <h1 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase">Configurações</h1>
        <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Painel de Controle e Preferências</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Coluna de Categorias Principal */}
        <div className="lg:col-span-8 space-y-6">

          {/* Seção: Interface e Visual */}
          <div className="glass-panel rounded-2xl p-6 bg-white/70 dark:bg-slate-900/50 border border-white/40 dark:border-white/5 shadow-xl">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6 flex items-center gap-2">
              <UserCircle size={14} className="text-[#006c55]" /> Experiência de Usuário
            </h3>

            <div className="space-y-3">
              {/* MODO ESCURO */}
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/40 border border-white dark:border-white/5 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${isDarkMode ? 'bg-[#d9f1a2] text-[#006c55]' : 'bg-slate-100 text-slate-400'}`}>
                    <Moon size={18} fill={isDarkMode ? "currentColor" : "none"} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-slate-800 dark:text-slate-100">Interface Dark</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Otimizado para baixa luminosidade</p>
                  </div>
                </div>
                <Toggle active={isDarkMode} onToggle={toggleTheme} />
              </div>

              {/* BACKGROUND CUSTOMIZADO */}
              <div className="flex flex-col p-4 bg-white/50 dark:bg-slate-800/40 border border-white dark:border-white/5 rounded-2xl transition-all shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                      <ImageIcon size={18} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-800 dark:text-slate-100">Plano de Fundo</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Customize o visual do Thoth</p>
                    </div>
                  </div>
                  {backgroundImage && (
                    <button onClick={() => setAppBackground(null)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg transition-colors" title="Restaurar padrão">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="w-full">
                  <label className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-[#006c55] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group ${isUploadingBg ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploadingBg ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-[#006c55]" />
                        <span className="text-[11px] font-bold text-slate-500">Enviando imagem...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="text-slate-400 group-hover:text-[#006c55] transition-colors" />
                        <span className="text-[11px] font-bold text-slate-500 group-hover:text-[#006c55] transition-colors">Carregar Nova Imagem</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                      </>
                    )}
                  </label>
                  {backgroundImage && (
                    <p className="mt-2 text-[9px] text-[#006c55] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1">
                      <CheckCircle2 size={10} /> Imagem personalizada ativa
                    </p>
                  )}
                </div>
              </div>

              {/* IDIOMA */}
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/40 border border-white dark:border-white/5 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><Globe size={18} /></div>
                  <div>
                    <p className="text-[13px] font-black text-slate-800 dark:text-slate-100">Idioma do Ecossistema</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Sincronização Global Thoth</p>
                  </div>
                </div>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#006c55] focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 cursor-pointer shadow-sm"
                >
                  <option>Português (BR)</option>
                  <option>English (US)</option>
                  <option>Español</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção: Segurança */}
          <div className="glass-panel rounded-2xl p-6 bg-white/70 dark:bg-slate-900/50 border border-white/40 dark:border-white/5 shadow-xl">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6 flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#006c55]" /> Segurança & Privacidade
            </h3>

            <div className="space-y-3">
              {/* NOTIFICAÇÕES */}
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/40 border border-white dark:border-white/5 rounded-2xl transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${notifications ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-400'}`}>
                    <Bell size={18} fill={notifications ? "currentColor" : "none"} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-slate-800 dark:text-slate-100">Notificações em Tempo Real</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Alertas Thoth via Browser</p>
                  </div>
                </div>
                <Toggle active={notifications} onToggle={() => setNotifications(!notifications)} />
              </div>

              {/* PRIVACIDADE */}
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/40 border border-white dark:border-white/5 rounded-2xl transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${privacy ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-slate-800 dark:text-slate-100">Modo de Perfil Invisível</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Esconder status online e mural</p>
                  </div>
                </div>
                <Toggle active={privacy} onToggle={() => setPrivacy(!privacy)} />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Status e Infos */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status da Assinatura */}
          <div className="glass-panel rounded-2xl p-6 bg-slate-900 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#006c55]/30 rounded-full blur-[60px] pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 relative z-10">Licenciamento</h3>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <Smartphone size={24} className="text-[#d9f1a2]" />
              </div>
              <div>
                <p className="text-sm font-black">Thoth Creative Pro</p>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter flex items-center gap-1">
                  <CheckCircle2 size={10} /> Ativo via TICS ID
                </p>
              </div>
            </div>
            <button className="w-full py-3.5 bg-[#006c55] hover:bg-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2">
              Gerenciar Plano <ChevronRight size={14} />
            </button>
          </div>

          {/* Versão e Legal */}
          <div className="glass-panel rounded-2xl p-6 bg-white/70 dark:bg-slate-900/50 border border-white/40 dark:border-white/5 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Build 2.4.0 • Protocolo Neural 1.2</p>
              <div className="flex items-center justify-center gap-4 w-full pt-4 border-t border-slate-100 dark:border-white/5">
                <button className="text-[9px] font-black text-[#006c55] uppercase tracking-widest hover:underline">Políticas</button>
                <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                <button className="text-[9px] font-black text-[#006c55] uppercase tracking-widest hover:underline">Termos</button>
              </div>
              <div className="mt-6 flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/10 rounded-lg text-red-500 border border-red-100 dark:border-red-900/20">
                <ShieldAlert size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Sair de Todas as Sessões</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
