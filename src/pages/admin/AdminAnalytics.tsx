import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart';
import { SemesterRiskChart } from '@/components/charts/SemesterRiskChart';
import { TrendChart } from '@/components/charts/TrendChart';
import { Skeleton } from '@/components/ui/skeleton';
import { usePredictionStats, useStudents } from '@/services/backendService';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function AdminAnalytics() {
    const { data: stats, isLoading: statsLoading } = usePredictionStats();
    const { data: studentsData, isLoading: studentsLoading } = useStudents(1, 1);

    const totalStudents = studentsData?.data?.total ?? 0;
    const avgRisk = stats?.data?.average_risk_score ?? 0;
    const highRisk = stats?.data?.high_risk_count ?? 0;
    const lowRisk = stats?.data?.low_risk_count ?? 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Analytics</h1>
                    <p className="text-muted-foreground mt-1">System-wide dropout prediction analytics and trends</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {statsLoading || studentsLoading ? (
                        [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
                    ) : (
                        <>
                            <StatCard
                                title="Total Students"
                                value={totalStudents.toLocaleString()}
                                subtitle="Enrolled"
                                icon={<BarChart3 className="h-5 w-5 text-accent" />}
                            />
                            <StatCard
                                title="High Risk"
                                value={highRisk.toString()}
                                subtitle="Require attention"
                                icon={<TrendingDown className="h-5 w-5 text-risk-high" />}
                                variant="danger"
                            />
                            <StatCard
                                title="Low Risk"
                                value={lowRisk.toString()}
                                subtitle="On track"
                                icon={<TrendingUp className="h-5 w-5 text-success" />}
                                variant="success"
                            />
                            <StatCard
                                title="Avg Risk Score"
                                value={`${(avgRisk * 100).toFixed(1)}%`}
                                subtitle="Across all students"
                                icon={<Activity className="h-5 w-5 text-warning" />}
                                variant="warning"
                            />
                        </>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="font-display">Risk Distribution</CardTitle></CardHeader>
                        <CardContent><RiskDistributionChart /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="font-display">Semester Risk Trends</CardTitle></CardHeader>
                        <CardContent><SemesterRiskChart /></CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle className="font-display">Performance Over Time</CardTitle></CardHeader>
                    <CardContent><TrendChart /></CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
