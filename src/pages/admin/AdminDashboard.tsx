import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart';
import { SemesterRiskChart } from '@/components/charts/SemesterRiskChart';
import { Users, AlertTriangle, TrendingDown, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System-wide analytics and student risk overview</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value="1,234"
            subtitle="Enrolled this semester"
            icon={<Users className="h-5 w-5 text-accent" />}
            trend={{ value: 12, label: "vs last semester", positive: true }}
          />
          <StatCard
            title="High Risk"
            value="89"
            subtitle="Require immediate attention"
            icon={<AlertTriangle className="h-5 w-5 text-risk-high" />}
            variant="danger"
          />
          <StatCard
            title="Dropout Rate"
            value="4.2%"
            subtitle="Current semester"
            icon={<TrendingDown className="h-5 w-5 text-warning" />}
            trend={{ value: 8, label: "improvement", positive: true }}
            variant="warning"
          />
          <StatCard
            title="Counseled"
            value="156"
            subtitle="Students this month"
            icon={<UserCheck className="h-5 w-5 text-success" />}
            variant="success"
          />
        </div>

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
      </div>
    </DashboardLayout>
  );
}