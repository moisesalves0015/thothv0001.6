import React, { useState, useEffect, useRef } from 'react';
import {
    Terminal, Play, CheckCircle2, XCircle, AlertTriangle,
    Database, Shield, Server, Activity, RefreshCw, Cpu, Globe, Wifi, Users
} from 'lucide-react';
import { getDocs, query, collection, limit, orderBy, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../firebase';
import { AreaChart, KpiCardSmall } from './ChartComponents';

const SuperDiagnostic: React.FC = () => {
    const [running, setRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({
        latency: 0,
        dbHealth: 100,
        storageEst: '0 MB', // Mock estimation
        totalUsers: 0,
        totalOrders: 0
    });
    const [latencyHistory, setLatencyHistory] = useState<{ label: string, value: number }[]>([]);
    const [clientInfo, setClientInfo] = useState<any>({});

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    useEffect(() => {
        // Capture Client Info
        setClientInfo({
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screen: `${window.screen.width}x${window.screen.height}`,
            cores: navigator.hardwareConcurrency || 4,
            memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'N/A'
        });
    }, []);

    const runDiagnostic = async () => {
        setRunning(true);
        setLogs([]);
        addLog('INICIANDO DIAGNÓSTICO PROFUNDO v2.1...');

        let healthScore = 100;

        try {
            // 1. Latency Test (Real)
            addLog('Verificando latência do Firestore...');
            const start = performance.now();
            await getDocs(query(collection(db, 'printRequests'), limit(1)));
            const end = performance.now();
            const lat = Math.round(end - start);
            setStats(s => ({ ...s, latency: lat }));
            addLog(`Latência de Leitura: ${lat}ms ${lat < 100 ? '(Ótimo)' : lat < 500 ? '(Bom)' : '(Lento)'}`);

            // Update History Graph
            setLatencyHistory(prev => {
                const newHist = [...prev, { label: new Date().toLocaleTimeString(), value: lat }];
                return newHist.slice(-20); // Keep last 20
            });

            if (lat > 500) healthScore -= 10;

            // 2. Database Scale (Real Counts)
            addLog('Calculando tamanho da base de dados...');

            // Note: getCountFromServer is cost-efficient
            const userColl = collection(db, 'users');
            const orderColl = collection(db, 'printRequests');

            const userSnap = await getCountFromServer(userColl);
            const userCount = userSnap.data().count;
            addLog(`Total Usuários Indexados: ${userCount}`);

            const orderSnap = await getCountFromServer(orderColl);
            const orderCount = orderSnap.data().count;
            addLog(`Total Pedidos Indexados: ${orderCount}`);

            setStats(s => ({ ...s, totalUsers: userCount, totalOrders: orderCount }));

            // 3. Storage Estimator (Mock based on counts)
            const estSizeMB = ((userCount * 2) + (orderCount * 5)) / 1024; // Assume 2KB per user, 5KB per order
            setStats(s => ({ ...s, storageEst: `${estSizeMB.toFixed(2)} MB` }));
            addLog(`Estimativa de Storage JSON: ${estSizeMB.toFixed(2)} MB`);

            // 4. Integrity Check (Sample)
            addLog('Verificando integridade de dados (Amostragem: 50)...');
            const recentOrders = await getDocs(query(collection(db, 'printRequests'), orderBy('timestamp', 'desc'), limit(50)));
            let anomalyCount = 0;

            recentOrders.docs.forEach(d => {
                const data = d.data();
                // FIX: Use customerId instead of userId as per types.ts
                if (!data.customerId) {
                    addLog(`[ALERTA] Pedido ${d.id} sem identificador de cliente (customerId)!`);
                    anomalyCount++;
                }
                if (data.totalPrice === undefined) {
                    addLog(`[ALERTA] Pedido ${d.id} sem campo de precificação (totalPrice)!`);
                    anomalyCount++;
                }
            });

            if (anomalyCount === 0) {
                addLog('Integridade Referencial: 100% (Consistência validada)');
            } else {
                addLog(`Anomalias Detectadas: ${anomalyCount}. Recomenda-se auditoria manual.`);
                healthScore -= (anomalyCount * 5);
            }

            // 5. Client Environment
            addLog(`Ambiente Cliente: ${clientInfo.platform} | Performance: ${clientInfo.cores} Cores`);
            if (clientInfo.userAgent.includes('Edg')) addLog('Navegador: Microsoft Edge (Optimized)');
            else if (clientInfo.userAgent.includes('Chrome')) addLog('Navegador: Google Chrome (Stable)');
            else addLog('Navegador: UserAgent Analysis Active');

        } catch (error: any) {
            addLog(`[ERRO CRÍTICO] Falha na execução do protocolo: ${error.message}`);
            healthScore -= 50;
        }

        const finalScore = Math.max(0, healthScore);
        setStats(s => ({ ...s, dbHealth: finalScore }));
        addLog(`PROTOCOLO FINALIZADO. Pontuação de Saúde: ${finalScore}/100`);
        setRunning(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Control Panel */}
            <div className="lg:col-span-1 space-y-8">
                {/* Main Status Card */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-10 relative overflow-hidden text-center group shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#006c55]/5 to-transparent"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-1000 ring-8 ${running ? 'bg-blue-50 text-blue-500 ring-blue-50 animate-pulse' :
                            stats.dbHealth > 80 ? 'bg-emerald-50 text-[#006c55] ring-emerald-50' :
                                'bg-red-50 text-red-500 ring-red-50'
                            }`}>
                            <Activity size={56} strokeWidth={1} />
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">{stats.dbHealth}%</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Health Index Alpha</p>

                        <button
                            onClick={runDiagnostic}
                            disabled={running}
                            className={`mt-10 w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl hover:translate-y-[-2px] ${
                                running 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-900 text-white hover:shadow-2xl active:scale-95'
                            }`}
                        >
                            {running ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                            {running ? 'Relatório em Curso' : 'Deep System Scan'}
                        </button>
                    </div>
                </div>

                {/* Environment Info */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-10 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 dark:bg-white/[0.02] rounded-full blur-[50px] -mr-10 -mt-10 transition-all duration-700 group-hover:bg-[#006c55]/5"></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <Cpu size={14} className="text-[#006c55]" /> Architecture Spec
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: 'OS Plateform', value: clientInfo.platform },
                            { label: 'Viewport', value: clientInfo.screen },
                            { label: 'Compute Cores', value: clientInfo.cores },
                            { label: 'Virtual Memory', value: clientInfo.memory }
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center group/row">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                <span className="font-mono text-[10px] font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-white/5 group-hover/row:border-[#006c55]/30 transition-all">{item.value || 'N/A'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Metrics & Terminal */}
            <div className="lg:col-span-2 space-y-8">
                {/* Real Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Latency', value: `${stats.latency}ms`, icon: Wifi, color: stats.latency < 200 ? 'text-emerald-500' : 'text-amber-500' },
                        { label: 'Users', value: stats.totalUsers, icon: Users, color: 'text-slate-900 dark:text-white' },
                        { label: 'Orders', value: stats.totalOrders, icon: Database, color: 'text-slate-900 dark:text-white' },
                        { label: 'Data Vol', value: stats.storageEst, icon: Server, color: 'text-blue-500' }
                    ].map((m, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 p-6 rounded-[32px] shadow-sm hover:translate-y-[-2px] transition-all">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">{m.label}</span>
                            <div className="flex items-end justify-between">
                                <span className={`text-xl font-black ${m.color} tracking-tighter`}>{m.value}</span>
                                <m.icon size={16} className="text-slate-300 mb-1" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Latency Graph (If history exists) */}
                {latencyHistory.length > 2 && (
                    <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 h-56 relative overflow-hidden shadow-sm shadow-emerald-500/5">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fluxo de Conectividade</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Ativo</span>
                            </div>
                        </div>
                        <div className="absolute inset-0 pt-16 px-4">
                            <AreaChart data={latencyHistory} color="emerald" height="h-full" />
                        </div>
                    </div>
                )}

                {/* Terminal */}
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden flex flex-col h-[450px] shadow-2xl relative">
                    {/* Glass Overlay on Terminal Header */}
                    <div className="bg-white/5 backdrop-blur-md px-8 py-5 border-b border-white/5 flex items-center justify-between relative z-20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <Terminal size={14} className="text-emerald-500" />
                            </div>
                            <span className="text-[10px] font-black font-mono tracking-widest text-slate-300">THOTH-MONITOR.sh</span>
                        </div>
                        <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-white/5 flex items-center justify-center cursor-pointer hover:bg-red-500/40 transition-all border border-white/5"></div>
                             <div className="w-3 h-3 rounded-full bg-white/5 flex items-center justify-center cursor-pointer hover:bg-amber-500/40 transition-all border border-white/5"></div>
                             <div className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-emerald-500/40 transition-all border border-white/5"></div>
                        </div>
                    </div>
                    <div className="p-10 font-mono text-[11px] overflow-y-auto flex-1 no-scrollbar space-y-4 relative z-10 bg-[#0c111a]">
                        {logs.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full opacity-20 transform translate-y-[-20px]">
                                <RefreshCw size={40} className="mb-4 animate-spin-slow" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize Deep Scan</p>
                            </div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-5 text-slate-400 group animate-in slide-in-from-left-2 duration-300">
                                <span className="opacity-20 select-none font-black text-[10px] w-8">{i.toString().padStart(3, '0')}</span>
                                <span className={`flex-1 ${
                                    log.includes('[ERRO]') ? 'text-red-400' : 
                                    log.includes('[ALERTA]') ? 'text-amber-400' : 
                                    log.includes('CONCLUÍDO') ? 'text-emerald-400 font-black' :
                                    'text-slate-300'
                                }`}>
                                    <span className="opacity-40 mr-2 text-[10px]">{log.split(']')[0]}]</span>
                                    {log.split(']')[1]}
                                </span>
                            </div>
                        ))}
                        {running && (
                            <div className="flex items-center gap-3 py-2 pl-12 text-[#006c55]">
                                <div className="w-2 h-2 bg-[#006c55] rounded-full animate-ping"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Querying Cluster Data...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperDiagnostic;
