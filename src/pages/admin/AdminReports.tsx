import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePredictionStats, useStudents, useHighRiskStudents } from '@/services/backendService';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, AlertTriangle, Users, Activity, TrendingDown } from 'lucide-react';
import { RiskBadge } from '@/components/ui/risk-badge';

export default function AdminReports() {
    const { data: stats, isLoading: statsLoading } = usePredictionStats();
    const { data: studentsData } = useStudents(1, 1);
    const { data: highRiskData, isLoading: highRiskLoading } = useHighRiskStudents();

    const highRiskStudents = highRiskData?.data ?? [];

    const handleExport = () => {
        const rows = [
            ['Student Name', 'Student ID', 'Department', 'Risk Level', 'Risk Score'],
            ...highRiskStudents.map(s => [
                s.full_name,
                s.student_id,
                s.department,
                s.latest_prediction?.risk_level ?? 'N/A',
                s.latest_prediction ? (s.latest_prediction.risk_score * 100).toFixed(1) + '%' : 'N/A',
            ]),
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `high-risk-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Reports</h1>
                        <p className="text-muted-foreground mt-1">Exportable summary reports for the institution</p>
                    </div>
                    <Button onClick={handleExport} className="gap-2" variant="outline">
                        <Download className="h-4 w-4" />
                        Export High Risk CSV
                    </Button>
                </div>

                {/* Summary Stats */}
                {statsLoading ? (
                    <div className="grid gap-4 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-4">
                        {[
                            { label: 'Total Students', value: (studentsData?.data?.total ?? 0).toLocaleString(), icon: <Users className="h-5 w-5 text-accent" />, color: 'text-accent' },
                            { label: 'High Risk', value: (stats?.data?.high_risk_count ?? 0).toString(), icon: <AlertTriangle className="h-5 w-5 text-destructive" />, color: 'text-destructive' },
                            { label: 'Medium Risk', value: (stats?.data?.medium_risk_count ?? 0).toString(), icon: <Activity className="h-5 w-5 text-warning" />, color: 'text-warning' },
                            { label: 'Avg Risk Score', value: `${((stats?.data?.average_risk_score ?? 0) * 100).toFixed(1)}%`, icon: <TrendingDown className="h-5 w-5 text-muted-foreground" />, color: 'text-muted-foreground' },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border">
                                <div className="p-2 bg-background rounded-lg">{stat.icon}</div>
                                <div>
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* High Risk Detail Report */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-display flex items-center gap-2">
                            <FileText className="h-5 w-5 text-risk-high" />
                            High Risk Student Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {highRiskLoading ? (
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                            </div>
                        ) : highRiskStudents.length === 0 ? (
                            <p className="text-center py-8 text-sm text-muted-foreground">
                                No high-risk students or backend is offline.
                            </p>
                        ) : (
                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Semester</th>
                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk</th>
                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {highRiskStudents.map((s) => (
                                            <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{s.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">{s.student_id}</p>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{s.department}</td>
                                                <td className="px-4 py-3 text-muted-foreground">Sem {s.semester}</td>
                                                <td className="px-4 py-3">
                                                    {s.latest_prediction && (
                                                        <RiskBadge
                                                            level={s.latest_prediction.risk_level.toLowerCase() as 'low' | 'medium' | 'high'}
                                                            score={Math.round(s.latest_prediction.risk_score * 100)}
                                                            showScore
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-sm">
                                                    {s.latest_prediction ? `${(s.latest_prediction.confidence * 100).toFixed(0)}%` : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
