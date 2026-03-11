import React, { useMemo } from 'react';
import { BarChart, HorizontalBarChart, DonutChart, KpiCardSmall, ChartDataPoint } from './ChartComponents';
import { Users, GraduationCap, BookOpen, Briefcase, UserCheck } from 'lucide-react';

interface UserAnalyticsProps {
    users: any[];
    timeRange: string;
}

const UserAnalytics: React.FC<UserAnalyticsProps> = ({ users, timeRange }) => {

    const metrics = useMemo(() => {
        // Analytics Logic
        const total = users.length;
        const students = users.filter(u => !u.role || u.role === 'Estudante').length;
        const professors = users.filter(u => u.role === 'Professor').length;
        const admins = users.filter(u => u.role === 'Admin').length;

        // Universities
        const uniCounts: Record<string, number> = {};
        // Courses
        const courseCounts: Record<string, number> = {};

        users.forEach(u => {
            const uni = u.university || 'Não informado';
            uniCounts[uni] = (uniCounts[uni] || 0) + 1;

            const course = u.course || 'Não informado';
            courseCounts[course] = (courseCounts[course] || 0) + 1;
        });

        const topUnis = Object.entries(uniCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([label, value]) => ({ label, value }));

        const topCourses = Object.entries(courseCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([label, value]) => ({ label, value }));

        // Role Data
        const roleData: ChartDataPoint[] = [
            { label: 'Estudantes', value: students, color: '#10b981' }, // Emerald
            { label: 'Professores', value: professors, color: '#3b82f6' }, // Blue
            { label: 'Admins', value: admins, color: '#ef4444' } // Red
        ];

        // Growth (Buckets similar to Overview)
        // Reusing logic via simple mapping for now
        const growthData = new Array(7).fill(0).map((_, i) => ({
            label: `Day ${i + 1}`,
            value: 0
        }));
        // (Simplified growth chart for demo, assuming pre-filtered users passed in would affect this)

        return { total, topUnis, topCourses, roleData };
    }, [users]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KpiCardSmall label="Base de Usuários" value={metrics.total.toString()} trend="+5.2%" />
                <KpiCardSmall label="Aquisições (30d)" value={users.length.toString()} trend="+12%" color="blue" />
                <KpiCardSmall label="Corpo Docente" value={metrics.roleData.find(r => r.label === 'Professores')?.value.toString() || '0'} color="indigo" />
                <KpiCardSmall label="Engajamento" value="88%" trend="+1.2%" color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* TOP COURSES - Requested */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10">
                        <BookOpen size={14} className="text-[#006c55]" />
                        Top Hubs Acadêmicos (Cursos)
                    </h3>
                    <HorizontalBarChart data={metrics.topCourses} color="emerald" />
                </div>

                {/* TOP UNIVERSITIES */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10">
                        <GraduationCap size={14} className="text-amber-500" />
                        Distribuição por Instituição
                    </h3>
                    <HorizontalBarChart data={metrics.topUnis} color="amber" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* ROLE DISTRIBUTION */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 flex flex-col items-center shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10 w-full text-center">
                        <Briefcase size={14} className="text-blue-500" />
                        Perfil de Permissões
                    </h3>
                    <DonutChart data={metrics.roleData} />
                </div>

                {/* ENGAGEMENT MOCK */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-[40px] p-8 md:p-10 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-10">
                        <UserCheck size={14} className="text-purple-500" />
                        Densidade de Interação (Beta)
                    </h3>
                    <div className="grid grid-cols-12 gap-1.5 h-32">
                        {Array.from({ length: 24 * 3 }).map((_, i) => {
                            const rand = Math.random();
                            return (
                                <div
                                    key={i}
                                    className={`rounded-[2px] transition-all duration-700 hover:scale-125 hover:z-20 ${
                                        rand > 0.8 ? 'bg-[#006c55] shadow-[0_0_10px_rgba(0,108,85,0.4)]' :
                                        rand > 0.5 ? 'bg-emerald-500/20' :
                                        'bg-slate-100 dark:bg-white/5'
                                    }`}
                                    title="Atividade registrada"
                                ></div>
                            );
                        })}
                    </div>
                    <div className="mt-8 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Low Activity</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-sm bg-slate-100 dark:bg-white/5"></div>
                            <div className="w-2 h-2 rounded-sm bg-emerald-500/20"></div>
                            <div className="w-2 h-2 rounded-sm bg-[#006c55]"></div>
                        </div>
                        <span>Peak Activity</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAnalytics;
