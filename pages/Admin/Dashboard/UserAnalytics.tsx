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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCardSmall label="Total Usuários" value={metrics.total.toString()} trend="+5.2%" />
                <KpiCardSmall label="Novos (Período)" value={users.length.toString()} trend="+12%" color="blue" />
                <KpiCardSmall label="Professores" value={metrics.roleData.find(r => r.label === 'Professores')?.value.toString() || '0'} color="indigo" />
                <KpiCardSmall label="Retenção" value="88%" trend="+1.2%" color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TOP COURSES - Requested */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <BookOpen size={16} className="text-emerald-500" />
                        Top Cursos
                    </h3>
                    <HorizontalBarChart data={metrics.topCourses} color="bg-emerald-500" />
                </div>

                {/* TOP UNIVERSITIES */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <GraduationCap size={16} className="text-amber-500" />
                        Top Universidades
                    </h3>
                    <HorizontalBarChart data={metrics.topUnis} color="bg-amber-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ROLE DISTRIBUTION */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 w-full">
                        <Briefcase size={16} className="text-blue-500" />
                        Perfil Demográfico
                    </h3>
                    <DonutChart data={metrics.roleData} />
                </div>

                {/* ENGAGEMENT MOCK */}
                <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <UserCheck size={16} className="text-purple-500" />
                        Atividade por Horário (Heatmap Mock)
                    </h3>
                    <div className="grid grid-cols-12 gap-1 h-32">
                        {Array.from({ length: 24 * 3 }).map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-sm ${Math.random() > 0.7 ? 'bg-purple-500' :
                                        Math.random() > 0.4 ? 'bg-purple-500/40' :
                                            'bg-white/5'
                                    }`}
                                title="Atividade"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAnalytics;
