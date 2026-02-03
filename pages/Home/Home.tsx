import React from 'react';
import SidebarFeed from '../../components/shared/SidebarFeed';
import ConnectionSuggestions from './components/ConnectionSuggestions';
import RemindersBox from './components/RemindersBox';
import EventSuggestionsBox from './components/EventSuggestionsBox';
import ResearchSuggestionsBox from './components/ResearchSuggestionsBox';
import PrintHistoryBox from './components/PrintHistoryBox';
import { auth } from '../../firebase';
import { useEffect, useState } from 'react';
import { Smartphone, Plus } from 'lucide-react';

const Home: React.FC = () => {
  const firstName = auth.currentUser?.displayName?.split(' ')[0] || "Estudante";
  const [subtitle, setSubtitle] = useState("Confira o que há de novo na Thoth.");
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const phrases = [
      "Confira o que há de novo na Thoth.",
      "Pronto para mais um dia de aprendizado?",
      "Sua jornada acadêmica começa aqui.",
      "Conecte-se com colegas e compartilhe conhecimento.",
      "Thoth: seu hub educacional inteligente."
    ];

    // Frase aleatória ao carregar
    setSubtitle(phrases[Math.floor(Math.random() * phrases.length)]);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar se já é PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setCanInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setCanInstall(false);
  };

  return (
    <div className="flex flex-col gap-[20px] mt-0 animate-in fade-in duration-500">
      <div className="thoth-page-header hidden lg:flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Bem-vindo, {firstName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{subtitle}</p>
        </div>

        {canInstall && (
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#006c55] hover:bg-[#005a46] text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#006c55]/20 active:scale-95 group"
          >
            <Smartphone size={18} className="group-hover:bounce" />
            Ter Thoth no Menu de Apps
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <Plus size={12} />
            </div>
          </button>
        )}
      </div>

      <section className="w-full min-h-[480px]">
        <SidebarFeed title="Feed" />
      </section>

      <div className="flex flex-col lg:flex-row gap-[30px] w-full">
        <div className="w-full lg:w-[660px]">
          <ConnectionSuggestions />
        </div>
        <div className="w-full lg:w-[315px]">
          <RemindersBox />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-[30px] w-full">
        <div className="w-full lg:w-[660px] flex flex-col gap-6">
          <EventSuggestionsBox />
          <ResearchSuggestionsBox />
        </div>
        <div className="w-full lg:w-[315px]">
          <PrintHistoryBox />
        </div>
      </div>
    </div>
  );
};

export default Home;