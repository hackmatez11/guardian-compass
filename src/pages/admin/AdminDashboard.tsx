import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart';
import { SemesterRiskChart } from '@/components/charts/SemesterRiskChart';
import { Users, AlertTriangle, TrendingDown, UserCheck, RefreshCw } from 'lucide-react';
import { usePredictionStats, useStudents, useHighRiskStudents } from '@/services/backendService';
import { RiskBadge } from '@/components/ui/risk-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

function StatSkeleton() {
  return <Skeleton className="h-32 w-full rounded-xl" />;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading, isError: statsError } = usePredictionStats();
  const { data: studentsData, isLoading: studentsLoading } = useStudents(1, 5);
  const { data: highRiskData, isLoading: highRiskLoading } = useHighRiskStudents();

  const totalStudents = studentsData?.data?.total ?? 0;
  const highRiskCount = stats?.data?.high_risk_count ?? 0;
  const avgRiskScore = stats?.data?.average_risk_score ?? 0;
  const dropoutRate = (avgRiskScore * 100).toFixed(1);

  const highRiskStudents = highRiskData?.data?.slice(0, 5) ?? [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['prediction-stats'] });
    queryClient.invalidateQueries({ queryKey: ['students'] });
    queryClient.invalidateQueries({ queryKey: ['high-risk-students'] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">System-wide analytics and student risk overview</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {!statsError ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {studentsLoading ? <StatSkeleton /> : (
              <StatCard
                title="Total Students"
                value={totalStudents.toLocaleString()}
                subtitle="Enrolled this semester"
                icon={<Users className="h-5 w-5 text-accent" />}
              />
            )}
            {statsLoading ? <StatSkeleton /> : (
              <StatCard
                title="High Risk"
                value={highRiskCount.toString()}
                subtitle="Require immediate attention"
                icon={<AlertTriangle className="h-5 w-5 text-risk-high" />}
                variant="danger"
              />
            )}
            {statsLoading ? <StatSkeleton /> : (
              <StatCard
                title="Avg Risk Score"
                value={`${dropoutRate}%`}
                subtitle="Current semester"
                icon={<TrendingDown className="h-5 w-5 text-warning" />}
                variant="warning"
              />
            )}
            {statsLoading ? <StatSkeleton /> : (
              <StatCard
                title="Total Predictions"
                value={(stats?.data?.total_predictions ?? 0).toString()}
                subtitle="AI assessments run"
                icon={<UserCheck className="h-5 w-5 text-success" />}
                variant="success"
              />
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ Backend offline — displaying static chart data. Start the Flask server to see live analytics.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskDistributionChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Semester-wise Risk Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <SemesterRiskChart />
            </CardContent>
          </Card>
        </div>

        {/* High Risk Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">High Risk Students</CardTitle>
          </CardHeader>
          <CardContent>
            {highRiskLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : highRiskStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No high-risk students found, or backend is offline.
              </p>
            ) : (
              <div className="space-y-3">
                {highRiskStudents.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div>
                      <p className="font-medium text-foreground">{s.full_name}</p>
                      <p className="text-sm text-muted-foreground">{s.department} · Semester {s.semester}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {s.latest_prediction && (
                        <RiskBadge
                          level={s.latest_prediction.risk_level.toLowerCase() as 'low' | 'medium' | 'high'}
                          score={Math.round(s.latest_prediction.risk_score * 100)}
                          showScore
                        />
                      )}
                      <Badge variant="outline" className="text-xs">{s.student_id}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}