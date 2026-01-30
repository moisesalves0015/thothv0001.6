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
        <div className="space-y-6 animate-in fade-in duration-500 delay-100">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCardSmall label="Receita Bruta" value={`R$ ${metrics.totalRevenue.toFixed(2)}`} trend="+8.4%" />
                <KpiCardSmall label="Ticket Médio" value={`R$ ${metrics.avgOrderValue.toFixed(2)}`} trend="-2.1%" color="blue" />
                <KpiCardSmall label="Pedidos Pagos" value={orders.length.toString()} trend="+5%" color="indigo" />
                <KpiCardSmall label="Estornos" value="R$ 0,00" color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* REVENUE BY STATION */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <ShoppingBag size={16} className="text-emerald-500" />
                        Receita por Gráfica
                    </h3>
                    <HorizontalBarChart data={metrics.topStations} color="bg-emerald-500" formatValue={(v) => `R$ ${v.toFixed(0)}`} />
                </div>

                {/* TICKET SIZE HISTOGRAM */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Wallet size={16} className="text-blue-500" />
                        Distribuição de Ticket (Valor do Pedido)
                    </h3>
                    <BarChart data={metrics.ticketSizes} color="bg-blue-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PAYMENT METHODS */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 w-full">
                        <CreditCard size={16} className="text-amber-500" />
                        Métodos de Pagamento
                    </h3>
                    <DonutChart data={metrics.methods} />
                </div>

                {/* PROJECTED REVENUE MOCK */}
                <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#006c55]/10 rounded-full blur-3xl pointer-events-none"></div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <TrendingUp size={16} className="text-[#006c55]" />
                        Projeção Financeira (IA Beta)
                    </h3>
                    <div className="flex items-center justify-between h-32 px-4">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-500 font-bold uppercase">Previsão Mês</span>
                            <div className="text-4xl font-black text-white">R$ {(metrics.totalRevenue * 1.2).toFixed(2)}</div>
                            <span className="text-[10px] text-emerald-500 font-black">+20% vs Mês Anterior</span>
                        </div>
                        <div className="text-right space-y-2">
                            <div className="text-[10px] text-slate-500 font-mono">Confiança do Modelo</div>
                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[85%]"></div>
                            </div>
                            <div className="text-[10px] text-white font-black">85% HIGH</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialAnalytics;
