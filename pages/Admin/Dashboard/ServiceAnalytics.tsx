import React, { useMemo } from 'react';
import { BarChart, HorizontalBarChart, DonutChart, KpiCardSmall, ChartDataPoint } from './ChartComponents';
import { Printer, FileText, Layers, Scissors, Palette } from 'lucide-react';

interface ServiceAnalyticsProps {
    orders: any[];
}

const ServiceAnalytics: React.FC<ServiceAnalyticsProps> = ({ orders }) => {

    const metrics = useMemo(() => {
        let totalPages = 0;
        const colorMode = { color: 0, bw: 0 };
        const duplexMode = { simplex: 0, duplex: 0 };
        const fileTypes: Record<string, number> = {};

        // Buckets for pages per doc
        const pageBuckets = [
            { label: '1-5 pgs', value: 0 },
            { label: '6-20 pgs', value: 0 },
            { label: '21-50 pgs', value: 0 },
            { label: '50+ pgs', value: 0 }
        ];

        orders.forEach(o => {
            totalPages += (o.totalPages || 0);

            if (o.color) colorMode.color++; else colorMode.bw++;
            if (o.duplex) duplexMode.duplex++; else duplexMode.simplex++;

            const ext = o.fileName ? o.fileName.split('.').pop().toLowerCase() : 'unknown';
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;

            const pages = o.totalPages || 0;
            if (pages <= 5) pageBuckets[0].value++;
            else if (pages <= 20) pageBuckets[1].value++;
            else if (pages <= 50) pageBuckets[2].value++;
            else pageBuckets[3].value++;
        });

        const topFileTypes: ChartDataPoint[] = Object.entries(fileTypes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value], i) => ({
                label: label.toUpperCase(),
                value,
                color: i === 0 ? '#ef4444' : i === 1 ? '#3b82f6' : '#10b981' // Red (PDF usually), Blue (Doc), Green (Img)
            }));

        const colorData: ChartDataPoint[] = [
            { label: 'P&B (Mono)', value: colorMode.bw, color: '#94a3b8' },
            { label: 'Colorido', value: colorMode.color, color: '#f59e0b' }
        ];

        const duplexData: ChartDataPoint[] = [
            { label: 'Frente (Simplex)', value: duplexMode.simplex, color: '#3b82f6' },
            { label: 'Frente e Verso', value: duplexMode.duplex, color: '#10b981' }
        ];

        return { totalPages, topFileTypes, colorData, duplexData, pageBuckets };
    }, [orders]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 delay-200">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCardSmall label="Total Páginas Impressas" value={metrics.totalPages.toLocaleString()} color="emerald" />
                <KpiCardSmall label="Média Páginas/Doc" value="12" trend="-0.5%" color="blue" />
                <KpiCardSmall label="Docs Coloridos" value={((metrics.colorData[1].value / (orders.length || 1)) * 100).toFixed(0) + '%'} color="amber" />
                <KpiCardSmall label="Economia Papel (Duplex)" value={((metrics.duplexData[1].value / (orders.length || 1)) * 100).toFixed(0) + '%'} trend="+5%" color="green" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FILE TYPES */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 w-full">
                        <FileText size={16} className="text-red-500" />
                        Tipos de Arquivo
                    </h3>
                    <DonutChart data={metrics.topFileTypes} />
                </div>

                {/* COLOR MODE */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 w-full">
                        <Palette size={16} className="text-amber-500" />
                        Cor vs P&B
                    </h3>
                    <DonutChart data={metrics.colorData} />
                </div>

                {/* DUPLEX MODE */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 w-full">
                        <Layers size={16} className="text-emerald-500" />
                        Modo de Impressão
                    </h3>
                    <DonutChart data={metrics.duplexData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PAGE COUNT HISTOGRAM */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Scissors size={16} className="text-slate-400" />
                        Tamanho dos Documentos (Páginas)
                    </h3>
                    <BarChart data={metrics.pageBuckets} color="bg-slate-500" />
                </div>

                {/* SERVICE EFFICIENCY */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Printer size={16} className="text-indigo-500" />
                        Eficiência de Serviço
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-400">Tempo Médio de Impressão</span>
                            <span className="text-sm font-black text-white">45s / pág</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-400">Taxa de Falha</span>
                            <span className="text-sm font-black text-emerald-500">0.2%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-400">Pico de Utilização</span>
                            <span className="text-sm font-black text-amber-500">14:00 - 16:00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceAnalytics;
