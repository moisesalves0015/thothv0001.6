import React from 'react';
import { Users } from 'lucide-react';

interface StatsHeaderProps {
    connectionCount: number;
    pendingCount: number;
    sentCount?: number;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ connectionCount, pendingCount, sentCount = 0 }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Users className="text-[#006c55]" size={32} />
                    Networking
                </h1>
                <p className="text-slate-500 font-medium mt-2 max-w-lg leading-relaxed">
                    Expanda sua rede profissional da ufersa.
                    Conecte-se com alunos, professores e pesqusiadores.
                </p>
            </div>

            <div className="flex gap-4">
                <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[100px] transition-all hover:shadow-md hover:border-[#006c55]/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Conexões</span>
                    <span className="text-2xl font-black text-[#006c55]">{connectionCount}</span>
                </div>
                {pendingCount > 0 && (
                    <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[100px] transition-all hover:shadow-md hover:border-amber-500/20">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recebidas</span>
                        <span className="text-2xl font-black text-amber-500">{pendingCount}</span>
                    </div>
                )}
                {sentCount > 0 && (
                    <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[100px] transition-all hover:shadow-md hover:border-blue-500/20">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Enviadas</span>
                        <span className="text-2xl font-black text-blue-500">{sentCount}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsHeader;
