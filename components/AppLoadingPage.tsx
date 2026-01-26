import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Shield, Users, Brain, Rocket } from 'lucide-react';

const AppLoadingPage: React.FC = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => navigate('/home'), 300);
                    return 100;
                }
                return prev + 2;
            });
        }, 40);

        return () => clearInterval(timer);
    }, [navigate]);

    const loadingSteps = [
        { icon: Shield, text: 'Segurança', active: progress > 20 },
        { icon: BookOpen, text: 'Conteúdo', active: progress > 40 },
        { icon: Users, text: 'Comunidade', active: progress > 60 },
        { icon: Brain, text: 'Sistema', active: progress > 80 },
        { icon: Rocket, text: 'Pronto', active: progress === 100 },
    ];

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6">
            {/* Logo Principal */}
            <div className="mb-10 text-center">
                <div className="w-20 h-20 mx-auto bg-[#006c55] rounded-2xl flex items-center justify-center shadow-lg mb-4">
                    <BookOpen size={36} className="text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">thoth</h1>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">
                    Plataforma do Conhecimento
                </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mb-8">
                <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold text-slate-600">Carregando</span>
                    <span className="font-black text-[#006c55]">{progress}%</span>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#006c55] rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Loading Steps */}
            <div className="flex justify-center gap-4 mb-12">
                {loadingSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <div key={index} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step.active
                                ? 'bg-[#006c55] text-white'
                                : 'bg-slate-100 text-slate-400'
                                }`}>
                                <Icon size={18} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${step.active
                                ? 'text-[#006c55]'
                                : 'text-slate-400'
                                }`}>
                                {step.text}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Loading Indicator */}
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-2 h-2 bg-[#006c55] rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        />
                    ))}
                </div>
                <span className="text-sm font-medium text-slate-600">
                    {progress === 100 ? 'Pronto!' : 'Inicializando...'}
                </span>
            </div>

            {/* Simple Decorative Element */}
            <div className="absolute bottom-8">
                <div className="flex items-center gap-2 text-slate-400">
                    <Sparkles size={12} />
                    <span className="text-xs font-medium">Thoth University • 2024</span>
                </div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default AppLoadingPage;