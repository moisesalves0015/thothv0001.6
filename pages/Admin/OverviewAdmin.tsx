import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Wallet,
    Users,
    Printer,
    Activity,
    Filter,
    Calendar,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';

// Sub-Dashboards
import GeneralOverview from './Dashboard/GeneralOverview';
import FinancialAnalytics from './Dashboard/FinancialAnalytics';
import UserAnalytics from './Dashboard/UserAnalytics';
import ServiceAnalytics from './Dashboard/ServiceAnalytics';
import SuperDiagnostic from './Dashboard/SuperDiagnostic';

// Types
type TimeRange = '24h' | '7d' | '30d' | 'all';
type Tab = 'overview' | 'finance' | 'users' | 'services' | 'diagnostic';

const OverviewAdmin: React.FC = () => {
    // --- Data Layer ---
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [stations, setStations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- State ---
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [selectedStation, setSelectedStation] = useState<string>('all');

    useEffect(() => {
        const qOrders = query(collection(db, 'printRequests'), orderBy('timestamp', 'desc'), limit(3000));
        const unsubOrders = onSnapshot(qOrders, (snap) => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(2000));
        const unsubUsers = onSnapshot(qUsers, (snap) => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

        const qStations = query(collection(db, 'printerStations'));
        const unsubStations = onSnapshot(qStations, (snap) => {
            setStations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        return () => { unsubOrders(); unsubUsers(); unsubStations(); };
    }, []);

    // Tab Configuration
    const tabs = [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'finance', label: 'Financeiro', icon: <Wallet size={18} /> },
        { id: 'users', label: 'Analytics Usuários', icon: <Users size={18} /> },
        { id: 'services', label: 'Fluxo Operacional', icon: <Printer size={18} /> },
        { id: 'diagnostic', label: 'Hardware Bio', icon: <Activity size={18} /> }
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-400 animate-in fade-in duration-1000">
            <Loader2 className="animate-spin mb-4 text-[#006c55]" size={40} strokeWidth={2.5} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Business Intelligence Engine</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Thoth Intelligence v2.5</p>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </h1>
                    <p className="text-sm font-bold text-slate-500 max-w-lg leading-relaxed">
                        Análise profunda de dados e métricas de desempenho em tempo real através de toda a rede Thoth.
                    </p>
                </div>

                {/* Global Filters */}
                {activeTab !== 'diagnostic' && (
                    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800/40 p-2 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-1">
                            {(['24h', '7d', '30d', 'all'] as TimeRange[]).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTimeRange(t)}
                                    className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === t ? 'bg-slate-900 text-white shadow-xl translate-y-[-1px]' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-6 bg-slate-100 dark:bg-white/10 mx-2 hidden sm:block"></div>

                        <div className="relative group">
                            <select
                                value={selectedStation}
                                onChange={(e) => setSelectedStation(e.target.value)}
                                className="h-10 px-6 pr-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none hover:border-[#006c55] hover:text-[#006c55] transition-all cursor-pointer appearance-none min-w-[180px]"
                            >
                                <option value="all">Rede Global</option>
                                {stations.map(s => <option key={s.id} value={s.stationId}>{s.name}</option>)}
                            </select>
                            <Filter size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#006c55] transition-colors" />
                        </div>
                    </div>
                )}
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`group flex items-center gap-3 px-6 py-4 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-800 border-slate-900 dark:border-white text-slate-900 dark:text-white shadow-xl translate-y-[-2px]'
                                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <span className={`transition-transform duration-500 group-hover:scale-125 ${activeTab === tab.id ? 'text-[#006c55]' : ''}`}>
                            {tab.icon}
                        </span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <GeneralOverview
                        orders={orders} users={users} stations={stations}
                        timeRange={timeRange} selectedStation={selectedStation}
                    />
                )}
                {activeTab === 'finance' && (
                    <FinancialAnalytics
                        orders={orders} stations={stations} timeRange={timeRange}
                    />
                )}
                {activeTab === 'users' && (
                    <UserAnalytics users={users} timeRange={timeRange} />
                )}
                {activeTab === 'services' && (
                    <ServiceAnalytics orders={orders} />
                )}
                {activeTab === 'diagnostic' && (
                    <SuperDiagnostic />
                )}
            </div>
        </div>
    );
};

// Icons Helpers
const ClockIcon = () => <Calendar size={14} className="text-slate-500 mr-2" />;
const MapPinIcon = () => <Filter size={14} className="text-slate-500 pointer-events-none" />;

export default OverviewAdmin;
