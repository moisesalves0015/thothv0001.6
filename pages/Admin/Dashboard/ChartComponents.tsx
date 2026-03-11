import React from 'react';

// --- Types ---
export interface ChartDataPoint {
    label: string;
    value: number;
    subLabel?: string;
    color?: string;
}

interface ChartProps {
    data: ChartDataPoint[];
    color?: string; // Tailwind color name e.g. 'emerald'
    height?: string;
    formatValue?: (val: number) => string;
}

// --- Helper: Tailwind to Hex (Reduced set for demo) ---
const getColorHex = (name: string) => {
    const map: Record<string, string> = {
        emerald: '#10b981', blue: '#3b82f6', indigo: '#6366f1',
        rose: '#f43f5e', amber: '#f59e0b', purple: '#a855f7',
        cyan: '#06b6d4', slate: '#64748b'
    };
    return map[name.split('-')[0]] || '#3b82f6';
};

// --- Area Chart (New: Premium CRM Trend) ---
export const AreaChart: React.FC<ChartProps> = ({ data, color = 'emerald', height = 'h-64', formatValue }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1) * 1.1; // 10% buffering
    const hex = getColorHex(color);

    // Generate SVG path
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.value / maxVal) * 100;
        return `${x},${y}`;
    }).join(' ');

    const fillPath = `0,100 ${points} 100,100`;
    const linePath = points;

    return (
        <div className={`w-full ${height} relative group`}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={hex} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={hex} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Fill */}
                <polygon points={fillPath} fill={`url(#grad-${color})`} className="transition-all duration-700 ease-out" />
                {/* Line */}
                <polyline points={linePath} fill="none" stroke={hex} strokeWidth="1" vectorEffect="non-scaling-stroke" className="drop-shadow-sm" />
                {/* Points */}
                {data.map((d, i) => (
                    <circle
                        key={i}
                        cx={(i / (data.length - 1)) * 100}
                        cy={100 - (d.value / maxVal) * 100}
                        r="3"
                        fill="white"
                        stroke={hex}
                        strokeWidth="2"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
            </svg>
            {/* Tooltip Overlay (Simplified mapping) */}
            <div className="absolute inset-0 flex justify-between items-end">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 h-full relative group/point">
                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 px-4 py-2 rounded-2xl shadow-2xl opacity-0 group-hover/point:opacity-100 transition-all pointer-events-none z-20 min-w-[100px]">
                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{d.label}</div>
                            <div className="text-sm font-black text-slate-900 dark:text-white leading-none">
                                {formatValue ? formatValue(d.value) : d.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Enhanced Bar Chart ---
export const BarChart: React.FC<ChartProps> = ({ data, color = 'blue', height = 'h-64', formatValue }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const hex = getColorHex(color);

    return (
        <div className={`flex items-end gap-2 ${height} w-full`}>
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                    <div
                        className="w-full rounded-2xl relative min-h-[4px] transition-all duration-700 ease-out group-hover:translate-y-[-4px]"
                        style={{
                            height: `${(d.value / maxVal) * 100}%`,
                            background: `linear-gradient(to top, ${hex}05, ${hex}CC, ${hex})`,
                            boxShadow: `0 4px 12px ${hex}20`
                        }}
                    >
                    </div>
                    {data.length <= 15 && (
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover:text-slate-900 dark:group-hover:text-white">
                            {d.label}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

// --- Enhanced Horizontal Bar ---
export const HorizontalBarChart: React.FC<ChartProps> = ({ data, color = 'emerald', formatValue }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const hex = getColorHex(color);

    return (
        <div className="space-y-5 w-full">
            {data.map((d, i) => (
                <div key={i} className="group relative">
                    <div className="flex justify-between items-end mb-2 z-10 relative px-1">
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-all uppercase tracking-widest truncate pr-4">{d.label}</span>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-400 group-hover:text-[#006c55] transition-colors leading-none">
                            {formatValue ? formatValue(d.value) : d.value}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 dark:bg-white/[0.03] rounded-full overflow-hidden relative border border-slate-100 dark:border-white/5">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out relative z-10"
                            style={{
                                width: `${(d.value / maxVal) * 100}%`,
                                backgroundColor: hex,
                                boxShadow: `0 0 15px ${hex}30`
                            }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Modern Donut Chart ---
export const DonutChart: React.FC<{ data: ChartDataPoint[], size?: string }> = ({ data, size = 'w-48 h-48' }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
    let currentDeg = 0;

    // Use predefined fancy palette
    const palette = ['#006c55', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

    const segments = data.map((d, i) => {
        const deg = (d.value / total) * 360;
        const color = d.color || palette[i % palette.length];
        const segment = `${color} ${currentDeg}deg ${currentDeg + deg}deg`;
        currentDeg += deg;
        return segment;
    }).join(', ');

    return (
        <div className="flex flex-col items-center">
            <div className={`${size} rounded-[40px] relative p-5 group transition-transform duration-700 hover:rotate-6`} style={{ background: `conic-gradient(${segments})` }}>
                <div className="absolute inset-[4px] bg-white dark:bg-slate-900 rounded-[36px] flex flex-col items-center justify-center z-10 shadow-inner">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{total}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mt-2">Volume Total</span>
                </div>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-default">
                        <div className="w-2 h-2 rounded-full transition-transform group-hover:scale-150" style={{ backgroundColor: d.color || palette[i % palette.length] }}></div>
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Premium KPI Card ---
export const KpiCardSmall: React.FC<{ label: string, value: string, trend?: string, color?: string }> = ({ label, value, trend, color = 'emerald' }) => {
    const hex = getColorHex(color);
    return (
        <div className="relative overflow-hidden bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[32px] p-8 shadow-sm group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 dark:from-white/[0.02] to-transparent pointer-events-none opacity-50"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">{label}</p>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hex }}></div>
                </div>
                
                <div className="flex items-end justify-between">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</span>
                    {trend && (
                        <div className={`flex items-center px-2 py-1 rounded-xl text-[10px] font-black border ${
                            trend.startsWith('+') 
                                ? 'text-emerald-500 border-emerald-100 bg-emerald-50' 
                                : 'text-red-500 border-red-100 bg-red-50'
                        }`}>
                            {trend}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
