import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskBadge } from '@/components/ui/risk-badge';
import { TrendChart } from '@/components/charts/TrendChart';
import { AlertTriangle, Calendar, Users, CheckCircle, BrainCircuit, Loader2, RefreshCw } from 'lucide-react';
import { useHighRiskStudents, usePredictionStats, usePredictDropout } from '@/services/backendService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

function StatSkeleton() {
  return <Skeleton className="h-32 w-full rounded-xl" />;
}

export default function CounselorDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: statsData, isLoading: statsLoading, isError: statsError } = usePredictionStats();
  const { data: highRiskData, isLoading: highRiskLoading, refetch } = useHighRiskStudents();

  const { mutate: predict, isPending: predicting, variables: predictingId } = usePredictDropout();

  const highRiskStudents = highRiskData?.data ?? [];
  const highRiskCount = statsData?.data?.high_risk_count ?? highRiskStudents.length;

  const handlePredictStudent = (studentId: string) => {
    predict(studentId, {
      onSuccess: () => {
        toast({ title: 'Prediction updated', description: `Risk assessment for student ${studentId} has been refreshed.` });
        refetch();
        queryClient.invalidateQueries({ queryKey: ['prediction-stats'] });
      },
      onError: (err) => {
        toast({ title: 'Prediction failed', description: err.message, variant: 'destructive' });
      },
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['prediction-stats'] });
    queryClient.invalidateQueries({ queryKey: ['high-risk-students'] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Counselor Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor at-risk students and manage counseling sessions</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {statsError && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ Backend offline — displaying local data. Start the Flask server on port 5000 for live data.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? <StatSkeleton /> : (
            <StatCard
              title="High Risk Students"
              value={highRiskCount.toString()}
              icon={<AlertTriangle className="h-5 w-5 text-risk-high" />}
              variant="danger"
            />
          )}
          {statsLoading ? <StatSkeleton /> : (
            <StatCard
              title="Medium Risk"
              value={(statsData?.data?.medium_risk_count ?? 0).toString()}
              icon={<Calendar className="h-5 w-5 text-accent" />}
              variant="warning"
            />
          )}
          {statsLoading ? <StatSkeleton /> : (
            <StatCard
              title="Low Risk"
              value={(statsData?.data?.low_risk_count ?? 0).toString()}
              icon={<Users className="h-5 w-5 text-primary" />}
              variant="success"
            />
          )}
          {statsLoading ? <StatSkeleton /> : (
            <StatCard
              title="Total Assessments"
              value={(statsData?.data?.total_predictions ?? 0).toString()}
              subtitle="AI predictions run"
              icon={<CheckCircle className="h-5 w-5 text-success" />}
              variant="success"
            />
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Priority Students - Live */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Priority Students</CardTitle>
            </CardHeader>
            <CardContent>
              {highRiskLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              ) : highRiskStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No high-risk students found, or backend is offline.
                </p>
              ) : (
                <div className="space-y-3">
                  {highRiskStudents.slice(0, 6).map((student) => {
                    const isCurrentlyPredicting = predicting && predictingId === student.student_id;
                    return (
                      <div key={student.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div>
                          <p className="font-medium text-foreground">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">{student.department}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {student.latest_prediction && (
                            <RiskBadge
                              level={student.latest_prediction.risk_level.toLowerCase() as 'low' | 'medium' | 'high'}
                              score={Math.round(student.latest_prediction.risk_score * 100)}
                              showScore
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Re-run AI analysis"
                            disabled={predicting}
                            onClick={() => handlePredictStudent(student.student_id)}
                          >
                            {isCurrentlyPredicting
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <BrainCircuit className="h-3.5 w-3.5" />
                            }
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Student Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}