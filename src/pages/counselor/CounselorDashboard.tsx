import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskBadge } from '@/components/ui/risk-badge';
import { TrendChart } from '@/components/charts/TrendChart';
import { AlertTriangle, Calendar, Users, CheckCircle } from 'lucide-react';

const atRiskStudents = [
  { id: 1, name: 'John Smith', department: 'Computer Science', risk: 'high' as const, score: 78 },
  { id: 2, name: 'Sarah Johnson', department: 'Engineering', risk: 'high' as const, score: 72 },
  { id: 3, name: 'Mike Wilson', department: 'Business', risk: 'medium' as const, score: 55 },
];

export default function CounselorDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Counselor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor at-risk students and manage counseling sessions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="At-Risk Students" value="23" icon={<AlertTriangle className="h-5 w-5 text-risk-high" />} variant="danger" />
          <StatCard title="Today's Sessions" value="5" icon={<Calendar className="h-5 w-5 text-accent" />} />
          <StatCard title="Assigned Students" value="48" icon={<Users className="h-5 w-5 text-primary" />} />
          <StatCard title="Completed Sessions" value="127" icon={<CheckCircle className="h-5 w-5 text-success" />} variant="success" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Priority Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atRiskStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.department}</p>
                    </div>
                    <RiskBadge level={student.risk} score={student.score} showScore />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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