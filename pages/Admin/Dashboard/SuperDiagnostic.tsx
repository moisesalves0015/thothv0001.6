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
                if (!data.userId) {
                    addLog(`[ALERTA] Pedido ${d.id} sem userId vinculado!`);
                    anomalyCount++;
                }
                if (data.totalPrice === undefined) {
                    addLog(`[ALERTA] Pedido ${d.id} sem campo totalPrice!`);
                    anomalyCount++;
                }
            });

            if (anomalyCount === 0) {
                addLog('Integridade Referencial: 100% (Nenhuma anomalia na amostra)');
            } else {
                addLog(`Integridade Comprometida: ${anomalyCount} anomalias detectadas.`);
                healthScore -= (anomalyCount * 5);
            }

            // 5. Client Environment
            addLog(`Ambiente Cliente: ${clientInfo.platform} | Cores: ${clientInfo.cores}`);
            if (clientInfo.userAgent.includes('Edg')) addLog('Navegador: Edge (Chromium)');
            else if (clientInfo.userAgent.includes('Chrome')) addLog('Navegador: Chrome');
            else addLog('Navegador: Genérico');

        } catch (error: any) {
            addLog(`[ERRO CRÍTICO] Falha no teste: ${error.message}`);
            healthScore -= 50;
        }

        setStats(s => ({ ...s, dbHealth: Math.max(0, healthScore) }));
        addLog(`DIAGNÓSTICO CONCLUÍDO. Health Score: ${healthScore}/100`);
        setRunning(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Control Panel */}
            <div className="lg:col-span-1 space-y-6">
                {/* Main Status Card */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 relative overflow-hidden text-center group">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-700 ${running ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                            stats.dbHealth > 80 ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-red-500/10 text-red-500'
                            }`}>
                            <Activity size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2">{stats.dbHealth}%</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Health Score do Sistema</p>

                        <button
                            onClick={runDiagnostic}
                            disabled={running}
                            className="mt-8 px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                        >
                            {running ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                            {running ? 'Executando...' : 'Iniciar Scan Total'}
                        </button>
                    </div>
                </div>

                {/* Environment Info */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Cpu size={14} /> Ambiente do Cliente
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">OS/Plataforma</span>
                            <span className="font-mono text-white text-xs bg-white/5 px-2 py-1 rounded">{clientInfo.platform || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Resolução</span>
                            <span className="font-mono text-white text-xs bg-white/5 px-2 py-1 rounded">{clientInfo.screen || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">CPU Cores</span>
                            <span className="font-mono text-white text-xs bg-white/5 px-2 py-1 rounded">{clientInfo.cores}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Memória Device</span>
                            <span className="font-mono text-white text-xs bg-white/5 px-2 py-1 rounded">{clientInfo.memory}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics & Terminal */}
            <div className="lg:col-span-2 space-y-8">
                {/* Real Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-2xl">
                        <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Latência</span>
                        <div className="flex items-end gap-2">
                            <span className={`text-xl font-black ${stats.latency < 200 ? 'text-emerald-500' : 'text-amber-500'}`}>{stats.latency}ms</span>
                            <Wifi size={14} className="text-slate-600 mb-1" />
                        </div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-2xl">
                        <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Usuários</span>
                        <div className="flex items-end gap-2">
                            <span className="text-xl font-black text-white">{stats.totalUsers}</span>
                            <Users size={14} className="text-slate-600 mb-1" />
                        </div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-2xl">
                        <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Pedidos</span>
                        <div className="flex items-end gap-2">
                            <span className="text-xl font-black text-white">{stats.totalOrders}</span>
                            <Database size={14} className="text-slate-600 mb-1" />
                        </div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-2xl">
                        <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Est. Dados</span>
                        <div className="flex items-end gap-2">
                            <span className="text-xl font-black text-blue-500">{stats.storageEst}</span>
                            <Server size={14} className="text-slate-600 mb-1" />
                        </div>
                    </div>
                </div>

                {/* Latency Graph (If history exists) */}
                {latencyHistory.length > 2 && (
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 h-48 relative overflow-hidden">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 absolute top-6 left-6 z-10">Conectividade em Tempo Real</h3>
                        <div className="absolute inset-0 pt-12 px-2">
                            <AreaChart data={latencyHistory} color="cyan" height="h-full" />
                        </div>
                    </div>
                )}

                {/* Terminal */}
                <div className="bg-black border border-white/10 rounded-[24px] overflow-hidden flex flex-col h-[400px] shadow-2xl">
                    <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-emerald-500" />
                            <span className="text-xs font-mono font-bold text-slate-400">SYSTEM_ROOT // DIAGNOSTIC_TOOL</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-[6px]">✖</div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[6px]">−</div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[6px]">sw</div>
                        </div>
                    </div>
                    <div className="p-6 font-mono text-xs overflow-y-auto flex-1 custom-scrollbar space-y-2">
                        {logs.length === 0 && (
                            <div className="text-slate-700 italic">Aguardando inicialização do protocolo de diagnóstico...</div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3 text-slate-300 border-l-2 border-white/5 pl-3 hover:border-emerald-500/50 hover:bg-white/[0.02] transition-colors py-0.5">
                                <span className="opacity-30 select-none">{i.toString().padStart(3, '0')}</span>
                                <span>{log}</span>
                            </div>
                        ))}
                        {running && (
                            <div className="flex gap-2">
                                <span className="animate-pulse text-emerald-500">▋</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperDiagnostic;
