import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const InstallPWA: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Instalar Thoth App</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Instale nossa aplicação para acessar offline e ter uma experiência melhor.
                    </p>
                    <button
                        onClick={handleInstallClick}
                        className="flex items-center gap-2 px-4 py-2 bg-[#006c55] hover:bg-[#005a46] text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-[#006c55]/20"
                    >
                        <Download size={14} />
                        Instalar Agora
                    </button>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default InstallPWA;
