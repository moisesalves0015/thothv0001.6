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
        <div className="space-y-10 animate-in fade-in duration-700 delay-200">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KpiCardSmall label="Total Páginas" value={metrics.totalPages.toLocaleString()} color="emerald" />
                <KpiCardSmall label="Páginas/Doc" value="12.4" trend="-0.5%" color="blue" />
                <KpiCardSmall label="Taxa de Cores" value={((metrics.colorData[1].value / (orders.length || 1)) * 100).toFixed(0) + '%'} color="amber" />
                <KpiCardSmall label="Adoção Duplex" value={((metrics.duplexData[1].value / (orders.length || 1)) * 100).toFixed(0) + '%'} trend="+5%" color="green" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* FILE TYPES */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 flex flex-col items-center shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10 w-full text-center">
                        <FileText size={14} className="text-red-500" />
                        Formatos de Origem
                    </h3>
                    <DonutChart data={metrics.topFileTypes} />
                </div>

                {/* COLOR MODE */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 flex flex-col items-center shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10 w-full text-center">
                        <Palette size={14} className="text-amber-500" />
                        Espectro de Cores
                    </h3>
                    <DonutChart data={metrics.colorData} />
                </div>

                {/* DUPLEX MODE */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 flex flex-col items-center shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10 w-full text-center">
                        <Layers size={14} className="text-emerald-500" />
                        Arquitetura de Folha
                    </h3>
                    <DonutChart data={metrics.duplexData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PAGE COUNT HISTOGRAM */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10">
                        <Scissors size={14} className="text-slate-400" />
                        Nível de Densidade de Conteúdo
                    </h3>
                    <BarChart data={metrics.pageBuckets} color="slate" />
                </div>

                {/* SERVICE EFFICIENCY */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10">
                        <Printer size={14} className="text-indigo-500" />
                        Logística Operacional
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 group hover:border-indigo-200 transition-all">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Time Médio</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white">45s <span className="text-[9px] text-slate-400 ml-1">/ PÁGINA</span></span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-emerald-50/30 dark:bg-white/5 rounded-3xl border border-emerald-100/30 dark:border-white/5 group hover:border-emerald-200 transition-all">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Rate</span>
                            <span className="text-xs font-black text-emerald-600">99.8%</span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-amber-50/30 dark:bg-white/5 rounded-3xl border border-amber-100/30 dark:border-white/5 group hover:border-amber-200 transition-all">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pico de Demanda</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase">14:00 - 16:00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceAnalytics;
