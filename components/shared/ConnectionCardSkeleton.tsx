import React from 'react';

const ConnectionCardSkeleton: React.FC = () => {
    return (
        <div className="flex-shrink-0 w-[190px] h-[260px] relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 animate-pulse">
            {/* Fundo */}
            <div className="absolute inset-0 bg-slate-200" />

            {/* Painel Inferior */}
            <div className="absolute bottom-2 left-2 right-2 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 flex flex-col gap-2">
                {/* Nome e Titulo */}
                <div className="space-y-1">
                    <div className="h-3 w-3/4 bg-slate-300 rounded-full" />
                    <div className="h-2 w-1/2 bg-slate-300 rounded-full" />
                </div>

                {/* Linha de baixo */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                    <div className="flex gap-1">
                        <div className="h-2 w-4 bg-slate-300 rounded-full" />
                        <div className="h-2 w-4 bg-slate-300 rounded-full" />
                    </div>
                    <div className="h-6 w-6 rounded-full bg-slate-300" />
                </div>
            </div>
        </div>
    );
};

export default ConnectionCardSkeleton;
