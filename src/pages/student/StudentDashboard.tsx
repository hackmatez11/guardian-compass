import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskBadge } from '@/components/ui/risk-badge';
import { TrendChart } from '@/components/charts/TrendChart';
import { BookOpen, Calendar, TrendingUp, MessageSquare } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your academic progress and risk status</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Current GPA" value="3.2" icon={<BookOpen className="h-5 w-5 text-accent" />} />
          <StatCard title="Attendance" value="85%" icon={<Calendar className="h-5 w-5 text-primary" />} />
          <StatCard title="Semester" value="4" icon={<TrendingUp className="h-5 w-5 text-success" />} />
          <StatCard title="Sessions" value="3" subtitle="Counseling completed" icon={<MessageSquare className="h-5 w-5 text-info" />} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Your Risk Status</CardTitle>
            <RiskBadge level="medium" score={42} showScore size="lg" />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Based on your academic performance and attendance, you're at medium risk. Consider scheduling a counseling session.</p>
            <TrendChart />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}