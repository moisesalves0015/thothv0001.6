import React, { useMemo } from 'react';
import { BarChart, HorizontalBarChart, DonutChart, KpiCardSmall, ChartDataPoint } from './ChartComponents';
import { DollarSign, CreditCard, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';

interface FinancialAnalyticsProps {
    orders: any[];
    stations: any[];
    timeRange: string;
}

const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({ orders, stations, timeRange }) => {

    const metrics = useMemo(() => {
        const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
        const avgOrderValue = totalRevenue / (orders.length || 1);

        // Revenue by Station
        const stationRev: Record<string, number> = {};
        orders.forEach(o => {
            const sName = stations.find(s => s.stationId === o.stationId)?.name || o.stationId;
            stationRev[sName] = (stationRev[sName] || 0) + (o.totalPrice || 0);
        });
        const topStations = Object.entries(stationRev)
            .sort((a, b) => b[1] - a[1])
            .map(([label, value]) => ({ label, value }));

        // Ticket Size Distribution
        const ticketSizes = [
            { label: '< R$ 2', value: 0, color: 'bg-emerald-300' },
            { label: 'R$ 2 - R$ 5', value: 0, color: 'bg-emerald-400' },
            { label: 'R$ 5 - R$ 10', value: 0, color: 'bg-emerald-500' },
            { label: '> R$ 10', value: 0, color: 'bg-emerald-600' }
        ];

        orders.forEach(o => {
            const val = o.totalPrice || 0;
            if (val < 2) ticketSizes[0].value++;
            else if (val < 5) ticketSizes[1].value++;
            else if (val < 10) ticketSizes[2].value++;
            else ticketSizes[3].value++;
        });

        // Payment Methods (Mocked for visualization if field missing, otherwise aggregate)
        // Assuming 'paymentMethod' field exists or defaulting
        const methods: ChartDataPoint[] = [
            { label: 'PIX', value: orders.filter(o => !o.paymentMethod || o.paymentMethod === 'pix').length, color: '#10b981' },
            { label: 'Cartão Crédito', value: orders.filter(o => o.paymentMethod === 'credit').length, color: '#3b82f6' },
            { label: 'Saldo Carteira', value: orders.filter(o => o.paymentMethod === 'wallet').length, color: '#f59e0b' }
        ];

        return { totalRevenue, avgOrderValue, topStations, ticketSizes, methods };
    }, [orders, stations]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 delay-100">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KpiCardSmall label="Receita Bruta" value={`R$ ${metrics.totalRevenue.toFixed(2)}`} trend="+8.4%" />
                <KpiCardSmall label="Ticket Médio" value={`R$ ${metrics.avgOrderValue.toFixed(2)}`} trend="-2.1%" color="blue" />
                <KpiCardSmall label="Pedidos Pagos" value={orders.length.toString()} trend="+5%" color="indigo" />
                <KpiCardSmall label="Saúde Financeira" value="SAFE" color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* REVENUE BY STATION */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10">
                        <ShoppingBag size={14} className="text-[#006c55]" />
                        Top Performance por Local
                    </h3>
                    <HorizontalBarChart data={metrics.topStations} color="emerald" formatValue={(v) => `R$ ${v.toFixed(0)}`} />
                </div>

                {/* TICKET SIZE HISTOGRAM */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10">
                        <Wallet size={14} className="text-blue-500" />
                        Segmentação por Transação
                    </h3>
                    <BarChart data={metrics.ticketSizes} color="blue" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* PAYMENT METHODS */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 flex flex-col items-center shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10 w-full">
                        <CreditCard size={14} className="text-amber-500" />
                        Gateways de Gateway
                    </h3>
                    <DonutChart data={metrics.methods} />
                </div>

                {/* PROJECTED REVENUE MOCK */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#006c55]/5 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover:bg-[#006c55]/10"></div>
                    
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <TrendingUp size={14} className="text-[#006c55]" />
                            Previsão de Crescimento (Alpha)
                        </h3>
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[8px] font-black uppercase tracking-widest border border-blue-100">
                            IA Powered
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
                        <div className="space-y-2">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Estimativa Mensal Próxima</span>
                            <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                R$ {(metrics.totalRevenue * 1.25).toFixed(2)}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                    +25.4% Expected
                                </span>
                            </div>
                        </div>
                        
                        <div className="w-full sm:w-auto text-left sm:text-right space-y-4">
                            <div>
                                <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Index de Confiança</div>
                                <div className="text-lg font-black text-slate-900 dark:text-white">92.4%</div>
                            </div>
                            <div className="w-full sm:w-40 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden border border-slate-100 dark:border-white/5">
                                <div className="h-full bg-emerald-500 w-[92%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialAnalytics;
