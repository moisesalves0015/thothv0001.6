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
export const AreaChart: React.FC<ChartProps> = ({ data, color = 'emerald', height = 'h-64' }) => {
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
                        <stop offset="0%" stopColor={hex} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={hex} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Fill */}
                <polygon points={fillPath} fill={`url(#grad-${color})`} className="transition-all duration-700 ease-out" />
                {/* Line */}
                <polyline points={linePath} fill="none" stroke={hex} strokeWidth="0.5" vectorEffect="non-scaling-stroke" className="drop-shadow-lg" />
                {/* Points */}
                {data.map((d, i) => (
                    <circle
                        key={i}
                        cx={(i / (data.length - 1)) * 100}
                        cy={100 - (d.value / maxVal) * 100}
                        r="1.5"
                        fill="#000"
                        stroke={hex}
                        strokeWidth="0.5"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
            </svg>
            {/* Tooltip Overlay (Simplified mapping) */}
            <div className="absolute inset-0 flex justify-between items-end">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 h-full relative group/point">
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover/point:opacity-100 transition-all pointer-events-none z-20">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{d.label}</div>
                            <div className="text-sm font-black text-white">{d.value}</div>
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
        <div className={`flex items-end gap-1.5 ${height} w-full`}>
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                    <div
                        className={`w-full rounded-t-[4px] relative min-h-[4px] transition-all duration-500 ease-out group-hover:translate-y-[-2px]`}
                        style={{
                            height: `${(d.value / maxVal) * 100}%`,
                            background: `linear-gradient(to top, ${hex}10, ${hex})`
                        }}
                    >
                        {/* Glow */}
                        <div className={`absolute inset-0 bg-${color}-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    </div>
                    {data.length <= 15 && (
                        <span className="text-[9px] font-medium text-slate-500 font-mono rotate-0 group-hover:text-white transition-colors">{d.label}</span>
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
        <div className="space-y-4 w-full">
            {data.map((d, i) => (
                <div key={i} className="group relative">
                    <div className="flex justify-between items-end mb-1.5 z-10 relative">
                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors truncate pr-4">{d.label}</span>
                        <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-${color}-400 transition-colors">
                            {formatValue ? formatValue(d.value) : d.value}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden relative">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out relative z-10"
                            style={{
                                width: `${(d.value / maxVal) * 100}%`,
                                backgroundColor: hex,
                                boxShadow: `0 0 10px ${hex}40`
                            }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Modern Donut Chart ---
export const DonutChart: React.FC<{ data: ChartDataPoint[], size?: string }> = ({ data, size = 'w-40 h-40' }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
    let currentDeg = 0;

    // Use predefined fancy palette if colors missing
    const palette = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

    const segments = data.map((d, i) => {
        const deg = (d.value / total) * 360;
        const color = d.color || palette[i % palette.length];
        const segment = `${color} ${currentDeg}deg ${currentDeg + deg}deg`;
        currentDeg += deg;
        return segment;
    }).join(', ');

    return (
        <div className="flex flex-col items-center">
            <div className={`${size} rounded-full relative p-4`} style={{ background: `conic-gradient(${segments})`, boxShadow: '0 0 40px -10px rgba(0,0,0,0.5)' }}>
                <div className="absolute inset-[3px] bg-[#0A0A0A] rounded-full flex flex-col items-center justify-center z-10">
                    <span className="text-2xl font-black text-white tracking-tighter">{total}</span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Total</span>
                </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: d.color || palette[i % palette.length], backgroundColor: 'currentColor' }}></div>
                        <span className="text-[10px] font-bold text-slate-400">{d.label}</span>
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
        <div className="relative overflow-hidden bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
            <div
                className="absolute -right-4 -top-4 w-20 h-20 blur-[50px] transition-all duration-700 opacity-20 group-hover:opacity-40"
                style={{ backgroundColor: hex }}
            ></div>

            <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-2">{label}</p>
                <div className="flex items-end gap-3">
                    <span className="text-2xl lg:text-3xl font-black text-white tracking-tighter font-sans">{value}</span>
                    {trend && (
                        <div className={`flex items-center px-1.5 py-0.5 rounded text-[10px] font-black border border-white/5 ${trend.startsWith('+') ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                            }`}>
                            {trend}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
