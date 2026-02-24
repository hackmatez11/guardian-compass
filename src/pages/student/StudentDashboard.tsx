import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskBadge } from '@/components/ui/risk-badge';
import { TrendChart } from '@/components/charts/TrendChart';
import { BookOpen, Calendar, TrendingUp, MessageSquare, Loader2, BrainCircuit, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents, useStudentAcademicData, useStudentPredictions, usePredictDropout } from '@/services/backendService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

function StatSkeleton() {
  return <Skeleton className="h-32 w-full rounded-xl" />;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState<string>('');

  // Fetch student list to find the current student by user ID
  const { data: studentsData } = useStudents(1, 100);

  useEffect(() => {
    if (studentsData?.data?.students && user) {
      const match = studentsData.data.students.find(
        (s) => s.user_id === user.id || s.email === user.email
      );
      if (match) setStudentId(match.student_id);
    }
  }, [studentsData, user]);

  const { data: academicData, isLoading: academicLoading } = useStudentAcademicData(studentId);
  const { data: predictionsData, isLoading: predictionsLoading, refetch } = useStudentPredictions(studentId);

  const { mutate: predict, isPending: predicting } = usePredictDropout();

  const student = academicData?.data?.student;
  const latestPrediction = predictionsData?.data?.predictions?.[0];
  const counselingSessions = predictionsData?.data?.predictions?.length ?? 0;

  const riskLevel = latestPrediction?.risk_level?.toLowerCase() as 'low' | 'medium' | 'high' | undefined;
  const riskScore = latestPrediction ? Math.round(latestPrediction.risk_score * 100) : null;

  const handleRunPrediction = () => {
    if (!studentId) return;
    predict(studentId, {
      onSuccess: () => {
        toast({ title: 'Prediction complete', description: 'Your risk status has been updated.' });
        refetch();
      },
      onError: (err) => {
        toast({ title: 'Prediction failed', description: err.message, variant: 'destructive' });
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {student ? `Welcome, ${student.full_name.split(' ')[0]}` : 'My Dashboard'}
            </h1>
            <p className="text-muted-foreground mt-1">Track your academic progress and risk status</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunPrediction}
            disabled={predicting || !studentId}
            className="gap-2"
          >
            {predicting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            {predicting ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {academicLoading ? <StatSkeleton /> : (
            <StatCard
              title="Current GPA"
              value={student?.gpa?.toFixed(1) ?? '—'}
              icon={<BookOpen className="h-5 w-5 text-accent" />}
            />
          )}
          {academicLoading ? <StatSkeleton /> : (
            <StatCard
              title="Attendance"
              value={student?.attendance_rate ? `${Math.round(student.attendance_rate * 100)}%` : '—'}
              icon={<Calendar className="h-5 w-5 text-primary" />}
            />
          )}
          {academicLoading ? <StatSkeleton /> : (
            <StatCard
              title="Semester"
              value={student?.semester?.toString() ?? '—'}
              icon={<TrendingUp className="h-5 w-5 text-success" />}
            />
          )}
          {predictionsLoading ? <StatSkeleton /> : (
            <StatCard
              title="AI Assessments"
              value={counselingSessions.toString()}
              subtitle="Total predictions run"
              icon={<MessageSquare className="h-5 w-5 text-info" />}
            />
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Your Risk Status</CardTitle>
            {predictionsLoading ? (
              <Skeleton className="h-8 w-28 rounded-full" />
            ) : riskLevel ? (
              <RiskBadge level={riskLevel} score={riskScore!} showScore size="lg" />
            ) : (
              <span className="text-sm text-muted-foreground">No prediction yet</span>
            )}
          </CardHeader>
          <CardContent>
            {!latestPrediction && !predictionsLoading && (
              <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                No AI risk analysis found. Click <strong>"Run AI Analysis"</strong> to generate your risk assessment.
              </div>
            )}

            {latestPrediction && (
              <div className="mb-4">
                <p className="text-muted-foreground mb-3">
                  Based on your academic performance and attendance, you're at{' '}
                  <strong>{latestPrediction.risk_level} risk</strong>. Confidence:{' '}
                  {Math.round(latestPrediction.confidence * 100)}%.
                </p>
                {latestPrediction.contributing_factors?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Top Contributing Factors:</p>
                    <div className="space-y-1">
                      {latestPrediction.contributing_factors.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                          <span className="capitalize">{f.factor.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <TrendChart />
          </CardContent>
        </Card>

        {/* Latest Prediction Details */}
        {latestPrediction && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Recent Assessment History</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictionsData?.data?.predictions?.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.model_type?.replace(/_/g, ' ') ?? 'AI Model'}</p>
                    </div>
                    <RiskBadge
                      level={p.risk_level.toLowerCase() as 'low' | 'medium' | 'high'}
                      score={Math.round(p.risk_score * 100)}
                      showScore
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}