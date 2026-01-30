import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Wallet,
    Users,
    Printer,
    Activity,
    Filter,
    Calendar,
    RefreshCw
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
        { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={18} /> },
        { id: 'finance', label: 'Financeiro', icon: <Wallet size={18} /> },
        { id: 'users', label: 'Usuários', icon: <Users size={18} /> },
        { id: 'services', label: 'Serviços', icon: <Printer size={18} /> },
        { id: 'diagnostic', label: 'Diagnóstico', icon: <Activity size={18} /> }
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-500 animate-pulse">
            <RefreshCw className="animate-spin mb-4" size={32} />
            <p className="text-xs font-black uppercase tracking-widest">Carregando Business Intelligence...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
                        <span className="p-3 bg-white text-black rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            {tabs.find(t => t.id === activeTab)?.icon}
                        </span>
                        {tabs.find(t => t.id === activeTab)?.label}
                    </h1>
                    <p className="text-base text-slate-500 font-bold mt-4 ml-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Admin Console v2.1
                    </p>
                </div>

                {/* Global Filters */}
                {activeTab !== 'diagnostic' && (
                    <div className="flex flex-wrap items-center gap-4 bg-[#0A0A0A] p-1.5 rounded-2xl border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-1 px-2">
                            {(['24h', '7d', '30d', 'all'] as TimeRange[]).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTimeRange(t)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === t ? 'bg-white text-black shadow-lg transform scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-8 bg-white/5"></div>

                        <div className="flex items-center px-4 py-2 relative group">
                            <MapPinIcon />
                            <select
                                value={selectedStation}
                                onChange={(e) => setSelectedStation(e.target.value)}
                                className="bg-transparent text-xs font-bold text-white uppercase outline-none ml-3 w-40 cursor-pointer appearance-none group-hover:text-emerald-400 transition-colors"
                            >
                                <option value="all">Rede Global</option>
                                {stations.map(s => <option key={s.id} value={s.stationId}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-black shadow-xl shadow-white/10 scale-105'
                                : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {tab.icon}
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
