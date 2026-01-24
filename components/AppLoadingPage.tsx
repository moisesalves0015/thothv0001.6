import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    GraduationCap,
    Users,
    Sparkles,
    Target,
    Calendar,
    Search,
    Briefcase,
    Layers,
    Brain,
    Globe,
    Zap,
    Feather,
    Cpu,
    Atom,
    Code,
    Palette,
    TrendingUp,
    Shield,
    Lock,
    Rocket
} from 'lucide-react';

const AppLoadingPage: React.FC = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [pulsingElements, setPulsingElements] = useState<number[]>([]);

    const loadingSteps = [
        { icon: Shield, text: 'Verificando segurança', color: 'text-emerald-500' },
        { icon: BookOpen, text: 'Carregando materiais', color: 'text-blue-500' },
        { icon: Users, text: 'Sincronizando comunidade', color: 'text-purple-500' },
        { icon: Brain, text: 'Otimizando conhecimento', color: 'text-amber-500' },
        { icon: Rocket, text: 'Preparando ambiente', color: 'text-rose-500' },
    ];

    useEffect(() => {
        const totalSteps = 100;
        const stepDuration = 30; // ms
        const stepIncrement = 1;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => navigate('/home'), 500);
                    return 100;
                }

                const newProgress = prev + stepIncrement;

                // Atualizar passo atual baseado no progresso
                const stepIndex = Math.floor((newProgress / 100) * (loadingSteps.length - 1));
                setCurrentStep(stepIndex);

                // Gerar elementos pulsantes aleatórios
                if (Math.random() > 0.7) {
                    const newPulse = Math.floor(Math.random() * 12);
                    setPulsingElements(prev => [...prev.slice(-3), newPulse]);

                    // Remover após animação
                    setTimeout(() => {
                        setPulsingElements(prev => prev.filter(p => p !== newPulse));
                    }, 1000);
                }

                return newProgress;
            });
        }, stepDuration);

        return () => clearInterval(timer);
    }, [navigate]);

    const getBackgroundPattern = () => {
        return Array.from({ length: 12 }, (_, i) => {
            const isPulsing = pulsingElements.includes(i);
            const size = 40 + (i % 4) * 15;
            const top = 10 + Math.sin(i * 0.5) * 40 + '%';
            const left = 10 + Math.cos(i * 0.8) * 80 + '%';

            const icons = [BookOpen, GraduationCap, Sparkles, Target, Calendar, Search, Briefcase, Layers, Brain, Globe, Zap, Feather];
            const Icon = icons[i % icons.length];

            return (
                <div
                    key={i}
                    className={`absolute rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/5 backdrop-blur-sm flex items-center justify-center transition-all duration-700 ${isPulsing ? 'scale-110 opacity-70' : 'opacity-30'}`}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        top,
                        left,
                        animation: `float ${3 + i % 4}s ease-in-out infinite ${i * 0.2}s`,
                    }}
                >
                    <Icon size={size * 0.4} className="text-white/20" />
                </div>
            );
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-[#006c55]/20 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
            {/* Animated Background Elements */}
            {getBackgroundPattern()}

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 20 }, (_, i) => (
                    <div
                        key={`particle-${i}`}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md px-6">
                {/* Logo & Branding */}
                <div className="mb-12 text-center animate-in fade-in zoom-in-95 duration-700">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
                        <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-white to-white/90 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                            <BookOpen size={48} className="text-[#006c55]" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                            <Sparkles size={20} className="text-white" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
                        thoth
                    </h1>
                    <p className="text-sm font-bold text-white/70 uppercase tracking-[0.3em]">
                        Plataforma do Conhecimento
                    </p>
                </div>

                {/* Loading Container */}
                <div className="w-full space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="font-bold text-white/60 uppercase tracking-wider">Carregando Experiência</span>
                            <span className="font-black text-white">{progress}%</span>
                        </div>

                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                        </div>
                    </div>

                    {/* Loading Steps */}
                    <div className="space-y-4">
                        {loadingSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index <= currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <div
                                    key={index}
                                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${isActive
                                        ? 'bg-white/5 border border-white/10'
                                        : 'opacity-40'
                                        } ${isCurrent ? 'scale-[1.02] shadow-lg shadow-white/5' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${isActive
                                        ? `${step.color.replace('text-', 'bg-')}/20 border ${step.color.replace('text-', 'border-')}/20`
                                        : 'bg-white/5 border border-white/5'
                                        }`}>
                                        <Icon size={20} className={isActive ? step.color : 'text-white/30'} />
                                    </div>
                                    <div className="flex-1">
                                        <span className={`text-sm font-bold transition-all duration-500 ${isActive ? 'text-white' : 'text-white/40'}`}>
                                            {step.text}
                                        </span>
                                        {isCurrent && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex gap-1">
                                                    {[0, 1, 2].map(i => (
                                                        <div
                                                            key={i}
                                                            className="w-1 h-1 bg-white/60 rounded-full animate-pulse"
                                                            style={{ animationDelay: `${i * 0.2}s` }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-white/50">Processando...</span>
                                            </div>
                                        )}
                                    </div>
                                    {isActive && (
                                        <div className={`w-2 h-2 rounded-full ${isCurrent ? 'animate-ping bg-emerald-400' : 'bg-emerald-500'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats Preview */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                        <div className="text-center">
                            <div className="text-2xl font-black text-white mb-1 animate-countup" style={{ '--count': '1.2K' } as any}>
                                {Math.floor(1200 * (progress / 100))}+
                            </div>
                            <div className="text-xs font-bold text-white/50 uppercase tracking-wider">Estudantes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-white mb-1 animate-countup" style={{ '--count': '356' } as any}>
                                {Math.floor(356 * (progress / 100))}
                            </div>
                            <div className="text-xs font-bold text-white/50 uppercase tracking-wider">Publicações</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-white mb-1 animate-countup" style={{ '--count': '89' } as any}>
                                {Math.floor(89 * (progress / 100))}
                            </div>
                            <div className="text-xs font-bold text-white/50 uppercase tracking-wider">Projetos</div>
                        </div>
                    </div>
                </div>

                {/* Loading Quote */}
                <div className="mt-12 text-center">
                    <div className="relative">
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-4xl text-white/20">"</div>
                        <p className="text-sm font-medium text-white/60 italic max-w-sm leading-relaxed">
                            O conhecimento compartilhado é a única coisa que aumenta quando dividido
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Thoth University</span>
                            <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Decorative Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes countup {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-countup {
          animation: countup 0.5s ease-out forwards;
        }
        
        .animate-in {
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .slide-in-from-bottom-8 {
          animation: slideInFromBottom 0.8s ease-out;
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .zoom-in-95 {
          animation: zoomIn 0.6s ease-out;
        }
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default AppLoadingPage;
