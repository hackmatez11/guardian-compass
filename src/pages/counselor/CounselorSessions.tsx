import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, RefreshCw, CheckCircle, Clock } from 'lucide-react';

interface Recommendation {
    id: string;
    student_id: string;
    counselor_id: string;
    recommendation_type: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
}

function useRecommendations() {
    return useQuery({
        queryKey: ['counseling-recommendations'],
        queryFn: () => api.get<{ success: boolean; data: Recommendation[] }>('/counseling/followups'),
        retry: 1,
    });
}

const priorityColors: Record<string, string> = {
    high: 'text-destructive border-destructive/40 bg-destructive/5',
    medium: 'text-warning border-warning/40 bg-warning/5',
    low: 'text-success border-success/40 bg-success/5',
};

const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    in_progress: <Clock className="h-4 w-4 text-blue-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export default function CounselorRecommendations() {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useRecommendations();

    const recommendations: Recommendation[] = Array.isArray(data?.data) ? data.data : [];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Recommendations</h1>
                        <p className="text-muted-foreground mt-1">Track and manage follow-up recommendations for students</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['counseling-recommendations'] })} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> New Recommendation
                        </Button>
                    </div>
                </div>

                {isError && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">⚠️ Backend offline — start Flask to see live recommendations.</p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="font-display flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-accent" />
                            Pending Follow-ups ({recommendations.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                            </div>
                        ) : recommendations.length === 0 ? (
                            <div className="text-center py-12">
                                <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No pending recommendations. All caught up!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recommendations.map((rec) => (
                                    <div key={rec.id} className={`p-4 rounded-lg border ${priorityColors[rec.priority] ?? 'border-border bg-muted/30'}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                {statusIcon[rec.status] ?? <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />}
                                                <div>
                                                    <p className="font-medium text-sm">Student: <span className="font-mono">{rec.student_id}</span></p>
                                                    <p className="text-sm text-muted-foreground mt-0.5 capitalize">{rec.recommendation_type?.replace(/_/g, ' ')}</p>
                                                    {rec.description && <p className="text-sm mt-1 text-foreground/80">{rec.description}</p>}
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(rec.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-background border capitalize">
                                                    {rec.priority} priority
                                                </span>
                                                <span className="text-xs text-muted-foreground capitalize">
                                                    {rec.status.replace('_', ' ')}
                                                </span>
                                            </div>
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
